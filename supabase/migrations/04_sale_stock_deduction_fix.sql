-- ==============================================================================
-- StockWise Mini ERP: Migration 04 - Consolidated Purchase & Sale Stock Sync Fix
-- Non-destructive, idempotent schema/RPC migration.
-- Compatible with migrations 01, 02, and 03.
-- Does NOT modify existing sales, purchases, payments, or product stock rows.
--
-- Schema compatibility:
--   All reads/writes across stock_movements, purchases, products, sales,
--   sale_items, and payments resolve existing non-generated columns via
--   information_schema.columns so RPCs never fail on optional or differing
--   live-schema columns (e.g. movement_type vs type, reference_id, subtotal,
--   discount_amount, tax_amount, payment_status, updated_at, customer_id).
--
-- Guarantees:
--   1. receive_purchase_goods_transaction() is atomic, retry-safe against
--      duplicate receipts (via status + stock_movements ledger checks), locks
--      purchase & products in deterministic order, aggregates duplicate lines,
--      increases stock regardless of payment status, and writes 'stock_in' rows.
--   2. process_sale_transaction() deducts stock immediately for 'completed'
--      sales regardless of payment status, aggregates duplicate lines, and
--      records 'stock_out' rows in stock_movements.
--   3. update_sale_payment_transaction() computes net stock movements PER
--      PRODUCT on sale_items:
--        - Payment updates on an already-'completed' sale NEVER deduct stock.
--        - Transitioning non-'completed' -> 'completed' deducts only the
--          remaining undeducted quantity per product (GREATEST(0, sold - net)).
--        - Transitioning 'completed' -> 'cancelled'/'refunded' restores only
--          each product's actual outstanding net deduction via 'stock_in'.
--        - Repeated transitions never over-deduct or over-restore stock.
-- ==============================================================================

BEGIN;

-- Ensure stock_movements.reference_id exists safely (non-destructive) so
-- purchase receipt & per-product sale ledger checks work reliably even if the
-- live table omitted reference_id originally; all queries below also guard on
-- 'reference_id' = ANY(v_sm_cols) for runtime safety.
ALTER TABLE public.stock_movements
  ADD COLUMN IF NOT EXISTS reference_id uuid;

CREATE INDEX IF NOT EXISTS idx_stock_movements_reference_id
  ON public.stock_movements (reference_id);

CREATE OR REPLACE FUNCTION public.receive_purchase_goods_transaction(
  p_purchase_id uuid,
  p_user_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id uuid;
  v_caller_role text;
  v_purchase RECORD;
  v_item RECORD;
  v_curr_qty int;
  v_purchase_cols text[];
  v_purchase_set_sql text;
  v_prod_cols text[];
  v_prod_qty_col text;
  v_prod_set_sql text;
  v_sm_cols text[];
  v_mov_col text;
  v_has_existing_move boolean;
  v_sm_insert_cols text;
  v_sm_insert_vals text;
BEGIN
  IF COALESCE(auth.role(), '') = 'authenticated' THEN
    v_caller_id := auth.uid();
    v_caller_role := public.current_user_role();
    IF v_caller_id IS NULL
       OR COALESCE(v_caller_role, '') NOT IN ('admin', 'manager') THEN
      RAISE EXCEPTION 'Unauthorized: Only Admin or Manager can confirm goods receipt.';
    END IF;
  ELSIF COALESCE(auth.role(), '') = 'service_role' THEN
    v_caller_id := p_user_id;
  ELSE
    RAISE EXCEPTION 'Unauthorized: Authentication required.';
  END IF;

  SELECT * INTO v_purchase
  FROM public.purchases
  WHERE id = p_purchase_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Purchase order with ID % not found.', p_purchase_id;
  END IF;

  SELECT COALESCE(ARRAY_AGG(column_name::text), ARRAY[]::text[])
  INTO v_sm_cols
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'stock_movements'
    AND COALESCE(is_generated, 'NEVER') = 'NEVER';

  IF 'movement_type' = ANY(v_sm_cols) THEN
    v_mov_col := 'movement_type';
  ELSIF 'type' = ANY(v_sm_cols) THEN
    v_mov_col := 'type';
  ELSE
    RAISE EXCEPTION 'Column "movement_type" or "type" not found on public.stock_movements.';
  END IF;

  v_has_existing_move := false;
  IF 'reference_id' = ANY(v_sm_cols) THEN
    EXECUTE format(
      'SELECT EXISTS (SELECT 1 FROM public.stock_movements WHERE reference_id = $1 AND %I = ''stock_in'')',
      v_mov_col
    )
    INTO v_has_existing_move
    USING p_purchase_id;
  END IF;

  IF LOWER(COALESCE(v_purchase.status, '')) = 'received' OR v_has_existing_move THEN
    RAISE EXCEPTION 'Purchase order #% has already been marked as received.', v_purchase.purchase_number;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.purchase_items
    WHERE purchase_id = p_purchase_id
  ) THEN
    RAISE EXCEPTION 'Purchase order #% has no line items to receive.', v_purchase.purchase_number;
  END IF;

  SELECT COALESCE(ARRAY_AGG(column_name::text), ARRAY[]::text[])
  INTO v_purchase_cols
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'purchases'
    AND COALESCE(is_generated, 'NEVER') = 'NEVER';

  SELECT COALESCE(ARRAY_AGG(column_name::text), ARRAY[]::text[])
  INTO v_prod_cols
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'products'
    AND COALESCE(is_generated, 'NEVER') = 'NEVER';

  IF 'quantity' = ANY(v_prod_cols) THEN
    v_prod_qty_col := 'quantity';
  ELSIF 'stock_quantity' = ANY(v_prod_cols) THEN
    v_prod_qty_col := 'stock_quantity';
  ELSE
    RAISE EXCEPTION 'Column "quantity" or "stock_quantity" not found on public.products.';
  END IF;

  v_caller_id := COALESCE(v_caller_id, v_purchase.created_by);

  v_purchase_set_sql := 'status = ''received''';
  IF 'updated_at' = ANY(v_purchase_cols) THEN
    v_purchase_set_sql := v_purchase_set_sql || ', updated_at = NOW()';
  END IF;
  EXECUTE 'UPDATE public.purchases SET ' || v_purchase_set_sql || ' WHERE id = $1'
  USING p_purchase_id;

  -- Aggregate duplicate product lines and lock in deterministic product_id order
  FOR v_item IN
    SELECT
      product_id,
      SUM(quantity)::int AS total_qty
    FROM public.purchase_items
    WHERE purchase_id = p_purchase_id
    GROUP BY product_id
    ORDER BY product_id
  LOOP
    IF v_item.total_qty IS NULL OR v_item.total_qty <= 0 THEN
      RAISE EXCEPTION 'Invalid quantity in purchase order #% for product %.',
        v_purchase.purchase_number, v_item.product_id;
    END IF;

    PERFORM 1
    FROM public.products
    WHERE id = v_item.product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product with ID % not found.', v_item.product_id;
    END IF;

    EXECUTE format(
      'SELECT COALESCE(%I, 0)::int FROM public.products WHERE id = $1',
      v_prod_qty_col
    )
    INTO v_curr_qty
    USING v_item.product_id;

    v_prod_set_sql := format('%I = COALESCE(%I, 0) + $1', v_prod_qty_col, v_prod_qty_col);
    IF 'updated_at' = ANY(v_prod_cols) THEN
      v_prod_set_sql := v_prod_set_sql || ', updated_at = NOW()';
    END IF;
    EXECUTE 'UPDATE public.products SET ' || v_prod_set_sql || ' WHERE id = $2'
    USING v_item.total_qty, v_item.product_id;

    v_sm_insert_cols := 'product_id, quantity';
    v_sm_insert_vals := quote_literal(v_item.product_id::text) || '::uuid, ' || v_item.total_qty::text;

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
      v_sm_insert_vals := v_sm_insert_vals || ', ' || v_curr_qty::text;
    END IF;
    IF 'current_stock' = ANY(v_sm_cols) THEN
      v_sm_insert_cols := v_sm_insert_cols || ', current_stock';
      v_sm_insert_vals := v_sm_insert_vals || ', ' || (v_curr_qty + v_item.total_qty)::text;
    END IF;
    IF 'reference_id' = ANY(v_sm_cols) THEN
      v_sm_insert_cols := v_sm_insert_cols || ', reference_id';
      v_sm_insert_vals := v_sm_insert_vals || ', ' || quote_literal(p_purchase_id::text) || '::uuid';
    END IF;
    IF 'reference_type' = ANY(v_sm_cols) THEN
      v_sm_insert_cols := v_sm_insert_cols || ', reference_type';
      v_sm_insert_vals := v_sm_insert_vals || ', ''purchase''';
    END IF;
    IF 'notes' = ANY(v_sm_cols) THEN
      v_sm_insert_cols := v_sm_insert_cols || ', notes';
      v_sm_insert_vals := v_sm_insert_vals || ', ' || quote_nullable('Goods received confirmation for PO #' || v_purchase.purchase_number);
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
  END LOOP;

  RETURN jsonb_build_object('id', p_purchase_id, 'status', 'received');
END;
$$;

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
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id uuid;
  v_sale_id uuid;
  v_norm_payment_method text;
  v_initial_paid numeric;
  v_initial_due numeric;
  v_initial_payment_status text;
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
  v_prod_cols text[];
  v_prod_qty_col text;
  v_prod_set_sql text;
  v_sales_cols text[];
  v_si_cols text[];
  v_pay_cols text[];
  v_sales_insert_cols text;
  v_sales_insert_vals text;
  v_si_insert_cols text;
  v_si_insert_vals text;
  v_pay_insert_cols text;
  v_pay_insert_vals text;
  v_pay_ref text;
  v_sm_cols text[];
  v_sm_insert_cols text;
  v_sm_insert_vals text;
BEGIN
  IF COALESCE(auth.role(), '') = 'authenticated' THEN
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL
       OR COALESCE(public.current_user_role(), '') NOT IN ('admin', 'manager', 'staff') THEN
      RAISE EXCEPTION 'Unauthorized: Active ERP role required to process sales.';
    END IF;
  ELSIF COALESCE(auth.role(), '') = 'service_role' THEN
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

  v_norm_payment_method := CASE
    WHEN LOWER(COALESCE(p_payment_method, 'cash')) LIKE '%card%' THEN 'card'
    WHEN LOWER(COALESCE(p_payment_method, 'cash')) LIKE '%bank%' THEN 'bank_transfer'
    WHEN LOWER(COALESCE(p_payment_method, 'cash')) IN ('mfs', 'mobile_money', 'mobile') THEN 'mobile_money'
    WHEN LOWER(COALESCE(p_payment_method, 'cash')) = 'cheque' THEN 'cheque'
    ELSE 'cash'
  END;

  v_initial_paid := LEAST(v_effective_paid, p_total_amount);
  v_initial_due := GREATEST(0, p_total_amount - v_initial_paid);
  v_initial_payment_status := CASE
    WHEN v_initial_paid >= p_total_amount THEN 'paid'
    WHEN v_initial_paid > 0 THEN 'partial'
    ELSE 'unpaid'
  END;

  v_is_completed := (LOWER(COALESCE(p_status, 'completed')) = 'completed');

  IF v_is_completed THEN
    SELECT COALESCE(ARRAY_AGG(column_name::text), ARRAY[]::text[])
    INTO v_sm_cols
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'stock_movements'
      AND COALESCE(is_generated, 'NEVER') = 'NEVER';

    IF NOT ('movement_type' = ANY(v_sm_cols) OR 'type' = ANY(v_sm_cols)) THEN
      RAISE EXCEPTION 'Column "movement_type" or "type" not found on public.stock_movements.';
    END IF;

    SELECT COALESCE(ARRAY_AGG(column_name::text), ARRAY[]::text[])
    INTO v_prod_cols
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND COALESCE(is_generated, 'NEVER') = 'NEVER';

    IF 'quantity' = ANY(v_prod_cols) THEN
      v_prod_qty_col := 'quantity';
    ELSIF 'stock_quantity' = ANY(v_prod_cols) THEN
      v_prod_qty_col := 'stock_quantity';
    ELSE
      RAISE EXCEPTION 'Column "quantity" or "stock_quantity" not found on public.products.';
    END IF;

    -- Lock distinct products in deterministic order before validating aggregate quantities
    FOR v_prod_id IN
      SELECT DISTINCT (COALESCE(elem->>'productId', elem->>'product_id'))::uuid
      FROM jsonb_array_elements(p_items) AS elem
      ORDER BY 1
    LOOP
      PERFORM 1
      FROM public.products
      WHERE id = v_prod_id
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Product with ID % not found.', v_prod_id;
      END IF;
    END LOOP;

    FOR v_agg IN
      SELECT
        (COALESCE(elem->>'productId', elem->>'product_id'))::uuid AS product_id,
        SUM((COALESCE(elem->>'quantity', elem->>'qty'))::int) AS total_qty
      FROM jsonb_array_elements(p_items) AS elem
      GROUP BY 1
      ORDER BY 1
    LOOP
      EXECUTE format(
        'SELECT COALESCE(%I, 0)::int FROM public.products WHERE id = $1',
        v_prod_qty_col
      )
      INTO v_curr_qty
      USING v_agg.product_id;

      IF v_curr_qty < v_agg.total_qty THEN
        RAISE EXCEPTION 'Insufficient stock for product ID %. Available: %, Requested: %',
          v_agg.product_id, v_curr_qty, v_agg.total_qty;
      END IF;
    END LOOP;
  END IF;

  SELECT COALESCE(ARRAY_AGG(column_name::text), ARRAY[]::text[])
  INTO v_sales_cols
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'sales'
    AND COALESCE(is_generated, 'NEVER') = 'NEVER';

  SELECT COALESCE(ARRAY_AGG(column_name::text), ARRAY[]::text[])
  INTO v_si_cols
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'sale_items'
    AND COALESCE(is_generated, 'NEVER') = 'NEVER';

  v_sales_insert_cols := 'invoice_number';
  v_sales_insert_vals := quote_literal(p_invoice_number);

  IF 'customer_id' = ANY(v_sales_cols) THEN
    v_sales_insert_cols := v_sales_insert_cols || ', customer_id';
    v_sales_insert_vals := v_sales_insert_vals || ', ' || quote_nullable(p_customer_id::text) || '::uuid';
  END IF;
  IF 'sale_date' = ANY(v_sales_cols) THEN
    v_sales_insert_cols := v_sales_insert_cols || ', sale_date';
    v_sales_insert_vals := v_sales_insert_vals || ', NOW()';
  END IF;
  IF 'subtotal' = ANY(v_sales_cols) THEN
    v_sales_insert_cols := v_sales_insert_cols || ', subtotal';
    v_sales_insert_vals := v_sales_insert_vals || ', ' || v_calc_subtotal::text;
  ELSIF 'sub_total' = ANY(v_sales_cols) THEN
    v_sales_insert_cols := v_sales_insert_cols || ', sub_total';
    v_sales_insert_vals := v_sales_insert_vals || ', ' || v_calc_subtotal::text;
  END IF;
  IF 'discount_amount' = ANY(v_sales_cols) THEN
    v_sales_insert_cols := v_sales_insert_cols || ', discount_amount';
    v_sales_insert_vals := v_sales_insert_vals || ', ' || v_effective_discount::text;
  ELSIF 'discount' = ANY(v_sales_cols) THEN
    v_sales_insert_cols := v_sales_insert_cols || ', discount';
    v_sales_insert_vals := v_sales_insert_vals || ', ' || v_effective_discount::text;
  END IF;
  IF 'tax_amount' = ANY(v_sales_cols) THEN
    v_sales_insert_cols := v_sales_insert_cols || ', tax_amount';
    v_sales_insert_vals := v_sales_insert_vals || ', ' || v_effective_tax::text;
  ELSIF 'vat_amount' = ANY(v_sales_cols) THEN
    v_sales_insert_cols := v_sales_insert_cols || ', vat_amount';
    v_sales_insert_vals := v_sales_insert_vals || ', ' || v_effective_tax::text;
  ELSIF 'tax' = ANY(v_sales_cols) THEN
    v_sales_insert_cols := v_sales_insert_cols || ', tax';
    v_sales_insert_vals := v_sales_insert_vals || ', ' || v_effective_tax::text;
  END IF;
  IF 'total_amount' = ANY(v_sales_cols) THEN
    v_sales_insert_cols := v_sales_insert_cols || ', total_amount';
    v_sales_insert_vals := v_sales_insert_vals || ', ' || p_total_amount::text;
  ELSIF 'grand_total' = ANY(v_sales_cols) THEN
    v_sales_insert_cols := v_sales_insert_cols || ', grand_total';
    v_sales_insert_vals := v_sales_insert_vals || ', ' || p_total_amount::text;
  ELSIF 'total' = ANY(v_sales_cols) THEN
    v_sales_insert_cols := v_sales_insert_cols || ', total';
    v_sales_insert_vals := v_sales_insert_vals || ', ' || p_total_amount::text;
  END IF;
  IF 'paid_amount' = ANY(v_sales_cols) THEN
    v_sales_insert_cols := v_sales_insert_cols || ', paid_amount';
    v_sales_insert_vals := v_sales_insert_vals || ', ' || v_initial_paid::text;
  END IF;
  IF 'due_amount' = ANY(v_sales_cols) THEN
    v_sales_insert_cols := v_sales_insert_cols || ', due_amount';
    v_sales_insert_vals := v_sales_insert_vals || ', ' || v_initial_due::text;
  END IF;
  IF 'payment_status' = ANY(v_sales_cols) THEN
    v_sales_insert_cols := v_sales_insert_cols || ', payment_status';
    v_sales_insert_vals := v_sales_insert_vals || ', ' || quote_literal(v_initial_payment_status);
  END IF;
  IF 'payment_method' = ANY(v_sales_cols) THEN
    v_sales_insert_cols := v_sales_insert_cols || ', payment_method';
    v_sales_insert_vals := v_sales_insert_vals || ', ' || quote_literal(v_norm_payment_method);
  END IF;
  IF 'status' = ANY(v_sales_cols) THEN
    v_sales_insert_cols := v_sales_insert_cols || ', status';
    v_sales_insert_vals := v_sales_insert_vals || ', ' || quote_literal(LOWER(COALESCE(p_status, 'completed')));
  END IF;
  IF 'notes' = ANY(v_sales_cols) THEN
    v_sales_insert_cols := v_sales_insert_cols || ', notes';
    v_sales_insert_vals := v_sales_insert_vals || ', ' || quote_nullable(p_notes);
  END IF;
  IF 'created_by' = ANY(v_sales_cols) THEN
    v_sales_insert_cols := v_sales_insert_cols || ', created_by';
    v_sales_insert_vals := v_sales_insert_vals || ', ' || quote_nullable(v_caller_id::text) || '::uuid';
  END IF;
  IF 'created_at' = ANY(v_sales_cols) THEN
    v_sales_insert_cols := v_sales_insert_cols || ', created_at';
    v_sales_insert_vals := v_sales_insert_vals || ', NOW()';
  END IF;
  IF 'updated_at' = ANY(v_sales_cols) THEN
    v_sales_insert_cols := v_sales_insert_cols || ', updated_at';
    v_sales_insert_vals := v_sales_insert_vals || ', NOW()';
  END IF;

  EXECUTE 'INSERT INTO public.sales (' || v_sales_insert_cols || ') VALUES (' || v_sales_insert_vals || ') RETURNING id'
  INTO v_sale_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_prod_id := (COALESCE(v_item->>'productId', v_item->>'product_id'))::uuid;
    v_qty := (COALESCE(v_item->>'quantity', v_item->>'qty'))::int;
    v_unit_price := (COALESCE(v_item->>'unitPrice', v_item->>'unit_price', v_item->>'unitCost', v_item->>'unit_cost'))::numeric;
    v_subtotal := ROUND(v_qty * v_unit_price, 2);

    v_si_insert_cols := 'sale_id, product_id';
    v_si_insert_vals := quote_literal(v_sale_id::text) || '::uuid, ' || quote_literal(v_prod_id::text) || '::uuid';

    IF 'quantity' = ANY(v_si_cols) THEN
      v_si_insert_cols := v_si_insert_cols || ', quantity';
      v_si_insert_vals := v_si_insert_vals || ', ' || v_qty::text;
    ELSIF 'qty' = ANY(v_si_cols) THEN
      v_si_insert_cols := v_si_insert_cols || ', qty';
      v_si_insert_vals := v_si_insert_vals || ', ' || v_qty::text;
    END IF;
    IF 'unit_price' = ANY(v_si_cols) THEN
      v_si_insert_cols := v_si_insert_cols || ', unit_price';
      v_si_insert_vals := v_si_insert_vals || ', ' || v_unit_price::text;
    ELSIF 'price' = ANY(v_si_cols) THEN
      v_si_insert_cols := v_si_insert_cols || ', price';
      v_si_insert_vals := v_si_insert_vals || ', ' || v_unit_price::text;
    ELSIF 'selling_price' = ANY(v_si_cols) THEN
      v_si_insert_cols := v_si_insert_cols || ', selling_price';
      v_si_insert_vals := v_si_insert_vals || ', ' || v_unit_price::text;
    ELSIF 'unit_cost' = ANY(v_si_cols) THEN
      v_si_insert_cols := v_si_insert_cols || ', unit_cost';
      v_si_insert_vals := v_si_insert_vals || ', ' || v_unit_price::text;
    END IF;
    IF 'subtotal' = ANY(v_si_cols) THEN
      v_si_insert_cols := v_si_insert_cols || ', subtotal';
      v_si_insert_vals := v_si_insert_vals || ', ' || v_subtotal::text;
    ELSIF 'line_total' = ANY(v_si_cols) THEN
      v_si_insert_cols := v_si_insert_cols || ', line_total';
      v_si_insert_vals := v_si_insert_vals || ', ' || v_subtotal::text;
    ELSIF 'total' = ANY(v_si_cols) THEN
      v_si_insert_cols := v_si_insert_cols || ', total';
      v_si_insert_vals := v_si_insert_vals || ', ' || v_subtotal::text;
    END IF;
    IF 'created_at' = ANY(v_si_cols) THEN
      v_si_insert_cols := v_si_insert_cols || ', created_at';
      v_si_insert_vals := v_si_insert_vals || ', NOW()';
    END IF;

    EXECUTE 'INSERT INTO public.sale_items (' || v_si_insert_cols || ') VALUES (' || v_si_insert_vals || ')';
  END LOOP;

  -- Aggregate duplicate product lines when deducting stock & writing stock_movements
  IF v_is_completed THEN
    FOR v_agg IN
      SELECT
        (COALESCE(elem->>'productId', elem->>'product_id'))::uuid AS product_id,
        SUM((COALESCE(elem->>'quantity', elem->>'qty'))::int) AS total_qty
      FROM jsonb_array_elements(p_items) AS elem
      GROUP BY 1
      ORDER BY 1
    LOOP
      EXECUTE format(
        'SELECT COALESCE(%I, 0)::int FROM public.products WHERE id = $1',
        v_prod_qty_col
      )
      INTO v_curr_qty
      USING v_agg.product_id;

      IF v_curr_qty < v_agg.total_qty THEN
        RAISE EXCEPTION 'Insufficient stock for product ID %. Available: %, Requested: %',
          v_agg.product_id, v_curr_qty, v_agg.total_qty;
      END IF;

      v_prod_set_sql := format('%I = COALESCE(%I, 0) - $1', v_prod_qty_col, v_prod_qty_col);
      IF 'updated_at' = ANY(v_prod_cols) THEN
        v_prod_set_sql := v_prod_set_sql || ', updated_at = NOW()';
      END IF;
      EXECUTE 'UPDATE public.products SET ' || v_prod_set_sql || ' WHERE id = $2'
      USING v_agg.total_qty, v_agg.product_id;

      v_sm_insert_cols := 'product_id, quantity';
      v_sm_insert_vals := quote_literal(v_agg.product_id::text) || '::uuid, ' || v_agg.total_qty::text;

      IF 'movement_type' = ANY(v_sm_cols) THEN
        v_sm_insert_cols := v_sm_insert_cols || ', movement_type';
        v_sm_insert_vals := v_sm_insert_vals || ', ''stock_out''';
      END IF;
      IF 'type' = ANY(v_sm_cols) THEN
        v_sm_insert_cols := v_sm_insert_cols || ', type';
        v_sm_insert_vals := v_sm_insert_vals || ', ''stock_out''';
      END IF;
      IF 'previous_stock' = ANY(v_sm_cols) THEN
        v_sm_insert_cols := v_sm_insert_cols || ', previous_stock';
        v_sm_insert_vals := v_sm_insert_vals || ', ' || v_curr_qty::text;
      END IF;
      IF 'current_stock' = ANY(v_sm_cols) THEN
        v_sm_insert_cols := v_sm_insert_cols || ', current_stock';
        v_sm_insert_vals := v_sm_insert_vals || ', ' || (v_curr_qty - v_agg.total_qty)::text;
      END IF;
      IF 'reference_id' = ANY(v_sm_cols) THEN
        v_sm_insert_cols := v_sm_insert_cols || ', reference_id';
        v_sm_insert_vals := v_sm_insert_vals || ', ' || quote_literal(v_sale_id::text) || '::uuid';
      END IF;
      IF 'reference_type' = ANY(v_sm_cols) THEN
        v_sm_insert_cols := v_sm_insert_cols || ', reference_type';
        v_sm_insert_vals := v_sm_insert_vals || ', ''sale''';
      END IF;
      IF 'notes' = ANY(v_sm_cols) THEN
        v_sm_insert_cols := v_sm_insert_cols || ', notes';
        v_sm_insert_vals := v_sm_insert_vals || ', ' || quote_nullable('POS Sale invoice #' || p_invoice_number);
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
    END LOOP;
  END IF;

  SELECT COALESCE(ARRAY_AGG(column_name::text), ARRAY[]::text[])
  INTO v_pay_cols
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'payments'
    AND COALESCE(is_generated, 'NEVER') = 'NEVER';

  IF v_effective_paid > 0 THEN
    v_pay_ref := 'PAY-' || to_char(NOW(), 'YYMMDD') || '-' || LPAD(FLOOR(RANDOM()*10000)::text, 4, '0');

    v_pay_insert_cols := 'payment_type, sale_id, amount, payment_date, payment_method';
    v_pay_insert_vals := '''received'', '
      || quote_literal(v_sale_id::text) || '::uuid, '
      || LEAST(v_effective_paid, p_total_amount)::text || ', NOW(), '
      || quote_literal(v_norm_payment_method);

    IF 'purchase_id' = ANY(v_pay_cols) THEN
      v_pay_insert_cols := v_pay_insert_cols || ', purchase_id';
      v_pay_insert_vals := v_pay_insert_vals || ', NULL::uuid';
    END IF;
    IF 'customer_id' = ANY(v_pay_cols) THEN
      v_pay_insert_cols := v_pay_insert_cols || ', customer_id';
      v_pay_insert_vals := v_pay_insert_vals || ', ' || quote_nullable(p_customer_id::text) || '::uuid';
    END IF;
    IF 'reference_number' = ANY(v_pay_cols) THEN
      v_pay_insert_cols := v_pay_insert_cols || ', reference_number';
      v_pay_insert_vals := v_pay_insert_vals || ', ' || quote_literal(v_pay_ref);
    END IF;
    IF 'notes' = ANY(v_pay_cols) THEN
      v_pay_insert_cols := v_pay_insert_cols || ', notes';
      v_pay_insert_vals := v_pay_insert_vals || ', ' || quote_nullable('Payment for invoice ' || p_invoice_number);
    END IF;
    IF 'created_by' = ANY(v_pay_cols) THEN
      v_pay_insert_cols := v_pay_insert_cols || ', created_by';
      v_pay_insert_vals := v_pay_insert_vals || ', ' || quote_nullable(v_caller_id::text) || '::uuid';
    END IF;
    IF 'created_at' = ANY(v_pay_cols) THEN
      v_pay_insert_cols := v_pay_insert_cols || ', created_at';
      v_pay_insert_vals := v_pay_insert_vals || ', NOW()';
    END IF;
    IF 'updated_at' = ANY(v_pay_cols) THEN
      v_pay_insert_cols := v_pay_insert_cols || ', updated_at';
      v_pay_insert_vals := v_pay_insert_vals || ', NOW()';
    END IF;

    EXECUTE 'INSERT INTO public.payments (' || v_pay_insert_cols || ') VALUES (' || v_pay_insert_vals || ')';
  END IF;

  IF 'purchase_id' = ANY(v_pay_cols) THEN
    EXECUTE 'SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE sale_id = $1 AND purchase_id IS NULL AND payment_type = ''received'''
    INTO v_total_paid
    USING v_sale_id;
  ELSE
    EXECUTE 'SELECT COALESCE(SUM(amount), 0) FROM public.payments WHERE sale_id = $1 AND payment_type = ''received'''
    INTO v_total_paid
    USING v_sale_id;
  END IF;

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
$$;

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
  v_actor_id uuid;
  v_previously_paid numeric;
  v_total_paid numeric;
  v_due_amount numeric;
  v_payment_status text;
  v_duplicate boolean := false;
  v_old_status text;
  v_new_status text;
  v_agg RECORD;
  v_curr_qty int;
  v_prod_net_deducted int;
  v_delta_to_deduct int;
  v_qty_to_restore int;
  v_si_cols text[];
  v_si_qty_col text;
  v_prod_cols text[];
  v_prod_qty_col text;
  v_prod_set_sql text;
  v_sm_cols text[];
  v_mov_col text;
  v_sm_insert_cols text;
  v_sm_insert_vals text;
  v_pay_cols text[];
  v_pay_insert_cols text;
  v_pay_insert_vals text;
  v_sales_cols text[];
  v_sales_set_sql text;
BEGIN
  IF auth.uid() IS NULL AND COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized: Authentication required.';
  END IF;

  IF COALESCE(auth.role(), '') <> 'service_role'
     AND COALESCE(public.current_user_role(), '') NOT IN ('admin', 'manager') THEN
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
     OR p_payment_method NOT IN ('cash', 'card', 'bank_transfer', 'mobile_money', 'cheque') THEN
    RAISE EXCEPTION 'Unsupported payment method: %', p_payment_method;
  END IF;
  IF p_payment_date IS NULL THEN
    RAISE EXCEPTION 'Payment date is required.';
  END IF;

  SELECT * INTO v_sale
  FROM public.sales
  WHERE id = p_sale_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Sale % was not found.', p_sale_id;
  END IF;

  v_actor_id := COALESCE(auth.uid(), v_sale.created_by);
  v_old_status := LOWER(COALESCE(v_sale.status, 'completed'));
  v_new_status := LOWER(COALESCE(NULLIF(BTRIM(p_status), ''), v_old_status));

  IF v_new_status NOT IN ('draft', 'completed', 'cancelled', 'refunded') THEN
    RAISE EXCEPTION 'Unsupported sale status: %', p_status;
  END IF;

  -- Payment updates on an already-completed sale (v_old_status = 'completed' and
  -- v_new_status = 'completed') intentionally leave stock untouched.
  IF (v_old_status <> 'completed' AND v_new_status = 'completed')
     OR v_new_status IN ('cancelled', 'refunded') THEN
    SELECT COALESCE(ARRAY_AGG(column_name::text), ARRAY[]::text[])
    INTO v_sm_cols
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'stock_movements'
      AND COALESCE(is_generated, 'NEVER') = 'NEVER';

    IF 'movement_type' = ANY(v_sm_cols) THEN
      v_mov_col := 'movement_type';
    ELSIF 'type' = ANY(v_sm_cols) THEN
      v_mov_col := 'type';
    ELSE
      RAISE EXCEPTION 'Column "movement_type" or "type" not found on public.stock_movements.';
    END IF;

    SELECT COALESCE(ARRAY_AGG(column_name::text), ARRAY[]::text[])
    INTO v_si_cols
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'sale_items'
      AND COALESCE(is_generated, 'NEVER') = 'NEVER';

    IF 'quantity' = ANY(v_si_cols) THEN
      v_si_qty_col := 'quantity';
    ELSIF 'qty' = ANY(v_si_cols) THEN
      v_si_qty_col := 'qty';
    ELSE
      RAISE EXCEPTION 'Column "quantity" or "qty" not found on public.sale_items.';
    END IF;

    SELECT COALESCE(ARRAY_AGG(column_name::text), ARRAY[]::text[])
    INTO v_prod_cols
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'products'
      AND COALESCE(is_generated, 'NEVER') = 'NEVER';

    IF 'quantity' = ANY(v_prod_cols) THEN
      v_prod_qty_col := 'quantity';
    ELSIF 'stock_quantity' = ANY(v_prod_cols) THEN
      v_prod_qty_col := 'stock_quantity';
    ELSE
      RAISE EXCEPTION 'Column "quantity" or "stock_quantity" not found on public.products.';
    END IF;
  END IF;

  -- 1. Transition non-completed -> 'completed':
  --    Compute outstanding undeducted quantity PER PRODUCT before deducting.
  IF v_old_status <> 'completed' AND v_new_status = 'completed' THEN
    FOR v_agg IN
      EXECUTE format(
        'SELECT si.product_id, SUM(si.%I)::int AS sold_qty FROM public.sale_items si WHERE si.sale_id = $1 GROUP BY si.product_id ORDER BY si.product_id',
        v_si_qty_col
      )
      USING p_sale_id
    LOOP
      PERFORM 1
      FROM public.products
      WHERE id = v_agg.product_id
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Product with ID % not found.', v_agg.product_id;
      END IF;

      EXECUTE format(
        'SELECT COALESCE(%I, 0)::int FROM public.products WHERE id = $1',
        v_prod_qty_col
      )
      INTO v_curr_qty
      USING v_agg.product_id;

      v_prod_net_deducted := 0;
      IF 'reference_id' = ANY(v_sm_cols) THEN
        EXECUTE format(
          'SELECT COALESCE(SUM(CASE WHEN sm.%1$I = ''stock_out'' THEN ABS(sm.quantity) WHEN sm.%1$I = ''stock_in'' THEN -ABS(sm.quantity) ELSE 0 END), 0)::int FROM public.stock_movements sm WHERE sm.reference_id = $1 AND sm.product_id = $2 AND sm.%1$I IN (''stock_out'', ''stock_in'')',
          v_mov_col
        )
        INTO v_prod_net_deducted
        USING p_sale_id, v_agg.product_id;
      END IF;

      v_delta_to_deduct := GREATEST(0, v_agg.sold_qty - v_prod_net_deducted);
      IF v_delta_to_deduct > 0 AND v_curr_qty < v_delta_to_deduct THEN
        RAISE EXCEPTION 'Insufficient stock for product ID %. Available: %, Requested: %',
          v_agg.product_id, v_curr_qty, v_delta_to_deduct;
      END IF;
    END LOOP;

    FOR v_agg IN
      EXECUTE format(
        'SELECT si.product_id, SUM(si.%I)::int AS sold_qty FROM public.sale_items si WHERE si.sale_id = $1 GROUP BY si.product_id ORDER BY si.product_id',
        v_si_qty_col
      )
      USING p_sale_id
    LOOP
      v_prod_net_deducted := 0;
      IF 'reference_id' = ANY(v_sm_cols) THEN
        EXECUTE format(
          'SELECT COALESCE(SUM(CASE WHEN sm.%1$I = ''stock_out'' THEN ABS(sm.quantity) WHEN sm.%1$I = ''stock_in'' THEN -ABS(sm.quantity) ELSE 0 END), 0)::int FROM public.stock_movements sm WHERE sm.reference_id = $1 AND sm.product_id = $2 AND sm.%1$I IN (''stock_out'', ''stock_in'')',
          v_mov_col
        )
        INTO v_prod_net_deducted
        USING p_sale_id, v_agg.product_id;
      END IF;

      v_delta_to_deduct := GREATEST(0, v_agg.sold_qty - v_prod_net_deducted);
      IF v_delta_to_deduct > 0 THEN
        PERFORM 1
        FROM public.products
        WHERE id = v_agg.product_id
        FOR UPDATE;

        EXECUTE format(
          'SELECT COALESCE(%I, 0)::int FROM public.products WHERE id = $1',
          v_prod_qty_col
        )
        INTO v_curr_qty
        USING v_agg.product_id;

        v_prod_set_sql := format('%I = COALESCE(%I, 0) - $1', v_prod_qty_col, v_prod_qty_col);
        IF 'updated_at' = ANY(v_prod_cols) THEN
          v_prod_set_sql := v_prod_set_sql || ', updated_at = NOW()';
        END IF;
        EXECUTE 'UPDATE public.products SET ' || v_prod_set_sql || ' WHERE id = $2'
        USING v_delta_to_deduct, v_agg.product_id;

        v_sm_insert_cols := 'product_id, quantity';
        v_sm_insert_vals := quote_literal(v_agg.product_id::text) || '::uuid, ' || v_delta_to_deduct::text;

        IF 'movement_type' = ANY(v_sm_cols) THEN
          v_sm_insert_cols := v_sm_insert_cols || ', movement_type';
          v_sm_insert_vals := v_sm_insert_vals || ', ''stock_out''';
        END IF;
        IF 'type' = ANY(v_sm_cols) THEN
          v_sm_insert_cols := v_sm_insert_cols || ', type';
          v_sm_insert_vals := v_sm_insert_vals || ', ''stock_out''';
        END IF;
        IF 'previous_stock' = ANY(v_sm_cols) THEN
          v_sm_insert_cols := v_sm_insert_cols || ', previous_stock';
          v_sm_insert_vals := v_sm_insert_vals || ', ' || v_curr_qty::text;
        END IF;
        IF 'current_stock' = ANY(v_sm_cols) THEN
          v_sm_insert_cols := v_sm_insert_cols || ', current_stock';
          v_sm_insert_vals := v_sm_insert_vals || ', ' || (v_curr_qty - v_delta_to_deduct)::text;
        END IF;
        IF 'reference_id' = ANY(v_sm_cols) THEN
          v_sm_insert_cols := v_sm_insert_cols || ', reference_id';
          v_sm_insert_vals := v_sm_insert_vals || ', ' || quote_literal(p_sale_id::text) || '::uuid';
        END IF;
        IF 'reference_type' = ANY(v_sm_cols) THEN
          v_sm_insert_cols := v_sm_insert_cols || ', reference_type';
          v_sm_insert_vals := v_sm_insert_vals || ', ''sale''';
        END IF;
        IF 'notes' = ANY(v_sm_cols) THEN
          v_sm_insert_cols := v_sm_insert_cols || ', notes';
          v_sm_insert_vals := v_sm_insert_vals || ', ' || quote_nullable('Sale confirmed invoice #' || v_sale.invoice_number);
        END IF;
        IF 'created_by' = ANY(v_sm_cols) THEN
          v_sm_insert_cols := v_sm_insert_cols || ', created_by';
          v_sm_insert_vals := v_sm_insert_vals || ', ' || quote_nullable(v_actor_id::text) || '::uuid';
        END IF;
        IF 'created_at' = ANY(v_sm_cols) THEN
          v_sm_insert_cols := v_sm_insert_cols || ', created_at';
          v_sm_insert_vals := v_sm_insert_vals || ', NOW()';
        END IF;

        EXECUTE 'INSERT INTO public.stock_movements (' || v_sm_insert_cols || ') VALUES (' || v_sm_insert_vals || ')';
      END IF;
    END LOOP;

  -- 2. Transition to 'cancelled' or 'refunded':
  --    Restore ONLY each product's actual outstanding net deduction.
  ELSIF v_new_status IN ('cancelled', 'refunded') THEN
    IF 'reference_id' = ANY(v_sm_cols) THEN
      FOR v_agg IN
        EXECUTE format(
          'SELECT DISTINCT sm.product_id FROM public.stock_movements sm WHERE sm.reference_id = $1 AND sm.%I IN (''stock_out'', ''stock_in'') ORDER BY sm.product_id',
          v_mov_col
        )
        USING p_sale_id
      LOOP
        PERFORM 1
        FROM public.products
        WHERE id = v_agg.product_id
        FOR UPDATE;

        IF FOUND THEN
          EXECUTE format(
            'SELECT COALESCE(%I, 0)::int FROM public.products WHERE id = $1',
            v_prod_qty_col
          )
          INTO v_curr_qty
          USING v_agg.product_id;

          EXECUTE format(
            'SELECT COALESCE(SUM(CASE WHEN sm.%1$I = ''stock_out'' THEN ABS(sm.quantity) WHEN sm.%1$I = ''stock_in'' THEN -ABS(sm.quantity) ELSE 0 END), 0)::int FROM public.stock_movements sm WHERE sm.reference_id = $1 AND sm.product_id = $2 AND sm.%1$I IN (''stock_out'', ''stock_in'')',
            v_mov_col
          )
          INTO v_prod_net_deducted
          USING p_sale_id, v_agg.product_id;

          v_qty_to_restore := GREATEST(0, v_prod_net_deducted);
          IF v_qty_to_restore > 0 THEN
            v_prod_set_sql := format('%I = COALESCE(%I, 0) + $1', v_prod_qty_col, v_prod_qty_col);
            IF 'updated_at' = ANY(v_prod_cols) THEN
              v_prod_set_sql := v_prod_set_sql || ', updated_at = NOW()';
            END IF;
            EXECUTE 'UPDATE public.products SET ' || v_prod_set_sql || ' WHERE id = $2'
            USING v_qty_to_restore, v_agg.product_id;

            v_sm_insert_cols := 'product_id, quantity';
            v_sm_insert_vals := quote_literal(v_agg.product_id::text) || '::uuid, ' || v_qty_to_restore::text;

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
              v_sm_insert_vals := v_sm_insert_vals || ', ' || v_curr_qty::text;
            END IF;
            IF 'current_stock' = ANY(v_sm_cols) THEN
              v_sm_insert_cols := v_sm_insert_cols || ', current_stock';
              v_sm_insert_vals := v_sm_insert_vals || ', ' || (v_curr_qty + v_qty_to_restore)::text;
            END IF;
            IF 'reference_id' = ANY(v_sm_cols) THEN
              v_sm_insert_cols := v_sm_insert_cols || ', reference_id';
              v_sm_insert_vals := v_sm_insert_vals || ', ' || quote_literal(p_sale_id::text) || '::uuid';
            END IF;
            IF 'reference_type' = ANY(v_sm_cols) THEN
              v_sm_insert_cols := v_sm_insert_cols || ', reference_type';
              v_sm_insert_vals := v_sm_insert_vals || ', ''sale''';
            END IF;
            IF 'notes' = ANY(v_sm_cols) THEN
              v_sm_insert_cols := v_sm_insert_cols || ', notes';
              v_sm_insert_vals := v_sm_insert_vals || ', ' || quote_nullable('Stock restored from ' || v_new_status || ' sale #' || v_sale.invoice_number);
            END IF;
            IF 'created_by' = ANY(v_sm_cols) THEN
              v_sm_insert_cols := v_sm_insert_cols || ', created_by';
              v_sm_insert_vals := v_sm_insert_vals || ', ' || quote_nullable(v_actor_id::text) || '::uuid';
            END IF;
            IF 'created_at' = ANY(v_sm_cols) THEN
              v_sm_insert_cols := v_sm_insert_cols || ', created_at';
              v_sm_insert_vals := v_sm_insert_vals || ', NOW()';
            END IF;

            EXECUTE 'INSERT INTO public.stock_movements (' || v_sm_insert_cols || ') VALUES (' || v_sm_insert_vals || ')';
          END IF;
        END IF;
      END LOOP;
    ELSIF v_old_status = 'completed' THEN
      -- Safe status-locked fallback if reference_id column does not exist
      FOR v_agg IN
        EXECUTE format(
          'SELECT si.product_id, SUM(si.%I)::int AS total_qty FROM public.sale_items si WHERE si.sale_id = $1 GROUP BY si.product_id ORDER BY si.product_id',
          v_si_qty_col
        )
        USING p_sale_id
      LOOP
        PERFORM 1
        FROM public.products
        WHERE id = v_agg.product_id
        FOR UPDATE;

        IF FOUND AND v_agg.total_qty > 0 THEN
          EXECUTE format(
            'SELECT COALESCE(%I, 0)::int FROM public.products WHERE id = $1',
            v_prod_qty_col
          )
          INTO v_curr_qty
          USING v_agg.product_id;

          v_prod_set_sql := format('%I = COALESCE(%I, 0) + $1', v_prod_qty_col, v_prod_qty_col);
          IF 'updated_at' = ANY(v_prod_cols) THEN
            v_prod_set_sql := v_prod_set_sql || ', updated_at = NOW()';
          END IF;
          EXECUTE 'UPDATE public.products SET ' || v_prod_set_sql || ' WHERE id = $2'
          USING v_agg.total_qty, v_agg.product_id;

          v_sm_insert_cols := 'product_id, quantity';
          v_sm_insert_vals := quote_literal(v_agg.product_id::text) || '::uuid, ' || v_agg.total_qty::text;

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
            v_sm_insert_vals := v_sm_insert_vals || ', ' || v_curr_qty::text;
          END IF;
          IF 'current_stock' = ANY(v_sm_cols) THEN
            v_sm_insert_cols := v_sm_insert_cols || ', current_stock';
            v_sm_insert_vals := v_sm_insert_vals || ', ' || (v_curr_qty + v_agg.total_qty)::text;
          END IF;
          IF 'reference_type' = ANY(v_sm_cols) THEN
            v_sm_insert_cols := v_sm_insert_cols || ', reference_type';
            v_sm_insert_vals := v_sm_insert_vals || ', ''sale''';
          END IF;
          IF 'notes' = ANY(v_sm_cols) THEN
            v_sm_insert_cols := v_sm_insert_cols || ', notes';
            v_sm_insert_vals := v_sm_insert_vals || ', ' || quote_nullable('Stock restored from ' || v_new_status || ' sale #' || v_sale.invoice_number);
          END IF;
          IF 'created_by' = ANY(v_sm_cols) THEN
            v_sm_insert_cols := v_sm_insert_cols || ', created_by';
            v_sm_insert_vals := v_sm_insert_vals || ', ' || quote_nullable(v_actor_id::text) || '::uuid';
          END IF;
          IF 'created_at' = ANY(v_sm_cols) THEN
            v_sm_insert_cols := v_sm_insert_cols || ', created_at';
            v_sm_insert_vals := v_sm_insert_vals || ', NOW()';
          END IF;

          EXECUTE 'INSERT INTO public.stock_movements (' || v_sm_insert_cols || ') VALUES (' || v_sm_insert_vals || ')';
        END IF;
      END LOOP;
    END IF;
  END IF;

  SELECT COALESCE(SUM(amount), 0) INTO v_previously_paid
  FROM public.payments
  WHERE sale_id = p_sale_id
    AND purchase_id IS NULL
    AND payment_type = 'received';

  IF p_new_payment_amount > 0 THEN
    SELECT COALESCE(ARRAY_AGG(column_name::text), ARRAY[]::text[])
    INTO v_pay_cols
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'payments'
      AND COALESCE(is_generated, 'NEVER') = 'NEVER';

    v_duplicate := false;
    IF 'reference_number' = ANY(v_pay_cols) THEN
      SELECT EXISTS (
        SELECT 1
        FROM public.payments
        WHERE sale_id = p_sale_id
          AND purchase_id IS NULL
          AND payment_type = 'received'
          AND reference_number = p_reference_number
      ) INTO v_duplicate;
    END IF;

    IF NOT v_duplicate THEN
      IF p_new_payment_amount > GREATEST(0, p_total_amount - v_previously_paid) THEN
        RAISE EXCEPTION 'New payment exceeds remaining due (%).',
          GREATEST(0, p_total_amount - v_previously_paid);
      END IF;

      v_pay_insert_cols := 'sale_id, payment_type, amount, payment_method, payment_date';
      v_pay_insert_vals := quote_literal(p_sale_id::text) || '::uuid, '
        || '''received'', '
        || p_new_payment_amount::text || ', '
        || quote_literal(p_payment_method) || ', '
        || quote_literal(p_payment_date::text) || '::date';

      IF 'purchase_id' = ANY(v_pay_cols) THEN
        v_pay_insert_cols := v_pay_insert_cols || ', purchase_id';
        v_pay_insert_vals := v_pay_insert_vals || ', NULL::uuid';
      END IF;
      IF 'customer_id' = ANY(v_pay_cols) THEN
        v_pay_insert_cols := v_pay_insert_cols || ', customer_id';
        v_pay_insert_vals := v_pay_insert_vals || ', ' || quote_nullable(v_sale.customer_id::text) || '::uuid';
      END IF;
      IF 'reference_number' = ANY(v_pay_cols) THEN
        v_pay_insert_cols := v_pay_insert_cols || ', reference_number';
        v_pay_insert_vals := v_pay_insert_vals || ', ' || quote_literal(p_reference_number);
      END IF;
      IF 'notes' = ANY(v_pay_cols) THEN
        v_pay_insert_cols := v_pay_insert_cols || ', notes';
        v_pay_insert_vals := v_pay_insert_vals || ', ' || quote_nullable('Additional payment for invoice ' || v_sale.invoice_number);
      END IF;
      IF 'created_by' = ANY(v_pay_cols) THEN
        v_pay_insert_cols := v_pay_insert_cols || ', created_by';
        v_pay_insert_vals := v_pay_insert_vals || ', ' || quote_nullable(v_actor_id::text) || '::uuid';
      END IF;
      IF 'created_at' = ANY(v_pay_cols) THEN
        v_pay_insert_cols := v_pay_insert_cols || ', created_at';
        v_pay_insert_vals := v_pay_insert_vals || ', NOW()';
      END IF;
      IF 'updated_at' = ANY(v_pay_cols) THEN
        v_pay_insert_cols := v_pay_insert_cols || ', updated_at';
        v_pay_insert_vals := v_pay_insert_vals || ', NOW()';
      END IF;

      EXECUTE 'INSERT INTO public.payments (' || v_pay_insert_cols || ') VALUES (' || v_pay_insert_vals || ')';
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

  SELECT COALESCE(ARRAY_AGG(column_name::text), ARRAY[]::text[])
  INTO v_sales_cols
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'sales'
    AND COALESCE(is_generated, 'NEVER') = 'NEVER';

  v_sales_set_sql := 'status = ' || quote_literal(v_new_status);

  IF 'total_amount' = ANY(v_sales_cols) THEN
    v_sales_set_sql := v_sales_set_sql || ', total_amount = ' || p_total_amount::text;
  ELSIF 'grand_total' = ANY(v_sales_cols) THEN
    v_sales_set_sql := v_sales_set_sql || ', grand_total = ' || p_total_amount::text;
  ELSIF 'total' = ANY(v_sales_cols) THEN
    v_sales_set_sql := v_sales_set_sql || ', total = ' || p_total_amount::text;
  END IF;
  IF 'paid_amount' = ANY(v_sales_cols) THEN
    v_sales_set_sql := v_sales_set_sql || ', paid_amount = ' || v_total_paid::text;
  END IF;
  IF 'due_amount' = ANY(v_sales_cols) THEN
    v_sales_set_sql := v_sales_set_sql || ', due_amount = ' || v_due_amount::text;
  END IF;
  IF 'payment_status' = ANY(v_sales_cols) THEN
    v_sales_set_sql := v_sales_set_sql || ', payment_status = ' || quote_literal(v_payment_status);
  END IF;
  IF 'payment_method' = ANY(v_sales_cols) AND p_new_payment_amount > 0 THEN
    v_sales_set_sql := v_sales_set_sql || ', payment_method = ' || quote_literal(p_payment_method);
  END IF;
  IF 'notes' = ANY(v_sales_cols) THEN
    v_sales_set_sql := v_sales_set_sql || ', notes = ' || quote_nullable(COALESCE(p_notes, v_sale.notes));
  END IF;
  IF 'updated_at' = ANY(v_sales_cols) THEN
    v_sales_set_sql := v_sales_set_sql || ', updated_at = NOW()';
  END IF;

  EXECUTE 'UPDATE public.sales SET ' || v_sales_set_sql || ' WHERE id = $1'
  USING p_sale_id;

  RETURN jsonb_build_object(
    'id', p_sale_id,
    'totalPaid', v_total_paid,
    'dueAmount', v_due_amount,
    'paymentStatus', v_payment_status,
    'status', v_new_status,
    'duplicate', v_duplicate
  );
END;
$$;

REVOKE ALL ON FUNCTION public.receive_purchase_goods_transaction(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.process_sale_transaction(text, uuid, numeric, numeric, numeric, numeric, numeric, text, text, text, uuid, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_sale_payment_transaction(uuid, numeric, numeric, text, date, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.receive_purchase_goods_transaction(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.process_sale_transaction(text, uuid, numeric, numeric, numeric, numeric, numeric, text, text, text, uuid, jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_sale_payment_transaction(uuid, numeric, numeric, text, date, text, text, text) TO authenticated, service_role;

COMMIT;

NOTIFY pgrst, 'reload schema';
