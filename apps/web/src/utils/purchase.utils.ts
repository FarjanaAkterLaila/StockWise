import type { Purchase, PaymentStatus } from "@/types";
import { INITIAL_PRODUCTS, MOCK_SUPPLIERS } from "@/data/mockData";
import { DEFAULT_VALUES } from "@/utils/constants";
import type {
  PurchaseFormData,
  PurchaseItemFormData,
} from "@/validations/purchase.validation";

export const PURCHASE_ITEM_FIELDS = {
  QUANTITY: "quantity",
  UNIT_PRICE: "unitPrice",
} as const;

export type PurchaseItemField =
  (typeof PURCHASE_ITEM_FIELDS)[keyof typeof PURCHASE_ITEM_FIELDS];

export const generatePurchaseNumber = (): string => {
  return `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

export const createInitialPurchaseItem = (): PurchaseItemFormData => {
  const defaultProduct = INITIAL_PRODUCTS[0];
  return {
    id: `poi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    productId: defaultProduct?.id || "",
    productName: defaultProduct?.name || "",
    sku: defaultProduct?.sku || "",
    quantity: "5",
    unitPrice: String(defaultProduct?.costPrice || 0),
  };
};

export const getInitialPurchaseFormData = (
  purchase?: Purchase | null,
): PurchaseFormData => {
  const defaultSupplier = MOCK_SUPPLIERS[0];
  return {
    purchaseNumber: purchase?.purchaseNumber || generatePurchaseNumber(),
    supplierId: purchase?.supplierId || defaultSupplier?.id || "",
    supplierName: purchase?.supplierName || defaultSupplier?.name || "",
    date: purchase?.date || new Date().toISOString().split("T")[0],
    items: purchase?.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      productName: i.productName,
      sku: i.sku,
      quantity: String(i.quantity),
      unitPrice: String(i.unitPrice),
    })) || [createInitialPurchaseItem()],
    discountAmount: String(purchase?.discountAmount || 0),
    vatRate: String(purchase?.vatRate ?? DEFAULT_VALUES.DEFAULT_VAT_RATE),
    paidAmount: String(purchase ? purchase.paidAmount : 0),
    paymentStatus:
      purchase?.paymentStatus || DEFAULT_VALUES.PAYMENT_STATUS_PAID,
    paymentMethod: purchase?.paymentMethod || DEFAULT_VALUES.PAYMENT_METHOD,
    status: purchase?.status || DEFAULT_VALUES.PURCHASE_STATUS_RECEIVED,
    notes: purchase?.notes || "",
  };
};

export const calculatePurchaseTotals = (
  items: PurchaseItemFormData[],
  discountAmount: string,
  vatRate: string,
  paidAmount: string,
) => {
  const subtotal = items.reduce(
    (acc, i) =>
      acc + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0),
    0,
  );
  const discount = parseFloat(discountAmount) || 0;
  const taxable = Math.max(0, subtotal - discount);
  const rate = Math.max(0, parseFloat(vatRate) || 0);
  const vatAmount = Math.round(taxable * (rate / 100));
  const grandTotal = taxable + vatAmount;
  const paid = parseFloat(paidAmount) || 0;
  const dueAmount = Math.max(0, grandTotal - paid);

  return {
    subtotal,
    discount,
    vatRate: rate,
    vatAmount,
    grandTotal,
    paidAmount: paid,
    dueAmount,
  };
};

export const determinePurchasePaymentStatus = (
  paidAmount: number,
  grandTotal: number,
): PaymentStatus => {
  if (paidAmount >= grandTotal && grandTotal > 0)
    return DEFAULT_VALUES.PAYMENT_STATUS_PAID;
  if (paidAmount > 0) return DEFAULT_VALUES.PAYMENT_STATUS_PARTIAL;
  return DEFAULT_VALUES.PAYMENT_STATUS_UNPAID;
};
