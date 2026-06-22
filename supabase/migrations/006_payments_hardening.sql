-- ============================================================================
-- ANORA — Payments Hardening
-- Migration 006: Stripe checkout linkage, webhook-safe order tracking, and
-- atomic inventory deductions across product, variant, and size stock.
-- ============================================================================

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_provider TEXT NOT NULL DEFAULT 'stripe',
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_error TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_stripe_session_id
  ON orders(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id
  ON orders(stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

DROP FUNCTION IF EXISTS decrement_checkout_stock CASCADE;

CREATE OR REPLACE FUNCTION decrement_checkout_stock(
  p_product_id UUID,
  p_quantity   INT,
  p_size       TEXT DEFAULT NULL,
  p_variant_id UUID DEFAULT NULL,
  p_reference  TEXT DEFAULT NULL,
  p_notes      TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_product_stock INT;
  v_variant_stock  INT;
  v_size_stock     INT;
  v_updated_sizes  JSONB;
  v_change_type    inventory_change_type := 'order';
BEGIN
  SELECT stock, size_stock INTO v_product_stock, v_updated_sizes
  FROM products
  WHERE id = p_product_id
  FOR UPDATE;

  IF v_product_stock IS NULL OR v_product_stock < p_quantity THEN
    RETURN FALSE;
  END IF;

  IF p_size IS NOT NULL AND p_size <> '' THEN
    v_size_stock := COALESCE((v_updated_sizes ->> p_size)::INT, 0);
    IF v_size_stock < p_quantity THEN
      RETURN FALSE;
    END IF;
    v_updated_sizes := jsonb_set(
      COALESCE(v_updated_sizes, '{}'::jsonb),
      ARRAY[p_size],
      to_jsonb(GREATEST(v_size_stock - p_quantity, 0)),
      true
    );
  END IF;

  IF p_variant_id IS NOT NULL THEN
    SELECT stock INTO v_variant_stock
    FROM product_variants
    WHERE id = p_variant_id
    FOR UPDATE;

    IF v_variant_stock IS NULL OR v_variant_stock < p_quantity THEN
      RETURN FALSE;
    END IF;

    UPDATE product_variants
    SET stock = stock - p_quantity
    WHERE id = p_variant_id;
  END IF;

  UPDATE products
  SET stock = stock - p_quantity,
      size_stock = COALESCE(v_updated_sizes, size_stock)
  WHERE id = p_product_id;

  INSERT INTO inventory_logs (
    product_id,
    variant_id,
    change_type,
    quantity_change,
    quantity_after,
    reference_id,
    notes
  ) VALUES (
    p_product_id,
    p_variant_id,
    v_change_type,
    -p_quantity,
    GREATEST(v_product_stock - p_quantity, 0),
    p_reference,
    p_notes
  );

  RETURN TRUE;
END;
$$;
