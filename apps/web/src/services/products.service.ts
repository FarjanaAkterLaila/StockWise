import { supabase } from "@/lib/supabase";
import type { Product, ProductStatus } from "@/types";
import type { ProductRow } from "@/types/database.types";

interface ProductRowWithCategory extends ProductRow {
  categories: { id: string; name: string } | null;
}

const normalizeProductStatus = (status: unknown): ProductStatus => {
  const normalized = String(status ?? "active").trim().toLowerCase();
  if (normalized === "inactive" || normalized === "archived") {
    return normalized;
  }
  return "active";
};

export const isProductSelectable = (
  product: Pick<Product, "status">,
): boolean => product.status === "active";

export const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("*, categories:category_id (id, name)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data || []) as unknown as ProductRowWithCategory[];

  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku || "",
    barcode: p.barcode || "",
    category: p.categories?.name || "General",
    costPrice: Number(p.purchase_price ?? (p as unknown as Record<string, unknown>).cost_price) || 0,
    sellingPrice: Number(p.selling_price) || 0,
    stockQuantity: Number(p.quantity) || 0,
    minStockLevel: Number(p.min_stock_level) || 5,
    unit: p.unit || "Pcs",
    status: normalizeProductStatus(p.status),
    description: "",
  }));
};

export const fetchCategories = async (): Promise<
  Array<{ id: string; name: string }>
> => {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
};

export const createProduct = async (
  productData: Partial<Product>,
): Promise<Product> => {
  let categoryId: string | null = null;
  if (productData.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .ilike("name", productData.category.trim())
      .maybeSingle();

    if (cat) {
      categoryId = cat.id;
    } else {
      const { data: newCat } = await supabase
        .from("categories")
        .insert({ name: productData.category.trim() })
        .select("id")
        .maybeSingle();
      if (newCat) categoryId = newCat.id;
    }
  }

  const sku =
    productData.sku?.trim() || `SKU-${Date.now().toString().slice(-6)}`;
  const name = productData.name?.trim() || "Untitled Product";
  const costPrice = Number(productData.costPrice) || 0;
  const sellingPrice = Number(productData.sellingPrice) || 0;
  const stockQuantity = Math.trunc(Number(productData.stockQuantity) || 0);
  const minStockLevel = Math.trunc(
    Number(productData.minStockLevel ?? 5),
  );
  const unit = productData.unit || "Pcs";
  const status = normalizeProductStatus(productData.status);

  const { data, error } = await supabase.rpc(
    "create_product_with_opening_stock",
    {
      p_name: name,
      p_sku: sku,
      p_barcode: productData.barcode?.trim() || null,
      p_category_id: categoryId,
      p_cost_price: costPrice,
      p_selling_price: sellingPrice,
      p_stock_quantity: stockQuantity,
      p_min_stock_level: minStockLevel,
      p_unit: unit,
      p_status: status,
    },
  );

  if (error) throw new Error(error.message);

  const created = (data || {}) as Record<string, unknown>;

  return {
    id: String(created.id || ""),
    name: String(created.name || name),
    sku: String(created.sku || sku),
    barcode: String(created.barcode || productData.barcode?.trim() || ""),
    category: productData.category?.trim() || "General",
    costPrice: Number(created.costPrice ?? costPrice) || 0,
    sellingPrice: Number(created.sellingPrice ?? sellingPrice) || 0,
    stockQuantity: Number(created.stockQuantity ?? stockQuantity) || 0,
    minStockLevel: Number(created.minStockLevel ?? minStockLevel) || 0,
    unit: String(created.unit || unit),
    status: normalizeProductStatus(created.status ?? status),
  };
};

export const updateProduct = async (
  id: string,
  updates: Partial<Product>,
): Promise<Product> => {
  let categoryId: string | undefined = undefined;
  if (updates.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .ilike("name", updates.category.trim())
      .maybeSingle();
    if (cat) categoryId = cat.id;
  }

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (updates.name !== undefined) payload.name = updates.name.trim();
  if (updates.sku !== undefined) payload.sku = updates.sku.trim();
  if (updates.barcode !== undefined && updates.barcode.trim() !== "") {
    payload.barcode = updates.barcode.trim();
  }
  if (categoryId !== undefined) payload.category_id = categoryId;
  if (updates.costPrice !== undefined) {
    payload.purchase_price = Number(updates.costPrice);
    payload.cost_price = Number(updates.costPrice);
  }
  if (updates.sellingPrice !== undefined)
    payload.selling_price = Number(updates.sellingPrice);
  if (updates.stockQuantity !== undefined)
    payload.quantity = Number(updates.stockQuantity);
  if (updates.minStockLevel !== undefined)
    payload.min_stock_level = Number(updates.minStockLevel);
  if (updates.unit !== undefined) payload.unit = updates.unit;
  if (updates.status !== undefined) {
    payload.status = updates.status;
    payload.archived_at =
      updates.status === "archived" ? new Date().toISOString() : null;
  }

  let { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .select("*, categories:category_id (id, name)")
    .single();

  // Dynamic resilience loop: strip any column that the database schema cache says is missing
  while (error && error.message.includes("Could not find the '")) {
    const match = error.message.match(/Could not find the '([^']+)' column/);
    if (match && match[1] && match[1] in payload) {
      delete payload[match[1]];
      const retry = await supabase
        .from("products")
        .update(payload)
        .eq("id", id)
        .select("*, categories:category_id (id, name)")
        .single();
      data = retry.data;
      error = retry.error;
    } else {
      break;
    }
  }

  if (error) throw new Error(error.message);

  const row = data as unknown as ProductRowWithCategory;

  return {
    id: row.id,
    name: row.name,
    sku: row.sku || "",
    barcode: row.barcode || "",
    category: row.categories?.name || updates.category || "General",
    costPrice: Number(row.purchase_price) || 0,
    sellingPrice: Number(row.selling_price) || 0,
    stockQuantity: Number(row.quantity) || 0,
    minStockLevel: Number(row.min_stock_level) || 5,
    unit: row.unit || "Pcs",
    status: normalizeProductStatus(row.status),
  };
};

export const archiveProduct = async (id: string): Promise<Product> =>
  updateProduct(id, { status: "archived" });

export const restoreProduct = async (id: string): Promise<Product> =>
  updateProduct(id, { status: "active" });

// Soft-delete only: archive instead of permanently deleting product rows
export const deleteProduct = async (id: string): Promise<Product> =>
  archiveProduct(id);
