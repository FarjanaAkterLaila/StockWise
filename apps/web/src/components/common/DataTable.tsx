import React, { type ReactNode } from "react";
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
} from "./Table.styles";
import { APP_STRINGS } from "@/utils/constants";

export interface TableColumn {
  label: string;
  align?: "left" | "center" | "right";
}

export interface DataTableProps {
  columns: TableColumn[];
  itemCount: number;
  totalAllCount?: number;
  itemLabel?: string;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptyDesc?: string;
  children: ReactNode;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  itemCount,
  totalAllCount,
  itemLabel = "items",
  hasActiveFilters = false,
  onResetFilters,
  emptyIcon,
  emptyTitle = "No records found",
  emptyDesc = "No records match your search or filter criteria.",
  children,
}) => {
  return (
    <TableContainer>
      <TableResponsiveWrapper>
        <Table>
          <TableHead>
            <HeaderRow>
              {columns.map((col, idx) => (
                <TableHeader key={idx} $align={col.align}>
                  {col.label}
                </TableHeader>
              ))}
            </HeaderRow>
          </TableHead>
          <TableBody>
            {itemCount === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState>
                    {emptyIcon && <EmptyIconWrap>{emptyIcon}</EmptyIconWrap>}
                    <EmptyTitle>{emptyTitle}</EmptyTitle>
                    <EmptyDesc>{emptyDesc}</EmptyDesc>
                    {hasActiveFilters && onResetFilters && (
                      <ClearFilterBtn onClick={onResetFilters} type="button">
                        {APP_STRINGS.resetFilters}
                      </ClearFilterBtn>
                    )}
                  </EmptyState>
                </td>
              </tr>
            ) : (
              children
            )}
          </TableBody>
        </Table>
      </TableResponsiveWrapper>

      <TableFooterBar>
        <FooterCountText>
          Showing <strong>{itemCount}</strong> of{" "}
          <strong>{totalAllCount ?? itemCount}</strong> {itemLabel}
        </FooterCountText>
        {hasActiveFilters && (
          <ActiveFilterBadge>Filters active</ActiveFilterBadge>
        )}
      </TableFooterBar>
    </TableContainer>
  );
};
