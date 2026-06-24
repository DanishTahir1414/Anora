-- ============================================================================
-- ANORA — Categories & Inventory Management
-- Migration 014: Inventory alerts, triggers, admin RPCs for categories + inventory.
-- ============================================================================
-- Apply AFTER 013_products_management.sql
-- ============================================================================

-- ─── INVENTORY ALERTS ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS inventory_alerts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  alert_type      TEXT        NOT NULL CHECK (alert_type IN ('critical', 'low', 'overstock')),
  threshold       INT         NOT NULL,
  current_stock   INT         NOT NULL,
  resolved        BOOLEAN     NOT NULL DEFAULT false,
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, alert_type)
);

CREATE INDEX IF NOT EXISTS idx_inventory_alerts_product  ON inventory_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_type     ON inventory_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_resolved ON inventory_alerts(resolved) WHERE resolved = false;

ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage inventory_alerts"
  ON inventory_alerts FOR ALL
  USING (is_staff());

-- ─── ALERT GENERATION FUNCTION ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION check_and_generate_alerts(p_product_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_stock INT;
  v_overstock_threshold INT := 100;
BEGIN
  SELECT stock INTO v_stock FROM public.products WHERE id = p_product_id;
  IF v_stock IS NULL THEN RETURN; END IF;

  -- Critical (0-2)
  IF v_stock <= 2 THEN
    INSERT INTO public.inventory_alerts (product_id, alert_type, threshold, current_stock)
    VALUES (p_product_id, 'critical', 2, v_stock)
    ON CONFLICT (product_id, alert_type) DO UPDATE SET
      current_stock = EXCLUDED.current_stock,
      resolved = false,
      resolved_at = NULL;
  ELSE
    UPDATE public.inventory_alerts SET resolved = true, resolved_at = now()
    WHERE product_id = p_product_id AND alert_type = 'critical' AND resolved = false;
  END IF;

  -- Low (3-10)
  IF v_stock > 2 AND v_stock <= 10 THEN
    INSERT INTO public.inventory_alerts (product_id, alert_type, threshold, current_stock)
    VALUES (p_product_id, 'low', 10, v_stock)
    ON CONFLICT (product_id, alert_type) DO UPDATE SET
      current_stock = EXCLUDED.current_stock,
      resolved = false,
      resolved_at = NULL;
  ELSE
    UPDATE public.inventory_alerts SET resolved = true, resolved_at = now()
    WHERE product_id = p_product_id AND alert_type = 'low' AND resolved = false;
  END IF;

  -- Overstock (>100)
  IF v_stock > v_overstock_threshold THEN
    INSERT INTO public.inventory_alerts (product_id, alert_type, threshold, current_stock)
    VALUES (p_product_id, 'overstock', v_overstock_threshold, v_stock)
    ON CONFLICT (product_id, alert_type) DO UPDATE SET
      current_stock = EXCLUDED.current_stock,
      resolved = false,
      resolved_at = NULL;
  ELSE
    UPDATE public.inventory_alerts SET resolved = true, resolved_at = now()
    WHERE product_id = p_product_id AND alert_type = 'overstock' AND resolved = false;
  END IF;
END;
$$;

-- ─── STOCK CHANGE TRIGGER (auto-generates alerts) ───────────────────────────

CREATE OR REPLACE FUNCTION stock_change_alert_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF OLD.stock IS DISTINCT FROM NEW.stock THEN
    PERFORM check_and_generate_alerts(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_stock_change_alerts ON products;
CREATE TRIGGER trg_stock_change_alerts
  AFTER UPDATE OF stock ON products
  FOR EACH ROW
  EXECUTE FUNCTION stock_change_alert_trigger();

-- ─── CATEGORIES MANAGEMENT RPCs ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_categories_management(
  p_page       INT DEFAULT 1,
  p_page_size  INT DEFAULT 20,
  p_search     TEXT DEFAULT NULL,
  p_sort_by    TEXT DEFAULT 'name',
  p_sort_dir   TEXT DEFAULT 'asc'
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_offset INT;
  v_total  INT;
  v_result JSONB;
  v_where  TEXT := ' WHERE 1=1';
BEGIN
  v_offset := (p_page - 1) * p_page_size;

  IF p_search IS NOT NULL AND p_search != '' THEN
    v_where := v_where || format(
      ' AND (c.name ILIKE %L OR c.slug ILIKE %L)',
      '%' || p_search || '%',
      '%' || p_search || '%'
    );
  END IF;

  EXECUTE 'SELECT COUNT(*) FROM public.categories c' || v_where INTO v_total;

  EXECUTE 'SELECT jsonb_build_object(
    ''categories'', COALESCE(jsonb_agg(sub ORDER BY ' ||
    CASE
      WHEN p_sort_by = 'name'         THEN 'sub.name'
      WHEN p_sort_by = 'product_count' THEN 'sub.product_count'
      WHEN p_sort_by = 'created_at'   THEN 'sub.created_at'
      ELSE 'sub.name'
    END ||
    CASE WHEN p_sort_dir = 'asc' THEN ' ASC' ELSE ' DESC' END ||
    '), ''[]''::jsonb),
    ''total'', $1
  )
  FROM (
    SELECT
      c.id, c.name, c.slug, c.is_active, c.created_at, c.updated_at,
      (SELECT COUNT(*) FROM public.products p WHERE p.category_id = c.id) AS product_count
    FROM public.categories c'
    || v_where ||
    ' ORDER BY ' ||
    CASE
      WHEN p_sort_by = 'name'         THEN 'c.name'
      WHEN p_sort_by = 'product_count' THEN 'product_count'
      WHEN p_sort_by = 'created_at'   THEN 'c.created_at'
      ELSE 'c.name'
    END ||
    CASE WHEN p_sort_dir = 'asc' THEN ' ASC' ELSE ' DESC' END ||
    ' LIMIT ' || p_page_size || ' OFFSET ' || v_offset || '
  ) sub'
  INTO v_result
  USING v_total;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION create_category(p_name TEXT, p_slug TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM public.categories WHERE slug = p_slug) THEN
    RETURN jsonb_build_object('success', false, 'error', 'A category with this slug already exists');
  END IF;
  IF EXISTS (SELECT 1 FROM public.categories WHERE name = p_name) THEN
    RETURN jsonb_build_object('success', false, 'error', 'A category with this name already exists');
  END IF;

  INSERT INTO public.categories (name, slug) VALUES (p_name, p_slug)
  RETURNING id INTO v_id;

  RETURN jsonb_build_object('success', true, 'id', v_id);
END;
$$;

CREATE OR REPLACE FUNCTION update_category(p_id UUID, p_name TEXT, p_slug TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.categories WHERE slug = p_slug AND id != p_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'A category with this slug already exists');
  END IF;
  IF EXISTS (SELECT 1 FROM public.categories WHERE name = p_name AND id != p_id) THEN
    RETURN jsonb_build_object('success', false, 'error', 'A category with this name already exists');
  END IF;

  UPDATE public.categories
  SET name = p_name, slug = p_slug, updated_at = now()
  WHERE id = p_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION delete_category(p_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_product_count INT;
BEGIN
  SELECT COUNT(*) INTO v_product_count FROM public.products WHERE category_id = p_id;

  IF v_product_count > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format('Cannot delete category because %s product(s) are assigned to it', v_product_count)
    );
  END IF;

  DELETE FROM public.categories WHERE id = p_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ─── INVENTORY MANAGEMENT RPCs ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_inventory_management(
  p_page          INT DEFAULT 1,
  p_page_size     INT DEFAULT 20,
  p_search        TEXT DEFAULT NULL,
  p_sort_by       TEXT DEFAULT 'name',
  p_sort_dir      TEXT DEFAULT 'asc',
  p_stock_status  TEXT DEFAULT NULL,
  p_category_id   UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_offset INT;
  v_total  INT;
  v_result JSONB;
  v_where  TEXT := ' WHERE 1=1';
BEGIN
  v_offset := (p_page - 1) * p_page_size;

  IF p_search IS NOT NULL AND p_search != '' THEN
    v_where := v_where || format(
      ' AND (p.name ILIKE %L OR p.sku ILIKE %L)',
      '%' || p_search || '%',
      '%' || p_search || '%'
    );
  END IF;

  IF p_category_id IS NOT NULL THEN
    v_where := v_where || format(' AND p.category_id = %L', p_category_id);
  END IF;

  IF p_stock_status IS NOT NULL AND p_stock_status != '' THEN
    IF p_stock_status = 'critical' THEN
      v_where := v_where || ' AND p.stock >= 0 AND p.stock <= 2';
    ELSIF p_stock_status = 'low' THEN
      v_where := v_where || ' AND p.stock > 2 AND p.stock <= 10';
    ELSIF p_stock_status = 'healthy' THEN
      v_where := v_where || ' AND p.stock > 10 AND p.stock <= 100';
    ELSIF p_stock_status = 'overstock' THEN
      v_where := v_where || ' AND p.stock > 100';
    END IF;
  END IF;

  EXECUTE 'SELECT COUNT(*) FROM public.products p' || v_where INTO v_total;

  EXECUTE 'SELECT jsonb_build_object(
    ''products'', COALESCE(jsonb_agg(sub ORDER BY ' ||
    CASE
      WHEN p_sort_by = 'name'    THEN 'sub.name'
      WHEN p_sort_by = 'sku'     THEN 'sub.sku'
      WHEN p_sort_by = 'stock'   THEN 'sub.stock'
      WHEN p_sort_by = 'category' THEN 'sub.category_name'
      WHEN p_sort_by = 'updated_at' THEN 'sub.updated_at'
      ELSE 'sub.name'
    END ||
    CASE WHEN p_sort_dir = 'asc' THEN ' ASC' ELSE ' DESC' END ||
    '), ''[]''::jsonb),
    ''total'', $1
  )
  FROM (
    SELECT
      p.id, p.name, p.sku, p.stock, p.is_active, p.updated_at,
      COALESCE(c.name, ''—'') AS category_name
    FROM public.products p
    LEFT JOIN public.categories c ON c.id = p.category_id'
    || v_where ||
    ' ORDER BY ' ||
    CASE
      WHEN p_sort_by = 'name'    THEN 'p.name'
      WHEN p_sort_by = 'sku'     THEN 'p.sku'
      WHEN p_sort_by = 'stock'   THEN 'p.stock'
      WHEN p_sort_by = 'category' THEN 'c.name'
      WHEN p_sort_by = 'updated_at' THEN 'p.updated_at'
      ELSE 'p.name'
    END ||
    CASE WHEN p_sort_dir = 'asc' THEN ' ASC' ELSE ' DESC' END ||
    ' LIMIT ' || p_page_size || ' OFFSET ' || v_offset || '
  ) sub'
  INTO v_result
  USING v_total;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

CREATE OR REPLACE FUNCTION get_inventory_summary()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'totalProducts',  (SELECT COUNT(*) FROM public.products),
    'inStock',        (SELECT COUNT(*) FROM public.products WHERE stock > 0),
    'lowStock',       (SELECT COUNT(*) FROM public.products WHERE stock > 0 AND stock <= 10),
    'outOfStock',     (SELECT COUNT(*) FROM public.products WHERE stock = 0),
    'overstock',      (SELECT COUNT(*) FROM public.products WHERE stock > 100)
  );
$$;

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
    CASE WHEN v_diff > 0 THEN 'restock' ELSE 'adjustment' END,
    v_diff,
    p_new_stock,
    'admin-adjustment',
    COALESCE(p_reason, CASE WHEN v_diff > 0 THEN 'Manual stock addition' ELSE 'Manual stock adjustment' END),
    auth.uid()
  );

  PERFORM check_and_generate_alerts(p_product_id);

  RETURN jsonb_build_object(
    'success', true,
    'previous_stock', v_old_stock,
    'new_stock', p_new_stock
  );
END;
$$;

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

  RETURN adjust_stock(p_product_id, v_current_stock + p_quantity, p_reason);
END;
$$;

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

  RETURN adjust_stock(p_product_id, v_current_stock - p_quantity, p_reason);
END;
$$;

CREATE OR REPLACE FUNCTION get_inventory_history(
  p_product_id UUID,
  p_limit INT DEFAULT 50
)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id',             il.id,
    'product_id',     il.product_id,
    'product_name',   p.name,
    'movement_type',  il.change_type::TEXT,
    'quantity',       il.quantity_change,
    'previous_stock', il.quantity_after - il.quantity_change,
    'new_stock',      il.quantity_after,
    'reason',         il.notes,
    'created_at',     il.created_at
  ) ORDER BY il.created_at DESC), '[]'::jsonb)
  FROM public.inventory_logs il
  JOIN public.products p ON p.id = il.product_id
  WHERE il.product_id = p_product_id
  LIMIT p_limit;
$$;

CREATE OR REPLACE FUNCTION get_inventory_alerts(
  p_unresolved_only BOOLEAN DEFAULT true
)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id',            a.id,
    'product_id',    a.product_id,
    'product_name',  p.name,
    'product_sku',   p.sku,
    'alert_type',    a.alert_type,
    'threshold',     a.threshold,
    'current_stock', a.current_stock,
    'resolved',      a.resolved,
    'resolved_at',   a.resolved_at,
    'created_at',    a.created_at
  ) ORDER BY a.created_at DESC), '[]'::jsonb)
  FROM public.inventory_alerts a
  JOIN public.products p ON p.id = a.product_id
  WHERE (p_unresolved_only IS NOT TRUE OR a.resolved = false);
$$;

CREATE OR REPLACE FUNCTION resolve_alert(p_alert_id UUID)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  UPDATE public.inventory_alerts
  SET resolved = true, resolved_at = now()
  WHERE id = p_alert_id
  RETURNING jsonb_build_object('success', true);
$$;

-- ============================================================================
-- End of migration 014
-- ============================================================================
