import React, { useState, useMemo } from "react";
import { useTheme } from "styled-components";
import type { SalesPurchaseComparison } from "@/types";
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
  data = [],
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
          </TitleRow>
          <ChartSubtitle>
            Monthly billed sales vs. vendor purchase bills in BDT
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
          <StatLabel>Billed Sales</StatLabel>
          <StatValue $colorVariant="primary">
            {formatCurrency(totals.totalSales)}
          </StatValue>
        </SummaryStatItem>
        <SummaryStatItem>
          <StatLabel>Purchase Bills</StatLabel>
          <StatValue $colorVariant="warning">
            {formatCurrency(totals.totalPurchase)}
          </StatValue>
        </SummaryStatItem>
        <SummaryStatItem>
          <StatLabel>Sales - Purchases</StatLabel>
          <StatValue $colorVariant="success">
            {formatCurrency(totals.netMargin)} ({totals.marginPercent}%)
          </StatValue>
        </SummaryStatItem>
      </SummaryStatsRow>

      <LegendRow>
        <LegendItem>
          <LegendDot $color={theme.colors.primary} />
          <span>Billed Sales</span>
        </LegendItem>
        <LegendItem>
          <LegendDot $color={theme.colors.warning} />
          <span>Purchase Bills</span>
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

            {activeData.map((d, idx) => {
              const centerX = padding.left + (idx + 0.5) * slotWidth;
              const rawSalesHeight = (d.sales / maxY) * plotHeight;
              const salesHeight = d.sales > 0 ? Math.max(rawSalesHeight, 2) : 0;
              const salesY = padding.top + plotHeight - salesHeight;
              const salesX = centerX - barWidth - barGap / 2;

              const rawPurchaseHeight = (d.purchase / maxY) * plotHeight;
              const purchaseHeight = d.purchase > 0 ? Math.max(rawPurchaseHeight, 2) : 0;
              const purchaseY = padding.top + plotHeight - purchaseHeight;
              const purchaseX = centerX + barGap / 2;

              const isHovered = hoveredIdx === idx;

              return (
                <g key={`${d.monthFull}-${idx}`}>
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
                  {salesHeight > 0 && (
                    <rect
                      x={salesX}
                      y={salesY}
                      width={barWidth}
                      height={salesHeight}
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
                  )}

                  {purchaseHeight > 0 && (
                    <rect
                      x={purchaseX}
                      y={purchaseY}
                      width={barWidth}
                      height={purchaseHeight}
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
                  )}

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
                        const rawX = centerX * scaleX;
                        const clampedX = Math.min(Math.max(rawX, 75), Math.max(75, rect.width - 75));
                        setTooltipPos({
                          x: clampedX,
                          y: Math.min(salesY, purchaseY) * scaleY,
                        });
                      }
                    }}
                    onTouchStart={(e) => {
                      setHoveredIdx(idx);
                      const rect = e.currentTarget
                        .closest("svg")
                        ?.getBoundingClientRect();
                      if (rect) {
                        const scaleX = rect.width / svgWidth;
                        const scaleY = rect.height / svgHeight;
                        const rawX = centerX * scaleX;
                        const clampedX = Math.min(Math.max(rawX, 75), Math.max(75, rect.width - 75));
                        setTooltipPos({
                          x: clampedX,
                          y: Math.min(salesY, purchaseY) * scaleY,
                        });
                      }
                    }}
                  />
                </g>
              );
            })}
          </svg>

          {hoveredItem && (
            <TooltipOverlay
              $x={tooltipPos.x}
              $y={tooltipPos.y}
              $visible={hoveredIdx !== null}
            >
              <TooltipTitle>{hoveredItem.monthFull}</TooltipTitle>
              <TooltipRow>
                <TooltipLabel>Billed Sales:</TooltipLabel>
                <TooltipValue>{formatCurrency(hoveredItem.sales)}</TooltipValue>
              </TooltipRow>
              <TooltipRow>
                <TooltipLabel>Purchase Bills:</TooltipLabel>
                <TooltipValue>
                  {formatCurrency(hoveredItem.purchase)}
                </TooltipValue>
              </TooltipRow>
              <TooltipRow>
                <TooltipLabel>Difference:</TooltipLabel>
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
