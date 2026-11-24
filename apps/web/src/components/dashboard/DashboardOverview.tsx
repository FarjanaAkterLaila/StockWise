import React, { useState, useEffect, useCallback, useRef } from "react";
import type {
  MetricSummary,
  RecentSale,
  LowStockProduct,
  ComputerShopQuickStat,
  NavSubModule,
  SalesPurchaseComparison,
  RevenueTrendPoint,
  InventoryStatusBreakdown,
} from "@/types";
import { fetchDashboardStats } from "@/services/dashboard.service";
import { NAV_MODULES } from "@/utils/constants";
import {
  INITIAL_EMPTY_METRICS,
  updateMetricsWithData,
} from "@/utils/dashboard.utils";
import { MetricCard } from "./MetricCard";
import { RecentSalesTable } from "./RecentSalesTable";
import { GenericLoader } from "@/components/common/GenericLoader";
import { RefreshCw } from "lucide-react";
import {
  SalesPurchaseBarChart,
  RevenueTrendLineChart,
  InventoryStatusDonutChart,
} from "./charts";
import {
  DashboardViewContainer,
  DashboardTopBar,
  DashboardSubNote,
  DashboardRefreshBtn,
  DashboardErrorBanner,
  MetricsGrid,
  AnalyticsSection,
  ChartsRowTop,
  RecentSalesSection,
} from "./DashboardOverview.styles";

interface DashboardOverviewProps {
  metrics?: MetricSummary[];
  sales?: RecentSale[];
  onNavigateModule: (module: NavSubModule) => void;
  // Optional backward-compatible props
  lowStockProducts?: LowStockProduct[];
  quickStats?: ComputerShopQuickStat[];
  onQuickSale?: () => void;
  onRestockProduct?: (product: LowStockProduct) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  metrics: initialMetrics = INITIAL_EMPTY_METRICS,
  sales: initialSales = [],
  onNavigateModule,
}) => {
  const [metrics, setMetrics] = useState<MetricSummary[]>(initialMetrics);
  const [sales, setSales] = useState<RecentSale[]>(initialSales);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [salesPurchaseData, setSalesPurchaseData] = useState<
    SalesPurchaseComparison[]
  >([]);
  const [revenueTrendData, setRevenueTrendData] = useState<
    Record<"7d" | "30d" | "6m", RevenueTrendPoint[]> | undefined
  >(undefined);
  const [inventoryStatusData, setInventoryStatusData] = useState<
    InventoryStatusBreakdown[]
  >([]);
  const requestSeqRef = useRef(0);

  const loadDashboard = useCallback(async (isRefresh = false) => {
    const seq = ++requestSeqRef.current;
    if (isRefresh) setRefreshing(true);
    try {
      const data = await fetchDashboardStats();
      if (seq !== requestSeqRef.current || !data) return;
      setSales(data.recentSales ?? []);
      setSalesPurchaseData(data.salesPurchaseComparison ?? []);
      setRevenueTrendData(data.revenueTrend);
      setInventoryStatusData(data.inventoryStatusBreakdown ?? []);
      if (data.metrics) {
        setMetrics((prev) => updateMetricsWithData(prev, data.metrics));
      }
      setLoadError(null);
    } catch (err: unknown) {
      if (seq !== requestSeqRef.current) return;
      setLoadError((err as Error).message || "Unable to load Dashboard analytics.");
    } finally {
      if (seq === requestSeqRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadDashboard(false), 0);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadDashboard]);

  if (loading) {
    return (
      <DashboardViewContainer>
        <GenericLoader
          message="Loading store analytics..."
          subtext="Compiling live revenue, POS orders, and stock indicators"
        />
      </DashboardViewContainer>
    );
  }

  return (
    <DashboardViewContainer>
      <DashboardTopBar>
        <DashboardSubNote>
          Live Store Metrics • Asia/Dhaka Calendar Dates
        </DashboardSubNote>
        <DashboardRefreshBtn
          type="button"
          onClick={() => void loadDashboard(true)}
          disabled={refreshing}
        >
          <RefreshCw size={14} />
          <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
        </DashboardRefreshBtn>
      </DashboardTopBar>

      {loadError && (
        <DashboardErrorBanner role="alert">
          <span>Dashboard could not be loaded: {loadError}</span>
          <DashboardRefreshBtn
            type="button"
            onClick={() => void loadDashboard(true)}
            disabled={refreshing}
          >
            Retry
          </DashboardRefreshBtn>
        </DashboardErrorBanner>
      )}

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
          <SalesPurchaseBarChart data={salesPurchaseData} />
          <RevenueTrendLineChart data={revenueTrendData} />
        </ChartsRowTop>

        {/* Row 2: Inventory Status Donut Chart */}
        <InventoryStatusDonutChart data={inventoryStatusData} />
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
