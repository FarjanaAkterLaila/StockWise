import type { MetricSummary, ComputerShopQuickStat } from '../types';

export const METRIC_SUMMARIES: MetricSummary[] = [
  {
    id: 'revenue',
    title: 'Total Revenue (Nov)',
    value: '$38,450.00',
    change: '+14.2%',
    isPositive: true,
    period: 'vs. last month ($33,670)',
    iconName: 'dollar-sign',
    badgeText: 'Profitable',
  },
  {
    id: 'sales_count',
    title: "Today's Sales",
    value: '19 Invoices',
    change: '+8.5%',
    isPositive: true,
    period: '14 walk-in POS, 5 online',
    iconName: 'shopping-cart',
    badgeText: 'Active POS',
  },
  {
    id: 'inventory_value',
    title: 'Inventory Valuation',
    value: '$94,200.00',
    change: '142 SKUs',
    isPositive: true,
    period: 'Hardware, accessories & parts',
    iconName: 'package',
    badgeText: '98% in stock',
  },
  {
    id: 'low_stock',
    title: 'Low Stock Warnings',
    value: '5 Products',
    change: 'Action needed',
    isPositive: false,
    period: 'Stock below threshold',
    iconName: 'alert-triangle',
    badgeText: 'Restock Alert',
  },
];

export const SHOP_QUICK_STATS: ComputerShopQuickStat[] = [
  { label: 'Walk-in Footfall', value: '38 Visitors', subtext: 'Terminal POS active' },
  { label: 'PC Builds In Queue', value: '4 Assembly orders', subtext: 'Ready by tomorrow' },
  { label: 'Pending Purchase Orders', value: '$6,420 due', subtext: 'ASUS & MSI shipments' },
  { label: 'Daily Profit Margin', value: '23.4%', subtext: 'Target 20% met' },
];
