import { supabase } from "@/lib/supabase";
import { formatTime } from "@/utils/formatters";
import { calculatePurchaseTotals } from "@/utils/purchase.utils";
import type {
  Purchase,
  PaymentStatus,
  PurchaseStatus,
  PaymentMethod,
} from "@/types";
import type {
  PurchaseRow,
  PurchaseItemRow,
  DbPaymentMethod,
} from "@/types/database.types";

interface PurchaseItemWithProduct extends PurchaseItemRow {
  products: { id: string; name: string; sku: string | null } | null;
}

interface PurchaseRowWithRelations extends PurchaseRow {
  suppliers: {
    id: string;
    name: string;
    contact_person: string | null;
    phone: string | null;
  } | null;
  purchase_items: PurchaseItemWithProduct[] | null;
}

export interface CreatePurchaseInput {
  purchaseNumber?: string;
  supplierId?: string;
  supplierName?: string;
  items: Array<{
    productId: string;
    productName?: string;
    sku?: string;
    quantity: number;
    unitPrice: number;
    subtotal?: number;
  }>;
  totalAmount: number;
  paidAmount?: number;
  paymentReference?: string;
  discountAmount?: number;
  vatRate?: number;
  vatAmount?: number;
  paymentMethod?: string;
  status?: string;
  notes?: string;
}

const toDbPaymentMethod = (method?: string): DbPaymentMethod => {
  const low = (method || "").toLowerCase();
  if (low.includes("cash")) return "cash";
  if (low.includes("card")) return "card";
  if (low.includes("mfs") || low.includes("mobile")) return "mobile_money";
  if (low.includes("cheque")) return "cheque";
  return "bank_transfer";
};

export const fetchPurchases = async (): Promise<Purchase[]> => {
  const [purchasesRes, paymentsRes] = await Promise.all([
    supabase
      .from("purchases")
      .select(
        `
        *,
        suppliers:supplier_id (id, name, contact_person, phone),
        purchase_items (
          *,
          products:product_id (id, name, sku)
        )
      `,
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("payments")
      .select("purchase_id, amount, payment_method")
      .eq("payment_type", "paid")
      .is("sale_id", null)
      .not("purchase_id", "is", null),
  ]);

  if (purchasesRes.error) throw new Error(purchasesRes.error.message);

  const paymentsMap: Record<string, { total: number; method?: string }> = {};
  if (paymentsRes.data) {
    for (const pay of paymentsRes.data) {
      if (pay.purchase_id) {
        if (!paymentsMap[pay.purchase_id]) {
          paymentsMap[pay.purchase_id] = { total: 0, method: pay.payment_method };
        }
        paymentsMap[pay.purchase_id].total += Number(pay.amount) || 0;
      }
    }
  }

  const rows = (purchasesRes.data || []) as unknown as PurchaseRowWithRelations[];

  return rows.map((p) => {
    const rawItems = (p.purchase_items || []) as unknown as Array<{
      id: string;
      product_id: string;
      quantity?: number;
      unit_price?: number;
      unit_cost?: number;
      subtotal?: number;
      products?: { id: string; name: string; sku: string } | null;
    }>;

    const items = rawItems.map((item) => {
      const qty = Number(item.quantity) || 1;
      const unitP = Number(item.unit_price) || Number(item.unit_cost) || 0;
      const sub = qty * unitP;
      return {
        id: item.id,
        productId: item.product_id,
        productName: item.products?.name || "Hardware Component",
        sku: item.products?.sku || "",
        quantity: qty,
        unitPrice: unitP,
        subtotal: sub,
      };
    });
    const itemsSubtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

    const dateObj = new Date(p.purchase_date || p.created_at);
    const date = dateObj.toISOString().split("T")[0];
    const time = formatTime(p.created_at || p.purchase_date);

    const rawP = p as unknown as Record<string, unknown>;
    let discountAmt = Number(rawP.discount_amount) || 0;
    let vatR = Number(rawP.vat_rate) || 0;
    let metaPaid: number | null = null;
    let cleanNotes = p.notes || "";

    if (p.notes && p.notes.includes("<!--META:")) {
      try {
        const metaMatch = p.notes.match(/<!--META:(.*?)-->/);
        if (metaMatch && metaMatch[1]) {
          const parsed = JSON.parse(metaMatch[1]);
          if (parsed.discount !== undefined) discountAmt = Number(parsed.discount);
          if (parsed.vatRate !== undefined) vatR = Number(parsed.vatRate);
          if (parsed.paidAmount !== undefined) metaPaid = Number(parsed.paidAmount);
        }
        cleanNotes = p.notes.replace(/<!--META:.*?-->/g, "").trim();
      } catch {
        // preserve existing notes
      }
    }

    // Use recorded payment rows when available; legacy summaries are only a fallback
    // if the payments query itself is unavailable.
    const payRecord = paymentsMap[p.id];
    const paymentsTotal = payRecord?.total || 0;
    const dbPaid = Number(p.paid_amount) || 0;
    const paidAmt = paymentsRes.error
      ? (dbPaid > 0 ? dbPaid : (metaPaid ?? 0))
      : paymentsTotal;

    const totals = calculatePurchaseTotals(
      items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        quantity: String(item.quantity),
        unitPrice: String(item.unitPrice),
      })),
      String(discountAmt),
      String(vatR),
      String(paidAmt),
    );

    // Payment method from payment record or raw purchase
    const pMethod = (payRecord?.method || rawP.payment_method || "Bank Transfer") as PaymentMethod;

    // Exact Due Amount
    const dueAmt = totals.dueAmount;

    // Exact Payment Status
    const pStatus: PaymentStatus = totals.grandTotal > 0
      ? (paidAmt >= totals.grandTotal ? "paid" : paidAmt > 0 ? "partial" : "unpaid")
      : (p.payment_status?.toLowerCase() as PaymentStatus) || "unpaid";

    return {
      id: p.id,
      purchaseNumber: p.purchase_number,
      supplierId: p.supplier_id,
      supplierName:
        p.suppliers?.name || (rawP.supplier_name as string) || "Supplier",
      date,
      time,
      items,
      subtotal: itemsSubtotal,
      discountAmount: discountAmt,
      vatRate: totals.vatRate,
      vatAmount: totals.vatAmount,
      grandTotal: totals.grandTotal,
      paidAmount: paidAmt,
      dueAmount: dueAmt,
      paymentStatus: pStatus,
      paymentMethod: pMethod,
      status: (p.status?.toLowerCase() as PurchaseStatus) || "received",
      notes: cleanNotes,
    };
  });
};

export const receivePurchaseGoods = async (
  id: string,
  userId?: string,
): Promise<unknown> => {
  // Execute directly through PostgreSQL RPC function for atomic stock addition
  const { data, error } = await supabase.rpc(
    "receive_purchase_goods_transaction",
    {
      p_purchase_id: id,
      p_user_id: userId || null,
    },
  );

  if (error) throw new Error(error.message);
  return data;
};

export const createPurchase = async (
  input: CreatePurchaseInput,
  userId?: string,
): Promise<Purchase> => {
  let suppId = input.supplierId ? input.supplierId.trim() : "";
  const nameToUse = (input.supplierName || "").trim() || "Supplier";

  if (!suppId) {
    // 1. Check if supplier already exists by name
    const { data: sData } = await supabase
      .from("suppliers")
      .select("id")
      .ilike("name", nameToUse)
      .maybeSingle();

    if (sData?.id) {
      suppId = sData.id;
    } else {
      // 2. Insert new supplier safely
      const suppPayload: Record<string, unknown> = {
        name: nameToUse,
      };

      let { data: newSupp, error: suppErr } = await supabase
        .from("suppliers")
        .insert(suppPayload)
        .select("id")
        .maybeSingle();

      if (suppErr && suppErr.message.includes("Could not find the '")) {
        const match = suppErr.message.match(
          /Could not find the '([^']+)' column/,
        );
        if (match && match[1] && match[1] in suppPayload) {
          delete suppPayload[match[1]];
          const retry = await supabase
            .from("suppliers")
            .insert(suppPayload)
            .select("id")
            .maybeSingle();
          newSupp = retry.data;
          suppErr = retry.error;
        }
      }

      if (newSupp?.id) {
        suppId = newSupp.id;
      } else if (suppErr) {
        console.warn("Could not insert supplier:", suppErr.message);
        // Fallback: see if any supplier exists in table
        const { data: anySupp } = await supabase
          .from("suppliers")
          .select("id")
          .limit(1)
          .maybeSingle();
        if (anySupp?.id) {
          suppId = anySupp.id;
        } else {
          throw new Error(
            `Unable to save supplier "${nameToUse}" in database: ${suppErr.message}.`,
          );
        }
      }
    }
  }

  if (!suppId) {
    const { data: defaultSupp } = await supabase
      .from("suppliers")
      .select("id")
      .limit(1)
      .maybeSingle();
    suppId = defaultSupp?.id;
  }

  if (!suppId) {
    throw new Error(
      "A valid supplier is required for purchase orders. Please ensure at least one supplier exists",
    );
  }

  const purchaseNumber =
    input.purchaseNumber?.trim() ||
    `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(
      1000 + Math.random() * 9000,
    )}`;

  const calcDue = Math.max(
    0,
    Number(input.totalAmount) - Number(input.paidAmount || 0),
  );
  const finalPaymentStatus =
    calcDue === 0
      ? "paid"
      : Number(input.paidAmount || 0) > 0
        ? "partial"
        : "unpaid";
  const requestedStatus = (input.status || "ordered").toLowerCase();
  const isReceived = requestedStatus === "received";
  // Safe initial status: The database check constraint purchases_status_check permits 'ordered' and 'received'.
  // We use 'ordered' so that receivePurchaseGoods can transition the order to 'received' and increment stock atomically.
  // If the user requested 'pending', we map to 'ordered' to prevent check constraint violations.
  const initialStatus = isReceived
    ? "ordered"
    : requestedStatus === "pending"
      ? "ordered"
      : requestedStatus;

  const metaObj = {
    discount: Number(input.discountAmount) || 0,
    vatRate: Number(input.vatRate) || 0,
    vatAmount: Number(input.vatAmount) || 0,
    paidAmount: Number(input.paidAmount) || 0,
    dueAmount: calcDue,
  };
  const userNotes = (input.notes || "").replace(/<!--META:.*?-->/g, "").trim();
  const notesWithMeta = `${userNotes ? userNotes + " " : ""}<!--META:${JSON.stringify(metaObj)}-->`;

  // 1. Insert Purchase (Stock is NOT increased on order creation)
  const purchasePayload: Record<string, unknown> = {
    purchase_number: purchaseNumber,
    supplier_id: suppId,
    purchase_date: new Date().toISOString(),
    total_amount: Number(input.totalAmount) || 0,
    paid_amount: Number(input.paidAmount) || 0,
    due_amount: calcDue,
    payment_status: finalPaymentStatus,
    status: initialStatus,
    discount_amount: Number(input.discountAmount) || 0,
    vat_rate: Number(input.vatRate) || 0,
    vat_amount: Number(input.vatAmount) || 0,
    notes: notesWithMeta,
  };
  if (userId) {
    purchasePayload.created_by = userId;
  }

  let { data: po, error: poErr } = await supabase
    .from("purchases")
    .insert(purchasePayload)
    .select()
    .single();

  // Resilience: If database check constraint purchases_status_check fails
  if (poErr && poErr.message.includes("purchases_status_check")) {
    const fallbackStatus =
      purchasePayload.status === "ordered" ? "received" : "ordered";
    purchasePayload.status = fallbackStatus;
    const retry = await supabase
      .from("purchases")
      .insert(purchasePayload)
      .select()
      .single();
    po = retry.data;
    poErr = retry.error;
  }

  while (poErr && poErr.message.includes("Could not find the '")) {
    const match = poErr.message.match(/Could not find the '([^']+)' column/);
    if (match && match[1] && match[1] in purchasePayload) {
      delete purchasePayload[match[1]];
      const retry = await supabase
        .from("purchases")
        .insert(purchasePayload)
        .select()
        .single();
      po = retry.data;
      poErr = retry.error;
    } else {
      break;
    }
  }

  if (poErr || !po)
    throw new Error(poErr?.message || "Failed to create purchase order.");

  // 2. Insert items with robust column stripping & fallback (omit generated 'subtotal' column)
  let itemsToInsert: Record<string, unknown>[] = input.items.map((item) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.unitPrice) || 0;
    return {
      purchase_id: po.id,
      product_id: item.productId,
      quantity: qty,
      unit_cost: price,
      unit_price: price,
    };
  });

  let { error: itemsErr } = await supabase
    .from("purchase_items")
    .insert(itemsToInsert);

  // Dynamic schema resilience loop for purchase_items
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
      const retry = await supabase.from("purchase_items").insert(itemsToInsert);
      itemsErr = retry.error;
    } else {
      break;
    }
  }

  // Handle NOT NULL constraint fallback if column was named unit_cost or unit_price or subtotal
  if (itemsErr && itemsErr.message.includes("null value in column")) {
    if (itemsErr.message.includes("unit_cost")) {
      itemsToInsert = itemsToInsert.map((item) => ({
        ...item,
        unit_cost: item.unit_price ?? 0,
      }));
    } else if (itemsErr.message.includes("unit_price")) {
      itemsToInsert = itemsToInsert.map((item) => ({
        ...item,
        unit_price: item.unit_cost ?? 0,
      }));
    } else if (itemsErr.message.includes("subtotal")) {
      itemsToInsert = itemsToInsert.map((item) => ({
        ...item,
        subtotal:
          (Number(item.quantity) || 1) *
          (Number(item.unit_cost ?? item.unit_price) || 0),
      }));
    }
    const retry = await supabase.from("purchase_items").insert(itemsToInsert);
    itemsErr = retry.error;
  }

  if (itemsErr) {
    throw new Error(`Failed to save purchase items: ${itemsErr.message}`);
  }

  // 3. Payment record
  if (Number(input.paidAmount) > 0) {
    const pMethod = toDbPaymentMethod(input.paymentMethod);

    const paymentPayload: Record<string, unknown> = {
      payment_type: "paid",
      sale_id: null,
      purchase_id: po.id,
      supplier_id: suppId,
      amount: Number(input.paidAmount),
      payment_date: new Date().toISOString(),
      payment_method: pMethod,
      reference_number: input.paymentReference?.trim() || `PAY-${purchaseNumber}`,
      notes: `Supplier payout for PO #${purchaseNumber}`,
    };
    if (userId) {
      paymentPayload.created_by = userId;
    }
    let payRes = await supabase.from("payments").insert(paymentPayload);
    while (
      payRes.error &&
      payRes.error.message.includes("Could not find the '")
    ) {
      const match = payRes.error.message.match(
        /Could not find the '([^']+)' column/,
      );
      if (match && match[1] && match[1] in paymentPayload) {
        delete paymentPayload[match[1]];
        payRes = await supabase.from("payments").insert(paymentPayload);
      } else {
        break;
      }
    }
    if (payRes.error) throw new Error(`Could not record purchase payment: ${payRes.error.message}`);
  }

  // 4. If goods were marked received at creation, invoke atomic RPC
  if (isReceived) {
    if (po.status !== "received") {
      try {
        await receivePurchaseGoods(po.id, userId);
      } catch (rcvErr: unknown) {
        console.warn("Could not execute receivePurchaseGoods RPC:", rcvErr);
        // Resilient fallback: set status directly so order is marked received
        await supabase
          .from("purchases")
          .update({ status: "received" })
          .eq("id", po.id);
      }
    }
  }

  return {
    id: po.id,
    purchaseNumber: po.purchase_number,
    supplierId: po.supplier_id,
    supplierName: input.supplierName || "Supplier",
    date: new Date().toISOString().split("T")[0],
    items: input.items.map((i) => ({
      id: i.productId,
      productId: i.productId,
      productName: i.productName || "Hardware Item",
      sku: i.sku || "",
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      subtotal: i.subtotal || i.quantity * i.unitPrice,
    })),
    subtotal: input.items.reduce(
      (sum, item) => sum + (Number(item.subtotal) || Number(item.quantity) * Number(item.unitPrice)),
      0,
    ),
    discountAmount: Number(input.discountAmount) || 0,
    vatRate: Number(input.vatRate) || 0,
    vatAmount: Number(input.vatAmount) || 0,
    grandTotal: Number(input.totalAmount) || Number(po.total_amount) || 0,
    paidAmount: Number(input.paidAmount) || 0,
    dueAmount: calcDue,
    paymentStatus: finalPaymentStatus,
    paymentMethod: (input.paymentMethod as PaymentMethod) || "Bank Transfer",
    time: formatTime(),
    status: isReceived ? "received" : (initialStatus as PurchaseStatus),
    notes: userNotes,
  };
};

export const updatePurchase = async (
  id: string,
  input: Omit<Partial<CreatePurchaseInput>, "paidAmount"> & {
    purchaseNumber?: string;
    date?: string;
    paymentMethod?: string;
    newPaymentAmount?: number;
    paymentReference?: string;
  },
): Promise<void> => {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.totalAmount !== undefined)
    payload.total_amount = Number(input.totalAmount);
  if (input.discountAmount !== undefined)
    payload.discount_amount = Number(input.discountAmount);
  if (input.vatRate !== undefined)
    payload.vat_rate = Number(input.vatRate);
  if (input.vatAmount !== undefined)
    payload.vat_amount = Number(input.vatAmount);
  if (input.supplierId !== undefined && input.supplierId.trim()) {
    payload.supplier_id = input.supplierId.trim();
  }
  if (input.purchaseNumber !== undefined) {
    payload.purchase_number = input.purchaseNumber.trim();
  }
  if (input.date !== undefined) {
    payload.purchase_date = input.date;
  }
  if (input.paymentMethod !== undefined) {
    payload.payment_method = input.paymentMethod;
  }

  if (input.status) {
    payload.status =
      input.status.toLowerCase() === "pending"
        ? "ordered"
        : input.status.toLowerCase();
  }

  // If supplierId was not provided or empty but supplierName was, resolve or create supplier
  if (
    (!payload.supplier_id || !payload.supplier_id.toString().trim()) &&
    input.supplierName?.trim()
  ) {
    const sName = input.supplierName.trim();
    const { data: sData } = await supabase
      .from("suppliers")
      .select("id")
      .ilike("name", sName)
      .maybeSingle();

    if (sData?.id) {
      payload.supplier_id = sData.id;
    } else {
      const { data: newSupp } = await supabase
        .from("suppliers")
        .insert({ name: sName })
        .select("id")
        .maybeSingle();
      if (newSupp?.id) {
        payload.supplier_id = newSupp.id;
      }
    }
  }

  const { data: existingPayments, error: paymentsErr } = await supabase
    .from("payments")
    .select("amount")
    .eq("purchase_id", id)
    .eq("payment_type", "paid")
    .is("sale_id", null);
  if (paymentsErr) throw new Error(`Could not load purchase payments: ${paymentsErr.message}`);
  const previouslyPaid = (existingPayments || []).reduce(
    (sum, payment) => sum + (Number(payment.amount) || 0),
    0,
  );
  const existingPurchase = input.totalAmount === undefined
    ? await supabase.from("purchases").select("total_amount").eq("id", id).single()
    : null;
  if (existingPurchase?.error) throw new Error(existingPurchase.error.message);
  const finalTotal = input.totalAmount !== undefined
    ? Number(input.totalAmount)
    : Number(existingPurchase?.data?.total_amount) || 0;
  const newPayment = input.newPaymentAmount === undefined ? 0 : Number(input.newPaymentAmount);
  const remainingBeforePayment = Math.max(0, finalTotal - previouslyPaid);
  if (!Number.isFinite(newPayment) || newPayment < 0 || newPayment > remainingBeforePayment) {
    throw new Error(`New payment must be between 0 and the remaining due (${remainingBeforePayment}).`);
  }
  const priorDue = Math.max(0, finalTotal - previouslyPaid);
  const notesBeforePayment = (input.notes || "").replace(/<!--META:.*?-->/g, "").trim();
  payload.notes = `${notesBeforePayment}${notesBeforePayment ? " " : ""}<!--META:${JSON.stringify({
    discount: Number(input.discountAmount) || 0,
    vatRate: Number(input.vatRate) || 0,
    vatAmount: Number(input.vatAmount) || 0,
    paidAmount: previouslyPaid,
    dueAmount: priorDue,
  })}-->`;

  let { error } = await supabase
    .from("purchases")
    .update(payload)
    .eq("id", id);

  while (error && error.message.includes("Could not find the '")) {
    const match = error.message.match(/Could not find the '([^']+)' column/);
    if (match && match[1] && match[1] in payload) {
      delete payload[match[1]];
      const retry = await supabase
        .from("purchases")
        .update(payload)
        .eq("id", id);
      error = retry.error;
    } else {
      break;
    }
  }

  if (error) throw new Error(error.message);

  // If line items were provided, synchronize purchase_items
  if (input.items && input.items.length > 0) {
    const validItems = input.items.filter(
      (item) => item.productId && item.productId.trim(),
    );
    if (validItems.length > 0) {
      await supabase.from("purchase_items").delete().eq("purchase_id", id);

      let itemsToInsert: Record<string, unknown>[] = validItems.map((item) => {
        const qty = Number(item.quantity) || 1;
        const price = Number(item.unitPrice) || 0;
        return {
          purchase_id: id,
          product_id: item.productId,
          quantity: qty,
          unit_cost: price,
          unit_price: price,
        };
      });

      let { error: itemsErr } = await supabase
        .from("purchase_items")
        .insert(itemsToInsert);

      while (
        itemsErr &&
        (itemsErr.message.includes("Could not find the '") ||
          itemsErr.message.includes("cannot insert a non-DEFAULT value into column"))
      ) {
        let colToStrip: string | null = null;
        const missingMatch = itemsErr.message.match(
          /Could not find the '([^']+)' column/,
        );
        const genMatch = itemsErr.message.match(
          /cannot insert a non-DEFAULT value into column "([^"]+)"/,
        );
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
          const retry = await supabase
            .from("purchase_items")
            .insert(itemsToInsert);
          itemsErr = retry.error;
        } else {
          break;
        }
      }

      if (itemsErr && itemsErr.message.includes("null value in column")) {
        if (itemsErr.message.includes("unit_cost")) {
          itemsToInsert = itemsToInsert.map((item) => ({
            ...item,
            unit_cost: item.unit_price ?? 0,
          }));
        } else if (itemsErr.message.includes("unit_price")) {
          itemsToInsert = itemsToInsert.map((item) => ({
            ...item,
            unit_price: item.unit_cost ?? 0,
          }));
        }
        const retry = await supabase
          .from("purchase_items")
          .insert(itemsToInsert);
        itemsErr = retry.error;
      }

      if (itemsErr) {
        console.warn("Could not save purchase items on update:", itemsErr.message);
      }
    }
  }

  // Purchase edits add an installment; prior payment rows are immutable history.
  if (newPayment > 0) {
    const paymentRef = input.paymentReference?.trim();
    let alreadyRecorded = false;
    if (paymentRef) {
      const { data: existingRef, error: refCheckErr } = await supabase
        .from("payments")
        .select("id")
        .eq("purchase_id", id)
        .eq("payment_type", "paid")
        .is("sale_id", null)
        .eq("reference_number", paymentRef)
        .limit(1)
        .maybeSingle();
      if (refCheckErr && !refCheckErr.message.includes("Could not find the '")) {
        throw new Error(`Could not verify existing payment reference: ${refCheckErr.message}`);
      }
      alreadyRecorded = Boolean(existingRef?.id);
    }

    if (!alreadyRecorded) {
      const pMethod = toDbPaymentMethod(input.paymentMethod);
      const paymentPayload: Record<string, unknown> = {
        payment_type: "paid",
        sale_id: null,
        purchase_id: id,
        supplier_id: payload.supplier_id || input.supplierId,
        amount: newPayment,
        payment_date: new Date().toISOString(),
        payment_method: pMethod,
        notes: `Supplier payout for updated PO #${input.purchaseNumber || id}`,
      };
      if (paymentRef) {
        paymentPayload.reference_number = paymentRef;
      }

      let payErr = (await supabase.from("payments").insert(paymentPayload)).error;
      while (payErr && payErr.message.includes("Could not find the '")) {
        const match = payErr.message.match(/Could not find the '([^']+)' column/);
        if (!match?.[1] || !(match[1] in paymentPayload)) break;
        delete paymentPayload[match[1]];
        payErr = (await supabase.from("payments").insert(paymentPayload)).error;
      }
      if (payErr) throw new Error(`Could not record purchase payment: ${payErr.message}`);
    }
  }

  const { data: updatedPayments, error: updatedPaymentsErr } = await supabase
    .from("payments")
    .select("amount")
    .eq("purchase_id", id)
    .eq("payment_type", "paid")
    .is("sale_id", null);
  if (updatedPaymentsErr) {
    throw new Error(`Could not recalculate purchase payments: ${updatedPaymentsErr.message}`);
  }
  const totalPaid = (updatedPayments || []).reduce(
    (sum, payment) => sum + (Number(payment.amount) || 0),
    0,
  );
  const dueAmount = Math.max(0, finalTotal - totalPaid);
  const paymentStatus: PaymentStatus =
    totalPaid <= 0
      ? "unpaid"
      : totalPaid >= finalTotal
        ? "paid"
        : "partial";
  const summaryPayload: Record<string, unknown> = {
    paid_amount: totalPaid,
    due_amount: dueAmount,
    payment_status: paymentStatus,
    notes: `${notesBeforePayment}${notesBeforePayment ? " " : ""}<!--META:${JSON.stringify({
      discount: Number(input.discountAmount) || 0,
      vatRate: Number(input.vatRate) || 0,
      vatAmount: Number(input.vatAmount) || 0,
      paidAmount: totalPaid,
      dueAmount,
    })}-->`,
  };
  let summaryErr = (await supabase.from("purchases").update(summaryPayload).eq("id", id)).error;
  while (summaryErr && summaryErr.message.includes("Could not find the '")) {
    const match = summaryErr.message.match(/Could not find the '([^']+)' column/);
    if (!match?.[1] || !(match[1] in summaryPayload)) break;
    delete summaryPayload[match[1]];
    summaryErr = (await supabase.from("purchases").update(summaryPayload).eq("id", id)).error;
  }
  if (summaryErr) throw new Error(`Could not update purchase payment summary: ${summaryErr.message}`);
};

export const deletePurchase = async (id: string): Promise<void> => {
  // 1. Fetch purchase to see if goods were received
  const { data: po } = await supabase
    .from("purchases")
    .select("id, status, purchase_number")
    .eq("id", id)
    .maybeSingle();

  if (!po) return;

  // 2. If status was received, reverse stock additions safely
  if (po.status?.toLowerCase() === "received") {
    const { data: items } = await supabase
      .from("purchase_items")
      .select("product_id, quantity")
      .eq("purchase_id", id);

    if (items && items.length > 0) {
      for (const item of items) {
        const { data: prod } = await supabase
          .from("products")
          .select("quantity")
          .eq("id", item.product_id)
          .maybeSingle();

        if (prod) {
          const currentQty = Number(prod.quantity) || 0;
          const newQty = Math.max(0, currentQty - Number(item.quantity));
          await supabase
            .from("products")
            .update({ quantity: newQty, updated_at: new Date().toISOString() })
            .eq("id", item.product_id);

          await supabase.from("stock_movements").insert({
            product_id: item.product_id,
            type: "adjustment",
            quantity: -Number(item.quantity),
            previous_stock: currentQty,
            current_stock: newQty,
            reference_id: id,
            notes: `Stock reversal for deleted purchase #${po.purchase_number}`,
          });
        }
      }
    }
  }

  // 3. Delete payments linked to this purchase
  await supabase.from("payments").delete().eq("purchase_id", id);

  // 4. Delete purchase items
  await supabase.from("purchase_items").delete().eq("purchase_id", id);

  // 5. Delete purchase row
  const { error } = await supabase.from("purchases").delete().eq("id", id);
  if (error) throw new Error(error.message);
};
