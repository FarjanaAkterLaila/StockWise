import { useState, useMemo } from "react";
import type { Expense } from "@/types";
import { DEFAULT_VALUES } from "@/utils/constants";

export const useExpenseManagement = (
  expenses: Expense[],
  onDeleteExpense?: (expenseId: string) => void,
) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    DEFAULT_VALUES.FILTER_ALL,
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(
    DEFAULT_VALUES.FILTER_ALL,
  );

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        (item.referenceNumber &&
          item.referenceNumber.toLowerCase().includes(q)) ||
        (item.recipient && item.recipient.toLowerCase().includes(q)) ||
        item.description.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === DEFAULT_VALUES.FILTER_ALL ||
        item.category === selectedCategory;

      const matchesMethod =
        selectedPaymentMethod === DEFAULT_VALUES.FILTER_ALL ||
        item.paymentMethod === selectedPaymentMethod;

      return matchesSearch && matchesCategory && matchesMethod;
    });
  }, [expenses, searchTerm, selectedCategory, selectedPaymentMethod]);

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
      selectedCategory !== DEFAULT_VALUES.FILTER_ALL ||
      selectedPaymentMethod !== DEFAULT_VALUES.FILTER_ALL,
  );

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory(DEFAULT_VALUES.FILTER_ALL);
    setSelectedPaymentMethod(DEFAULT_VALUES.FILTER_ALL);
  };

  const handleConfirmDelete = () => {
    if (deletingExpense && onDeleteExpense) {
      onDeleteExpense(deletingExpense.id);
      setDeletingExpense(null);
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
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
