import React from "react";
import type { Sale } from "@/types";
import { ViewModal } from "@/components/common/ViewModal";
import { Badge } from "@/components/common/Badge";
import { formatCurrency } from "@/utils/formatters";
import { formatSaleDate } from "@/utils/sale.utils";
import { BADGE_VARIANTS, UI_SIZES } from "@/utils/constants";
import {
  ViewHeader,
  ViewInvoiceNumber,
  InvoiceTitle,
  InvoiceDate,
  ViewMetaGrid,
  ViewMetaCard,
  ViewMetaLabel,
  ViewMetaValue,
  ViewItemsTable,
  TotalsCard,
  TotalsRow,
  TotalsAmount,
} from "./Sales.styles";

interface SalesViewModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SalesViewModal: React.FC<SalesViewModalProps> = ({
  sale,
  isOpen,
  onClose,
}) => {
  if (!sale) return null;

  const itemsSubtotal = (sale.items || []).reduce(
    (sum, item) =>
      sum +
      (Number(item.subtotal) ||
        (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0) ||
        0),
    0,
  );
  const displaySubtotal =
    Number(sale.subtotal) > 0 ? Number(sale.subtotal) : itemsSubtotal;

  const displayPaidAmount =
    Number(sale.paidAmount) > 0
      ? Number(sale.paidAmount)
      : sale.paymentStatus === "paid"
        ? Number(sale.totalAmount)
        : 0;

  const displayDiscount =
    Number(sale.discountAmount) > 0
      ? Number(sale.discountAmount)
      : displaySubtotal > Number(sale.totalAmount)
        ? Math.max(0, displaySubtotal - Number(sale.totalAmount))
        : 0;

  const displayDueAmount =
    sale.dueAmount !== undefined && sale.dueAmount !== null && !isNaN(Number(sale.dueAmount))
      ? Number(sale.dueAmount)
      : Math.max(0, Number(sale.totalAmount) - displayPaidAmount);

  return (
    <ViewModal
      isOpen={isOpen}
      onClose={onClose}
      title="Sales Invoice Details"
      printLabel="Print Invoice"
    >
      <ViewHeader>
        <ViewInvoiceNumber>
          <InvoiceTitle>{sale.invoiceNumber}</InvoiceTitle>
          <InvoiceDate>
            Issued on {formatSaleDate(sale.date)}{sale.time ? ` at ${sale.time}` : ""}
          </InvoiceDate>
        </ViewInvoiceNumber>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Badge
            variant={
              sale.paymentStatus === "paid" || displayDueAmount === 0
                ? BADGE_VARIANTS.SUCCESS
                : sale.paymentStatus === "partial"
                  ? BADGE_VARIANTS.WARNING
                  : BADGE_VARIANTS.DANGER
            }
            size={UI_SIZES.MD}
            dot
          >
            {(displayDueAmount === 0 ? "PAID" : sale.paymentStatus).toUpperCase()} ({sale.paymentMethod || "Cash"})
          </Badge>

          <Badge
            variant={
              sale.status === "completed"
                ? BADGE_VARIANTS.SUCCESS
                : sale.status === "draft"
                  ? BADGE_VARIANTS.INFO
                  : BADGE_VARIANTS.DANGER
            }
            size={UI_SIZES.MD}
          >
            {sale.status.toUpperCase()}
          </Badge>
        </div>
      </ViewHeader>

      {/* Customer & Branch Meta */}
      <ViewMetaGrid>
        <ViewMetaCard>
          <ViewMetaLabel>Customer</ViewMetaLabel>
          <ViewMetaValue>
            {sale.customerName} ({sale.customerType})
          </ViewMetaValue>
        </ViewMetaCard>

        <ViewMetaCard>
          <ViewMetaLabel>Phone / Contact</ViewMetaLabel>
          <ViewMetaValue>
            {sale.customerPhone || "Counter Walk-in"}
          </ViewMetaValue>
        </ViewMetaCard>

        <ViewMetaCard>
          <ViewMetaLabel>Settlement Status</ViewMetaLabel>
          <ViewMetaValue>
            {displayDueAmount > 0
              ? `Due: ${formatCurrency(displayDueAmount)}`
              : "Fully Paid"}
          </ViewMetaValue>
        </ViewMetaCard>
      </ViewMetaGrid>

      {/* Line Items Table */}
      <div style={{ overflowX: "auto" }}>
        <ViewItemsTable>
          <thead>
            <tr>
              <th>Hardware Component</th>
              <th>SKU</th>
              <th style={{ textAlign: "right" }}>Quantity</th>
              <th style={{ textAlign: "right" }}>Unit Price</th>
              <th style={{ textAlign: "right" }}>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item) => (
              <tr key={item.id}>
                <td style={{ fontWeight: 600 }}>{item.productName}</td>
                <td>
                  <code>{item.sku}</code>
                </td>
                <td style={{ textAlign: "right" }}>{item.quantity}</td>
                <td style={{ textAlign: "right" }}>
                  {formatCurrency(item.unitPrice)}
                </td>
                <td style={{ textAlign: "right", fontWeight: 700 }}>
                  {formatCurrency(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </ViewItemsTable>
      </div>

      {sale.paymentHistory && sale.paymentHistory.length > 0 && (
        <section style={{ marginTop: 20 }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 15 }}>Payment History</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 8 }}>Date</th>
                  <th style={{ textAlign: "left", padding: 8 }}>Method</th>
                  <th style={{ textAlign: "right", padding: 8 }}>Amount</th>
                  <th style={{ textAlign: "left", padding: 8 }}>Reference / Notes</th>
                </tr>
              </thead>
              <tbody>
                {sale.paymentHistory.map((payment) => (
                  <tr key={payment.id}>
                    <td style={{ padding: 8 }}>{payment.paymentDate}</td>
                    <td style={{ padding: 8 }}>{payment.paymentMethod}</td>
                    <td style={{ padding: 8, textAlign: "right" }}>{formatCurrency(payment.amount)}</td>
                    <td style={{ padding: 8 }}>
                      {[payment.referenceNumber, payment.notes].filter(Boolean).join(" · ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Totals Summary */}
      <TotalsCard>
        <TotalsRow>
          <span>Subtotal ({sale.items.length} items):</span>
          <span>{formatCurrency(displaySubtotal)}</span>
        </TotalsRow>

        <TotalsRow>
          <span>Discount:</span>
          <span
            style={{
              color: displayDiscount > 0 ? "#ef4444" : "inherit",
              fontWeight: displayDiscount > 0 ? 600 : 400,
            }}
          >
            {displayDiscount > 0
              ? `- ${formatCurrency(displayDiscount)}`
              : formatCurrency(0)}
          </span>
        </TotalsRow>

        {sale.taxAmount > 0 && (
          <TotalsRow>
            <span>VAT / Tax:</span>
            <span>+ {formatCurrency(sale.taxAmount)}</span>
          </TotalsRow>
        )}

        <TotalsRow $isGrandTotal={true}>
          <span>Grand Total:</span>
          <TotalsAmount $highlight={true}>
            {formatCurrency(sale.totalAmount)}
          </TotalsAmount>
        </TotalsRow>

        <TotalsRow>
          <span>Amount Paid:</span>
          <span>{formatCurrency(displayPaidAmount)}</span>
        </TotalsRow>

        {displayDueAmount > 0 && (
          <TotalsRow>
            <span>Balance Due:</span>
            <TotalsAmount $danger={true}>
              {formatCurrency(displayDueAmount)}
            </TotalsAmount>
          </TotalsRow>
        )}
      </TotalsCard>

      {sale.notes && (
        <ViewMetaCard>
          <ViewMetaLabel>Invoice Notes / Warranty Terms</ViewMetaLabel>
          <div style={{ fontSize: "12.5px", marginTop: "4px" }}>
            {sale.notes}
          </div>
        </ViewMetaCard>
      )}
    </ViewModal>
  );
};
