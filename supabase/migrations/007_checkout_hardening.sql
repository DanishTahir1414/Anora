-- ============================================================================
-- ANORA — Checkout Hardening
-- Migration 007: Checkout lock tokens, cart snapshots, idempotency,
-- and webhook deduplication.
-- ============================================================================
-- Apply AFTER 006_payments_hardening.sql
-- ============================================================================

-- ─── ORDERS ──────────────────────────────────────────────────────────────────
-- checkout_session_token: Generated when checkout starts. Any cart mutation
--   invalidates it on the client. Server rejects stale tokens.
-- cart_snapshot: JSONB copy of the validated cart items at checkout start.
--   Stripe session must match this snapshot. Prevents price/qty manipulation
--   after checkout has begun.
-- checkout_started_at: Timestamp of when checkout was initiated.
-- webhook_processed_at: Set once the webhook has fully processed. Used for
--   idempotency — if non-null, subsequent webhook calls are ignored.
-- idempotency_key: Unique key derived from Stripe event ID + order ID.
--   Prevents double-processing of retried webhook deliveries.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS checkout_session_token TEXT,
  ADD COLUMN IF NOT EXISTS cart_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS checkout_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS webhook_processed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_orders_checkout_token
  ON orders(checkout_session_token)
  WHERE checkout_session_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_idempotency
  ON orders(idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_checkout_started
  ON orders(checkout_started_at)
  WHERE checkout_started_at IS NOT NULL;

-- ─── WEBHOOK IDEMPOTENCY FUNCTION ───────────────────────────────────────────
-- Atomically marks an order as webhook-processed.
-- Returns TRUE if the order was not yet processed (first time).
-- Returns FALSE if already processed (duplicate webhook).

CREATE OR REPLACE FUNCTION try_claim_webhook(
  p_order_id       UUID,
  p_idempotency_key TEXT,
  p_payment_intent  TEXT DEFAULT NULL,
  p_session_id      TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_processed_at TIMESTAMPTZ;
BEGIN
  SELECT webhook_processed_at INTO v_processed_at
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF v_processed_at IS NOT NULL THEN
    RETURN FALSE;
  END IF;

  UPDATE orders
  SET
    webhook_processed_at  = now(),
    idempotency_key       = p_idempotency_key,
    stripe_payment_intent_id = COALESCE(p_payment_intent, stripe_payment_intent_id),
    stripe_session_id     = COALESCE(p_session_id, stripe_session_id)
  WHERE id = p_order_id;

  RETURN TRUE;
END;
$$;

-- ─── CHECKOUT TOKEN VALIDATION FUNCTION ──────────────────────────────────────
-- Validates that a checkout session token is still valid for the given order.
-- Tokens are invalidated when the order status leaves 'pending'.

CREATE OR REPLACE FUNCTION validate_checkout_token(
  p_order_id UUID,
  p_token    TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_stored_token TEXT;
  v_status       TEXT;
BEGIN
  SELECT checkout_session_token, status::TEXT
  INTO v_stored_token, v_status
  FROM orders
  WHERE id = p_order_id;

  IF v_status IS NULL THEN
    RETURN FALSE;
  END IF;

  IF v_status != 'pending' THEN
    RETURN FALSE;
  END IF;

  IF v_stored_token IS NULL OR v_stored_token != p_token THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

-- ============================================================================
-- End of migration 007
-- ============================================================================
