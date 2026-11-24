import React from "react";
import { TrendingUp, TrendingDown, WalletCards, Clock } from "lucide-react";
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
  totalRevenue: number;
  totalExpenses: number;
  totalReceived: number;
  totalPayable: number;
  netProfit: number;
  marginPercentage: number;
}

export const AccountsOverviewStats: React.FC<AccountsOverviewStatsProps> = ({
  totalRevenue,
  totalExpenses,
  totalReceived,
  totalPayable,
  netProfit,
  marginPercentage,
}) => {
  return (
    <StatsGrid>
      <StatCard>
        <StatIconBox $colorVariant="primary">
          <TrendingUp size={22} />
        </StatIconBox>
        <StatDetails>
          <StatLabel>Total Revenue</StatLabel>
          <StatValue>{formatCurrency(totalRevenue)}</StatValue>
          <StatBadge $positive={netProfit >= 0}>
            <span>{netProfit >= 0 ? "+" : ""}{formatCurrency(netProfit)} Net ({marginPercentage}%)</span>
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
            <span>Procurement & Store Ops</span>
          </StatBadge>
        </StatDetails>
      </StatCard>

      <StatCard>
        <StatIconBox $colorVariant="success">
          <WalletCards size={22} />
        </StatIconBox>
        <StatDetails>
          <StatLabel>Total Received</StatLabel>
          <StatValue>{formatCurrency(totalReceived)}</StatValue>
          <StatBadge $positive={true}>
            <span>Inflow Cash & Bank Settled</span>
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
    </StatsGrid>
  );
};
