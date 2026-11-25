import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { UserAccount, UserRole } from "@/types";
import type { ProfileRow } from "@/types/database.types";
import {
  canManageTargetUser,
  getAssignableRoles,
  normalizeRole,
} from "@/utils/permissions";

const mapProfileRow = (row: Partial<ProfileRow> & { id: string }): UserAccount => ({
  id: row.id,
  fullName: row.full_name?.trim() || row.email?.split("@")[0] || "Operator",
  email: row.email || "",
  role: normalizeRole(row.role),
  phone: row.phone?.trim() || "",
  isActive: row.is_active !== false,
  createdAt: row.created_at || new Date().toISOString(),
});

const PHONE_ALLOWED_CHARS_RE = /^[+\d\s()-]+$/;

export const validateOptionalPhone = (phone?: string | null): string | null => {
  const trimmed = phone?.trim();
  if (!trimmed) {
    return null;
  }
  if (!PHONE_ALLOWED_CHARS_RE.test(trimmed)) {
    return "Phone number can only contain digits, spaces, +, -, ( and ).";
  }
  const digitCount = trimmed.replace(/\D/g, "").length;
  if (digitCount < 7 || digitCount > 15) {
    return "Phone number must contain 7 to 15 digits.";
  }
  return null;
};

const normalizeOptionalPhone = (phone?: string | null): string | null => {
  const trimmed = phone?.trim();
  return trimmed ? trimmed : null;
};

const isMissingRpcError = (error: { code?: string; message?: string }): boolean => {
  const msg = error.message || "";
  return (
    error.code === "PGRST202" ||
    error.code === "42883" ||
    msg.includes("Could not find the function") ||
    /function\s+(?:public\.)?upsert_user_profile.*does not exist/i.test(msg)
  );
};

const isMissingColumnError = (message: string, column: string): boolean => {
  const escaped = column.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (
    new RegExp(`Could not find the '${escaped}' column`, "i").test(message) ||
    new RegExp(`column\\s+"?${escaped}"?\\s+of relation`, "i").test(message)
  );
};

export class UserProfileSyncError extends Error {
  public readonly partialUser: UserAccount;

  constructor(message: string, partialUser: UserAccount) {
    super(message);
    this.name = "UserProfileSyncError";
    this.partialUser = partialUser;
  }
}

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

const syncUserProfile = async (
  params: {
    userId: string;
    fullName: string;
    email?: string;
    phone?: string | null;
    role: UserRole;
    isActive?: boolean;
  },
  actorRole: UserRole,
): Promise<UserAccount> => {
  const cleanName = params.fullName.trim();
  const cleanEmail = params.email?.trim() || undefined;
  const cleanPhone = normalizeOptionalPhone(params.phone);
  const targetRole = actorRole === "admin" ? normalizeRole(params.role) : "staff";

  // Preferred atomic path: SECURITY DEFINER RPC ensures auth.users link & optional phone persistence
  const { data: rpcData, error: rpcError } = await supabase.rpc("upsert_user_profile", {
    p_user_id: params.userId,
    p_full_name: cleanName,
    p_email: cleanEmail ?? null,
    p_phone: cleanPhone,
    p_role: targetRole,
    p_is_active: actorRole === "admin" && params.isActive !== undefined ? params.isActive : null,
  });

  if (!rpcError && rpcData) {
    return mapProfileRow(rpcData as unknown as ProfileRow);
  }

  if (rpcError && !isMissingRpcError(rpcError)) {
    throw new Error(rpcError.message);
  }

  // Fallback for environments before Migration 05 is applied:
  // Never silently discard a user-provided phone number if profiles.phone is absent.
  const payload: Record<string, unknown> = {
    full_name: cleanName,
    phone: cleanPhone,
    updated_at: new Date().toISOString(),
  };

  if (cleanEmail) {
    payload.email = cleanEmail;
  }
  if (actorRole === "admin") {
    payload.role = targetRole;
    if (params.isActive !== undefined) {
      payload.is_active = params.isActive;
    }
  }

  let { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", params.userId)
    .select("*")
    .maybeSingle();

  // Strip only non-essential optional columns if absent (is_active / updated_at),
  // or strip `phone` ONLY when no phone number was supplied.
  for (let attempt = 0; attempt < 3 && error; attempt += 1) {
    if (isMissingColumnError(error.message, "is_active") && "is_active" in payload) {
      delete payload.is_active;
    } else if (isMissingColumnError(error.message, "updated_at") && "updated_at" in payload) {
      delete payload.updated_at;
    } else if (isMissingColumnError(error.message, "phone") && "phone" in payload) {
      if (cleanPhone !== null) {
        throw new Error(
          "Database column `profiles.phone` is missing. Run Migration 05 (`05_user_profiles_phone_fix.sql`) in Supabase SQL Editor to persist phone numbers.",
        );
      }
      delete payload.phone;
    } else {
      break;
    }

    const retry = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", params.userId)
      .select("*")
      .maybeSingle();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    const insertPayload: Record<string, unknown> = {
      id: params.userId,
      ...payload,
      role: targetRole,
    };
    const { data: upserted, error: upsertErr } = await supabase
      .from("profiles")
      .upsert(insertPayload, { onConflict: "id" })
      .select("*")
      .maybeSingle();

    if (upsertErr) {
      throw new Error(upsertErr.message);
    }
    if (!upserted) {
      throw new Error(
        "Profile row for this user was not found or could not be saved. Run Migration 05 (`05_user_profiles_phone_fix.sql`) in Supabase SQL Editor.",
      );
    }
    return mapProfileRow(upserted as unknown as ProfileRow);
  }

  return mapProfileRow(data as unknown as ProfileRow);
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

  const cleanName = input.fullName.trim();
  const cleanEmail = input.email.trim();
  const phoneError = validateOptionalPhone(input.phone);
  if (phoneError) {
    throw new Error(phoneError);
  }
  const cleanPhone = normalizeOptionalPhone(input.phone);

  const ephemeral = createEphemeralAuthClient();
  const { data, error } = await ephemeral.auth.signUp({
    email: cleanEmail,
    password: input.password,
    options: {
      data: {
        full_name: cleanName,
        ...(cleanPhone ? { phone: cleanPhone } : {}),
      },
    },
  });

  const createdUserId = data?.user?.id;

  if (error) {
    const isRateLimit =
      error.status === 429 ||
      /rate\s*limit|over_email_send_rate_limit/i.test(error.message);

    // If Supabase Auth already created the user before hitting a downstream email/signup limit,
    // proceed to sync their profile instead of falsely claiming complete failure.
    if (!createdUserId) {
      if (isRateLimit) {
        throw new Error(
          "Supabase Auth email rate limit reached. Wait briefly before creating another user (no duplicate Auth account was created).",
        );
      }
      throw new Error(error.message);
    }
  }

  if (!createdUserId) {
    throw new Error("User creation did not return a user ID.");
  }

  // When email confirmations are enabled and the email already belongs to an existing user,
  // Supabase Auth returns a user object with an empty `identities` array instead of an error.
  if (Array.isArray(data.user?.identities) && data.user.identities.length === 0) {
    throw new Error("An account with this email address already exists.");
  }

  const effectiveRole: UserRole = actorRole === "admin" ? requestedRole : "staff";
  const fallbackPartialUser: UserAccount = {
    id: createdUserId,
    fullName: cleanName,
    email: cleanEmail,
    role: effectiveRole,
    phone: "",
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  try {
    return await syncUserProfile(
      {
        userId: createdUserId,
        fullName: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        role: effectiveRole,
        isActive: true,
      },
      actorRole,
    );
  } catch (syncErr: unknown) {
    const syncMessage =
      syncErr instanceof Error ? syncErr.message : "Failed to save user profile.";
    throw new UserProfileSyncError(syncMessage, fallbackPartialUser);
  }
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

  const resolvedPhone = updates.phone === undefined ? targetUser.phone : updates.phone;
  const phoneError = validateOptionalPhone(resolvedPhone);
  if (phoneError) {
    throw new Error(phoneError);
  }

  return syncUserProfile(
    {
      userId: targetUser.id,
      fullName: updates.fullName,
      email: targetUser.email,
      phone: resolvedPhone,
      role: actorRole === "admin" ? nextRole : targetUser.role,
      isActive: updates.isActive,
    },
    actorRole,
  );
};
