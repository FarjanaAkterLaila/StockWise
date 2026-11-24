import React from "react";
import type { SupplierPaymentRecord } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { PAYMENT_STATUS_OPTIONS } from "@/utils/constants";
import {
  SUPPLIER_PAYMENT_COLUMNS,
  PAYMENT_ICON_MAP,
  PAYMENT_STATUS_VARIANT_MAP,
} from "@/utils/accounts.utils";
import { useSupplierPayments } from "@/hooks/useSupplierPayments";
import { DataTable } from "@/components/common/DataTable";
import { Badge } from "@/components/common/Badge";
import { CustomSelect } from "@/components/common/CustomSelect";
import { ViewModal } from "@/components/common/ViewModal";
import {
  Search,
  RotateCcw,
  Truck,
  Eye,
  Building2,
  Calendar,
  CreditCard,
  FileText,
} from "lucide-react";
import {
  FilterBarCard,
  FilterControlsRow,
  SearchField,
  SearchInput,
  FilterSelectsGroup,
  ClearFilterBtn,
  TableRow,
  TableCell,
  ActionButtonsGroup,
  ActionBtn,
  VoucherHeader,
  VoucherPartyCard,
  VoucherMetaGrid,
  VoucherMetaCard,
  VoucherMetaLabel,
  VoucherMetaValue,
  TotalsCard,
  TotalsRow,
  TotalsAmount,
  PrintNotice,
  CellStack,
  CellPrimaryText,
  CellSecondaryText,
  CellCodeText,
  CellDateText,
  CellMethodWrap,
  CellAmountText,
  VoucherCompanyCol,
  VoucherCompanyTitle,
  VoucherCompanyAddress,
  VoucherDocBadgeWrap,
  VoucherDocNumber,
  VoucherPartyLabel,
  VoucherPartyName,
  VoucherSubtitleText,
  VoucherMetaItem,
  TotalsValueText,
} from "./Accounts.styles";

interface SupplierPaymentsProps {
  payments: SupplierPaymentRecord[];
}

export const SupplierPayments: React.FC<SupplierPaymentsProps> = ({
  payments,
}) => {
  const {
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    viewingPayment,
    setViewingPayment,
    filteredPayments,
    hasActiveFilters,
    handleResetFilters,
  } = useSupplierPayments(payments);

  return (
    <>
      <FilterBarCard>
        <FilterControlsRow>
          <SearchField>
            <Search size={18} />
            <SearchInput
              type="text"
              placeholder="Search supplier payments by distributor name, PO number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchField>

          <FilterSelectsGroup>
            <CustomSelect
              value={selectedStatus}
              onChange={setSelectedStatus}
              ariaLabel="Filter by payment status"
              options={PAYMENT_STATUS_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
            />

            {hasActiveFilters && (
              <ClearFilterBtn onClick={handleResetFilters} type="button">
                <RotateCcw size={14} />
                <span>Reset</span>
              </ClearFilterBtn>
            )}
          </FilterSelectsGroup>
        </FilterControlsRow>
      </FilterBarCard>

      <DataTable
        columns={SUPPLIER_PAYMENT_COLUMNS}
        itemCount={filteredPayments.length}
        totalAllCount={payments.length}
        itemLabel="supplier payment records"
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        emptyIcon={<Truck size={28} />}
        emptyTitle="No Supplier Payment Records Found"
        emptyDesc="No distributor restock payment records match your search keyword or payment status filter."
      >
        {filteredPayments.map((p) => {
          const PayIcon = PAYMENT_ICON_MAP[p.paymentMethod] || CreditCard;
          return (
            <TableRow key={p.id}>
              <TableCell>
                <CellStack>
                  <CellPrimaryText>{p.supplierName}</CellPrimaryText>
                  <CellSecondaryText>Authorized Distributor</CellSecondaryText>
                </CellStack>
              </TableCell>

              <TableCell>
                <CellCodeText>{p.purchaseNumber}</CellCodeText>
              </TableCell>

              <TableCell>
                <CellDateText>{formatDate(p.date)}</CellDateText>
              </TableCell>

              <TableCell>
                <CellMethodWrap>
                  <PayIcon size={14} />
                  <span>{p.paymentMethod}</span>
                </CellMethodWrap>
              </TableCell>

              <TableCell>
                <CellAmountText>{formatCurrency(p.totalAmount)}</CellAmountText>
              </TableCell>

              <TableCell>
                <CellAmountText $bold>{formatCurrency(p.paidAmount)}</CellAmountText>
              </TableCell>

              <TableCell>
                {p.dueAmount > 0 ? (
                  <CellAmountText $bold>{formatCurrency(p.dueAmount)}</CellAmountText>
                ) : (
                  <CellDateText>৳0.00</CellDateText>
                )}
              </TableCell>

              <TableCell>
                <Badge
                  variant={PAYMENT_STATUS_VARIANT_MAP[p.paymentStatus] || "neutral"}
                  size="sm"
                  dot
                >
                  {p.paymentStatus}
                </Badge>
              </TableCell>

              <TableCell $align="right">
                <ActionButtonsGroup>
                  <ActionBtn
                    $variant="view"
                    type="button"
                    onClick={() => setViewingPayment(p)}
                    title="View Vendor Voucher"
                  >
                    <Eye size={15} />
                  </ActionBtn>
                </ActionButtonsGroup>
              </TableCell>
            </TableRow>
          );
        })}
      </DataTable>

      {/* Supplier PO Payment Voucher Modal */}
      {viewingPayment && (
        <ViewModal
          isOpen={Boolean(viewingPayment)}
          onClose={() => setViewingPayment(null)}
          title={`Distributor Payable Voucher • ${viewingPayment.purchaseNumber}`}
          subtitle="Stock replenishment procurement clearance statement"
          size="md"
          printLabel="Print PO Voucher"
        >
          <VoucherHeader>
            <VoucherCompanyCol>
              <VoucherCompanyTitle>
                <Building2 size={16} />
                <span>StockWise Computer Hub BD</span>
              </VoucherCompanyTitle>
              <VoucherCompanyAddress>
                Shop 412, Level 4, Multiplan Center, New Elephant Road, Dhaka
              </VoucherCompanyAddress>
            </VoucherCompanyCol>

            <VoucherDocBadgeWrap>
              <Badge
                variant={PAYMENT_STATUS_VARIANT_MAP[viewingPayment.paymentStatus] || "neutral"}
                size="sm"
                dot
              >
                {viewingPayment.paymentStatus.toUpperCase()}
              </Badge>
              <VoucherDocNumber>{viewingPayment.purchaseNumber}</VoucherDocNumber>
            </VoucherDocBadgeWrap>
          </VoucherHeader>

          <VoucherPartyCard>
            <VoucherPartyLabel>
              <Truck size={13} />
              <span>Distributor / Vendor:</span>
            </VoucherPartyLabel>
            <VoucherPartyName $larger>{viewingPayment.supplierName}</VoucherPartyName>
            <VoucherSubtitleText>
              Official National IT Hardware Importer &amp; Distributor
            </VoucherSubtitleText>
          </VoucherPartyCard>

          <VoucherMetaGrid>
            <VoucherMetaCard>
              <VoucherMetaLabel>Payment Channel</VoucherMetaLabel>
              <VoucherMetaValue>
                <VoucherMetaItem>
                  <CreditCard size={13} />
                  <span>{viewingPayment.paymentMethod}</span>
                </VoucherMetaItem>
              </VoucherMetaValue>
            </VoucherMetaCard>

            <VoucherMetaCard>
              <VoucherMetaLabel>PO Invoice Date</VoucherMetaLabel>
              <VoucherMetaValue>
                <VoucherMetaItem>
                  <Calendar size={13} />
                  <span>{formatDate(viewingPayment.date)}</span>
                </VoucherMetaItem>
              </VoucherMetaValue>
            </VoucherMetaCard>

            <VoucherMetaCard>
              <VoucherMetaLabel>Purchase Order Reference</VoucherMetaLabel>
              <VoucherMetaValue>
                <VoucherMetaItem>
                  <FileText size={13} />
                  <span>{viewingPayment.purchaseNumber}</span>
                </VoucherMetaItem>
              </VoucherMetaValue>
            </VoucherMetaCard>

            <VoucherMetaCard>
              <VoucherMetaLabel>Settlement Status</VoucherMetaLabel>
              <VoucherMetaValue>
                <Badge
                  variant={viewingPayment.dueAmount === 0 ? "success" : "danger"}
                  size="sm"
                >
                  {viewingPayment.dueAmount === 0 ? "BILL SETTLED" : "PAYABLE OUTSTANDING"}
                </Badge>
              </VoucherMetaValue>
            </VoucherMetaCard>
          </VoucherMetaGrid>

          <TotalsCard>
            <TotalsRow>
              <span>Total Procurement Amount:</span>
              <TotalsValueText>{formatCurrency(viewingPayment.totalAmount)}</TotalsValueText>
            </TotalsRow>
            <TotalsRow>
              <span>Amount Cleared to Distributor:</span>
              <TotalsValueText $bold>
                {formatCurrency(viewingPayment.paidAmount)}
              </TotalsValueText>
            </TotalsRow>
            <TotalsRow $isGrandTotal>
              <span>Accounts Payable Due:</span>
              <TotalsAmount $danger={viewingPayment.dueAmount > 0}>
                {formatCurrency(viewingPayment.dueAmount)}
              </TotalsAmount>
            </TotalsRow>
          </TotalsCard>

          <PrintNotice>
            StockWise Procurement Accounts Ledger • Computer City Center (Multiplan), Dhaka
          </PrintNotice>
        </ViewModal>
      )}
    </>
  );
};
