import type { Product } from "@/types";
import { HARDWARE_CATEGORIES, DEFAULT_VALUES } from "@/utils/constants";
import type { ProductFormData } from "@/validations/product.validation";

export const AVAILABLE_CATEGORIES = HARDWARE_CATEGORIES.filter(
  (c) => c !== "All",
);

export const getInitialProductFormData = (
  p?: Product | null,
): ProductFormData => ({
  name: p?.name || "",
  sku: p?.sku || "",
  barcode: p?.barcode || "",
  category:
    p?.category || AVAILABLE_CATEGORIES[0] || DEFAULT_VALUES.DEFAULT_CATEGORY,
  costPrice:
    p && p.costPrice !== undefined && p.costPrice !== null
      ? String(p.costPrice)
      : "",
  sellingPrice:
    p && p.sellingPrice !== undefined && p.sellingPrice !== null
      ? String(p.sellingPrice)
      : "",
  stockQuantity:
    p && p.stockQuantity !== undefined && p.stockQuantity !== null
      ? String(p.stockQuantity)
      : "",
  minStockLevel:
    p && p.minStockLevel !== undefined && p.minStockLevel !== null
      ? String(p.minStockLevel)
      : String(DEFAULT_VALUES.DEFAULT_MIN_STOCK),
  unit: p?.unit || DEFAULT_VALUES.PRODUCT_UNIT,
  status: p?.status || DEFAULT_VALUES.PRODUCT_STATUS_ACTIVE,
});
