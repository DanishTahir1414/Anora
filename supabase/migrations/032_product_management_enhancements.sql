-- ============================================================================
-- Migration 032: Product management enhancements
-- ============================================================================
-- Adds missing columns to the products table for complete product management.
-- Creates RPCs for frontend product detail loading.
-- ============================================================================

-- ─── STEP 1: Add missing columns to products table ─────────────────────────

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS short_description    TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS low_stock_threshold   INT NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_new               BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_best_seller       BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS colors               JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.products.short_description  IS 'Short description for product cards / listings';
COMMENT ON COLUMN public.products.low_stock_threshold IS 'Stock level at which product is considered low stock';
COMMENT ON COLUMN public.products.is_new              IS 'New Arrival label flag';
COMMENT ON COLUMN public.products.is_best_seller      IS 'Best Seller label flag';
COMMENT ON COLUMN public.products.colors              IS 'JSON array of {name, hex} objects for color variants';

-- ─── STEP 2: Public RPC to fetch a single product by slug with all relations ─

CREATE OR REPLACE FUNCTION public.get_product_by_slug(p_slug TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $$
DECLARE
  v_product JSONB;
  v_images JSONB;
  v_category JSONB;
  v_parent_category JSONB;
BEGIN
  -- Get product
  SELECT jsonb_build_object(
    'id', p.id,
    'name', p.name,
    'slug', p.slug,
    'sku', p.sku,
    'description', p.description,
    'short_description', p.short_description,
    'price', p.price,
    'compare_price', p.compare_price,
    'stock', p.stock,
    'low_stock_threshold', p.low_stock_threshold,
    'sizes', p.sizes,
    'size_stock', COALESCE(p.size_stock, '{}'::jsonb),
    'colors', COALESCE(p.colors, '[]'::jsonb),
    'fabric', p.fabric,
    'material', p.material,
    'badge', p.badge,
    'is_new', p.is_new,
    'is_best_seller', p.is_best_seller,
    'featured', p.featured,
    'is_active', p.is_active,
    'status', p.status,
    'created_at', p.created_at,
    'updated_at', p.updated_at,
    'category_id', p.category_id
  ) INTO v_product
  FROM public.products p
  WHERE p.slug = p_slug AND p.is_active = true;

  IF v_product IS NULL THEN
    RETURN NULL;
  END IF;

  -- Get images ordered by sort_order
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', pi.id,
      'image_url', pi.image_url,
      'alt_text', pi.alt_text,
      'sort_order', pi.sort_order
    ) ORDER BY pi.sort_order, pi.created_at
  ), '[]'::jsonb)
  INTO v_images
  FROM public.product_images pi
  WHERE pi.product_id = (v_product->>'id')::UUID;

  -- Get category info
  SELECT jsonb_build_object(
    'id', c.id,
    'name', c.name,
    'slug', c.slug
  ) INTO v_category
  FROM public.categories c
  WHERE c.id = (v_product->>'category_id')::UUID;

  -- Get parent category
  SELECT jsonb_build_object(
    'id', pc.id,
    'name', pc.name,
    'slug', pc.slug
  ) INTO v_parent_category
  FROM public.categories c
  JOIN public.categories pc ON pc.id = c.parent_id
  WHERE c.id = (v_product->>'category_id')::UUID;

  RETURN jsonb_build_object(
    'product', v_product,
    'images', v_images,
    'category', v_category,
    'parent_category', v_parent_category
  );
END;
$$;

-- ─── STEP 3: RPC for admin — get full product with relations ────────────────

CREATE OR REPLACE FUNCTION public.get_admin_product(p_product_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_product JSONB;
  v_images JSONB;
BEGIN
  PERFORM public.require_admin();

  SELECT jsonb_build_object(
    'id', p.id,
    'name', p.name,
    'slug', p.slug,
    'sku', p.sku,
    'description', p.description,
    'short_description', p.short_description,
    'price', p.price,
    'compare_price', p.compare_price,
    'stock', p.stock,
    'low_stock_threshold', p.low_stock_threshold,
    'sizes', p.sizes,
    'size_stock', COALESCE(p.size_stock, '{}'::jsonb),
    'colors', COALESCE(p.colors, '[]'::jsonb),
    'fabric', p.fabric,
    'material', p.material,
    'badge', p.badge,
    'is_new', p.is_new,
    'is_best_seller', p.is_best_seller,
    'featured', p.featured,
    'is_active', p.is_active,
    'status', p.status,
    'category_id', p.category_id,
    'created_at', p.created_at,
    'updated_at', p.updated_at
  ) INTO v_product
  FROM public.products p
  WHERE p.id = p_product_id;

  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', pi.id,
      'image_url', pi.image_url,
      'alt_text', pi.alt_text,
      'sort_order', pi.sort_order
    ) ORDER BY pi.sort_order, pi.created_at
  ), '[]'::jsonb)
  INTO v_images
  FROM public.product_images pi
  WHERE pi.product_id = p_product_id;

  RETURN jsonb_build_object(
    'product', v_product,
    'images', v_images
  );
END;
$$;

-- ─── STEP 4: Update get_products_management to include thumbnail, subcategory ─

-- Drop old overloads first
DROP FUNCTION IF EXISTS public.get_products_management(INT, INT, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.get_products_management(INT, INT, TEXT, TEXT, TEXT, UUID, TEXT);
DROP FUNCTION IF EXISTS public.get_products_management(INT, INT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT);

CREATE OR REPLACE FUNCTION public.get_products_management(
  p_page         INT DEFAULT 1,
  p_page_size    INT DEFAULT 20,
  p_sort_by      TEXT DEFAULT 'created_at',
  p_sort_dir     TEXT DEFAULT 'desc',
  p_search       TEXT DEFAULT NULL,
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
  v_order  TEXT;
  v_where  TEXT := ' WHERE 1=1';
BEGIN
  PERFORM public.require_admin();

  v_offset := (p_page - 1) * p_page_size;

  IF p_search IS NOT NULL AND p_search != '' THEN
    v_where := v_where || format(' AND (p.name ILIKE %L OR p.sku ILIKE %L)', '%' || p_search || '%', '%' || p_search || '%');
  END IF;

  IF p_status IS NOT NULL AND p_status != '' THEN
    IF p_status = 'out_of_stock' THEN
      v_where := v_where || ' AND p.stock = 0';
    ELSE
      v_where := v_where || format(' AND p.status = %L', p_status);
    END IF;
  END IF;

  IF p_category_id IS NOT NULL THEN
    v_where := v_where || format(' AND p.category_id = %L', p_category_id);
  END IF;

  IF p_stock_status IS NOT NULL AND p_stock_status != '' THEN
    IF p_stock_status = 'in_stock' THEN
      v_where := v_where || ' AND p.stock > 0';
    ELSIF p_stock_status = 'low_stock' THEN
      v_where := v_where || ' AND p.stock > 0 AND p.stock <= p.low_stock_threshold';
    ELSIF p_stock_status = 'out_of_stock' THEN
      v_where := v_where || ' AND p.stock = 0';
    END IF;
  END IF;

  v_order := CASE p_sort_by
    WHEN 'name' THEN 'p.name'
    WHEN 'sku' THEN 'p.sku'
    WHEN 'price' THEN 'p.price'
    WHEN 'stock' THEN 'p.stock'
    WHEN 'status' THEN 'p.status'
    WHEN 'category_name' THEN 'c.name'
    WHEN 'created_at' THEN 'p.created_at'
    ELSE 'p.created_at'
  END;
  v_order := v_order || CASE WHEN p_sort_dir = 'desc' THEN ' DESC NULLS LAST' ELSE ' ASC NULLS LAST' END;

  EXECUTE format(
    'SELECT
      (SELECT COUNT(*) FROM public.products p %s) AS total,
      COALESCE(jsonb_agg(
        jsonb_build_object(
          ''id'', p.id,
          ''name'', p.name,
          ''sku'', p.sku,
          ''price'', p.price,
          ''stock'', p.stock,
          ''status'', p.status,
          ''is_active'', p.is_active,
          ''created_at'', p.created_at,
          ''updated_at'', p.updated_at,
          ''category_name'', COALESCE(c.name, ''—''),
          ''category_id'', p.category_id,
          ''subcategory_name'', COALESCE(c.name, ''—''),
          ''thumbnail'', (SELECT pi.image_url FROM public.product_images pi WHERE pi.product_id = p.id ORDER BY pi.sort_order, pi.created_at LIMIT 1)
        ) ORDER BY %s
      ), ''[]''::jsonb) AS products
    FROM public.products p
    LEFT JOIN public.categories c ON c.id = p.category_id
    %s
    OFFSET %L LIMIT %L',
    v_where, v_order, v_where, v_offset, p_page_size
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- ─── STEP 5: Update the existing get_active_categories to include product_count from children ───
-- (Already updated in migration 030, but ensure product_count uses low_stock_threshold)

-- ─── STEP 6: Grant execute ─────────────────────────────────────────────────

GRANT EXECUTE ON FUNCTION public.get_product_by_slug TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_product TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_products_management TO authenticated;

-- ============================================================================
-- End of migration 032
-- ============================================================================
