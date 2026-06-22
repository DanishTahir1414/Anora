-- ============================================================================
-- ANORA — Cart Size Sync
-- Migration 005: add size support to cart_items for user cart persistence
-- ============================================================================

ALTER TABLE cart_items
  ADD COLUMN IF NOT EXISTS size TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_cart_items_user_product_size
  ON cart_items(user_id, product_id, variant_id, size);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_items_unique_owner_item
  ON cart_items(
    COALESCE(user_id::text, ''),
    COALESCE(session_id, ''),
    product_id,
    COALESCE(variant_id::text, ''),
    COALESCE(size, '')
  );

-- ============================================================================
-- End of migration 005
-- ============================================================================
