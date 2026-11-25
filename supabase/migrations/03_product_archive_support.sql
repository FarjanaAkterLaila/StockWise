-- ==============================================================================
-- StockWise Mini ERP: Migration 03 - Product Soft Delete & Atomic Creation RPC
-- Non-destructive, idempotent migration.
-- Preserves all foreign keys and historical purchase_items, sale_items,
-- stock_movements, sales, purchases, and payments.
-- ==============================================================================

BEGIN;

-- 1. Ensure products.status exists, normalize values, and enforce valid statuses
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS status text;

UPDATE public.products
SET status = CASE
  WHEN lower(btrim(status)) IN ('active', 'inactive', 'archived') THEN lower(btrim(status))
  ELSE 'active'
END
WHERE status IS NULL
   OR status <> lower(btrim(status))
   OR lower(btrim(status)) NOT IN ('active', 'inactive', 'archived');

ALTER TABLE public.products
  ALTER COLUMN status SET DEFAULT 'active';

ALTER TABLE public.products
  ALTER COLUMN status SET NOT NULL;

DO $$
DECLARE
  v_constraint record;
BEGIN
  FOR v_constraint IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'products'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) ILIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE public.products DROP CONSTRAINT IF EXISTS %I', v_constraint.conname);
  END LOOP;
END $$;

ALTER TABLE public.products
  ADD CONSTRAINT products_status_check
  CHECK (status IN ('active', 'inactive', 'archived'));

-- 2. Optional archive timestamp metadata
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS archived_at timestamptz;

UPDATE public.products
SET archived_at = COALESCE(archived_at, now())
WHERE status = 'archived' AND archived_at IS NULL;

UPDATE public.products
SET archived_at = NULL
WHERE status <> 'archived' AND archived_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_status ON public.products (status);

-- 3. Enforce database-level Soft Delete ONLY (block all permanent product deletes,
--    including unreferenced products; PostgreSQL transaction ROLLBACK on failed
--    product creation works automatically inside transactions without DELETE).
DROP POLICY IF EXISTS "Products deletable by admin" ON public.products;

DROP TRIGGER IF EXISTS trg_prevent_referenced_product_delete ON public.products;
DROP TRIGGER IF EXISTS trg_prevent_product_hard_delete ON public.products;
DROP FUNCTION IF EXISTS public.prevent_referenced_product_delete();

CREATE OR REPLACE FUNCTION public.prevent_product_hard_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RAISE EXCEPTION
    'Permanent deletion of product "%" (%) is disabled. Use Soft Delete (status = ''archived'') instead.',
    OLD.name,
    OLD.id
    USING ERRCODE = '42501';
END;
$$;

CREATE TRIGGER trg_prevent_product_hard_delete
  BEFORE DELETE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_product_hard_delete();

-- 4. Atomic product creation + opening stock movement RPC
--    Inserts product and (if p_stock_quantity > 0) initial 'stock_in' stock_movements
--    row in one database transaction so any failure rolls back both cleanly.
--    Detects live stock_movements columns (movement_type vs type, etc.) cleanly.
CREATE OR REPLACE FUNCTION public.create_product_with_opening_stock(
  p_name text,
  p_sku text,
  p_barcode text,
  p_category_id uuid,
  p_cost_price numeric,
  p_selling_price numeric,
  p_stock_quantity integer,
  p_min_stock_level integer,
  p_unit text,
  p_status text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id uuid;
  v_caller_role text;
  v_name text;
  v_sku text;
  v_barcode text;
  v_cost_price numeric;
  v_selling_price numeric;
  v_stock_qty int;
  v_min_stock int;
  v_unit text;
  v_status text;
  v_archived_at timestamptz;
  v_has_purchase_price boolean;
  v_has_cost_price boolean;
  v_product_id uuid;
  v_sm_cols text[];
  v_sm_insert_cols text;
  v_sm_insert_vals text;
BEGIN
  IF COALESCE(auth.role(), '') = 'authenticated' THEN
    v_caller_id := auth.uid();
    v_caller_role := public.current_user_role();
    IF v_caller_id IS NULL
       OR COALESCE(v_caller_role, '') NOT IN ('admin', 'manager') THEN
      RAISE EXCEPTION 'Unauthorized: Only Admin or Manager can create products.';
    END IF;
  ELSIF COALESCE(auth.role(), '') = 'service_role' THEN
    v_caller_id := NULL;
  ELSE
    RAISE EXCEPTION 'Unauthorized: Authentication required.';
  END IF;

  v_name := COALESCE(NULLIF(BTRIM(p_name), ''), 'Untitled Product');
  v_sku := NULLIF(BTRIM(p_sku), '');
  v_barcode := NULLIF(BTRIM(p_barcode), '');
  v_cost_price := COALESCE(p_cost_price, 0);
  v_selling_price := COALESCE(p_selling_price, 0);
  v_stock_qty := COALESCE(p_stock_quantity, 0);
  v_min_stock := COALESCE(p_min_stock_level, 5);
  v_unit := COALESCE(NULLIF(BTRIM(p_unit), ''), 'Pcs');
  v_status := LOWER(BTRIM(COALESCE(NULLIF(p_status, ''), 'active')));

  IF v_cost_price < 0 OR v_selling_price < 0 THEN
    RAISE EXCEPTION 'Product prices must be non-negative.';
  END IF;
  IF v_stock_qty < 0 OR v_min_stock < 0 THEN
    RAISE EXCEPTION 'Stock quantities must be non-negative.';
  END IF;
  IF v_status NOT IN ('active', 'inactive', 'archived') THEN
    RAISE EXCEPTION 'Unsupported product status: %', p_status;
  END IF;

  v_archived_at := CASE WHEN v_status = 'archived' THEN NOW() ELSE NULL END;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'purchase_price'
  ) INTO v_has_purchase_price;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'cost_price'
  ) INTO v_has_cost_price;

  IF v_has_purchase_price AND v_has_cost_price THEN
    INSERT INTO public.products (
      name, sku, barcode, category_id, purchase_price, cost_price,
      selling_price, quantity, min_stock_level, unit, status, archived_at,
      created_at, updated_at
    ) VALUES (
      v_name, v_sku, v_barcode, p_category_id, v_cost_price, v_cost_price,
      v_selling_price, v_stock_qty, v_min_stock, v_unit, v_status, v_archived_at,
      NOW(), NOW()
    ) RETURNING id INTO v_product_id;
  ELSIF v_has_purchase_price THEN
    INSERT INTO public.products (
      name, sku, barcode, category_id, purchase_price,
      selling_price, quantity, min_stock_level, unit, status, archived_at,
      created_at, updated_at
    ) VALUES (
      v_name, v_sku, v_barcode, p_category_id, v_cost_price,
      v_selling_price, v_stock_qty, v_min_stock, v_unit, v_status, v_archived_at,
      NOW(), NOW()
    ) RETURNING id INTO v_product_id;
  ELSIF v_has_cost_price THEN
    INSERT INTO public.products (
      name, sku, barcode, category_id, cost_price,
      selling_price, quantity, min_stock_level, unit, status, archived_at,
      created_at, updated_at
    ) VALUES (
      v_name, v_sku, v_barcode, p_category_id, v_cost_price,
      v_selling_price, v_stock_qty, v_min_stock, v_unit, v_status, v_archived_at,
      NOW(), NOW()
    ) RETURNING id INTO v_product_id;
  ELSE
    RAISE EXCEPTION 'Products cost column (purchase_price or cost_price) not found.';
  END IF;

  IF v_stock_qty > 0 THEN
    SELECT ARRAY_AGG(column_name::text)
    INTO v_sm_cols
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'stock_movements';

    IF NOT ('movement_type' = ANY(COALESCE(v_sm_cols, ARRAY[]::text[]))
            OR 'type' = ANY(COALESCE(v_sm_cols, ARRAY[]::text[]))) THEN
      RAISE EXCEPTION 'Column "movement_type" or "type" not found on public.stock_movements.';
    END IF;

    v_sm_insert_cols := 'product_id, quantity';
    v_sm_insert_vals := quote_literal(v_product_id::text) || '::uuid, ' || v_stock_qty::text;

    IF 'movement_type' = ANY(v_sm_cols) THEN
      v_sm_insert_cols := v_sm_insert_cols || ', movement_type';
      v_sm_insert_vals := v_sm_insert_vals || ', ''stock_in''';
    END IF;
    IF 'type' = ANY(v_sm_cols) THEN
      v_sm_insert_cols := v_sm_insert_cols || ', type';
      v_sm_insert_vals := v_sm_insert_vals || ', ''stock_in''';
    END IF;
    IF 'previous_stock' = ANY(v_sm_cols) THEN
      v_sm_insert_cols := v_sm_insert_cols || ', previous_stock';
      v_sm_insert_vals := v_sm_insert_vals || ', 0';
    END IF;
    IF 'current_stock' = ANY(v_sm_cols) THEN
      v_sm_insert_cols := v_sm_insert_cols || ', current_stock';
      v_sm_insert_vals := v_sm_insert_vals || ', ' || v_stock_qty::text;
    END IF;
    IF 'reference_id' = ANY(v_sm_cols) THEN
      v_sm_insert_cols := v_sm_insert_cols || ', reference_id';
      v_sm_insert_vals := v_sm_insert_vals || ', NULL::uuid';
    END IF;
    IF 'reference_type' = ANY(v_sm_cols) THEN
      v_sm_insert_cols := v_sm_insert_cols || ', reference_type';
      v_sm_insert_vals := v_sm_insert_vals || ', ''manual''';
    END IF;
    IF 'notes' = ANY(v_sm_cols) THEN
      v_sm_insert_cols := v_sm_insert_cols || ', notes';
      v_sm_insert_vals := v_sm_insert_vals || ', ' || quote_nullable('Initial opening stock for ' || v_name);
    END IF;
    IF 'created_by' = ANY(v_sm_cols) THEN
      v_sm_insert_cols := v_sm_insert_cols || ', created_by';
      v_sm_insert_vals := v_sm_insert_vals || ', ' || quote_nullable(v_caller_id::text) || '::uuid';
    END IF;
    IF 'created_at' = ANY(v_sm_cols) THEN
      v_sm_insert_cols := v_sm_insert_cols || ', created_at';
      v_sm_insert_vals := v_sm_insert_vals || ', NOW()';
    END IF;

    EXECUTE 'INSERT INTO public.stock_movements (' || v_sm_insert_cols || ') VALUES (' || v_sm_insert_vals || ')';
  END IF;

  RETURN jsonb_build_object(
    'id', v_product_id,
    'name', v_name,
    'sku', COALESCE(v_sku, ''),
    'barcode', COALESCE(v_barcode, ''),
    'costPrice', v_cost_price,
    'sellingPrice', v_selling_price,
    'stockQuantity', v_stock_qty,
    'minStockLevel', v_min_stock,
    'unit', v_unit,
    'status', v_status
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_product_with_opening_stock(
  text, text, text, uuid, numeric, numeric, integer, integer, text, text
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.create_product_with_opening_stock(
  text, text, text, uuid, numeric, numeric, integer, integer, text, text
) TO authenticated, service_role;

COMMIT;

NOTIFY pgrst, 'reload schema';
