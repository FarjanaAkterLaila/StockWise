import React from "react";
import type { Purchase } from "@/types";
import { GenericModal } from "@/components/common/GenericModal";
import { Badge } from "@/components/common/Badge";
import { formatCurrency, formatDate, triggerPrintModal } from "@/utils/formatters";
import { BADGE_VARIANTS, UI_SIZES } from "@/utils/constants";
import { Printer } from "lucide-react";
import {
  ViewContainer,
  ViewHeader,
  ViewPONumber,
  POTitle,
  PODate,
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
} from "./Purchase.styles";

interface PurchaseViewModalProps {
  purchase: Purchase | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PurchaseViewModal: React.FC<PurchaseViewModalProps> = ({
  purchase,
  isOpen,
  onClose,
}) => {
  if (!purchase) return null;

  const handlePrint = () => {
    triggerPrintModal();
  };

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={onClose}
      title="Purchase Order Details"
      size="lg"
    >
      <ViewContainer id="printable-receipt" className="printable-receipt">
        <ViewHeader>
          <ViewPONumber>
            <POTitle>{purchase.purchaseNumber}</POTitle>
            <PODate>
              Issued on {formatDate(purchase.date)} at{" "}
              {purchase.time || "12:00 PM"}
            </PODate>
          </ViewPONumber>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Badge
              variant={
                purchase.paymentStatus === "paid"
                  ? BADGE_VARIANTS.SUCCESS
                  : purchase.paymentStatus === "partial"
                    ? BADGE_VARIANTS.WARNING
                    : BADGE_VARIANTS.DANGER
              }
              size={UI_SIZES.MD}
              dot
            >
              {purchase.paymentStatus.toUpperCase()} ({purchase.paymentMethod})
            </Badge>

            <Badge
              variant={
                purchase.status === "received"
                  ? BADGE_VARIANTS.SUCCESS
                  : purchase.status === "ordered"
                    ? BADGE_VARIANTS.INFO
                    : purchase.status === "pending"
                      ? BADGE_VARIANTS.WARNING
                      : BADGE_VARIANTS.DANGER
              }
              size={UI_SIZES.MD}
            >
              {purchase.status.toUpperCase()}
            </Badge>
          </div>
        </ViewHeader>

        {/* Distributor & Branch Meta */}
        <ViewMetaGrid>
          <ViewMetaCard>
            <ViewMetaLabel>Distributor / Supplier</ViewMetaLabel>
            <ViewMetaValue>{purchase.supplierName}</ViewMetaValue>
          </ViewMetaCard>

          <ViewMetaCard>
            <ViewMetaLabel>Receiving Branch</ViewMetaLabel>
            <ViewMetaValue>StockWise Multiplan Branch</ViewMetaValue>
          </ViewMetaCard>

          <ViewMetaCard>
            <ViewMetaLabel>Settlement Status</ViewMetaLabel>
            <ViewMetaValue>
              {purchase.dueAmount > 0
                ? `Due: ${formatCurrency(purchase.dueAmount)}`
                : "Full Settle"}
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
                <th style={{ textAlign: "right" }}>Unit Cost</th>
                <th style={{ textAlign: "right" }}>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {purchase.items.map((item) => (
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
            <span>Subtotal ({purchase.items.length} items):</span>
            <span>{formatCurrency(purchase.subtotal)}</span>
          </TotalsRow>

          {purchase.discountAmount > 0 && (
            <TotalsRow>
              <span>Distributor Discount:</span>
              <span>- {formatCurrency(purchase.discountAmount)}</span>
            </TotalsRow>
          )}

          <TotalsRow>
            <span>VAT ({purchase.vatRate}%):</span>
            <span>+ {formatCurrency(purchase.vatAmount)}</span>
          </TotalsRow>

          <TotalsRow $isGrandTotal={true}>
            <span>Grand Total:</span>
            <TotalsAmount $highlight={true}>
              {formatCurrency(purchase.grandTotal)}
            </TotalsAmount>
          </TotalsRow>

          <TotalsRow>
            <span>Amount Paid:</span>
            <span>{formatCurrency(purchase.paidAmount)}</span>
          </TotalsRow>

          {purchase.dueAmount > 0 && (
            <TotalsRow>
              <span>Balance Due:</span>
              <TotalsAmount $danger={true}>
                {formatCurrency(purchase.dueAmount)}
              </TotalsAmount>
            </TotalsRow>
          )}
        </TotalsCard>

        {purchase.notes && (
          <ViewMetaCard>
            <ViewMetaLabel>Distributor Notes / Remarks</ViewMetaLabel>
            <div style={{ fontSize: "12.5px", marginTop: "4px" }}>
              {purchase.notes}
            </div>
          </ViewMetaCard>
        )}

        {/* Footer Actions */}
        <ModalFooter>
          <PrintBtn type="button" onClick={handlePrint}>
            <Printer size={15} />
            <span>Print PO Voucher</span>
          </PrintBtn>
          <CancelBtn type="button" onClick={onClose}>
            Close
          </CancelBtn>
        </ModalFooter>
      </ViewContainer>
    </GenericModal>
  );
};
