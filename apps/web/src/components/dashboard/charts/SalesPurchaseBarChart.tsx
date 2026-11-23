import React, { useState, useMemo } from "react";
import { useTheme } from "styled-components";
import type { SalesPurchaseComparison } from "@/types";
import { MOCK_MONTHLY_SALES_PURCHASE } from "@/data/dashboardCharts.mock";
import { formatCurrency, formatCompactCurrency } from "@/utils/formatters";
import { SegmentedToggle } from "@/components/common/SegmentedToggle";
import {
  getActiveSalesPurchaseData,
  calculateSalesPurchaseTotals,
  calculateBarChartLayout,
  getHoveredItem,
} from "@/utils/chart.utils";
import {
  ChartCard,
  ChartHeader,
  TitleBlock,
  TitleRow,
  ChartTitle,
  DemoBadge,
  ChartSubtitle,
  HeaderControls,
  SummaryStatsRow,
  SummaryStatItem,
  StatLabel,
  StatValue,
  LegendRow,
  LegendItem,
  LegendDot,
  ChartCanvasWrapper,
  SvgContainer,
  TooltipOverlay,
  TooltipTitle,
  TooltipRow,
  TooltipLabel,
  TooltipValue,
} from "./SalesPurchaseBarChart.styles";

interface SalesPurchaseBarChartProps {
  data?: SalesPurchaseComparison[];
}

const RANGE_OPTIONS = [
  { value: "6m" as const, label: "6 Months" },
  { value: "12m" as const, label: "12 Months" },
];

export const SalesPurchaseBarChart: React.FC<SalesPurchaseBarChartProps> = ({
  data = MOCK_MONTHLY_SALES_PURCHASE,
}) => {
  const theme = useTheme();
  const [range, setRange] = useState<"6m" | "12m">("6m");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const activeData = useMemo(
    () => getActiveSalesPurchaseData(data, range),
    [data, range],
  );

  const totals = useMemo(
    () => calculateSalesPurchaseTotals(activeData),
    [activeData],
  );

  const {
    svgWidth,
    svgHeight,
    padding,
    plotHeight,
    maxY,
    yTicks,
    slotWidth,
    barWidth,
    barGap,
  } = useMemo(() => calculateBarChartLayout(activeData), [activeData]);

  const hoveredItem = getHoveredItem(activeData, hoveredIdx);

  return (
    <ChartCard>
      <ChartHeader>
        <TitleBlock>
          <TitleRow>
            <ChartTitle>Sales vs Purchase Overview</ChartTitle>
            <DemoBadge>Demo Data</DemoBadge>
          </TitleRow>
          <ChartSubtitle>
            Monthly sales revenue vs. vendor restock expense in BDT
          </ChartSubtitle>
        </TitleBlock>

        <HeaderControls>
          <SegmentedToggle
            options={RANGE_OPTIONS}
            value={range}
            onChange={setRange}
            ariaLabel="Time period filter"
          />
        </HeaderControls>
      </ChartHeader>

      <SummaryStatsRow>
        <SummaryStatItem>
          <StatLabel>Sales</StatLabel>
          <StatValue $colorVariant="primary">
            {formatCurrency(totals.totalSales)}
          </StatValue>
        </SummaryStatItem>
        <SummaryStatItem>
          <StatLabel>Purchase</StatLabel>
          <StatValue $colorVariant="warning">
            {formatCurrency(totals.totalPurchase)}
          </StatValue>
        </SummaryStatItem>
        <SummaryStatItem>
          <StatLabel>Net Margin</StatLabel>
          <StatValue $colorVariant="success">
            {formatCurrency(totals.netMargin)} ({totals.marginPercent}%)
          </StatValue>
        </SummaryStatItem>
      </SummaryStatsRow>

      <LegendRow>
        <LegendItem>
          <LegendDot $color={theme.colors.primary} />
          <span>Sales Revenue</span>
        </LegendItem>
        <LegendItem>
          <LegendDot $color={theme.colors.warning} />
          <span>Purchase Expense</span>
        </LegendItem>
      </LegendRow>

      <ChartCanvasWrapper key={range}>
        <SvgContainer
          onMouseLeave={() => setHoveredIdx(null)}
          role="region"
          aria-label="Sales versus purchase comparison bar chart"
        >
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Background horizontal grid lines & Y-axis labels */}
            {yTicks.map((tickVal, i) => {
              const y =
                padding.top + plotHeight - (tickVal / maxY) * plotHeight;
              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={svgWidth - padding.right}
                    y2={y}
                    stroke={theme.colors.border}
                    strokeDasharray={tickVal === 0 ? "none" : "3 3"}
                    strokeWidth={1}
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill={theme.colors.textMuted}
                    fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
                  >
                    {formatCompactCurrency(tickVal)}
                  </text>
                </g>
              );
            })}

            {/* Bars for Sales & Purchase */}
            {activeData.map((d, idx) => {
              const centerX = padding.left + (idx + 0.5) * slotWidth;
              const salesHeight = (d.sales / maxY) * plotHeight;
              const salesY = padding.top + plotHeight - salesHeight;
              const salesX = centerX - barWidth - barGap / 2;

              const purchaseHeight = (d.purchase / maxY) * plotHeight;
              const purchaseY = padding.top + plotHeight - purchaseHeight;
              const purchaseX = centerX + barGap / 2;

              const isHovered = hoveredIdx === idx;

              return (
                <g key={d.month}>
                  {/* Subtle hover column background */}
                  {isHovered && (
                    <rect
                      x={centerX - slotWidth / 2 + 2}
                      y={padding.top}
                      width={slotWidth - 4}
                      height={plotHeight}
                      fill={theme.colors.hoverSubtle}
                      rx={4}
                      opacity={0.7}
                    />
                  )}

                  {/* Sales Bar */}
                  <rect
                    x={salesX}
                    y={salesY}
                    width={barWidth}
                    height={Math.max(salesHeight, 2)}
                    fill={
                      isHovered
                        ? theme.colors.primaryHover
                        : theme.colors.primary
                    }
                    rx={3}
                    style={{
                      transition: "fill 0.15s ease",
                      cursor: "pointer",
                    }}
                  />

                  {/* Purchase Bar */}
                  <rect
                    x={purchaseX}
                    y={purchaseY}
                    width={barWidth}
                    height={Math.max(purchaseHeight, 2)}
                    fill={
                      isHovered
                        ? theme.colors.warningHover
                        : theme.colors.warning
                    }
                    rx={3}
                    style={{
                      transition: "fill 0.15s ease",
                      cursor: "pointer",
                    }}
                  />

                  {/* X-axis Month Label */}
                  <text
                    x={centerX}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    fontSize={activeData.length > 8 ? "10" : "11"}
                    fontWeight={isHovered ? "700" : "500"}
                    fill={
                      isHovered
                        ? theme.colors.textPrimary
                        : theme.colors.textSubtle
                    }
                    fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
                  >
                    {d.month}
                  </text>

                  {/* Interactive touch/hover overlay */}
                  <rect
                    x={centerX - slotWidth / 2}
                    y={padding.top}
                    width={slotWidth}
                    height={plotHeight + 25}
                    fill="transparent"
                    style={{ cursor: "pointer" }}
                    onMouseEnter={(e) => {
                      setHoveredIdx(idx);
                      const rect = e.currentTarget
                        .closest("svg")
                        ?.getBoundingClientRect();
                      if (rect) {
                        const scaleX = rect.width / svgWidth;
                        const scaleY = rect.height / svgHeight;
                        setTooltipPos({
                          x: centerX * scaleX,
                          y: Math.min(salesY, purchaseY) * scaleY,
                        });
                      }
                    }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Floating Tooltip */}
          {hoveredItem && (
            <TooltipOverlay
              $x={tooltipPos.x}
              $y={tooltipPos.y}
              $visible={hoveredIdx !== null}
            >
              <TooltipTitle>{hoveredItem.monthFull}</TooltipTitle>
              <TooltipRow>
                <TooltipLabel>Sales:</TooltipLabel>
                <TooltipValue>{formatCurrency(hoveredItem.sales)}</TooltipValue>
              </TooltipRow>
              <TooltipRow>
                <TooltipLabel>Purchase:</TooltipLabel>
                <TooltipValue>
                  {formatCurrency(hoveredItem.purchase)}
                </TooltipValue>
              </TooltipRow>
              <TooltipRow>
                <TooltipLabel>Margin:</TooltipLabel>
                <TooltipValue $highlight={true}>
                  {formatCurrency(hoveredItem.margin)}
                </TooltipValue>
              </TooltipRow>
            </TooltipOverlay>
          )}
        </SvgContainer>
      </ChartCanvasWrapper>
    </ChartCard>
  );
};
