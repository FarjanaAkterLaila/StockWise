import React from "react";
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
import { Card } from "@/components/common/Card";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { ActionButton } from "@/components/layout/Header.styles";

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

  if (!canAccessModule(user?.role, activeModule)) {
    return (
      <Card
        title="Access Denied"
        subtitle="Your current role does not have permission to access this module."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "8px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#dc2626", fontWeight: 600 }}>
            <ShieldAlert size={20} />
            <span>You are not authorized to view this page.</span>
          </div>
          <div>
            <ActionButton
              type="button"
              onClick={() => onNavigateModule(NAV_MODULES.DASHBOARD)}
            >
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </ActionButton>
          </div>
        </div>
      </Card>
    );
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
