export const KEYBOARD_KEYS = {
  ESCAPE: "Escape",
} as const;

export const DOM_EVENTS = {
  KEYDOWN: "keydown",
  MOUSEDOWN: "mousedown",
} as const;

export const NAV_MODULES = {
  DASHBOARD: "dashboard",
  SALES: "sales",
  PURCHASE: "purchase",
  INVENTORY: "inventory",
  ACCOUNTS: "accounts",
  USERS: "users",
} as const;

export type NavSubModule =
  | typeof NAV_MODULES.SALES
  | typeof NAV_MODULES.PURCHASE
  | typeof NAV_MODULES.INVENTORY
  | typeof NAV_MODULES.ACCOUNTS
  | typeof NAV_MODULES.USERS;

export const BADGE_VARIANTS = {
  SUCCESS: "success",
  WARNING: "warning",
  DANGER: "danger",
  INFO: "info",
  PRIMARY: "primary",
  NEUTRAL: "neutral",
} as const;

export const UI_SIZES = {
  SM: "sm",
  MD: "md",
  LG: "lg",
} as const;

export const MODAL_VARIANTS = {
  PRIMARY: "primary",
  DANGER: "danger",
} as const;

export const STOCK_STATUS = {
  ALL: "all",
  IN_STOCK: "in_stock",
  LOW: "low",
  OUT: "out",
} as const;

export const PRODUCT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived",
} as const;

export const PRODUCT_STATUS_FILTER = {
  ACTIVE_CATALOG: "active_catalog",
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived",
  ALL: "all",
} as const;

export const PRODUCT_STATUS_FILTER_OPTIONS = [
  { value: PRODUCT_STATUS_FILTER.ACTIVE_CATALOG, label: "Catalog (Active & Inactive)" },
  { value: PRODUCT_STATUS_FILTER.ACTIVE, label: "Active Only" },
  { value: PRODUCT_STATUS_FILTER.INACTIVE, label: "Inactive Only" },
  { value: PRODUCT_STATUS_FILTER.ARCHIVED, label: "Archived Products" },
  { value: PRODUCT_STATUS_FILTER.ALL, label: "All Products" },
] as const;

export const PAYMENT_STATUS = {
  ALL: "all",
  PAID: "paid",
  PARTIAL: "partial",
  UNPAID: "unpaid",
} as const;

export const PURCHASE_STATUS = {
  ALL: "all",
  RECEIVED: "received",
  ORDERED: "ordered",
  PENDING: "pending",
  CANCELLED: "cancelled",
} as const;

export const DEFAULT_VALUES = {
  WALK_IN_CUSTOMER_ID: "cust-walkin",
  WALK_IN_CUSTOMER_NAME: "Walk-in Customer",
  CUSTOMER_TYPE: "Walk-in" as const,
  PAYMENT_METHOD: "Cash" as const,
  PAYMENT_STATUS_PAID: "paid" as const,
  PAYMENT_STATUS_PARTIAL: "partial" as const,
  PAYMENT_STATUS_UNPAID: "unpaid" as const,
  SALE_STATUS_COMPLETED: "completed" as const,
  PURCHASE_STATUS_RECEIVED: "received" as const,
  PURCHASE_STATUS_ORDERED: "ordered" as const,
  PURCHASE_STATUS_PENDING: "pending" as const,
  PRODUCT_STATUS_ACTIVE: "active" as const,
  PRODUCT_STATUS_INACTIVE: "inactive" as const,
  PRODUCT_UNIT: "pcs" as const,
  DEFAULT_CATEGORY: "Graphics Cards",
  DEFAULT_MIN_STOCK: "5",
  DEFAULT_QUANTITY: "1",
  DEFAULT_VAT_RATE: "5",
  FILTER_ALL: "all",
} as const;

export const HARDWARE_CATEGORIES = [
  "All",
  "Graphics Cards",
  "Processors",
  "Motherboards",
  "Memory (RAM)",
  "Storage",
  "Power Supply",
  "Monitors & Displays",
  "Peripherals & Accessories",
] as const;

export const UNIT_OPTIONS = [
  { value: "pcs", label: "Pieces (pcs)" },
  { value: "kits", label: "Kits (dual-channel)" },
  { value: "box", label: "Box" },
  { value: "pack", label: "Pack" },
] as const;

export const STOCK_FILTER_OPTIONS = [
  { value: STOCK_STATUS.ALL, label: "All Stock Levels" },
  { value: STOCK_STATUS.IN_STOCK, label: "In Stock (> Min)" },
  { value: STOCK_STATUS.LOW, label: "Low Stock Alert" },
  { value: STOCK_STATUS.OUT, label: "Out of Stock (0)" },
] as const;

export const SALE_STATUS_OPTIONS = [
  { value: "all", label: "All Order Statuses" },
  { value: "completed", label: "Completed" },
  { value: "draft", label: "Draft / Quote" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export const PAYMENT_STATUS_OPTIONS = [
  { value: "all", label: "All Payment Statuses" },
  { value: "paid", label: "Paid in Full" },
  { value: "partial", label: "Partial Due" },
  { value: "unpaid", label: "Unpaid" },
] as const;

export const PURCHASE_STATUS_OPTIONS = [
  { value: "all", label: "All Purchase Statuses" },
  { value: "received", label: "Received / In Stock" },
  { value: "ordered", label: "Ordered from Distributor" },
  { value: "pending", label: "Pending Shipment" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export const PAYMENT_METHODS = [
  "Cash",
  "Card",
  "Bank Transfer",
  "MFS",
] as const;

export const CUSTOMER_TYPES = ["Walk-in", "Retail", "Wholesale"] as const;

export const APP_STRINGS = {
  // Store info
  storeName: "StockWise Computer Hub BD",
  storeBranch: "Multiplan Branch • Dhaka",

  // Generic / Modal
  cancel: "Cancel",
  saveChanges: "Save Changes",

  // Inventory Module
  inventoryTitle: "Inventory & Product Catalog",
  inventorySubtitle:
    "Manage computer hardware SKUs, stock levels, barcodes, cost and retail pricing (BDT)",
  addProductBtn: "Add Product",
  reorderBtn: "Reorder",
  resetFilters: "Reset",
  searchPlaceholder: "Search by product name, SKU or barcode...",
  emptyTitle: "No Products Found",
  emptyDesc:
    "No hardware components match your search or filter settings. Try adjusting your search keyword or clearing the category filter.",
  deleteTitle: "Delete Product?",
  deleteConfirm: "Delete Product",
  createProduct: "Create Product",

  // Sales Module
  salesTitle: "Sales Orders & Invoices",
  salesSubtitle:
    "Point of sale hardware receipts, customer invoices, payment settlements (BDT), and warranties",
  createSaleBtn: "New Sale (POS)",
  salesSearchPlaceholder:
    "Search by invoice number, customer name, phone (+880)...",
  emptySalesTitle: "No Sales Invoices Found",
  emptySalesDesc:
    "No sales records match your current filters. Clear the filter settings or record a new sales receipt.",
  createSale: "Complete & Print Invoice",
  saveSale: "Update Invoice",

  // Purchase Module
  purchaseTitle: "Vendor Purchases & Restock",
  purchaseSubtitle:
    "Procurement purchase orders, distributor intake, payment settlements (BDT), and vendor payables",
  createPurchaseBtn: "New Purchase Order",
  purchaseSearchPlaceholder:
    "Search by PO number, distributor/supplier, hardware SKU...",
  emptyPurchaseTitle: "No Purchase Orders Found",
  emptyPurchaseDesc:
    "No purchase records match your search or filter criteria. Adjust your filters or create a new purchase order.",
  deletePurchaseTitle: "Delete Purchase Order?",
  deletePurchaseConfirm: "Delete Order",
  createPurchase: "Create Purchase Order",
  savePurchase: "Update Purchase Order",

  // Accounts Module
  accountsTitle: "Financial Accounts & Ledger",
  accountsSubtitle:
    "Cash flow management, income/expense tracking, customer receivables, and supplier payables",
  recordExpenseBtn: "Record Expense",
  recordIncomeBtn: "Record Income",
  expenseSearchPlaceholder: "Search by expense title, recipient, description...",
  incomeSearchPlaceholder: "Search by reference, income source, payer...",
  customerPaymentSearchPlaceholder: "Search by customer name, invoice, phone...",
  supplierPaymentSearchPlaceholder: "Search by distributor/supplier, PO number...",
  emptyExpensesTitle: "No Expenses Found",
  emptyExpensesDesc: "No expense records match your current filters. Clear the filter settings or add a new expense.",
  emptyIncomeTitle: "No Income Records Found",
  emptyIncomeDesc: "No income transactions match your current filters. Clear the filter settings or record new income.",
  deleteExpenseTitle: "Delete Expense Record?",
  deleteExpenseConfirm: "Delete Expense",
  createExpense: "Record Expense",
  saveExpense: "Update Expense",
  createIncome: "Record Income",
} as const;

export const EXPENSE_CATEGORIES = [
  "All",
  "Rent & Utilities",
  "Salaries & Wages",
  "Shop Operations",
  "Marketing & Ads",
  "Logistics & Delivery",
  "Maintenance & Repairs",
  "General",
] as const;

export const INCOME_SOURCES = [
  "All",
  "POS Sales",
  "PC Assembly Service",
  "Hardware Repair & Servicing",
  "Corporate IT Contract",
  "Recycling & Scrap",
  "Other",
] as const;

export const ACCOUNTS_TABS = {
  ANALYTICS: "analytics",
  EXPENSES: "expenses",
  INCOME: "income",
  CUSTOMER_PAYMENTS: "customer-payments",
  SUPPLIER_PAYMENTS: "supplier-payments",
} as const;

export type AccountsTabId =
  | typeof ACCOUNTS_TABS.ANALYTICS
  | typeof ACCOUNTS_TABS.EXPENSES
  | typeof ACCOUNTS_TABS.INCOME
  | typeof ACCOUNTS_TABS.CUSTOMER_PAYMENTS
  | typeof ACCOUNTS_TABS.SUPPLIER_PAYMENTS;

