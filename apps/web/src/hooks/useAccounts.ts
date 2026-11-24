import { useState, useMemo, useEffect } from "react";
import type {
  Expense,
  Income,
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
  createIncome,
  fetchCustomerPayments,
  fetchSupplierPayments,
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
  const [isCreateIncomeOpen, setIsCreateIncomeOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [expenses, setExpenses] = useState<Expense[]>([]);
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
    ])
      .then(([expData, custPayData, suppPayData]) => {
        if (!isMounted) return;
        setExpenses(expData);
        setCustomerPayments(custPayData);
        setSupplierPayments(suppPayData);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const incomes = useMemo(() => {
    return customerPayments.map((cp) => ({
      id: cp.id,
      source: "POS Sales" as IncomeSource,
      referenceNumber: cp.invoiceNumber,
      date: cp.date,
      amount: cp.paidAmount,
      paymentMethod: cp.paymentMethod,
      payerName: cp.customerName,
      description: `Payment for invoice ${cp.invoiceNumber}`,
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
    return calculateAccountsOverview(
      customerPayments,
      incomes,
      expenses,
      supplierPayments,
    );
  }, [customerPayments, incomes, expenses, supplierPayments]);

  const handleSaveExpense = async (newOrUpdatedExpense: Expense) => {
    try {
      if (newOrUpdatedExpense.id) {
        await updateExpense(newOrUpdatedExpense.id, newOrUpdatedExpense);
        showSuccess(
          "Expense Updated",
          `"${newOrUpdatedExpense.title}" voucher updated.`,
        );
      } else {
        await createExpense(newOrUpdatedExpense, user?.id);
        showSuccess(
          "Expense Recorded",
          `"${newOrUpdatedExpense.title}" voucher saved.`,
        );
      }
      const updated = await fetchExpenses();
      setExpenses(updated);
    } catch (err: unknown) {
      showError(
        "Expense Failed",
        (err as Error).message || "Failed to save expense in database",
      );
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteExpense(expenseId);
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      showSuccess("Expense Deleted", "Expense voucher removed successfully.");
    } catch (err: unknown) {
      showError(
        "Delete Failed",
        (err as Error).message || "Failed to delete expense from database",
      );
    }
  };

  const handleSaveIncome = async (newIncome: Income) => {
    try {
      await createIncome(newIncome, user?.id);
      const updated = await fetchCustomerPayments();
      setCustomerPayments(updated);
      showSuccess(
        "Income Recorded",
        `Direct income from "${newIncome.source}" saved.`,
      );
    } catch (err: unknown) {
      showError(
        "Income Failed",
        (err as Error).message || "Failed to save income in database",
      );
    }
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
    loading,
    activeTab,
    setActiveTab,
    isCreateExpenseOpen,
    isCreateIncomeOpen,
    expenses,
    incomes,
    customerPayments,
    supplierPayments,
    monthlyFinancials,
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
