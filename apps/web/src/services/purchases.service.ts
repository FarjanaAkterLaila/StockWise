import { supabase } from "@/lib/supabase";
import type { Purchase, PaymentStatus, PurchaseStatus, PaymentMethod } from "@/types";
import type { PurchaseRow, PurchaseItemRow } from "@/types/database.types";

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
  paymentMethod?: string;
  status?: string;
  notes?: string;
}

export const fetchPurchases = async (): Promise<Purchase[]> => {
  const { data, error } = await supabase
    .from("purchases")
    .select(`
      *,
      suppliers:supplier_id (id, name, contact_person, phone),
      purchase_items (
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

  const rows = (data || []) as unknown as PurchaseRowWithRelations[];

  return rows.map((p) => {
    const items = (p.purchase_items || []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.products?.name || "Hardware Component",
      sku: item.products?.sku || "",
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unit_price) || 0,
      subtotal: Number(item.subtotal) || 0,
    }));

    const dateObj = new Date(p.purchase_date || p.created_at);
    const date = dateObj.toISOString().split("T")[0];

    return {
      id: p.id,
      purchaseNumber: p.purchase_number,
      supplierId: p.supplier_id,
      supplierName: p.suppliers?.name || "Authorized Distributor",
      date,
      items,
      subtotal: Number(p.total_amount) || 0,
      discountAmount: 0,
      vatRate: 0,
      vatAmount: 0,
      grandTotal: Number(p.total_amount) || 0,
      paidAmount: Number(p.paid_amount) || 0,
      dueAmount: Number(p.due_amount) || 0,
      paymentStatus: (p.payment_status?.toLowerCase() as PaymentStatus) || "paid",
      paymentMethod: "Bank Transfer" as PaymentMethod,
      status: (p.status?.toLowerCase() as PurchaseStatus) || "received",
      notes: p.notes || "",
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
  let suppId = input.supplierId;
  if (!suppId && input.supplierName) {
    const { data: sData } = await supabase
      .from("suppliers")
      .select("id")
      .ilike("name", input.supplierName.trim())
      .maybeSingle();
    suppId = sData?.id;
  }
  if (!suppId) {
    const { data: defaultSupp } = await supabase
      .from("suppliers")
      .select("id")
      .limit(1)
      .single();
    suppId = defaultSupp?.id;
  }

  const purchaseNumber = `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(
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
  const requestedStatus = (input.status || "pending").toLowerCase();
  const isReceived = requestedStatus === "received";
  const initialStatus = isReceived ? "pending" : requestedStatus;

  // 1. Insert Purchase (Stock is NOT increased on order creation)
  const { data: po, error: poErr } = await supabase
    .from("purchases")
    .insert({
      purchase_number: purchaseNumber,
      supplier_id: suppId,
      purchase_date: new Date().toISOString(),
      total_amount: Number(input.totalAmount) || 0,
      paid_amount: Number(input.paidAmount) || 0,
      due_amount: calcDue,
      payment_status: finalPaymentStatus,
      status: initialStatus,
      notes: input.notes || null,
      created_by: userId || null,
    })
    .select()
    .single();

  if (poErr) throw new Error(poErr.message);

  // 2. Insert items
  const itemsToInsert = input.items.map((item) => ({
    purchase_id: po.id,
    product_id: item.productId,
    quantity: Number(item.quantity) || 1,
    unit_price: Number(item.unitPrice) || 0,
    subtotal:
      Number(item.subtotal) ||
      Number(item.quantity) * Number(item.unitPrice),
  }));

  const { error: itemsErr } = await supabase
    .from("purchase_items")
    .insert(itemsToInsert);
  if (itemsErr) throw new Error(itemsErr.message);

  // 3. Payment record
  if (Number(input.paidAmount) > 0) {
    await supabase.from("payments").insert({
      payment_number: `PAY-SUP-${Date.now().toString().slice(-6)}`,
      payment_type: "purchase",
      purchase_id: po.id,
      supplier_id: suppId,
      amount: Number(input.paidAmount),
      payment_date: new Date().toISOString(),
      payment_method: "bank_transfer",
      notes: `Supplier payout for PO #${purchaseNumber}`,
      created_by: userId || null,
    });
  }

  // 4. If goods were marked received at creation, invoke atomic RPC
  if (isReceived) {
    await receivePurchaseGoods(po.id, userId);
  }

  return {
    id: po.id,
    purchaseNumber: po.purchase_number,
    supplierId: po.supplier_id,
    supplierName: input.supplierName || "Authorized Distributor",
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
    subtotal: Number(po.total_amount),
    discountAmount: 0,
    vatRate: 0,
    vatAmount: 0,
    grandTotal: Number(po.total_amount),
    paidAmount: Number(po.paid_amount),
    dueAmount: Number(po.due_amount),
    paymentStatus: po.payment_status as PaymentStatus,
    paymentMethod: "Bank Transfer",
    status: isReceived ? "received" : (initialStatus as PurchaseStatus),
    notes: po.notes || "",
  };
};
