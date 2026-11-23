import React from "react";
import type { Sale } from "@/types";
import { ShoppingBag } from "lucide-react";
import { SalesTableRow } from "./SalesTableRow";
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
} from "./Sales.styles";

interface SalesTableProps {
  sales: Sale[];
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onEdit: (sale: Sale) => void;
  onDelete: (sale: Sale) => void;
}

export const SalesTable: React.FC<SalesTableProps> = ({
  sales,
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
              <TableHeader>Invoice & Time</TableHeader>
              <TableHeader>Customer</TableHeader>
              <TableHeader>Hardware Items</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader>Total & Due Amount</TableHeader>
              <TableHeader>Payment</TableHeader>
              <TableHeader>Order Status</TableHeader>
              <TableHeader $align="right">Actions</TableHeader>
            </HeaderRow>
          </TableHead>
          <TableBody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState>
                    <EmptyIconWrap>
                      <ShoppingBag size={28} />
                    </EmptyIconWrap>
                    <EmptyTitle>{APP_STRINGS.emptySalesTitle}</EmptyTitle>
                    <EmptyDesc>{APP_STRINGS.emptySalesDesc}</EmptyDesc>
                    {hasActiveFilters && (
                      <ClearFilterBtn onClick={onResetFilters} type="button">
                        {APP_STRINGS.resetFilters}
                      </ClearFilterBtn>
                    )}
                  </EmptyState>
                </td>
              </tr>
            ) : (
              sales.map((sale) => (
                <SalesTableRow
                  key={sale.id}
                  sale={sale}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableResponsiveWrapper>
    </TableContainer>
  );
};
