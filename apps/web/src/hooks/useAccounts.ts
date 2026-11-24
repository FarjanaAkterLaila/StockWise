import { useState, useMemo } from "react";
import type {
  Expense,
  Income,
  CustomerPaymentRecord,
  SupplierPaymentRecord,
} from "@/types";
import {
  INITIAL_EXPENSES,
  INITIAL_INCOMES,
  INITIAL_CUSTOMER_PAYMENTS,
  INITIAL_SUPPLIER_PAYMENTS,
} from "@/data/mockData";
import { ACCOUNTS_TABS, type AccountsTabId } from "@/utils/constants";
import { calculateAccountsOverview } from "@/utils/accounts.utils";

export const useAccounts = () => {
  const [activeTab, setActiveTab] = useState<AccountsTabId>(
    ACCOUNTS_TABS.ANALYTICS,
  );

  const [isCreateExpenseOpen, setIsCreateExpenseOpen] = useState(false);
  const [isCreateIncomeOpen, setIsCreateIncomeOpen] = useState(false);

  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [incomes, setIncomes] = useState<Income[]>(INITIAL_INCOMES);
  const [customerPayments] = useState<CustomerPaymentRecord[]>(
    INITIAL_CUSTOMER_PAYMENTS,
  );
  const [supplierPayments] = useState<SupplierPaymentRecord[]>(
    INITIAL_SUPPLIER_PAYMENTS,
  );

  const overviewMetrics = useMemo(() => {
    return calculateAccountsOverview(
      customerPayments,
      incomes,
      expenses,
      supplierPayments,
    );
  }, [customerPayments, incomes, expenses, supplierPayments]);

  const handleSaveExpense = (newOrUpdatedExpense: Expense) => {
    setExpenses((prev) => {
      const exists = prev.some((e) => e.id === newOrUpdatedExpense.id);
      if (exists) {
        return prev.map((e) =>
          e.id === newOrUpdatedExpense.id ? newOrUpdatedExpense : e,
        );
      }
      return [newOrUpdatedExpense, ...prev];
    });
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
  };

  const handleSaveIncome = (newIncome: Income) => {
    setIncomes((prev) => [newIncome, ...prev]);
  };

  const handleOpenRecordExpense = () => {
    setIsCreateExpenseOpen(true);
  };

  const handleOpenRecordIncome = () => {
    setIsCreateIncomeOpen(true);
  };

  const handleCloseRecordExpense = () => {
    setIsCreateExpenseOpen(false);
  };

  const handleCloseRecordIncome = () => {
    setIsCreateIncomeOpen(false);
  };

  return {
    activeTab,
    setActiveTab,
    isCreateExpenseOpen,
    isCreateIncomeOpen,
    expenses,
    incomes,
    customerPayments,
    supplierPayments,
    overviewMetrics,
    handleSaveExpense,
    handleDeleteExpense,
    handleSaveIncome,
    handleOpenRecordExpense,
    handleOpenRecordIncome,
    handleCloseRecordExpense,
    handleCloseRecordIncome,
  };
};
