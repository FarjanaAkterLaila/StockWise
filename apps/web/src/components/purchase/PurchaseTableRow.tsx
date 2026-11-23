import React from "react";
import type { Purchase } from "@/types";
import { Badge } from "@/components/common/Badge";
import { BADGE_VARIANTS, UI_SIZES } from "@/utils/constants";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatters";
import {
  TableRow,
  TableCell,
  PurchaseNumberCell,
  PurchaseNum,
  TimeText,
  DateText,
  SupplierCell,
  SupplierNameText,
  SupplierMeta,
  ItemsSummaryCell,
  ItemsText,
  ItemsBadge,
  AmountBlock,
  MainAmount,
  DueAmount,
  ActionButtonsGroup,
  ActionBtn,
} from "./Purchase.styles";

interface PurchaseTableRowProps {
  purchase: Purchase;
  onView: (purchase: Purchase) => void;
  onEdit: (purchase: Purchase) => void;
  onDelete: (purchase: Purchase) => void;
}

export const PurchaseTableRow: React.FC<PurchaseTableRowProps> = ({
  purchase,
  onView,
  onEdit,
  onDelete,
}) => {
  const totalItemCount = purchase.items.reduce((acc, i) => acc + i.quantity, 0);
  const itemsSummary = purchase.items
    .map((i) => `${i.quantity}x ${i.productName}`)
    .join(", ");

  return (
    <TableRow>
      <TableCell>
        <PurchaseNumberCell>
          <PurchaseNum>{purchase.purchaseNumber}</PurchaseNum>
          <TimeText>{purchase.time || "12:00 PM"}</TimeText>
        </PurchaseNumberCell>
      </TableCell>

      <TableCell>
        <SupplierCell>
          <SupplierNameText>{purchase.supplierName}</SupplierNameText>
          <SupplierMeta>
            {purchase.items.length} component line
            {purchase.items.length > 1 ? "s" : ""}
          </SupplierMeta>
        </SupplierCell>
      </TableCell>

      <TableCell>
        <ItemsSummaryCell>
          <ItemsText title={itemsSummary}>{itemsSummary}</ItemsText>
          <ItemsBadge>
            {totalItemCount} Total Units ({purchase.items.length} line items)
          </ItemsBadge>
        </ItemsSummaryCell>
      </TableCell>

      <TableCell>
        <DateText>{formatDate(purchase.date)}</DateText>
      </TableCell>

      <TableCell>
        <AmountBlock>
          <MainAmount>{formatCurrency(purchase.grandTotal)}</MainAmount>
          <DueAmount $hasDue={purchase.dueAmount > 0}>
            {purchase.dueAmount > 0
              ? `Due: ${formatCurrency(purchase.dueAmount)}`
              : "Fully Settled"}
          </DueAmount>
        </AmountBlock>
      </TableCell>

      <TableCell>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {purchase.paymentStatus === "paid" ? (
            <Badge variant="success" size="sm" dot>
              Paid ({purchase.paymentMethod})
            </Badge>
          ) : purchase.paymentStatus === "partial" ? (
            <Badge variant="warning" size="sm" dot>
              Partial ({purchase.paymentMethod})
            </Badge>
          ) : (
            <Badge variant="danger" size="sm" dot>
              Unpaid ({purchase.paymentMethod})
            </Badge>
          )}
        </div>
      </TableCell>

      <TableCell>
        {purchase.status === "received" ? (
          <Badge variant={BADGE_VARIANTS.SUCCESS} size={UI_SIZES.SM}>
            Received
          </Badge>
        ) : purchase.status === "ordered" ? (
          <Badge variant={BADGE_VARIANTS.INFO} size={UI_SIZES.SM}>
            Ordered
          </Badge>
        ) : purchase.status === "pending" ? (
          <Badge variant={BADGE_VARIANTS.WARNING} size={UI_SIZES.SM}>
            Pending
          </Badge>
        ) : (
          <Badge variant={BADGE_VARIANTS.DANGER} size={UI_SIZES.SM}>
            Cancelled
          </Badge>
        )}
      </TableCell>

      <TableCell $align="right">
        <ActionButtonsGroup>
          <ActionBtn
            $variant="view"
            onClick={() => onView(purchase)}
            title={`View Purchase ${purchase.purchaseNumber}`}
            type="button"
          >
            <Eye size={15} />
          </ActionBtn>
          <ActionBtn
            $variant="edit"
            onClick={() => onEdit(purchase)}
            title={`Edit Purchase ${purchase.purchaseNumber}`}
            type="button"
          >
            <Pencil size={15} />
          </ActionBtn>
          <ActionBtn
            $variant="delete"
            onClick={() => onDelete(purchase)}
            title={`Delete Purchase ${purchase.purchaseNumber}`}
            type="button"
          >
            <Trash2 size={15} />
          </ActionBtn>
        </ActionButtonsGroup>
      </TableCell>
    </TableRow>
  );
};
