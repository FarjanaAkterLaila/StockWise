import React from 'react';
import type { MetricSummary, RecentSale, LowStockProduct, ComputerShopQuickStat } from '@/types';
import { MetricCard } from './MetricCard';
import { RecentSalesTable } from './RecentSalesTable';
import { LowStockAlert } from './LowStockAlert';
import { 
  PlusCircle, 
  Package, 
  ShoppingBag, 
  WalletCards, 
  Receipt,
  ScanBarcode,
  Wrench,
  CheckCircle
} from 'lucide-react';
import {
  DashboardViewContainer,
  StoreBanner,
  BannerContent,
  LiveBadge,
  PulseDot,
  BannerTitle,
  BannerSubtitle,
  BannerActions,
  BannerButton,
  MetricsGrid,
  QuickOpsBar,
  QuickOpsHeader,
  QuickOpsTitle,
  QuickOpsBadge,
  QuickOpsGrid,
  QuickOpButton,
  QuickOpIconWrap,
  QuickOpText,
  QuickOpLabel,
  QuickOpSub,
  SplitGrid,
  SplitLeft,
  SplitRight,
  StatsStrip,
  StatsStripHeader,
  StatsStripGrid,
  StatsStripItem,
  StatsStripLabel,
  StatsStripValue,
  StatsStripSub,
} from './DashboardOverview.styles';

interface DashboardOverviewProps {
  metrics: MetricSummary[];
  sales: RecentSale[];
  lowStockProducts: LowStockProduct[];
  quickStats: ComputerShopQuickStat[];
  onNavigateModule: (module: 'sales' | 'purchase' | 'inventory' | 'accounts') => void;
  onQuickSale: () => void;
  onRestockProduct?: (product: LowStockProduct) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  metrics,
  sales,
  lowStockProducts,
  quickStats,
  onNavigateModule,
  onQuickSale,
  onRestockProduct,
}) => {
  return (
    <DashboardViewContainer>
      {/* Welcome Banner / Computer Shop Store Status Bar */}
      <StoreBanner>
        <BannerContent>
          <LiveBadge>
            <PulseDot />
            <span>Apex Hardware & Computer Hub • Live POS Register</span>
          </LiveBadge>
          <BannerTitle>Store Performance & Daily Inventory</BannerTitle>
          <BannerSubtitle>
            Welcome back, Alex. Today you have processed 19 sales transactions. 5 components require restocking from distributors.
          </BannerSubtitle>
        </BannerContent>

        <BannerActions>
          <BannerButton onClick={onQuickSale} type="button">
            <PlusCircle size={16} />
            <span>New Sale (POS)</span>
          </BannerButton>
          <BannerButton 
            $variant="outline" 
            onClick={() => onNavigateModule('inventory')}
            type="button"
          >
            <ScanBarcode size={16} />
            <span>Scan Hardware</span>
          </BannerButton>
        </BannerActions>
      </StoreBanner>

      {/* 4 Summary KPI Cards */}
      <MetricsGrid aria-label="Key Performance Indicators">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </MetricsGrid>

      {/* Quick Operations Bar for Computer Shop */}
      <QuickOpsBar>
        <QuickOpsHeader>
          <QuickOpsTitle>POS & Fast Hardware Operations</QuickOpsTitle>
          <QuickOpsBadge>Shortcuts</QuickOpsBadge>
        </QuickOpsHeader>
        <QuickOpsGrid>
          <QuickOpButton onClick={onQuickSale} type="button">
            <QuickOpIconWrap $colorVariant="emerald">
              <Receipt size={18} />
            </QuickOpIconWrap>
            <QuickOpText>
              <QuickOpLabel>New POS Receipt</QuickOpLabel>
              <QuickOpSub>Walk-in & Retail</QuickOpSub>
            </QuickOpText>
          </QuickOpButton>

          <QuickOpButton onClick={() => onNavigateModule('inventory')} type="button">
            <QuickOpIconWrap $colorVariant="indigo">
              <Package size={18} />
            </QuickOpIconWrap>
            <QuickOpText>
              <QuickOpLabel>Add Computer Part</QuickOpLabel>
              <QuickOpSub>GPU, CPU, RAM, SSD</QuickOpSub>
            </QuickOpText>
          </QuickOpButton>

          <QuickOpButton onClick={() => onNavigateModule('purchase')} type="button">
            <QuickOpIconWrap $colorVariant="amber">
              <ShoppingBag size={18} />
            </QuickOpIconWrap>
            <QuickOpText>
              <QuickOpLabel>Vendor Restock Order</QuickOpLabel>
              <QuickOpSub>Distributor Intake</QuickOpSub>
            </QuickOpText>
          </QuickOpButton>

          <QuickOpButton onClick={() => onNavigateModule('accounts')} type="button">
            <QuickOpIconWrap $colorVariant="rose">
              <WalletCards size={18} />
            </QuickOpIconWrap>
            <QuickOpText>
              <QuickOpLabel>Daily Shop Expense</QuickOpLabel>
              <QuickOpSub>Rent, bills, repairs</QuickOpSub>
            </QuickOpText>
          </QuickOpButton>
        </QuickOpsGrid>
      </QuickOpsBar>

      {/* Main 2-Column Section: Recent Sales & Low Stock Alerts */}
      <SplitGrid>
        <SplitLeft>
          <RecentSalesTable 
            sales={sales} 
            onViewAll={() => onNavigateModule('sales')} 
          />
        </SplitLeft>

        <SplitRight>
          <LowStockAlert 
            products={lowStockProducts} 
            onViewInventory={() => onNavigateModule('inventory')}
            onRestockProduct={onRestockProduct}
          />
        </SplitRight>
      </SplitGrid>

      {/* Bottom Computer Shop Quick Stats Strip */}
      <StatsStrip>
        <StatsStripHeader>
          <Wrench size={16} />
          <span>Workshop & Service Desk Status</span>
        </StatsStripHeader>
        <StatsStripGrid>
          {quickStats.map((stat, idx) => (
            <StatsStripItem key={idx}>
              <StatsStripLabel>{stat.label}</StatsStripLabel>
              <StatsStripValue>{stat.value}</StatsStripValue>
              <StatsStripSub>
                <CheckCircle size={11} />
                {stat.subtext}
              </StatsStripSub>
            </StatsStripItem>
          ))}
        </StatsStripGrid>
      </StatsStrip>
    </DashboardViewContainer>
  );
};
