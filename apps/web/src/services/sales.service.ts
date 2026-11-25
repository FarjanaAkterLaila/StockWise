import { supabase } from "@/lib/supabase";
import type { Sale, SalePaymentRecord, PaymentStatus, SaleStatus, PaymentMethod } from "@/types";
import type { SaleRow, SaleItemRow } from "@/types/database.types";
import { formatTime } from "@/utils/formatters";

interface SaleItemWithProduct extends SaleItemRow {
  products: { id: string; name: string; sku: string | null } | null;
}

interface SaleRowWithRelations extends SaleRow {
  customers: { id: string; name: string; phone: string | null } | null;
  sale_items: SaleItemWithProduct[] | null;
}

const isUuid = (val?: string | null): boolean =>
  Boolean(
    val &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        val.trim(),
      ),
  );

const readNumericField = (
  row: Record<string, unknown>,
  ...fieldNames: string[]
): number | undefined => {
  let zeroValue: number | undefined;
  for (const fieldName of fieldNames) {
    const value = row[fieldName];
    if (value !== null && value !== undefined && value !== "") {
      const numericValue = Number(value);
      if (Number.isFinite(numericValue)) {
        if (numericValue !== 0) return numericValue;
        zeroValue = 0;
      }
    }
  }
  return zeroValue;
};

const normalizePaymentMethod = (value?: unknown): PaymentMethod | undefined => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (normalized === "cash") return "Cash";
  if (normalized === "card") return "Card";
  if (normalized === "bank_transfer" || normalized === "bank") return "Bank Transfer";
  if (normalized === "mfs" || normalized === "mobile_money" || normalized === "mobile") return "MFS";
  return undefined;
};

export interface CreateSaleInput {
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: Array<{
    productId: string;
    productName?: string;
    sku?: string;
    quantity: number;
    unitPrice: number;
    subtotal?: number;
  }>;
  subtotal: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount: number;
  paidAmount?: number;
  paymentMethod?: string;
  status?: string;
  notes?: string;
}

export interface UpdateSaleInput {
  items: Array<{
    id?: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  subtotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount: number;
  paidAmount?: number;
  newPaymentAmount: number;
  paymentMethod: string;
  paymentDate?: string;
  referenceNumber?: string;
  notes?: string;
  status?: string;
}

export const fetchSales = async (): Promise<Sale[]> => {
  const [salesRes, paymentsRes] = await Promise.all([
    supabase
      .from("sales")
      .select(`
        *,
        customers:customer_id (id, name, phone),
        sale_items (
          *,
          products:product_id (*)
        )
      `)
      .order("created_at", { ascending: false }),
    supabase
      .from("payments")
      .select("id, sale_id, purchase_id, payment_type, amount, payment_method, payment_date, reference_number, notes")
      .is("purchase_id", null)
      .eq("payment_type", "received")
      .order("payment_date", { ascending: false })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false }),
  ]);

  if (salesRes.error) throw new Error(salesRes.error.message);
  if (paymentsRes.error) throw new Error(paymentsRes.error.message);

  const paymentsMap: Record<string, {
    total: number;
    latestMethod?: string;
    latestPaymentDate?: string;
    latestReferenceNumber?: string;
    latestNotes?: string;
    history: SalePaymentRecord[];
  }> = {};
  if (paymentsRes.data) {
    for (const pay of paymentsRes.data) {
      if (pay.sale_id) {
        if (!paymentsMap[pay.sale_id]) {
          paymentsMap[pay.sale_id] = {
            total: 0,
            latestMethod: pay.payment_method,
            // Keep the date-only database value intact for input[type=date].
            latestPaymentDate: typeof pay.payment_date === "string"
              ? pay.payment_date.slice(0, 10)
              : undefined,
            latestReferenceNumber: pay.reference_number || undefined,
            latestNotes: pay.notes || undefined,
            history: [],
          };
        }
        paymentsMap[pay.sale_id].total += Number(pay.amount) || 0;
        paymentsMap[pay.sale_id].history.push({
          id: pay.id,
          amount: Number(pay.amount) || 0,
          paymentMethod: normalizePaymentMethod(pay.payment_method) || pay.payment_method || "Cash",
          paymentDate: typeof pay.payment_date === "string" ? pay.payment_date.slice(0, 10) : "",
          referenceNumber: pay.reference_number || undefined,
          notes: pay.notes || undefined,
        });
      }
    }
  }

  const rows = (salesRes.data || []) as unknown as SaleRowWithRelations[];

  return rows.map((s) => {
    const rawSale = s as unknown as Record<string, unknown>;
    const rawItems = (s.sale_items || []) as unknown as Array<Record<string, unknown> & {
      products?: {
        id?: string;
        name?: string;
        sku?: string | null;
        variant?: string | null;
        variant_name?: string | null;
        size?: string | null;
      } | null;
    }>;

    const items = rawItems.map((item) => {
      const qty = readNumericField(item, "quantity", "qty") || 1;
      const uPrice = readNumericField(item, "unit_price", "unitPrice", "price", "selling_price", "unit_cost") || 0;
      const itemSub = readNumericField(item, "subtotal", "line_total", "lineTotal", "total") ?? qty * uPrice;
      const variant = item.variant_name || item.product_variant || item.variant_size || item.variant || item.product_size || item.size || item.products?.variant_name || item.products?.variant || item.products?.size;
      const productName = String(item.products?.name || item.product_name || "Product");
      return {
        id: String(item.id || `${String(item.product_id || item.productId || "item")}-${qty}`),
        productId: String(item.product_id || item.productId || ""),
        productName: variant && !productName.toLowerCase().includes(String(variant).toLowerCase())
          ? `${productName} (${variant})`
          : productName,
        sku: item.products?.sku || String(item.sku || ""),
        quantity: qty,
        unitPrice: uPrice,
        subtotal: itemSub,
      };
    });

    const itemsSubtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

    // sale_date is a PostgreSQL DATE. Keep its calendar value intact; parsing
    // YYYY-MM-DD as a timestamp shifts it across time zones. created_at is the
    // actual timestamp and is formatted once using the app's Dhaka convention.
    const date = String(s.sale_date || "").slice(0, 10);
    const time = s.created_at ? formatTime(s.created_at) : "";

    let metaSubtotal: number | null = null;
    let metaDiscount = readNumericField(rawSale, "discount_amount", "discountAmount", "discount") || 0;
    let metaTax = readNumericField(rawSale, "tax_amount", "taxAmount", "vat_amount", "vatAmount", "tax") || 0;
    let cleanNotes = s.notes || "";

    if (s.notes && s.notes.includes("<!--META:")) {
      try {
        const match = s.notes.match(/<!--META:(.*?)-->/);
        if (match && match[1]) {
          const parsed = JSON.parse(match[1]);
          if (parsed.subtotal !== undefined) metaSubtotal = Number(parsed.subtotal);
          if (parsed.discountAmount !== undefined) metaDiscount = Number(parsed.discountAmount);
          if (parsed.taxAmount !== undefined) metaTax = Number(parsed.taxAmount);
        }
        cleanNotes = s.notes.replace(/<!--META:.*?-->/g, "").trim();
      } catch {
        // preserve existing notes
      }
    }

    const subtotal =
      metaSubtotal !== null && metaSubtotal > 0
        ? metaSubtotal
        : (readNumericField(rawSale, "subtotal", "sub_total", "subTotal") || 0) > 0
          ? readNumericField(rawSale, "subtotal", "sub_total", "subTotal")!
          : itemsSubtotal;

    const totalAmount =
      (readNumericField(rawSale, "total_amount", "totalAmount", "grand_total", "grandTotal", "total") || 0) > 0
        ? readNumericField(rawSale, "total_amount", "totalAmount", "grand_total", "grandTotal", "total")!
        : Math.max(0, subtotal - metaDiscount + metaTax);

    const recordedPayment = paymentsMap[s.id]?.total;
    const paymentMethodFromPay = paymentsMap[s.id]?.latestMethod;

    const paidAmount = recordedPayment || 0;

    const dueAmount = Math.max(0, totalAmount - paidAmount);

    const paymentStatus: PaymentStatus =
      dueAmount === 0
        ? "paid"
        : paidAmount > 0
          ? "partial"
          : "unpaid";

    return {
      id: s.id,
      invoiceNumber: s.invoice_number,
      customerId: s.customer_id || undefined,
      customerName: s.customers?.name || "Walk-in Customer",
      customerType: "Retail",
      customerPhone: s.customers?.phone || "",
      date,
      time,
      items,
      subtotal,
      discountAmount: metaDiscount,
      taxAmount: metaTax,
      totalAmount,
      paidAmount,
      dueAmount,
      paymentStatus,
      paymentMethod:
        normalizePaymentMethod(paymentMethodFromPay) ||
        normalizePaymentMethod(rawSale.payment_method) ||
        ("Cash" as PaymentMethod),
      paymentDate: paymentsMap[s.id]?.latestPaymentDate,
      lastPaymentReferenceNumber: paymentsMap[s.id]?.latestReferenceNumber,
      lastPaymentNotes: paymentsMap[s.id]?.latestNotes,
      paymentHistory: paymentsMap[s.id]?.history || [],
      status: (s.status?.toLowerCase() as SaleStatus) || "completed",
      notes: cleanNotes,
      createdBy: s.created_by || undefined,
    };
  });
};

export const createSale = async (
  saleData: CreateSaleInput,
  userId?: string,
): Promise<unknown> => {
  const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(
    1000 + Math.random() * 9000,
  )}`;

  // 1. Resolve or auto-create customer if name provided and customerId missing
  let resolvedCustomerId: string | null = isUuid(saleData.customerId)
    ? saleData.customerId!.trim()
    : null;

  if (
    !resolvedCustomerId &&
    saleData.customerName &&
    saleData.customerName.trim().toLowerCase() !== "walk-in customer" &&
    saleData.customerName.trim().toLowerCase() !== "walk-in"
  ) {
    const trimmed = saleData.customerName.trim();
    const { data: existingCust } = await supabase
      .from("customers")
      .select("id")
      .ilike("name", trimmed)
      .maybeSingle();

    if (existingCust?.id) {
      resolvedCustomerId = existingCust.id;
    } else {
      const custPayload: Record<string, unknown> = {
        name: trimmed,
        phone: saleData.customerPhone?.trim() || null,
        balance: 0,
      };
      let { data: newCust, error: custErr } = await supabase
        .from("customers")
        .insert(custPayload)
        .select("id")
        .maybeSingle();

      while (custErr && custErr.message.includes("Could not find the '")) {
        const match = custErr.message.match(/Could not find the '([^']+)' column/);
        if (match && match[1] && match[1] in custPayload) {
          delete custPayload[match[1]];
          const retry = await supabase
            .from("customers")
            .insert(custPayload)
            .select("id")
            .maybeSingle();
          newCust = retry.data;
          custErr = retry.error;
        } else {
          break;
        }
      }

      if (newCust?.id) {
        resolvedCustomerId = newCust.id;
      }
    }
  }

  // 2. Format items for both camelCase and snake_case compatibility
  const normalizedItems = saleData.items.map((i) => ({
    productId: i.productId,
    product_id: i.productId,
    quantity: Number(i.quantity) || 1,
    unitPrice: Number(i.unitPrice) || 0,
    unit_price: Number(i.unitPrice) || 0,
    subtotal:
      Number(i.subtotal) || (Number(i.quantity) || 1) * (Number(i.unitPrice) || 0),
  }));

  const itemsSubtotal = normalizedItems.reduce(
    (sum, item) => sum + (Number(item.subtotal) || 0),
    0,
  );
  const actualSubtotal =
    Number(saleData.subtotal) > 0 ? Number(saleData.subtotal) : itemsSubtotal;

  const metaTag = `<!--META:${JSON.stringify({
    subtotal: actualSubtotal,
    discountAmount: Number(saleData.discountAmount) || 0,
    taxAmount: Number(saleData.taxAmount) || 0,
    paidAmount: Number(saleData.paidAmount) || 0,
  })}-->`;
  const combinedNotes = saleData.notes
    ? `${saleData.notes.trim()}\n${metaTag}`
    : metaTag;

  // 3. Execute through PostgreSQL RPC function (single authoritative atomic mechanism)
  const { data, error } = await supabase.rpc("process_sale_transaction", {
    p_invoice_number: invoiceNumber,
    p_customer_id: resolvedCustomerId || null,
    p_subtotal: actualSubtotal,
    p_discount_amount: Number(saleData.discountAmount) || 0,
    p_tax_amount: Number(saleData.taxAmount) || 0,
    p_total_amount: Number(saleData.totalAmount) || 0,
    p_paid_amount: Number(saleData.paidAmount) || 0,
    p_payment_method: saleData.paymentMethod || "Cash",
    p_status: (saleData.status || "completed").trim().toLowerCase(),
    p_notes: combinedNotes,
    p_user_id: userId || null,
    p_items: normalizedItems,
  });

  if (error) {
    const isMissingRpcError =
      error.code === "PGRST202" ||
      error.code === "42883" ||
      error.message.includes("Could not find the function") ||
      /function\s+(?:public\.)?process_sale_transaction.*does not exist/i.test(
        error.message,
      );

    if (isMissingRpcError) {
      throw new Error(
        `Sale could not be completed because the atomic database RPC process_sale_transaction is unavailable (${error.message}). Apply the database migrations and reload schema cache.`,
        { cause: error },
      );
    }

    throw new Error(error.message);
  }

  return data;
};

const normalizeRpcPaymentMethod = (rawMethod: string): string => {
  const method = rawMethod.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (method === "card") return "card";
  if (method === "bank_transfer" || method === "bank") return "bank_transfer";
  if (method === "mfs" || method === "mobile_money" || method === "mobile") {
    return "mobile_money";
  }
  if (method === "cheque") return "cheque";
  return "cash";
};

const isMissingRpcWithItemsError = (error: {
  code?: string;
  message?: string;
}): boolean => {
  const msg = error.message || "";
  return (
    (error.code === "PGRST202" ||
      msg.includes("Could not find the function")) &&
    msg.includes("update_sale_payment_transaction") &&
    msg.includes("p_items")
  );
};

const insertStockMovementResilient = async (payload: {
  productId: string;
  movementType: "stock_in" | "stock_out";
  quantity: number;
  previousStock: number;
  currentStock: number;
  referenceId: string;
  notes: string;
  createdBy?: string | null;
}) => {
  const baseRow: Record<string, unknown> = {
    product_id: payload.productId,
    type: payload.movementType,
    movement_type: payload.movementType,
    quantity: payload.quantity,
    previous_stock: payload.previousStock,
    current_stock: payload.currentStock,
    reference_id: payload.referenceId,
    reference_type: "sale",
    notes: payload.notes,
    created_by: payload.createdBy || null,
  };

  let { error } = await supabase.from("stock_movements").insert(baseRow);
  while (error && error.message.includes("Could not find the '")) {
    const match = error.message.match(/Could not find the '([^']+)' column/);
    if (match && match[1] && match[1] in baseRow) {
      delete baseRow[match[1]];
      const retry = await supabase.from("stock_movements").insert(baseRow);
      error = retry.error;
    } else {
      break;
    }
  }
  if (error) {
    throw new Error(error.message);
  }
};

const extractNonWritableColumn = (message: string): string | null => {
  const missingMatch = message.match(/Could not find the '([^']+)' column/);
  if (missingMatch?.[1]) return missingMatch[1];

  const defaultOnlyMatch = message.match(
    /column "([^"]+)" can only be updated to DEFAULT/i,
  );
  if (defaultOnlyMatch?.[1]) return defaultOnlyMatch[1];

  const nonDefaultInsertMatch = message.match(
    /cannot insert a non-DEFAULT value into column "([^"]+)"/i,
  );
  if (nonDefaultInsertMatch?.[1]) return nonDefaultInsertMatch[1];

  return null;
};

const syncSaleSummaryColumns = async (
  saleId: string,
  summary: {
    discountAmount: number;
    taxAmount: number;
  },
) => {
  // Never send generated/read-only columns like subtotal or total_amount here;
  // subtotal/discount/tax metadata is also preserved in sales.notes <!--META:...-->.
  const payload: Record<string, unknown> = {
    discount_amount: summary.discountAmount,
    tax_amount: summary.taxAmount,
    updated_at: new Date().toISOString(),
  };

  let { error } = await supabase.from("sales").update(payload).eq("id", saleId);
  while (error) {
    const colToStrip = extractNonWritableColumn(error.message || "");
    if (colToStrip && colToStrip in payload) {
      delete payload[colToStrip];
      if (Object.keys(payload).length === 0) return;
      const retry = await supabase.from("sales").update(payload).eq("id", saleId);
      error = retry.error;
    } else {
      break;
    }
  }
};

const reconcileSaleItemsRows = async (
  saleId: string,
  items: UpdateSaleInput["items"],
  existingRows: Array<Record<string, unknown>>,
) => {
  const existingIds = new Set(existingRows.map((row) => String(row.id)));
  const keptIds: string[] = [];

  for (const item of items) {
    const qty = Math.trunc(Number(item.quantity));
    const unitPrice = Number(item.unitPrice) || 0;
    const subtotal =
      Number.isFinite(Number(item.subtotal))
        ? Math.round(Number(item.subtotal) * 100) / 100
        : Math.round(qty * unitPrice * 100) / 100;
    const trimmedId = isUuid(item.id) ? item.id!.trim() : "";

    if (trimmedId && existingIds.has(trimmedId)) {
      const updatePayload: Record<string, unknown> = {
        product_id: item.productId,
        quantity: qty,
        unit_price: unitPrice,
        subtotal,
      };
      let { error: updErr } = await supabase
        .from("sale_items")
        .update(updatePayload)
        .eq("id", trimmedId)
        .eq("sale_id", saleId);
      while (updErr) {
        const colToStrip = extractNonWritableColumn(updErr.message || "");
        if (colToStrip && colToStrip in updatePayload) {
          delete updatePayload[colToStrip];
          const retry = await supabase
            .from("sale_items")
            .update(updatePayload)
            .eq("id", trimmedId)
            .eq("sale_id", saleId);
          updErr = retry.error;
        } else {
          break;
        }
      }
      if (updErr) throw new Error(updErr.message);
      keptIds.push(trimmedId);
    } else {
      const insertPayload: Record<string, unknown> = {
        sale_id: saleId,
        product_id: item.productId,
        quantity: qty,
        unit_price: unitPrice,
        subtotal,
      };
      let { data: inserted, error: insErr } = await supabase
        .from("sale_items")
        .insert(insertPayload)
        .select("id")
        .single();
      while (insErr) {
        const colToStrip = extractNonWritableColumn(insErr.message || "");
        if (colToStrip && colToStrip in insertPayload) {
          delete insertPayload[colToStrip];
          const retry = await supabase
            .from("sale_items")
            .insert(insertPayload)
            .select("id")
            .single();
          inserted = retry.data;
          insErr = retry.error;
        } else {
          break;
        }
      }
      if (insErr) throw new Error(insErr.message);
      if (inserted?.id) keptIds.push(String(inserted.id));
    }
  }

  const removedIds = Array.from(existingIds).filter(
    (existingId) => !keptIds.includes(existingId),
  );
  if (removedIds.length > 0) {
    const { error: delErr } = await supabase
      .from("sale_items")
      .delete()
      .eq("sale_id", saleId)
      .in("id", removedIds);
    if (delErr) throw new Error(delErr.message);
  }
};

export const updateSale = async (
  id: string,
  updates: UpdateSaleInput,
): Promise<void> => {
  if (!updates.items || updates.items.length === 0) {
    throw new Error("Sale edits must include at least one item.");
  }

  for (const item of updates.items) {
    const qty = Number(item.quantity);
    if (!item.productId || !Number.isInteger(qty) || qty < 1) {
      throw new Error(
        "Each sale item requires a product and a positive integer quantity.",
      );
    }
    if (!Number.isFinite(Number(item.unitPrice)) || Number(item.unitPrice) < 0) {
      throw new Error("Sale item unit price cannot be negative.");
    }
  }

  const newPaymentAmount = Number(updates.newPaymentAmount) || 0;
  const referenceNumber = updates.referenceNumber || "";
  if (newPaymentAmount > 0 && !referenceNumber) {
    throw new Error("A payment reference is required to safely record the new payment.");
  }

  const paymentMethod = normalizeRpcPaymentMethod(updates.paymentMethod || "Cash");
  const paymentDate = updates.paymentDate || new Date().toISOString().slice(0, 10);
  const normalizedStatus = (updates.status || "completed").trim().toLowerCase();

  const normalizedItems = updates.items.map((item) => {
    const qty = Math.trunc(Number(item.quantity));
    const unitPrice = Number(item.unitPrice) || 0;
    const subtotal =
      Number.isFinite(Number(item.subtotal))
        ? Math.round(Number(item.subtotal) * 100) / 100
        : Math.round(qty * unitPrice * 100) / 100;
    return {
      id: isUuid(item.id) ? item.id!.trim() : null,
      product_id: item.productId,
      quantity: qty,
      unit_price: unitPrice,
      subtotal,
    };
  });

  const itemsSubtotal = normalizedItems.reduce(
    (sum, item) => sum + item.subtotal,
    0,
  );
  const actualSubtotal =
    Number(updates.subtotal) > 0 ? Number(updates.subtotal) : itemsSubtotal;
  const discountAmount = Number(updates.discountAmount) || 0;
  const taxAmount = Number(updates.taxAmount) || 0;
  const paidAmount = Number(updates.paidAmount) || 0;

  const metaTag = `<!--META:${JSON.stringify({
    subtotal: actualSubtotal,
    discountAmount,
    taxAmount,
    paidAmount,
  })}-->`;
  const cleanNotes = updates.notes?.replace(/<!--META:.*?-->/g, "").trim();
  const combinedNotes = cleanNotes ? `${cleanNotes}\n${metaTag}` : metaTag;

  const { error } = await supabase.rpc("update_sale_payment_transaction", {
    p_sale_id: id,
    p_items: normalizedItems,
    p_total_amount: Number(updates.totalAmount),
    p_new_payment_amount: newPaymentAmount,
    p_payment_method: paymentMethod,
    p_payment_date: paymentDate,
    p_reference_number: referenceNumber,
    p_notes: combinedNotes,
    p_status: normalizedStatus,
  });

  if (!error) {
    await syncSaleSummaryColumns(id, {
      discountAmount,
      taxAmount,
    });
    return;
  }

  if (!isMissingRpcWithItemsError(error)) {
    throw new Error(error.message);
  }

  // Fallback for live databases running the 8-parameter update_sale_payment_transaction RPC
  const [saleRes, existingItemsRes] = await Promise.all([
    supabase
      .from("sales")
      .select("id, invoice_number, status, created_by")
      .eq("id", id)
      .single(),
    supabase.from("sale_items").select("*").eq("sale_id", id),
  ]);

  if (saleRes.error || !saleRes.data) {
    throw new Error(saleRes.error?.message || "Sale record was not found.");
  }
  if (existingItemsRes.error) {
    throw new Error(existingItemsRes.error.message);
  }

  const existingRows = (existingItemsRes.data || []) as Array<
    Record<string, unknown>
  >;
  const oldStatus = String(saleRes.data.status || "completed")
    .trim()
    .toLowerCase();

  const oldQtyByProduct = new Map<string, number>();
  for (const row of existingRows) {
    const pid = String(row.product_id || "");
    const qty = readNumericField(row, "quantity", "qty") || 0;
    if (pid) {
      oldQtyByProduct.set(pid, (oldQtyByProduct.get(pid) ?? 0) + qty);
    }
  }

  const newQtyByProduct = new Map<string, number>();
  for (const item of normalizedItems) {
    newQtyByProduct.set(
      item.product_id,
      (newQtyByProduct.get(item.product_id) ?? 0) + item.quantity,
    );
  }

  const allProductIds = Array.from(
    new Set([...oldQtyByProduct.keys(), ...newQtyByProduct.keys()]),
  );
  const stockDeltas = allProductIds
    .map((productId) => ({
      productId,
      delta:
        (oldQtyByProduct.get(productId) ?? 0) -
        (newQtyByProduct.get(productId) ?? 0),
    }))
    .filter((entry) => entry.delta !== 0);

  if (oldStatus === "completed" && normalizedStatus === "completed" && stockDeltas.length > 0) {
    const { data: productRows, error: prodFetchErr } = await supabase
      .from("products")
      .select("id, name, quantity")
      .in(
        "id",
        stockDeltas.map((d) => d.productId),
      );
    if (prodFetchErr) throw new Error(prodFetchErr.message);

    const productMap = new Map(
      (productRows || []).map((p) => [String(p.id), p]),
    );
    for (const { productId, delta } of stockDeltas) {
      const prod = productMap.get(productId);
      if (!prod) {
        throw new Error(`Product with ID ${productId} was not found.`);
      }
      const currentQty = Number(prod.quantity) || 0;
      if (delta < 0 && currentQty < Math.abs(delta)) {
        throw new Error(
          `Insufficient stock for ${prod.name}. Available: ${currentQty}, Additional quantity requested: ${Math.abs(delta)}.`,
        );
      }
    }
  }

  if (oldStatus !== "completed" && normalizedStatus === "completed") {
    await reconcileSaleItemsRows(id, updates.items, existingRows);
    const { error: rpc8Err } = await supabase.rpc(
      "update_sale_payment_transaction",
      {
        p_sale_id: id,
        p_total_amount: Number(updates.totalAmount),
        p_new_payment_amount: newPaymentAmount,
        p_payment_method: paymentMethod,
        p_payment_date: paymentDate,
        p_reference_number: referenceNumber,
        p_notes: combinedNotes,
        p_status: normalizedStatus,
      },
    );
    if (rpc8Err) throw new Error(rpc8Err.message);
  } else {
    const { error: rpc8Err } = await supabase.rpc(
      "update_sale_payment_transaction",
      {
        p_sale_id: id,
        p_total_amount: Number(updates.totalAmount),
        p_new_payment_amount: newPaymentAmount,
        p_payment_method: paymentMethod,
        p_payment_date: paymentDate,
        p_reference_number: referenceNumber,
        p_notes: combinedNotes,
        p_status: normalizedStatus,
      },
    );
    if (rpc8Err) throw new Error(rpc8Err.message);

    await reconcileSaleItemsRows(id, updates.items, existingRows);

    if (oldStatus === "completed" && normalizedStatus === "completed") {
      for (const { productId, delta } of stockDeltas) {
        const { data: prod, error: prodErr } = await supabase
          .from("products")
          .select("id, name, quantity")
          .eq("id", productId)
          .single();
        if (prodErr || !prod) {
          throw new Error(
            prodErr?.message || `Product with ID ${productId} was not found.`,
          );
        }

        const currentStock = Number(prod.quantity) || 0;
        const nextStock = currentStock + delta;
        if (nextStock < 0) {
          throw new Error(
            `Insufficient stock for ${prod.name}. Available: ${currentStock}, Additional quantity requested: ${Math.abs(delta)}.`,
          );
        }

        const { error: updProdErr } = await supabase
          .from("products")
          .update({
            quantity: nextStock,
            updated_at: new Date().toISOString(),
          })
          .eq("id", productId);
        if (updProdErr) throw new Error(updProdErr.message);

        await insertStockMovementResilient({
          productId,
          movementType: delta > 0 ? "stock_in" : "stock_out",
          quantity: Math.abs(delta),
          previousStock: currentStock,
          currentStock: nextStock,
          referenceId: id,
          notes: `Sale quantity updated for invoice #${saleRes.data.invoice_number}`,
          createdBy: saleRes.data.created_by,
        });
      }
    }
  }

  await syncSaleSummaryColumns(id, {
    discountAmount,
    taxAmount,
  });
};
