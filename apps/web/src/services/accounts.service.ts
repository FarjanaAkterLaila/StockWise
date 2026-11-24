import { supabase } from "@/lib/supabase";
import type {
  Expense,
  CustomerPaymentRecord,
  SupplierPaymentRecord,
  AccountsPaymentMethod,
  ExpenseCategory,
  CustomerType,
} from "@/types";
import { EXPENSE_CATEGORIES } from "@/utils/constants";
import type { ExpenseRow, PaymentRow } from "@/types/database.types";

const isDateOnly = (value: string): boolean => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return date.getUTCFullYear() === Number(year)
    && date.getUTCMonth() === Number(month) - 1
    && date.getUTCDate() === Number(day);
};

const mapPaymentMethod = (method: unknown): AccountsPaymentMethod => {
  if (typeof method !== "string") return "Other";
  switch (method.trim().toLowerCase().replace(/[\s-]+/g, "_")) {
    case "cash": return "Cash";
    case "card": return "Card";
    case "bank_transfer":
    case "bank": return "Bank Transfer";
    case "mfs":
    case "mobile_money":
    case "mobile": return "MFS";
    case "cheque": return "Cheque";
    case "other": return "Other";
    default: return method.trim();
  }
};

const toDbPaymentMethod = (method: AccountsPaymentMethod): string => {
  switch (method) {
    case "Cash": return "cash";
    case "Card": return "card";
    case "Bank Transfer": return "bank_transfer";
    case "MFS": return "mobile_money";
    case "Cheque": return "cheque";
    case "Other": return "other";
    default: return method.trim();
  }
};

const validateExpenseInput = (data: {
  title?: string;
  category?: string;
  amount?: number;
  date?: string;
  paymentMethod?: string;
}): void => {
  if (!data.title?.trim() || data.title.trim().length < 3) throw new Error("Enter an expense title with at least 3 characters.");
  if (!data.category || !EXPENSE_CATEGORIES.includes(data.category as typeof EXPENSE_CATEGORIES[number]) || data.category === "All") {
    throw new Error("Select a valid expense category.");
  }
  if (!Number.isFinite(Number(data.amount)) || Number(data.amount) <= 0) throw new Error("Expense amount must be greater than zero.");
  if (!data.date || !isDateOnly(data.date)) throw new Error("Enter a valid expense date.");
  if (!data.paymentMethod?.trim()) throw new Error("Select a payment method.");
};

interface CustomerPaymentRowWithRelations extends PaymentRow {
  sales: {
    invoice_number: string;
    total_amount: number;
    sale_date: string;
    customer_id: string | null;
    customers: { name: string; phone: string | null } | null;
  } | null;
}

interface SupplierPaymentRowWithRelations extends PaymentRow {
  purchases: {
    id?: string;
    purchase_number: string;
    total_amount: number;
    purchase_date: string;
    status?: string | null;
    supplier_id: string | null;
    suppliers: { name: string } | null;
  } | null;
}

export const fetchExpenses = async (): Promise<Expense[]> => {
  const { data, error } = await supabase
    .from("expenses")
    .select("id, title, category, amount, expense_date, payment_method")
    .order("expense_date", { ascending: false });

  if (error) throw new Error(error.message);

  return ((data || []) as unknown as ExpenseRow[]).map(mapExpenseRow);
};

const mapExpenseRow = (row: ExpenseRow): Expense => {
  return {
    id: row.id,
    title: row.title,
    category: (row.category as ExpenseCategory) || "General",
    amount: Number(row.amount) || 0,
    date: row.expense_date,
    paymentMethod: mapPaymentMethod(row.payment_method),
  };
};

export const createExpense = async (
  data: {
    title: string;
    category: string;
    amount: number;
    date?: string;
    paymentMethod?: string;
  },
  userId?: string,
): Promise<Expense> => {
  validateExpenseInput(data);

  const expensePayload: Record<string, unknown> = {
    title: data.title.trim(),
    category: data.category.trim(),
    amount: Number(data.amount),
    expense_date: data.date,
    payment_method: toDbPaymentMethod(data.paymentMethod as AccountsPaymentMethod),
  };
  if (userId) {
    expensePayload.created_by = userId;
  }

  const { data: exp, error } = await supabase
    .from("expenses")
    .insert(expensePayload)
    .select("id, title, category, amount, expense_date, payment_method")
    .single();

  if (error) throw new Error(error.message);
  if (!exp) throw new Error("Expense was saved but Supabase returned no row.");
  return mapExpenseRow(exp as unknown as ExpenseRow);
};

export const updateExpense = async (
  id: string,
  data: Expense,
): Promise<Expense> => {
  validateExpenseInput(data);
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    title: data.title.trim(),
    category: data.category,
    amount: Number(data.amount),
    expense_date: data.date,
    payment_method: toDbPaymentMethod(data.paymentMethod),
  };

  const { data: exp, error } = await supabase
    .from("expenses")
    .update(payload)
    .eq("id", id)
    .select("id, title, category, amount, expense_date, payment_method")
    .single();

  if (error) throw new Error(error.message);
  if (!exp) throw new Error("Expense update returned no row.");
  return mapExpenseRow(exp as unknown as ExpenseRow);
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
      "id, sale_id, purchase_id, payment_type, amount, payment_date, payment_method, reference_number, notes, created_at, sales:sale_id (invoice_number, total_amount, sale_date, customer_id, customers:customer_id (name, phone))",
    )
    .eq("payment_type", "received")
    .is("purchase_id", null)
    .not("sale_id", "is", null)
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

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
    const sale = p.sales;
    const paidForSale = receivedBySale.get(p.sale_id || "") || 0;
    const totalAmount = Number(sale?.total_amount) || 0;

    return {
      id: p.id,
      invoiceNumber: sale?.invoice_number || `INV-${p.id.slice(0, 6)}`,
      customerName: sale?.customers?.name || "Walk-in Customer",
      customerType: "Retail" as CustomerType,
      customerPhone: sale?.customers?.phone || undefined,
      date: typeof p.payment_date === "string" ? p.payment_date.slice(0, 10) : "",
      paymentMethod: mapPaymentMethod(p.payment_method),
      referenceNumber: p.reference_number || undefined,
      notes: p.notes || undefined,
      totalAmount,
      paidAmount: Number(p.amount) || 0,
      dueAmount: Math.max(0, totalAmount - paidForSale),
      paymentStatus: paidForSale >= totalAmount
        ? "paid"
        : paidForSale > 0
          ? "partial"
          : "unpaid",
    };
  });
};

export const fetchSupplierPayments = async (): Promise<
  SupplierPaymentRecord[]
> => {
  const { data, error } = await supabase
    .from("payments")
    .select(
      "id, sale_id, purchase_id, payment_type, amount, payment_date, payment_method, reference_number, notes, created_at, purchases:purchase_id (id, purchase_number, total_amount, purchase_date, status, supplier_id, suppliers:supplier_id (name))",
    )
    .eq("payment_type", "paid")
    .is("sale_id", null)
    .not("purchase_id", "is", null)
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) throw new Error(error.message);

  const rawRows = (data || []) as unknown as SupplierPaymentRowWithRelations[];

  // Filter out payments attached to deleted purchases or cancelled orders
  const validRows = rawRows.filter(
    (row) => row.purchases && row.purchases.status?.toLowerCase() !== "cancelled",
  );

  // Deduplicate payment records by ID so each transaction appears exactly once
  const seenIds = new Set<string>();
  const rows: SupplierPaymentRowWithRelations[] = [];
  for (const row of validRows) {
    if (!seenIds.has(row.id)) {
      seenIds.add(row.id);
      rows.push(row);
    }
  }

  // Calculate total paid across all actual payments for each purchase order
  const paidByPurchase = new Map<string, number>();
  for (const row of rows) {
    if (row.purchase_id) {
      paidByPurchase.set(
        row.purchase_id,
        (paidByPurchase.get(row.purchase_id) || 0) + Number(row.amount || 0),
      );
    }
  }

  return rows.map((p) => {
    const totalAmount = Number(p.purchases?.total_amount) || 0;
    const paidForPurchase = paidByPurchase.get(p.purchase_id || "") || 0;

    return {
      id: p.id,
      purchaseId: p.purchase_id || undefined,
      purchaseNumber:
        p.purchases?.purchase_number || `PO-${p.id.slice(0, 6)}`,
      supplierName: p.purchases?.suppliers?.name || "Supplier",
      date: typeof p.payment_date === "string" ? p.payment_date.slice(0, 10) : "",
      paymentMethod: mapPaymentMethod(p.payment_method),
      referenceNumber: p.reference_number || undefined,
      notes: p.notes || undefined,
      totalAmount,
      paidAmount: Number(p.amount) || 0,
      dueAmount: Math.max(0, totalAmount - paidForPurchase),
      paymentStatus: paidForPurchase <= 0
        ? "unpaid"
        : paidForPurchase >= totalAmount
          ? "paid"
          : "partial",
    };
  });
};

export const fetchTotalPurchasePayable = async (): Promise<number> => {
  const [{ data: purchases, error: purchasesError }, { data: payments, error: paymentsError }] =
    await Promise.all([
      supabase.from("purchases").select("id, total_amount, status").neq("status", "cancelled"),
      supabase
        .from("payments")
        .select("purchase_id, amount")
        .eq("payment_type", "paid")
        .is("sale_id", null)
        .not("purchase_id", "is", null),
    ]);

  if (purchasesError) throw new Error(purchasesError.message);
  if (paymentsError) throw new Error(paymentsError.message);

  const activePurchaseIds = new Set((purchases || []).map((p) => p.id));

  const paidByPurchase = new Map<string, number>();
  for (const payment of payments || []) {
    if (!payment.purchase_id || !activePurchaseIds.has(payment.purchase_id)) continue;
    paidByPurchase.set(
      payment.purchase_id,
      (paidByPurchase.get(payment.purchase_id) || 0) + Number(payment.amount || 0),
    );
  }

  return (purchases || []).reduce((totalDue, purchase) => {
    const total = Number(purchase.total_amount) || 0;
    const paid = paidByPurchase.get(purchase.id) || 0;
    return totalDue + Math.max(0, total - paid);
  }, 0);
};
