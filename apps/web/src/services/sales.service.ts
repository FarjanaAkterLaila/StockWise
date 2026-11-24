import { supabase } from "@/lib/supabase";
import type { Sale, PaymentStatus, SaleStatus, PaymentMethod } from "@/types";
import type { SaleRow, SaleItemRow } from "@/types/database.types";

interface SaleItemWithProduct extends SaleItemRow {
  products: { id: string; name: string; sku: string | null } | null;
}

interface SaleRowWithRelations extends SaleRow {
  customers: { id: string; name: string; phone: string | null } | null;
  sale_items: SaleItemWithProduct[] | null;
}

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

export const fetchSales = async (): Promise<Sale[]> => {
  const { data, error } = await supabase
    .from("sales")
    .select(`
      *,
      customers:customer_id (id, name, phone),
      sale_items (
        id,
        product_id,
        quantity,
        unit_price,
        subtotal,
        products:product_id (id, name, sku)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const rows = (data || []) as unknown as SaleRowWithRelations[];

  return rows.map((s) => {
    const items = (s.sale_items || []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.products?.name || "Product",
      sku: item.products?.sku || "",
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unit_price) || 0,
      subtotal: Number(item.subtotal) || 0,
    }));

    const dateObj = new Date(s.sale_date || s.created_at);
    const date = dateObj.toISOString().split("T")[0];
    const time = dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

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
      subtotal: Number(s.subtotal) || 0,
      discountAmount: Number(s.discount_amount) || 0,
      taxAmount: Number(s.tax_amount) || 0,
      totalAmount: Number(s.total_amount) || 0,
      paidAmount: Number(s.paid_amount) || 0,
      dueAmount: Number(s.due_amount) || 0,
      paymentStatus: (s.payment_status?.toLowerCase() as PaymentStatus) || "paid",
      paymentMethod: "Cash" as PaymentMethod,
      status: (s.status?.toLowerCase() as SaleStatus) || "completed",
      notes: s.notes || "",
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
  let resolvedCustomerId = saleData.customerId;
  if (
    !resolvedCustomerId &&
    saleData.customerName &&
    saleData.customerName.trim().toLowerCase() !== "walk-in customer"
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
      const { data: newCust } = await supabase
        .from("customers")
        .insert({
          name: trimmed,
          phone: saleData.customerPhone?.trim() || null,
          balance: 0,
        })
        .select("id")
        .maybeSingle();
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

  // 3. Execute through PostgreSQL RPC function for atomic stock validation & deduction
  const { data, error } = await supabase.rpc("process_sale_transaction", {
    p_invoice_number: invoiceNumber,
    p_customer_id: resolvedCustomerId || null,
    p_subtotal: Number(saleData.subtotal) || 0,
    p_discount_amount: Number(saleData.discountAmount) || 0,
    p_tax_amount: Number(saleData.taxAmount) || 0,
    p_total_amount: Number(saleData.totalAmount) || 0,
    p_paid_amount: Number(saleData.paidAmount) || 0,
    p_payment_method: saleData.paymentMethod || "Cash",
    p_status: saleData.status || "completed",
    p_notes: saleData.notes || null,
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

      const dueAmount = Math.max(
        0,
        Number(saleData.totalAmount) - Number(saleData.paidAmount || 0),
      );
      const paymentStatus =
        dueAmount === 0
          ? "paid"
          : Number(saleData.paidAmount || 0) > 0
            ? "partial"
            : "unpaid";

      const salePayload: Record<string, unknown> = {
        invoice_number: invoiceNumber,
        customer_id: resolvedCustomerId || null,
        sale_date: new Date().toISOString(),
        subtotal: Number(saleData.subtotal) || 0,
        discount_amount: Number(saleData.discountAmount) || 0,
        tax_amount: Number(saleData.taxAmount) || 0,
        total_amount: Number(saleData.totalAmount) || 0,
        paid_amount: Number(saleData.paidAmount) || 0,
        due_amount: dueAmount,
        payment_status: paymentStatus,
        status: saleData.status || "completed",
        notes: saleData.notes || null,
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
          payment_number: `PAY-SAL-${Date.now().toString().slice(-6)}`,
          payment_type: "sale",
          sale_id: newSale.id,
          customer_id: resolvedCustomerId || null,
          amount: Number(saleData.paidAmount),
          payment_date: new Date().toISOString(),
          payment_method: "cash",
          notes: `Payment for invoice #${invoiceNumber}`,
        };
        if (userId) paymentPayload.created_by = userId;
        await supabase.from("payments").insert(paymentPayload);
      }

      return newSale;
    }

    throw new Error(error.message);
  }

  return data;
};

export const updateSale = async (
  id: string,
  updates: Partial<CreateSaleInput>,
): Promise<void> => {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (updates.notes !== undefined) payload.notes = updates.notes || null;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.customerId !== undefined) {
    payload.customer_id = updates.customerId && updates.customerId.trim() ? updates.customerId.trim() : null;
  }
  if (updates.totalAmount !== undefined) payload.total_amount = Number(updates.totalAmount);
  if (updates.paidAmount !== undefined) {
    payload.paid_amount = Number(updates.paidAmount);
    if (updates.totalAmount !== undefined) {
      payload.due_amount = Math.max(
        0,
        Number(updates.totalAmount) - Number(updates.paidAmount),
      );
      payload.payment_status =
        payload.due_amount === 0
          ? "paid"
          : Number(updates.paidAmount) > 0
            ? "partial"
            : "unpaid";
    }
  }

  let { error } = await supabase.from("sales").update(payload).eq("id", id);

  while (error && error.message.includes("Could not find the '")) {
    const match = error.message.match(/Could not find the '([^']+)' column/);
    if (match && match[1] && match[1] in payload) {
      delete payload[match[1]];
      const retry = await supabase.from("sales").update(payload).eq("id", id);
      error = retry.error;
    } else {
      break;
    }
  }

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
