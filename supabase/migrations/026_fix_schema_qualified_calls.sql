-- Migration 026: Schema-qualify function calls in stock/alert functions.
--
-- Root cause: SECURITY DEFINER functions using SET search_path = '' call
-- other functions without schema qualification, e.g.:
--   PERFORM check_and_generate_alerts(...)      -- fails
--   PERFORM public.check_and_generate_alerts(...) -- works
--
-- With search_path = '', PostgreSQL cannot resolve unqualified names.
--
-- Fixed functions:
--   stock_change_alert_trigger → public.check_and_generate_alerts
--   adjust_stock              → public.check_and_generate_alerts
--   add_stock                 → public.adjust_stock
--   remove_stock              → public.adjust_stock

-- ─── 1. stock_change_alert_trigger ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION stock_change_alert_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF OLD.stock IS DISTINCT FROM NEW.stock THEN
    PERFORM public.check_and_generate_alerts(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

-- ─── 2. adjust_stock ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION adjust_stock(
  p_product_id UUID,
  p_new_stock  INT,
  p_reason     TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_old_stock INT;
  v_diff      INT;
BEGIN
  IF p_new_stock < 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Stock cannot be negative');
  END IF;

  SELECT stock INTO v_old_stock FROM public.products WHERE id = p_product_id;
  IF v_old_stock IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Product not found');
  END IF;

  v_diff := p_new_stock - v_old_stock;

  UPDATE public.products SET stock = p_new_stock, updated_at = now() WHERE id = p_product_id;

  INSERT INTO public.inventory_logs (product_id, change_type, quantity_change, quantity_after, reference_id, notes, created_by)
  VALUES (
    p_product_id,
    CASE WHEN v_diff > 0 THEN 'restock'::public.inventory_change_type ELSE 'adjustment'::public.inventory_change_type END,
    v_diff,
    p_new_stock,
    'admin-adjustment',
    COALESCE(p_reason, CASE WHEN v_diff > 0 THEN 'Manual stock addition' ELSE 'Manual stock adjustment' END),
    auth.uid()
  );

  PERFORM public.check_and_generate_alerts(p_product_id);

  RETURN jsonb_build_object(
    'success', true,
    'previous_stock', v_old_stock,
    'new_stock', p_new_stock
  );
END;
$$;

-- ─── 3. add_stock ───────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION add_stock(
  p_product_id UUID,
  p_quantity   INT,
  p_reason     TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_stock INT;
BEGIN
  IF p_quantity <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Quantity must be greater than 0');
  END IF;

  SELECT stock INTO v_current_stock FROM public.products WHERE id = p_product_id;
  IF v_current_stock IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Product not found');
  END IF;

  RETURN public.adjust_stock(p_product_id, v_current_stock + p_quantity, p_reason);
END;
$$;

-- ─── 4. remove_stock ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION remove_stock(
  p_product_id UUID,
  p_quantity   INT,
  p_reason     TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_stock INT;
BEGIN
  IF p_quantity <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Quantity must be greater than 0');
  END IF;

  SELECT stock INTO v_current_stock FROM public.products WHERE id = p_product_id;
  IF v_current_stock IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Product not found');
  END IF;

  IF v_current_stock < p_quantity THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient stock');
  END IF;

  RETURN public.adjust_stock(p_product_id, v_current_stock - p_quantity, p_reason);
END;
$$;
