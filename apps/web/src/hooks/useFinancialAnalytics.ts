import { useState, useMemo } from "react";
import type { MonthlyFinancialSummary, Expense } from "@/types";
import {
  calculateFinancialAverages,
  calculateCategoryExpenses,
  calculateFinancialChartLayout,
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

  const categoryExpenses = useMemo(() => {
    return calculateCategoryExpenses(expenses);
  }, [expenses]);

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
    categoryExpenses,
    chartLayout,
    hoveredItem,
    handleBarMouseMove,
    handleBarMouseLeave,
  };
};
