import React from "react";
import { Search, Filter, RotateCcw } from "lucide-react";
import {
  HARDWARE_CATEGORIES,
  STOCK_FILTER_OPTIONS,
  PRODUCT_STATUS_FILTER_OPTIONS,
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
} from "./Inventory.styles";

interface InventoryFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedStockFilter: string;
  onStockFilterChange: (value: string) => void;
  selectedStatusFilter: string;
  onStatusFilterChange: (value: string) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export const InventoryFilterBar: React.FC<InventoryFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStockFilter,
  onStockFilterChange,
  selectedStatusFilter,
  onStatusFilterChange,
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
            placeholder={APP_STRINGS.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </SearchField>

        <FilterSelectsGroup>
          <CustomSelect
            value={selectedCategory}
            onChange={onCategoryChange}
            icon={<Filter size={14} />}
            ariaLabel="Filter hardware by category"
            options={HARDWARE_CATEGORIES.map((cat) => ({
              value: cat,
              label: cat === "All" ? "All Hardware Categories" : cat,
            }))}
          />

          <CustomSelect
            value={selectedStockFilter}
            onChange={onStockFilterChange}
            ariaLabel="Filter hardware by stock level"
            options={STOCK_FILTER_OPTIONS.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
          />

          <CustomSelect
            value={selectedStatusFilter}
            onChange={onStatusFilterChange}
            ariaLabel="Filter hardware by catalog status"
            options={PRODUCT_STATUS_FILTER_OPTIONS.map((opt) => ({
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
