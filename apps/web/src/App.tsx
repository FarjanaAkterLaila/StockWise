import { useState, useCallback, useEffect, useRef } from "react";
import type { NavModule, LowStockProduct } from "@/types";
import { NAV_MODULES } from "@/utils/constants";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { LoginPage } from "@/components/auth/LoginPage";
import { AppLayout } from "@/components/layout/AppLayout";
import { AppRoutes } from "@/routes/AppRoutes";
import { GenericLoader } from "@/components/common/GenericLoader";
import { canAccessModule } from "@/utils/permissions";

const VALID_MODULES = new Set<NavModule>(Object.values(NAV_MODULES));

const getInitialModuleFromUrl = (): NavModule => {
  const pathSeg = window.location.pathname.replace(/^\/+|\/+$/g, "").toLowerCase();
  if (VALID_MODULES.has(pathSeg as NavModule)) {
    return pathSeg as NavModule;
  }
  const hashSeg = window.location.hash.replace(/^#\/?/, "").toLowerCase();
  if (VALID_MODULES.has(hashSeg as NavModule)) {
    return hashSeg as NavModule;
  }
  return NAV_MODULES.DASHBOARD;
};

function MainERP() {
  const { user, isAuthenticated, loading } = useAuth();
  const [activeModule, setActiveModule] = useState<NavModule>(
    getInitialModuleFromUrl,
  );
  const previousUserId = useRef<string | null>(null);
  const hasResolvedInitialAuth = useRef(false);

  useEffect(() => {
    if (loading) return;

    const userId = isAuthenticated ? user?.id ?? null : null;
    if (!hasResolvedInitialAuth.current) {
      previousUserId.current = userId;
      hasResolvedInitialAuth.current = true;
      return;
    }

    if (userId !== previousUserId.current) {
      const previousUserIdValue = previousUserId.current;
      previousUserId.current = userId;
      // Preserve a deep link during initial auth and login. Logout and direct
      // account switches still clear the previous user's route.
      if (userId === null || previousUserIdValue !== null) {
        setActiveModule(NAV_MODULES.DASHBOARD);
        if (window.location.pathname !== "/") {
          window.history.replaceState(null, "", "/");
        }
      }
    }
  }, [loading, isAuthenticated, user?.id]);

  const handleSelectModule = useCallback((module: NavModule) => {
    if (!canAccessModule(user?.role, module)) {
      setActiveModule(NAV_MODULES.DASHBOARD);
      if (window.location.pathname !== "/") {
        window.history.replaceState(null, "", "/");
      }
      return;
    }
    setActiveModule(module);
    const nextPath = module === NAV_MODULES.DASHBOARD ? "/" : `/${module}`;
    if (window.location.pathname !== nextPath) {
      window.history.replaceState(null, "", nextPath);
    }
  }, [user?.role]);

  const handleQuickSale = () => {
    if (canAccessModule(user?.role, NAV_MODULES.SALES)) {
      handleSelectModule(NAV_MODULES.SALES);
    }
  };

  const handleRestockProduct = (product: LowStockProduct) => {
    if (product && canAccessModule(user?.role, NAV_MODULES.PURCHASE)) {
      handleSelectModule(NAV_MODULES.PURCHASE);
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
      onSelectModule={handleSelectModule}
    >
      <AppRoutes
        activeModule={activeModule}
        onNavigateModule={handleSelectModule}
        onQuickSale={handleQuickSale}
        onRestockProduct={handleRestockProduct}
      />
    </AppLayout>
  );
}

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainERP />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
