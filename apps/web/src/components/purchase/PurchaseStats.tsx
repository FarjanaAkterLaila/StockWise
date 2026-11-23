import React from "react";
import {
  ShoppingBag,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import {
  StatsGrid,
  StatCard,
  StatIconBox,
  StatDetails,
  StatLabel,
  StatValue,
} from "./Purchase.styles";

interface PurchaseStatsProps {
  totalOrders: number;
  totalExpense: number;
  totalPaid: number;
  totalDue: number;
}

export const PurchaseStats: React.FC<PurchaseStatsProps> = ({
  totalOrders,
  totalExpense,
  totalPaid,
  totalDue,
}) => {
  return (
    <StatsGrid>
      <StatCard>
        <StatIconBox $colorVariant="primary">
          <ShoppingBag size={20} />
        </StatIconBox>
        <StatDetails>
          <StatLabel>Purchase Orders</StatLabel>
          <StatValue>{totalOrders}</StatValue>
        </StatDetails>
      </StatCard>

      <StatCard>
        <StatIconBox $colorVariant="info">
          <TrendingDown size={20} />
        </StatIconBox>
        <StatDetails>
          <StatLabel>Total Procurement</StatLabel>
          <StatValue>{formatCurrency(totalExpense)}</StatValue>
        </StatDetails>
      </StatCard>

      <StatCard>
        <StatIconBox $colorVariant="success">
          <CheckCircle2 size={20} />
        </StatIconBox>
        <StatDetails>
          <StatLabel>Settled (Paid)</StatLabel>
          <StatValue>{formatCurrency(totalPaid)}</StatValue>
        </StatDetails>
      </StatCard>

      <StatCard>
        <StatIconBox $colorVariant="warning">
          <AlertCircle size={20} />
        </StatIconBox>
        <StatDetails>
          <StatLabel>Outstanding Due</StatLabel>
          <StatValue>{formatCurrency(totalDue)}</StatValue>
        </StatDetails>
      </StatCard>
    </StatsGrid>
  );
};
