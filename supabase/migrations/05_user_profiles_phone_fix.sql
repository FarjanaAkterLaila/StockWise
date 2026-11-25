-- ==============================================================================
-- StockWise Mini ERP: Migration 05 - User Profiles Optional Phone & Sync Fix
-- Non-destructive, idempotent migration.
-- Compatible with migrations 01, 02, 03, and 04.
--
-- Fixes:
--   1. Ensures nullable public.profiles.phone column (and created_at/updated_at/
--      is_active) exist cleanly in the live database.
--   2. Backfills ONLY missing metadata/phone on existing public.profiles rows
--      (never altering roles), and explicitly notices any auth.users lacking
--      a profile row without silently assigning a default/lower role or
--      trusting user-editable auth metadata.
--   3. Updates handle_new_auth_user() trigger to save optional phone metadata
--      on auth.users signup (stored as NULL when empty/whitespace).
--   4. Adds Admin-only INSERT RLS policy on public.profiles (protected by
--      trigger_protect_profile_role) and provides atomic SECURITY DEFINER
--      public.upsert_user_profile(...) RPC restricted strictly to Admin and
--      trusted service_role.
-- ==============================================================================

BEGIN;

-- 1. Safely ensure public.profiles has nullable phone and audit columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT NOW();

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT NOW();

-- 2. Safely recover missing metadata/phone on existing profiles without altering roles;
--    never silently assign 'staff' or trust user-editable metadata for unprofiled auth.users.
DO $$
DECLARE
  v_missing_count integer;
  v_missing_users text;
BEGIN
  UPDATE public.profiles p
  SET
    full_name = COALESCE(
      NULLIF(BTRIM(p.full_name), ''),
      NULLIF(BTRIM(u.raw_user_meta_data->>'full_name'), ''),
      NULLIF(split_part(COALESCE(u.email, ''), '@', 1), ''),
      'Staff User'
    ),
    email = COALESCE(
      NULLIF(BTRIM(p.email), ''),
      u.email
    ),
    phone = COALESCE(
      NULLIF(BTRIM(p.phone), ''),
      NULLIF(BTRIM(COALESCE(u.raw_user_meta_data->>'phone', '')), '')
    ),
    updated_at = NOW()
  FROM auth.users u
  WHERE p.id = u.id
    AND (
      NULLIF(BTRIM(p.full_name), '') IS NULL
      OR NULLIF(BTRIM(p.email), '') IS NULL
      OR (
        NULLIF(BTRIM(p.phone), '') IS NULL
        AND NULLIF(BTRIM(COALESCE(u.raw_user_meta_data->>'phone', '')), '') IS NOT NULL
      )
    );

  SELECT
    COUNT(*)::integer,
    STRING_AGG(COALESCE(u.email, u.id::text), ', ' ORDER BY u.created_at)
  INTO v_missing_count, v_missing_users
  FROM auth.users u
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = u.id
  );

  IF v_missing_count > 0 THEN
    RAISE NOTICE 'Skipped auto-backfilling % auth.users account(s) without a public.profiles row (%). Assign each missing profile and intended role explicitly via public.upsert_user_profile(...) to prevent silent demotion or privilege escalation.',
      v_missing_count,
      v_missing_users;
  END IF;
END $$;

-- 3. Keep handle_new_auth_user() aligned so new auth signups persist optional phone
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_full_name text;
  v_phone text;
BEGIN
  v_full_name := COALESCE(
    NULLIF(BTRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
    'Staff User'
  );
  v_phone := NULLIF(BTRIM(COALESCE(NEW.raw_user_meta_data->>'phone', '')), '');

  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone,
    role,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    v_full_name,
    NEW.email,
    v_phone,
    'staff', -- Never trust signup metadata for elevated roles
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = COALESCE(
      NULLIF(BTRIM(public.profiles.full_name), ''),
      EXCLUDED.full_name
    ),
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    phone = COALESCE(
      NULLIF(BTRIM(public.profiles.phone), ''),
      EXCLUDED.phone
    ),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 4. Admin-only INSERT RLS policy on public.profiles (remove any Manager insert access)
DROP POLICY IF EXISTS "Managers can insert staff profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() = 'admin');

-- 5. Atomic SECURITY DEFINER RPC to upsert profile + optional phone (Admin & service_role only)
CREATE OR REPLACE FUNCTION public.upsert_user_profile(
  p_user_id uuid,
  p_full_name text,
  p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_role text DEFAULT 'staff',
  p_is_active boolean DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_role text;
  v_auth_user RECORD;
  v_existing RECORD;
  v_clean_name text;
  v_clean_email text;
  v_clean_phone text;
  v_target_role text;
  v_next_active boolean;
  v_saved public.profiles%ROWTYPE;
BEGIN
  IF COALESCE(auth.role(), '') = 'authenticated' THEN
    v_caller_role := public.current_user_role();
    IF auth.uid() IS NULL
       OR COALESCE(v_caller_role, '') <> 'admin' THEN
      RAISE EXCEPTION 'Unauthorized: Only administrators can manage user profiles.';
    END IF;
  ELSIF COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized: Authentication required.';
  END IF;

  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID is required.';
  END IF;

  SELECT u.id, u.email, u.raw_user_meta_data
  INTO v_auth_user
  FROM auth.users u
  WHERE u.id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Auth user with ID % does not exist.', p_user_id;
  END IF;

  v_clean_name := NULLIF(BTRIM(COALESCE(p_full_name, '')), '');
  IF v_clean_name IS NULL THEN
    RAISE EXCEPTION 'Full name is required.';
  END IF;

  v_clean_email := COALESCE(
    NULLIF(BTRIM(COALESCE(p_email, '')), ''),
    v_auth_user.email
  );
  v_clean_phone := NULLIF(BTRIM(COALESCE(p_phone, '')), '');

  v_target_role := LOWER(BTRIM(COALESCE(NULLIF(BTRIM(COALESCE(p_role, '')), ''), 'staff')));
  IF v_target_role NOT IN ('admin', 'manager', 'staff') THEN
    RAISE EXCEPTION 'Unsupported user role: %', p_role;
  END IF;

  SELECT *
  INTO v_existing
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  v_next_active := COALESCE(
    p_is_active,
    CASE WHEN FOUND THEN v_existing.is_active ELSE true END,
    true
  );

  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone,
    role,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    p_user_id,
    v_clean_name,
    v_clean_email,
    v_clean_phone,
    v_target_role,
    v_next_active,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    updated_at = NOW()
  RETURNING * INTO v_saved;

  RETURN to_jsonb(v_saved);
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_auth_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.upsert_user_profile(uuid, text, text, text, text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.upsert_user_profile(uuid, text, text, text, text, boolean) TO authenticated, service_role;

COMMIT;

NOTIFY pgrst, 'reload schema';
