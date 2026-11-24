import { supabase } from "@/lib/supabase";
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
    totalSalesCount: number;
    totalPurchaseCost: number;
    lowStockCount: number;
  };
  recentSales: RecentSale[];
  lowStockAlerts: LowStockProduct[];
  salesPurchaseComparison: SalesPurchaseComparison[];
  revenueTrend: Record<"7d" | "30d" | "6m", RevenueTrendPoint[]>;
  inventoryStatusBreakdown: InventoryStatusBreakdown[];
}

export const fetchDashboardStats = async (): Promise<DashboardStatsResult> => {
  // 1. Sales
  const { data: salesData, error: salesErr } = await supabase
    .from("sales")
    .select(
      "id, invoice_number, total_amount, sale_date, created_at, customer_id, status, customers:customer_id (name)",
    )
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });

  if (salesErr) throw new Error(salesErr.message);

  const rawSales = (salesData || []) as unknown as SaleRowWithCustomer[];
  const sales = rawSales.filter(
    (s) => (s.status?.toLowerCase() || "completed") !== "cancelled",
  );

  const paidBySale = new Map<string, number>();
  if (sales.length > 0) {
    const { data: paymentRows, error: paymentError } = await supabase
      .from("payments")
      .select("sale_id, amount")
      .in("sale_id", sales.map((sale) => sale.id))
      .is("purchase_id", null)
      .eq("payment_type", "received");
    if (paymentError) throw new Error(paymentError.message);
    for (const payment of paymentRows || []) {
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

  // 3. Purchases
  const { data: purchasesData, error: purErr } = await supabase
    .from("purchases")
    .select("total_amount, status, purchase_date, created_at");

  if (purErr) throw new Error(purErr.message);

  const purchases = (purchasesData || []).filter(
    (p) => (p.status?.toLowerCase() || "received") !== "cancelled",
  );

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
      customerType: "Retail",
      itemsSummary: "Hardware Items",
      itemCount: 1,
      totalAmount,
      paidAmount,
      paymentStatus: (
        paidAmount >= totalAmount
          ? "paid"
          : paidAmount > 0
            ? "partial"
            : "unpaid"
      ) as PaymentStatus,
      paymentMethod: "Cash",
      date: d.toISOString().split("T")[0],
      time: d.toLocaleTimeString("en-US", {
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

  // 6. Compute Real Sales vs Purchase Comparison (Last 12 Months)
  const now = new Date();
  const salesPurchaseComparison: SalesPurchaseComparison[] = [];
  for (let i = 11; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yearMonth = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}`;
    const monthShort = targetDate.toLocaleString("en-US", { month: "short" });
    const monthFull = targetDate.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    });

    const monthSales = sales
      .filter((s) => {
        const dStr = (s.sale_date || s.created_at || "").slice(0, 7);
        return dStr === yearMonth;
      })
      .reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0);

    const monthPurchases = purchases
      .filter((p) => {
        const dStr = (p.purchase_date || p.created_at || "").slice(0, 7);
        return dStr === yearMonth;
      })
      .reduce((sum, p) => sum + (Number(p.total_amount) || 0), 0);

    salesPurchaseComparison.push({
      month: monthShort,
      monthFull,
      sales: monthSales,
      purchase: monthPurchases,
      margin: monthSales - monthPurchases,
    });
  }

  // 7. Compute Real Revenue Trend (7d, 30d, 6m)
  const compute7dTrend = (): RevenueTrendPoint[] => {
    const points: RevenueTrendPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const isoDate = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-US", { weekday: "short" });

      const daySales = sales.filter((s) => {
        const sDate = (s.sale_date || s.created_at || "").split("T")[0];
        return sDate === isoDate;
      });

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

  const compute30dTrend = (): RevenueTrendPoint[] => {
    const points: RevenueTrendPoint[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const isoDate = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const daySales = sales.filter((s) => {
        const sDate = (s.sale_date || s.created_at || "").split("T")[0];
        return sDate === isoDate;
      });

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
    const points: RevenueTrendPoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}`;
      const label = targetDate.toLocaleString("en-US", { month: "short" });

      const monthSales = sales.filter((s) => {
        const sDate = (s.sale_date || s.created_at || "").slice(0, 7);
        return sDate === yearMonth;
      });

      const monthRevenue = monthSales.reduce(
        (sum, s) => sum + (Number(s.total_amount) || 0),
        0,
      );

      points.push({
        date: yearMonth,
        label,
        revenue: monthRevenue,
        invoices: monthSales.length,
      });
    }
    return points;
  };

  const revenueTrend: Record<"7d" | "30d" | "6m", RevenueTrendPoint[]> = {
    "7d": compute7dTrend(),
    "30d": compute30dTrend(),
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
      totalSalesCount,
      totalPurchaseCost,
      lowStockCount: lowStockProducts.length,
    },
    recentSales,
    lowStockAlerts,
    salesPurchaseComparison,
    revenueTrend,
    inventoryStatusBreakdown,
  };
};
