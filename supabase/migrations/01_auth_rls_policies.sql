-- ==============================================================================
-- StockWise Mini ERP - Supabase Auth, Profiles, RLS Policies, and Atomic RPCs
-- ==============================================================================

-- 1. Ensure Profiles has foreign key reference to auth.users safely
-- DO NOT automatically delete existing records. Check for orphaned records before adding FK constraint.
DO $$
BEGIN
  -- Backfill any existing auth users into public.profiles if they don't already exist (safe idempotent insert)
  INSERT INTO public.profiles (id, full_name, email, role, created_at, updated_at)
  SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1), 'Staff User'),
    u.email,
    'staff',
    NOW(),
    NOW()
  FROM auth.users u
  WHERE u.id NOT IN (SELECT id FROM public.profiles)
  ON CONFLICT (id) DO NOTHING;

  -- Ensure public.products has min_stock_level column if missing in live schema
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
      AND table_schema = 'public' 
      AND column_name = 'min_stock_level'
  ) THEN
    ALTER TABLE public.products ADD COLUMN min_stock_level numeric DEFAULT 5;
    RAISE NOTICE 'Added min_stock_level column to public.products.';
  END IF;

  -- Ensure public.products has barcode column if missing in live schema
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
      AND table_schema = 'public' 
      AND column_name = 'barcode'
  ) THEN
    ALTER TABLE public.products ADD COLUMN barcode text;
    RAISE NOTICE 'Added barcode column to public.products.';
  END IF;

  -- Ensure public.products has unit column if missing in live schema
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
      AND table_schema = 'public' 
      AND column_name = 'unit'
  ) THEN
    ALTER TABLE public.products ADD COLUMN unit text DEFAULT 'Pcs';
    RAISE NOTICE 'Added unit column to public.products.';
  END IF;

  -- Ensure public.products has status column if missing in live schema
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
      AND table_schema = 'public' 
      AND column_name = 'status'
  ) THEN
    ALTER TABLE public.products ADD COLUMN status text DEFAULT 'active';
    RAISE NOTICE 'Added status column to public.products.';
  END IF;

  -- Ensure public.payments has created_by column if missing in live schema
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' 
      AND table_schema = 'public' 
      AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added created_by column to public.payments.';
  END IF;

  -- Ensure public.purchases has created_by column if missing in live schema
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'purchases' 
      AND table_schema = 'public' 
      AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.purchases ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added created_by column to public.purchases.';
  END IF;

  -- Ensure public.sales has created_by column if missing in live schema
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sales' 
      AND table_schema = 'public' 
      AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.sales ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added created_by column to public.sales.';
  END IF;

  -- Ensure public.expenses has created_by column if missing in live schema
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'expenses' 
      AND table_schema = 'public' 
      AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.expenses ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added created_by column to public.expenses.';
  END IF;

  -- Ensure public.stock_movements has created_by column if missing in live schema
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stock_movements' 
      AND table_schema = 'public' 
      AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.stock_movements ADD COLUMN created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added created_by column to public.stock_movements.';
  END IF;

  -- Ensure public.suppliers has contact_person column if missing in live schema
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'suppliers' 
      AND table_schema = 'public' 
      AND column_name = 'contact_person'
  ) THEN
    ALTER TABLE public.suppliers ADD COLUMN contact_person text;
    RAISE NOTICE 'Added contact_person column to public.suppliers.';
  END IF;

  -- Ensure public.suppliers has balance column if missing in live schema
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'suppliers' 
      AND table_schema = 'public' 
      AND column_name = 'balance'
  ) THEN
    ALTER TABLE public.suppliers ADD COLUMN balance numeric DEFAULT 0;
    RAISE NOTICE 'Added balance column to public.suppliers.';
  END IF;


  -- Ensure purchases_status_check allows 'ordered', 'received', 'pending', 'cancelled'
  BEGIN
    ALTER TABLE public.purchases DROP CONSTRAINT IF EXISTS purchases_status_check;
    ALTER TABLE public.purchases ADD CONSTRAINT purchases_status_check 
      CHECK (status IN ('ordered', 'received', 'pending', 'cancelled'));
    RAISE NOTICE 'Updated purchases_status_check constraint.';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Notice: Could not modify purchases_status_check constraint: %', SQLERRM;
  END;

  -- Ensure sales_status_check allows 'draft', 'completed', 'cancelled', 'refunded'
  BEGIN
    ALTER TABLE public.sales DROP CONSTRAINT IF EXISTS sales_status_check;
    ALTER TABLE public.sales ADD CONSTRAINT sales_status_check 
      CHECK (status IN ('draft', 'completed', 'cancelled', 'refunded'));
    RAISE NOTICE 'Updated sales_status_check constraint.';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Notice: Could not modify sales_status_check constraint: %', SQLERRM;
  END;

  -- Keep the payment type allowlist aligned with the payments relationship check.
  BEGIN
    ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_payment_type_check;
    ALTER TABLE public.payments ADD CONSTRAINT payments_payment_type_check 
      CHECK (payment_type IN ('received', 'paid'));
    RAISE NOTICE 'Updated payments_payment_type_check constraint.';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Notice: Could not modify payments_payment_type_check constraint: %', SQLERRM;
  END;

  -- Ensure purchase_items has unit_price column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'purchase_items' 
      AND table_schema = 'public' 
      AND column_name = 'unit_price'
  ) THEN
    ALTER TABLE public.purchase_items ADD COLUMN unit_price numeric DEFAULT 0;
  END IF;

  -- Ensure sale_items has unit_price column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'sale_items' 
      AND table_schema = 'public' 
      AND column_name = 'unit_price'
  ) THEN
    ALTER TABLE public.sale_items ADD COLUMN unit_price numeric DEFAULT 0;
  END IF;

  -- Ensure customers has balance column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' 
      AND table_schema = 'public' 
      AND column_name = 'balance'
  ) THEN
    ALTER TABLE public.customers ADD COLUMN balance numeric DEFAULT 0;
  END IF;

  -- Add FK constraint only if all profiles map cleanly to auth.users
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_profiles_auth_users'
      AND table_name = 'profiles'
      AND table_schema = 'public'
  ) THEN
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id NOT IN (SELECT id FROM auth.users)) THEN
      RAISE NOTICE 'Safety Notice: Orphaned records found in public.profiles. Foreign key fk_profiles_auth_users was NOT added to preserve existing data. Please reconcile orphaned profiles manually.';
    ELSE
      ALTER TABLE public.profiles
      ADD CONSTRAINT fk_profiles_auth_users
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
      RAISE NOTICE 'Foreign key fk_profiles_auth_users successfully added.';
    END IF;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Foreign key check completed with notice: %', SQLERRM;
END $$;

-- 2. Trigger to automatically create or sync profile when auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'Staff User'),
    NEW.email,
    'staff', -- Never trust metadata for elevated privileges; defaults strictly to 'staff'
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 3. Prevent non-admin users from changing user roles (Privilege Escalation Protection)
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger AS $$
DECLARE
  v_caller_role text;
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- If service_role is executing (migrations or admin API), allow
    IF auth.role() = 'service_role' THEN
      RETURN NEW;
    END IF;

    -- If authenticated user is modifying their own row and their existing role is not admin, reject
    IF auth.uid() = OLD.id AND OLD.role != 'admin' THEN
      RAISE EXCEPTION 'Privilege escalation rejected: You cannot change your own role.';
    END IF;

    -- For an authenticated caller modifying another row, verify the caller has admin role
    SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
    IF COALESCE(v_caller_role, 'staff') != 'admin' THEN
      RAISE EXCEPTION 'Privilege escalation rejected: Only administrators can modify user roles.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trigger_protect_profile_role ON public.profiles;
CREATE TRIGGER trigger_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- 4. Helper function to check role of current user
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text AS $$
  SELECT COALESCE((SELECT role FROM public.profiles WHERE id = auth.uid()), 'staff');
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- 5. Enable Row Level Security (RLS) across all 12 ERP tables
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

-- 6. Table & Sequence Grants (Least Privilege)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant standard DML to authenticated role (All operations remain governed by RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Service role retains administrative access for background/system operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO service_role;

-- 7. RLS Policies

-- PROFILES
DROP POLICY IF EXISTS "Profiles are readable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are readable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);

-- Users can update their own profile (name, avatar, etc.); role changes are strictly halted by trigger_protect_profile_role
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile name and avatar" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

-- CATEGORIES
DROP POLICY IF EXISTS "Categories readable by authenticated" ON public.categories;
CREATE POLICY "Categories readable by authenticated"
  ON public.categories FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Categories editable by admin and manager" ON public.categories;
CREATE POLICY "Categories editable by admin and manager"
  ON public.categories FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager', 'staff'))
  WITH CHECK (public.current_user_role() IN ('admin', 'manager', 'staff'));

-- PRODUCTS
DROP POLICY IF EXISTS "Products readable by authenticated" ON public.products;
CREATE POLICY "Products readable by authenticated"
  ON public.products FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Products editable by admin and manager" ON public.products;
CREATE POLICY "Products editable by admin and manager"
  ON public.products FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager', 'staff'))
  WITH CHECK (public.current_user_role() IN ('admin', 'manager', 'staff'));

-- CUSTOMERS & SUPPLIERS
DROP POLICY IF EXISTS "Customers accessible by authenticated" ON public.customers;
CREATE POLICY "Customers accessible by authenticated"
  ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Suppliers accessible by authenticated" ON public.suppliers;
CREATE POLICY "Suppliers accessible by authenticated"
  ON public.suppliers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SALES & SALE ITEMS
DROP POLICY IF EXISTS "Sales accessible by authenticated" ON public.sales;
CREATE POLICY "Sales accessible by authenticated"
  ON public.sales FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Sale items accessible by authenticated" ON public.sale_items;
CREATE POLICY "Sale items accessible by authenticated"
  ON public.sale_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PURCHASES & PURCHASE ITEMS
DROP POLICY IF EXISTS "Purchases accessible by authenticated" ON public.purchases;
CREATE POLICY "Purchases accessible by authenticated"
  ON public.purchases FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Purchase items accessible by authenticated" ON public.purchase_items;
CREATE POLICY "Purchase items accessible by authenticated"
  ON public.purchase_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- STOCK MOVEMENTS
DROP POLICY IF EXISTS "Stock movements accessible by authenticated" ON public.stock_movements;
CREATE POLICY "Stock movements accessible by authenticated"
  ON public.stock_movements FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PAYMENTS & EXPENSES
DROP POLICY IF EXISTS "Payments accessible by authenticated" ON public.payments;
CREATE POLICY "Payments accessible by authenticated"
  ON public.payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Expenses viewable by authenticated" ON public.expenses;
CREATE POLICY "Expenses viewable by authenticated"
  ON public.expenses FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Expenses insertable by authenticated" ON public.expenses;
CREATE POLICY "Expenses insertable by authenticated"
  ON public.expenses FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Expenses editable by admin and manager only" ON public.expenses;
CREATE POLICY "Expenses editable by admin and manager only"
  ON public.expenses FOR UPDATE TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager', 'staff'))
  WITH CHECK (public.current_user_role() IN ('admin', 'manager', 'staff'));

DROP POLICY IF EXISTS "Expenses deletable by admin and manager only" ON public.expenses;
CREATE POLICY "Expenses deletable by admin and manager only"
  ON public.expenses FOR DELETE TO authenticated
  USING (public.current_user_role() IN ('admin', 'manager', 'staff'));

-- 8. Atomic Stored Procedures (RPCs) for Stock and Financial Consistency

-- Atomic Sale Transaction Function
-- Prevents deadlocks by sorting product IDs, prevents race conditions with FOR UPDATE,
-- guarantees rollback on stock exhaustion or constraint failures.
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
  v_prod_id uuid;
  v_qty int;
  v_unit_price numeric;
  v_subtotal numeric;
  v_curr_qty int;
  v_is_completed boolean;
BEGIN
  -- Authenticate caller and avoid user ID spoofing
  IF auth.role() = 'authenticated' THEN
    v_caller_id := auth.uid();
  ELSIF auth.role() = 'service_role' THEN
    v_caller_id := p_user_id;
  ELSE
    RAISE EXCEPTION 'Unauthorized: Authentication required.';
  END IF;

  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Sale transaction must include at least one item.';
  END IF;

  v_is_completed := (LOWER(COALESCE(p_status, 'completed')) = 'completed');

  -- 1. If completed, acquire locks on all products in deterministic order to prevent deadlocks
  IF v_is_completed THEN
    FOR v_prod_id IN 
      SELECT DISTINCT (COALESCE(elem->>'productId', elem->>'product_id'))::uuid 
      FROM jsonb_array_elements(p_items) AS elem 
      ORDER BY 1
    LOOP
      IF v_prod_id IS NULL THEN
        RAISE EXCEPTION 'Invalid product reference in sale items.';
      END IF;

      SELECT quantity INTO v_curr_qty 
      FROM public.products 
      WHERE id = v_prod_id 
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Product with ID % not found.', v_prod_id;
      END IF;
    END LOOP;

    -- Validate stock availability after locking
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
      v_prod_id := (COALESCE(v_item->>'productId', v_item->>'product_id'))::uuid;
      v_qty := (COALESCE(v_item->>'quantity', v_item->>'qty'))::int;

      IF v_qty IS NULL OR v_qty <= 0 THEN
        RAISE EXCEPTION 'Item quantity must be greater than zero for product ID %.', v_prod_id;
      END IF;
      
      SELECT quantity INTO v_curr_qty FROM public.products WHERE id = v_prod_id;

      IF v_curr_qty < v_qty THEN
        RAISE EXCEPTION 'Insufficient stock for product ID %. Available: %, Requested: %', v_prod_id, v_curr_qty, v_qty;
      END IF;
    END LOOP;
  END IF;

  -- 2. Insert into sales
  INSERT INTO public.sales (
    invoice_number, customer_id, sale_date, subtotal, discount_amount, 
    tax_amount, total_amount,
    status, notes, created_by, created_at, updated_at
  ) VALUES (
    p_invoice_number, p_customer_id, NOW(), p_subtotal, p_discount_amount,
    p_tax_amount, p_total_amount,
    LOWER(COALESCE(p_status, 'completed')), p_notes, v_caller_id, NOW(), NOW()
  ) RETURNING id INTO v_sale_id;

  -- 3. Insert sale items & deduct stock atomically
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_prod_id := (COALESCE(v_item->>'productId', v_item->>'product_id'))::uuid;
    v_qty := (COALESCE(v_item->>'quantity', v_item->>'qty'))::int;
    v_unit_price := (COALESCE(v_item->>'unitPrice', v_item->>'unit_price', v_item->>'unitCost', v_item->>'unit_cost'))::numeric;
    v_subtotal := COALESCE((v_item->>'subtotal')::numeric, v_qty * v_unit_price);

    INSERT INTO public.sale_items (sale_id, product_id, quantity, unit_price, subtotal, created_at)
    VALUES (v_sale_id, v_prod_id, v_qty, v_unit_price, v_subtotal, NOW());

    IF v_is_completed THEN
      SELECT quantity INTO v_curr_qty FROM public.products WHERE id = v_prod_id;
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

  -- 4. Insert the initial Sales payment, if provided.
  IF COALESCE(p_paid_amount, 0) > 0 THEN
    INSERT INTO public.payments (
      reference_number, payment_type, sale_id, purchase_id, amount,
      payment_date, payment_method, notes, created_by, created_at
    ) VALUES (
      'PAY-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM()*10000)::text, 4, '0'),
      'received', v_sale_id, NULL, p_paid_amount, NOW(),
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

-- Atomically apply a Sales edit and any additional payment. The payment
-- reference is the request idempotency key; locking the sale serializes retries.
-- Install the Sales edit/payment RPC with the exact named parameters used by
-- apps/web/src/services/sales.service.ts. This also replaces the earlier
-- implementation that referenced payments.customer_id, which is not present
-- in the verified payments schema.
DROP FUNCTION IF EXISTS public.update_sale_payment_transaction(
  uuid, numeric, numeric, text, date, text, text, text
);

CREATE FUNCTION public.update_sale_payment_transaction(
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

  IF public.current_user_role() NOT IN ('admin', 'manager', 'staff') THEN
    RAISE EXCEPTION 'Unauthorized: Sales payment update is not permitted.';
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

  -- Lock serializes concurrent edits/retries for this sale; the entire RPC
  -- (payment insert plus sale update) commits or rolls back as one transaction.
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

-- Atomic Goods Receipt Transaction Function
-- Requires admin or manager role, locks purchase and products in order,
-- and prevents duplicate goods receipts.
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
  -- Authenticate caller role: admin, manager, or staff can receive goods
  IF auth.role() = 'authenticated' THEN
    v_caller_id := auth.uid();
    SELECT role INTO v_caller_role FROM public.profiles WHERE id = v_caller_id;
    IF COALESCE(v_caller_role, 'staff') NOT IN ('admin', 'manager', 'staff') THEN
      RAISE EXCEPTION 'Unauthorized: Only store staff can confirm goods receipt.';
    END IF;
  ELSIF auth.role() = 'service_role' THEN
    v_caller_id := p_user_id;
  ELSE
    RAISE EXCEPTION 'Unauthorized: Authentication required.';
  END IF;

  -- Lock purchase row to prevent concurrent receipt execution
  SELECT * INTO v_purchase FROM public.purchases WHERE id = p_purchase_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Purchase order with ID % not found.', p_purchase_id;
  END IF;

  IF LOWER(v_purchase.status) = 'received' THEN
    RAISE EXCEPTION 'Purchase order #% has already been marked as received.', v_purchase.purchase_number;
  END IF;

  -- Update status to received
  UPDATE public.purchases 
  SET status = 'received', updated_at = NOW() 
  WHERE id = p_purchase_id;

  -- Lock products in deterministic order and increase stock atomically
  FOR v_item IN 
    SELECT * FROM public.purchase_items 
    WHERE purchase_id = p_purchase_id 
    ORDER BY product_id
  LOOP
    SELECT quantity INTO v_curr_qty FROM public.products WHERE id = v_item.product_id FOR UPDATE;

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

-- 9. Explicit Routine Execute Permissions
-- Target explicitly our specific created functions only to avoid affecting extensions or other functions in public schema
REVOKE EXECUTE ON FUNCTION public.current_user_role() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.process_sale_transaction(text, uuid, numeric, numeric, numeric, numeric, numeric, text, text, text, uuid, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_sale_payment_transaction(uuid, numeric, numeric, text, date, text, text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.receive_purchase_goods_transaction(uuid, uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.process_sale_transaction(text, uuid, numeric, numeric, numeric, numeric, numeric, text, text, text, uuid, jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_sale_payment_transaction(uuid, numeric, numeric, text, date, text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.receive_purchase_goods_transaction(uuid, uuid) TO authenticated, service_role;

-- Refresh PostgREST after this SQL file installs or updates exposed routines.

NOTIFY pgrst, 'reload schema';
