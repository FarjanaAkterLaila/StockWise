import type { MetricSummary, ComputerShopQuickStat } from "../types";

export const METRIC_SUMMARIES: MetricSummary[] = [
  {
    id: "revenue",
    title: "Total Revenue",
    value: "৳4,850,000.00",
    change: "+14.2%",
    isPositive: true,
    period: "vs. last month (৳4,230,000)",
    iconName: "dollar-sign",
    badgeText: "Profitable",
  },
  {
    id: "sales_count",
    title: "Total Sales",
    value: "৳3,640,000.00",
    change: "+8.5%",
    isPositive: true,
    period: "142 invoices completed",
    iconName: "shopping-cart",
    badgeText: "Active POS",
  },
  {
    id: "total_purchase",
    title: "Total Purchase",
    value: "৳2,890,000.00",
    change: "+6.4%",
    isPositive: true,
    period: "88 restock shipments",
    iconName: "shopping-bag",
    badgeText: "Distributors",
  },
  {
    id: "low_stock",
    title: "Low Stock Products",
    value: "5 Products",
    change: "Action needed",
    isPositive: false,
    period: "Stock below threshold",
    iconName: "alert-triangle",
    badgeText: "Restock Alert",
  },
];

export const SHOP_QUICK_STATS: ComputerShopQuickStat[] = [
  {
    label: "Walk-in Footfall",
    value: "48 Visitors",
    subtext: "Multiplan POS active",
  },
  {
    label: "PC Builds In Queue",
    value: "5 Assembly orders",
    subtext: "Ready by evening",
  },
  {
    label: "Pending Purchase Orders",
    value: "৳485,000 due",
    subtext: "Smart Tech & UCC shipments",
  },
  { label: "Daily Profit Margin", value: "21.8%", subtext: "Target 20% met" },
];
