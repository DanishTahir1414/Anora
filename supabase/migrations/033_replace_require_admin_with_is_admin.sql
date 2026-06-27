-- ============================================================================
-- Migration 033: Replace require_admin() with public.is_admin() 
-- ============================================================================
-- require_admin() was never properly created in the database. All functions
-- that reference it (via PERFORM require_admin() or PERFORM public.require_admin())
-- fail with "function require_admin() does not exist" (42883).
--
-- The project already has working admin check functions:
--   public.is_admin()      — returns true if user has role 'admin'
--   public.has_admin_role() — checks specific role
--   public.is_staff()      — checks any admin role
--
-- Fix: Replace every PERFORM require_admin() / PERFORM public.require_admin()
-- with IF NOT public.is_admin() THEN RAISE EXCEPTION ... END IF;
-- ============================================================================

-- ─── Replacement helper ─────────────────────────────────────────────────────
-- Every occurrence of:
--     PERFORM require_admin();
--     PERFORM public.require_admin();
-- becomes:
--     IF NOT public.is_admin() THEN
--       RAISE EXCEPTION 'permission denied for role admin';
--     END IF;

-- ============================================================================
-- SECTION 1: Functions redefined in migration 028 (latest non-032 definition)
-- ============================================================================

-- ─── adjust_stock ───────────────────────────────────────────────────────────

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
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'permission denied for role admin';
  END IF;

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
    CASE WHEN v_diff > 0 THEN 'restock'::public.inventory_change_type ELSE 'adjustment'::public.inventory_change_type END,
    v_diff,
    p_new_stock,
    'admin-adjustment',
    COALESCE(p_reason, CASE WHEN v_diff > 0 THEN 'Manual stock addition' ELSE 'Manual stock adjustment' END),
    auth.uid()
  );

  PERFORM public.check_and_generate_alerts(p_product_id);

  RETURN jsonb_build_object(
    'success', true,
    'previous_stock', v_old_stock,
    'new_stock', p_new_stock
  );
END;
$$;

-- ─── add_stock ──────────────────────────────────────────────────────────────

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
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'permission denied for role admin';
  END IF;

  IF p_quantity <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Quantity must be greater than 0');
  END IF;

  SELECT stock INTO v_current_stock FROM public.products WHERE id = p_product_id;
  IF v_current_stock IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Product not found');
  END IF;

  RETURN public.adjust_stock(p_product_id, v_current_stock + p_quantity, p_reason);
END;
$$;

-- ─── remove_stock ───────────────────────────────────────────────────────────

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
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'permission denied for role admin';
  END IF;

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

  RETURN public.adjust_stock(p_product_id, v_current_stock - p_quantity, p_reason);
END;
$$;

-- ─── get_inventory_management ───────────────────────────────────────────────

DROP FUNCTION IF EXISTS get_inventory_management(integer, integer, text, text, text, text, uuid);

CREATE OR REPLACE FUNCTION get_inventory_management(
  p_page         INT DEFAULT 1,
  p_page_size    INT DEFAULT 20,
  p_sort_by      TEXT DEFAULT 'name',
  p_sort_dir     TEXT DEFAULT 'asc',
  p_search       TEXT DEFAULT NULL,
  p_stock_status TEXT DEFAULT NULL,
  p_category_id  UUID DEFAULT NULL
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
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'permission denied for role admin';
  END IF;

  v_offset := (p_page - 1) * p_page_size;

  IF p_search IS NOT NULL AND p_search != '' THEN
    v_where := v_where || format(' AND (p.name ILIKE %L OR p.sku ILIKE %L)', '%' || p_search || '%', '%' || p_search || '%');
  END IF;
  IF p_stock_status = 'low' THEN
    v_where := v_where || ' AND p.stock > 0 AND p.stock <= 10';
  ELSIF p_stock_status = 'out' THEN
    v_where := v_where || ' AND p.stock = 0';
  ELSIF p_stock_status = 'overstock' THEN
    v_where := v_where || ' AND p.stock > 100';
  END IF;
  IF p_category_id IS NOT NULL THEN
    v_where := v_where || format(' AND p.category_id = %L', p_category_id);
  END IF;

  v_order := CASE p_sort_by
    WHEN 'stock' THEN 'p.stock'
    WHEN 'updated_at' THEN 'p.updated_at'
    WHEN 'category' THEN 'c.name'
    ELSE 'p.name'
  END;
  v_order := v_order || CASE WHEN p_sort_dir = 'desc' THEN ' DESC' ELSE ' ASC' END;

  EXECUTE format(
    'SELECT jsonb_build_object(
      ''total'', (SELECT COUNT(*) FROM public.products p %s),
      ''products'', COALESCE(jsonb_agg(sub), ''[]''::jsonb)
    )
    FROM (
      SELECT
        p.id, p.name, p.sku, p.stock, p.is_active, p.updated_at,
        COALESCE(c.name, ''Uncategorized'') AS category_name
      FROM public.products p
      LEFT JOIN public.categories c ON c.id = p.category_id
      %s
      ORDER BY %s
      LIMIT %s OFFSET %s
    ) sub',
    v_where, v_where, v_order, p_page_size, v_offset
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- ─── resolve_alert ──────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION resolve_alert(p_alert_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'permission denied for role admin';
  END IF;

  UPDATE public.inventory_alerts
  SET resolved = true, resolved_at = now()
  WHERE id = p_alert_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ─── update_order_status ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id UUID,
  p_status   TEXT,
  p_notes    TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'permission denied for role admin';
  END IF;

  UPDATE public.orders
  SET status = p_status, notes = COALESCE(p_notes, notes), updated_at = now()
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ─── get_customers_management ───────────────────────────────────────────────

DROP FUNCTION IF EXISTS public.get_customers_management(p_page INT, p_page_size INT, p_search TEXT, p_sort_by TEXT, p_sort_dir TEXT);
DROP FUNCTION IF EXISTS public.get_customers_management(p_page INT, p_page_size INT, p_search TEXT, p_sort_by TEXT, p_sort_dir TEXT, p_segment TEXT, p_activity TEXT);

CREATE OR REPLACE FUNCTION get_customers_management(
  p_page       INT DEFAULT 1,
  p_page_size  INT DEFAULT 20,
  p_search     TEXT DEFAULT NULL,
  p_sort_by    TEXT DEFAULT 'created_at',
  p_sort_dir   TEXT DEFAULT 'desc',
  p_segment    TEXT DEFAULT NULL,
  p_activity   TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_offset    INT;
  v_total     INT;
  v_result    JSONB;
  v_where     TEXT := 'p.role = ''customer''';
  v_having    TEXT := '';
  v_seg_where TEXT := 'TRUE';
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'permission denied for role admin';
  END IF;

  v_offset := (p_page - 1) * p_page_size;

  IF p_search IS NOT NULL AND p_search != '' THEN
    v_where := v_where || format(' AND (p.email ILIKE %L OR p.first_name ILIKE %L OR p.last_name ILIKE %L OR p.first_name || '' '' || p.last_name ILIKE %L)', '%' || p_search || '%', '%' || p_search || '%', '%' || p_search || '%', '%' || p_search || '%');
  END IF;

  IF p_activity = 'active' THEN
    v_having := ' HAVING (MAX(o.created_at) >= NOW() - INTERVAL ''90 days'' OR COUNT(o.id) > 0)';
  ELSIF p_activity = 'inactive' THEN
    v_having := ' HAVING (MAX(o.created_at) IS NULL OR MAX(o.created_at) < NOW() - INTERVAL ''90 days'')';
  END IF;

  IF p_segment IS NOT NULL AND p_segment != '' AND p_segment != 'all' THEN
    v_seg_where := format('segment = %L', p_segment);
  END IF;

  EXECUTE format(
    'SELECT COUNT(*) FROM (SELECT p.id FROM public.profiles p LEFT JOIN public.orders o ON o.user_id = p.id WHERE %s GROUP BY p.id%s) cnt',
    v_where, v_having
  ) INTO v_total;

  EXECUTE format(
    'SELECT jsonb_build_object(
      ''total'', %s,
      ''customers'', COALESCE(jsonb_agg(sub), ''[]''::jsonb)
    )
    FROM (
      SELECT * FROM (
        SELECT p.id, p.first_name, p.last_name, p.email, p.phone, p.avatar_url,
          p.created_at AS registration_date,
          GREATEST(p.updated_at, MAX(o.created_at)) AS last_activity,
          COUNT(DISTINCT o.id) AS orders_count,
          COALESCE(SUM(o.total) FILTER (WHERE o.status NOT IN (''cancelled'', ''refunded'')), 0) AS total_spent,
          MAX(o.created_at) AS last_order_at,
          CASE WHEN COALESCE(SUM(o.total) FILTER (WHERE o.status NOT IN (''cancelled'', ''refunded'')), 0) >= 1000 THEN ''vip'' WHEN COUNT(DISTINCT o.id) >= 2 THEN ''returning'' ELSE ''new'' END AS segment
        FROM public.profiles p
        LEFT JOIN public.orders o ON o.user_id = p.id
        WHERE %s
        GROUP BY p.id%s
      ) analytics
      WHERE %s
      ORDER BY %s %s
      LIMIT %s OFFSET %s
    ) sub',
    v_total, v_where, v_having, v_seg_where,
    CASE WHEN p_sort_by = 'name' THEN 'first_name' WHEN p_sort_by = 'email' THEN 'email' WHEN p_sort_by = 'orders_count' THEN 'orders_count' WHEN p_sort_by = 'total_spent' THEN 'total_spent' WHEN p_sort_by = 'created_at' THEN 'registration_date' WHEN p_sort_by = 'last_activity' THEN 'last_activity' ELSE 'registration_date' END,
    CASE WHEN p_sort_dir = 'asc' THEN 'ASC' ELSE 'DESC' END,
    p_page_size, v_offset
  ) INTO v_result;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- ─── get_invoices_management ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_invoices_management(
  p_page          INT DEFAULT 1,
  p_page_size     INT DEFAULT 20,
  p_search        TEXT DEFAULT NULL,
  p_sort_by       TEXT DEFAULT 'created_at',
  p_sort_dir      TEXT DEFAULT 'desc',
  p_status_filter TEXT DEFAULT NULL,
  p_date_from     DATE DEFAULT NULL,
  p_date_to       DATE DEFAULT NULL
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
  v_where  TEXT := 'TRUE';
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'permission denied for role admin';
  END IF;

  v_offset := (p_page - 1) * p_page_size;

  IF p_search IS NOT NULL AND p_search != '' THEN
    v_where := v_where || format(' AND (i.invoice_number ILIKE %L OR i.customer_name ILIKE %L OR i.customer_email ILIKE %L)', '%' || p_search || '%', '%' || p_search || '%', '%' || p_search || '%');
  END IF;
  IF p_status_filter IS NOT NULL AND p_status_filter != '' THEN
    v_where := v_where || format(' AND i.status = %L', p_status_filter);
  END IF;
  IF p_date_from IS NOT NULL THEN
    v_where := v_where || format(' AND i.issued_at >= %L::timestamptz', p_date_from);
  END IF;
  IF p_date_to IS NOT NULL THEN
    v_where := v_where || format(' AND i.issued_at <= %L::timestamptz', p_date_to);
  END IF;

  EXECUTE format(
    'SELECT jsonb_build_object(
      ''total'', (SELECT COUNT(*) FROM public.invoices i WHERE %s),
      ''invoices'', COALESCE(jsonb_agg(sub), ''[]''::jsonb)
    )
    FROM (
      SELECT i.id, i.invoice_number, i.customer_name, i.customer_email,
        i.subtotal, i.tax_amount, i.total_amount, i.status, i.issued_at, i.paid_at
      FROM public.invoices i
      WHERE %s
      ORDER BY %s %s
      LIMIT %s OFFSET %s
    ) sub',
    v_where, v_where,
    CASE WHEN p_sort_by = 'total' THEN 'i.total_amount' WHEN p_sort_by = 'status' THEN 'i.status' WHEN p_sort_by = 'issued_at' THEN 'i.issued_at' ELSE 'i.created_at' END,
    CASE WHEN p_sort_dir = 'desc' THEN 'DESC' ELSE 'ASC' END,
    p_page_size, v_offset
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- ============================================================================
-- SECTION 2: Functions redefined/created in migration 032
-- ============================================================================

-- ─── get_admin_product ──────────────────────────────────────────────────────

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
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'permission denied for role admin';
  END IF;

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

-- ─── get_products_management ────────────────────────────────────────────────

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
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'permission denied for role admin';
  END IF;

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
    'SELECT jsonb_build_object(
      ''total'', (SELECT COUNT(*) FROM public.products p %s),
      ''products'', COALESCE(
        (SELECT jsonb_agg(item) FROM (
          SELECT jsonb_build_object(
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
          ) AS item
          FROM public.products p
          LEFT JOIN public.categories c ON c.id = p.category_id
          %s
          ORDER BY %s
          OFFSET %L LIMIT %L
        ) sub),
        ''[]''::jsonb
      )
    )',
    v_where, v_where, v_order, v_offset, p_page_size
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- ============================================================================
-- SECTION 3: Security/audit functions from migration 027 (not in 028/032)
-- ============================================================================

-- ─── get_activity_timeline ──────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_activity_timeline(
  p_page INT DEFAULT 1,
  p_page_size INT DEFAULT 50,
  p_entity_type TEXT DEFAULT NULL,
  p_action TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_date_from TIMESTAMPTZ DEFAULT NULL,
  p_date_to TIMESTAMPTZ DEFAULT NULL,
  p_actor_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offset INT;
  v_total INT;
  v_results JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'permission denied for role admin';
  END IF;

  v_offset := (p_page - 1) * p_page_size;

  SELECT COUNT(*) INTO v_total
  FROM audit_logs al
  WHERE (p_entity_type IS NULL OR al.entity_type = p_entity_type)
    AND (p_action IS NULL OR al.action = p_action)
    AND (p_search IS NULL OR al.entity_type ILIKE '%' || p_search || '%' OR al.action ILIKE '%' || p_search || '%')
    AND (p_date_from IS NULL OR al.created_at >= p_date_from)
    AND (p_date_to IS NULL OR al.created_at <= p_date_to)
    AND (p_actor_id IS NULL OR al.actor_id = p_actor_id);

  SELECT COALESCE(jsonb_agg(sub), '[]'::JSONB) INTO v_results
  FROM (
    SELECT
      al.id,
      al.actor_id,
      al.action,
      al.entity_type,
      al.entity_id,
      al.old_data,
      al.new_data,
      al.metadata,
      al.created_at,
      CASE
        WHEN p.first_name IS NOT NULL OR p.last_name IS NOT NULL
        THEN TRIM(COALESCE(p.first_name,'') || ' ' || COALESCE(p.last_name,''))
        ELSE p.email
      END AS actor_name,
      p.avatar_url AS actor_avatar
    FROM audit_logs al
    LEFT JOIN profiles p ON p.id = al.actor_id
    WHERE (p_entity_type IS NULL OR al.entity_type = p_entity_type)
      AND (p_action IS NULL OR al.action = p_action)
      AND (p_search IS NULL OR al.entity_type ILIKE '%' || p_search || '%' OR al.action ILIKE '%' || p_search || '%')
      AND (p_date_from IS NULL OR al.created_at >= p_date_from)
      AND (p_date_to IS NULL OR al.created_at <= p_date_to)
      AND (p_actor_id IS NULL OR al.actor_id = p_actor_id)
    ORDER BY al.created_at DESC
    LIMIT p_page_size
    OFFSET v_offset
  ) sub;

  RETURN jsonb_build_object(
    'activities', v_results,
    'total', v_total
  );
END;
$$;

-- ─── get_audit_logs ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_audit_logs(
  p_page INT DEFAULT 1,
  p_page_size INT DEFAULT 50,
  p_entity_type TEXT DEFAULT NULL,
  p_action TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_date_from TIMESTAMPTZ DEFAULT NULL,
  p_date_to TIMESTAMPTZ DEFAULT NULL,
  p_actor_id UUID DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'created_at',
  p_sort_dir TEXT DEFAULT 'desc'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offset INT;
  v_total INT;
  v_results JSONB;
  v_order TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'permission denied for role admin';
  END IF;

  v_offset := (p_page - 1) * p_page_size;

  v_order := CASE
    WHEN p_sort_by = 'action' THEN 'al.action'
    WHEN p_sort_by = 'entity_type' THEN 'al.entity_type'
    WHEN p_sort_by = 'actor_name' THEN 'actor_name'
    ELSE 'al.created_at'
  END;
  v_order := v_order || ' ' || CASE WHEN p_sort_dir = 'asc' THEN 'ASC' ELSE 'DESC' END;

  SELECT COUNT(*) INTO v_total
  FROM audit_logs al
  WHERE (p_entity_type IS NULL OR al.entity_type = p_entity_type)
    AND (p_action IS NULL OR al.action = p_action)
    AND (p_search IS NULL OR al.entity_type ILIKE '%' || p_search || '%' OR al.action ILIKE '%' || p_search || '%' OR al.entity_id::TEXT ILIKE '%' || p_search || '%')
    AND (p_date_from IS NULL OR al.created_at >= p_date_from)
    AND (p_date_to IS NULL OR al.created_at <= p_date_to)
    AND (p_actor_id IS NULL OR al.actor_id = p_actor_id);

  EXECUTE format(
    'SELECT COALESCE(jsonb_agg(sub), ''[]''::JSONB) FROM (
      SELECT
        al.id,
        al.actor_id,
        al.action,
        al.entity_type,
        al.entity_id,
        al.old_data,
        al.new_data,
        al.metadata,
        al.ip_address,
        al.user_agent,
        al.created_at,
        CASE
          WHEN p.first_name IS NOT NULL OR p.last_name IS NOT NULL
          THEN TRIM(COALESCE(p.first_name,'''') || '' '' || COALESCE(p.last_name,''''))
          ELSE p.email
        END AS actor_name
      FROM audit_logs al
      LEFT JOIN profiles p ON p.id = al.actor_id
      WHERE ($1 IS NULL OR al.entity_type = $1)
        AND ($2 IS NULL OR al.action = $2)
        AND ($3 IS NULL OR al.entity_type ILIKE ''%%'' || $3 || ''%%'' OR al.action ILIKE ''%%'' || $3 || ''%%'' OR al.entity_id::TEXT ILIKE ''%%'' || $3 || ''%%'')
        AND ($4 IS NULL OR al.created_at >= $4)
        AND ($5 IS NULL OR al.created_at <= $5)
        AND ($6 IS NULL OR al.actor_id = $6)
      ORDER BY %s
      LIMIT $7 OFFSET $8
    ) sub',
    v_order
  ) INTO v_results
  USING p_entity_type, p_action, p_search, p_date_from, p_date_to, p_actor_id, p_page_size, v_offset;

  RETURN jsonb_build_object(
    'logs', v_results,
    'total', v_total
  );
END;
$$;

-- ─── get_admin_activity ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_admin_activity(
  p_page INT DEFAULT 1,
  p_page_size INT DEFAULT 50,
  p_action TEXT DEFAULT NULL,
  p_entity_type TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_date_from TIMESTAMPTZ DEFAULT NULL,
  p_date_to TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offset INT;
  v_total INT;
  v_results JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'permission denied for role admin';
  END IF;

  v_offset := (p_page - 1) * p_page_size;

  SELECT COUNT(*) INTO v_total
  FROM admin_activity aa
  WHERE (p_action IS NULL OR aa.action = p_action)
    AND (p_entity_type IS NULL OR aa.entity_type = p_entity_type)
    AND (p_search IS NULL OR aa.action ILIKE '%' || p_search || '%' OR aa.entity_type ILIKE '%' || p_search || '%')
    AND (p_date_from IS NULL OR aa.created_at >= p_date_from)
    AND (p_date_to IS NULL OR aa.created_at <= p_date_to);

  SELECT COALESCE(jsonb_agg(sub), '[]'::JSONB) INTO v_results
  FROM (
    SELECT
      aa.id,
      aa.admin_id,
      aa.action,
      aa.entity_type,
      aa.entity_id,
      aa.details,
      aa.ip_address,
      aa.created_at,
      CASE
        WHEN p.first_name IS NOT NULL OR p.last_name IS NOT NULL
        THEN TRIM(COALESCE(p.first_name,'') || ' ' || COALESCE(p.last_name,''))
        ELSE p.email
      END AS admin_name,
      p.avatar_url
    FROM admin_activity aa
    LEFT JOIN profiles p ON p.id = aa.admin_id
    WHERE (p_action IS NULL OR aa.action = p_action)
      AND (p_entity_type IS NULL OR aa.entity_type = p_entity_type)
      AND (p_search IS NULL OR aa.action ILIKE '%' || p_search || '%' OR aa.entity_type ILIKE '%' || p_search || '%')
      AND (p_date_from IS NULL OR aa.created_at >= p_date_from)
      AND (p_date_to IS NULL OR aa.created_at <= p_date_to)
    ORDER BY aa.created_at DESC
    LIMIT p_page_size
    OFFSET v_offset
  ) sub;

  RETURN jsonb_build_object(
    'activities', v_results,
    'total', v_total
  );
END;
$$;

-- ─── get_active_sessions ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_active_sessions(
  p_page INT DEFAULT 1,
  p_page_size INT DEFAULT 50,
  p_search TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offset INT;
  v_total INT;
  v_results JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'permission denied for role admin';
  END IF;

  v_offset := (p_page - 1) * p_page_size;

  SELECT COUNT(*) INTO v_total
  FROM device_sessions ds
  WHERE ds.is_active = true
    AND (p_search IS NULL OR ds.device_name ILIKE '%' || p_search || '%' OR ds.browser ILIKE '%' || p_search || '%');

  SELECT COALESCE(jsonb_agg(sub), '[]'::JSONB) INTO v_results
  FROM (
    SELECT
      ds.id,
      ds.user_id,
      ds.device_name,
      ds.browser,
      ds.os,
      ds.ip_address,
      ds.last_activity_at,
      ds.started_at,
      ds.session_id,
      CASE
        WHEN p.first_name IS NOT NULL OR p.last_name IS NOT NULL
        THEN TRIM(COALESCE(p.first_name,'') || ' ' || COALESCE(p.last_name,''))
        ELSE p.email
      END AS user_name,
      p.avatar_url
    FROM device_sessions ds
    LEFT JOIN profiles p ON p.id = ds.user_id
    WHERE ds.is_active = true
      AND (p_search IS NULL OR ds.device_name ILIKE '%' || p_search || '%' OR ds.browser ILIKE '%' || p_search || '%')
    ORDER BY ds.last_activity_at DESC
    LIMIT p_page_size
    OFFSET v_offset
  ) sub;

  RETURN jsonb_build_object(
    'sessions', v_results,
    'total', v_total
  );
END;
$$;

-- ─── get_failed_login_summary ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_failed_login_summary(
  p_page INT DEFAULT 1,
  p_page_size INT DEFAULT 50,
  p_search TEXT DEFAULT NULL,
  p_date_from TIMESTAMPTZ DEFAULT NULL,
  p_date_to TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offset INT;
  v_total INT;
  v_results JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'permission denied for role admin';
  END IF;

  v_offset := (p_page - 1) * p_page_size;

  SELECT COUNT(*) INTO v_total
  FROM failed_login_attempts fl
  WHERE (p_search IS NULL OR fl.email ILIKE '%' || p_search || '%' OR fl.ip_address ILIKE '%' || p_search || '%')
    AND (p_date_from IS NULL OR fl.last_attempt_at >= p_date_from)
    AND (p_date_to IS NULL OR fl.last_attempt_at <= p_date_to);

  SELECT COALESCE(jsonb_agg(sub), '[]'::JSONB) INTO v_results
  FROM (
    SELECT
      fl.id,
      fl.user_id,
      fl.email,
      fl.ip_address,
      fl.user_agent,
      fl.attempt_count,
      fl.last_attempt_at,
      fl.created_at,
      CASE
        WHEN p.first_name IS NOT NULL OR p.last_name IS NOT NULL
        THEN TRIM(COALESCE(p.first_name,'') || ' ' || COALESCE(p.last_name,''))
        ELSE p.email
      END AS user_name
    FROM failed_login_attempts fl
    LEFT JOIN profiles p ON p.id = fl.user_id
    WHERE (p_search IS NULL OR fl.email ILIKE '%' || p_search || '%' OR fl.ip_address ILIKE '%' || p_search || '%')
      AND (p_date_from IS NULL OR fl.last_attempt_at >= p_date_from)
      AND (p_date_to IS NULL OR fl.last_attempt_at <= p_date_to)
    ORDER BY fl.last_attempt_at DESC
    LIMIT p_page_size
    OFFSET v_offset
  ) sub;

  RETURN jsonb_build_object(
    'attempts', v_results,
    'total', v_total
  );
END;
$$;

-- ─── get_security_overview ──────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_security_overview()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_failed_logins_24h INT;
  v_active_sessions INT;
  v_locked_accounts INT;
  v_total_admins INT;
  v_recent_alerts JSONB;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'permission denied for role admin';
  END IF;

  SELECT COUNT(*) INTO v_failed_logins_24h
  FROM failed_login_attempts
  WHERE last_attempt_at > now() - INTERVAL '24 hours'
    AND attempt_count >= 3;

  SELECT COUNT(*) INTO v_active_sessions
  FROM device_sessions
  WHERE is_active = true;

  SELECT COUNT(*) INTO v_locked_accounts
  FROM failed_login_attempts
  WHERE attempt_count >= 5
    AND last_attempt_at > now() - INTERVAL '15 minutes';

  SELECT COUNT(*) INTO v_total_admins
  FROM admin_roles
  WHERE role IN ('admin', 'superadmin');

  SELECT COALESCE(jsonb_agg(sub), '[]'::JSONB) INTO v_recent_alerts
  FROM (
    SELECT entity_type, action, created_at
    FROM audit_logs
    WHERE created_at > now() - INTERVAL '24 hours'
      AND action IN ('deleted', 'order_status_changed')
    ORDER BY created_at DESC
    LIMIT 10
  ) sub;

  RETURN jsonb_build_object(
    'failed_logins_24h', v_failed_logins_24h,
    'active_sessions', v_active_sessions,
    'locked_accounts', v_locked_accounts,
    'total_admins', v_total_admins,
    'recent_alerts', v_recent_alerts
  );
END;
$$;

-- ─── Grant execute on all redefined functions ───────────────────────────────

GRANT EXECUTE ON FUNCTION public.adjust_stock TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_stock TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_stock TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_inventory_management TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_alert TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_order_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_customers_management TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_invoices_management TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_product TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_products_management TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_activity_timeline TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_activity TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_sessions TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_failed_login_summary TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_security_overview TO authenticated;

-- ============================================================================
-- End of migration 033
-- ============================================================================
