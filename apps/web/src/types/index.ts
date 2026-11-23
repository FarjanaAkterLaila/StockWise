export type NavModule =
  | "dashboard"
  | "sales"
  | "purchase"
  | "inventory"
  | "accounts";

export type ProductStatus = "active" | "inactive";

export type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "primary";

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
  | "package"
  | "alert-triangle"
  | "trending-up";
  badgeText?: string;
}

export type PaymentStatus = "paid" | "partial" | "unpaid";
export type SaleStatus = "completed" | "draft" | "cancelled";
export type PaymentMethod = "Cash" | "Card" | "Bank Transfer" | "MFS";
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

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  customerType: CustomerType;
  customerPhone?: string;
  date: string;
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
