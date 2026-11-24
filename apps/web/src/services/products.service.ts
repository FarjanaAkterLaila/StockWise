import { supabase } from "@/lib/supabase";
import type { Product, ProductStatus } from "@/types";
import type { ProductRow } from "@/types/database.types";

interface ProductRowWithCategory extends ProductRow {
  categories: { id: string; name: string } | null;
}

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
    costPrice: Number(p.purchase_price) || 0,
    sellingPrice: Number(p.selling_price) || 0,
    stockQuantity: Number(p.quantity) || 0,
    minStockLevel: Number(p.min_stock_level) || 5,
    unit: p.unit || "Pcs",
    status: (p.status as ProductStatus) || "active",
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

  const { data, error } = await supabase
    .from("products")
    .insert({
      name: productData.name?.trim() || "Untitled Product",
      sku,
      barcode: productData.barcode || null,
      category_id: categoryId,
      purchase_price: Number(productData.costPrice) || 0,
      selling_price: Number(productData.sellingPrice) || 0,
      quantity: Number(productData.stockQuantity) || 0,
      min_stock_level: Number(productData.minStockLevel) || 5,
      unit: productData.unit || "Pcs",
      status: productData.status || "active",
    })
    .select("*, categories:category_id (id, name)")
    .single();

  if (error) throw new Error(error.message);

  const row = data as unknown as ProductRowWithCategory;

  return {
    id: row.id,
    name: row.name,
    sku: row.sku || "",
    barcode: row.barcode || "",
    category: row.categories?.name || productData.category || "General",
    costPrice: Number(row.purchase_price) || 0,
    sellingPrice: Number(row.selling_price) || 0,
    stockQuantity: Number(row.quantity) || 0,
    minStockLevel: Number(row.min_stock_level) || 5,
    unit: row.unit || "Pcs",
    status: (row.status as ProductStatus) || "active",
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
  if (updates.barcode !== undefined) payload.barcode = updates.barcode;
  if (categoryId !== undefined) payload.category_id = categoryId;
  if (updates.costPrice !== undefined)
    payload.purchase_price = Number(updates.costPrice);
  if (updates.sellingPrice !== undefined)
    payload.selling_price = Number(updates.sellingPrice);
  if (updates.stockQuantity !== undefined)
    payload.quantity = Number(updates.stockQuantity);
  if (updates.minStockLevel !== undefined)
    payload.min_stock_level = Number(updates.minStockLevel);
  if (updates.unit !== undefined) payload.unit = updates.unit;
  if (updates.status !== undefined) payload.status = updates.status;

  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id)
    .select("*, categories:category_id (id, name)")
    .single();

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
    status: (row.status as ProductStatus) || "active",
  };
};

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
};
