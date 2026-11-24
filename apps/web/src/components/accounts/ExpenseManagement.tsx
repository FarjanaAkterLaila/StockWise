import React from "react";
import type { Expense } from "@/types";
import { formatCurrency } from "@/utils/formatters";
import { EXPENSE_CATEGORIES, DEFAULT_VALUES } from "@/utils/constants";
import {
  EXPENSE_COLUMNS,
  ACCOUNTS_PAYMENT_METHODS,
  PAYMENT_ICON_MAP,
  CATEGORY_VARIANT_MAP,
  formatAccountsDate,
} from "@/utils/accounts.utils";
import { useExpenseManagement } from "@/hooks/useExpenseManagement";
import { DataTable } from "@/components/common/DataTable";
import { Badge } from "@/components/common/Badge";
import { CustomSelect } from "@/components/common/CustomSelect";
import { ViewModal } from "@/components/common/ViewModal";
import { GenericModal } from "@/components/common/GenericModal";
import { ExpenseModal } from "./ExpenseModal";
import {
  Search,
  Filter,
  RotateCcw,
  Plus,
  Receipt,
  Eye,
  Edit2,
  Trash2,
  Building2,
  Calendar,
  CreditCard,
  Tag,
} from "lucide-react";
import {
  FilterBarCard,
  FilterControlsRow,
  SearchField,
  SearchInput,
  FilterSelectsGroup,
  DateRangeGroup,
  DateRangeSeparator,
  DateInput,
  ClearFilterBtn,
  InlineCreateBtn,
  TableRow,
  TableCell,
  ActionButtonsGroup,
  ActionBtn,
  VoucherHeader,
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
  CellCodeText,
  CellDateText,
  CellAmountText,
  CellMethodWrap,
  VoucherCompanyCol,
  VoucherCompanyTitle,
  VoucherCompanyAddress,
  VoucherDocBadgeWrap,
  VoucherDocNumber,
  VoucherMetaItem,
  TotalsValueText,
} from "./Accounts.styles";

interface ExpenseManagementProps {
  expenses: Expense[];
  onSaveExpense: (expense: Expense) => Promise<boolean>;
  onDeleteExpense: (expenseId: string) => Promise<boolean>;
  onOpenCreate: () => void;
}

export const ExpenseManagement: React.FC<ExpenseManagementProps> = ({
  expenses,
  onSaveExpense,
  onDeleteExpense,
  onOpenCreate,
}) => {
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    editingExpense,
    setEditingExpense,
    viewingExpense,
    setViewingExpense,
    deletingExpense,
    setDeletingExpense,
    filteredExpenses,
    hasActiveFilters,
    handleResetFilters,
    handleConfirmDelete,
  } = useExpenseManagement(expenses, onDeleteExpense);

  return (
    <>
      <FilterBarCard>
        <FilterControlsRow>
          <SearchField>
            <Search size={18} />
            <SearchInput
              type="text"
              placeholder="Search expenses by title or record ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchField>

          <FilterSelectsGroup>
            <CustomSelect
              value={selectedCategory}
              onChange={setSelectedCategory}
              icon={<Filter size={14} />}
              ariaLabel="Filter expenses by category"
              options={EXPENSE_CATEGORIES.map((c) => ({
                value: c === "All" ? DEFAULT_VALUES.FILTER_ALL : c,
                label: c === "All" ? "All Categories" : c,
              }))}
            />

            <CustomSelect
              value={selectedPaymentMethod}
              onChange={setSelectedPaymentMethod}
              ariaLabel="Filter expenses by payment method"
              options={[
                { value: DEFAULT_VALUES.FILTER_ALL, label: "All Payment Methods" },
                ...ACCOUNTS_PAYMENT_METHODS.map((m) => ({ value: m, label: m })),
              ]}
            />

            <DateRangeGroup>
              <DateInput
                type="date"
                aria-label="Expenses from date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <DateRangeSeparator>–</DateRangeSeparator>
              <DateInput
                type="date"
                aria-label="Expenses to date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </DateRangeGroup>

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
              <span>Add Expense</span>
            </InlineCreateBtn>
          </FilterSelectsGroup>
        </FilterControlsRow>
      </FilterBarCard>

      <DataTable
        columns={EXPENSE_COLUMNS}
        itemCount={filteredExpenses.length}
        totalAllCount={expenses.length}
        itemLabel="expenses"
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        emptyIcon={<Receipt size={28} />}
        emptyTitle="No Expenses Found"
        emptyDesc="No store expense records match your current search or category filter. Try clearing filters or record a new expense voucher."
      >
        {filteredExpenses.map((exp) => {
          const PayIcon = PAYMENT_ICON_MAP[exp.paymentMethod] || CreditCard;
          return (
            <TableRow key={exp.id}>
              <TableCell>
                <CellStack>
                  <CellPrimaryText>{exp.title}</CellPrimaryText>
                  <CellCodeText>{exp.id}</CellCodeText>
                </CellStack>
              </TableCell>

              <TableCell>
                <Badge
                  variant={CATEGORY_VARIANT_MAP[exp.category] || "neutral"}
                  size="sm"
                >
                  {exp.category}
                </Badge>
              </TableCell>

              <TableCell>
              <CellDateText>{formatAccountsDate(exp.date)}</CellDateText>
              </TableCell>

              <TableCell>
                <CellAmountText $bold>{formatCurrency(exp.amount)}</CellAmountText>
              </TableCell>

              <TableCell>
                <CellMethodWrap>
                  <PayIcon size={14} />
                  <span>{exp.paymentMethod}</span>
                </CellMethodWrap>
              </TableCell>

              <TableCell $align="right">
                <ActionButtonsGroup>
                  <ActionBtn
                    $variant="view"
                    type="button"
                    onClick={() => setViewingExpense(exp)}
                    title="View Voucher"
                  >
                    <Eye size={15} />
                  </ActionBtn>

                  <ActionBtn
                    $variant="edit"
                    type="button"
                    onClick={() => setEditingExpense(exp)}
                    title="Edit Expense"
                  >
                    <Edit2 size={15} />
                  </ActionBtn>

                  <ActionBtn
                    $variant="delete"
                    type="button"
                    onClick={() => setDeletingExpense(exp)}
                    title="Delete Expense"
                  >
                    <Trash2 size={15} />
                  </ActionBtn>
                </ActionButtonsGroup>
              </TableCell>
            </TableRow>
          );
        })}
      </DataTable>

      {/* Edit Expense Modal */}
      {editingExpense && (
        <ExpenseModal
          key={editingExpense.id}
          isOpen={Boolean(editingExpense)}
          initialExpense={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSave={onSaveExpense}
        />
      )}

      {/* View Expense Voucher Modal */}
      {viewingExpense && (
        <ViewModal
          isOpen={Boolean(viewingExpense)}
          onClose={() => setViewingExpense(null)}
          title={`Expense Payment Voucher • ${viewingExpense.id}`}
          subtitle="Official store debit voucher generated by StockWise ERP"
          size="md"
          printLabel="Print Expense Voucher"
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
              <Badge variant="danger" size="sm" dot>
                DEBIT VOUCHER
              </Badge>
              <VoucherDocNumber>
                {viewingExpense.id}
              </VoucherDocNumber>
            </VoucherDocBadgeWrap>
          </VoucherHeader>

          <VoucherMetaGrid>
            <VoucherMetaCard>
              <VoucherMetaLabel>Expense Category</VoucherMetaLabel>
              <VoucherMetaValue>
                <VoucherMetaItem>
                  <Tag size={13} />
                  <span>{viewingExpense.category}</span>
                </VoucherMetaItem>
              </VoucherMetaValue>
            </VoucherMetaCard>

            <VoucherMetaCard>
              <VoucherMetaLabel>Payment Method</VoucherMetaLabel>
              <VoucherMetaValue>
                <VoucherMetaItem>
                  <CreditCard size={13} />
                  <span>{viewingExpense.paymentMethod}</span>
                </VoucherMetaItem>
              </VoucherMetaValue>
            </VoucherMetaCard>

            <VoucherMetaCard>
              <VoucherMetaLabel>Voucher Date</VoucherMetaLabel>
              <VoucherMetaValue>
                <VoucherMetaItem>
                  <Calendar size={13} />
                  <span>{formatAccountsDate(viewingExpense.date)}</span>
                </VoucherMetaItem>
              </VoucherMetaValue>
            </VoucherMetaCard>

            <VoucherMetaCard>
              <VoucherMetaLabel>Voucher Status</VoucherMetaLabel>
              <VoucherMetaValue>
                <Badge variant="success" size="sm">
                  PAID IN FULL
                </Badge>
              </VoucherMetaValue>
            </VoucherMetaCard>
          </VoucherMetaGrid>

          <TotalsCard>
            <TotalsRow>
              <span>Expenditure Title:</span>
              <TotalsValueText>{viewingExpense.title}</TotalsValueText>
            </TotalsRow>
            <TotalsRow $isGrandTotal>
              <span>Total Disbursed Amount:</span>
              <TotalsAmount $danger>
                {formatCurrency(viewingExpense.amount)}
              </TotalsAmount>
            </TotalsRow>
          </TotalsCard>

          <PrintNotice>
            Official store expenditure disbursement record verified by StockWise Accounts
          </PrintNotice>
        </ViewModal>
      )}

      {/* Delete Confirmation Modal */}
      <GenericModal
        isOpen={Boolean(deletingExpense)}
        onClose={() => setDeletingExpense(null)}
        title="Delete Expense Record?"
        subtitle="This action will permanently remove this voucher from the ledger."
        message={`Are you sure you want to delete "${deletingExpense?.title}" (${deletingExpense ? formatCurrency(deletingExpense.amount) : ""})? This will alter historical operating expense calculations.`}
        confirmText="Delete Expense"
        variant="danger"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};
