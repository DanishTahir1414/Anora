-- ============================================================================
-- ANORA — Products Management System
-- Migration 013: Popularity foundation, status column, admin RPCs.
-- ============================================================================
-- Apply AFTER 012_orders_management.sql
-- ============================================================================

-- ─── POPULARITY FOUNDATION ──────────────────────────────────────────────────

ALTER TABLE products ADD COLUMN IF NOT EXISTS popularity_score NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS total_sales INT NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS total_revenue NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS purchase_count INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_products_popularity ON products(popularity_score DESC);

-- ─── STATUS COLUMN ──────────────────────────────────────────────────────────

ALTER TABLE products ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'draft', 'archived', 'out_of_stock'));

UPDATE products SET status = 'active' WHERE status = 'active' AND is_active = true AND stock > 0;
UPDATE products SET status = 'active' WHERE is_active = true AND stock > 0 AND status = 'active';
UPDATE products SET status = 'out_of_stock' WHERE is_active = true AND stock = 0 AND status = 'active';
UPDATE products SET status = 'draft' WHERE is_active = false AND status = 'active';

CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- ─── PRODUCT MANAGEMENT INDEX ───────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- ─── 1. PRODUCTS LIST (paginated, filtered, sorted) ────────────────────────

CREATE OR REPLACE FUNCTION get_products_management(
  p_page         INT DEFAULT 1,
  p_page_size    INT DEFAULT 20,
  p_search       TEXT DEFAULT NULL,
  p_sort_by      TEXT DEFAULT 'created_at',
  p_sort_dir     TEXT DEFAULT 'desc',
  p_status       TEXT DEFAULT NULL,
  p_category_id  UUID DEFAULT NULL,
  p_stock_status TEXT DEFAULT NULL
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

  IF p_status IS NOT NULL AND p_status != '' THEN
    v_where := v_where || format(' AND p.status = %L', p_status);
  END IF;

  IF p_category_id IS NOT NULL THEN
    v_where := v_where || format(' AND p.category_id = %L', p_category_id);
  END IF;

  IF p_stock_status IS NOT NULL AND p_stock_status != '' THEN
    IF p_stock_status = 'in_stock' THEN
      v_where := v_where || ' AND p.stock > 0';
    ELSIF p_stock_status = 'low_stock' THEN
      v_where := v_where || ' AND p.stock > 0 AND p.stock <= 10';
    ELSIF p_stock_status = 'out_of_stock' THEN
      v_where := v_where || ' AND p.stock = 0';
    END IF;
  END IF;

  EXECUTE 'SELECT COUNT(*) FROM public.products p' || v_where INTO v_total;

  EXECUTE 'SELECT jsonb_build_object(
    ''products'', COALESCE(jsonb_agg(sub ORDER BY ' ||
    CASE
      WHEN p_sort_by = 'name'    THEN 'sub.name'
      WHEN p_sort_by = 'sku'     THEN 'sub.sku'
      WHEN p_sort_by = 'price'   THEN 'sub.price'
      WHEN p_sort_by = 'stock'   THEN 'sub.stock'
      WHEN p_sort_by = 'status'  THEN 'sub.status'
      WHEN p_sort_by = 'category_name' THEN 'sub.category_name'
      ELSE 'sub.created_at'
    END ||
    CASE WHEN p_sort_dir = 'asc' THEN ' ASC' ELSE ' DESC' END ||
    '), ''[]''::jsonb),
    ''total'', $1
  )
  FROM (
    SELECT
      p.id, p.name, p.sku, p.price, p.stock, p.status, p.is_active,
      p.created_at, p.updated_at,
      COALESCE(c.name, ''—'') AS category_name,
      c.id AS category_id
    FROM public.products p
    LEFT JOIN public.categories c ON c.id = p.category_id'
    || v_where ||
    ' ORDER BY ' ||
    CASE
      WHEN p_sort_by = 'name'    THEN 'p.name'
      WHEN p_sort_by = 'sku'     THEN 'p.sku'
      WHEN p_sort_by = 'price'   THEN 'p.price'
      WHEN p_sort_by = 'stock'   THEN 'p.stock'
      WHEN p_sort_by = 'status'  THEN 'p.status'
      WHEN p_sort_by = 'category_name' THEN 'c.name'
      ELSE 'p.created_at'
    END ||
    CASE WHEN p_sort_dir = 'asc' THEN ' ASC' ELSE ' DESC' END ||
    ' LIMIT ' || p_page_size || ' OFFSET ' || v_offset || '
  ) sub'
  INTO v_result
  USING v_total;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- ─── 2. DUPLICATE PRODUCT ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION duplicate_product(p_product_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_product       RECORD;
  v_new_id        UUID;
  v_new_sku       TEXT;
  v_new_slug      TEXT;
  v_copy_num      INT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'permission denied for role admin';
  END IF;

  SELECT * INTO v_product FROM public.products WHERE id = p_product_id;
  IF v_product.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Product not found');
  END IF;

  v_copy_num := 1;
  LOOP
    v_new_sku := COALESCE(v_product.sku, 'SKU') || '-COPY-' || v_copy_num;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.products WHERE sku = v_new_sku);
    v_copy_num := v_copy_num + 1;
  END LOOP;

  v_new_slug := v_product.slug || '-copy-' || v_copy_num;

  WHILE EXISTS (SELECT 1 FROM public.products WHERE slug = v_new_slug) LOOP
    v_copy_num := v_copy_num + 1;
    v_new_slug := v_product.slug || '-copy-' || v_copy_num;
  END LOOP;

  INSERT INTO public.products (
    category_id, name, slug, description, price, compare_price,
    sku, stock, badge, fabric, material, color, sizes, size_stock,
    is_active, featured, metadata, status
  ) VALUES (
    v_product.category_id,
    v_product.name || ' (Copy)',
    v_new_slug,
    v_product.description,
    v_product.price,
    v_product.compare_price,
    v_new_sku,
    0,
    v_product.badge,
    v_product.fabric,
    v_product.material,
    v_product.color,
    v_product.sizes,
    v_product.size_stock,
    false,
    false,
    v_product.metadata,
    'draft'
  )
  RETURNING id INTO v_new_id;

  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order)
  SELECT v_new_id, image_url, alt_text, sort_order
  FROM public.product_images
  WHERE product_id = p_product_id;

  RETURN jsonb_build_object('success', true, 'id', v_new_id);
END;
$$;

-- ─── 3. BULK UPDATE PRODUCTS ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION bulk_update_products(
  p_ids      UUID[],
  p_status   TEXT DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_status IS NOT NULL THEN
    UPDATE public.products
    SET status = p_status,
        is_active = CASE WHEN p_status = 'active' OR p_status = 'out_of_stock' THEN true ELSE false END,
        updated_at = now()
    WHERE id = ANY(p_ids);
  END IF;

  IF p_is_active IS NOT NULL AND p_status IS NULL THEN
    UPDATE public.products
    SET is_active = p_is_active,
        status = CASE WHEN p_is_active THEN
          CASE WHEN stock > 0 THEN 'active' ELSE 'out_of_stock' END
        ELSE 'draft' END,
        updated_at = now()
    WHERE id = ANY(p_ids);
  END IF;

  RETURN jsonb_build_object('success', true, 'updated', (SELECT COUNT(*) FROM unnest(p_ids) AS t WHERE t = ANY(p_ids)));
END;
$$;

-- ─── 4. BULK DELETE PRODUCTS ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION bulk_delete_products(p_ids UUID[])
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  DELETE FROM public.products WHERE id = ANY(p_ids);
  SELECT jsonb_build_object('success', true);
$$;

-- ============================================================================
-- End of migration 013
-- ============================================================================
