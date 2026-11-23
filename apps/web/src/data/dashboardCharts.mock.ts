import type {
  SalesPurchaseComparison,
  RevenueTrendPoint,
  InventoryStatusBreakdown,
} from "@/types";

/**
 * 12-Month Sales vs Purchase Comparative Data
 * Simulated ERP transaction history for StockWise Computer Hub BD (Demo Data)
 */
export const MOCK_MONTHLY_SALES_PURCHASE: SalesPurchaseComparison[] = [
  {
    month: "Dec",
    monthFull: "December 2025",
    sales: 3100000,
    purchase: 2450000,
    margin: 650000,
  },
  {
    month: "Jan",
    monthFull: "January 2026",
    sales: 3250000,
    purchase: 2600000,
    margin: 650000,
  },
  {
    month: "Feb",
    monthFull: "February 2026",
    sales: 2950000,
    purchase: 2300000,
    margin: 650000,
  },
  {
    month: "Mar",
    monthFull: "March 2026",
    sales: 3400000,
    purchase: 2750000,
    margin: 650000,
  },
  {
    month: "Apr",
    monthFull: "April 2026",
    sales: 3300000,
    purchase: 2650000,
    margin: 650000,
  },
  {
    month: "May",
    monthFull: "May 2026",
    sales: 3550000,
    purchase: 2800000,
    margin: 750000,
  },
  {
    month: "Jun",
    monthFull: "June 2026",
    sales: 3700000,
    purchase: 2900000,
    margin: 800000,
  },
  {
    month: "Jul",
    monthFull: "July 2026",
    sales: 3950000,
    purchase: 3150000,
    margin: 800000,
  },
  {
    month: "Aug",
    monthFull: "August 2026",
    sales: 3650000,
    purchase: 2900000,
    margin: 750000,
  },
  {
    month: "Sep",
    monthFull: "September 2026",
    sales: 4200000,
    purchase: 3350000,
    margin: 850000,
  },
  {
    month: "Oct",
    monthFull: "October 2026",
    sales: 4450000,
    purchase: 3550000,
    margin: 900000,
  },
  {
    month: "Nov",
    monthFull: "November 2026",
    sales: 4850000,
    purchase: 3800000,
    margin: 1050000,
  },
];

/**
 * Revenue Trend Data for different ranges (Demo Data)
 */
export const MOCK_REVENUE_TREND_DATA: Record<
  "7d" | "30d" | "6m",
  RevenueTrendPoint[]
> = {
  "7d": [
    { date: "2026-11-17", label: "Nov 17", revenue: 145000, invoices: 12 },
    { date: "2026-11-18", label: "Nov 18", revenue: 168000, invoices: 15 },
    { date: "2026-11-19", label: "Nov 19", revenue: 135000, invoices: 11 },
    { date: "2026-11-20", label: "Nov 20", revenue: 192000, invoices: 18 },
    { date: "2026-11-21", label: "Nov 21", revenue: 210000, invoices: 20 },
    { date: "2026-11-22", label: "Nov 22", revenue: 178000, invoices: 16 },
    { date: "2026-11-23", label: "Nov 23", revenue: 225000, invoices: 19 },
  ],
  "30d": [
    { date: "2026-10-25", label: "Week 1", revenue: 980000, invoices: 82 },
    { date: "2026-11-01", label: "Week 2", revenue: 1120000, invoices: 95 },
    { date: "2026-11-08", label: "Week 3", revenue: 1240000, invoices: 104 },
    { date: "2026-11-15", label: "Week 4", revenue: 1510000, invoices: 128 },
  ],
  "6m": [
    { date: "2026-06", label: "Jun", revenue: 3700000, invoices: 310 },
    { date: "2026-07", label: "Jul", revenue: 3950000, invoices: 334 },
    { date: "2026-08", label: "Aug", revenue: 3650000, invoices: 308 },
    { date: "2026-09", label: "Sep", revenue: 4200000, invoices: 355 },
    { date: "2026-10", label: "Oct", revenue: 4450000, invoices: 378 },
    { date: "2026-11", label: "Nov", revenue: 4850000, invoices: 412 },
  ],
};

/**
 * Inventory Stock Breakdown Data for Computer Shop Catalog (Demo Data)
 * 142 hardware SKUs total
 */
export const MOCK_INVENTORY_STATUS_BREAKDOWN: InventoryStatusBreakdown[] = [
  {
    category: "in_stock",
    label: "In Stock",
    count: 112,
    percentage: 78.9,
    color: "#059669", // Emerald
  },
  {
    category: "low_stock",
    label: "Low Stock",
    count: 20,
    percentage: 14.1,
    color: "#d97706", // Amber
  },
  {
    category: "out_of_stock",
    label: "Out of Stock",
    count: 10,
    percentage: 7.0,
    color: "#e11d48", // Rose/Crimson
  },
];
