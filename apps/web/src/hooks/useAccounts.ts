import { useState, useMemo, useEffect, useCallback } from "react";
import type {
  Expense,
  IncomeSource,
  CustomerPaymentRecord,
  SupplierPaymentRecord,
  MonthlyFinancialSummary,
} from "@/types";
import { ACCOUNTS_TABS, type AccountsTabId } from "@/utils/constants";
import {
  calculateAccountsOverview,
  getRecentMonthBuckets,
  toLocalDateKey,
} from "@/utils/accounts.utils";
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  fetchCustomerPayments,
  fetchSupplierPayments,
  fetchTotalPurchasePayable,
  fetchTotalSalesReceivable,
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
  const [totalSalesReceivable, setTotalSalesReceivable] = useState(0);

  const reloadAccounts = useCallback(async (): Promise<boolean> => {
    try {
      const [expData, custPayData, suppPayData, payableData, receivableData] = await Promise.all([
        fetchExpenses(),
        fetchCustomerPayments(),
        fetchSupplierPayments(),
        fetchTotalPurchasePayable(),
        fetchTotalSalesReceivable(),
      ]);
      setExpenses(expData);
      setCustomerPayments(custPayData);
      setSupplierPayments(suppPayData);
      setTotalPurchasePayable(payableData);
      setTotalSalesReceivable(receivableData);
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
    return getRecentMonthBuckets(12).map(({ yearMonth, monthShort, monthFull }) => {
      const monthIncome = customerPayments
        .filter((cp) => toLocalDateKey(cp.date).slice(0, 7) === yearMonth)
        .reduce((sum, cp) => sum + (Number(cp.paidAmount) || 0), 0);

      const operatingExpense = expenses
        .filter((e) => toLocalDateKey(e.date).slice(0, 7) === yearMonth)
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

      const purchaseExpense = supplierPayments
        .filter((sp) => toLocalDateKey(sp.date).slice(0, 7) === yearMonth)
        .reduce((sum, sp) => sum + (Number(sp.paidAmount) || 0), 0);

      const monthExpenses = operatingExpense + purchaseExpense;
      const netCashFlow = monthIncome - monthExpenses;
      const marginPercentage =
        monthIncome > 0 ? Math.round((netCashFlow / monthIncome) * 100) : 0;

      return {
        yearMonth,
        month: monthShort,
        monthFull,
        income: monthIncome,
        expense: monthExpenses,
        operatingExpense,
        purchaseExpense,
        netProfit: netCashFlow,
        marginPercentage,
      };
    });
  }, [customerPayments, expenses, supplierPayments]);

  const overviewMetrics = useMemo(() => {
    return calculateAccountsOverview(
      customerPayments,
      expenses,
      supplierPayments,
      totalPurchasePayable,
      totalSalesReceivable,
    );
  }, [customerPayments, expenses, supplierPayments, totalPurchasePayable, totalSalesReceivable]);

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
