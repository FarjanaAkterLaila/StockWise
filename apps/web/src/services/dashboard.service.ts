import { supabase } from "@/lib/supabase";
import {
  isEligibleSaleStatus,
  isEligiblePurchaseStatus,
} from "@/services/accounts.service";
import { toLocalDateKey, getRecentMonthBuckets } from "@/utils/accounts.utils";
import type {
  RecentSale,
  LowStockProduct,
  PaymentStatus,
  SalesPurchaseComparison,
  RevenueTrendPoint,
  InventoryStatusBreakdown,
} from "@/types";
import type { SaleRow, ProductRow } from "@/types/database.types";

interface SaleRowWithCustomer extends SaleRow {
  customers: { name: string } | null;
}

interface ProductRowWithCategory extends ProductRow {
  categories: { name: string } | null;
}

export interface DashboardStatsResult {
  metrics: {
    totalRevenue: number;
    totalCashReceived: number;
    totalSalesCount: number;
    totalPurchaseCost: number;
    totalSupplierPaid: number;
    lowStockCount: number;
  };
  recentSales: RecentSale[];
  lowStockAlerts: LowStockProduct[];
  salesPurchaseComparison: SalesPurchaseComparison[];
  revenueTrend: Record<"7d" | "30d" | "6m", RevenueTrendPoint[]>;
  inventoryStatusBreakdown: InventoryStatusBreakdown[];
}

export const fetchDashboardStats = async (): Promise<DashboardStatsResult> => {
  // 1. Sales (exclude draft, cancelled, refunded; handle NULL and case variations)
  const { data: salesData, error: salesErr } = await supabase
    .from("sales")
    .select(
      "id, invoice_number, total_amount, sale_date, created_at, customer_id, status, customers:customer_id (name)",
    )
    .order("created_at", { ascending: false });

  if (salesErr) throw new Error(salesErr.message);

  const rawSales = (salesData || []) as unknown as SaleRowWithCustomer[];
  const sales = rawSales.filter((s) => isEligibleSaleStatus(s.status));

  const paidBySale = new Map<string, number>();
  if (sales.length > 0) {
    const { data: paymentRows, error: paymentError } = await supabase
      .from("payments")
      .select("id, sale_id, amount")
      .in("sale_id", sales.map((sale) => sale.id))
      .is("purchase_id", null)
      .eq("payment_type", "received");
    if (paymentError) throw new Error(paymentError.message);
    const seenSalePayIds = new Set<string>();
    for (const payment of paymentRows || []) {
      if (!payment.id || seenSalePayIds.has(payment.id)) continue;
      seenSalePayIds.add(payment.id);
      if (payment.sale_id) {
        paidBySale.set(
          payment.sale_id,
          (paidBySale.get(payment.sale_id) || 0) + Number(payment.amount || 0),
        );
      }
    }
  }

  const totalRevenue = sales.reduce(
    (sum, s) => sum + (Number(s.total_amount) || 0),
    0,
  );
  const totalCashReceived = Array.from(paidBySale.values()).reduce(
    (sum, val) => sum + val,
    0,
  );
  const totalSalesCount = sales.length;

  // 2. Products / Inventory
  const { data: productsData, error: prodErr } = await supabase
    .from("products")
    .select("*, categories:category_id (name)");

  if (prodErr) {
    console.warn("Products fetch warning in dashboard:", prodErr.message);
  }

  const allProducts = (productsData ||
    []) as unknown as ProductRowWithCategory[];
  const lowStockProducts = allProducts.filter(
    (p) => Number(p.quantity) <= (Number(p.min_stock_level) || 5),
  );

  // 3. Purchases (exclude cancelled; handle NULL and case variations)
  const { data: purchasesData, error: purErr } = await supabase
    .from("purchases")
    .select("id, total_amount, status, purchase_date, created_at");

  if (purErr) throw new Error(purErr.message);

  const purchases = (purchasesData || []).filter((p) =>
    isEligiblePurchaseStatus(p.status),
  );
  const eligiblePurchaseIds = new Set(purchases.map((p) => p.id));

  let totalSupplierPaid = 0;
  if (purchases.length > 0) {
    const { data: purchasePayRows, error: purchasePayErr } = await supabase
      .from("payments")
      .select("id, purchase_id, amount")
      .eq("payment_type", "paid")
      .is("sale_id", null)
      .not("purchase_id", "is", null);
    if (purchasePayErr) throw new Error(purchasePayErr.message);
    const seenPurPayIds = new Set<string>();
    for (const payment of purchasePayRows || []) {
      if (!payment.id || seenPurPayIds.has(payment.id)) continue;
      seenPurPayIds.add(payment.id);
      if (payment.purchase_id && eligiblePurchaseIds.has(payment.purchase_id)) {
        totalSupplierPaid += Number(payment.amount) || 0;
      }
    }
  }

  const totalPurchaseCost = purchases.reduce(
    (sum, p) => sum + (Number(p.total_amount) || 0),
    0,
  );

  // 4. Recent Sales
  const recentSales: RecentSale[] = sales.slice(0, 5).map((s) => {
    const d = new Date(s.sale_date || s.created_at);
    const paidAmount = paidBySale.get(s.id) || 0;
    const totalAmount = Number(s.total_amount) || 0;
    return {
      id: s.id,
      invoiceNumber: s.invoice_number,
      customerName: s.customers?.name || "Walk-in Customer",
      customerType: s.customer_id ? "Retail" : "Walk-in",
      itemsSummary: "Hardware Items",
      itemCount: 1,
      totalAmount,
      paidAmount,
      paymentStatus: (
        paidAmount <= 0
          ? "unpaid"
          : paidAmount >= totalAmount
            ? "paid"
            : "partial"
      ) as PaymentStatus,
      paymentMethod: "Cash",
      date: toLocalDateKey(s.sale_date || s.created_at),
      time: d.toLocaleTimeString("en-US", {
        timeZone: "Asia/Dhaka",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  });

  // 5. Low stock alerts
  const lowStockAlerts: LowStockProduct[] = lowStockProducts
    .slice(0, 5)
    .map((p) => {
      const current = Number(p.quantity) || 0;
      const min = Number(p.min_stock_level) || 5;
      const urgency =
        current === 0 ? "critical" : current <= 2 ? "warning" : "normal";
      return {
        id: p.id,
        name: p.name,
        sku: p.sku || "",
        category: p.categories?.name || "Hardware",
        currentStock: current,
        minStock: min,
        unit: p.unit || "Pcs",
        costPrice: Number(p.purchase_price) || 0,
        sellingPrice: Number(p.selling_price) || 0,
        urgency,
      };
    });

  // 6. Compute Real Sales vs Purchase Comparison (Last 12 Months, Asia/Dhaka)
  const salesPurchaseComparison: SalesPurchaseComparison[] = getRecentMonthBuckets(12).map(
    ({ yearMonth, monthShort, monthFull }) => {
      const monthSales = sales
        .filter((s) => toLocalDateKey(s.sale_date || s.created_at).slice(0, 7) === yearMonth)
        .reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0);

      const monthPurchases = purchases
        .filter((p) => toLocalDateKey(p.purchase_date || p.created_at).slice(0, 7) === yearMonth)
        .reduce((sum, p) => sum + (Number(p.total_amount) || 0), 0);

      return {
        month: monthShort,
        monthFull,
        sales: monthSales,
        purchase: monthPurchases,
        margin: monthSales - monthPurchases,
      };
    },
  );

  // 7. Compute Real Revenue Trend (7d, 30d, 6m in Asia/Dhaka)
  const localTodayKey = toLocalDateKey(new Date());
  const [todayYear, todayMonth, todayDay] = localTodayKey.split("-").map(Number);

  const computeDailyTrend = (days: number, formatLabel: (d: Date) => string): RevenueTrendPoint[] => {
    const points: RevenueTrendPoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(todayYear, todayMonth - 1, todayDay - i, 12));
      const isoDate = d.toISOString().slice(0, 10);
      const label = formatLabel(d);

      const daySales = sales.filter(
        (s) => toLocalDateKey(s.sale_date || s.created_at) === isoDate,
      );

      const dayRevenue = daySales.reduce(
        (sum, s) => sum + (Number(s.total_amount) || 0),
        0,
      );

      points.push({
        date: isoDate,
        label,
        revenue: dayRevenue,
        invoices: daySales.length,
      });
    }
    return points;
  };

  const compute6mTrend = (): RevenueTrendPoint[] => {
    return getRecentMonthBuckets(6).map(({ yearMonth, monthShort }) => {
      const monthSales = sales.filter(
        (s) => toLocalDateKey(s.sale_date || s.created_at).slice(0, 7) === yearMonth,
      );

      const monthRevenue = monthSales.reduce(
        (sum, s) => sum + (Number(s.total_amount) || 0),
        0,
      );

      return {
        date: yearMonth,
        label: monthShort,
        revenue: monthRevenue,
        invoices: monthSales.length,
      };
    });
  };

  const revenueTrend: Record<"7d" | "30d" | "6m", RevenueTrendPoint[]> = {
    "7d": computeDailyTrend(7, (d) => d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })),
    "30d": computeDailyTrend(30, (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })),
    "6m": compute6mTrend(),
  };

  // 8. Compute Real Inventory Status Breakdown
  const totalProducts = allProducts.length;
  let inStockCount = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  allProducts.forEach((p) => {
    const qty = Number(p.quantity) || 0;
    const min = Number(p.min_stock_level) || 5;
    if (qty <= 0) {
      outOfStockCount++;
    } else if (qty <= min) {
      lowStockCount++;
    } else {
      inStockCount++;
    }
  });

  const inStockPct =
    totalProducts > 0 ? Math.round((inStockCount / totalProducts) * 100) : 0;
  const lowStockPct =
    totalProducts > 0 ? Math.round((lowStockCount / totalProducts) * 100) : 0;
  const outOfStockPct =
    totalProducts > 0
      ? Math.max(0, 100 - inStockPct - lowStockPct)
      : 0;

  const inventoryStatusBreakdown: InventoryStatusBreakdown[] = [
    {
      category: "in_stock",
      label: "In Stock",
      count: inStockCount,
      percentage: inStockPct,
      color: "#10b981",
    },
    {
      category: "low_stock",
      label: "Low Stock Alert",
      count: lowStockCount,
      percentage: lowStockPct,
      color: "#f59e0b",
    },
    {
      category: "out_of_stock",
      label: "Out of Stock",
      count: outOfStockCount,
      percentage: outOfStockPct,
      color: "#ef4444",
    },
  ];

  return {
    metrics: {
      totalRevenue,
      totalCashReceived,
      totalSalesCount,
      totalPurchaseCost,
      totalSupplierPaid,
      lowStockCount: lowStockProducts.length,
    },
    recentSales,
    lowStockAlerts,
    salesPurchaseComparison,
    revenueTrend,
    inventoryStatusBreakdown,
  };
};
