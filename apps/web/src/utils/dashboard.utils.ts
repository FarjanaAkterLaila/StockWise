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
    title: "Billed Sales",
    value: "৳0",
    change: "Live",
    isPositive: true,
    period: "Active invoices • Cash received: ৳0",
    iconName: "dollar-sign",
  },
  {
    id: DASHBOARD_METRIC_IDS.TOTAL_SALES,
    title: "Total Invoices",
    value: "0",
    change: "Live",
    isPositive: true,
    period: "Active sales orders",
    iconName: "shopping-cart",
  },
  {
    id: DASHBOARD_METRIC_IDS.PURCHASE_COST,
    title: "Purchase Bills",
    value: "৳0",
    change: "Live",
    isPositive: false,
    period: "Vendor PO bills • Paid: ৳0",
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
  (metrics: DashboardStatsResult["metrics"]) => { value: string; period?: string }
> = {
  [DASHBOARD_METRIC_IDS.TOTAL_REVENUE]: (m) => ({
    value: formatCurrency(m.totalRevenue),
    period: `Active invoices • Cash received: ${formatCurrency(m.totalCashReceived)}`,
  }),
  [DASHBOARD_METRIC_IDS.TOTAL_SALES]: (m) => ({
    value: String(m.totalSalesCount),
  }),
  [DASHBOARD_METRIC_IDS.PURCHASE_COST]: (m) => ({
    value: formatCurrency(m.totalPurchaseCost),
    period: `Vendor PO bills • Paid: ${formatCurrency(m.totalSupplierPaid)}`,
  }),
  [DASHBOARD_METRIC_IDS.LOW_STOCK]: (m) => ({
    value: String(m.lowStockCount),
  }),
};

export const updateMetricsWithData = (
  prevMetrics: MetricSummary[],
  metricsData: DashboardStatsResult["metrics"],
): MetricSummary[] => {
  return prevMetrics.map((m) => {
    const resolver = METRIC_RESOLVERS[m.id];
    if (!resolver) return m;
    const resolved = resolver(metricsData);
    return {
      ...m,
      value: resolved.value,
      ...(resolved.period ? { period: resolved.period } : {}),
    };
  });
};
