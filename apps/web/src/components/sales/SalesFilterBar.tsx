import React from "react";
import { Search, Filter, RotateCcw } from "lucide-react";
import {
  SALE_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  APP_STRINGS,
} from "@/utils/constants";
import { CustomSelect } from "@/components/common/CustomSelect";
import {
  FilterBarCard,
  FilterControlsRow,
  SearchField,
  SearchInput,
  FilterSelectsGroup,
  ClearFilterBtn,
} from "./Sales.styles";

interface SalesFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedPaymentStatus: string;
  onPaymentStatusChange: (value: string) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export const SalesFilterBar: React.FC<SalesFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedPaymentStatus,
  onPaymentStatusChange,
  hasActiveFilters,
  onResetFilters,
}) => {
  return (
    <FilterBarCard>
      <FilterControlsRow>
        <SearchField>
          <Search size={18} />
          <SearchInput
            type="text"
            placeholder={APP_STRINGS.salesSearchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </SearchField>

        <FilterSelectsGroup>
          <CustomSelect
            value={selectedStatus}
            onChange={onStatusChange}
            icon={<Filter size={14} />}
            ariaLabel="Filter sales by status"
            options={SALE_STATUS_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
          />

          <CustomSelect
            value={selectedPaymentStatus}
            onChange={onPaymentStatusChange}
            ariaLabel="Filter sales by payment status"
            options={PAYMENT_STATUS_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
          />

          {hasActiveFilters && (
            <ClearFilterBtn onClick={onResetFilters} type="button">
              <RotateCcw size={14} />
              <span>{APP_STRINGS.resetFilters}</span>
            </ClearFilterBtn>
          )}
        </FilterSelectsGroup>
      </FilterControlsRow>
    </FilterBarCard>
  );
};
