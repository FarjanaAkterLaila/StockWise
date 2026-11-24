import type { PaymentStatus, PaymentMethod, PurchaseStatus } from "@/types";

export interface PurchaseItemFormData {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: string;
  unitPrice: string;
}

export interface PurchaseFormData {
  purchaseNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: PurchaseItemFormData[];
  discountAmount: string;
  vatRate: string;
  paidAmount: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  status: PurchaseStatus;
  notes?: string;
}

export const validatePurchaseForm = (
  data: PurchaseFormData,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.supplierId && !data.supplierName?.trim()) {
    errors.supplier =
      "Please select or enter a hardware distributor / supplier";
  }

  if (!data.date) {
    errors.date = "Purchase date is required";
  }

  if (!data.items || data.items.length === 0) {
    errors.items = "At least one product line item is required";
  } else {
    data.items.forEach((item, index) => {
      if (!item.productId) {
        errors[`item_${index}_product`] = "Please select a hardware component";
      }
      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        errors[`item_${index}_qty`] = "Quantity must be at least 1";
      }
      const price = parseFloat(item.unitPrice);
      if (isNaN(price) || price < 0) {
        errors[`item_${index}_price`] = "Unit purchase price must be >= 0";
      }
    });
  }

  const paid = parseFloat(data.paidAmount || "0");
  if (isNaN(paid) || paid < 0) {
    errors.paidAmount = "Paid amount cannot be negative";
  }

  const discount = parseFloat(data.discountAmount || "0");
  if (isNaN(discount) || discount < 0) {
    errors.discountAmount = "Discount cannot be negative";
  }

  const vat = parseFloat(data.vatRate || "0");
  if (isNaN(vat) || vat < 0 || vat > 100) {
    errors.vatRate = "VAT percentage must be between 0% and 100%";
  }

  return errors;
};
