import { supabase } from "@/lib/supabase";
import type { Supplier } from "@/types";
import type { SupplierRow } from "@/types/database.types";

export const fetchSuppliers = async (): Promise<Supplier[]> => {
  // Clean up any legacy automatic dummy distributor if present without purchases
  try {
    await supabase
      .from("suppliers")
      .delete()
      .ilike("name", "%Authorized%Distributor%")
      .eq("balance", 0);
  } catch {
    // Ignore cleanup error if constraint exists
  }

  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data || []) as unknown as SupplierRow[];

  return rows
    .filter((s) => {
      const lower = (s.name || "").toLowerCase();
      return (
        !lower.includes("authorized hardware distributor") &&
        !lower.includes("authorized distributor")
      );
    })
    .map((s) => ({
      id: s.id,
      name: s.name,
      contactPerson: s.contact_person || s.name,
      phone: s.phone || "N/A",
      email: s.email || "",
      address: s.address || "",
      distributorOf: [],
    }));
};

export const createSupplier = async (supplierData: {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
}): Promise<Supplier> => {
  const insertPayload: Record<string, unknown> = {
    name: supplierData.name.trim(),
    contact_person: supplierData.contactPerson?.trim() || null,
    phone: supplierData.phone?.trim() || null,
    email: supplierData.email?.trim() || null,
    address: supplierData.address?.trim() || null,
    balance: 0,
  };

  let { data, error } = await supabase
    .from("suppliers")
    .insert(insertPayload)
    .select()
    .single();

  while (error && error.message.includes("Could not find the '")) {
    const match = error.message.match(/Could not find the '([^']+)' column/);
    if (match && match[1] && match[1] in insertPayload) {
      delete insertPayload[match[1]];
      const retry = await supabase
        .from("suppliers")
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

  const row = data as unknown as SupplierRow;

  return {
    id: row.id,
    name: row.name,
    contactPerson: row.contact_person || row.name,
    phone: row.phone || "N/A",
    email: row.email || "",
    address: row.address || "",
    distributorOf: [],
  };
};

export const updateSupplier = async (
  id: string,
  supplierData: Partial<{
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    balance?: number;
  }>,
): Promise<Supplier> => {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (supplierData.name !== undefined) payload.name = supplierData.name.trim();
  if (supplierData.contactPerson !== undefined)
    payload.contact_person = supplierData.contactPerson.trim() || null;
  if (supplierData.phone !== undefined)
    payload.phone = supplierData.phone.trim() || null;
  if (supplierData.email !== undefined)
    payload.email = supplierData.email.trim() || null;
  if (supplierData.address !== undefined)
    payload.address = supplierData.address.trim() || null;
  if (supplierData.balance !== undefined)
    payload.balance = Number(supplierData.balance);

  let { data, error } = await supabase
    .from("suppliers")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  while (error && error.message.includes("Could not find the '")) {
    const match = error.message.match(/Could not find the '([^']+)' column/);
    if (match && match[1] && match[1] in payload) {
      delete payload[match[1]];
      const retry = await supabase
        .from("suppliers")
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

  const row = data as unknown as SupplierRow;
  return {
    id: row.id,
    name: row.name,
    contactPerson: row.contact_person || row.name,
    phone: row.phone || "N/A",
    email: row.email || "",
    address: row.address || "",
    distributorOf: [],
  };
};

export const deleteSupplier = async (id: string): Promise<void> => {
  const { error } = await supabase.from("suppliers").delete().eq("id", id);
  if (error) throw new Error(error.message);
};
