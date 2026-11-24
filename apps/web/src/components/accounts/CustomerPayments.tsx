import React from "react";
import type { CustomerPaymentRecord } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { PAYMENT_STATUS_OPTIONS } from "@/utils/constants";
import {
  CUSTOMER_PAYMENT_COLUMNS,
  PAYMENT_ICON_MAP,
  PAYMENT_STATUS_VARIANT_MAP,
} from "@/utils/accounts.utils";
import { useCustomerPayments } from "@/hooks/useCustomerPayments";
import { DataTable } from "@/components/common/DataTable";
import { Badge } from "@/components/common/Badge";
import { CustomSelect } from "@/components/common/CustomSelect";
import { ViewModal } from "@/components/common/ViewModal";
import {
  Search,
  RotateCcw,
  Users,
  Eye,
  Building2,
  Calendar,
  CreditCard,
  Phone,
  Receipt,
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
  VoucherPartyRow,
  VoucherPartyName,
  VoucherBadgeWrap,
  VoucherPhoneWrap,
  VoucherMetaItem,
  TotalsValueText,
} from "./Accounts.styles";

interface CustomerPaymentsProps {
  payments: CustomerPaymentRecord[];
}

export const CustomerPayments: React.FC<CustomerPaymentsProps> = ({
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
  } = useCustomerPayments(payments);

  return (
    <>
      <FilterBarCard>
        <FilterControlsRow>
          <SearchField>
            <Search size={18} />
            <SearchInput
              type="text"
              placeholder="Search customer payments by name, phone (+880), invoice..."
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
        columns={CUSTOMER_PAYMENT_COLUMNS}
        itemCount={filteredPayments.length}
        totalAllCount={payments.length}
        itemLabel="customer payment records"
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        emptyIcon={<Users size={28} />}
        emptyTitle="No Customer Payment Records Found"
        emptyDesc="No customer settlement history matches your search keyword or payment status filter."
      >
        {filteredPayments.map((p) => {
          const PayIcon = PAYMENT_ICON_MAP[p.paymentMethod] || CreditCard;
          return (
            <TableRow key={p.id}>
              <TableCell>
                <CellStack>
                  <CellPrimaryText>{p.customerName}</CellPrimaryText>
                  {p.customerPhone && (
                    <CellSecondaryText>{p.customerPhone}</CellSecondaryText>
                  )}
                </CellStack>
              </TableCell>

              <TableCell>
                <Badge
                  variant={p.customerType === "Wholesale" ? "primary" : "neutral"}
                  size="sm"
                >
                  {p.customerType}
                </Badge>
              </TableCell>

              <TableCell>
                <CellCodeText>{p.invoiceNumber}</CellCodeText>
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
                    title="View Settlement Receipt"
                  >
                    <Eye size={15} />
                  </ActionBtn>
                </ActionButtonsGroup>
              </TableCell>
            </TableRow>
          );
        })}
      </DataTable>

      {/* Customer Settlement Statement Modal */}
      {viewingPayment && (
        <ViewModal
          isOpen={Boolean(viewingPayment)}
          onClose={() => setViewingPayment(null)}
          title={`Customer Payment Ledger • ${viewingPayment.invoiceNumber}`}
          subtitle="Official customer clearance receipt generated by StockWise"
          size="md"
          printLabel="Print Payment Statement"
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
              <VoucherDocNumber>{viewingPayment.invoiceNumber}</VoucherDocNumber>
            </VoucherDocBadgeWrap>
          </VoucherHeader>

          <VoucherPartyCard>
            <VoucherPartyLabel>
              <Users size={13} />
              <span>Customer Account Information:</span>
            </VoucherPartyLabel>
            <VoucherPartyRow>
              <div>
                <VoucherPartyName $larger>{viewingPayment.customerName}</VoucherPartyName>
                <VoucherBadgeWrap>
                  <Badge variant={viewingPayment.customerType === "Wholesale" ? "primary" : "neutral"} size="sm">
                    {viewingPayment.customerType}
                  </Badge>
                </VoucherBadgeWrap>
              </div>
              {viewingPayment.customerPhone && (
                <VoucherPhoneWrap>
                  <Phone size={13} />
                  <span>{viewingPayment.customerPhone}</span>
                </VoucherPhoneWrap>
              )}
            </VoucherPartyRow>
          </VoucherPartyCard>

          <VoucherMetaGrid>
            <VoucherMetaCard>
              <VoucherMetaLabel>Settlement Method</VoucherMetaLabel>
              <VoucherMetaValue>
                <VoucherMetaItem>
                  <CreditCard size={13} />
                  <span>{viewingPayment.paymentMethod}</span>
                </VoucherMetaItem>
              </VoucherMetaValue>
            </VoucherMetaCard>

            <VoucherMetaCard>
              <VoucherMetaLabel>Payment Date</VoucherMetaLabel>
              <VoucherMetaValue>
                <VoucherMetaItem>
                  <Calendar size={13} />
                  <span>{formatDate(viewingPayment.date)}</span>
                </VoucherMetaItem>
              </VoucherMetaValue>
            </VoucherMetaCard>

            <VoucherMetaCard>
              <VoucherMetaLabel>Invoice Reference</VoucherMetaLabel>
              <VoucherMetaValue>
                <VoucherMetaItem>
                  <Receipt size={13} />
                  <span>{viewingPayment.invoiceNumber}</span>
                </VoucherMetaItem>
              </VoucherMetaValue>
            </VoucherMetaCard>

            <VoucherMetaCard>
              <VoucherMetaLabel>Current Ledger Status</VoucherMetaLabel>
              <VoucherMetaValue>
                <Badge
                  variant={viewingPayment.dueAmount === 0 ? "success" : "warning"}
                  size="sm"
                >
                  {viewingPayment.dueAmount === 0 ? "ZERO BALANCE DUE" : "PARTIAL DUE PENDING"}
                </Badge>
              </VoucherMetaValue>
            </VoucherMetaCard>
          </VoucherMetaGrid>

          <TotalsCard>
            <TotalsRow>
              <span>Total Bill Invoice Amount:</span>
              <TotalsValueText>{formatCurrency(viewingPayment.totalAmount)}</TotalsValueText>
            </TotalsRow>
            <TotalsRow>
              <span>Total Received / Paid:</span>
              <TotalsValueText $bold>
                {formatCurrency(viewingPayment.paidAmount)}
              </TotalsValueText>
            </TotalsRow>
            <TotalsRow $isGrandTotal>
              <span>Outstanding Receivable Due:</span>
              <TotalsAmount $danger={viewingPayment.dueAmount > 0}>
                {formatCurrency(viewingPayment.dueAmount)}
              </TotalsAmount>
            </TotalsRow>
          </TotalsCard>

          <PrintNotice>
            Official customer payment statement generated by StockWise Computer Hub BD Accounts
          </PrintNotice>
        </ViewModal>
      )}
    </>
  );
};
