import React, { useEffect } from "react";
import type { NavModule, LowStockProduct } from "@/types";
import { NAV_MODULES } from "@/utils/constants";
import { useAuth } from "@/context/AuthContext";
import { canAccessModule } from "@/utils/permissions";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { InventoryModule } from "@/components/inventory/InventoryModule";
import { SalesModule } from "@/components/sales/SalesModule";
import { PurchaseModule } from "@/components/purchase/PurchaseModule";
import { AccountsModule } from "@/components/accounts/AccountsModule";
import { UsersModule } from "@/components/users/UsersModule";
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
  const { user } = useAuth();
  const hasAccess = canAccessModule(user?.role, activeModule);

  useEffect(() => {
    if (!hasAccess) onNavigateModule(NAV_MODULES.DASHBOARD);
  }, [hasAccess, onNavigateModule]);

  if (!hasAccess) {
    return null;
  }

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

    case NAV_MODULES.USERS:
      return <UsersModule />;

    default:
      return (
        <ModulePlaceholder
          module={activeModule}
          onNavigateHome={() => onNavigateModule(NAV_MODULES.DASHBOARD)}
        />
      );
  }
};
