import React from "react";
import type { Purchase } from "@/types";
import { ShoppingBag } from "lucide-react";
import { PurchaseTableRow } from "./PurchaseTableRow";
import { DataTable, type TableColumn } from "@/components/common/DataTable";
import { APP_STRINGS } from "@/utils/constants";

interface PurchaseTableProps {
  purchases: Purchase[];
  totalAllCount?: number;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  onView: (purchase: Purchase) => void;
  onEdit: (purchase: Purchase) => void;
  onDelete: (purchase: Purchase) => void;
}

const PURCHASE_COLUMNS: TableColumn[] = [
  { label: "PO Number & Time" },
  { label: "Distributor / Supplier" },
  { label: "Hardware Items" },
  { label: "Date" },
  { label: "Grand Total & Due" },
  { label: "Payment" },
  { label: "Purchase Status" },
  { label: "Actions", align: "right" },
];

export const PurchaseTable: React.FC<PurchaseTableProps> = ({
  purchases,
  totalAllCount,
  hasActiveFilters,
  onResetFilters,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <DataTable
      columns={PURCHASE_COLUMNS}
      itemCount={purchases.length}
      totalAllCount={totalAllCount}
      itemLabel="purchase orders"
      hasActiveFilters={hasActiveFilters}
      onResetFilters={onResetFilters}
      emptyIcon={<ShoppingBag size={28} />}
      emptyTitle={APP_STRINGS.emptyPurchaseTitle}
      emptyDesc={APP_STRINGS.emptyPurchaseDesc}
    >
      {purchases.map((purchase) => (
        <PurchaseTableRow
          key={purchase.id}
          purchase={purchase}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </DataTable>
  );
};
