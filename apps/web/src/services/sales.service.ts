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
  totalAmount: number;
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

  // 3. Execute through PostgreSQL RPC function for atomic stock validation & deduction
  const { data, error } = await supabase.rpc("process_sale_transaction", {
    p_invoice_number: invoiceNumber,
    p_customer_id: resolvedCustomerId || null,
    p_subtotal: actualSubtotal,
    p_discount_amount: Number(saleData.discountAmount) || 0,
    p_tax_amount: Number(saleData.taxAmount) || 0,
    p_total_amount: Number(saleData.totalAmount) || 0,
    p_paid_amount: Number(saleData.paidAmount) || 0,
    p_payment_method: saleData.paymentMethod || "Cash",
    p_status: saleData.status || "completed",
    p_notes: combinedNotes,
    p_user_id: userId || null,
    p_items: normalizedItems,
  });

  // 4. Resilient Fallback: If RPC function is not installed or raises execution error, run direct transactional flow
  if (error) {
    if (
      error.message.includes("function") ||
      error.message.includes("does not exist") ||
      error.message.includes("Could not find the function")
    ) {
      console.warn("RPC process_sale_transaction unavailable, executing direct fallback:", error.message);

      const isCompleted = (saleData.status || "completed").toLowerCase() === "completed";

      // Check stock before sale
      if (isCompleted) {
        for (const item of saleData.items) {
          const { data: prod } = await supabase
            .from("products")
            .select("quantity, name")
            .eq("id", item.productId)
            .maybeSingle();

          if (prod && (prod.quantity || 0) < item.quantity) {
            throw new Error(
              `Insufficient stock for "${prod.name}". Available: ${prod.quantity || 0}, Requested: ${item.quantity}`,
            );
          }
        }
      }

      const salePayload: Record<string, unknown> = {
        invoice_number: invoiceNumber,
        customer_id: resolvedCustomerId || null,
        sale_date: new Date().toISOString(),
        subtotal: actualSubtotal,
        discount_amount: Number(saleData.discountAmount) || 0,
        tax_amount: Number(saleData.taxAmount) || 0,
        total_amount: Number(saleData.totalAmount) || 0,
        status: saleData.status || "completed",
        notes: combinedNotes,
      };
      if (userId) salePayload.created_by = userId;

      let { data: newSale, error: saleErr } = await supabase
        .from("sales")
        .insert(salePayload)
        .select()
        .single();

      while (saleErr && saleErr.message.includes("Could not find the '")) {
        const match = saleErr.message.match(/Could not find the '([^']+)' column/);
        if (match && match[1] && match[1] in salePayload) {
          delete salePayload[match[1]];
          const retry = await supabase
            .from("sales")
            .insert(salePayload)
            .select()
            .single();
          newSale = retry.data;
          saleErr = retry.error;
        } else {
          break;
        }
      }

      if (saleErr || !newSale) {
        throw new Error(saleErr?.message || "Failed to record sale.");
      }

      // Insert sale items with resilience for generated columns
      let itemsToInsert: Record<string, unknown>[] = saleData.items.map((i) => ({
        sale_id: newSale.id,
        product_id: i.productId,
        quantity: Number(i.quantity) || 1,
        unit_price: Number(i.unitPrice) || 0,
        subtotal:
          Number(i.subtotal) || (Number(i.quantity) || 1) * (Number(i.unitPrice) || 0),
      }));

      let { error: itemsErr } = await supabase
        .from("sale_items")
        .insert(itemsToInsert);

      while (
        itemsErr &&
        (itemsErr.message.includes("Could not find the '") ||
          itemsErr.message.includes("cannot insert a non-DEFAULT value into column"))
      ) {
        let colToStrip: string | null = null;
        const missingMatch = itemsErr.message.match(/Could not find the '([^']+)' column/);
        const genMatch = itemsErr.message.match(/cannot insert a non-DEFAULT value into column "([^"]+)"/);
        if (missingMatch && missingMatch[1]) {
          colToStrip = missingMatch[1];
        } else if (genMatch && genMatch[1]) {
          colToStrip = genMatch[1];
        }

        if (colToStrip) {
          itemsToInsert = itemsToInsert.map((item) => {
            const copy = { ...item };
            delete copy[colToStrip!];
            return copy;
          });
          const retry = await supabase.from("sale_items").insert(itemsToInsert);
          itemsErr = retry.error;
        } else {
          break;
        }
      }

      if (itemsErr) throw new Error(itemsErr.message);

      // Deduct stock if completed
      if (isCompleted) {
        for (const item of saleData.items) {
          const { data: prod } = await supabase
            .from("products")
            .select("quantity")
            .eq("id", item.productId)
            .maybeSingle();

          if (prod) {
            const currentQty = Number(prod.quantity) || 0;
            const newQty = Math.max(0, currentQty - Number(item.quantity));
            await supabase
              .from("products")
              .update({ quantity: newQty, updated_at: new Date().toISOString() })
              .eq("id", item.productId);

            await supabase.from("stock_movements").insert({
              product_id: item.productId,
              type: "sale",
              quantity: -Number(item.quantity),
              previous_stock: currentQty,
              current_stock: newQty,
              reference_id: newSale.id,
              notes: `POS Sale invoice #${invoiceNumber}`,
            });
          }
        }
      }

      // Record payment if paid_amount > 0
      if (Number(saleData.paidAmount) > 0) {
        const paymentPayload: Record<string, unknown> = {
          payment_type: "received",
          sale_id: newSale.id,
          purchase_id: null,
          amount: Number(saleData.paidAmount),
          payment_date: new Date().toISOString().slice(0, 10),
          payment_method: "cash",
          notes: `Payment for invoice #${invoiceNumber}`,
        };
        if (userId) paymentPayload.created_by = userId;

        let { error: payErr } = await supabase.from("payments").insert(paymentPayload);
        while (payErr && payErr.message.includes("Could not find the '")) {
          const match = payErr.message.match(/Could not find the '([^']+)' column/);
          if (match && match[1] && match[1] in paymentPayload) {
            delete paymentPayload[match[1]];
            const retry = await supabase.from("payments").insert(paymentPayload);
            payErr = retry.error;
          } else {
            break;
          }
        }
      }

      return newSale;
    }

    throw new Error(error.message);
  }

  return data;
};

export const updateSale = async (
  id: string,
  updates: UpdateSaleInput,
): Promise<void> => {
  const newPaymentAmount = Number(updates.newPaymentAmount);
  const referenceNumber = updates.referenceNumber || "";
  if (newPaymentAmount > 0 && !referenceNumber) {
    throw new Error("A payment reference is required to safely record the new payment.");
  }
  const method = updates.paymentMethod.trim().toLowerCase().replace(/[\s-]+/g, "_");
  const paymentMethod = method === "card"
    ? "card"
    : method === "bank_transfer" || method === "bank"
      ? "bank_transfer"
      : method === "mfs" || method === "mobile_money" || method === "mobile"
        ? "mobile_money"
        : "cash";
  const { error } = await supabase.rpc("update_sale_payment_transaction", {
    p_sale_id: id,
    p_total_amount: Number(updates.totalAmount),
    p_new_payment_amount: newPaymentAmount,
    p_payment_method: paymentMethod,
    p_payment_date: updates.paymentDate || new Date().toISOString().slice(0, 10),
    p_reference_number: referenceNumber,
    p_notes: updates.notes || null,
    p_status: updates.status || "completed",
  });
  if (error) throw new Error(error.message);
};

export const deleteSale = async (id: string): Promise<void> => {
  // 1. Fetch sale details to check status and invoice number
  const { data: sale } = await supabase
    .from("sales")
    .select("id, status, invoice_number")
    .eq("id", id)
    .maybeSingle();

  if (!sale) return;

  // 2. If status was completed, restore product stock
  if (sale.status?.toLowerCase() === "completed") {
    const { data: items } = await supabase
      .from("sale_items")
      .select("product_id, quantity")
      .eq("sale_id", id);

    if (items && items.length > 0) {
      for (const item of items) {
        const { data: prod } = await supabase
          .from("products")
          .select("quantity")
          .eq("id", item.product_id)
          .maybeSingle();

        if (prod) {
          const currentStock = Number(prod.quantity) || 0;
          const restoredStock = currentStock + Number(item.quantity);
          await supabase
            .from("products")
            .update({ quantity: restoredStock, updated_at: new Date().toISOString() })
            .eq("id", item.product_id);

          await supabase.from("stock_movements").insert({
            product_id: item.product_id,
            type: "return",
            quantity: Number(item.quantity),
            previous_stock: currentStock,
            current_stock: restoredStock,
            reference_id: id,
            notes: `Stock returned from deleted sale #${sale.invoice_number}`,
          });
        }
      }
    }
  }

  // 3. Delete payments linked to this sale
  await supabase.from("payments").delete().eq("sale_id", id);

  // 4. Delete sale line items
  await supabase.from("sale_items").delete().eq("sale_id", id);

  // 5. Delete sale record
  const { error } = await supabase.from("sales").delete().eq("id", id);
  if (error) throw new Error(error.message);
};
