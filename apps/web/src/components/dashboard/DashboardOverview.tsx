import React from "react";
import type {
  MetricSummary,
  RecentSale,
  LowStockProduct,
  ComputerShopQuickStat,
  NavSubModule,
} from "@/types";
import { NAV_MODULES } from "@/utils/constants";
import { MetricCard } from "./MetricCard";
import { RecentSalesTable } from "./RecentSalesTable";
import {
  SalesPurchaseBarChart,
  RevenueTrendLineChart,
  InventoryStatusDonutChart,
} from "./charts";
import {
  DashboardViewContainer,
  MetricsGrid,
  AnalyticsSection,
  ChartsRowTop,
  RecentSalesSection,
} from "./DashboardOverview.styles";

interface DashboardOverviewProps {
  metrics: MetricSummary[];
  sales: RecentSale[];
  onNavigateModule: (module: NavSubModule) => void;
  // Optional backward-compatible props
  lowStockProducts?: LowStockProduct[];
  quickStats?: ComputerShopQuickStat[];
  onQuickSale?: () => void;
  onRestockProduct?: (product: LowStockProduct) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  metrics,
  sales,
  onNavigateModule,
}) => {
  return (
    <DashboardViewContainer>
      {/* 1. KPI Summary Cards (Top Section) */}
      <MetricsGrid aria-label="Key Performance Indicators">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </MetricsGrid>

      {/* 2. Business Analytics Charts (Middle Section) */}
      <AnalyticsSection aria-label="Business Analytics Charts">
        {/* Row 1: Sales vs Purchase & Revenue Trend side by side on desktop */}
        <ChartsRowTop>
          <SalesPurchaseBarChart />
          <RevenueTrendLineChart />
        </ChartsRowTop>

        {/* Row 2: Inventory Status Donut Chart */}
        <InventoryStatusDonutChart />
      </AnalyticsSection>

      {/* 3. Recent Sales Table (Bottom Section) */}
      <RecentSalesSection aria-label="Recent Sales Invoices">
        <RecentSalesTable
          sales={sales}
          onViewAll={() => onNavigateModule(NAV_MODULES.SALES)}
        />
      </RecentSalesSection>
    </DashboardViewContainer>
  );
};
