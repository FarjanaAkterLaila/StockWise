-- ==============================================================================
-- StockWise Mini ERP - Minimum RBAC Roles, Triggers, and Strict RLS Policies
-- ==============================================================================

BEGIN;

-- 1. Replace protect_profile_role() FIRST so subsequent normalization updates
--    succeed in Supabase SQL Editor and service_role handles DELETE properly.
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger AS $$
DECLARE
  v_caller_role text;
  v_other_active_admins int;
BEGIN
  -- Allow trusted backend/migration execution (service_role JWT, SQL Editor DBA, or auth signup trigger)
  -- Note: check session_user (not current_user) because this function is SECURITY DEFINER.
  IF COALESCE(auth.role(), '') = 'service_role'
     OR (
       auth.uid() IS NULL
       AND COALESCE(auth.role(), '') = ''
       AND session_user IN ('postgres', 'supabase_admin', 'supabase_auth_admin')
     ) THEN
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    END IF;
    RETURN NEW;
  END IF;

  v_caller_role := public.current_user_role();

  IF v_caller_role NOT IN ('admin', 'manager', 'staff') THEN
    RAISE EXCEPTION 'Unauthorized: Active ERP profile required.';
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF v_caller_role <> 'admin'
       AND LOWER(BTRIM(COALESCE(NEW.role, 'staff'))) <> 'staff' THEN
      RAISE EXCEPTION 'Privilege escalation rejected: Only administrators can assign elevated roles.';
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    IF v_caller_role <> 'admin' THEN
      RAISE EXCEPTION 'Unauthorized: Only administrators can delete user profiles.';
    END IF;
    IF LOWER(BTRIM(COALESCE(OLD.role, 'staff'))) = 'admin'
       AND COALESCE(OLD.is_active, true) = true THEN
      PERFORM pg_advisory_xact_lock(hashtext('stockwise_last_active_admin'));
      SELECT COUNT(*) INTO v_other_active_admins
      FROM public.profiles
      WHERE LOWER(BTRIM(COALESCE(role, 'staff'))) = 'admin'
        AND COALESCE(is_active, true) = true
        AND id <> OLD.id;
      IF v_other_active_admins = 0 THEN
        RAISE EXCEPTION 'Operation rejected: Cannot remove the last active Admin.';
      END IF;
    END IF;
    RETURN OLD;
  END IF;

  -- Block every authenticated ERP role (including Admin) from modifying immutable profile ID
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Unauthorized: Profile ID cannot be modified.';
  END IF;

  -- Block non-admins from changing user roles
  IF v_caller_role <> 'admin' THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Privilege escalation rejected: Only administrators can modify user roles.';
    END IF;
  END IF;

  -- Block unauthorized account deactivation/reactivation
  IF COALESCE(NEW.is_active, true) IS DISTINCT FROM COALESCE(OLD.is_active, true) THEN
    IF v_caller_role = 'staff' THEN
      RAISE EXCEPTION 'Unauthorized: Staff cannot modify account activation status.';
    END IF;
    IF v_caller_role = 'manager'
       AND (auth.uid() = OLD.id OR LOWER(BTRIM(COALESCE(OLD.role, 'staff'))) <> 'staff') THEN
      RAISE EXCEPTION 'Unauthorized: Managers can manage Staff account status only.';
    END IF;
  END IF;

  -- Managers may only update Staff accounts (besides their own non-privileged fields)
  IF v_caller_role = 'manager' AND auth.uid() <> OLD.id THEN
    IF LOWER(BTRIM(COALESCE(OLD.role, 'staff'))) <> 'staff'
       OR LOWER(BTRIM(COALESCE(NEW.role, 'staff'))) <> 'staff' THEN
      RAISE EXCEPTION 'Unauthorized: Managers can manage Staff accounts only.';
    END IF;
  END IF;

  -- Staff can only update their own non-privileged fields
  IF v_caller_role = 'staff' AND auth.uid() <> OLD.id THEN
    RAISE EXCEPTION 'Unauthorized: Staff cannot modify other user profiles.';
  END IF;

  -- Prevent demoting or deactivating the last active Admin (concurrency-safe)
  IF LOWER(BTRIM(COALESCE(OLD.role, 'staff'))) = 'admin'
     AND COALESCE(OLD.is_active, true) = true THEN
    IF LOWER(BTRIM(COALESCE(NEW.role, 'staff'))) <> 'admin'
       OR COALESCE(NEW.is_active, true) = false THEN
      PERFORM pg_advisory_xact_lock(hashtext('stockwise_last_active_admin'));
      SELECT COUNT(*) INTO v_other_active_admins
      FROM public.profiles
      WHERE LOWER(BTRIM(COALESCE(role, 'staff'))) = 'admin'
        AND COALESCE(is_active, true) = true
        AND id <> OLD.id;
      IF v_other_active_admins = 0 THEN
        RAISE EXCEPTION 'Operation rejected: Cannot demote or deactivate the last active Admin.';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 2. Safely ensure is_active column, normalize ALL role casing/legacy values,
--    and enforce profiles_role_check without downgrading Admin or Manager accounts.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_active boolean NOT NULL DEFAULT true;
  END IF;

  -- Drop existing role check constraint first so normalization updates always succeed
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

  -- Normalize case/whitespace and convert legacy 'cashier'/unknown roles to 'staff'
  UPDATE public.profiles
  SET
    role = CASE
      WHEN LOWER(BTRIM(COALESCE(role, ''))) = 'admin' THEN 'admin'
      WHEN LOWER(BTRIM(COALESCE(role, ''))) = 'manager' THEN 'manager'
      ELSE 'staff'
    END,
    updated_at = NOW()
  WHERE role IS NULL
     OR role IS DISTINCT FROM LOWER(BTRIM(role))
     OR LOWER(BTRIM(role)) NOT IN ('admin', 'manager', 'staff');

  ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'staff';
  ALTER TABLE public.profiles ALTER COLUMN role SET NOT NULL;

  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'manager', 'staff'));
END $$;

DROP TRIGGER IF EXISTS trigger_protect_profile_role ON public.profiles;
CREATE TRIGGER trigger_protect_profile_role
  BEFORE INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- 3. Harden current_user_role(): enforce active status, lowercase normalization,
--    and fail closed for anonymous, inactive, or unprofiled users.
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN 'anonymous'
    ELSE COALESCE(
      (
        SELECT CASE
          WHEN COALESCE(p.is_active, true) = false THEN 'inactive'
          WHEN LOWER(BTRIM(COALESCE(p.role, ''))) = 'admin' THEN 'admin'
          WHEN LOWER(BTRIM(COALESCE(p.role, ''))) = 'manager' THEN 'manager'
          WHEN LOWER(BTRIM(COALESCE(p.role, ''))) = 'staff' THEN 'staff'
          ELSE 'unassigned'
        END
        FROM public.profiles p
        WHERE p.id = auth.uid()
      ),
      'unassigned'
    )
  END;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- 4. Ensure Row Level Security is enabled on all 12 protected tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Remove any leftover unconditional USING (true) / WITH CHECK (true) policies
--    from earlier manual setups or migration 01 across the 12 ERP tables.
DO $$
DECLARE
  v_pol RECORD;
BEGIN
  FOR v_pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'profiles', 'categories', 'products', 'customers', 'suppliers',
        'purchases', 'purchase_items', 'sales', 'sale_items',
        'stock_movements', 'payments', 'expenses'
      )
      AND (
        LOWER(BTRIM(COALESCE(qual, ''))) IN ('true', '(true)')
        OR LOWER(BTRIM(COALESCE(with_check, ''))) IN ('true', '(true)')
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', v_pol.policyname, v_pol.schemaname, v_pol.tablename);
    RAISE NOTICE 'Dropped leftover permissive policy "%" on %.%', v_pol.policyname, v_pol.schemaname, v_pol.tablename;
  END LOOP;
END $$;

-- 6. Idempotent RBAC RLS policies across all 12 tables

-- PROFILES
DROP POLICY IF EXISTS "Profiles are readable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Profiles readable by own user or admin/manager" ON public.profiles;
CREATE POLICY "Profiles readable by own user or admin/manager"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR public.current_user_role() IN ('admin', 'manager')
  );

DROP POLICY IF EXISTS "Users can update their own profile name and avatar" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

DROP POLICY IF EXISTS "Managers can update staff profiles" ON public.profiles;
CREATE POLICY "Managers can update staff profiles"
  ON public.profiles FOR UPDATE TO authenticated
  USING (
    public.current_user_role() = 'manager'
    AND LOWER(BTRIM(COALESCE(role, 'staff'))) = 'staff'
  )
  WITH CHECK (
    public.current_user_role() = 'manager'
    AND LOWER(BTRIM(COALESCE(role, 'staff'))) = 'staff'
  );

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE TO authenticated
  USING (public.current_user_role() = 'admin');

-- CATEGORIES
DROP POLICY IF EXISTS "Categories readable by authenticated" ON public.categories;
CREATE POLICY "Categories readable by authenticated"
  ON public.categories FOR SELECT TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager', 'staff'));

DROP POLICY IF EXISTS "Categories editable by admin and manager" ON public.categories;
DROP POLICY IF EXISTS "Categories insertable by admin and manager" ON public.categories;
CREATE POLICY "Categories insertable by admin and manager"
  ON public.categories FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Categories updatable by admin and manager" ON public.categories;
CREATE POLICY "Categories updatable by admin and manager"
  ON public.categories FOR UPDATE TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager'))
  WITH CHECK (public.current_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Categories deletable by admin" ON public.categories;
CREATE POLICY "Categories deletable by admin"
  ON public.categories FOR DELETE TO authenticated
  USING (public.current_user_role() = 'admin');

-- PRODUCTS
DROP POLICY IF EXISTS "Products readable by authenticated" ON public.products;
CREATE POLICY "Products readable by authenticated"
  ON public.products FOR SELECT TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager', 'staff'));

DROP POLICY IF EXISTS "Products editable by admin and manager" ON public.products;
DROP POLICY IF EXISTS "Products insertable by admin and manager" ON public.products;
CREATE POLICY "Products insertable by admin and manager"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Products updatable by admin and manager" ON public.products;
CREATE POLICY "Products updatable by admin and manager"
  ON public.products FOR UPDATE TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager'))
  WITH CHECK (public.current_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Products deletable by admin" ON public.products;
CREATE POLICY "Products deletable by admin"
  ON public.products FOR DELETE TO authenticated
  USING (public.current_user_role() = 'admin');

-- CUSTOMERS (Staff view only; Admin & Manager full operational management)
DROP POLICY IF EXISTS "Customers accessible by authenticated" ON public.customers;
DROP POLICY IF EXISTS "Customers readable by authenticated" ON public.customers;
CREATE POLICY "Customers readable by authenticated"
  ON public.customers FOR SELECT TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager', 'staff'));

DROP POLICY IF EXISTS "Customers manageable by admin and manager" ON public.customers;
CREATE POLICY "Customers manageable by admin and manager"
  ON public.customers FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Customers updatable by admin and manager" ON public.customers;
CREATE POLICY "Customers updatable by admin and manager"
  ON public.customers FOR UPDATE TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager'))
  WITH CHECK (public.current_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Customers deletable by admin and manager" ON public.customers;
CREATE POLICY "Customers deletable by admin and manager"
  ON public.customers FOR DELETE TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager'));

-- SUPPLIERS (Admin & Manager full operational management; Staff no access)
DROP POLICY IF EXISTS "Suppliers accessible by authenticated" ON public.suppliers;
DROP POLICY IF EXISTS "Suppliers manageable by admin and manager" ON public.suppliers;
CREATE POLICY "Suppliers manageable by admin and manager"
  ON public.suppliers FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager'))
  WITH CHECK (public.current_user_role() IN ('admin', 'manager'));

-- SALES (Admin full; Manager create/view/edit, no delete; Staff create & view own only)
DROP POLICY IF EXISTS "Sales accessible by authenticated" ON public.sales;
DROP POLICY IF EXISTS "Sales readable by role or ownership" ON public.sales;
CREATE POLICY "Sales readable by role or ownership"
  ON public.sales FOR SELECT TO authenticated
  USING (
    public.current_user_role() IN ('admin', 'manager')
    OR (public.current_user_role() = 'staff' AND created_by = auth.uid())
  );

DROP POLICY IF EXISTS "Sales insertable by role with ownership" ON public.sales;
CREATE POLICY "Sales insertable by role with ownership"
  ON public.sales FOR INSERT TO authenticated
  WITH CHECK (
    public.current_user_role() IN ('admin', 'manager')
    OR (public.current_user_role() = 'staff' AND created_by = auth.uid())
  );

DROP POLICY IF EXISTS "Sales updatable by admin and manager" ON public.sales;
CREATE POLICY "Sales updatable by admin and manager"
  ON public.sales FOR UPDATE TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager'))
  WITH CHECK (public.current_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Sales deletable by admin only" ON public.sales;
CREATE POLICY "Sales deletable by admin only"
  ON public.sales FOR DELETE TO authenticated
  USING (public.current_user_role() = 'admin');

-- SALE ITEMS (Follows parent sale visibility/permissions)
DROP POLICY IF EXISTS "Sale items accessible by authenticated" ON public.sale_items;
DROP POLICY IF EXISTS "Sale items readable by role or ownership" ON public.sale_items;
CREATE POLICY "Sale items readable by role or ownership"
  ON public.sale_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.sales s
      WHERE s.id = sale_items.sale_id
        AND (
          public.current_user_role() IN ('admin', 'manager')
          OR (public.current_user_role() = 'staff' AND s.created_by = auth.uid())
        )
    )
  );

DROP POLICY IF EXISTS "Sale items insertable by role or own sale" ON public.sale_items;
CREATE POLICY "Sale items insertable by role or own sale"
  ON public.sale_items FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sales s
      WHERE s.id = sale_items.sale_id
        AND (
          public.current_user_role() IN ('admin', 'manager')
          OR (public.current_user_role() = 'staff' AND s.created_by = auth.uid())
        )
    )
  );

DROP POLICY IF EXISTS "Sale items updatable by admin and manager" ON public.sale_items;
CREATE POLICY "Sale items updatable by admin and manager"
  ON public.sale_items FOR UPDATE TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager'))
  WITH CHECK (public.current_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Sale items deletable by admin only" ON public.sale_items;
CREATE POLICY "Sale items deletable by admin only"
  ON public.sale_items FOR DELETE TO authenticated
  USING (public.current_user_role() = 'admin');

-- PURCHASES & PURCHASE ITEMS
-- Manager can create/view/edit purchases (including replacing purchase_items on PO edit),
-- while purchase deletion remains restricted to Admin only.
DROP POLICY IF EXISTS "Purchases accessible by authenticated" ON public.purchases;
DROP POLICY IF EXISTS "Purchases readable by admin and manager" ON public.purchases;
CREATE POLICY "Purchases readable by admin and manager"
  ON public.purchases FOR SELECT TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Purchases insertable by admin and manager" ON public.purchases;
CREATE POLICY "Purchases insertable by admin and manager"
  ON public.purchases FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Purchases updatable by admin and manager" ON public.purchases;
CREATE POLICY "Purchases updatable by admin and manager"
  ON public.purchases FOR UPDATE TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager'))
  WITH CHECK (public.current_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Purchases deletable by admin only" ON public.purchases;
CREATE POLICY "Purchases deletable by admin only"
  ON public.purchases FOR DELETE TO authenticated
  USING (public.current_user_role() = 'admin');

DROP POLICY IF EXISTS "Purchase items accessible by authenticated" ON public.purchase_items;
DROP POLICY IF EXISTS "Purchase items readable by admin and manager" ON public.purchase_items;
CREATE POLICY "Purchase items readable by admin and manager"
  ON public.purchase_items FOR SELECT TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Purchase items insertable by admin and manager" ON public.purchase_items;
CREATE POLICY "Purchase items insertable by admin and manager"
  ON public.purchase_items FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Purchase items updatable by admin and manager" ON public.purchase_items;
CREATE POLICY "Purchase items updatable by admin and manager"
  ON public.purchase_items FOR UPDATE TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager'))
  WITH CHECK (public.current_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Purchase items deletable by admin only" ON public.purchase_items;
DROP POLICY IF EXISTS "Purchase items deletable by admin and manager" ON public.purchase_items;
CREATE POLICY "Purchase items deletable by admin and manager"
  ON public.purchase_items FOR DELETE TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager'));

-- STOCK MOVEMENTS
DROP POLICY IF EXISTS "Stock movements accessible by authenticated" ON public.stock_movements;
DROP POLICY IF EXISTS "Stock movements readable by role" ON public.stock_movements;
CREATE POLICY "Stock movements readable by role"
  ON public.stock_movements FOR SELECT TO authenticated
  USING (
    public.current_user_role() IN ('admin', 'manager')
    OR (public.current_user_role() = 'staff' AND created_by = auth.uid())
  );

DROP POLICY IF EXISTS "Stock movements insertable by admin and manager" ON public.stock_movements;
CREATE POLICY "Stock movements insertable by admin and manager"
  ON public.stock_movements FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Stock movements deletable by admin only" ON public.stock_movements;
CREATE POLICY "Stock movements deletable by admin only"
  ON public.stock_movements FOR DELETE TO authenticated
  USING (public.current_user_role() = 'admin');

-- PAYMENTS (Staff sees/records received sale payments for own sales only)
DROP POLICY IF EXISTS "Payments accessible by authenticated" ON public.payments;
DROP POLICY IF EXISTS "Payments readable by role or own sale" ON public.payments;
CREATE POLICY "Payments readable by role or own sale"
  ON public.payments FOR SELECT TO authenticated
  USING (
    public.current_user_role() IN ('admin', 'manager')
    OR (
      public.current_user_role() = 'staff'
      AND payment_type = 'received'
      AND purchase_id IS NULL
      AND sale_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.sales s
        WHERE s.id = payments.sale_id AND s.created_by = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Payments insertable by role or own sale" ON public.payments;
CREATE POLICY "Payments insertable by role or own sale"
  ON public.payments FOR INSERT TO authenticated
  WITH CHECK (
    public.current_user_role() IN ('admin', 'manager')
    OR (
      public.current_user_role() = 'staff'
      AND payment_type = 'received'
      AND purchase_id IS NULL
      AND sale_id IS NOT NULL
      AND created_by = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.sales s
        WHERE s.id = payments.sale_id AND s.created_by = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Payments updatable by admin and manager" ON public.payments;
CREATE POLICY "Payments updatable by admin and manager"
  ON public.payments FOR UPDATE TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager'))
  WITH CHECK (public.current_user_role() IN ('admin', 'manager'));

DROP POLICY IF EXISTS "Payments deletable by admin only" ON public.payments;
CREATE POLICY "Payments deletable by admin only"
  ON public.payments FOR DELETE TO authenticated
  USING (public.current_user_role() = 'admin');

-- EXPENSES (Admin & Manager manage; Staff has no access)
DROP POLICY IF EXISTS "Expenses viewable by authenticated" ON public.expenses;
DROP POLICY IF EXISTS "Expenses insertable by authenticated" ON public.expenses;
DROP POLICY IF EXISTS "Expenses editable by admin and manager only" ON public.expenses;
DROP POLICY IF EXISTS "Expenses deletable by admin and manager only" ON public.expenses;
DROP POLICY IF EXISTS "Expenses manageable by admin and manager" ON public.expenses;
CREATE POLICY "Expenses manageable by admin and manager"
  ON public.expenses FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager'))
  WITH CHECK (public.current_user_role() IN ('admin', 'manager'));

-- 7. Tighten RPC role checks (Staff cannot edit sales or receive purchase goods;
--    inactive/anonymous callers cannot process sales)
CREATE OR REPLACE FUNCTION public.process_sale_transaction(
  p_invoice_number text,
  p_customer_id uuid,
  p_subtotal numeric,
  p_discount_amount numeric,
  p_tax_amount numeric,
  p_total_amount numeric,
  p_paid_amount numeric,
  p_payment_method text,
  p_status text,
  p_notes text,
  p_user_id uuid,
  p_items jsonb
) RETURNS jsonb AS $$
DECLARE
  v_caller_id uuid;
  v_sale_id uuid;
  v_due_amount numeric;
  v_payment_status text;
  v_total_paid numeric;
  v_item jsonb;
  v_agg RECORD;
  v_prod_id uuid;
  v_qty_raw numeric;
  v_qty int;
  v_unit_price numeric;
  v_subtotal numeric;
  v_calc_item_subtotal numeric;
  v_calc_subtotal numeric := 0;
  v_calc_total numeric;
  v_effective_discount numeric;
  v_effective_tax numeric;
  v_effective_paid numeric;
  v_curr_qty int;
  v_is_completed boolean;
BEGIN
  IF auth.role() = 'authenticated' THEN
    IF public.current_user_role() NOT IN ('admin', 'manager', 'staff') THEN
      RAISE EXCEPTION 'Unauthorized: Active ERP role required to process sales.';
    END IF;
    v_caller_id := auth.uid();
  ELSIF auth.role() = 'service_role' THEN
    v_caller_id := p_user_id;
  ELSE
    RAISE EXCEPTION 'Unauthorized: Authentication required.';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Sale transaction must include at least one item.';
  END IF;

  IF LOWER(COALESCE(p_status, 'completed')) NOT IN ('draft', 'completed', 'cancelled', 'refunded') THEN
    RAISE EXCEPTION 'Unsupported sale status: %', p_status;
  END IF;

  -- Validate every line item and compute expected subtotal before locking/writing
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_prod_id := NULLIF(BTRIM(COALESCE(v_item->>'productId', v_item->>'product_id')), '')::uuid;
    IF v_prod_id IS NULL THEN
      RAISE EXCEPTION 'Invalid product reference in sale items.';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.products WHERE id = v_prod_id) THEN
      RAISE EXCEPTION 'Product with ID % not found.', v_prod_id;
    END IF;

    v_qty_raw := NULLIF(BTRIM(COALESCE(v_item->>'quantity', v_item->>'qty')), '')::numeric;
    IF v_qty_raw IS NULL OR v_qty_raw <= 0 OR v_qty_raw <> TRUNC(v_qty_raw) THEN
      RAISE EXCEPTION 'Item quantity must be a positive integer for product ID %.', v_prod_id;
    END IF;
    v_qty := v_qty_raw::int;

    v_unit_price := NULLIF(BTRIM(COALESCE(v_item->>'unitPrice', v_item->>'unit_price', v_item->>'unitCost', v_item->>'unit_cost')), '')::numeric;
    IF v_unit_price IS NULL OR v_unit_price < 0 THEN
      RAISE EXCEPTION 'Item unit price must be a non-negative amount for product ID %.', v_prod_id;
    END IF;

    v_calc_item_subtotal := ROUND(v_qty * v_unit_price, 2);
    IF NULLIF(BTRIM(v_item->>'subtotal'), '') IS NOT NULL THEN
      v_subtotal := (v_item->>'subtotal')::numeric;
      IF v_subtotal < 0 OR ABS(v_subtotal - v_calc_item_subtotal) > 0.01 THEN
        RAISE EXCEPTION 'Item subtotal (%) does not match quantity * unit price (%) for product ID %.', v_subtotal, v_calc_item_subtotal, v_prod_id;
      END IF;
    END IF;

    v_calc_subtotal := v_calc_subtotal + v_calc_item_subtotal;
  END LOOP;

  v_effective_discount := COALESCE(p_discount_amount, 0);
  v_effective_tax := COALESCE(p_tax_amount, 0);
  v_effective_paid := COALESCE(p_paid_amount, 0);

  IF COALESCE(p_subtotal, v_calc_subtotal) < 0 OR v_effective_discount < 0 OR v_effective_tax < 0 THEN
    RAISE EXCEPTION 'Sale subtotal, discount, and tax must be non-negative amounts.';
  END IF;
  IF p_subtotal IS NOT NULL AND ABS(p_subtotal - v_calc_subtotal) > 0.01 THEN
    RAISE EXCEPTION 'Sale subtotal (%) does not match item subtotals (%).', p_subtotal, v_calc_subtotal;
  END IF;
  IF p_total_amount IS NULL OR p_total_amount < 0 THEN
    RAISE EXCEPTION 'Sale total must be a non-negative amount.';
  END IF;

  v_calc_total := GREATEST(0, ROUND(v_calc_subtotal - v_effective_discount + v_effective_tax, 2));
  IF ABS(p_total_amount - v_calc_total) > 0.01 THEN
    RAISE EXCEPTION 'Sale total (%) does not match calculated total (%).', p_total_amount, v_calc_total;
  END IF;

  IF v_effective_paid < 0 OR v_effective_paid > p_total_amount + 0.01 THEN
    RAISE EXCEPTION 'Paid amount (%) must be between 0 and the sale total (%).', v_effective_paid, p_total_amount;
  END IF;

  v_is_completed := (LOWER(COALESCE(p_status, 'completed')) = 'completed');

  IF v_is_completed THEN
    -- Lock all distinct products in deterministic order to prevent deadlocks
    FOR v_prod_id IN
      SELECT DISTINCT (COALESCE(elem->>'productId', elem->>'product_id'))::uuid
      FROM jsonb_array_elements(p_items) AS elem
      ORDER BY 1
    LOOP
      SELECT quantity INTO v_curr_qty
      FROM public.products
      WHERE id = v_prod_id
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Product with ID % not found.', v_prod_id;
      END IF;
    END LOOP;

    -- Aggregate requested quantities per product so duplicate line items cannot bypass stock checks
    FOR v_agg IN
      SELECT
        (COALESCE(elem->>'productId', elem->>'product_id'))::uuid AS product_id,
        SUM((COALESCE(elem->>'quantity', elem->>'qty'))::int) AS total_qty
      FROM jsonb_array_elements(p_items) AS elem
      GROUP BY 1
      ORDER BY 1
    LOOP
      SELECT quantity INTO v_curr_qty FROM public.products WHERE id = v_agg.product_id;

      IF v_curr_qty < v_agg.total_qty THEN
        RAISE EXCEPTION 'Insufficient stock for product ID %. Available: %, Requested: %',
          v_agg.product_id, v_curr_qty, v_agg.total_qty;
      END IF;
    END LOOP;
  END IF;

  INSERT INTO public.sales (
    invoice_number, customer_id, sale_date, subtotal, discount_amount,
    tax_amount, total_amount,
    status, notes, created_by, created_at, updated_at
  ) VALUES (
    p_invoice_number, p_customer_id, NOW(), v_calc_subtotal, v_effective_discount,
    v_effective_tax, p_total_amount,
    LOWER(COALESCE(p_status, 'completed')), p_notes, v_caller_id, NOW(), NOW()
  ) RETURNING id INTO v_sale_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_prod_id := (COALESCE(v_item->>'productId', v_item->>'product_id'))::uuid;
    v_qty := (COALESCE(v_item->>'quantity', v_item->>'qty'))::int;
    v_unit_price := (COALESCE(v_item->>'unitPrice', v_item->>'unit_price', v_item->>'unitCost', v_item->>'unit_cost'))::numeric;
    v_subtotal := ROUND(v_qty * v_unit_price, 2);

    INSERT INTO public.sale_items (sale_id, product_id, quantity, unit_price, subtotal, created_at)
    VALUES (v_sale_id, v_prod_id, v_qty, v_unit_price, v_subtotal, NOW());

    IF v_is_completed THEN
      SELECT quantity INTO v_curr_qty FROM public.products WHERE id = v_prod_id;
      IF v_curr_qty < v_qty THEN
        RAISE EXCEPTION 'Insufficient stock for product ID %.', v_prod_id;
      END IF;

      UPDATE public.products
      SET quantity = quantity - v_qty, updated_at = NOW()
      WHERE id = v_prod_id;

      INSERT INTO public.stock_movements (
        product_id, type, quantity, previous_stock, current_stock, reference_id, notes, created_by, created_at
      ) VALUES (
        v_prod_id, 'sale', -v_qty, v_curr_qty, v_curr_qty - v_qty, v_sale_id, 'POS Sale invoice #' || p_invoice_number, v_caller_id, NOW()
      );
    END IF;
  END LOOP;

  IF v_effective_paid > 0 THEN
    INSERT INTO public.payments (
      reference_number, payment_type, sale_id, purchase_id, amount,
      payment_date, payment_method, notes, created_by, created_at
    ) VALUES (
      'PAY-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM()*10000)::text, 4, '0'),
      'received', v_sale_id, NULL, LEAST(v_effective_paid, p_total_amount), NOW(),
      CASE
        WHEN LOWER(COALESCE(p_payment_method, 'cash')) LIKE '%card%' THEN 'card'
        WHEN LOWER(COALESCE(p_payment_method, 'cash')) LIKE '%bank%' THEN 'bank_transfer'
        WHEN LOWER(COALESCE(p_payment_method, 'cash')) IN ('mfs', 'mobile_money', 'mobile') THEN 'mobile_money'
        WHEN LOWER(COALESCE(p_payment_method, 'cash')) = 'cheque' THEN 'cheque'
        ELSE 'cash'
      END, 'Payment for invoice ' || p_invoice_number, v_caller_id, NOW()
    );
  END IF;

  SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
  FROM public.payments
  WHERE sale_id = v_sale_id
    AND purchase_id IS NULL
    AND payment_type = 'received';

  v_due_amount := GREATEST(0, p_total_amount - v_total_paid);
  v_payment_status := CASE
    WHEN v_total_paid >= p_total_amount THEN 'paid'
    WHEN v_total_paid > 0 THEN 'partial'
    ELSE 'unpaid'
  END;

  RETURN jsonb_build_object(
    'id', v_sale_id,
    'invoiceNumber', p_invoice_number,
    'totalAmount', p_total_amount,
    'paidAmount', v_total_paid,
    'dueAmount', v_due_amount,
    'paymentStatus', v_payment_status,
    'status', LOWER(COALESCE(p_status, 'completed'))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.update_sale_payment_transaction(
  p_sale_id uuid,
  p_total_amount numeric,
  p_new_payment_amount numeric,
  p_payment_method text,
  p_payment_date date,
  p_reference_number text,
  p_notes text,
  p_status text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_sale public.sales%ROWTYPE;
  v_previously_paid numeric;
  v_total_paid numeric;
  v_due_amount numeric;
  v_payment_status text;
  v_duplicate boolean := false;
BEGIN
  IF auth.uid() IS NULL AND COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized: Authentication required.';
  END IF;

  IF COALESCE(auth.role(), '') <> 'service_role'
     AND public.current_user_role() NOT IN ('admin', 'manager') THEN
    RAISE EXCEPTION 'Unauthorized: Only Admin or Manager can edit sales.';
  END IF;

  IF p_sale_id IS NULL THEN
    RAISE EXCEPTION 'Sale ID is required.';
  END IF;
  IF p_total_amount IS NULL OR p_total_amount < 0 THEN
    RAISE EXCEPTION 'Sale total must be a non-negative amount.';
  END IF;
  IF p_new_payment_amount IS NULL OR p_new_payment_amount < 0 THEN
    RAISE EXCEPTION 'New payment must be a non-negative amount.';
  END IF;
  IF p_new_payment_amount > 0
     AND NULLIF(BTRIM(p_reference_number), '') IS NULL THEN
    RAISE EXCEPTION 'A payment reference is required for retry-safe payment recording.';
  END IF;
  IF p_payment_method IS NULL
     OR p_payment_method NOT IN ('cash', 'card', 'bank_transfer', 'mobile_money') THEN
    RAISE EXCEPTION 'Unsupported payment method: %', p_payment_method;
  END IF;
  IF p_payment_date IS NULL THEN
    RAISE EXCEPTION 'Payment date is required.';
  END IF;
  IF LOWER(COALESCE(p_status, 'completed')) NOT IN ('draft', 'completed', 'cancelled', 'refunded') THEN
    RAISE EXCEPTION 'Unsupported sale status: %', p_status;
  END IF;

  SELECT * INTO v_sale
  FROM public.sales
  WHERE id = p_sale_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sale % was not found.', p_sale_id;
  END IF;

  SELECT COALESCE(SUM(amount), 0) INTO v_previously_paid
  FROM public.payments
  WHERE sale_id = p_sale_id
    AND purchase_id IS NULL
    AND payment_type = 'received';

  IF p_new_payment_amount > 0 THEN
    SELECT EXISTS (
      SELECT 1
      FROM public.payments
      WHERE sale_id = p_sale_id
        AND purchase_id IS NULL
        AND payment_type = 'received'
        AND reference_number = p_reference_number
    ) INTO v_duplicate;

    IF NOT v_duplicate THEN
      IF p_new_payment_amount > GREATEST(0, p_total_amount - v_previously_paid) THEN
        RAISE EXCEPTION 'New payment exceeds remaining due (%).',
          GREATEST(0, p_total_amount - v_previously_paid);
      END IF;

      INSERT INTO public.payments (
        sale_id,
        purchase_id,
        payment_type,
        amount,
        payment_method,
        payment_date,
        reference_number,
        notes,
        created_by
      ) VALUES (
        p_sale_id,
        NULL,
        'received',
        p_new_payment_amount,
        p_payment_method,
        p_payment_date,
        p_reference_number,
        'Additional payment for invoice ' || v_sale.invoice_number,
        auth.uid()
      );
    END IF;
  END IF;

  SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
  FROM public.payments
  WHERE sale_id = p_sale_id
    AND purchase_id IS NULL
    AND payment_type = 'received';

  v_due_amount := GREATEST(0, p_total_amount - v_total_paid);
  v_payment_status := CASE
    WHEN v_total_paid >= p_total_amount THEN 'paid'
    WHEN v_total_paid > 0 THEN 'partial'
    ELSE 'unpaid'
  END;

  UPDATE public.sales
  SET total_amount = p_total_amount,
      notes = COALESCE(p_notes, v_sale.notes),
      status = LOWER(COALESCE(p_status, v_sale.status)),
      updated_at = NOW()
  WHERE id = p_sale_id;

  RETURN jsonb_build_object(
    'id', p_sale_id,
    'totalPaid', v_total_paid,
    'dueAmount', v_due_amount,
    'paymentStatus', v_payment_status,
    'duplicate', v_duplicate
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.receive_purchase_goods_transaction(
  p_purchase_id uuid,
  p_user_id uuid
) RETURNS jsonb AS $$
DECLARE
  v_caller_id uuid;
  v_caller_role text;
  v_purchase RECORD;
  v_item RECORD;
  v_curr_qty int;
BEGIN
  IF auth.role() = 'authenticated' THEN
    v_caller_id := auth.uid();
    v_caller_role := public.current_user_role();
    IF v_caller_role NOT IN ('admin', 'manager') THEN
      RAISE EXCEPTION 'Unauthorized: Only Admin or Manager can confirm goods receipt.';
    END IF;
  ELSIF auth.role() = 'service_role' THEN
    v_caller_id := p_user_id;
  ELSE
    RAISE EXCEPTION 'Unauthorized: Authentication required.';
  END IF;

  SELECT * INTO v_purchase FROM public.purchases WHERE id = p_purchase_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Purchase order with ID % not found.', p_purchase_id;
  END IF;

  IF LOWER(v_purchase.status) = 'received' THEN
    RAISE EXCEPTION 'Purchase order #% has already been marked as received.', v_purchase.purchase_number;
  END IF;

  UPDATE public.purchases
  SET status = 'received', updated_at = NOW()
  WHERE id = p_purchase_id;

  FOR v_item IN
    SELECT * FROM public.purchase_items
    WHERE purchase_id = p_purchase_id
    ORDER BY product_id
  LOOP
    SELECT quantity INTO v_curr_qty FROM public.products WHERE id = v_item.product_id FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product with ID % not found.', v_item.product_id;
    END IF;

    UPDATE public.products
    SET quantity = quantity + v_item.quantity, updated_at = NOW()
    WHERE id = v_item.product_id;

    INSERT INTO public.stock_movements (
      product_id, type, quantity, previous_stock, current_stock, reference_id, notes, created_by, created_at
    ) VALUES (
      v_item.product_id, 'purchase', v_item.quantity, v_curr_qty, v_curr_qty + v_item.quantity,
      p_purchase_id, 'Goods received confirmation for PO #' || v_purchase.purchase_number, v_caller_id, NOW()
    );
  END LOOP;

  RETURN jsonb_build_object('id', p_purchase_id, 'status', 'received');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 8. Explicit Function Execute Permissions (least privilege)
REVOKE ALL ON FUNCTION public.current_user_role() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.protect_profile_role() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_auth_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.process_sale_transaction(text, uuid, numeric, numeric, numeric, numeric, numeric, text, text, text, uuid, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_sale_payment_transaction(uuid, numeric, numeric, text, date, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.receive_purchase_goods_transaction(uuid, uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.process_sale_transaction(text, uuid, numeric, numeric, numeric, numeric, numeric, text, text, text, uuid, jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_sale_payment_transaction(uuid, numeric, numeric, text, date, text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.receive_purchase_goods_transaction(uuid, uuid) TO authenticated, service_role;

COMMIT;

NOTIFY pgrst, 'reload schema';
