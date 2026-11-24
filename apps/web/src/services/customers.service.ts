import { supabase } from "@/lib/supabase";
import type { Customer, CustomerType } from "@/types";
import type { CustomerRow } from "@/types/database.types";

export const fetchCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data || []) as unknown as CustomerRow[];

  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email || undefined,
    phone: c.phone || "N/A",
    customerType: "Retail" as CustomerType,
    balance: Number(c.balance) || 0,
  }));
};

export const createCustomer = async (customerData: {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}): Promise<Customer> => {
  const insertPayload: Record<string, unknown> = {
    name: customerData.name.trim(),
    phone: customerData.phone?.trim() || null,
    email: customerData.email?.trim() || null,
    address: customerData.address?.trim() || null,
    balance: 0,
  };

  let { data, error } = await supabase
    .from("customers")
    .insert(insertPayload)
    .select()
    .single();

  while (error && error.message.includes("Could not find the '")) {
    const match = error.message.match(/Could not find the '([^']+)' column/);
    if (match && match[1] && match[1] in insertPayload) {
      delete insertPayload[match[1]];
      const retry = await supabase
        .from("customers")
        .insert(insertPayload)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    } else {
      break;
    }
  }

  if (error) {
    throw new Error(error.message);
  }

  const row = data as unknown as CustomerRow;

  return {
    id: row.id,
    name: row.name,
    email: row.email || undefined,
    phone: row.phone || "N/A",
    customerType: "Retail",
    balance: Number(row.balance) || 0,
  };
};

export const updateCustomer = async (
  id: string,
  customerData: Partial<{
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    balance?: number;
  }>,
): Promise<Customer> => {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (customerData.name !== undefined) payload.name = customerData.name.trim();
  if (customerData.phone !== undefined)
    payload.phone = customerData.phone.trim() || null;
  if (customerData.email !== undefined)
    payload.email = customerData.email.trim() || null;
  if (customerData.address !== undefined)
    payload.address = customerData.address.trim() || null;
  if (customerData.balance !== undefined)
    payload.balance = Number(customerData.balance);

  let { data, error } = await supabase
    .from("customers")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  while (error && error.message.includes("Could not find the '")) {
    const match = error.message.match(/Could not find the '([^']+)' column/);
    if (match && match[1] && match[1] in payload) {
      delete payload[match[1]];
      const retry = await supabase
        .from("customers")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    } else {
      break;
    }
  }

  if (error) throw new Error(error.message);

  const row = data as unknown as CustomerRow;
  return {
    id: row.id,
    name: row.name,
    email: row.email || undefined,
    phone: row.phone || "N/A",
    customerType: "Retail",
    balance: Number(row.balance) || 0,
  };
};

export const deleteCustomer = async (id: string): Promise<void> => {
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw new Error(error.message);
};
