import type { SalesPurchaseComparison, RevenueTrendPoint } from "@/types";
import { computeNiceChartMax } from "@/utils/accounts.utils";

export interface SalesPurchaseTotals {
  totalSales: number;
  totalPurchase: number;
  netMargin: number;
  marginPercent: string;
}

export interface BarChartLayout {
  svgWidth: number;
  svgHeight: number;
  padding: { top: number; right: number; bottom: number; left: number };
  plotWidth: number;
  plotHeight: number;
  maxY: number;
  yTicks: number[];
  slotWidth: number;
  barWidth: number;
  barGap: number;
}

export interface RevenueTrendTotals {
  totalRevenue: number;
  totalInvoices: number;
}

export interface LineChartPoint {
  x: number;
  y: number;
  raw: RevenueTrendPoint;
}

export interface LineChartLayout {
  svgWidth: number;
  svgHeight: number;
  padding: { top: number; right: number; bottom: number; left: number };
  plotWidth: number;
  plotHeight: number;
  maxY: number;
  yTicks: number[];
  points: LineChartPoint[];
  linePath: string;
  areaPath: string;
}

export const BAR_CHART_DIMENSIONS = {
  svgWidth: 560,
  svgHeight: 220,
  padding: { top: 20, right: 15, bottom: 28, left: 45 },
} as const;

export const LINE_CHART_DIMENSIONS = {
  svgWidth: 560,
  svgHeight: 220,
  padding: { top: 20, right: 20, bottom: 28, left: 45 },
} as const;

export const getActiveSalesPurchaseData = (
  data: SalesPurchaseComparison[],
  range: "6m" | "12m",
): SalesPurchaseComparison[] => {
  return range === "6m" ? data.slice(-6) : data;
};

export const calculateSalesPurchaseTotals = (
  activeData: SalesPurchaseComparison[],
): SalesPurchaseTotals => {
  const totalSales = activeData.reduce((acc, d) => acc + d.sales, 0);
  const totalPurchase = activeData.reduce((acc, d) => acc + d.purchase, 0);
  const netMargin = totalSales - totalPurchase;
  const marginPercent =
    totalSales > 0 ? ((netMargin / totalSales) * 100).toFixed(1) : "0";
  return { totalSales, totalPurchase, netMargin, marginPercent };
};

export const calculateBarChartLayout = (
  activeData: SalesPurchaseComparison[],
  dimensions = BAR_CHART_DIMENSIONS,
): BarChartLayout => {
  const { svgWidth, svgHeight, padding } = dimensions;
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  const rawMax = Math.max(
    ...activeData.map((d) => Math.max(d.sales, d.purchase)),
    0,
  );
  const maxY = computeNiceChartMax(rawMax);
  const yTicks = [0, maxY * 0.25, maxY * 0.5, maxY * 0.75, maxY];

  const slotWidth = activeData.length > 0 ? plotWidth / activeData.length : 0;
  const barWidth = Math.min(22, Math.max(8, slotWidth * 0.3));
  const barGap = 2;

  return {
    svgWidth,
    svgHeight,
    padding,
    plotWidth,
    plotHeight,
    maxY,
    yTicks,
    slotWidth,
    barWidth,
    barGap,
  };
};

export const calculateRevenueTrendTotals = (
  activePoints: RevenueTrendPoint[],
): RevenueTrendTotals => {
  const totalRevenue = activePoints.reduce((acc, p) => acc + p.revenue, 0);
  const totalInvoices = activePoints.reduce((acc, p) => acc + p.invoices, 0);
  return { totalRevenue, totalInvoices };
};

export const calculateLineChartLayout = (
  activePoints: RevenueTrendPoint[],
  dimensions = LINE_CHART_DIMENSIONS,
): LineChartLayout => {
  const { svgWidth, svgHeight, padding } = dimensions;
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  const rawMax = Math.max(...activePoints.map((p) => p.revenue), 0);
  const maxY = computeNiceChartMax(rawMax);
  const yTicks = [0, maxY * 0.25, maxY * 0.5, maxY * 0.75, maxY];

  if (activePoints.length <= 1) {
    return {
      svgWidth,
      svgHeight,
      padding,
      plotWidth,
      plotHeight,
      maxY,
      yTicks,
      points: [],
      linePath: "",
      areaPath: "",
    };
  }

  const points: LineChartPoint[] = activePoints.map((p, idx) => {
    const x = padding.left + (idx / (activePoints.length - 1)) * plotWidth;
    const y = padding.top + plotHeight - (p.revenue / maxY) * plotHeight;
    return { x, y, raw: p };
  });

  let linePath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const controlX = (p0.x + p1.x) / 2;
    linePath += ` C ${controlX} ${p0.y}, ${controlX} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  const baselineY = padding.top + plotHeight;
  const firstX = points[0].x;
  const lastX = points[points.length - 1].x;
  const areaPath = `${linePath} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`;

  return {
    svgWidth,
    svgHeight,
    padding,
    plotWidth,
    plotHeight,
    maxY,
    yTicks,
    points,
    linePath,
    areaPath,
  };
};

export const getHoveredItem = <T>(
  items: T[],
  hoveredIdx: number | null,
): T | null => {
  return hoveredIdx !== null && hoveredIdx >= 0 && hoveredIdx < items.length
    ? items[hoveredIdx]
    : null;
};
