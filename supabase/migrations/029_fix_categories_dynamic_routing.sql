-- ============================================================================
-- ANORA — Dynamic Categories & Frontend Routing
-- Migration 029: Update category RPCs with hierarchy support, add public RPCs.
-- ============================================================================

-- ─── DROP OLD OVERLOADS ─────────────────────────────────────────────────────

DROP FUNCTION IF EXISTS public.create_category(p_name TEXT, p_slug TEXT);
DROP FUNCTION IF EXISTS public.update_category(p_id UUID, p_name TEXT, p_slug TEXT);

-- ─── CREATE CATEGORY (full fields, with hierarchy) ──────────────────────────

CREATE OR REPLACE FUNCTION public.create_category(
  p_name        TEXT,
  p_slug        TEXT,
  p_parent_id   UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_image_url   TEXT DEFAULT NULL,
  p_sort_order  INT DEFAULT 0,
  p_is_active   BOOLEAN DEFAULT true
)
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

  INSERT INTO public.categories (name, slug, parent_id, description, image_url, sort_order, is_active)
  VALUES (p_name, p_slug, p_parent_id, p_description, p_image_url, p_sort_order, p_is_active)
  RETURNING id INTO v_id;

  RETURN jsonb_build_object('success', true, 'id', v_id);
END;
$$;

-- ─── UPDATE CATEGORY (full fields, with hierarchy) ──────────────────────────

CREATE OR REPLACE FUNCTION public.update_category(
  p_id          UUID,
  p_name        TEXT,
  p_slug        TEXT,
  p_parent_id   UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_image_url   TEXT DEFAULT NULL,
  p_sort_order  INT DEFAULT 0,
  p_is_active   BOOLEAN DEFAULT true
)
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
  SET name = p_name, slug = p_slug, parent_id = p_parent_id, description = p_description,
      image_url = p_image_url, sort_order = p_sort_order, is_active = p_is_active,
      updated_at = now()
  WHERE id = p_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ─── UPDATE get_categories_management with parent info ──────────────────────

CREATE OR REPLACE FUNCTION public.get_categories_management(
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
      c.parent_id, c.description, c.image_url, c.sort_order,
      (SELECT COUNT(*) FROM public.products p WHERE p.category_id = c.id) AS product_count,
      (SELECT cp.name FROM public.categories cp WHERE cp.id = c.parent_id) AS parent_name
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

-- ─── PUBLIC RPC: get all active categories with children ────────────────────

CREATE OR REPLACE FUNCTION public.get_active_categories()
RETURNS JSONB
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'slug', c.slug,
      'description', c.description,
      'image_url', c.image_url,
      'sort_order', c.sort_order,
      'parent_id', c.parent_id,
      'product_count', (SELECT COUNT(*) FROM public.products p WHERE p.category_id IN (SELECT id FROM public.categories WHERE id = c.id OR parent_id = c.id)),
      'children', COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'id', ch.id,
          'name', ch.name,
          'slug', ch.slug,
          'description', ch.description,
          'image_url', ch.image_url,
          'sort_order', ch.sort_order,
          'product_count', (SELECT COUNT(*) FROM public.products p WHERE p.category_id = ch.id)
        ) ORDER BY ch.sort_order, ch.name)
        FROM public.categories ch
        WHERE ch.parent_id = c.id AND ch.is_active = true
      ), '[]'::jsonb)
    ) ORDER BY c.sort_order, c.name
  ), '[]'::jsonb)
  FROM public.categories c
  WHERE c.parent_id IS NULL AND c.is_active = true;
$$;

-- ─── PUBLIC RPC: get a single category by slug ──────────────────────────────

CREATE OR REPLACE FUNCTION public.get_category_by_slug(p_slug TEXT)
RETURNS JSONB
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'id', c.id,
    'name', c.name,
    'slug', c.slug,
    'description', c.description,
    'image_url', c.image_url,
    'parent_id', c.parent_id,
    'sort_order', c.sort_order,
    'is_active', c.is_active,
    'parent_name', (SELECT cp.name FROM public.categories cp WHERE cp.id = c.parent_id)
  )
  FROM public.categories c
  WHERE c.slug = p_slug AND c.is_active = true;
$$;

-- ─── PUBLIC RPC: get products by category slug ──────────────────────────────

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
  WHERE c.slug = p_slug AND p.is_active = true;
$$;

-- ============================================================================
-- End of migration 029
-- ============================================================================
