-- ============================================================================
-- Migration 031: Fix subcategory product filtering
-- ============================================================================
-- Adds a new RPC that filters products by BOTH parent category slug and
-- subcategory slug, ensuring subcategory pages only show assigned products.
-- ============================================================================

-- ─── STEP 1: New RPC for explicit dual-slug filtering ──────────────────────

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
      'category_id', c.id
    ) ORDER BY p.created_at DESC
  ), '[]'::jsonb)
  FROM public.products p
  JOIN public.categories c ON c.id = p.category_id
  JOIN public.categories pc ON pc.id = c.parent_id
  WHERE c.slug = p_subcategory_slug
    AND pc.slug = p_category_slug
    AND p.is_active = true;
$$;

-- ─── STEP 2: Grant execute ─────────────────────────────────────────────────

GRANT EXECUTE ON FUNCTION public.get_products_by_category_and_subcategory TO authenticated, anon;

-- ============================================================================
-- End of migration 031
-- ============================================================================
