import { useState } from "react";
import type { NavModule, LowStockProduct } from "@/types";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { InventoryModule } from "@/components/inventory/InventoryModule";
import { SalesModule } from "@/components/sales/SalesModule";
import { ModulePlaceholder } from "@/components/common/ModulePlaceholder";
import {
  METRIC_SUMMARIES,
  RECENT_SALES,
  LOW_STOCK_PRODUCTS,
  SHOP_QUICK_STATS,
} from "@/data/mockData";

export function App() {
  const [activeModule, setActiveModule] = useState<NavModule>("dashboard");

  const handleQuickSale = () => {
    setActiveModule("sales");
  };

  const handleRestockProduct = (product: LowStockProduct) => {
    if (product) {
      setActiveModule("purchase");
    }
  };

  return (
    <AppLayout
      activeModule={activeModule}
      onSelectModule={setActiveModule}
      onQuickSale={handleQuickSale}
    >
      {activeModule === "dashboard" ? (
        <DashboardOverview
          metrics={METRIC_SUMMARIES}
          sales={RECENT_SALES}
          lowStockProducts={LOW_STOCK_PRODUCTS}
          quickStats={SHOP_QUICK_STATS}
          onNavigateModule={(module) => setActiveModule(module)}
          onQuickSale={handleQuickSale}
          onRestockProduct={handleRestockProduct}
        />
      ) : activeModule === "inventory" ? (
        <InventoryModule />
      ) : activeModule === "sales" ? (
        <SalesModule />
      ) : (
        <ModulePlaceholder
          module={activeModule}
          onNavigateHome={() => setActiveModule("dashboard")}
        />
      )}
    </AppLayout>
  );
}

export default App;
