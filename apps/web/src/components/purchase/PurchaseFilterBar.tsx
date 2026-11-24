import React, { useState, useEffect } from "react";
import { Search, RotateCcw } from "lucide-react";
import { CustomSelect } from "@/components/common/CustomSelect";
import {
  PURCHASE_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  APP_STRINGS,
} from "@/utils/constants";
import type { Supplier } from "@/types";
import { fetchSuppliers } from "@/services/suppliers.service";
import {
  FilterBarContainer,
  SearchWrap,
  SearchInput,
  FilterControls,
  ResetButton,
} from "./Purchase.styles";

interface PurchaseFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedSupplier: string;
  onSupplierChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedPaymentStatus: string;
  onPaymentStatusChange: (value: string) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export const PurchaseFilterBar: React.FC<PurchaseFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedSupplier,
  onSupplierChange,
  selectedStatus,
  onStatusChange,
  selectedPaymentStatus,
  onPaymentStatusChange,
  hasActiveFilters,
  onResetFilters,
}) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    let isMounted = true;
    fetchSuppliers()
      .then((data) => {
        if (isMounted) setSuppliers(data);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const supplierOptions = [
    { value: "all", label: "All Suppliers & Distributors" },
    ...suppliers
      .filter((s) => {
        const lower = (s.name || "").toLowerCase();
        return (
          !lower.includes("authorized hardware distributor") &&
          !lower.includes("authorized distributor")
        );
      })
      .map((s) => ({ value: s.id, label: s.name })),
  ];

  const statusOptions = PURCHASE_STATUS_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.label,
  }));

  const paymentOptions = PAYMENT_STATUS_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.label,
  }));

  return (
    <FilterBarContainer>
      <SearchWrap>
        <Search size={16} />
        <SearchInput
          type="text"
          placeholder={APP_STRINGS.purchaseSearchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </SearchWrap>

      <FilterControls>
        <CustomSelect
          options={supplierOptions}
          value={selectedSupplier}
          onChange={onSupplierChange}
          placeholder="Filter by Supplier"
          ariaLabel="Filter by hardware distributor"
        />

        <CustomSelect
          options={statusOptions}
          value={selectedStatus}
          onChange={onStatusChange}
          placeholder="Filter by Status"
          ariaLabel="Filter by purchase order status"
        />

        <CustomSelect
          options={paymentOptions}
          value={selectedPaymentStatus}
          onChange={onPaymentStatusChange}
          placeholder="Filter by Payment"
          ariaLabel="Filter by payment status"
        />

        {hasActiveFilters && (
          <ResetButton
            onClick={onResetFilters}
            type="button"
            title="Reset Filters"
          >
            <RotateCcw size={14} />
            <span>{APP_STRINGS.resetFilters}</span>
          </ResetButton>
        )}
      </FilterControls>
    </FilterBarContainer>
  );
};
