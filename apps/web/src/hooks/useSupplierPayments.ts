import { useState, useMemo } from "react";
import type { SupplierPaymentRecord } from "@/types";
import { DEFAULT_VALUES } from "@/utils/constants";

export const useSupplierPayments = (payments: SupplierPaymentRecord[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>(
    DEFAULT_VALUES.FILTER_ALL,
  );
  const [viewingPayment, setViewingPayment] =
    useState<SupplierPaymentRecord | null>(null);

  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.supplierName.toLowerCase().includes(q) ||
        item.purchaseNumber.toLowerCase().includes(q);

      const matchesStatus =
        selectedStatus === DEFAULT_VALUES.FILTER_ALL ||
        item.paymentStatus === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [payments, searchTerm, selectedStatus]);

  const hasActiveFilters = Boolean(
    searchTerm.trim() || selectedStatus !== DEFAULT_VALUES.FILTER_ALL,
  );

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedStatus(DEFAULT_VALUES.FILTER_ALL);
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    viewingPayment,
    setViewingPayment,
    filteredPayments,
    hasActiveFilters,
    handleResetFilters,
  };
};
