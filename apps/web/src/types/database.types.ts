export type DbUserRole = "admin" | "manager" | "staff";
export type DbProductStatus = "active" | "inactive" | "archived";
export type DbPurchaseStatus = "ordered" | "received" | "pending" | "cancelled";
export type DbSaleStatus = "draft" | "completed" | "cancelled" | "refunded";
export type DbPaymentStatus = "paid" | "partial" | "unpaid";
export type DbPaymentType = "received" | "paid";
export type DbPaymentMethod =
  | "cash"
  | "card"
  | "bank_transfer"
  | "mobile_money"
  | "cheque"
  | "other";
export type DbStockMovementType =
  | "in"
  | "out"
  | "adjustment"
  | "purchase"
  | "sale"
  | "return"
  | "damaged";

export interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  role: DbUserRole | string;
  phone: string | null;
  avatar_url: string | null;
  is_active?: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductRow {
  id: string;
  name: string;
  sku: string | null;
  barcode?: string | null;
  category_id: string | null;
  purchase_price: number;
  selling_price: number;
  quantity: number;
  min_stock_level?: number | null;
  unit: string | null;
  image_url: string | null;
  status: DbProductStatus;
  created_at: string;
  updated_at: string;
}

export interface CustomerRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_number: string | null;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface SupplierRow {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_number: string | null;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface PurchaseRow {
  id: string;
  purchase_number: string;
  supplier_id: string;
  purchase_date: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  status: DbPurchaseStatus;
  payment_status: DbPaymentStatus;
  notes: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseItemRow {
  id: string;
  purchase_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface SaleRow {
  id: string;
  invoice_number: string;
  customer_id: string | null;
  sale_date: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  status: DbSaleStatus;
  notes: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SaleItemRow {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface StockMovementRow {
  id: string;
  product_id: string;
  type: DbStockMovementType;
  quantity: number;
  previous_stock: number | null;
  current_stock: number | null;
  reference_id: string | null;
  notes: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface PaymentRow {
  id: string;
  reference_number: string | null;
  payment_type: DbPaymentType;
  sale_id: string | null;
  purchase_id: string | null;
  customer_id: string | null;
  supplier_id: string | null;
  amount: number;
  payment_date: string;
  payment_method: DbPaymentMethod;
  notes: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface ExpenseRow {
  id: string;
  title: string;
  category: string;
  amount: number;
  expense_date: string;
  payment_method: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}
