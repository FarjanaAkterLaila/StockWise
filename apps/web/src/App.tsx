import { useState } from "react";
import type { NavModule, LowStockProduct } from "@/types";
import { NAV_MODULES } from "@/utils/constants";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { LoginPage } from "@/components/auth/LoginPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { AppRoutes } from "@/routes/AppRoutes";
import { GenericLoader } from "@/components/common/GenericLoader";

function MainERP() {
  const { isAuthenticated, loading } = useAuth();
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

  if (loading) {
    return (
      <GenericLoader
        fullScreen
        message="Initializing StockWise session..."
        subtext="Connecting to database and verifying security session"
      />
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AppLayout
      activeModule={activeModule}
      onSelectModule={setActiveModule}
      onQuickSale={handleQuickSale}
    >
      <AppRoutes
        activeModule={activeModule}
        onNavigateModule={setActiveModule}
        onQuickSale={handleQuickSale}
        onRestockProduct={handleRestockProduct}
      />
    </AppLayout>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainERP />
    </AuthProvider>
  );
}

export default App;
