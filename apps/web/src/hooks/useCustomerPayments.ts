import { useState, useMemo } from "react";
import type { CustomerPaymentRecord } from "@/types";
import { DEFAULT_VALUES } from "@/utils/constants";
import { isWithinDateRange } from "@/utils/accounts.utils";

export const useCustomerPayments = (payments: CustomerPaymentRecord[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>(
    DEFAULT_VALUES.FILTER_ALL,
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewingPayment, setViewingPayment] =
    useState<CustomerPaymentRecord | null>(null);

  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.customerName.toLowerCase().includes(q) ||
        item.invoiceNumber.toLowerCase().includes(q) ||
        (item.referenceNumber && item.referenceNumber.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q)) ||
        (item.customerPhone && item.customerPhone.toLowerCase().includes(q));

      const matchesStatus =
        selectedStatus === DEFAULT_VALUES.FILTER_ALL ||
        item.paymentStatus === selectedStatus;

      const matchesDate = isWithinDateRange(item.date, dateFrom, dateTo);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [payments, searchTerm, selectedStatus, dateFrom, dateTo]);

  const hasActiveFilters = Boolean(
    searchTerm.trim() || selectedStatus !== DEFAULT_VALUES.FILTER_ALL || dateFrom || dateTo,
  );

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedStatus(DEFAULT_VALUES.FILTER_ALL);
    setDateFrom("");
    setDateTo("");
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    viewingPayment,
    setViewingPayment,
    filteredPayments,
    hasActiveFilters,
    handleResetFilters,
  };
};
