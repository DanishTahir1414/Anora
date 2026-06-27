-- ============================================================================
-- Migration 034: Include sizes, images, sku, stock, size_stock, color in public
-- product list RPCs so ProductCard can render DB products without crashing.
-- ============================================================================

-- ─── STEP 1: Update get_products_by_category_slug ──────────────────────────

CREATE OR REPLACE FUNCTION public.get_products_by_category_slug(
  p_slug       TEXT,
  p_page       INT DEFAULT 1,
  p_page_size  INT DEFAULT 50
)
RETURNS JSONB
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  WITH target_ids AS (
    SELECT id FROM public.categories WHERE slug = p_slug AND is_active = true
    UNION
    SELECT ch.id FROM public.categories ch JOIN public.categories p ON p.id = ch.parent_id WHERE p.slug = p_slug AND ch.is_active = true
  )
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'name', p.name,
      'slug', p.slug,
      'price', p.price,
      'compare_price', p.compare_price,
      'description', p.description,
      'badge', p.badge,
      'is_active', p.is_active,
      'created_at', p.created_at,
      'category_slug', c.slug,
      'category_name', c.name,
      'category_id', c.id,
      'sizes', p.sizes,
      'sku', p.sku,
      'stock', p.stock,
      'size_stock', p.size_stock,
      'color', p.color,
      'images', COALESCE(
        (SELECT jsonb_agg(pi.image_url ORDER BY pi.sort_order)
         FROM public.product_images pi
         WHERE pi.product_id = p.id),
        '[]'::jsonb
      )
    ) ORDER BY p.created_at DESC
  ), '[]'::jsonb)
  FROM public.products p
  JOIN public.categories c ON c.id = p.category_id
  WHERE c.id IN (SELECT id FROM target_ids) AND p.is_active = true;
$$;

-- ─── STEP 2: Update get_products_by_category_and_subcategory ────────────────

CREATE OR REPLACE FUNCTION public.get_products_by_category_and_subcategory(
  p_category_slug     TEXT,
  p_subcategory_slug  TEXT,
  p_page              INT DEFAULT 1,
  p_page_size         INT DEFAULT 50
)
RETURNS JSONB
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'name', p.name,
      'slug', p.slug,
      'price', p.price,
      'compare_price', p.compare_price,
      'description', p.description,
      'badge', p.badge,
      'is_active', p.is_active,
      'created_at', p.created_at,
      'category_slug', c.slug,
      'category_name', c.name,
      'category_id', c.id,
      'sizes', p.sizes,
      'sku', p.sku,
      'stock', p.stock,
      'size_stock', p.size_stock,
      'color', p.color,
      'images', COALESCE(
        (SELECT jsonb_agg(pi.image_url ORDER BY pi.sort_order)
         FROM public.product_images pi
         WHERE pi.product_id = p.id),
        '[]'::jsonb
      )
    ) ORDER BY p.created_at DESC
  ), '[]'::jsonb)
  FROM public.products p
  JOIN public.categories c ON c.id = p.category_id
  JOIN public.categories pc ON pc.id = c.parent_id
  WHERE c.slug = p_subcategory_slug
    AND pc.slug = p_category_slug
    AND p.is_active = true;
$$;

-- ─── STEP 3: Re-grant execute (idempotent) ─────────────────────────────────

GRANT EXECUTE ON FUNCTION public.get_products_by_category_slug TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_products_by_category_and_subcategory TO authenticated, anon;

-- ============================================================================
-- End of migration 034
-- ============================================================================
