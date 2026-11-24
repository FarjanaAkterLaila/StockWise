import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { UserAccount, UserRole } from "@/types";
import type { ProfileRow } from "@/types/database.types";
import {
  canManageTargetUser,
  getAssignableRoles,
  normalizeRole,
} from "@/utils/permissions";

const mapProfileRow = (row: ProfileRow): UserAccount => ({
  id: row.id,
  fullName: row.full_name?.trim() || row.email?.split("@")[0] || "Operator",
  email: row.email || "",
  role: normalizeRole(row.role),
  phone: row.phone || "",
  isActive: row.is_active !== false,
  createdAt: row.created_at,
});

export const fetchUsers = async (): Promise<UserAccount[]> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data || []) as unknown as ProfileRow[]).map(mapProfileRow);
};

export interface CreateUserInput {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
}

export interface UpdateUserInput {
  fullName: string;
  phone?: string;
  role: UserRole;
  isActive?: boolean;
}

const createEphemeralAuthClient = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};

export const createUserAccount = async (
  input: CreateUserInput,
  actorRole: UserRole,
): Promise<UserAccount> => {
  const assignableRoles = getAssignableRoles(actorRole);
  const requestedRole = normalizeRole(input.role);

  if (!assignableRoles.includes(requestedRole)) {
    throw new Error("You are not authorized to assign this role.");
  }

  const ephemeral = createEphemeralAuthClient();
  const { data, error } = await ephemeral.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        full_name: input.fullName.trim(),
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  const createdUserId = data.user?.id;
  if (!createdUserId) {
    throw new Error("User creation did not return a user ID.");
  }

  const updatePayload: Record<string, unknown> = {
    full_name: input.fullName.trim(),
    phone: input.phone?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  if (actorRole === "admin") {
    updatePayload.role = requestedRole;
  }

  const { data: updatedProfile, error: profileErr } = await supabase
    .from("profiles")
    .update(updatePayload)
    .eq("id", createdUserId)
    .select("*")
    .maybeSingle();

  if (profileErr) {
    throw new Error(profileErr.message);
  }

  if (updatedProfile) {
    return mapProfileRow(updatedProfile as unknown as ProfileRow);
  }

  return {
    id: createdUserId,
    fullName: input.fullName.trim(),
    email: input.email.trim(),
    role: actorRole === "admin" ? requestedRole : "staff",
    phone: input.phone?.trim() || "",
    isActive: true,
    createdAt: new Date().toISOString(),
  };
};

export const updateUserAccount = async (
  targetUser: UserAccount,
  updates: UpdateUserInput,
  actorRole: UserRole,
  allUsers: UserAccount[],
): Promise<UserAccount> => {
  if (!canManageTargetUser(actorRole, targetUser.role)) {
    throw new Error("You are not authorized to manage this user account.");
  }

  const nextRole = normalizeRole(updates.role);
  const assignableRoles = getAssignableRoles(actorRole);
  if (!assignableRoles.includes(nextRole)) {
    throw new Error("You are not authorized to assign this role.");
  }

  const nextIsActive = updates.isActive ?? targetUser.isActive;
  if (
    targetUser.role === "admin" &&
    (nextRole !== "admin" || !nextIsActive)
  ) {
    const otherActiveAdmins = allUsers.filter(
      (u) => u.id !== targetUser.id && u.role === "admin" && u.isActive,
    );
    if (otherActiveAdmins.length === 0) {
      throw new Error(
        "Cannot demote or deactivate the last active Admin account.",
      );
    }
  }

  const payload: Record<string, unknown> = {
    full_name: updates.fullName.trim(),
    phone: updates.phone?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  if (actorRole === "admin") {
    payload.role = nextRole;
    if (updates.isActive !== undefined) {
      payload.is_active = updates.isActive;
    }
  }

  let { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", targetUser.id)
    .select("*")
    .single();

  if (error && error.message.includes("Could not find the 'is_active'")) {
    delete payload.is_active;
    const retry = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", targetUser.id)
      .select("*")
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  return mapProfileRow(data as unknown as ProfileRow);
};
