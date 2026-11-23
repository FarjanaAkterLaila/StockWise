import React from "react";
import type { Product } from "@/types";
import { PackageSearch } from "lucide-react";
import { InventoryTableRow } from "./InventoryTableRow";
import { DataTable, type TableColumn } from "@/components/common/DataTable";
import { APP_STRINGS } from "@/utils/constants";

interface InventoryTableProps {
  products: Product[];
  totalAllCount?: number;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const INVENTORY_COLUMNS: TableColumn[] = [
  { label: "Product Information" },
  { label: "SKU & Barcode" },
  { label: "Cost Price" },
  { label: "Selling Price" },
  { label: "Stock Level" },
  { label: "Stock Status" },
  { label: "Catalog Status" },
  { label: "Actions", align: "right" },
];

export const InventoryTable: React.FC<InventoryTableProps> = ({
  products,
  totalAllCount,
  hasActiveFilters,
  onResetFilters,
  onEdit,
  onDelete,
}) => {
  return (
    <DataTable
      columns={INVENTORY_COLUMNS}
      itemCount={products.length}
      totalAllCount={totalAllCount}
      itemLabel="hardware items"
      hasActiveFilters={hasActiveFilters}
      onResetFilters={onResetFilters}
      emptyIcon={<PackageSearch size={28} />}
      emptyTitle={APP_STRINGS.emptyTitle}
      emptyDesc={APP_STRINGS.emptyDesc}
    >
      {products.map((product) => (
        <InventoryTableRow
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </DataTable>
  );
};
