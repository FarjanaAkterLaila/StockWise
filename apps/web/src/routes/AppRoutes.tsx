import React from "react";
import type { NavModule, LowStockProduct } from "@/types";
import { NAV_MODULES } from "@/utils/constants";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { InventoryModule } from "@/components/inventory/InventoryModule";
import { SalesModule } from "@/components/sales/SalesModule";
import { PurchaseModule } from "@/components/purchase/PurchaseModule";
import { AccountsModule } from "@/components/accounts/AccountsModule";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";

export interface AppRoutesProps {
  activeModule: NavModule;
  onNavigateModule: (module: NavModule) => void;
  onQuickSale: () => void;
  onRestockProduct: (product: LowStockProduct) => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({
  activeModule,
  onNavigateModule,
  onQuickSale,
  onRestockProduct,
}) => {
  switch (activeModule) {
    case NAV_MODULES.DASHBOARD:
      return (
        <DashboardOverview
          onNavigateModule={(mod) => onNavigateModule(mod as NavModule)}
          onQuickSale={onQuickSale}
          onRestockProduct={onRestockProduct}
        />
      );

    case NAV_MODULES.INVENTORY:
      return <InventoryModule />;

    case NAV_MODULES.SALES:
      return <SalesModule />;

    case NAV_MODULES.PURCHASE:
      return <PurchaseModule />;

    case NAV_MODULES.ACCOUNTS:
      return <AccountsModule />;

    default:
      return (
        <ModulePlaceholder
          module={activeModule}
          onNavigateHome={() => onNavigateModule(NAV_MODULES.DASHBOARD)}
        />
      );
  }
};
