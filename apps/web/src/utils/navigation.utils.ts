import type React from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Package,
  WalletCards,
  Users,
} from "lucide-react";
import type { NavModule, NavSubModule } from "@/types";
import { NAV_MODULES } from "@/utils/constants";

export type { NavSubModule };

export interface NavItemConfig {
  id: NavModule;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: "primary" | "warning" | "danger";
}

export const NAV_ITEMS: NavItemConfig[] = [
  { id: NAV_MODULES.DASHBOARD, label: "Dashboard", icon: LayoutDashboard },
  { id: NAV_MODULES.SALES, label: "Sales", icon: ShoppingCart },
  { id: NAV_MODULES.PURCHASE, label: "Purchase", icon: ShoppingBag },
  {
    id: NAV_MODULES.INVENTORY,
    label: "Inventory",
    icon: Package,
  },
  { id: NAV_MODULES.ACCOUNTS, label: "Accounts", icon: WalletCards },
  { id: NAV_MODULES.USERS, label: "User Management", icon: Users },
];

export const MODULE_TITLES: Record<
  NavModule,
  { title: string; subtitle: string }
> = {
  [NAV_MODULES.DASHBOARD]: {
    title: "Dashboard Overview",
    subtitle: "Real-time sales, inventory alerts, and store performance",
  },
  [NAV_MODULES.SALES]: {
    title: "Sales & Invoices",
    subtitle: "Point of sale terminal, customer billing, and transaction logs",
  },
  [NAV_MODULES.PURCHASE]: {
    title: "Purchases & Restock",
    subtitle: "Vendor purchase orders, incoming stock intake, and payables",
  },
  [NAV_MODULES.INVENTORY]: {
    title: "Inventory Catalog",
    subtitle: "Hardware SKUs, real-time stock levels, and minimum thresholds",
  },
  [NAV_MODULES.ACCOUNTS]: {
    title: "Financial Accounts",
    subtitle: "Expense ledger, cash drawer balance, and store margin analytics",
  },
  [NAV_MODULES.USERS]: {
    title: "User Management",
    subtitle: "Manage operator accounts and role-based access permissions",
  },
};
