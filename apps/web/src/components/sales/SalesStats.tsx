import React from "react";
import { ShoppingBag, Banknote, CheckCircle2, Clock } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import {
  StatsGrid,
  StatCard,
  StatIconBox,
  StatDetails,
  StatLabel,
  StatValue,
} from "./Sales.styles";

interface SalesStatsProps {
  totalInvoices: number;
  totalRevenue: number;
  totalPaid: number;
  totalDue: number;
}

export const SalesStats: React.FC<SalesStatsProps> = ({
  totalInvoices,
  totalRevenue,
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
          <StatLabel>Total Sales Invoices</StatLabel>
          <StatValue>{totalInvoices} Orders</StatValue>
        </StatDetails>
      </StatCard>

      <StatCard>
        <StatIconBox $colorVariant="success">
          <Banknote size={20} />
        </StatIconBox>
        <StatDetails>
          <StatLabel>Gross Sales Volume</StatLabel>
          <StatValue>{formatCurrency(totalRevenue)}</StatValue>
        </StatDetails>
      </StatCard>

      <StatCard>
        <StatIconBox $colorVariant="info">
          <CheckCircle2 size={20} />
        </StatIconBox>
        <StatDetails>
          <StatLabel>Settled Payments</StatLabel>
          <StatValue>{formatCurrency(totalPaid)}</StatValue>
        </StatDetails>
      </StatCard>

      <StatCard>
        <StatIconBox $colorVariant={totalDue > 0 ? "warning" : "success"}>
          <Clock size={20} />
        </StatIconBox>
        <StatDetails>
          <StatLabel>Receivables & Due</StatLabel>
          <StatValue>{formatCurrency(totalDue)}</StatValue>
        </StatDetails>
      </StatCard>
    </StatsGrid>
  );
};
