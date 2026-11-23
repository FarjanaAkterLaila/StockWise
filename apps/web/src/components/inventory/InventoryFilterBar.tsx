import React from "react";
import { Search, Filter, RotateCcw } from "lucide-react";
import {
  HARDWARE_CATEGORIES,
  STOCK_FILTER_OPTIONS,
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
} from "./Inventory.styles";

interface InventoryFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedStockFilter: string;
  onStockFilterChange: (value: string) => void;
  totalFilteredCount: number;
  totalAllCount: number;
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
            placeholder={APP_STRINGS.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </SearchField>

        <FilterSelectsGroup>
          <SelectBox>
            <Filter size={15} />
            <StyledSelect
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              {HARDWARE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Hardware Categories" : cat}
                </option>
              ))}
            </StyledSelect>
          </SelectBox>

          <SelectBox>
            <StyledSelect
              style={{ paddingLeft: "14px" }}
              value={selectedStockFilter}
              onChange={(e) => onStockFilterChange(e.target.value)}
            >
              {STOCK_FILTER_OPTIONS.map((opt) => (
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
          <strong>{totalAllCount}</strong> hardware items
        </span>
        {hasActiveFilters && <span>Filters active</span>}
      </ResultsCountRow>
    </FilterBarCard>
  );
};
