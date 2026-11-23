import React from "react";
import type { Product } from "@/types";
import { PackageSearch } from "lucide-react";
import { InventoryTableRow } from "./InventoryTableRow";
import { APP_STRINGS } from "@/utils/constants";
import {
  TableContainer,
  TableResponsiveWrapper,
  Table,
  TableHead,
  HeaderRow,
  TableHeader,
  TableBody,
  EmptyState,
  EmptyIconWrap,
  EmptyTitle,
  EmptyDesc,
  ClearFilterBtn,
  TableFooterBar,
  FooterCountText,
  ActiveFilterBadge,
} from "./Inventory.styles";

interface InventoryTableProps {
  products: Product[];
  totalAllCount?: number;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  products,
  totalAllCount,
  hasActiveFilters,
  onResetFilters,
  onEdit,
  onDelete,
}) => {
  return (
    <TableContainer>
      <TableResponsiveWrapper>
        <Table>
          <TableHead>
            <HeaderRow>
              <TableHeader>Product Information</TableHeader>
              <TableHeader>SKU & Barcode</TableHeader>
              <TableHeader>Cost Price</TableHeader>
              <TableHeader>Selling Price</TableHeader>
              <TableHeader>Stock Level</TableHeader>
              <TableHeader>Stock Status</TableHeader>
              <TableHeader>Catalog Status</TableHeader>
              <TableHeader $align="right">Actions</TableHeader>
            </HeaderRow>
          </TableHead>
          <TableBody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState>
                    <EmptyIconWrap>
                      <PackageSearch size={28} />
                    </EmptyIconWrap>
                    <EmptyTitle>{APP_STRINGS.emptyTitle}</EmptyTitle>
                    <EmptyDesc>{APP_STRINGS.emptyDesc}</EmptyDesc>
                    {hasActiveFilters && (
                      <ClearFilterBtn onClick={onResetFilters} type="button">
                        {APP_STRINGS.resetFilters}
                      </ClearFilterBtn>
                    )}
                  </EmptyState>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <InventoryTableRow
                  key={product.id}
                  product={product}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableResponsiveWrapper>

      <TableFooterBar>
        <FooterCountText>
          Showing <strong>{products.length}</strong> of{" "}
          <strong>{totalAllCount ?? products.length}</strong> hardware items
        </FooterCountText>
        {hasActiveFilters && (
          <ActiveFilterBadge>Filters active</ActiveFilterBadge>
        )}
      </TableFooterBar>
    </TableContainer>
  );
};
