import type { MetricSummary } from "@/types";
import type { DashboardStatsResult } from "@/services/dashboard.service";
import { formatCurrency } from "@/utils/formatters";
import { toLocalDateKey } from "@/utils/accounts.utils";

export const DASHBOARD_METRIC_IDS = {
  TOTAL_REVENUE: "total-revenue",
  TOTAL_SALES: "total-sales",
  PURCHASE_COST: "purchase-cost",
  LOW_STOCK: "low-stock",
  CASH_RECEIVED: "cash-received",
  CASH_OUTFLOW: "cash-outflow",
  NET_CASH_FLOW: "net-cash-flow",
  RECEIVABLE_PAYABLE: "receivable-payable",
} as const;

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const formatDashboardDate = (value?: string | Date | null): string => {
  const key = toLocalDateKey(value);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return key || "";
  const [, year, month, day] = match;
  return `${day} ${MONTHS_SHORT[Number(month) - 1] || month} ${year}`;
};

export const INITIAL_EMPTY_METRICS: MetricSummary[] = [
  {
    id: DASHBOARD_METRIC_IDS.TOTAL_REVENUE,
    title: "Billed Sales",
    value: "৳0.00",
    change: "Live",
    isPositive: true,
    period: "Receivable due: ৳0.00",
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
    value: "৳0.00",
    change: "Live",
    isPositive: false,
    period: "Payable due: ৳0.00",
    iconName: "shopping-bag",
  },
  {
    id: DASHBOARD_METRIC_IDS.LOW_STOCK,
    title: "Low Stock Alert",
    value: "0",
    change: "Live",
    isPositive: false,
    period: "0 SKUs • Val: ৳0.00",
    iconName: "alert-triangle",
  },
  {
    id: DASHBOARD_METRIC_IDS.CASH_RECEIVED,
    title: "Cash Received",
    value: "৳0.00",
    change: "Actual",
    isPositive: true,
    period: "Customer payments collected",
    iconName: "trending-up",
  },
  {
    id: DASHBOARD_METRIC_IDS.CASH_OUTFLOW,
    title: "Total Cash Outflow",
    value: "৳0.00",
    change: "Actual",
    isPositive: false,
    period: "Supplier: ৳0.00 • Exp: ৳0.00",
    iconName: "shopping-bag",
  },
  {
    id: DASHBOARD_METRIC_IDS.NET_CASH_FLOW,
    title: "Net Cash Flow",
    value: "৳0.00",
    change: "Cash",
    isPositive: true,
    period: "Cash Received − Cash Outflow",
    iconName: "trending-up",
  },
  {
    id: DASHBOARD_METRIC_IDS.RECEIVABLE_PAYABLE,
    title: "Outstanding Receivable",
    value: "৳0.00",
    change: "Dues",
    isPositive: true,
    period: "Payable Due: ৳0.00",
    iconName: "package",
  },
];

const METRIC_RESOLVERS: Record<
  string,
  (metrics: DashboardStatsResult["metrics"]) => Partial<MetricSummary>
> = {
  [DASHBOARD_METRIC_IDS.TOTAL_REVENUE]: (m) => ({
    value: formatCurrency(m.totalRevenue),
    period: `Receivable due: ${formatCurrency(m.totalReceivable)}`,
  }),
  [DASHBOARD_METRIC_IDS.TOTAL_SALES]: (m) => ({
    value: String(m.totalSalesCount),
  }),
  [DASHBOARD_METRIC_IDS.PURCHASE_COST]: (m) => ({
    value: formatCurrency(m.totalPurchaseCost),
    period: `Payable due: ${formatCurrency(m.totalPayable)}`,
  }),
  [DASHBOARD_METRIC_IDS.LOW_STOCK]: (m) => ({
    value: String(m.lowStockCount),
    isPositive: m.lowStockCount === 0,
    period: `${m.totalProductsCount} SKUs • Val: ${formatCurrency(m.stockValuation)}`,
  }),
  [DASHBOARD_METRIC_IDS.CASH_RECEIVED]: (m) => ({
    value: formatCurrency(m.totalCashReceived),
    period: "Customer payments collected",
  }),
  [DASHBOARD_METRIC_IDS.CASH_OUTFLOW]: (m) => ({
    value: formatCurrency(m.totalCashOutflow),
    period: `Supplier: ${formatCurrency(m.totalSupplierPaid)} • Exp: ${formatCurrency(m.totalOperatingExpenses)}`,
  }),
  [DASHBOARD_METRIC_IDS.NET_CASH_FLOW]: (m) => ({
    value: formatCurrency(m.netCashFlow),
    isPositive: m.netCashFlow >= 0,
    change: m.netCashFlow >= 0 ? "Surplus" : "Deficit",
    period: "Cash Received − Cash Outflow",
  }),
  [DASHBOARD_METRIC_IDS.RECEIVABLE_PAYABLE]: (m) => ({
    value: formatCurrency(m.totalReceivable),
    isPositive: m.totalReceivable === 0 && m.totalPayable === 0,
    period: `Payable Due: ${formatCurrency(m.totalPayable)}`,
  }),
};

export const updateMetricsWithData = (
  prevMetrics: MetricSummary[],
  metricsData: DashboardStatsResult["metrics"],
): MetricSummary[] => {
  return prevMetrics.map((m) => {
    const resolver = METRIC_RESOLVERS[m.id];
    return resolver ? { ...m, ...resolver(metricsData) } : m;
  });
};
