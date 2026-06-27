-- Migration 028: Fix RPC schema qualification and overload issues
--
-- 1. All PERFORM require_admin() inside SET search_path = '' functions
--    must use public.require_admin() to resolve correctly.
-- 2. get_products_management had two overloads (7-param and 8-param);
--    drop both and recreate with correct 8-param signature.

-- ─── Require_admin itself (no change needed, just reference) ──────────────
-- require_admin() has SET search_path = '', but it only accesses
-- public.admin_roles (schema-qualified) so it works fine.

-- ─── Fix functions with SET search_path = '' ──────────────────────────────
-- All bare PERFORM require_admin() must become PERFORM public.require_admin()

-- adjust_stock
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
  PERFORM public.require_admin();

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

-- add_stock
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
  PERFORM public.require_admin();

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

-- remove_stock
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
  PERFORM public.require_admin();

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

-- get_inventory_management
DROP FUNCTION IF EXISTS get_inventory_management(p_page INT, p_page_size INT, p_sort_by TEXT, p_sort_dir TEXT, p_search TEXT, p_stock_status TEXT, p_category_id UUID);
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
  PERFORM public.require_admin();

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

-- resolve_alert
CREATE OR REPLACE FUNCTION resolve_alert(p_alert_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  PERFORM public.require_admin();

  UPDATE public.inventory_alerts
  SET resolved = true, resolved_at = now()
  WHERE id = p_alert_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- update_order_status
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
  PERFORM public.require_admin();

  UPDATE public.orders
  SET status = p_status, notes = COALESCE(p_notes, notes), updated_at = now()
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- get_customers_management — DROP both overloads, create unified 7-param version
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
  PERFORM public.require_admin();

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

-- get_products_management — DROP both overloads, create unified 8-param version
DROP FUNCTION IF EXISTS get_products_management(p_page INT, p_page_size INT, p_search TEXT, p_sort_by TEXT, p_sort_dir TEXT, p_category_id UUID, p_status TEXT);
DROP FUNCTION IF EXISTS get_products_management(p_page INT, p_page_size INT, p_search TEXT, p_sort_by TEXT, p_sort_dir TEXT, p_status TEXT, p_category_id UUID, p_stock_status TEXT);

CREATE OR REPLACE FUNCTION get_products_management(
  p_page         INT DEFAULT 1,
  p_page_size    INT DEFAULT 20,
  p_search       TEXT DEFAULT NULL,
  p_sort_by      TEXT DEFAULT 'name',
  p_sort_dir     TEXT DEFAULT 'asc',
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
  PERFORM public.require_admin();

  v_offset := (p_page - 1) * p_page_size;

  IF p_search IS NOT NULL AND p_search != '' THEN
    v_where := v_where || format(' AND (p.name ILIKE %L OR p.sku ILIKE %L)', '%' || p_search || '%', '%' || p_search || '%');
  END IF;
  IF p_status = 'active' THEN
    v_where := v_where || ' AND p.is_active = true';
  ELSIF p_status = 'inactive' THEN
    v_where := v_where || ' AND p.is_active = false';
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

  EXECUTE format(
    'SELECT jsonb_build_object(
      ''total'', (SELECT COUNT(*) FROM public.products p %s),
      ''products'', COALESCE(jsonb_agg(sub), ''[]''::jsonb)
    )
    FROM (
      SELECT p.id, p.name, p.sku, p.price, p.stock, p.is_active, p.created_at,
        COALESCE(c.name, ''Uncategorized'') AS category_name
      FROM public.products p
      LEFT JOIN public.categories c ON c.id = p.category_id
      %s
      ORDER BY %s %s
      LIMIT %s OFFSET %s
    ) sub',
    v_where, v_where,
    CASE WHEN p_sort_by = 'category' THEN 'c.name' WHEN p_sort_by = 'price' THEN 'p.price' WHEN p_sort_by = 'stock' THEN 'p.stock' ELSE 'p.name' END,
    CASE WHEN p_sort_dir = 'desc' THEN 'DESC' ELSE 'ASC' END,
    p_page_size, v_offset
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- get_invoices_management
CREATE OR REPLACE FUNCTION get_invoices_management(
  p_page         INT DEFAULT 1,
  p_page_size    INT DEFAULT 20,
  p_search       TEXT DEFAULT NULL,
  p_sort_by      TEXT DEFAULT 'created_at',
  p_sort_dir     TEXT DEFAULT 'desc',
  p_status_filter TEXT DEFAULT NULL,
  p_date_from    DATE DEFAULT NULL,
  p_date_to      DATE DEFAULT NULL
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
  PERFORM public.require_admin();

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
