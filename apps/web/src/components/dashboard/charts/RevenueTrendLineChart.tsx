import React, { useState, useMemo } from "react";
import { useTheme } from "styled-components";
import type { RevenueTrendPoint } from "@/types";
import { MOCK_REVENUE_TREND_DATA } from "@/data/dashboardCharts.mock";
import { formatCurrency, formatCompactCurrency } from "@/utils/formatters";
import { TrendingUp } from "lucide-react";
import { SegmentedToggle } from "@/components/common/SegmentedToggle";
import {
  calculateRevenueTrendTotals,
  calculateLineChartLayout,
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
  MetricHighlightRow,
  HighlightLeft,
  HighlightValue,
  HighlightLabel,
  GrowthBadge,
  ChartCanvasWrapper,
  SvgContainer,
  TooltipOverlay,
  TooltipDate,
  TooltipValue,
  TooltipSub,
} from "./RevenueTrendLineChart.styles";

interface RevenueTrendLineChartProps {
  data?: Record<"7d" | "30d" | "6m", RevenueTrendPoint[]>;
}

const RANGE_OPTIONS = [
  { value: "7d" as const, label: "7 Days" },
  { value: "30d" as const, label: "30 Days" },
  { value: "6m" as const, label: "6 Months" },
];

export const RevenueTrendLineChart: React.FC<RevenueTrendLineChartProps> = ({
  data = MOCK_REVENUE_TREND_DATA,
}) => {
  const theme = useTheme();
  const [range, setRange] = useState<"7d" | "30d" | "6m">("7d");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const activePoints = useMemo(() => {
    return data[range] || data["7d"];
  }, [data, range]);

  const { totalRevenue, totalInvoices } = useMemo(
    () => calculateRevenueTrendTotals(activePoints),
    [activePoints],
  );

  const {
    svgWidth,
    svgHeight,
    padding,
    plotHeight,
    maxY,
    yTicks,
    points,
    linePath,
    areaPath,
  } = useMemo(() => calculateLineChartLayout(activePoints), [activePoints]);

  const hoveredPoint = getHoveredItem(points, hoveredIdx);

  return (
    <ChartCard>
      <ChartHeader>
        <TitleBlock>
          <TitleRow>
            <ChartTitle>Revenue Trend</ChartTitle>
            <DemoBadge>Demo Data</DemoBadge>
          </TitleRow>
          <ChartSubtitle>
            Historical sales trajectories and daily POS gross revenue
          </ChartSubtitle>
        </TitleBlock>

        <HeaderControls>
          <SegmentedToggle
            options={RANGE_OPTIONS}
            value={range}
            onChange={setRange}
            ariaLabel="Revenue date range filter"
          />
        </HeaderControls>
      </ChartHeader>

      <MetricHighlightRow>
        <HighlightLeft>
          <HighlightValue>{formatCurrency(totalRevenue)}</HighlightValue>
          <HighlightLabel>
            Total in period ({totalInvoices} Invoices)
          </HighlightLabel>
        </HighlightLeft>
        <GrowthBadge $isPositive={true}>
          <TrendingUp size={13} />
          <span>+14.2% Growth</span>
        </GrowthBadge>
      </MetricHighlightRow>

      <ChartCanvasWrapper key={range}>
        <SvgContainer
          onMouseLeave={() => setHoveredIdx(null)}
          role="region"
          aria-label="Revenue trend line chart"
        >
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={theme.colors.primary}
                  stopOpacity="0.28"
                />
                <stop
                  offset="85%"
                  stopColor={theme.colors.primary}
                  stopOpacity="0.02"
                />
                <stop
                  offset="100%"
                  stopColor={theme.colors.primary}
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>

            {/* Grid lines & Y-axis labels */}
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

            {/* Gradient area underneath */}
            {areaPath && <path d={areaPath} fill="url(#revenueGradient)" />}

            {/* Curve Line */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke={theme.colors.primary}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Hover Crosshair Vertical Line */}
            {hoveredPoint && (
              <line
                x1={hoveredPoint.x}
                y1={padding.top}
                x2={hoveredPoint.x}
                y2={padding.top + plotHeight}
                stroke={theme.colors.sidebarAccent}
                strokeDasharray="3 3"
                strokeWidth={1.5}
              />
            )}

            {/* Circles for each point & X-axis labels */}
            {points.map((pt, idx) => {
              const isHovered = hoveredIdx === idx;
              return (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 5.5 : 3.5}
                    fill={
                      isHovered ? theme.colors.primary : theme.colors.background
                    }
                    stroke={theme.colors.primary}
                    strokeWidth={2}
                    style={{ transition: "r 0.15s ease, fill 0.15s ease" }}
                  />

                  <text
                    x={pt.x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    fontSize={points.length > 8 ? "9.5" : "11"}
                    fontWeight={isHovered ? "700" : "500"}
                    fill={
                      isHovered
                        ? theme.colors.textPrimary
                        : theme.colors.textSubtle
                    }
                    fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
                  >
                    {pt.raw.label}
                  </text>

                  {/* Interactive touch/hover target */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={18}
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
                          x: pt.x * scaleX,
                          y: pt.y * scaleY,
                        });
                      }
                    }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Floating Tooltip */}
          {hoveredPoint && (
            <TooltipOverlay
              $x={tooltipPos.x}
              $y={tooltipPos.y}
              $visible={hoveredIdx !== null}
            >
              <TooltipDate>{hoveredPoint.raw.date}</TooltipDate>
              <TooltipValue>
                {formatCurrency(hoveredPoint.raw.revenue)}
              </TooltipValue>
              <TooltipSub>{hoveredPoint.raw.invoices} POS Invoices</TooltipSub>
            </TooltipOverlay>
          )}
        </SvgContainer>
      </ChartCanvasWrapper>
    </ChartCard>
  );
};
