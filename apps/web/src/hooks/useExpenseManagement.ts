import { useState, useMemo } from "react";
import type { Expense } from "@/types";
import { DEFAULT_VALUES } from "@/utils/constants";
import { isWithinDateRange } from "@/utils/accounts.utils";

export const useExpenseManagement = (
  expenses: Expense[],
  onDeleteExpense?: (expenseId: string) => Promise<boolean>,
) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    DEFAULT_VALUES.FILTER_ALL,
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(
    DEFAULT_VALUES.FILTER_ALL,
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === DEFAULT_VALUES.FILTER_ALL ||
        item.category === selectedCategory;

      const matchesMethod =
        selectedPaymentMethod === DEFAULT_VALUES.FILTER_ALL ||
        item.paymentMethod === selectedPaymentMethod;

      const matchesDate = isWithinDateRange(item.date, dateFrom, dateTo);

      return matchesSearch && matchesCategory && matchesMethod && matchesDate;
    });
  }, [expenses, searchTerm, selectedCategory, selectedPaymentMethod, dateFrom, dateTo]);

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
      selectedCategory !== DEFAULT_VALUES.FILTER_ALL ||
      selectedPaymentMethod !== DEFAULT_VALUES.FILTER_ALL ||
      dateFrom || dateTo,
  );

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory(DEFAULT_VALUES.FILTER_ALL);
    setSelectedPaymentMethod(DEFAULT_VALUES.FILTER_ALL);
    setDateFrom("");
    setDateTo("");
  };

  const handleConfirmDelete = async () => {
    if (deletingExpense && onDeleteExpense) {
      if (await onDeleteExpense(deletingExpense.id)) setDeletingExpense(null);
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    editingExpense,
    setEditingExpense,
    viewingExpense,
    setViewingExpense,
    deletingExpense,
    setDeletingExpense,
    filteredExpenses,
    hasActiveFilters,
    handleResetFilters,
    handleConfirmDelete,
  };
};
