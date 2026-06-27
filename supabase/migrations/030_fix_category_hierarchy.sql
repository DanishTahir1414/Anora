-- ============================================================================
-- ANORA — Fix Category Hierarchy
-- Migration 030: Enforce Clothing + Jewellery as the ONLY root categories.
-- ============================================================================

-- ─── STEP 1: Create parent categories and fix existing data ─────────────────

DO $$
DECLARE
  v_clothing_id UUID;
  v_jewellery_id UUID;
  v_pret_id UUID;
BEGIN
  -- Create Clothing parent (if not exists)
  SELECT id INTO v_clothing_id FROM public.categories WHERE slug = 'clothing';
  IF v_clothing_id IS NULL THEN
    INSERT INTO public.categories (name, slug, description, sort_order, is_active)
    VALUES ('Clothing', 'clothing', 'Silks, cashmere and ceremonial dress — slow tailored in our atelier.', 1, true)
    RETURNING id INTO v_clothing_id;
  ELSE
    UPDATE public.categories SET parent_id = NULL, is_active = true, updated_at = now() WHERE id = v_clothing_id;
  END IF;

  -- Create Jewellery parent (if not exists)
  SELECT id INTO v_jewellery_id FROM public.categories WHERE slug = 'jewellery';
  IF v_jewellery_id IS NULL THEN
    INSERT INTO public.categories (name, slug, description, sort_order, is_active)
    VALUES ('Jewellery', 'jewellery', 'Recycled 18k gold and considered stones, finished entirely by hand.', 2, true)
    RETURNING id INTO v_jewellery_id;
  ELSE
    UPDATE public.categories SET parent_id = NULL, is_active = true, updated_at = now() WHERE id = v_jewellery_id;
  END IF;

  -- Move Pret under Clothing
  SELECT id INTO v_pret_id FROM public.categories WHERE slug = 'pret';
  IF v_pret_id IS NOT NULL THEN
    UPDATE public.categories SET parent_id = v_clothing_id, updated_at = now() WHERE id = v_pret_id;
  END IF;

  -- Deactivate "test" category (no products depend on it)
  UPDATE public.categories SET is_active = false, updated_at = now() WHERE slug = 'test';

  -- Create Clothing subcategories
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'men') THEN
    INSERT INTO public.categories (name, slug, parent_id, sort_order, is_active) VALUES ('Men', 'men', v_clothing_id, 1, true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'women') THEN
    INSERT INTO public.categories (name, slug, parent_id, sort_order, is_active) VALUES ('Women', 'women', v_clothing_id, 2, true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'kids') THEN
    INSERT INTO public.categories (name, slug, parent_id, sort_order, is_active) VALUES ('Kids', 'kids', v_clothing_id, 3, true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'unstitched') THEN
    INSERT INTO public.categories (name, slug, parent_id, sort_order, is_active) VALUES ('Unstitched', 'unstitched', v_clothing_id, 4, true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'ready-to-wear') THEN
    INSERT INTO public.categories (name, slug, parent_id, sort_order, is_active) VALUES ('Ready To Wear', 'ready-to-wear', v_clothing_id, 5, true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'bridal') THEN
    INSERT INTO public.categories (name, slug, parent_id, sort_order, is_active) VALUES ('Bridal', 'bridal', v_clothing_id, 6, true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'luxury-pret') THEN
    INSERT INTO public.categories (name, slug, parent_id, sort_order, is_active) VALUES ('Luxury Pret', 'luxury-pret', v_clothing_id, 7, true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'formal-wear') THEN
    INSERT INTO public.categories (name, slug, parent_id, sort_order, is_active) VALUES ('Formal Wear', 'formal-wear', v_clothing_id, 8, true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'casual-wear') THEN
    INSERT INTO public.categories (name, slug, parent_id, sort_order, is_active) VALUES ('Casual Wear', 'casual-wear', v_clothing_id, 9, true);
  END IF;

  -- Create Jewellery subcategories
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'rings') THEN
    INSERT INTO public.categories (name, slug, parent_id, sort_order, is_active) VALUES ('Rings', 'rings', v_jewellery_id, 1, true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'earrings') THEN
    INSERT INTO public.categories (name, slug, parent_id, sort_order, is_active) VALUES ('Earrings', 'earrings', v_jewellery_id, 2, true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'necklaces') THEN
    INSERT INTO public.categories (name, slug, parent_id, sort_order, is_active) VALUES ('Necklaces', 'necklaces', v_jewellery_id, 3, true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'bracelets') THEN
    INSERT INTO public.categories (name, slug, parent_id, sort_order, is_active) VALUES ('Bracelets', 'bracelets', v_jewellery_id, 4, true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'bangles') THEN
    INSERT INTO public.categories (name, slug, parent_id, sort_order, is_active) VALUES ('Bangles', 'bangles', v_jewellery_id, 5, true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'sets') THEN
    INSERT INTO public.categories (name, slug, parent_id, sort_order, is_active) VALUES ('Sets', 'sets', v_jewellery_id, 6, true);
  END IF;
END $$;

-- ─── STEP 2: Enforce parent_id requirement in create_category ───────────────

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
  IF p_parent_id IS NULL AND p_slug NOT IN ('clothing', 'jewellery') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only Clothing and Jewellery can be top-level categories. All other categories must have a parent.');
  END IF;

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

-- ─── STEP 3: Enforce parent_id constraint in update_category ────────────────

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
DECLARE
  v_current_slug TEXT;
BEGIN
  SELECT slug INTO v_current_slug FROM public.categories WHERE id = p_id;

  IF p_parent_id IS NULL AND v_current_slug NOT IN ('clothing', 'jewellery') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only Clothing and Jewellery can be top-level categories.');
  END IF;

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

-- ─── STEP 4: Update get_products_by_category_slug — include children ────────

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
      'category_id', c.id
    ) ORDER BY p.created_at DESC
  ), '[]'::jsonb)
  FROM public.products p
  JOIN public.categories c ON c.id = p.category_id
  WHERE c.id IN (SELECT id FROM target_ids) AND p.is_active = true;
$$;

-- ─── STEP 5: Create helper RPC for admin parent category dropdown ──────────

CREATE OR REPLACE FUNCTION public.get_parent_categories()
RETURNS JSONB
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug)
    ORDER BY c.sort_order, c.name
  ), '[]'::jsonb)
  FROM public.categories c
  WHERE c.parent_id IS NULL AND c.is_active = true;
$$;

-- ============================================================================
-- End of migration 030
-- ============================================================================
