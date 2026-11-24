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
import type { ExpenseRow, PaymentRow, DbPaymentMethod } from "@/types/database.types";

interface CustomerPaymentRowWithRelations extends PaymentRow {
  customers: { id: string; name: string; phone: string | null } | null;
  sales: {
    invoice_number: string;
    total_amount: number;
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

  const expensePayload: Record<string, unknown> = {
    title: data.title.trim(),
    category: data.category.trim(),
    amount: Number(data.amount),
    expense_date: data.date || new Date().toISOString().split("T")[0],
    payment_method: data.paymentMethod || "Bank Transfer",
    reference_number: refNo,
    notes: data.description || data.recipient || null,
  };
  if (userId) {
    expensePayload.created_by = userId;
  }

  let { data: exp, error } = await supabase
    .from("expenses")
    .insert(expensePayload)
    .select()
    .single();

  while (error && error.message.includes("Could not find the '")) {
    const match = error.message.match(/Could not find the '([^']+)' column/);
    if (match && match[1] && match[1] in expensePayload) {
      delete expensePayload[match[1]];
      const retry = await supabase
        .from("expenses")
        .insert(expensePayload)
        .select()
        .single();
      exp = retry.data;
      error = retry.error;
    } else {
      break;
    }
  }

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

export const updateExpense = async (
  id: string,
  data: Partial<{
    title: string;
    category: string;
    amount: number;
    date?: string;
    paymentMethod?: string;
    description?: string;
    recipient?: string;
    referenceNumber?: string;
  }>,
): Promise<Expense> => {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (data.title !== undefined) payload.title = data.title.trim();
  if (data.category !== undefined) payload.category = data.category.trim();
  if (data.amount !== undefined) payload.amount = Number(data.amount);
  if (data.date !== undefined) payload.expense_date = data.date;
  if (data.paymentMethod !== undefined) payload.payment_method = data.paymentMethod;
  if (data.referenceNumber !== undefined) payload.reference_number = data.referenceNumber;
  if (data.description !== undefined || data.recipient !== undefined) {
    payload.notes = data.description || data.recipient || null;
  }

  let { data: exp, error } = await supabase
    .from("expenses")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  while (error && error.message.includes("Could not find the '")) {
    const match = error.message.match(/Could not find the '([^']+)' column/);
    if (match && match[1] && match[1] in payload) {
      delete payload[match[1]];
      const retry = await supabase
        .from("expenses")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      exp = retry.data;
      error = retry.error;
    } else {
      break;
    }
  }

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
    referenceNumber: row.reference_number || `EXP-${row.id.slice(0, 6)}`,
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
      "*, customers:customer_id (id, name, phone), sales:sale_id (invoice_number, total_amount, sale_date)",
    )
    .in("payment_type", ["received", "sale"])
    .order("payment_date", { ascending: false });

  if (error) throw new Error(error.message);

  const rows = (data || []) as unknown as CustomerPaymentRowWithRelations[];

  const receivedBySale = new Map<string, number>();
  for (const payment of rows) {
    if (payment.sale_id && payment.payment_type === "received" && payment.purchase_id === null) {
      receivedBySale.set(
        payment.sale_id,
        (receivedBySale.get(payment.sale_id) || 0) + Number(payment.amount || 0),
      );
    }
  }

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
      dueAmount: p.sales
        ? Math.max(0, Number(p.sales.total_amount) - (receivedBySale.get(p.sale_id || "") || 0))
        : 0,
      paymentStatus: !p.sales
        ? "paid"
        : (receivedBySale.get(p.sale_id || "") || 0) >= Number(p.sales.total_amount)
          ? "paid"
          : (receivedBySale.get(p.sale_id || "") || 0) > 0
            ? "partial"
            : "unpaid",
    };
  });
};

export const createIncome = async (
  incomeData: {
    source: string;
    amount: number;
    date: string;
    paymentMethod: string;
    payerName?: string;
    description?: string;
    referenceNumber?: string;
  },
  userId?: string,
): Promise<void> => {
  let method: DbPaymentMethod = "cash";
  const low = (incomeData.paymentMethod || "").toLowerCase();
  if (low.includes("card")) method = "card";
  else if (low.includes("bank")) method = "bank_transfer";
  else if (low.includes("mfs") || low.includes("mobile"))
    method = "mobile_money";

  const incomePayload: Record<string, unknown> = {
    payment_number:
      incomeData.referenceNumber ||
      `PAY-INC-${Date.now().toString().slice(-6)}`,
    payment_type: "sale",
    amount: Number(incomeData.amount),
    payment_date: incomeData.date || new Date().toISOString(),
    payment_method: method,
    notes: incomeData.description || incomeData.payerName || "Direct Income",
  };
  if (userId) {
    incomePayload.created_by = userId;
  }

  let { error } = await supabase.from("payments").insert(incomePayload);
  while (error && error.message.includes("Could not find the '")) {
    const match = error.message.match(/Could not find the '([^']+)' column/);
    if (match && match[1] && match[1] in incomePayload) {
      delete incomePayload[match[1]];
      const retry = await supabase.from("payments").insert(incomePayload);
      error = retry.error;
    } else {
      break;
    }
  }

  if (error) throw new Error(error.message);
};

export const fetchSupplierPayments = async (): Promise<
  SupplierPaymentRecord[]
> => {
  const { data, error } = await supabase
    .from("payments")
    .select(
      "*, suppliers:supplier_id (id, name), purchases:purchase_id (purchase_number, total_amount, paid_amount, due_amount, payment_status, purchase_date)",
    )
    .in("payment_type", ["paid", "purchase"])
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
