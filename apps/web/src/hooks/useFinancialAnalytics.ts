import { useState, useMemo } from "react";
import type { MonthlyFinancialSummary, Expense } from "@/types";
import {
  calculateFinancialAverages,
  calculateCategoryExpenses,
  calculateFinancialChartLayout,
  toLocalDateKey,
} from "@/utils/accounts.utils";

export const useFinancialAnalytics = (
  monthlyData: MonthlyFinancialSummary[],
  expenses: Expense[] = [],
) => {
  const [range, setRange] = useState<"6m" | "12m">("6m");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const activeData = useMemo(() => {
    return range === "6m" ? monthlyData.slice(-6) : monthlyData;
  }, [monthlyData, range]);

  const { avgIncome, avgExpense, avgNet } = useMemo(() => {
    return calculateFinancialAverages(activeData);
  }, [activeData]);

  const periodTotals = useMemo(() => {
    const periodIncome = activeData.reduce((sum, d) => sum + d.income, 0);
    const periodOperatingExpenses = activeData.reduce(
      (sum, d) => sum + (d.operatingExpense ?? d.expense),
      0,
    );
    const periodPurchasePayments = activeData.reduce(
      (sum, d) => sum + (d.purchaseExpense ?? 0),
      0,
    );
    const periodNetCashFlow =
      periodIncome - periodOperatingExpenses - periodPurchasePayments;
    const periodCashMarginPercent =
      periodIncome > 0
        ? Math.round((periodNetCashFlow / periodIncome) * 100)
        : 0;
    return {
      periodIncome,
      periodOperatingExpenses,
      periodPurchasePayments,
      periodNetCashFlow,
      periodCashMarginPercent,
    };
  }, [activeData]);

  const categoryExpenses = useMemo(() => {
    const activeMonths = new Set(
      activeData.map((d) => d.yearMonth).filter((m): m is string => Boolean(m)),
    );
    const periodExpenses =
      activeMonths.size > 0
        ? expenses.filter((exp) =>
            activeMonths.has(toLocalDateKey(exp.date).slice(0, 7)),
          )
        : expenses;
    return calculateCategoryExpenses(periodExpenses);
  }, [activeData, expenses]);

  const chartLayout = useMemo(() => {
    return calculateFinancialChartLayout(activeData);
  }, [activeData]);

  const hoveredItem = hoveredIdx !== null ? chartLayout.bars[hoveredIdx] : null;

  const handleBarMouseMove = (e: React.MouseEvent, index: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setHoveredIdx(index);
  };

  const handleBarMouseLeave = () => {
    setHoveredIdx(null);
  };

  return {
    range,
    setRange,
    hoveredIdx,
    setHoveredIdx,
    tooltipPos,
    setTooltipPos,
    activeData,
    avgIncome,
    avgExpense,
    avgNet,
    periodTotals,
    categoryExpenses,
    chartLayout,
    hoveredItem,
    handleBarMouseMove,
    handleBarMouseLeave,
  };
};
