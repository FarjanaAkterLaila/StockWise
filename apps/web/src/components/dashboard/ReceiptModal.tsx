import React from "react";
import type { RecentSale, PaymentStatus } from "@/types";
import { GenericModal } from "@/components/common/GenericModal";
import { Badge } from "@/components/common/Badge";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { BADGE_VARIANTS, PAYMENT_STATUS } from "@/utils/constants";
import {
  Building2,
  Calendar,
  CreditCard,
  Banknote,
  Smartphone,
  Printer,
  Package,
  Layers,
} from "lucide-react";
import {
  ReceiptContainer,
  ReceiptHeader,
  StoreInfo,
  StoreName,
  StoreAddress,
  ReceiptBadgeGroup,
  InvoiceTag,
  DetailsGrid,
  DetailCard,
  DetailLabel,
  DetailValue,
  ItemsSection,
  ItemsHeader,
  ItemsList,
  ItemRow,
  TotalsBox,
  TotalRow,
  PrintNotice,
  ModalActionsRow,
  PrintBtn,
  CloseBtn,
} from "./ReceiptModal.styles";

interface ReceiptModalProps {
  sale: RecentSale | null;
  isOpen: boolean;
  onClose: () => void;
}

const PAYMENT_ICON = {
  Cash: Banknote,
  Card: CreditCard,
  "Bank Transfer": Building2,
  MFS: Smartphone,
};

const STATUS_VARIANT: Record<PaymentStatus, "success" | "warning" | "danger"> =
  {
    [PAYMENT_STATUS.PAID]: BADGE_VARIANTS.SUCCESS,
    [PAYMENT_STATUS.PARTIAL]: BADGE_VARIANTS.WARNING,
    [PAYMENT_STATUS.UNPAID]: BADGE_VARIANTS.DANGER,
  };

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  sale,
  isOpen,
  onClose,
}) => {
  if (!sale) return null;

  const PayIcon = PAYMENT_ICON[sale.paymentMethod] || CreditCard;
  const dueAmount = Math.max(0, sale.totalAmount - sale.paidAmount);

  // Split comma-separated hardware items if present
  const itemsList = sale.itemsSummary
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const handlePrint = () => {
    document.body.classList.add("printing-receipt");
    const cleanup = () => {
      document.body.classList.remove("printing-receipt");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
    setTimeout(cleanup, 2000);
  };

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Sales Receipt • ${sale.invoiceNumber}`}
      subtitle={`Billing details for POS transaction on ${formatDate(sale.date)}`}
      size="md"
      footer={
        <ModalActionsRow className="no-print">
          <CloseBtn type="button" onClick={onClose}>
            Close
          </CloseBtn>
          <PrintBtn type="button" onClick={handlePrint}>
            <Printer size={15} />
            <span>Print Receipt</span>
          </PrintBtn>
        </ModalActionsRow>
      }
    >
      <ReceiptContainer id="printable-receipt" className="printable-receipt">
        {/* Store & Header */}
        <ReceiptHeader>
          <StoreInfo>
            <StoreName>
              <Building2 size={16} />
              <span>StockWise Computer Hub BD</span>
            </StoreName>
            <StoreAddress>
              Shop 412, Level 4, Multiplan Center, New Elephant Road, Dhaka
            </StoreAddress>
          </StoreInfo>

          <ReceiptBadgeGroup>
            <InvoiceTag>{sale.invoiceNumber}</InvoiceTag>
            <Badge variant={STATUS_VARIANT[sale.paymentStatus]} size="sm" dot>
              {sale.paymentStatus.toUpperCase()}
            </Badge>
          </ReceiptBadgeGroup>
        </ReceiptHeader>

        {/* Transaction Details Grid */}
        <DetailsGrid>
          <DetailCard>
            <DetailLabel>Customer</DetailLabel>
            <DetailValue>
              <span>{sale.customerName}</span>
              <Badge variant="neutral" size="sm">
                {sale.customerType}
              </Badge>
            </DetailValue>
          </DetailCard>

          <DetailCard>
            <DetailLabel>Payment Method</DetailLabel>
            <DetailValue>
              <PayIcon size={16} />
              <span>{sale.paymentMethod}</span>
            </DetailValue>
          </DetailCard>

          <DetailCard>
            <DetailLabel>Date & Time</DetailLabel>
            <DetailValue>
              <Calendar size={14} />
              <span>
                {formatDate(sale.date)} • {sale.time}
              </span>
            </DetailValue>
          </DetailCard>

          <DetailCard>
            <DetailLabel>Component Count</DetailLabel>
            <DetailValue>
              <Layers size={14} />
              <span>{sale.itemCount} Items</span>
            </DetailValue>
          </DetailCard>
        </DetailsGrid>

        {/* Hardware Items List */}
        <ItemsSection>
          <ItemsHeader>
            <span>Hardware Components & Items</span>
            <span>{sale.itemCount} SKUs</span>
          </ItemsHeader>
          <ItemsList>
            {itemsList.map((item, idx) => (
              <ItemRow key={idx}>
                <Package size={14} />
                <span>{item}</span>
              </ItemRow>
            ))}
          </ItemsList>
        </ItemsSection>

        {/* Financial Summary Box */}
        <TotalsBox>
          <TotalRow>
            <span>Total Bill Amount:</span>
            <span>{formatCurrency(sale.totalAmount)}</span>
          </TotalRow>
          <TotalRow>
            <span>Amount Paid / Collected:</span>
            <span>{formatCurrency(sale.paidAmount)}</span>
          </TotalRow>
          {dueAmount > 0 && (
            <TotalRow $isDue>
              <span>Remaining Balance Due:</span>
              <span>{formatCurrency(dueAmount)}</span>
            </TotalRow>
          )}
          <TotalRow $isFinal>
            <span>Net Settled Amount:</span>
            <span>{formatCurrency(sale.paidAmount)}</span>
          </TotalRow>
        </TotalsBox>

        <PrintNotice>
          Official computer shop billing receipt generated by StockWise ERP
        </PrintNotice>
      </ReceiptContainer>
    </GenericModal>
  );
};
