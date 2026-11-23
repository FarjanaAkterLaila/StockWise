import React from "react";
import { Package, Boxes, AlertTriangle, Banknote } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import {
  StatsGrid,
  StatCard,
  StatIconBox,
  StatDetails,
  StatLabel,
  StatValue,
} from "./Inventory.styles";

interface InventoryStatsProps {
  totalCount: number;
  totalUnits: number;
  lowStockCount: number;
  totalValuation: number;
}

export const InventoryStats: React.FC<InventoryStatsProps> = ({
  totalCount,
  totalUnits,
  lowStockCount,
  totalValuation,
}) => {
  return (
    <StatsGrid>
      <StatCard>
        <StatIconBox $colorVariant="primary">
          <Package size={20} />
        </StatIconBox>
        <StatDetails>
          <StatLabel>Total SKUs</StatLabel>
          <StatValue>{totalCount} Products</StatValue>
        </StatDetails>
      </StatCard>

      <StatCard>
        <StatIconBox $colorVariant="info">
          <Boxes size={20} />
        </StatIconBox>
        <StatDetails>
          <StatLabel>Total In-Stock Units</StatLabel>
          <StatValue>{totalUnits.toLocaleString()} Pcs</StatValue>
        </StatDetails>
      </StatCard>

      <StatCard>
        <StatIconBox $colorVariant={lowStockCount > 0 ? "warning" : "success"}>
          <AlertTriangle size={20} />
        </StatIconBox>
        <StatDetails>
          <StatLabel>Low / Critical Stock</StatLabel>
          <StatValue>{lowStockCount} Items</StatValue>
        </StatDetails>
      </StatCard>

      <StatCard>
        <StatIconBox $colorVariant="success">
          <Banknote size={20} />
        </StatIconBox>
        <StatDetails>
          <StatLabel>Total Inventory Cost</StatLabel>
          <StatValue>{formatCurrency(totalValuation)}</StatValue>
        </StatDetails>
      </StatCard>
    </StatsGrid>
  );
};
