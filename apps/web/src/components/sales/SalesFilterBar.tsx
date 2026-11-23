import React from "react";
import { Search, Filter, RotateCcw } from "lucide-react";
import {
  SALE_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  APP_STRINGS,
} from "@/utils/constants";
import {
  FilterBarCard,
  FilterControlsRow,
  SearchField,
  SearchInput,
  FilterSelectsGroup,
  SelectBox,
  StyledSelect,
  ClearFilterBtn,
  ResultsCountRow,
} from "./Sales.styles";

interface SalesFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedPaymentStatus: string;
  onPaymentStatusChange: (value: string) => void;
  totalFilteredCount: number;
  totalAllCount: number;
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
  totalFilteredCount,
  totalAllCount,
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
          <SelectBox>
            <Filter size={15} />
            <StyledSelect
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
            >
              {SALE_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </StyledSelect>
          </SelectBox>

          <SelectBox>
            <StyledSelect
              style={{ paddingLeft: "14px" }}
              value={selectedPaymentStatus}
              onChange={(e) => onPaymentStatusChange(e.target.value)}
            >
              {PAYMENT_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </StyledSelect>
          </SelectBox>

          {hasActiveFilters && (
            <ClearFilterBtn onClick={onResetFilters} type="button">
              <RotateCcw size={14} />
              <span>{APP_STRINGS.resetFilters}</span>
            </ClearFilterBtn>
          )}
        </FilterSelectsGroup>
      </FilterControlsRow>

      <ResultsCountRow>
        <span>
          Showing <strong>{totalFilteredCount}</strong> of{" "}
          <strong>{totalAllCount}</strong> sales invoices
        </span>
        {hasActiveFilters && <span>Filters active</span>}
      </ResultsCountRow>
    </FilterBarCard>
  );
};
