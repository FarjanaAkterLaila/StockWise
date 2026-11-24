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
  PaymentMethod,
  SalesPurchaseComparison,
  RevenueTrendPoint,
  InventoryStatusBreakdown,
} from "@/types";
import type { SaleRow, ProductRow } from "@/types/database.types";

interface SaleItemWithProduct {
  quantity?: number | null;
  products?: { name?: string | null } | null;
}

interface SaleRowWithCustomer extends SaleRow {
  customers: { name: string } | null;
  sale_items?: SaleItemWithProduct[] | null;
}

interface ProductRowWithCategory extends ProductRow {
  categories: { name: string } | null;
}

const mapDashboardPaymentMethod = (value?: unknown): PaymentMethod => {
  if (typeof value !== "string") return "Cash";
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (normalized === "card") return "Card";
  if (normalized === "bank_transfer" || normalized === "bank") return "Bank Transfer";
  if (normalized === "mfs" || normalized === "mobile_money" || normalized === "mobile") return "MFS";
  return "Cash";
};

const isActiveProductStatus = (status?: string | null): boolean => {
  const normalized = typeof status === "string" ? status.trim().toLowerCase() : "";
  return normalized !== "inactive" && normalized !== "archived";
};

export interface DashboardStatsResult {
  metrics: {
    totalRevenue: number;
    totalCashReceived: number;
    totalSalesCount: number;
    totalPurchaseCost: number;
    totalSupplierPaid: number;
    totalOperatingExpenses: number;
    totalCashOutflow: number;
    netCashFlow: number;
    totalReceivable: number;
    totalPayable: number;
    totalProductsCount: number;
    lowStockCount: number;
    stockValuation: number;
  };
  recentSales: RecentSale[];
  lowStockAlerts: LowStockProduct[];
  salesPurchaseComparison: SalesPurchaseComparison[];
  revenueTrend: Record<"7d" | "30d" | "6m", RevenueTrendPoint[]>;
  inventoryStatusBreakdown: InventoryStatusBreakdown[];
}

export const fetchDashboardStats = async (): Promise<DashboardStatsResult> => {
  // 1. Sales (exclude draft, cancelled, refunded; handle NULL and case variations)
  const [salesRes, salePayRes, productsRes, purchasesRes, purchasePayRes, expensesRes] =
    await Promise.all([
      supabase
        .from("sales")
        .select(
          "id, invoice_number, total_amount, sale_date, created_at, customer_id, status, customers:customer_id (name), sale_items (quantity, products:product_id (name))",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("payments")
        .select("id, sale_id, amount, payment_method, payment_date, created_at")
        .eq("payment_type", "received")
        .is("purchase_id", null)
        .not("sale_id", "is", null)
        .order("payment_date", { ascending: false })
        .order("created_at", { ascending: false })
        .order("id", { ascending: false }),
      supabase.from("products").select("*, categories:category_id (name)"),
      supabase
        .from("purchases")
        .select("id, total_amount, status, purchase_date, created_at"),
      supabase
        .from("payments")
        .select("id, purchase_id, amount")
        .eq("payment_type", "paid")
        .is("sale_id", null)
        .not("purchase_id", "is", null),
      supabase.from("expenses").select("id, amount"),
    ]);

  if (salesRes.error) throw new Error(salesRes.error.message);
  if (salePayRes.error) throw new Error(salePayRes.error.message);
  if (purchasesRes.error) throw new Error(purchasesRes.error.message);
  if (purchasePayRes.error) throw new Error(purchasePayRes.error.message);
  if (expensesRes.error) throw new Error(expensesRes.error.message);
  if (productsRes.error) {
    console.warn("Products fetch warning in dashboard:", productsRes.error.message);
  }

  const rawSales = (salesRes.data || []) as unknown as SaleRowWithCustomer[];
  const salesSeen = new Set<string>();
  const sales: SaleRowWithCustomer[] = [];
  for (const s of rawSales) {
    if (!s?.id || salesSeen.has(s.id) || !isEligibleSaleStatus(s.status)) continue;
    salesSeen.add(s.id);
    sales.push(s);
  }
  const eligibleSaleIds = new Set(sales.map((s) => s.id));

  const paidBySale = new Map<string, number>();
  const latestMethodBySale = new Map<string, PaymentMethod>();
  const seenSalePayIds = new Set<string>();
  for (const payment of salePayRes.data || []) {
    if (!payment.id || seenSalePayIds.has(payment.id)) continue;
    seenSalePayIds.add(payment.id);
    if (!payment.sale_id || !eligibleSaleIds.has(payment.sale_id)) continue;
    paidBySale.set(
      payment.sale_id,
      (paidBySale.get(payment.sale_id) || 0) + (Number(payment.amount) || 0),
    );
    if (!latestMethodBySale.has(payment.sale_id)) {
      latestMethodBySale.set(
        payment.sale_id,
        mapDashboardPaymentMethod(payment.payment_method),
      );
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
  const totalReceivable = sales.reduce((sum, s) => {
    const total = Number(s.total_amount) || 0;
    const paid = paidBySale.get(s.id) || 0;
    return sum + Math.max(0, total - paid);
  }, 0);
  const totalSalesCount = sales.length;

  // 2. Products / Inventory
  const rawProducts = (productsRes.data || []) as unknown as ProductRowWithCategory[];
  const productSeen = new Set<string>();
  const allProducts: ProductRowWithCategory[] = [];
  for (const p of rawProducts) {
    if (!p?.id || productSeen.has(p.id) || !isActiveProductStatus(p.status)) continue;
    productSeen.add(p.id);
    allProducts.push(p);
  }
  const lowStockProducts = allProducts.filter(
    (p) => Math.max(0, Number(p.quantity) || 0) <= Math.max(0, Number(p.min_stock_level) || 5),
  );
  const stockValuation = allProducts.reduce((sum, p) => {
    const qty = Math.max(0, Number(p.quantity) || 0);
    const cost = Math.max(0, Number(p.purchase_price) || 0);
    return sum + qty * cost;
  }, 0);

  // 3. Purchases (exclude cancelled; handle NULL and case variations)
  const purchaseSeen = new Set<string>();
  const purchases: Array<{
    id: string;
    total_amount: number;
    status: string | null;
    purchase_date: string;
    created_at: string;
  }> = [];
  for (const p of purchasesRes.data || []) {
    if (!p?.id || purchaseSeen.has(p.id) || !isEligiblePurchaseStatus(p.status)) continue;
    purchaseSeen.add(p.id);
    purchases.push(p);
  }
  const eligiblePurchaseIds = new Set(purchases.map((p) => p.id));

  const paidByPurchase = new Map<string, number>();
  const seenPurPayIds = new Set<string>();
  for (const payment of purchasePayRes.data || []) {
    if (!payment.id || seenPurPayIds.has(payment.id)) continue;
    seenPurPayIds.add(payment.id);
    if (!payment.purchase_id || !eligiblePurchaseIds.has(payment.purchase_id)) continue;
    paidByPurchase.set(
      payment.purchase_id,
      (paidByPurchase.get(payment.purchase_id) || 0) + (Number(payment.amount) || 0),
    );
  }

  const totalPurchaseCost = purchases.reduce(
    (sum, p) => sum + (Number(p.total_amount) || 0),
    0,
  );
  const totalSupplierPaid = Array.from(paidByPurchase.values()).reduce(
    (sum, val) => sum + val,
    0,
  );
  const totalPayable = purchases.reduce((sum, p) => {
    const total = Number(p.total_amount) || 0;
    const paid = paidByPurchase.get(p.id) || 0;
    return sum + Math.max(0, total - paid);
  }, 0);

  // 4. Operating Expenses & Cash Flow
  const seenExpIds = new Set<string>();
  let totalOperatingExpenses = 0;
  for (const exp of expensesRes.data || []) {
    if (!exp?.id || seenExpIds.has(exp.id)) continue;
    seenExpIds.add(exp.id);
    totalOperatingExpenses += Number(exp.amount) || 0;
  }
  const totalCashOutflow = totalSupplierPaid + totalOperatingExpenses;
  const netCashFlow = totalCashReceived - totalCashOutflow;

  // 5. Recent Sales (real line items & payment methods)
  const recentSales: RecentSale[] = sales.slice(0, 5).map((s) => {
    const rawTime = s.created_at || s.sale_date;
    const d = new Date(rawTime);
    const paidAmount = paidBySale.get(s.id) || 0;
    const totalAmount = Number(s.total_amount) || 0;
    const lineItems = (s.sale_items || []).filter(Boolean);
    const totalUnits = lineItems.reduce(
      (sum, item) => sum + (Number(item.quantity) || 1),
      0,
    );
    const itemsSummary = lineItems.length > 0
      ? lineItems
          .map(
            (item) =>
              `${Number(item.quantity) || 1}x ${item.products?.name || "Item"}`,
          )
          .join(", ")
      : "POS Order";

    return {
      id: s.id,
      invoiceNumber: s.invoice_number,
      customerName: s.customers?.name || "Walk-in Customer",
      customerType: s.customer_id ? "Retail" : "Walk-in",
      itemsSummary,
      itemCount: totalUnits || lineItems.length || 0,
      totalAmount,
      paidAmount,
      paymentStatus: (
        paidAmount <= 0
          ? "unpaid"
          : paidAmount >= totalAmount
            ? "paid"
            : "partial"
      ) as PaymentStatus,
      paymentMethod: latestMethodBySale.get(s.id) || "Cash",
      date: toLocalDateKey(s.sale_date || s.created_at),
      time: !isNaN(d.getTime())
        ? d.toLocaleTimeString("en-US", {
            timeZone: "Asia/Dhaka",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
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
      totalOperatingExpenses,
      totalCashOutflow,
      netCashFlow,
      totalReceivable,
      totalPayable,
      totalProductsCount: allProducts.length,
      lowStockCount: lowStockProducts.length,
      stockValuation,
    },
    recentSales,
    lowStockAlerts,
    salesPurchaseComparison,
    revenueTrend,
    inventoryStatusBreakdown,
  };
};
