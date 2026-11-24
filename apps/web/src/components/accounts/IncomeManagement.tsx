import React from "react";
import type { Income } from "@/types";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { INCOME_SOURCES, PAYMENT_METHODS, DEFAULT_VALUES } from "@/utils/constants";
import {
  INCOME_COLUMNS,
  PAYMENT_ICON_MAP,
  SOURCE_VARIANT_MAP,
} from "@/utils/accounts.utils";
import { useIncomeManagement } from "@/hooks/useIncomeManagement";
import { DataTable } from "@/components/common/DataTable";
import { Badge } from "@/components/common/Badge";
import { CustomSelect } from "@/components/common/CustomSelect";
import { ViewModal } from "@/components/common/ViewModal";
import {
  Search,
  Filter,
  RotateCcw,
  Plus,
  Coins,
  Eye,
  Building2,
  Calendar,
  CreditCard,
  Tag,
  User,
} from "lucide-react";
import {
  FilterBarCard,
  FilterControlsRow,
  SearchField,
  SearchInput,
  FilterSelectsGroup,
  ClearFilterBtn,
  InlineCreateBtn,
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
  CellDateText,
  CellAmountText,
  CellMethodWrap,
  CellTruncateText,
  VoucherCompanyCol,
  VoucherCompanyTitle,
  VoucherCompanyAddress,
  VoucherDocBadgeWrap,
  VoucherDocNumber,
  VoucherPartyLabel,
  VoucherPartyName,
  VoucherMetaItem,
  TotalsValueText,
} from "./Accounts.styles";

interface IncomeManagementProps {
  incomes: Income[];
  onOpenCreate: () => void;
}

export const IncomeManagement: React.FC<IncomeManagementProps> = ({
  incomes,
  onOpenCreate,
}) => {
  const {
    searchTerm,
    setSearchTerm,
    selectedSource,
    setSelectedSource,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    viewingIncome,
    setViewingIncome,
    filteredIncomes,
    hasActiveFilters,
    handleResetFilters,
  } = useIncomeManagement(incomes);

  return (
    <>
      <FilterBarCard>
        <FilterControlsRow>
          <SearchField>
            <Search size={18} />
            <SearchInput
              type="text"
              placeholder="Search income by reference, source, client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchField>

          <FilterSelectsGroup>
            <CustomSelect
              value={selectedSource}
              onChange={setSelectedSource}
              icon={<Filter size={14} />}
              ariaLabel="Filter income by source"
              options={INCOME_SOURCES.map((s) => ({
                value: s === "All" ? DEFAULT_VALUES.FILTER_ALL : s,
                label: s === "All" ? "All Sources" : s,
              }))}
            />

            <CustomSelect
              value={selectedPaymentMethod}
              onChange={setSelectedPaymentMethod}
              ariaLabel="Filter income by payment method"
              options={[
                { value: DEFAULT_VALUES.FILTER_ALL, label: "All Payment Methods" },
                ...PAYMENT_METHODS.map((m) => ({ value: m, label: m })),
              ]}
            />

            {hasActiveFilters && (
              <ClearFilterBtn onClick={handleResetFilters} type="button">
                <RotateCcw size={14} />
                <span>Reset</span>
              </ClearFilterBtn>
            )}

            <InlineCreateBtn
              type="button"
              onClick={onOpenCreate}
            >
              <Plus size={15} />
              <span>Record Income</span>
            </InlineCreateBtn>
          </FilterSelectsGroup>
        </FilterControlsRow>
      </FilterBarCard>

      <DataTable
        columns={INCOME_COLUMNS}
        itemCount={filteredIncomes.length}
        totalAllCount={incomes.length}
        itemLabel="income transactions"
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        emptyIcon={<Coins size={28} />}
        emptyTitle="No Income Transactions Found"
        emptyDesc="No revenue records match your current search or source filters. Try resetting the filters or add a new income transaction."
      >
        {filteredIncomes.map((inc) => {
          const PayIcon = PAYMENT_ICON_MAP[inc.paymentMethod] || CreditCard;
          return (
            <TableRow key={inc.id}>
              <TableCell>
                <CellStack>
                  <CellPrimaryText>{inc.referenceNumber}</CellPrimaryText>
                  <CellDateText>{formatDate(inc.date)}</CellDateText>
                </CellStack>
              </TableCell>

              <TableCell>
                <Badge variant={SOURCE_VARIANT_MAP[inc.source] || "neutral"} size="sm">
                  {inc.source}
                </Badge>
              </TableCell>

              <TableCell>
                <CellAmountText>{inc.payerName || "Walk-in Client"}</CellAmountText>
              </TableCell>

              <TableCell>
                <CellAmountText $bold>{formatCurrency(inc.amount)}</CellAmountText>
              </TableCell>

              <TableCell>
                <CellMethodWrap>
                  <PayIcon size={14} />
                  <span>{inc.paymentMethod}</span>
                </CellMethodWrap>
              </TableCell>

              <TableCell>
                <CellTruncateText>{inc.description}</CellTruncateText>
              </TableCell>

              <TableCell $align="right">
                <ActionButtonsGroup>
                  <ActionBtn
                    $variant="view"
                    type="button"
                    onClick={() => setViewingIncome(inc)}
                    title="View Credit Receipt"
                  >
                    <Eye size={15} />
                  </ActionBtn>
                </ActionButtonsGroup>
              </TableCell>
            </TableRow>
          );
        })}
      </DataTable>

      {/* View Income Voucher Modal */}
      {viewingIncome && (
        <ViewModal
          isOpen={Boolean(viewingIncome)}
          onClose={() => setViewingIncome(null)}
          title={`Credit Income Voucher • ${viewingIncome.referenceNumber}`}
          subtitle="Official store revenue receipt verified by StockWise Accounts"
          size="md"
          printLabel="Print Credit Voucher"
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
              <Badge variant="success" size="sm" dot>
                CREDIT RECEIPT
              </Badge>
              <VoucherDocNumber>{viewingIncome.referenceNumber}</VoucherDocNumber>
            </VoucherDocBadgeWrap>
          </VoucherHeader>

          <VoucherPartyCard>
            <VoucherPartyLabel>
              <User size={13} />
              <span>Received From / Payer:</span>
            </VoucherPartyLabel>
            <VoucherPartyName>
              {viewingIncome.payerName || "Retail Client / Walk-in"}
            </VoucherPartyName>
          </VoucherPartyCard>

          <VoucherMetaGrid>
            <VoucherMetaCard>
              <VoucherMetaLabel>Revenue Stream / Source</VoucherMetaLabel>
              <VoucherMetaValue>
                <VoucherMetaItem>
                  <Tag size={13} />
                  <span>{viewingIncome.source}</span>
                </VoucherMetaItem>
              </VoucherMetaValue>
            </VoucherMetaCard>

            <VoucherMetaCard>
              <VoucherMetaLabel>Payment Channel</VoucherMetaLabel>
              <VoucherMetaValue>
                <VoucherMetaItem>
                  <CreditCard size={13} />
                  <span>{viewingIncome.paymentMethod}</span>
                </VoucherMetaItem>
              </VoucherMetaValue>
            </VoucherMetaCard>

            <VoucherMetaCard>
              <VoucherMetaLabel>Collection Date</VoucherMetaLabel>
              <VoucherMetaValue>
                <VoucherMetaItem>
                  <Calendar size={13} />
                  <span>{formatDate(viewingIncome.date)}</span>
                </VoucherMetaItem>
              </VoucherMetaValue>
            </VoucherMetaCard>

            <VoucherMetaCard>
              <VoucherMetaLabel>Receipt Status</VoucherMetaLabel>
              <VoucherMetaValue>
                <Badge variant="success" size="sm">
                  SETTLED & RECEIVED
                </Badge>
              </VoucherMetaValue>
            </VoucherMetaCard>
          </VoucherMetaGrid>

          <TotalsCard>
            <TotalsRow>
              <span>Transaction Memo:</span>
              <TotalsValueText>{viewingIncome.description}</TotalsValueText>
            </TotalsRow>
            <TotalsRow $isGrandTotal>
              <span>Net Inflow Amount:</span>
              <TotalsAmount>
                {formatCurrency(viewingIncome.amount)}
              </TotalsAmount>
            </TotalsRow>
          </TotalsCard>

          <PrintNotice>
            StockWise ERP verified transaction ledger • Computer Market Multiplan Center
          </PrintNotice>
        </ViewModal>
      )}
    </>
  );
};
