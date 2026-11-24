import { supabase } from "@/lib/supabase";
import type {
  Expense,
  CustomerPaymentRecord,
  SupplierPaymentRecord,
  PaymentMethod,
  ExpenseCategory,
  CustomerType,
  PaymentStatus,
} from "@/types";
import type { ExpenseRow, PaymentRow } from "@/types/database.types";

interface CustomerPaymentRowWithRelations extends PaymentRow {
  customers: { id: string; name: string; phone: string | null } | null;
  sales: {
    invoice_number: string;
    total_amount: number;
    paid_amount: number;
    due_amount: number;
    payment_status: string;
    sale_date: string;
  } | null;
}

interface SupplierPaymentRowWithRelations extends PaymentRow {
  suppliers: { id: string; name: string } | null;
  purchases: {
    purchase_number: string;
    total_amount: number;
    paid_amount: number;
    due_amount: number;
    payment_status: string;
    purchase_date: string;
  } | null;
}

export const fetchExpenses = async (): Promise<Expense[]> => {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("expense_date", { ascending: false });

  if (error) throw new Error(error.message);

  const rows = (data || []) as unknown as ExpenseRow[];

  return rows.map((e) => {
    let method: PaymentMethod = "Bank Transfer";
    if (e.payment_method === "Cash") method = "Cash";
    else if (e.payment_method === "Card") method = "Card";
    else if (e.payment_method === "MFS") method = "MFS";

    return {
      id: e.id,
      title: e.title,
      category: (e.category as ExpenseCategory) || "General",
      amount: Number(e.amount) || 0,
      date: e.expense_date,
      paymentMethod: method,
      description: e.notes || "",
      recipient: e.notes || "Store Ops",
      referenceNumber: e.reference_number || `EXP-${e.id.slice(0, 6)}`,
    };
  });
};

export const createExpense = async (
  data: {
    title: string;
    category: string;
    amount: number;
    date?: string;
    paymentMethod?: string;
    description?: string;
    recipient?: string;
    referenceNumber?: string;
  },
  userId?: string,
): Promise<Expense> => {
  const refNo =
    data.referenceNumber || `EXP-${Date.now().toString().slice(-6)}`;

  const { data: exp, error } = await supabase
    .from("expenses")
    .insert({
      title: data.title.trim(),
      category: data.category.trim(),
      amount: Number(data.amount),
      expense_date: data.date || new Date().toISOString().split("T")[0],
      payment_method: data.paymentMethod || "Bank Transfer",
      reference_number: refNo,
      notes: data.description || data.recipient || null,
      created_by: userId || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  const row = exp as unknown as ExpenseRow;

  let method: PaymentMethod = "Bank Transfer";
  if (row.payment_method === "Cash") method = "Cash";
  else if (row.payment_method === "Card") method = "Card";
  else if (row.payment_method === "MFS") method = "MFS";

  return {
    id: row.id,
    title: row.title,
    category: (row.category as ExpenseCategory) || "General",
    amount: Number(row.amount),
    date: row.expense_date,
    paymentMethod: method,
    description: row.notes || "",
    recipient: data.recipient || row.notes || "Store Ops",
    referenceNumber: row.reference_number || refNo,
  };
};

export const deleteExpense = async (id: string): Promise<void> => {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

export const fetchCustomerPayments = async (): Promise<
  CustomerPaymentRecord[]
> => {
  const { data, error } = await supabase
    .from("payments")
    .select(
      "*, customers:customer_id (id, name, phone), sales:sale_id (invoice_number, total_amount, paid_amount, due_amount, payment_status, sale_date)",
    )
    .eq("payment_type", "sale")
    .order("payment_date", { ascending: false });

  if (error) throw new Error(error.message);

  const rows = (data || []) as unknown as CustomerPaymentRowWithRelations[];

  return rows.map((p) => {
    let method: PaymentMethod = "Cash";
    if (p.payment_method === "mobile_money") method = "MFS";
    else if (p.payment_method === "card") method = "Card";
    else if (p.payment_method === "bank_transfer") method = "Bank Transfer";

    const d = new Date(p.payment_date || p.created_at);
    const date = d.toISOString().split("T")[0];

    return {
      id: p.id,
      invoiceNumber: p.sales?.invoice_number || `INV-${p.id.slice(0, 6)}`,
      customerName: p.customers?.name || "Customer",
      customerType: "Retail" as CustomerType,
      customerPhone: p.customers?.phone || undefined,
      date,
      paymentMethod: method,
      totalAmount: Number(p.sales?.total_amount) || Number(p.amount) || 0,
      paidAmount: Number(p.amount) || 0,
      dueAmount: Number(p.sales?.due_amount) || 0,
      paymentStatus:
        (p.sales?.payment_status?.toLowerCase() as PaymentStatus) || "paid",
    };
  });
};

export const fetchSupplierPayments = async (): Promise<
  SupplierPaymentRecord[]
> => {
  const { data, error } = await supabase
    .from("payments")
    .select(
      "*, suppliers:supplier_id (id, name), purchases:purchase_id (purchase_number, total_amount, paid_amount, due_amount, payment_status, purchase_date)",
    )
    .eq("payment_type", "purchase")
    .order("payment_date", { ascending: false });

  if (error) throw new Error(error.message);

  const rows = (data || []) as unknown as SupplierPaymentRowWithRelations[];

  return rows.map((p) => {
    const d = new Date(p.payment_date || p.created_at);
    const date = d.toISOString().split("T")[0];

    return {
      id: p.id,
      purchaseNumber:
        p.purchases?.purchase_number || `PO-${p.id.slice(0, 6)}`,
      supplierName: p.suppliers?.name || "Supplier",
      date,
      paymentMethod: "Bank Transfer" as PaymentMethod,
      totalAmount: Number(p.purchases?.total_amount) || Number(p.amount) || 0,
      paidAmount: Number(p.amount) || 0,
      dueAmount: Number(p.purchases?.due_amount) || 0,
      paymentStatus:
        (p.purchases?.payment_status?.toLowerCase() as PaymentStatus) || "paid",
    };
  });
};
