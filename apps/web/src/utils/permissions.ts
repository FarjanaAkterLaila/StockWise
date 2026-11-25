export type AppRole = "admin" | "manager" | "staff";

export type AppModule =
  | "dashboard"
  | "sales"
  | "purchase"
  | "inventory"
  | "accounts"
  | "users"
  | "customers"
  | "suppliers"
  | "expenses"
  | "settings";

export type PermissionAction = "view" | "create" | "edit" | "delete" | "manage";

type ModulePermissions = Partial<Record<PermissionAction, boolean>>;

const PERMISSION_MATRIX: Record<AppRole, Record<AppModule, ModulePermissions>> = {
  admin: {
    dashboard: { view: true },
    sales: { view: true, create: true, edit: true, delete: false },
    purchase: { view: true, create: true, edit: true, delete: true },
    inventory: { view: true, create: true, edit: true, delete: true },
    accounts: { view: true, manage: true },
    users: { view: true, create: true, edit: true, delete: true, manage: true },
    customers: { view: true, create: true, edit: true, delete: true, manage: true },
    suppliers: { view: true, create: true, edit: true, delete: true, manage: true },
    expenses: { view: true, create: true, edit: true, delete: true, manage: true },
    settings: { view: true, manage: true },
  },
  manager: {
    dashboard: { view: true },
    sales: { view: true, create: true, edit: true, delete: false },
    purchase: { view: true, create: true, edit: true, delete: false },
    inventory: { view: true, create: true, edit: true, delete: false },
    accounts: { view: true, manage: false },
    users: { view: true, create: true, edit: true, delete: false, manage: true },
    customers: { view: true, create: true, edit: true, delete: true, manage: true },
    suppliers: { view: true, create: true, edit: true, delete: true, manage: true },
    expenses: { view: true, create: true, edit: true, delete: true, manage: true },
    settings: { view: false },
  },
  staff: {
    dashboard: { view: true },
    sales: { view: true, create: true, edit: false, delete: false },
    purchase: { view: false },
    inventory: { view: true, create: false, edit: false, delete: false },
    accounts: { view: false },
    users: { view: false },
    customers: { view: true, create: false, edit: false, delete: false, manage: false },
    suppliers: { view: false },
    expenses: { view: false },
    settings: { view: false },
  },
};

export const normalizeRole = (role?: string | null): AppRole => {
  const normalized = (role || "").trim().toLowerCase();
  if (normalized === "admin") return "admin";
  if (normalized === "manager") return "manager";
  return "staff";
};

export const formatRoleLabel = (role?: string | null): "Admin" | "Manager" | "Staff" => {
  const normalized = normalizeRole(role);
  if (normalized === "admin") return "Admin";
  if (normalized === "manager") return "Manager";
  return "Staff";
};

export const hasPermission = (
  role: string | null | undefined,
  module: AppModule,
  action: PermissionAction,
): boolean => {
  const appRole = normalizeRole(role);
  return Boolean(PERMISSION_MATRIX[appRole][module]?.[action]);
};

export const canAccessModule = (
  role: string | null | undefined,
  module: AppModule,
): boolean => hasPermission(role, module, "view");

export const canManageTargetUser = (
  actorRole: string | null | undefined,
  targetRole: string | null | undefined,
): boolean => {
  const actor = normalizeRole(actorRole);
  const target = normalizeRole(targetRole);
  if (actor === "admin") return true;
  if (actor === "manager") return target === "staff";
  return false;
};

export const getAssignableRoles = (
  actorRole: string | null | undefined,
): AppRole[] => {
  const actor = normalizeRole(actorRole);
  if (actor === "admin") return ["admin", "manager", "staff"];
  if (actor === "manager") return ["staff"];
  return [];
};
