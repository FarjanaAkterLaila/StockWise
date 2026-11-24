import { useState } from "react";
import type { NavModule, LowStockProduct } from "@/types";
import { NAV_MODULES } from "@/utils/constants";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { InventoryModule } from "@/components/inventory/InventoryModule";
import { SalesModule } from "@/components/sales/SalesModule";
import { PurchaseModule } from "@/components/purchase/PurchaseModule";
import { AccountsModule } from "@/components/accounts/AccountsModule";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";
import {
  METRIC_SUMMARIES,
  RECENT_SALES,
  LOW_STOCK_PRODUCTS,
  SHOP_QUICK_STATS,
} from "@/data/mockData";

export function App() {
  const [activeModule, setActiveModule] = useState<NavModule>(
    NAV_MODULES.DASHBOARD,
  );

  const handleQuickSale = () => {
    setActiveModule(NAV_MODULES.SALES);
  };

  const handleRestockProduct = (product: LowStockProduct) => {
    if (product) {
      setActiveModule(NAV_MODULES.PURCHASE);
    }
  };

  return (
    <AppLayout
      activeModule={activeModule}
      onSelectModule={setActiveModule}
      onQuickSale={handleQuickSale}
    >
      {activeModule === NAV_MODULES.DASHBOARD ? (
        <DashboardOverview
          metrics={METRIC_SUMMARIES}
          sales={RECENT_SALES}
          lowStockProducts={LOW_STOCK_PRODUCTS}
          quickStats={SHOP_QUICK_STATS}
          onNavigateModule={(module) => setActiveModule(module)}
          onQuickSale={handleQuickSale}
          onRestockProduct={handleRestockProduct}
        />
      ) : activeModule === NAV_MODULES.INVENTORY ? (
        <InventoryModule />
      ) : activeModule === NAV_MODULES.SALES ? (
        <SalesModule />
      ) : activeModule === NAV_MODULES.PURCHASE ? (
        <PurchaseModule />
      ) : activeModule === NAV_MODULES.ACCOUNTS ? (
        <AccountsModule />
      ) : (
        <ModulePlaceholder
          module={activeModule}
          onNavigateHome={() => setActiveModule(NAV_MODULES.DASHBOARD)}
        />
      )}
    </AppLayout>
  );
}

export default App;
