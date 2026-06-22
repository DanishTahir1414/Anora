-- ============================================================================
-- ANORA — Inventory Refactor
-- Migration 004: low-stock metadata flags and inventory alert logging
-- ============================================================================
-- Apply after 001_schema.sql and 002_rls.sql
-- ============================================================================

DROP TRIGGER IF EXISTS flag_low_stock_on_products ON products;
DROP TRIGGER IF EXISTS flag_low_stock_on_variants ON product_variants;
DROP FUNCTION IF EXISTS flag_low_stock_products CASCADE;
DROP FUNCTION IF EXISTS flag_low_stock_variants CASCADE;

CREATE OR REPLACE FUNCTION flag_low_stock_products()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_threshold INT := 5;
  v_low_stock BOOLEAN;
BEGIN
  v_low_stock := NEW.stock > 0 AND NEW.stock <= v_threshold;

  NEW.metadata := jsonb_set(
    COALESCE(NEW.metadata, '{}'::jsonb),
    '{low_stock}',
    to_jsonb(v_low_stock),
    true
  );

  NEW.metadata := jsonb_set(
    NEW.metadata,
    '{low_stock_threshold}',
    to_jsonb(v_threshold),
    true
  );

  IF NEW.stock <= v_threshold AND OLD.stock > v_threshold THEN
    INSERT INTO inventory_logs (
      product_id,
      variant_id,
      change_type,
      quantity_change,
      quantity_after,
      notes
    ) VALUES (
      NEW.id,
      NULL,
      'adjustment',
      0,
      NEW.stock,
      'low_stock_threshold_crossed'
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION flag_low_stock_variants()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_threshold INT := 5;
  v_low_stock BOOLEAN;
BEGIN
  v_low_stock := NEW.stock > 0 AND NEW.stock <= v_threshold;

  IF NEW.stock <= v_threshold AND OLD.stock > v_threshold THEN
    INSERT INTO inventory_logs (
      product_id,
      variant_id,
      change_type,
      quantity_change,
      quantity_after,
      notes
    ) VALUES (
      NEW.product_id,
      NEW.id,
      'adjustment',
      0,
      NEW.stock,
      'low_stock_threshold_crossed'
    );
  END IF;

  UPDATE products
  SET metadata = jsonb_set(
    jsonb_set(COALESCE(metadata, '{}'::jsonb), '{low_stock}', to_jsonb(v_low_stock), true),
    '{low_stock_threshold}',
    to_jsonb(v_threshold),
    true
  )
  WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER flag_low_stock_on_products
  BEFORE UPDATE OF stock ON products
  FOR EACH ROW
  EXECUTE FUNCTION flag_low_stock_products();

CREATE TRIGGER flag_low_stock_on_variants
  BEFORE UPDATE OF stock ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION flag_low_stock_variants();

-- ============================================================================
-- End of migration 004
-- ============================================================================
