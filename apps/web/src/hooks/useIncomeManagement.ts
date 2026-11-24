import { useState, useMemo } from "react";
import type { Income } from "@/types";
import { DEFAULT_VALUES } from "@/utils/constants";
import { isWithinDateRange } from "@/utils/accounts.utils";

export const useIncomeManagement = (incomes: Income[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSource, setSelectedSource] = useState<string>(
    DEFAULT_VALUES.FILTER_ALL,
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>(
    DEFAULT_VALUES.FILTER_ALL,
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [viewingIncome, setViewingIncome] = useState<Income | null>(null);

  const filteredIncomes = useMemo(() => {
    return incomes.filter((item) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.referenceNumber.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        (item.payerName && item.payerName.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q));

      const matchesSource =
        selectedSource === DEFAULT_VALUES.FILTER_ALL ||
        item.source === selectedSource;

      const matchesMethod =
        selectedPaymentMethod === DEFAULT_VALUES.FILTER_ALL ||
        item.paymentMethod === selectedPaymentMethod;

      const matchesDate = isWithinDateRange(item.date, dateFrom, dateTo);

      return matchesSearch && matchesSource && matchesMethod && matchesDate;
    });
  }, [incomes, searchTerm, selectedSource, selectedPaymentMethod, dateFrom, dateTo]);

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
      selectedSource !== DEFAULT_VALUES.FILTER_ALL ||
      selectedPaymentMethod !== DEFAULT_VALUES.FILTER_ALL ||
      dateFrom || dateTo,
  );

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedSource(DEFAULT_VALUES.FILTER_ALL);
    setSelectedPaymentMethod(DEFAULT_VALUES.FILTER_ALL);
    setDateFrom("");
    setDateTo("");
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedSource,
    setSelectedSource,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    viewingIncome,
    setViewingIncome,
    filteredIncomes,
    hasActiveFilters,
    handleResetFilters,
  };
};
