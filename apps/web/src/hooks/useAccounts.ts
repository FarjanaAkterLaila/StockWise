import { useState, useMemo, useEffect } from "react";
import type {
  Expense,
  Income,
  CustomerPaymentRecord,
  SupplierPaymentRecord,
} from "@/types";
import {
  INITIAL_INCOMES,
} from "@/data/mockData";
import { ACCOUNTS_TABS, type AccountsTabId } from "@/utils/constants";
import { calculateAccountsOverview } from "@/utils/accounts.utils";
import {
  fetchExpenses,
  createExpense,
  deleteExpense,
  fetchCustomerPayments,
  fetchSupplierPayments,
} from "@/services/accounts.service";
import { useAuth } from "@/context/AuthContext";

export const useAccounts = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AccountsTabId>(
    ACCOUNTS_TABS.ANALYTICS,
  );

  const [isCreateExpenseOpen, setIsCreateExpenseOpen] = useState(false);
  const [isCreateIncomeOpen, setIsCreateIncomeOpen] = useState(false);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>(INITIAL_INCOMES);
  const [customerPayments, setCustomerPayments] = useState<
    CustomerPaymentRecord[]
  >([]);
  const [supplierPayments, setSupplierPayments] = useState<
    SupplierPaymentRecord[]
  >([]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetchExpenses().catch(() => []),
      fetchCustomerPayments().catch(() => []),
      fetchSupplierPayments().catch(() => []),
    ]).then(([expData, custPayData, suppPayData]) => {
      if (!isMounted) return;
      setExpenses(expData);
      setCustomerPayments(custPayData);
      setSupplierPayments(suppPayData);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const overviewMetrics = useMemo(() => {
    return calculateAccountsOverview(
      customerPayments,
      incomes,
      expenses,
      supplierPayments,
    );
  }, [customerPayments, incomes, expenses, supplierPayments]);

  const handleSaveExpense = async (newOrUpdatedExpense: Expense) => {
    try {
      await createExpense(newOrUpdatedExpense, user?.id);
      const updated = await fetchExpenses();
      setExpenses(updated);
    } catch (err: unknown) {
      alert((err as Error).message || "Failed to save expense in database");
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteExpense(expenseId);
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    } catch (err: unknown) {
      alert((err as Error).message || "Failed to delete expense from database");
    }
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
