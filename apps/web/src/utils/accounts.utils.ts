import type {
  CustomerPaymentRecord,
  SupplierPaymentRecord,
  Expense,
  Income,
  IncomeSource,
  ExpenseCategory,
  MonthlyFinancialSummary,
} from "@/types";
import type { TableColumn } from "@/components/common/DataTable";
import {
  Banknote,
  CreditCard,
  Building2,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

export const CUSTOMER_PAYMENT_COLUMNS: TableColumn[] = [
  { label: "Customer & Contact" },
  { label: "Type" },
  { label: "Invoice Number" },
  { label: "Date" },
  { label: "Payment Method" },
  { label: "Total Bill" },
  { label: "Paid Amount" },
  { label: "Outstanding Due" },
  { label: "Payment Status" },
  { label: "Actions", align: "right" },
];

export const SUPPLIER_PAYMENT_COLUMNS: TableColumn[] = [
  { label: "Distributor / Supplier" },
  { label: "PO Number" },
  { label: "Date" },
  { label: "Payment Method" },
  { label: "Total Order Bill" },
  { label: "Paid Amount" },
  { label: "Outstanding Due" },
  { label: "Payment Status" },
  { label: "Actions", align: "right" },
];

export const EXPENSE_COLUMNS: TableColumn[] = [
  { label: "Expense & Reference" },
  { label: "Category" },
  { label: "Date" },
  { label: "Amount" },
  { label: "Payment Method" },
  { label: "Paid To / Recipient" },
  { label: "Actions", align: "right" },
];

export const INCOME_COLUMNS: TableColumn[] = [
  { label: "Reference & Date" },
  { label: "Income Source" },
  { label: "Payer / Client" },
  { label: "Amount" },
  { label: "Payment Method" },
  { label: "Description / Memo" },
  { label: "Actions", align: "right" },
];

export const PAYMENT_ICON_MAP: Record<string, LucideIcon> = {
  Cash: Banknote,
  Card: CreditCard,
  "Bank Transfer": Building2,
  MFS: Smartphone,
};

export const PAYMENT_STATUS_VARIANT_MAP: Record<
  string,
  "success" | "warning" | "danger"
> = {
  paid: "success",
  partial: "warning",
  unpaid: "danger",
};

export const CATEGORY_VARIANT_MAP: Record<
  ExpenseCategory,
  "neutral" | "primary" | "warning" | "danger" | "info"
> = {
  "Rent & Utilities": "warning",
  "Salaries & Wages": "primary",
  "Shop Operations": "info",
  "Marketing & Ads": "neutral",
  "Logistics & Delivery": "neutral",
  "Maintenance & Repairs": "danger",
  General: "neutral",
};

export const SOURCE_VARIANT_MAP: Record<
  IncomeSource,
  "success" | "primary" | "warning" | "info" | "neutral"
> = {
  "POS Sales": "primary",
  "PC Assembly Service": "success",
  "Hardware Repair & Servicing": "info",
  "Corporate IT Contract": "warning",
  "Recycling & Scrap": "neutral",
  Other: "neutral",
};

export interface AccountsOverviewMetrics {
  totalRevenue: number;
  totalExpenses: number;
  totalReceived: number;
  totalPayable: number;
  netProfit: number;
  marginPercentage: number;
}

export const calculateAccountsOverview = (
  customerPayments: CustomerPaymentRecord[],
  incomes: Income[],
  expenses: Expense[],
  supplierPayments: SupplierPaymentRecord[],
): AccountsOverviewMetrics => {
  const totalPosRevenue = customerPayments.reduce(
    (acc, p) => acc + p.totalAmount,
    0,
  );
  const totalOtherIncome = incomes
    .filter((i) => i.source !== "POS Sales")
    .reduce((acc, i) => acc + i.amount, 0);
  const totalRevenue = totalPosRevenue + totalOtherIncome;

  const totalOperatingExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalPurchaseExpenses = supplierPayments.reduce(
    (acc, p) => acc + p.totalAmount,
    0,
  );
  const totalExpenses = totalOperatingExpenses + totalPurchaseExpenses;

  const totalCustomerCollected = customerPayments.reduce(
    (acc, p) => acc + p.paidAmount,
    0,
  );
  const totalDirectIncome = incomes
    .filter((i) => i.source !== "POS Sales")
    .reduce((acc, i) => acc + i.amount, 0);
  const totalReceived = totalCustomerCollected + totalDirectIncome;

  const totalPayable = supplierPayments.reduce(
    (acc, p) => acc + p.dueAmount,
    0,
  );

  const netProfit = totalRevenue - totalExpenses;
  const marginPercentage =
    totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  return {
    totalRevenue,
    totalExpenses,
    totalReceived,
    totalPayable,
    netProfit,
    marginPercentage,
  };
};

export interface FinancialAverages {
  avgIncome: number;
  avgExpense: number;
  avgNet: number;
}

export const calculateFinancialAverages = (
  activeData: MonthlyFinancialSummary[],
): FinancialAverages => {
  const totalInc = activeData.reduce((acc, d) => acc + d.income, 0);
  const totalExp = activeData.reduce((acc, d) => acc + d.expense, 0);
  const totalN = totalInc - totalExp;
  const len = activeData.length || 1;
  return {
    avgIncome: Math.round(totalInc / len),
    avgExpense: Math.round(totalExp / len),
    avgNet: Math.round(totalN / len),
  };
};

export interface CategoryExpenseBreakdown {
  name: string;
  amount: number;
  percentage: number;
}

export const calculateCategoryExpenses = (
  expenses: Expense[],
): CategoryExpenseBreakdown[] => {
  const categoryMap: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });

  const totalExp = Object.values(categoryMap).reduce((a, b) => a + b, 0) || 1;

  return Object.entries(categoryMap)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: Math.round((amount / totalExp) * 100),
    }))
    .sort((a, b) => b.amount - a.amount);
};

export interface ChartBarData {
  data: MonthlyFinancialSummary;
  month: string;
  slotCenterX: number;
  income: { x: number; y: number; width: number; height: number };
  expense: { x: number; y: number; width: number; height: number };
}

export interface FinancialChartLayout {
  svgWidth: number;
  svgHeight: number;
  padding: { top: number; right: number; bottom: number; left: number };
  yTicks: { val: number; y: number }[];
  bars: ChartBarData[];
}

export const calculateFinancialChartLayout = (
  activeData: MonthlyFinancialSummary[],
): FinancialChartLayout => {
  const svgWidth = 620;
  const svgHeight = 240;
  const padding = { top: 20, right: 15, bottom: 35, left: 55 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  const maxVal = Math.max(
    ...activeData.map((d) => Math.max(d.income, d.expense)),
    1000000,
  );
  const maxY = Math.ceil((maxVal * 1.15) / 1000000) * 1000000;

  const numTicks = 4;
  const yTicks = Array.from({ length: numTicks + 1 }, (_, i) => {
    const val = (maxY / numTicks) * i;
    const y = padding.top + plotHeight - (val / maxY) * plotHeight;
    return { val, y };
  });

  const slotWidth = plotWidth / activeData.length;
  const barWidth = Math.min(22, (slotWidth - 14) / 2);
  const barGap = 4;

  const bars: ChartBarData[] = activeData.map((d, i) => {
    const slotCenterX = padding.left + i * slotWidth + slotWidth / 2;
    const incomeHeight = (d.income / maxY) * plotHeight;
    const expenseHeight = (d.expense / maxY) * plotHeight;

    const incomeX = slotCenterX - barWidth - barGap / 2;
    const incomeY = padding.top + plotHeight - incomeHeight;

    const expenseX = slotCenterX + barGap / 2;
    const expenseY = padding.top + plotHeight - expenseHeight;

    return {
      data: d,
      month: d.month,
      slotCenterX,
      income: { x: incomeX, y: incomeY, width: barWidth, height: incomeHeight },
      expense: { x: expenseX, y: expenseY, width: barWidth, height: expenseHeight },
    };
  });

  return { svgWidth, svgHeight, padding, yTicks, bars };
};

export const generateIncomeReference = (): string => {
  return `INC-SRV-${Math.floor(1000 + Math.random() * 9000)}`;
};

export const generateExpenseReference = (): string => {
  return `EXP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
};
