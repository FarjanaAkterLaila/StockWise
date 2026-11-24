import { supabase } from "@/lib/supabase";
import type { RecentSale, LowStockProduct, PaymentStatus } from "@/types";
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
}

export const fetchDashboardStats = async (): Promise<DashboardStatsResult> => {
  // 1. Sales
  const { data: salesData, error: salesErr } = await supabase
    .from("sales")
    .select(
      "id, invoice_number, total_amount, paid_amount, payment_status, sale_date, created_at, customer_id, customers:customer_id (name)",
    )
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });

  if (salesErr) throw new Error(salesErr.message);

  const sales = (salesData || []) as unknown as SaleRowWithCustomer[];

  const totalRevenue = sales.reduce(
    (sum, s) => sum + (Number(s.total_amount) || 0),
    0,
  );
  const totalSalesCount = sales.length;

  // 2. Products / Inventory
  const { data: productsData, error: prodErr } = await supabase
    .from("products")
    .select(
      "id, name, sku, category_id, purchase_price, selling_price, quantity, min_stock_level, unit, status, categories:category_id (name)",
    );

  if (prodErr) throw new Error(prodErr.message);

  const allProducts = (productsData ||
    []) as unknown as ProductRowWithCategory[];
  const lowStockProducts = allProducts.filter(
    (p) => Number(p.quantity) <= (Number(p.min_stock_level) || 5),
  );

  // 3. Purchases
  const { data: purchases, error: purErr } = await supabase
    .from("purchases")
    .select("total_amount, status")
    .neq("status", "cancelled");

  if (purErr) throw new Error(purErr.message);

  const totalPurchaseCost = (purchases || []).reduce(
    (sum, p) => sum + (Number(p.total_amount) || 0),
    0,
  );

  // 4. Recent Sales
  const recentSales: RecentSale[] = sales.slice(0, 5).map((s) => {
    const d = new Date(s.sale_date || s.created_at);
    return {
      id: s.id,
      invoiceNumber: s.invoice_number,
      customerName: s.customers?.name || "Walk-in Customer",
      customerType: "Retail",
      itemsSummary: "Hardware Items",
      itemCount: 1,
      totalAmount: Number(s.total_amount) || 0,
      paidAmount: Number(s.paid_amount) || 0,
      paymentStatus: (s.payment_status?.toLowerCase() as PaymentStatus) || "paid",
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

  return {
    metrics: {
      totalRevenue,
      totalSalesCount,
      totalPurchaseCost,
      lowStockCount: lowStockProducts.length,
    },
    recentSales,
    lowStockAlerts,
  };
};
