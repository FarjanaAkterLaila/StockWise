export type CustomerType = "Retail" | "Wholesale" | "Walk-in";
export type PaymentStatus = "paid" | "partial" | "unpaid";
export type SaleStatus = "completed" | "draft" | "cancelled";
export type PurchaseStatus = "received" | "ordered" | "pending" | "cancelled";
export type PaymentMethod = "Cash" | "Card" | "Bank Transfer" | "MFS";
export type ProductStatus = "active" | "inactive";

export interface CategoryModel {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
}

export interface ProductModel {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  categoryId?: string;
  categoryName?: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  unit: string;
  imageUrl?: string;
  status: ProductStatus;
  description?: string;
}

export interface CustomerModel {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  customerType: CustomerType;
  taxNumber?: string;
  balance: number;
}

export interface SupplierModel {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  distributorOf?: string[];
  balance?: number;
}

export interface SaleItemModel {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleModel {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  customerType: CustomerType;
  customerPhone?: string;
  date: string;
  time?: string;
  items: SaleItemModel[];
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

export interface PurchaseItemModel {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface PurchaseModel {
  id: string;
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  time?: string;
  items: PurchaseItemModel[];
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

export interface ExpenseModel {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  description: string;
  referenceNumber?: string;
  recipient?: string;
}

export interface IncomeModel {
  id: string;
  source: string;
  referenceNumber: string;
  date: string;
  amount: number;
  paymentMethod: PaymentMethod;
  payerName?: string;
  description?: string;
}

export interface StockMovementModel {
  id: string;
  productId: string;
  productName?: string;
  type: string;
  quantity: number;
  previousStock?: number;
  currentStock?: number;
  referenceId?: string;
  notes?: string;
  createdAt: string;
}
