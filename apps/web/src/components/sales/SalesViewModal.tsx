import React from "react";
import type { Sale } from "@/types";
import { GenericModal } from "@/components/common/GenericModal";
import { Badge } from "@/components/common/Badge";
import { formatCurrency, formatDate, triggerPrintModal } from "@/utils/formatters";
import { BADGE_VARIANTS, UI_SIZES } from "@/utils/constants";
import { Printer } from "lucide-react";
import {
  ViewContainer,
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
  ModalFooter,
  PrintBtn,
  CancelBtn,
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

  const handlePrint = () => {
    triggerPrintModal();
  };

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={onClose}
      title="Sales Invoice Details"
      size="lg"
    >
      <ViewContainer id="printable-receipt" className="printable-receipt">
        <ViewHeader>
          <ViewInvoiceNumber>
            <InvoiceTitle>{sale.invoiceNumber}</InvoiceTitle>
            <InvoiceDate>
              Issued on {formatDate(sale.date)} at {sale.time || "12:00 PM"}
            </InvoiceDate>
          </ViewInvoiceNumber>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Badge
              variant={
                sale.paymentStatus === "paid"
                  ? BADGE_VARIANTS.SUCCESS
                  : sale.paymentStatus === "partial"
                    ? BADGE_VARIANTS.WARNING
                    : BADGE_VARIANTS.DANGER
              }
              size={UI_SIZES.MD}
              dot
            >
              {sale.paymentStatus.toUpperCase()} ({sale.paymentMethod})
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
              {sale.dueAmount > 0
                ? `Due: ${formatCurrency(sale.dueAmount)}`
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

        {/* Totals Summary */}
        <TotalsCard>
          <TotalsRow>
            <span>Subtotal ({sale.items.length} items):</span>
            <span>{formatCurrency(sale.subtotal)}</span>
          </TotalsRow>

          {sale.discountAmount > 0 && (
            <TotalsRow>
              <span>Discount:</span>
              <span>- {formatCurrency(sale.discountAmount)}</span>
            </TotalsRow>
          )}

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
            <span>{formatCurrency(sale.paidAmount)}</span>
          </TotalsRow>

          {sale.dueAmount > 0 && (
            <TotalsRow>
              <span>Balance Due:</span>
              <TotalsAmount $danger={true}>
                {formatCurrency(sale.dueAmount)}
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

        {/* Footer Actions */}
        <ModalFooter>
          <PrintBtn type="button" onClick={handlePrint}>
            <Printer size={15} />
            <span>Print Invoice</span>
          </PrintBtn>
          <CancelBtn type="button" onClick={onClose}>
            Close
          </CancelBtn>
        </ModalFooter>
      </ViewContainer>
    </GenericModal>
  );
};
