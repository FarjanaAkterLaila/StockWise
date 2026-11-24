import React from "react";
import { ACCOUNTS_TABS, APP_STRINGS } from "@/utils/constants";
import { useAccounts } from "@/hooks/useAccounts";
import { AccountsOverviewStats } from "./AccountsOverviewStats";
import { GenericLoader } from "@/components/common/GenericLoader";
import { FinancialAnalytics } from "./FinancialAnalytics";
import { ExpenseManagement } from "./ExpenseManagement";
import { IncomeManagement } from "./IncomeManagement";
import { CustomerPayments } from "./CustomerPayments";
import { SupplierPayments } from "./SupplierPayments";
import { ExpenseModal } from "./ExpenseModal";
import { IncomeModal } from "./IncomeModal";
import { BarChart3, Receipt, Coins, Users, Truck, Plus } from "lucide-react";
import {
  AccountsContainer,
  TopActionHeader,
  TitleWrap,
  PageTitle,
  PageSubtitle,
  HeaderActions,
  RecordExpenseBtn,
  RecordIncomeBtn,
  TabNav,
  TabItem,
  TabBadge,
  TabContentPanel,
} from "./Accounts.styles";

export const AccountsModule: React.FC = () => {
  const {
    loading,
    activeTab,
    setActiveTab,
    isCreateExpenseOpen,
    isCreateIncomeOpen,
    expenses,
    incomes,
    customerPayments,
    supplierPayments,
    monthlyFinancials,
    overviewMetrics,
    handleSaveExpense,
    handleDeleteExpense,
    handleSaveIncome,
    handleOpenRecordExpense,
    handleOpenRecordIncome,
    handleCloseRecordExpense,
    handleCloseRecordIncome,
  } = useAccounts();

  return (
    <AccountsContainer>
      <TopActionHeader>
        <TitleWrap>
          <PageTitle>{APP_STRINGS.accountsTitle}</PageTitle>
          <PageSubtitle>{APP_STRINGS.accountsSubtitle}</PageSubtitle>
        </TitleWrap>

        <HeaderActions>
          <RecordIncomeBtn type="button" onClick={handleOpenRecordIncome}>
            <Plus size={16} />
            <span>{APP_STRINGS.recordIncomeBtn}</span>
          </RecordIncomeBtn>

          <RecordExpenseBtn type="button" onClick={handleOpenRecordExpense}>
            <Plus size={16} />
            <span>{APP_STRINGS.recordExpenseBtn}</span>
          </RecordExpenseBtn>
        </HeaderActions>
      </TopActionHeader>

      {loading ? (
        <GenericLoader
          message="Loading financial ledger..."
          subtext="Fetching live expenses, customer receipts, and vendor payouts"
        />
      ) : (
        <>
          <AccountsOverviewStats
            totalRevenue={overviewMetrics.totalRevenue}
            totalExpenses={overviewMetrics.totalExpenses}
            totalReceived={overviewMetrics.totalReceived}
            totalPayable={overviewMetrics.totalPayable}
            netProfit={overviewMetrics.netProfit}
            marginPercentage={overviewMetrics.marginPercentage}
          />

          <TabNav>
            <TabItem
              type="button"
              $isActive={activeTab === ACCOUNTS_TABS.ANALYTICS}
              onClick={() => setActiveTab(ACCOUNTS_TABS.ANALYTICS)}
            >
              <BarChart3 size={16} />
              <span>Financial Analytics</span>
            </TabItem>

            <TabItem
              type="button"
              $isActive={activeTab === ACCOUNTS_TABS.EXPENSES}
              onClick={() => setActiveTab(ACCOUNTS_TABS.EXPENSES)}
            >
              <Receipt size={16} />
              <span>Expense Management</span>
              <TabBadge $isActive={activeTab === ACCOUNTS_TABS.EXPENSES}>
                {expenses.length}
              </TabBadge>
            </TabItem>

            <TabItem
              type="button"
              $isActive={activeTab === ACCOUNTS_TABS.INCOME}
              onClick={() => setActiveTab(ACCOUNTS_TABS.INCOME)}
            >
              <Coins size={16} />
              <span>Income Management</span>
              <TabBadge $isActive={activeTab === ACCOUNTS_TABS.INCOME}>
                {incomes.length}
              </TabBadge>
            </TabItem>

            <TabItem
              type="button"
              $isActive={activeTab === ACCOUNTS_TABS.CUSTOMER_PAYMENTS}
              onClick={() => setActiveTab(ACCOUNTS_TABS.CUSTOMER_PAYMENTS)}
            >
              <Users size={16} />
              <span>Customer Payments</span>
              <TabBadge $isActive={activeTab === ACCOUNTS_TABS.CUSTOMER_PAYMENTS}>
                {customerPayments.length}
              </TabBadge>
            </TabItem>

            <TabItem
              type="button"
              $isActive={activeTab === ACCOUNTS_TABS.SUPPLIER_PAYMENTS}
              onClick={() => setActiveTab(ACCOUNTS_TABS.SUPPLIER_PAYMENTS)}
            >
              <Truck size={16} />
              <span>Supplier Payments</span>
              <TabBadge $isActive={activeTab === ACCOUNTS_TABS.SUPPLIER_PAYMENTS}>
                {supplierPayments.length}
              </TabBadge>
            </TabItem>
          </TabNav>

          <TabContentPanel key={activeTab}>
            {activeTab === ACCOUNTS_TABS.ANALYTICS && (
              <FinancialAnalytics
                monthlyData={monthlyFinancials}
                expenses={expenses}
                totalRevenue={overviewMetrics.totalRevenue}
                totalExpenses={overviewMetrics.totalExpenses}
              />
            )}

            {activeTab === ACCOUNTS_TABS.EXPENSES && (
              <ExpenseManagement
                expenses={expenses}
                onSaveExpense={handleSaveExpense}
                onDeleteExpense={handleDeleteExpense}
                onOpenCreate={handleOpenRecordExpense}
              />
            )}

            {activeTab === ACCOUNTS_TABS.INCOME && (
              <IncomeManagement
                incomes={incomes}
                onOpenCreate={handleOpenRecordIncome}
              />
            )}

            {activeTab === ACCOUNTS_TABS.CUSTOMER_PAYMENTS && (
              <CustomerPayments payments={customerPayments} />
            )}

            {activeTab === ACCOUNTS_TABS.SUPPLIER_PAYMENTS && (
              <SupplierPayments payments={supplierPayments} />
            )}
          </TabContentPanel>
        </>
      )}

      {isCreateExpenseOpen && (
        <ExpenseModal
          isOpen={isCreateExpenseOpen}
          onClose={handleCloseRecordExpense}
          onSave={handleSaveExpense}
        />
      )}

      {isCreateIncomeOpen && (
        <IncomeModal
          isOpen={isCreateIncomeOpen}
          onClose={handleCloseRecordIncome}
          onSave={handleSaveIncome}
        />
      )}
    </AccountsContainer>
  );
};
