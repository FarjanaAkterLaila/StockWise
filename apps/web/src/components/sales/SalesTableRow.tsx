import React from "react";
import type { Sale } from "@/types";
import { Badge } from "@/components/common/Badge";
import { BADGE_VARIANTS, UI_SIZES } from "@/utils/constants";
import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatters";
import {
  TableRow,
  TableCell,
  InvoiceCell,
  InvoiceNum,
  TimeText,
  CustomerCell,
  CustomerNameText,
  CustomerMeta,
  ItemsSummaryCell,
  ItemsText,
  ItemsBadge,
  AmountBlock,
  MainAmount,
  DueAmount,
  ActionButtonsGroup,
  ActionBtn,
} from "./Sales.styles";

interface SalesTableRowProps {
  sale: Sale;
  onEdit: (sale: Sale) => void;
  onDelete: (sale: Sale) => void;
}

export const SalesTableRow: React.FC<SalesTableRowProps> = ({
  sale,
  onEdit,
  onDelete,
}) => {
  const totalItemCount = sale.items.reduce((acc, i) => acc + i.quantity, 0);
  const itemsSummary = sale.items
    .map((i) => `${i.quantity}x ${i.productName}`)
    .join(", ");

  return (
    <TableRow>
      {/* Invoice Number & Time */}
      <TableCell>
        <InvoiceCell>
          <InvoiceNum>{sale.invoiceNumber}</InvoiceNum>
          <TimeText>{sale.time || "12:00 PM"}</TimeText>
        </InvoiceCell>
      </TableCell>

      {/* Customer Info */}
      <TableCell>
        <CustomerCell>
          <CustomerNameText>{sale.customerName}</CustomerNameText>
          <CustomerMeta>
            {sale.customerType} • {sale.customerPhone || "Counter Walk-in"}
          </CustomerMeta>
        </CustomerCell>
      </TableCell>

      {/* Products & Items Summary */}
      <TableCell>
        <ItemsSummaryCell>
          <ItemsText title={itemsSummary}>{itemsSummary}</ItemsText>
          <ItemsBadge>
            {totalItemCount} Total Units ({sale.items.length} line items)
          </ItemsBadge>
        </ItemsSummaryCell>
      </TableCell>

      {/* Date */}
      <TableCell>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#334155" }}>
          {formatDate(sale.date)}
        </span>
      </TableCell>

      {/* Financial Amounts (Total & Due) */}
      <TableCell>
        <AmountBlock>
          <MainAmount>{formatCurrency(sale.totalAmount)}</MainAmount>
          <DueAmount $hasDue={sale.dueAmount > 0}>
            {sale.dueAmount > 0
              ? `Due: ${formatCurrency(sale.dueAmount)}`
              : "Fully Paid"}
          </DueAmount>
        </AmountBlock>
      </TableCell>

      {/* Payment Status & Method Badge */}
      <TableCell>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {sale.paymentStatus === "paid" ? (
            <Badge variant="success" size="sm" dot>
              Paid ({sale.paymentMethod})
            </Badge>
          ) : sale.paymentStatus === "partial" ? (
            <Badge variant="warning" size="sm" dot>
              Partial ({sale.paymentMethod})
            </Badge>
          ) : (
            <Badge variant="danger" size="sm" dot>
              Unpaid ({sale.paymentMethod})
            </Badge>
          )}
        </div>
      </TableCell>

      {/* Order Status Badge */}
      <TableCell>
        {sale.status === "completed" ? (
          <Badge variant={BADGE_VARIANTS.NEUTRAL} size={UI_SIZES.SM}>
            Completed
          </Badge>
        ) : sale.status === "draft" ? (
          <Badge variant={BADGE_VARIANTS.INFO} size={UI_SIZES.SM}>
            Draft Quote
          </Badge>
        ) : (
          <Badge variant={BADGE_VARIANTS.DANGER} size={UI_SIZES.SM}>
            Cancelled
          </Badge>
        )}
      </TableCell>

      {/* Action Buttons */}
      <TableCell $align="right">
        <ActionButtonsGroup>
          <ActionBtn
            $variant="edit"
            onClick={() => onEdit(sale)}
            title={`Edit Invoice ${sale.invoiceNumber}`}
            type="button"
          >
            <Pencil size={15} />
          </ActionBtn>
          <ActionBtn
            $variant="delete"
            onClick={() => onDelete(sale)}
            title={`Delete Invoice ${sale.invoiceNumber}`}
            type="button"
          >
            <Trash2 size={15} />
          </ActionBtn>
        </ActionButtonsGroup>
      </TableCell>
    </TableRow>
  );
};
