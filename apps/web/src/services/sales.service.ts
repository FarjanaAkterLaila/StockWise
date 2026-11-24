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

  // Execute directly through PostgreSQL RPC function for atomic stock validation & deduction
  const { data, error } = await supabase.rpc("process_sale_transaction", {
    p_invoice_number: invoiceNumber,
    p_customer_id: saleData.customerId || null,
    p_subtotal: Number(saleData.subtotal) || 0,
    p_discount_amount: Number(saleData.discountAmount) || 0,
    p_tax_amount: Number(saleData.taxAmount) || 0,
    p_total_amount: Number(saleData.totalAmount) || 0,
    p_paid_amount: Number(saleData.paidAmount) || 0,
    p_payment_method: saleData.paymentMethod || "Cash",
    p_status: saleData.status || "completed",
    p_notes: saleData.notes || null,
    p_user_id: userId || null,
    p_items: saleData.items,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
