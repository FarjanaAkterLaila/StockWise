import type { ProductStatus } from "@/types";

export interface ProductFormData {
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  costPrice: string;
  sellingPrice: string;
  stockQuantity: string;
  minStockLevel: string;
  unit: string;
  status: ProductStatus;
}

export const validateProductForm = (
  data: ProductFormData,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.name.trim()) {
    errors.name = "Product name is required";
  } else if (data.name.trim().length < 3) {
    errors.name = "Product name must be at least 3 characters";
  }

  if (!data.sku.trim()) {
    errors.sku = "SKU / Item code is required";
  } else if (!/^[A-Z0-9-_]+$/i.test(data.sku.trim())) {
    errors.sku =
      "SKU can only contain letters, numbers, hyphens, and underscores";
  }

  const cost = parseFloat(data.costPrice);
  if (isNaN(cost) || cost < 0) {
    errors.costPrice = "Valid purchase cost is required (>= 0)";
  }

  const sell = parseFloat(data.sellingPrice);
  if (isNaN(sell) || sell < 0) {
    errors.sellingPrice = "Valid retail selling price is required (>= 0)";
  }

  const stock = parseInt(data.stockQuantity, 10);
  if (isNaN(stock) || stock < 0) {
    errors.stockQuantity = "Stock quantity cannot be negative";
  }

  const min = parseInt(data.minStockLevel, 10);
  if (isNaN(min) || min < 0) {
    errors.minStockLevel = "Minimum threshold must be >= 0";
  }

  return errors;
};

export const isFormValid = (errors: Record<string, string>): boolean => {
  return Object.keys(errors).length === 0;
};
