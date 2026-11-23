import type {
  PaymentStatus,
  PaymentMethod,
  SaleStatus,
  CustomerType,
} from "@/types";

export interface SaleItemFormData {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: string;
  unitPrice: string;
}

export interface SaleFormData {
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  customerType: CustomerType;
  customerPhone?: string;
  date: string;
  items: SaleItemFormData[];
  discountAmount: string;
  taxAmount: string;
  paidAmount: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  notes?: string;
}

export const validateSaleForm = (
  data: SaleFormData,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.customerName.trim()) {
    errors.customerName = "Customer name is required";
  }

  if (!data.items || data.items.length === 0) {
    errors.items = "At least one product line item is required";
  } else {
    data.items.forEach((item, index) => {
      if (!item.productId) {
        errors[`item_${index}_product`] = "Please select a hardware product";
      }
      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        errors[`item_${index}_qty`] = "Quantity must be at least 1";
      }
      const price = parseFloat(item.unitPrice);
      if (isNaN(price) || price < 0) {
        errors[`item_${index}_price`] = "Unit price must be >= 0";
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

  const tax = parseFloat(data.taxAmount || "0");
  if (isNaN(tax) || tax < 0) {
    errors.taxAmount = "Tax cannot be negative";
  }

  return errors;
};
