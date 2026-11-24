import { useState, useMemo } from "react";
import type { CustomerPaymentRecord } from "@/types";
import { DEFAULT_VALUES } from "@/utils/constants";

export const useCustomerPayments = (payments: CustomerPaymentRecord[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>(
    DEFAULT_VALUES.FILTER_ALL,
  );
  const [viewingPayment, setViewingPayment] =
    useState<CustomerPaymentRecord | null>(null);

  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.customerName.toLowerCase().includes(q) ||
        item.invoiceNumber.toLowerCase().includes(q) ||
        (item.customerPhone && item.customerPhone.toLowerCase().includes(q));

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
