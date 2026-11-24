import type { MetricSummary } from "@/types";
import type { DashboardStatsResult } from "@/services/dashboard.service";
import { formatCurrency } from "@/utils/formatters";

export const DASHBOARD_METRIC_IDS = {
  TOTAL_REVENUE: "total-revenue",
  TOTAL_SALES: "total-sales",
  PURCHASE_COST: "purchase-cost",
  LOW_STOCK: "low-stock",
} as const;

export const INITIAL_EMPTY_METRICS: MetricSummary[] = [
  {
    id: DASHBOARD_METRIC_IDS.TOTAL_REVENUE,
    title: "Total Revenue",
    value: "৳0",
    change: "Live",
    isPositive: true,
    period: "All-time POS sales",
    iconName: "dollar-sign",
  },
  {
    id: DASHBOARD_METRIC_IDS.TOTAL_SALES,
    title: "Total Invoices",
    value: "0",
    change: "Live",
    isPositive: true,
    period: "Completed orders",
    iconName: "shopping-cart",
  },
  {
    id: DASHBOARD_METRIC_IDS.PURCHASE_COST,
    title: "Purchase Outflow",
    value: "৳0",
    change: "Live",
    isPositive: false,
    period: "Vendor restock",
    iconName: "shopping-bag",
  },
  {
    id: DASHBOARD_METRIC_IDS.LOW_STOCK,
    title: "Low Stock Alert",
    value: "0",
    change: "Live",
    isPositive: false,
    period: "Action needed",
    iconName: "alert-triangle",
  },
];

const METRIC_RESOLVERS: Record<
  string,
  (metrics: DashboardStatsResult["metrics"]) => string
> = {
  [DASHBOARD_METRIC_IDS.TOTAL_REVENUE]: (m) => formatCurrency(m.totalRevenue),
  [DASHBOARD_METRIC_IDS.TOTAL_SALES]: (m) => String(m.totalSalesCount),
  [DASHBOARD_METRIC_IDS.PURCHASE_COST]: (m) =>
    formatCurrency(m.totalPurchaseCost),
  [DASHBOARD_METRIC_IDS.LOW_STOCK]: (m) => String(m.lowStockCount),
};

export const updateMetricsWithData = (
  prevMetrics: MetricSummary[],
  metricsData: DashboardStatsResult["metrics"],
): MetricSummary[] => {
  return prevMetrics.map((m) => {
    const resolver = METRIC_RESOLVERS[m.id];
    return resolver ? { ...m, value: resolver(metricsData) } : m;
  });
};
