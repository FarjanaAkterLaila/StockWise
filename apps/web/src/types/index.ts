export type NavModule =
  "dashboard" | "sales" | "purchase" | "inventory" | "accounts" | "users";

export type NavSubModule = "sales" | "purchase" | "inventory" | "accounts" | "users";

export type UserRole = "admin" | "manager" | "staff";

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone: string;
  isActive: boolean;
  createdAt: string;
}

export type ProductStatus = "active" | "inactive";

export type BadgeVariant =
  "success" | "warning" | "danger" | "info" | "neutral" | "primary";

export type BadgeSize = "sm" | "md";

export type ModalSize = "sm" | "md" | "lg";
export type ModalVariant = "primary" | "danger";

export interface MetricSummary {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  period: string;
  iconName:
  | "dollar-sign"
  | "shopping-cart"
  | "shopping-bag"
  | "package"
  | "alert-triangle"
  | "trending-up";
  badgeText?: string;
}

export type PaymentStatus = "paid" | "partial" | "unpaid";
export type SaleStatus = "completed" | "draft" | "cancelled";
export type PaymentMethod = "Cash" | "Card" | "Bank Transfer" | "MFS";
export type AccountsPaymentMethod = PaymentMethod | "Cheque" | "Other" | (string & {});
export type CustomerType = "Retail" | "Wholesale" | "Walk-in";

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  customerType: CustomerType;
  balance?: number;
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SalePaymentRecord {
  id: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  customerType: CustomerType;
  customerPhone?: string;
  date: string;
  paymentDate?: string;
  lastPaymentReferenceNumber?: string;
  lastPaymentNotes?: string;
  paymentHistory?: SalePaymentRecord[];
  time?: string;
  items: SaleItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  notes?: string;
  createdBy?: string;
}

export interface RecentSale {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerType: CustomerType;
  itemsSummary: string;
  itemCount: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  date: string;
  time: string;
}

export type StockUrgency = "critical" | "warning" | "normal";

export interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  urgency: StockUrgency;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  unit: string;
  status: ProductStatus;
  description?: string;
}

export interface ComputerShopQuickStat {
  label: string;
  value: string;
  subtext: string;
}

export interface SalesPurchaseComparison {
  month: string;
  monthFull: string;
  sales: number;
  purchase: number;
  margin: number;
}

export interface RevenueTrendPoint {
  date: string;
  label: string;
  revenue: number;
  invoices: number;
}

export type InventoryStockCategory = "in_stock" | "low_stock" | "out_of_stock";

export interface InventoryStatusBreakdown {
  category: InventoryStockCategory;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export type PurchaseStatus = "received" | "ordered" | "pending" | "cancelled";

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  distributorOf: string[];
}

export interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  time?: string;
  items: PurchaseItem[];
  subtotal: number;
  discountAmount: number;
  vatRate: number;
  vatAmount: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  status: PurchaseStatus;
  notes?: string;
}

export type ExpenseCategory =
  | "Rent & Utilities"
  | "Salaries & Wages"
  | "Shop Operations"
  | "Marketing & Ads"
  | "Logistics & Delivery"
  | "Maintenance & Repairs"
  | "General";

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paymentMethod: AccountsPaymentMethod;
  /** Legacy fixture fields; the current expenses table has no columns for these values. */
  description?: string;
  referenceNumber?: string;
  recipient?: string;
}

export type IncomeSource =
  | "POS Sales"
  | "PC Assembly Service"
  | "Hardware Repair & Servicing"
  | "Corporate IT Contract"
  | "Recycling & Scrap"
  | "Other";

export interface Income {
  id: string;
  source: IncomeSource;
  referenceNumber: string;
  date: string;
  amount: number;
  paymentMethod: AccountsPaymentMethod;
  payerName?: string;
  description?: string;
}

export interface CustomerPaymentRecord {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerType: CustomerType;
  customerPhone?: string;
  date: string;
  paymentMethod: AccountsPaymentMethod;
  referenceNumber?: string;
  notes?: string;
  totalAmount: number;
  paidAmount: number;
  cumulativePaidAmount?: number;
  dueAmount: number;
  paymentStatus: PaymentStatus;
}

export interface SupplierPaymentRecord {
  id: string;
  purchaseId?: string;
  purchaseNumber: string;
  supplierName: string;
  date: string;
  paymentMethod: AccountsPaymentMethod;
  referenceNumber?: string;
  notes?: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: PaymentStatus;
}

export interface MonthlyFinancialSummary {
  yearMonth?: string;
  month: string;
  monthFull: string;
  income: number;
  expense: number;
  operatingExpense?: number;
  purchaseExpense?: number;
  netProfit: number;
  marginPercentage: number;
}

