import React from "react";
import { useTheme } from "styled-components";
import type { MonthlyFinancialSummary, Expense } from "@/types";
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
  totalIncome?: number;
  totalExpenses?: number;
  totalPurchasePayments?: number;
}

const RANGE_OPTIONS = [
  { value: "6m" as const, label: "6 Months" },
  { value: "12m" as const, label: "12 Months" },
];

export const FinancialAnalytics: React.FC<FinancialAnalyticsProps> = ({
  monthlyData = [],
  expenses = [],
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
    periodTotals,
    categoryExpenses,
    chartLayout,
    hoveredItem,
  } = useFinancialAnalytics(monthlyData, expenses);

  const rangeLabel = range === "6m" ? "Last 6 months" : "Last 12 months";

  return (
    <AnalyticsGrid>
      {/* Monthly Bar Chart */}
      <ChartCard>
        <ChartHeader>
          <TitleBlock>
            <TitleRow>
              <ChartTitle>Monthly Income vs Expense</ChartTitle>
            </TitleRow>
            <ChartSubtitle>
              Comparative financial trajectory and monthly operating margins in
              BDT
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
            <StatNumber $variant="primary">
              {formatCurrency(avgIncome)}
            </StatNumber>
          </SummaryStatItem>
          <SummaryStatItem>
            <StatLabel>Monthly Avg. Expense</StatLabel>
            <StatNumber $variant="danger">
              {formatCurrency(avgExpense)}
            </StatNumber>
          </SummaryStatItem>
          <SummaryStatItem>
            <StatLabel>Monthly Avg. Net Cash</StatLabel>
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
            setTooltipPos({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            });
          }}
        >
          <SvgContainer
            viewBox={`0 0 ${chartLayout.svgWidth} ${chartLayout.svgHeight}`}
          >
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

            {chartLayout.bars.map((slot, idx) => {
              const isHovered = hoveredIdx === idx;
              return (
                <ChartBarGroup
                  key={slot.month}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onTouchStart={(e) => {
                    setHoveredIdx(idx);
                    const rect = e.currentTarget
                      .closest("svg")
                      ?.getBoundingClientRect();
                    if (rect) {
                      const scaleX = rect.width / chartLayout.svgWidth;
                      const scaleY = rect.height / chartLayout.svgHeight;
                      setTooltipPos({
                        x: slot.slotCenterX * scaleX,
                        y: Math.min(slot.income.y, slot.expense.y) * scaleY,
                      });
                    }
                  }}
                  onClick={() => setHoveredIdx(idx)}
                >
                  {isHovered && (
                    <rect
                      x={slot.income.x - 6}
                      y={chartLayout.padding.top}
                      width={
                        slot.expense.x + slot.expense.width - slot.income.x + 12
                      }
                      height={
                        chartLayout.svgHeight -
                        chartLayout.padding.top -
                        chartLayout.padding.bottom
                      }
                      fill={theme.colors.hoverSubtle}
                      rx="4"
                    />
                  )}

                  <rect
                    x={slot.income.x}
                    y={slot.income.y}
                    width={slot.income.width}
                    height={Math.max(2, slot.income.height)}
                    fill={
                      isHovered
                        ? theme.colors.primaryHover
                        : theme.colors.primary
                    }
                    rx="3"
                  />

                  <rect
                    x={slot.expense.x}
                    y={slot.expense.y}
                    width={slot.expense.width}
                    height={Math.max(2, slot.expense.height)}
                    fill={
                      isHovered ? theme.colors.dangerHover : theme.colors.danger
                    }
                    rx="3"
                  />

                  <text
                    x={slot.slotCenterX}
                    y={chartLayout.svgHeight - 12}
                    textAnchor="middle"
                    fontSize="11.5"
                    fontWeight={isHovered ? 700 : 500}
                    fill={
                      isHovered ? theme.colors.primary : theme.colors.textMuted
                    }
                  >
                    {slot.month}
                  </text>
                </ChartBarGroup>
              );
            })}
          </SvgContainer>

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
                <TooltipLabel>Net Cash Flow:</TooltipLabel>
                <TooltipValue
                  $color={
                    hoveredItem.data.netProfit >= 0
                      ? theme.colors.success
                      : theme.colors.danger
                  }
                >
                  {formatCurrency(hoveredItem.data.netProfit)}
                </TooltipValue>
              </TooltipRow>
            </TooltipOverlay>
          )}
        </ChartCanvasWrapper>
      </ChartCard>

      <PnLCard>
        <PnLHeader>
          <PnLTitle>Cash Flow Summary</PnLTitle>
          <PnLSubtitle>
            {rangeLabel} cash inflows and outflows
          </PnLSubtitle>
        </PnLHeader>

        <PnLSection>
          <PnLSectionTitle>Cash Inflows</PnLSectionTitle>
          <PnLRow>
            <PnLLabel>Received Sales Payments</PnLLabel>
            <PnLValue>{formatCurrency(periodTotals.periodIncome)}</PnLValue>
          </PnLRow>
          <PnLRow>
            <PnLLabel $bold>Total Cash Received</PnLLabel>
            <PnLValue $bold>{formatCurrency(periodTotals.periodIncome)}</PnLValue>
          </PnLRow>
        </PnLSection>

        <PnLSection>
          <PnLSectionTitle>Supplier Cash Outflows</PnLSectionTitle>
          <PnLRow>
            <PnLLabel>Supplier payments recorded</PnLLabel>
            <PnLValue>{formatCurrency(periodTotals.periodPurchasePayments)}</PnLValue>
          </PnLRow>
        </PnLSection>

        <PnLSection>
          <PnLSectionTitle>Operating Expenses</PnLSectionTitle>
          {categoryExpenses && categoryExpenses.length > 0 ? (
            categoryExpenses.map((cat) => (
              <PnLRow key={cat.name}>
                <PnLLabel>{cat.name}</PnLLabel>
                <PnLValue>{formatCurrency(cat.amount)}</PnLValue>
              </PnLRow>
            ))
          ) : (
            <PnLRow>
              <PnLLabel>Operational Outflow</PnLLabel>
              <PnLValue>{formatCurrency(periodTotals.periodOperatingExpenses)}</PnLValue>
            </PnLRow>
          )}
          <PnLRow>
            <PnLLabel $bold>Total Operating Expenses</PnLLabel>
            <PnLValue $bold>{formatCurrency(periodTotals.periodOperatingExpenses)}</PnLValue>
          </PnLRow>
        </PnLSection>

        <PnLDivider />

        <PnLTotalRow>
          <PnLTotalLabel>
            <span>Net Cash Flow</span>
            <PnLMarginSubtext>
              ({periodTotals.periodCashMarginPercent}% net cash margin • {range})
            </PnLMarginSubtext>
          </PnLTotalLabel>
          <PnLTotalValue $isPositive={periodTotals.periodNetCashFlow >= 0}>
            {formatCurrency(periodTotals.periodNetCashFlow)}
          </PnLTotalValue>
        </PnLTotalRow>

        {categoryExpenses.length > 0 && (
          <PnLBreakdownSection>
            <PnLSectionTitle>Operating Expense Breakdown ({range})</PnLSectionTitle>
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
