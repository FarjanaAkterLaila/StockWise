import React, { useState, useEffect } from "react";
import type {
  MetricSummary,
  RecentSale,
  LowStockProduct,
  ComputerShopQuickStat,
  NavSubModule,
} from "@/types";
import { fetchDashboardStats } from "@/services/dashboard.service";
import { formatCurrency } from "@/utils/formatters";
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
  metrics: initialMetrics,
  sales: initialSales,
  onNavigateModule,
}) => {
  const [metrics, setMetrics] = useState<MetricSummary[]>(initialMetrics);
  const [sales, setSales] = useState<RecentSale[]>(initialSales);

  useEffect(() => {
    let isMounted = true;
    fetchDashboardStats()
      .then((data) => {
        if (!isMounted || !data) return;
        if (Array.isArray(data.recentSales)) {
          setSales(data.recentSales);
        }
        if (data.metrics) {
          setMetrics((prev) =>
            prev.map((m) => {
              if (m.id === "total-revenue") {
                return {
                  ...m,
                  value: formatCurrency(data.metrics.totalRevenue),
                };
              }
              if (m.id === "total-sales") {
                return { ...m, value: String(data.metrics.totalSalesCount) };
              }
              if (m.id === "purchase-cost") {
                return {
                  ...m,
                  value: formatCurrency(data.metrics.totalPurchaseCost),
                };
              }
              if (m.id === "low-stock") {
                return { ...m, value: String(data.metrics.lowStockCount) };
              }
              return m;
            }),
          );
        }
      })
      .catch((err) => {
        console.error("Dashboard stats fetch error:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
