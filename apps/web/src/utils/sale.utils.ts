import type { Sale, PaymentStatus } from "@/types";
import { INITIAL_PRODUCTS } from "@/data/mockData";
import { DEFAULT_VALUES } from "@/utils/constants";
import type {
  SaleFormData,
  SaleItemFormData,
} from "@/validations/sale.validation";

export const SALE_ITEM_FIELDS = {
  QUANTITY: "quantity",
  UNIT_PRICE: "unitPrice",
} as const;

export type SaleItemField =
  (typeof SALE_ITEM_FIELDS)[keyof typeof SALE_ITEM_FIELDS];

export const generateInvoiceNumber = (): string => {
  return `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

export const createInitialSaleItem = (): SaleItemFormData => {
  const defaultProduct = INITIAL_PRODUCTS[0];
  return {
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    productId: defaultProduct?.id || "",
    productName: defaultProduct?.name || "",
    sku: defaultProduct?.sku || "",
    quantity: DEFAULT_VALUES.DEFAULT_QUANTITY,
    unitPrice: String(defaultProduct?.sellingPrice || 0),
  };
};

export const getInitialSaleFormData = (sale?: Sale | null): SaleFormData => ({
  invoiceNumber: sale?.invoiceNumber || generateInvoiceNumber(),
  customerId: sale?.customerId || DEFAULT_VALUES.WALK_IN_CUSTOMER_ID,
  customerName: sale?.customerName || DEFAULT_VALUES.WALK_IN_CUSTOMER_NAME,
  customerType: sale?.customerType || DEFAULT_VALUES.CUSTOMER_TYPE,
  customerPhone: sale?.customerPhone || "",
  date: sale?.date || new Date().toISOString().split("T")[0],
  items: sale?.items.map((i) => ({
    id: i.id,
    productId: i.productId,
    productName: i.productName,
    sku: i.sku,
    quantity: String(i.quantity),
    unitPrice: String(i.unitPrice),
  })) || [createInitialSaleItem()],
  discountAmount: String(sale?.discountAmount || 0),
  taxAmount: String(sale?.taxAmount || 0),
  paidAmount: String(
    sale ? sale.paidAmount : INITIAL_PRODUCTS[0]?.sellingPrice || 0,
  ),
  paymentStatus: sale?.paymentStatus || DEFAULT_VALUES.PAYMENT_STATUS_PAID,
  paymentMethod: sale?.paymentMethod || DEFAULT_VALUES.PAYMENT_METHOD,
  status: sale?.status || DEFAULT_VALUES.SALE_STATUS_COMPLETED,
  notes: sale?.notes || "",
});

export const calculateSaleTotals = (
  items: SaleItemFormData[],
  discountAmount: string,
  taxAmount: string,
  paidAmount: string,
) => {
  const subtotal = items.reduce(
    (acc, i) =>
      acc + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0),
    0,
  );
  const discount = parseFloat(discountAmount) || 0;
  const tax = parseFloat(taxAmount) || 0;
  const totalAmount = Math.max(0, subtotal - discount + tax);
  const paid = parseFloat(paidAmount) || 0;
  const dueAmount = Math.max(0, totalAmount - paid);
  return { subtotal, discount, tax, totalAmount, paidAmount: paid, dueAmount };
};

export const determinePaymentStatus = (
  paidAmount: number,
  totalAmount: number,
): PaymentStatus => {
  if (paidAmount >= totalAmount) return DEFAULT_VALUES.PAYMENT_STATUS_PAID;
  if (paidAmount > 0) return DEFAULT_VALUES.PAYMENT_STATUS_PARTIAL;
  return DEFAULT_VALUES.PAYMENT_STATUS_UNPAID;
};
