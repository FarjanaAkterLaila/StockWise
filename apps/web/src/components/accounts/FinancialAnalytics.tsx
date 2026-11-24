import React from "react";
import { useTheme } from "styled-components";
import type { MonthlyFinancialSummary, Expense } from "@/types";
import { MOCK_MONTHLY_FINANCIALS } from "@/data/accounts.mock";
import { formatCurrency, formatCompactCurrency } from "@/utils/formatters";
import { useFinancialAnalytics } from "@/hooks/useFinancialAnalytics";
import { SegmentedToggle } from "@/components/common/SegmentedToggle";
import {
  AnalyticsGrid,
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
  StatNumber,
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
  PnLCard,
  PnLHeader,
  PnLTitle,
  PnLSubtitle,
  PnLSection,
  PnLSectionTitle,
  PnLRow,
  PnLLabel,
  PnLValue,
  PnLDivider,
  PnLTotalRow,
  PnLTotalLabel,
  PnLTotalValue,
  CategoryProgressList,
  CategoryProgressItem,
  CategoryProgressHeader,
  CategoryProgressName,
  CategoryProgressAmount,
  CategoryProgressBar,
  CategoryProgressFill,
  ChartBarGroup,
  PnLMarginSubtext,
  PnLBreakdownSection,
} from "./Accounts.styles";

interface FinancialAnalyticsProps {
  monthlyData?: MonthlyFinancialSummary[];
  expenses?: Expense[];
  totalRevenue?: number;
  totalExpenses?: number;
}

const RANGE_OPTIONS = [
  { value: "6m" as const, label: "6 Months" },
  { value: "12m" as const, label: "12 Months" },
];

export const FinancialAnalytics: React.FC<FinancialAnalyticsProps> = ({
  monthlyData = MOCK_MONTHLY_FINANCIALS,
  expenses = [],
  totalRevenue = 4850000,
  totalExpenses = 3420000,
}) => {
  const theme = useTheme();

  const {
    range,
    setRange,
    hoveredIdx,
    setHoveredIdx,
    tooltipPos,
    setTooltipPos,
    avgIncome,
    avgExpense,
    avgNet,
    categoryExpenses,
    chartLayout,
    hoveredItem,
  } = useFinancialAnalytics(monthlyData, expenses);

  const netOperatingProfit = totalRevenue - totalExpenses;
  const netMarginPercent =
    totalRevenue > 0 ? Math.round((netOperatingProfit / totalRevenue) * 100) : 0;

  return (
    <AnalyticsGrid>
      {/* Monthly Bar Chart */}
      <ChartCard>
        <ChartHeader>
          <TitleBlock>
            <TitleRow>
              <ChartTitle>Monthly Income vs Expense</ChartTitle>
              <DemoBadge>Demo Data</DemoBadge>
            </TitleRow>
            <ChartSubtitle>
              Comparative financial trajectory and monthly operating margins in BDT
            </ChartSubtitle>
          </TitleBlock>

          <HeaderControls>
            <SegmentedToggle
              options={RANGE_OPTIONS}
              value={range}
              onChange={setRange}
              ariaLabel="Financial analytics time filter"
            />
          </HeaderControls>
        </ChartHeader>

        <SummaryStatsRow>
          <SummaryStatItem>
            <StatLabel>Monthly Avg. Income</StatLabel>
            <StatNumber $variant="primary">{formatCurrency(avgIncome)}</StatNumber>
          </SummaryStatItem>
          <SummaryStatItem>
            <StatLabel>Monthly Avg. Expense</StatLabel>
            <StatNumber $variant="danger">{formatCurrency(avgExpense)}</StatNumber>
          </SummaryStatItem>
          <SummaryStatItem>
            <StatLabel>Monthly Avg. Net Profit</StatLabel>
            <StatNumber $variant="success">{formatCurrency(avgNet)}</StatNumber>
          </SummaryStatItem>
        </SummaryStatsRow>

        <LegendRow>
          <LegendItem>
            <LegendDot $color={theme.colors.primary} />
            <span>Gross Income</span>
          </LegendItem>
          <LegendItem>
            <LegendDot $color={theme.colors.danger} />
            <span>Total Expense</span>
          </LegendItem>
        </LegendRow>

        <ChartCanvasWrapper
          onMouseLeave={() => setHoveredIdx(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }}
        >
          <SvgContainer viewBox={`0 0 ${chartLayout.svgWidth} ${chartLayout.svgHeight}`}>
            {/* Grid Lines */}
            {chartLayout.yTicks.map((tick, idx) => (
              <g key={idx}>
                <line
                  x1={chartLayout.padding.left}
                  y1={tick.y}
                  x2={chartLayout.svgWidth - chartLayout.padding.right}
                  y2={tick.y}
                  stroke={theme.colors.borderSubtle}
                  strokeDasharray={idx === 0 ? "none" : "3,3"}
                />
                <text
                  x={chartLayout.padding.left - 8}
                  y={tick.y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill={theme.colors.textMuted}
                >
                  {formatCompactCurrency(tick.val)}
                </text>
              </g>
            ))}

            {/* Bars */}
            {chartLayout.bars.map((slot, idx) => {
              const isHovered = hoveredIdx === idx;
              return (
                <ChartBarGroup
                  key={slot.month}
                  onMouseEnter={() => setHoveredIdx(idx)}
                >
                  {/* Hover background pillar */}
                  {isHovered && (
                    <rect
                      x={slot.income.x - 6}
                      y={chartLayout.padding.top}
                      width={slot.expense.x + slot.expense.width - slot.income.x + 12}
                      height={chartLayout.svgHeight - chartLayout.padding.top - chartLayout.padding.bottom}
                      fill={theme.colors.hoverSubtle}
                      rx="4"
                    />
                  )}

                  {/* Income Bar */}
                  <rect
                    x={slot.income.x}
                    y={slot.income.y}
                    width={slot.income.width}
                    height={Math.max(2, slot.income.height)}
                    fill={isHovered ? theme.colors.primaryHover : theme.colors.primary}
                    rx="3"
                  />

                  {/* Expense Bar */}
                  <rect
                    x={slot.expense.x}
                    y={slot.expense.y}
                    width={slot.expense.width}
                    height={Math.max(2, slot.expense.height)}
                    fill={isHovered ? theme.colors.dangerHover : theme.colors.danger}
                    rx="3"
                  />

                  {/* Month Label */}
                  <text
                    x={slot.slotCenterX}
                    y={chartLayout.svgHeight - 12}
                    textAnchor="middle"
                    fontSize="11.5"
                    fontWeight={isHovered ? 700 : 500}
                    fill={isHovered ? theme.colors.primary : theme.colors.textMuted}
                  >
                    {slot.month}
                  </text>
                </ChartBarGroup>
              );
            })}
          </SvgContainer>

          {/* Interactive Floating Tooltip */}
          {hoveredItem && (
            <TooltipOverlay $x={tooltipPos.x} $y={tooltipPos.y}>
              <TooltipTitle>{hoveredItem.month} Financials</TooltipTitle>
              <TooltipRow>
                <TooltipLabel>Income:</TooltipLabel>
                <TooltipValue $color={theme.colors.primary}>
                  {formatCurrency(hoveredItem.data.income)}
                </TooltipValue>
              </TooltipRow>
              <TooltipRow>
                <TooltipLabel>Expense:</TooltipLabel>
                <TooltipValue $color={theme.colors.danger}>
                  {formatCurrency(hoveredItem.data.expense)}
                </TooltipValue>
              </TooltipRow>
              <TooltipRow>
                <TooltipLabel>Net Margin:</TooltipLabel>
                <TooltipValue $color={hoveredItem.data.netProfit >= 0 ? theme.colors.success : theme.colors.danger}>
                  {formatCurrency(hoveredItem.data.netProfit)}
                </TooltipValue>
              </TooltipRow>
            </TooltipOverlay>
          )}
        </ChartCanvasWrapper>
      </ChartCard>

      {/* Profit & Loss Summary Card */}
      <PnLCard>
        <PnLHeader>
          <PnLTitle>Profit &amp; Loss Statement</PnLTitle>
          <PnLSubtitle>Fiscal period operational performance summary</PnLSubtitle>
        </PnLHeader>

        <PnLSection>
          <PnLSectionTitle>Revenue &amp; Inflows</PnLSectionTitle>
          <PnLRow>
            <PnLLabel>POS Hardware Sales</PnLLabel>
            <PnLValue>{formatCurrency(totalRevenue * 0.94)}</PnLValue>
          </PnLRow>
          <PnLRow>
            <PnLLabel>Services &amp; Maintenance</PnLLabel>
            <PnLValue>{formatCurrency(totalRevenue * 0.06)}</PnLValue>
          </PnLRow>
          <PnLRow>
            <PnLLabel $bold>Total Gross Inflow</PnLLabel>
            <PnLValue $bold>{formatCurrency(totalRevenue)}</PnLValue>
          </PnLRow>
        </PnLSection>

        <PnLSection>
          <PnLSectionTitle>Operating Expenses &amp; COGS</PnLSectionTitle>
          <PnLRow>
            <PnLLabel>Inventory Procurement</PnLLabel>
            <PnLValue>{formatCurrency(totalExpenses * 0.78)}</PnLValue>
          </PnLRow>
          <PnLRow>
            <PnLLabel>Shop Rent &amp; Multiplan Utilities</PnLLabel>
            <PnLValue>{formatCurrency(totalExpenses * 0.12)}</PnLValue>
          </PnLRow>
          <PnLRow>
            <PnLLabel>Staff Salaries &amp; Logistics</PnLLabel>
            <PnLValue>{formatCurrency(totalExpenses * 0.10)}</PnLValue>
          </PnLRow>
        </PnLSection>

        <PnLDivider />

        <PnLTotalRow>
          <PnLTotalLabel>
            <span>Net Operating Margin</span>
            <PnLMarginSubtext>
              ({netMarginPercent}% overall profitability)
            </PnLMarginSubtext>
          </PnLTotalLabel>
          <PnLTotalValue $isPositive={netOperatingProfit >= 0}>
            {formatCurrency(netOperatingProfit)}
          </PnLTotalValue>
        </PnLTotalRow>

        {/* Operating Expense Distribution */}
        {categoryExpenses.length > 0 && (
          <PnLBreakdownSection>
            <PnLSectionTitle>Operating Expense Breakdown</PnLSectionTitle>
            <CategoryProgressList>
              {categoryExpenses.slice(0, 4).map((cat) => (
                <CategoryProgressItem key={cat.name}>
                  <CategoryProgressHeader>
                    <CategoryProgressName>{cat.name}</CategoryProgressName>
                    <CategoryProgressAmount>
                      {formatCurrency(cat.amount)} ({cat.percentage}%)
                    </CategoryProgressAmount>
                  </CategoryProgressHeader>
                  <CategoryProgressBar>
                    <CategoryProgressFill
                      $percentage={cat.percentage}
                      $color={
                        cat.percentage > 35
                          ? theme.colors.danger
                          : cat.percentage > 20
                            ? theme.colors.warning
                            : theme.colors.primary
                      }
                    />
                  </CategoryProgressBar>
                </CategoryProgressItem>
              ))}
            </CategoryProgressList>
          </PnLBreakdownSection>
        )}
      </PnLCard>
    </AnalyticsGrid>
  );
};
