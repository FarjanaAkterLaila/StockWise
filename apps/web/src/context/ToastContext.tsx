import React, { createContext, useContext, useState, useCallback } from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import {
  ToastContainerWrap,
  ToastCard,
  ToastIconWrap,
  ToastBody,
  ToastTitle,
  ToastMessage,
  ToastCloseBtn,
} from "@/components/common/Toast.styles";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  isDismissing?: boolean;
}

interface ToastContextValue {
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isDismissing: true } : t)),
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 250);
  }, []);

  const addToast = useCallback(
    (type: ToastType, title: string, message?: string, duration = 3500) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast],
  );

  const showSuccess = useCallback(
    (title: string, message?: string) => {
      addToast("success", title, message);
    },
    [addToast],
  );

  const showError = useCallback(
    (title: string, message?: string) => {
      addToast("error", title, message, 4500);
    },
    [addToast],
  );

  const showWarning = useCallback(
    (title: string, message?: string) => {
      addToast("warning", title, message);
    },
    [addToast],
  );

  const showInfo = useCallback(
    (title: string, message?: string) => {
      addToast("info", title, message);
    },
    [addToast],
  );

  const renderIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={18} />;
      case "error":
        return <AlertCircle size={18} />;
      case "warning":
        return <AlertTriangle size={18} />;
      case "info":
      default:
        return <Info size={18} />;
    }
  };

  return (
    <ToastContext.Provider
      value={{
        showSuccess,
        showError,
        showWarning,
        showInfo,
        dismissToast,
      }}
    >
      {children}
      <ToastContainerWrap role="region" aria-live="polite">
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            $type={toast.type}
            $isDismissing={toast.isDismissing}
          >
            <ToastIconWrap $type={toast.type}>
              {renderIcon(toast.type)}
            </ToastIconWrap>
            <ToastBody>
              <ToastTitle>{toast.title}</ToastTitle>
              {toast.message && <ToastMessage>{toast.message}</ToastMessage>}
            </ToastBody>
            <ToastCloseBtn
              onClick={() => dismissToast(toast.id)}
              aria-label="Close notification"
            >
              <X size={15} />
            </ToastCloseBtn>
          </ToastCard>
        ))}
      </ToastContainerWrap>
    </ToastContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
