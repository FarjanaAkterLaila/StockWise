import React from "react";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import {
  StatsGrid,
  StatCard,
  StatIconBox,
  StatDetails,
  StatLabel,
  StatValue,
  StatBadge,
} from "./Accounts.styles";

interface AccountsOverviewStatsProps {
  totalIncome: number;
  totalExpenses: number;
  totalPurchasePayments: number;
  totalPayable: number;
  totalReceivable: number;
  netCashFlow: number;
  marginPercentage: number;
}

export const AccountsOverviewStats: React.FC<AccountsOverviewStatsProps> = ({
  totalIncome,
  totalExpenses,
  totalPurchasePayments,
  totalPayable,
  totalReceivable,
  netCashFlow,
  marginPercentage,
}) => {
  return (
    <StatsGrid>
      <StatCard>
        <StatIconBox $colorVariant="primary">
          <TrendingUp size={22} />
        </StatIconBox>
        <StatDetails>
            <StatLabel>Total Income</StatLabel>
            <StatValue>{formatCurrency(totalIncome)}</StatValue>
          <StatBadge $positive={netCashFlow >= 0}>
            <span>{netCashFlow >= 0 ? "+" : ""}{formatCurrency(netCashFlow)} Net Cash ({marginPercentage}%)</span>
          </StatBadge>
        </StatDetails>
      </StatCard>

      <StatCard>
        <StatIconBox $colorVariant="danger">
          <TrendingDown size={22} />
        </StatIconBox>
        <StatDetails>
          <StatLabel>Total Expenses</StatLabel>
          <StatValue>{formatCurrency(totalExpenses)}</StatValue>
            <StatBadge $positive={false}>
            <span>Expense records only</span>
          </StatBadge>
        </StatDetails>
      </StatCard>

      <StatCard>
        <StatIconBox $colorVariant="warning">
          <TrendingDown size={22} />
        </StatIconBox>
        <StatDetails>
          <StatLabel>Purchase Payments</StatLabel>
          <StatValue>{formatCurrency(totalPurchasePayments)}</StatValue>
          <StatBadge $positive={false}>
            <span>Supplier payments recorded</span>
          </StatBadge>
        </StatDetails>
      </StatCard>

      <StatCard>
        <StatIconBox $colorVariant={totalPayable > 0 ? "warning" : "success"}>
          <Clock size={22} />
        </StatIconBox>
        <StatDetails>
          <StatLabel>Total Payable</StatLabel>
          <StatValue>{formatCurrency(totalPayable)}</StatValue>
          <StatBadge $positive={totalPayable === 0}>
            <span>{totalPayable > 0 ? "Distributor Dues Pending" : "All Vendors Settled"}</span>
          </StatBadge>
        </StatDetails>
      </StatCard>

      <StatCard>
        <StatIconBox $colorVariant={totalReceivable > 0 ? "info" : "success"}>
          <Clock size={22} />
        </StatIconBox>
        <StatDetails>
          <StatLabel>Total Receivable</StatLabel>
          <StatValue>{formatCurrency(totalReceivable)}</StatValue>
          <StatBadge $positive={totalReceivable === 0}>
            <span>{totalReceivable > 0 ? "Customer Dues Pending" : "All Customers Settled"}</span>
          </StatBadge>
        </StatDetails>
      </StatCard>
    </StatsGrid>
  );
};
