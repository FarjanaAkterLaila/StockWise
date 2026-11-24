import { useState, useMemo, useEffect, useCallback } from "react";
import type {
  Expense,
  IncomeSource,
  CustomerPaymentRecord,
  SupplierPaymentRecord,
  MonthlyFinancialSummary,
} from "@/types";
import { ACCOUNTS_TABS, type AccountsTabId } from "@/utils/constants";
import { calculateAccountsOverview } from "@/utils/accounts.utils";
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  fetchCustomerPayments,
  fetchSupplierPayments,
  fetchTotalPurchasePayable,
} from "@/services/accounts.service";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export const useAccounts = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<AccountsTabId>(
    ACCOUNTS_TABS.ANALYTICS,
  );

  const [isCreateExpenseOpen, setIsCreateExpenseOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customerPayments, setCustomerPayments] = useState<
    CustomerPaymentRecord[]
  >([]);
  const [supplierPayments, setSupplierPayments] = useState<
    SupplierPaymentRecord[]
  >([]);
  const [totalPurchasePayable, setTotalPurchasePayable] = useState(0);

  const reloadAccounts = useCallback(async (): Promise<boolean> => {
    try {
      const [expData, custPayData, suppPayData, payableData] = await Promise.all([
        fetchExpenses(),
        fetchCustomerPayments(),
        fetchSupplierPayments(),
        fetchTotalPurchasePayable(),
      ]);
      setExpenses(expData);
      setCustomerPayments(custPayData);
      setSupplierPayments(suppPayData);
      setTotalPurchasePayable(payableData);
      setLoadError(null);
      return true;
    } catch (err: unknown) {
      setLoadError((err as Error).message || "Unable to load Accounts data.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void reloadAccounts(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [reloadAccounts]);

  const retryLoad = useCallback(() => {
    setLoading(true);
    return reloadAccounts();
  }, [reloadAccounts]);

  const incomes = useMemo(() => {
    return customerPayments.map((cp) => ({
      id: cp.id,
      source: "POS Sales" as IncomeSource,
      referenceNumber: cp.referenceNumber || cp.invoiceNumber,
      date: cp.date,
      amount: cp.paidAmount,
      paymentMethod: cp.paymentMethod,
      payerName: cp.customerName,
      description: cp.notes || `Payment for invoice ${cp.invoiceNumber}`,
    }));
  }, [customerPayments]);

  const monthlyFinancials = useMemo<MonthlyFinancialSummary[]>(() => {
    const now = new Date();
    const result: MonthlyFinancialSummary[] = [];

    for (let i = 11; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}`;
      const monthShort = targetDate.toLocaleString("en-US", { month: "short" });
      const monthFull = targetDate.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });

      const monthIncome = customerPayments
        .filter((cp) => (cp.date || "").slice(0, 7) === yearMonth)
        .reduce((sum, cp) => sum + (Number(cp.paidAmount) || 0), 0);

      const monthExpenses =
        expenses
          .filter((e) => (e.date || "").slice(0, 7) === yearMonth)
          .reduce((sum, e) => sum + (Number(e.amount) || 0), 0) +
        supplierPayments
          .filter((sp) => (sp.date || "").slice(0, 7) === yearMonth)
          .reduce((sum, sp) => sum + (Number(sp.paidAmount) || 0), 0);

      const netProfit = monthIncome - monthExpenses;
      const marginPercentage =
        monthIncome > 0 ? Math.round((netProfit / monthIncome) * 100) : 0;

      result.push({
        month: monthShort,
        monthFull,
        income: monthIncome,
        expense: monthExpenses,
        netProfit,
        marginPercentage,
      });
    }

    return result;
  }, [customerPayments, expenses, supplierPayments]);

  const overviewMetrics = useMemo(() => {
    return calculateAccountsOverview(customerPayments, expenses, supplierPayments, totalPurchasePayable);
  }, [customerPayments, expenses, supplierPayments, totalPurchasePayable]);

  const handleSaveExpense = async (newOrUpdatedExpense: Expense): Promise<boolean> => {
    try {
      const isEditing = Boolean(newOrUpdatedExpense.id);
      const saved = isEditing
        ? await updateExpense(newOrUpdatedExpense.id, newOrUpdatedExpense)
        : await createExpense(newOrUpdatedExpense, user?.id);
      setExpenses((prev) => isEditing
        ? prev.map((expense) => expense.id === saved.id ? saved : expense)
        : [saved, ...prev]);
      void reloadAccounts();
      if (isEditing) {
        showSuccess(
          "Expense Updated",
          `"${newOrUpdatedExpense.title}" voucher updated.`,
        );
      } else {
        showSuccess(
          "Expense Recorded",
          `"${newOrUpdatedExpense.title}" voucher saved.`,
        );
      }
      return true;
    } catch (err: unknown) {
      showError(
        "Expense Failed",
        (err as Error).message || "Failed to save expense in database",
      );
      return false;
    }
  };

  const handleDeleteExpense = async (expenseId: string): Promise<boolean> => {
    try {
      await deleteExpense(expenseId);
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      void reloadAccounts();
      showSuccess("Expense Deleted", "Expense voucher removed successfully.");
      return true;
    } catch (err: unknown) {
      showError(
        "Delete Failed",
        (err as Error).message || "Failed to delete expense from database",
      );
      return false;
    }
  };

  const handleOpenRecordExpense = () => {
    setIsCreateExpenseOpen(true);
  };

  const handleCloseRecordExpense = () => {
    setIsCreateExpenseOpen(false);
  };

  return {
    loading,
    loadError,
    retryLoad,
    activeTab,
    setActiveTab,
    isCreateExpenseOpen,
    expenses,
    incomes,
    customerPayments,
    supplierPayments,
    monthlyFinancials,
    overviewMetrics,
    handleSaveExpense,
    handleDeleteExpense,
    handleOpenRecordExpense,
    handleCloseRecordExpense,
  };
};
