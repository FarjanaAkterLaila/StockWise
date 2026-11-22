export type NavModule = 'dashboard' | 'sales' | 'purchase' | 'inventory' | 'accounts';

export interface MetricSummary {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  period: string;
  iconName: 'dollar-sign' | 'shopping-cart' | 'package' | 'alert-triangle' | 'trending-up';
  badgeText?: string;
}

export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export interface RecentSale {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerType: 'Retail' | 'Wholesale' | 'Walk-in';
  itemsSummary: string;
  itemCount: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: 'Cash' | 'Card' | 'Bank Transfer' | 'MFS';
  date: string;
  time: string;
}

export type StockUrgency = 'critical' | 'warning' | 'normal';

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
  status: 'active' | 'inactive';
  description?: string;
}

export interface ComputerShopQuickStat {
  label: string;
  value: string;
  subtext: string;
}
