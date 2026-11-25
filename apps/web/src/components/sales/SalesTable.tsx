import React from "react";
import type { Sale } from "@/types";
import { ShoppingBag } from "lucide-react";
import { SalesTableRow } from "./SalesTableRow";
import { DataTable, type TableColumn } from "@/components/common/DataTable";
import { APP_STRINGS } from "@/utils/constants";

interface SalesTableProps {
  sales: Sale[];
  totalAllCount?: number;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onView: (sale: Sale) => void;
  onEdit?: (sale: Sale) => void;
}

const SALES_COLUMNS: TableColumn[] = [
  { label: "Invoice & Time" },
  { label: "Customer" },
  { label: "Hardware Items" },
  { label: "Date" },
  { label: "Total & Due Amount" },
  { label: "Payment" },
  { label: "Order Status" },
  { label: "Actions", align: "right" },
];

export const SalesTable: React.FC<SalesTableProps> = ({
  sales,
  totalAllCount,
  hasActiveFilters,
  onResetFilters,
  onView,
  onEdit,
}) => {
  return (
    <DataTable
      columns={SALES_COLUMNS}
      itemCount={sales.length}
      totalAllCount={totalAllCount}
      itemLabel="sales invoices"
      hasActiveFilters={hasActiveFilters}
      onResetFilters={onResetFilters}
      emptyIcon={<ShoppingBag size={28} />}
      emptyTitle={APP_STRINGS.emptySalesTitle}
      emptyDesc={APP_STRINGS.emptySalesDesc}
    >
      {sales.map((sale) => (
        <SalesTableRow
          key={sale.id}
          sale={sale}
          onView={onView}
          onEdit={onEdit}
        />
      ))}
    </DataTable>
  );
};
