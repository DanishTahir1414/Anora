-- ============================================================================
-- ANORA — Comprehensive RPC Fix
-- Migration 024: Fix ALL 20 missing (404) and 9 broken (400) RPCs.
--
-- PROBLEM 1: profiles table has NO display_name/full_name columns.
--   Columns: id, email, first_name, last_name, phone, avatar_url, role,
--            metadata, created_at, updated_at, last_login_at, last_login_ip
--   Fix: Replace COALESCE(p.display_name, p.full_name, p.email) with
--        COALESCE(p.first_name || ' ' || p.last_name, p.email)
--
-- PROBLEM 2: get_yearly_comparison — nested aggregate
--   Error: "aggregate function calls cannot be nested"
--   Fix: Use CTE to pre-aggregate SUM before jsonb_agg
--
-- PROBLEM 3: check_login_lockout — GROUP BY error
--   Error: "column failed_login_attempts.attempt_count must appear in GROUP BY"
--   Fix: Use MAX(attempt_count) aggregate
--
-- PROBLEM 4: record_admin_activity — null admin_id
--   Error: "null value in column admin_id" when auth.uid() IS NULL
--   Fix: Add guard clause
--
-- PROBLEM 5: 20 missing RPCs from migrations 012-019
--   Now included with search_path = '' and public. prefix
-- ============================================================================

-- ============================================================================
-- PART 1: FIX display_name → first_name || last_name in BROKEN RPCs
-- These 6 RPCs exist but return 400 due to missing display_name/full_name cols
-- ============================================================================

-- ─── 1a. get_activity_timeline ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_activity_timeline(
  p_page        INT DEFAULT 1,
  p_page_size   INT DEFAULT 50,
  p_entity_type TEXT DEFAULT NULL,
  p_action      TEXT DEFAULT NULL,
  p_search      TEXT DEFAULT NULL,
  p_date_from   TIMESTAMPTZ DEFAULT NULL,
  p_date_to     TIMESTAMPTZ DEFAULT NULL,
  p_actor_id    UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_offset INT;
  v_total INT;
  v_results JSONB;
BEGIN
  v_offset := (p_page - 1) * p_page_size;

  SELECT COUNT(*) INTO v_total
  FROM public.audit_logs al
  WHERE (p_entity_type IS NULL OR al.entity_type = p_entity_type)
    AND (p_action IS NULL OR al.action = p_action)
    AND (p_search IS NULL OR al.entity_type ILIKE '%' || p_search || '%' OR al.action ILIKE '%' || p_search || '%')
    AND (p_date_from IS NULL OR al.created_at >= p_date_from)
    AND (p_date_to IS NULL OR al.created_at <= p_date_to)
    AND (p_actor_id IS NULL OR al.actor_id = p_actor_id);

  SELECT COALESCE(jsonb_agg(sub ORDER BY sub.created_at DESC), '[]'::JSONB) INTO v_results
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
      COALESCE(p.first_name || ' ' || p.last_name, p.email) AS actor_name,
      p.avatar_url AS actor_avatar
    FROM public.audit_logs al
    LEFT JOIN public.profiles p ON p.id = al.actor_id
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

-- ─── 1b. get_audit_logs ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_audit_logs(
  p_page        INT DEFAULT 1,
  p_page_size   INT DEFAULT 50,
  p_entity_type TEXT DEFAULT NULL,
  p_action      TEXT DEFAULT NULL,
  p_search      TEXT DEFAULT NULL,
  p_date_from   TIMESTAMPTZ DEFAULT NULL,
  p_date_to     TIMESTAMPTZ DEFAULT NULL,
  p_actor_id    UUID DEFAULT NULL,
  p_sort_by     TEXT DEFAULT 'created_at',
  p_sort_dir    TEXT DEFAULT 'desc'
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_offset INT;
  v_total INT;
  v_results JSONB;
  v_order TEXT;
BEGIN
  v_offset := (p_page - 1) * p_page_size;

  v_order := CASE
    WHEN p_sort_by = 'action' THEN 'al.action'
    WHEN p_sort_by = 'entity_type' THEN 'al.entity_type'
    WHEN p_sort_by = 'actor_name' THEN 'actor_name'
    ELSE 'al.created_at'
  END;
  v_order := v_order || ' ' || CASE WHEN p_sort_dir = 'asc' THEN 'ASC' ELSE 'DESC' END;

  SELECT COUNT(*) INTO v_total
  FROM public.audit_logs al
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
        COALESCE(p.first_name || '' '' || p.last_name, p.email) AS actor_name
      FROM public.audit_logs al
      LEFT JOIN public.profiles p ON p.id = al.actor_id
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

-- ─── 1c. get_active_sessions ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_active_sessions(
  p_page INT DEFAULT 1,
  p_page_size INT DEFAULT 50,
  p_search TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_offset INT;
  v_total INT;
  v_results JSONB;
BEGIN
  v_offset := (p_page - 1) * p_page_size;

  SELECT COUNT(*) INTO v_total
  FROM public.device_sessions ds
  WHERE ds.is_active = true
    AND (p_search IS NULL OR ds.device_name ILIKE '%' || p_search || '%' OR ds.browser ILIKE '%' || p_search || '%');

  SELECT COALESCE(jsonb_agg(sub ORDER BY sub.last_activity_at DESC), '[]'::JSONB) INTO v_results
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
      COALESCE(p.first_name || ' ' || p.last_name, p.email) AS user_name,
      p.avatar_url
    FROM public.device_sessions ds
    LEFT JOIN public.profiles p ON p.id = ds.user_id
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

-- ─── 1d. get_failed_login_summary ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_failed_login_summary(
  p_page INT DEFAULT 1,
  p_page_size INT DEFAULT 50,
  p_search TEXT DEFAULT NULL,
  p_date_from TIMESTAMPTZ DEFAULT NULL,
  p_date_to TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_offset INT;
  v_total INT;
  v_results JSONB;
BEGIN
  v_offset := (p_page - 1) * p_page_size;

  SELECT COUNT(*) INTO v_total
  FROM public.failed_login_attempts fl
  WHERE (p_search IS NULL OR fl.email ILIKE '%' || p_search || '%' OR fl.ip_address ILIKE '%' || p_search || '%')
    AND (p_date_from IS NULL OR fl.last_attempt_at >= p_date_from)
    AND (p_date_to IS NULL OR fl.last_attempt_at <= p_date_to);

  SELECT COALESCE(jsonb_agg(sub ORDER BY sub.last_attempt_at DESC), '[]'::JSONB) INTO v_results
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
      COALESCE(p.first_name || ' ' || p.last_name, p.email) AS user_name
    FROM public.failed_login_attempts fl
    LEFT JOIN public.profiles p ON p.id = fl.user_id
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

-- ─── 1e. get_admin_activity ────────────────────────────────────────────────

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
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_offset INT;
  v_total INT;
  v_results JSONB;
BEGIN
  v_offset := (p_page - 1) * p_page_size;

  SELECT COUNT(*) INTO v_total
  FROM public.admin_activity aa
  WHERE (p_action IS NULL OR aa.action = p_action)
    AND (p_entity_type IS NULL OR aa.entity_type = p_entity_type)
    AND (p_search IS NULL OR aa.action ILIKE '%' || p_search || '%' OR aa.entity_type ILIKE '%' || p_search || '%')
    AND (p_date_from IS NULL OR aa.created_at >= p_date_from)
    AND (p_date_to IS NULL OR aa.created_at <= p_date_to);

  SELECT COALESCE(jsonb_agg(sub ORDER BY sub.created_at DESC), '[]'::JSONB) INTO v_results
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
      COALESCE(p.first_name || ' ' || p.last_name, p.email) AS admin_name,
      p.avatar_url
    FROM public.admin_activity aa
    LEFT JOIN public.profiles p ON p.id = aa.admin_id
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

-- ─── 1f. get_abandoned_carts ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_abandoned_carts(
  p_page INT DEFAULT 1,
  p_page_size INT DEFAULT 50,
  p_status TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_date_from TIMESTAMPTZ DEFAULT NULL,
  p_date_to TIMESTAMPTZ DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'created_at',
  p_sort_dir TEXT DEFAULT 'desc'
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_offset INT;
  v_total INT;
  v_results JSONB;
  v_order TEXT;
BEGIN
  v_offset := (p_page - 1) * p_page_size;

  v_order := CASE
    WHEN p_sort_by = 'subtotal' THEN 'ac.subtotal'
    WHEN p_sort_by = 'item_count' THEN 'ac.item_count'
    WHEN p_sort_by = 'status' THEN 'ac.status'
    WHEN p_sort_by = 'user_name' THEN 'user_name'
    ELSE 'ac.created_at'
  END;
  v_order := v_order || ' ' || CASE WHEN p_sort_dir = 'asc' THEN 'ASC' ELSE 'DESC' END;

  SELECT COUNT(*) INTO v_total
  FROM public.abandoned_carts ac
  WHERE (p_status IS NULL OR ac.status = p_status)
    AND (p_search IS NULL OR ac.session_id ILIKE '%' || p_search || '%')
    AND (p_date_from IS NULL OR ac.created_at >= p_date_from)
    AND (p_date_to IS NULL OR ac.created_at <= p_date_to);

  EXECUTE format(
    'SELECT COALESCE(jsonb_agg(sub), ''[]''::JSONB) FROM (
      SELECT
        ac.id,
        ac.user_id,
        ac.session_id,
        ac.subtotal,
        ac.item_count,
        ac.status,
        ac.recovered_at,
        ac.converted_at,
        ac.converted_order_id,
        ac.created_at,
        ac.updated_at,
        COALESCE(p.first_name || '' '' || p.last_name, p.email) AS customer_name,
        p.email AS customer_email,
        COALESCE(
          (SELECT jsonb_agg(row_to_json(aci)) FROM public.abandoned_cart_items aci WHERE aci.cart_id = ac.id),
          ''[]''::JSONB
        ) AS items
      FROM public.abandoned_carts ac
      LEFT JOIN public.profiles p ON p.id = ac.user_id
      WHERE ($1 IS NULL OR ac.status = $1)
        AND ($2 IS NULL OR ac.session_id ILIKE ''%%'' || $2 || ''%%'')
        AND ($3 IS NULL OR ac.created_at >= $3)
        AND ($4 IS NULL OR ac.created_at <= $4)
      ORDER BY %s
      LIMIT $5 OFFSET $6
    ) sub',
    v_order
  ) INTO v_results
  USING p_status, p_search, p_date_from, p_date_to, p_page_size, v_offset;

  RETURN jsonb_build_object(
    'carts', v_results,
    'total', v_total
  );
END;
$$;

-- ============================================================================
-- PART 2: FIX get_yearly_comparison — nested aggregate
-- Error: "aggregate function calls cannot be nested"
-- Fix: pre-aggregate SUM in CTE, then jsonb_agg the CTE result
-- ============================================================================

CREATE OR REPLACE FUNCTION get_yearly_comparison()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_result JSONB;
BEGIN
  WITH yearly_data AS (
    SELECT EXTRACT(YEAR FROM o.created_at)::INT AS y,
           COALESCE(SUM(o.total), 0) AS revenue
    FROM public.orders o
    WHERE o.payment_status = 'completed'
    GROUP BY EXTRACT(YEAR FROM o.created_at)::INT
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'year', y,
    'revenue', revenue
  ) ORDER BY y), '[]'::jsonb)
  INTO v_result
  FROM yearly_data;

  RETURN v_result;
END;
$$;

-- ============================================================================
-- PART 3: FIX check_login_lockout — GROUP BY error
-- Error: "column failed_login_attempts.attempt_count must appear in GROUP BY"
-- Fix: Use MAX(attempt_count) since we aggregate per user/email group
-- ============================================================================

CREATE OR REPLACE FUNCTION check_login_lockout(p_email TEXT, p_user_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_recent_attempts INT;
  v_first_attempt TIMESTAMPTZ;
BEGIN
  SELECT MAX(fl.attempt_count), MIN(fl.last_attempt_at) INTO v_recent_attempts, v_first_attempt
  FROM (
    SELECT attempt_count, last_attempt_at
    FROM public.failed_login_attempts
    WHERE (user_id = p_user_id OR (user_id IS NULL AND email = p_email))
      AND last_attempt_at > now() - INTERVAL '15 minutes'
    ORDER BY last_attempt_at DESC
    LIMIT 1
  ) fl;

  IF v_recent_attempts >= 5 THEN
    RETURN jsonb_build_object(
      'is_locked', true,
      'attempts', v_recent_attempts,
      'lockout_expires_at', v_first_attempt + INTERVAL '15 minutes',
      'remaining_seconds', GREATEST(0, EXTRACT(EPOCH FROM (v_first_attempt + INTERVAL '15 minutes' - now())))
    );
  END IF;

  RETURN jsonb_build_object(
    'is_locked', false,
    'attempts', COALESCE(v_recent_attempts, 0)
  );
END;
$$;

-- ============================================================================
-- PART 4: FIX record_admin_activity — null admin_id guard
-- Error: "null value in column admin_id" when auth.uid() IS NULL
-- ============================================================================

CREATE OR REPLACE FUNCTION record_admin_activity(
  p_action TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
  END IF;

  INSERT INTO public.admin_activity(admin_id, action, entity_type, entity_id, details, ip_address)
  VALUES (auth.uid(), p_action, p_entity_type, p_entity_id, p_details, p_ip_address);

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================================
-- PART 5: MISSING RPCs from migration 012 — Orders Management
-- ============================================================================

-- ─── 5a. get_order_details ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_order_details(p_order_id UUID)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'order', jsonb_build_object(
      'id',              o.id,
      'order_number',    o.order_number,
      'status',          o.status::TEXT,
      'payment_status',  o.payment_status::TEXT,
      'payment_method',  o.payment_method,
      'subtotal',        o.subtotal,
      'shipping_cost',   o.shipping_cost,
      'discount',        o.discount,
      'total',           o.total,
      'notes',           o.notes,
      'coupon_code',     o.coupon_code,
      'created_at',      o.created_at,
      'updated_at',      o.updated_at,
      'customer',        jsonb_build_object(
        'id',         p.id,
        'first_name', p.first_name,
        'last_name',  p.last_name,
        'email',      p.email,
        'phone',      p.phone
      ),
      'shipping_address', o.shipping_address,
      'billing_address',  o.billing_address,
      'items', (SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id',         oi.id,
        'product_id', oi.product_id,
        'name',       oi.name,
        'sku',        pr.sku,
        'price',      oi.price,
        'quantity',   oi.quantity,
        'total',      oi.price * oi.quantity,
        'image_url',  oi.image_url
      ) ORDER BY oi.created_at), '[]'::jsonb)
        FROM public.order_items oi
        LEFT JOIN public.products pr ON pr.id = oi.product_id
        WHERE oi.order_id = o.id
      ),
      'return_requests', (SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id',         rr.id,
        'order_item_id', rr.order_item_id,
        'reason',     rr.reason,
        'status',     rr.status,
        'requested_at', rr.requested_at,
        'approved_at',  rr.approved_at,
        'rejected_at',  rr.rejected_at,
        'admin_notes',  rr.admin_notes
      ) ORDER BY rr.created_at DESC), '[]'::jsonb)
        FROM public.return_requests rr
        WHERE rr.order_id = o.id
      ),
      'refunds', (SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id',           r.id,
        'amount',       r.amount,
        'reason',       r.reason,
        'status',       r.status,
        'requested_at', r.requested_at,
        'processed_at', r.processed_at
      ) ORDER BY r.created_at DESC), '[]'::jsonb)
        FROM public.refunds r
        WHERE r.order_id = o.id
      )
    )
  )
  FROM public.orders o
  LEFT JOIN public.profiles p ON p.id = o.user_id
  WHERE o.id = p_order_id;
$$;

-- ─── 5b. update_order_status ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id UUID,
  p_status   TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_status TEXT;
  v_valid          BOOLEAN;
BEGIN
  SELECT status::TEXT INTO v_current_status
  FROM public.orders WHERE id = p_order_id;

  IF v_current_status IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM (VALUES
      ('pending', 'confirmed'), ('pending', 'cancelled'),
      ('confirmed', 'processing'), ('confirmed', 'cancelled'),
      ('processing', 'shipped'), ('processing', 'cancelled'),
      ('shipped', 'delivered'),
      ('delivered', 'returned'),
      ('cancelled', 'refunded'),
      ('returned', 'refunded')
    ) AS t(from_status, to_status)
    WHERE t.from_status = v_current_status AND t.to_status = p_status
  ) INTO v_valid;

  IF NOT v_valid THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', format('Invalid status transition from %s to %s', v_current_status, p_status)
    );
  END IF;

  UPDATE public.orders
  SET status = p_status::public.order_status, updated_at = now()
  WHERE id = p_order_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ─── 5c. create_return_request ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION create_return_request(
  p_order_id      UUID,
  p_reason        TEXT,
  p_order_item_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  INSERT INTO public.return_requests (order_id, order_item_id, reason)
  VALUES (p_order_id, p_order_item_id, p_reason)
  RETURNING jsonb_build_object('success', true, 'id', id);
$$;

-- ─── 5d. process_return ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION process_return(
  p_return_id  UUID,
  p_status     TEXT,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order_id UUID;
BEGIN
  UPDATE public.return_requests
  SET
    status = p_status,
    admin_notes = COALESCE(p_admin_notes, admin_notes),
    approved_at = CASE WHEN p_status = 'approved' THEN now() ELSE approved_at END,
    rejected_at = CASE WHEN p_status = 'rejected' THEN now() ELSE rejected_at END,
    updated_at = now()
  WHERE id = p_return_id
  RETURNING order_id INTO v_order_id;

  IF v_order_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Return request not found');
  END IF;

  IF p_status = 'approved' THEN
    UPDATE public.orders SET status = 'returned', updated_at = now() WHERE id = v_order_id AND status = 'delivered';
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ─── 5e. create_refund ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION create_refund(
  p_order_id UUID,
  p_amount   NUMERIC,
  p_reason   TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  INSERT INTO public.refunds (order_id, amount, reason)
  VALUES (p_order_id, p_amount, p_reason)
  RETURNING jsonb_build_object('success', true, 'id', id);
$$;

-- ─── 5f. process_refund ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION process_refund(
  p_refund_id UUID,
  p_status    TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order_id UUID;
BEGIN
  UPDATE public.refunds
  SET
    status = p_status,
    processed_at = CASE WHEN p_status IN ('approved', 'completed') THEN now() ELSE processed_at END,
    processed_by = auth.uid(),
    updated_at = now()
  WHERE id = p_refund_id
  RETURNING order_id INTO v_order_id;

  IF v_order_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Refund not found');
  END IF;

  IF p_status IN ('approved', 'completed') THEN
    UPDATE public.orders SET payment_status = 'refunded', updated_at = now() WHERE id = v_order_id;
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================================
-- PART 6: MISSING RPCs from migration 013 — Products Management
-- ============================================================================

-- ─── 6a. duplicate_product ─────────────────────────────────────────────────

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

-- ─── 6b. bulk_update_products ──────────────────────────────────────────────

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

-- ─── 6c. bulk_delete_products ──────────────────────────────────────────────

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
-- PART 7: MISSING RPCs from migration 014 — Categories & Inventory
-- ============================================================================

-- ─── 7a. get_inventory_history ─────────────────────────────────────────────

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

-- ============================================================================
-- PART 8: MISSING RPCs from migration 015 — Customers & Reviews
-- ============================================================================

-- ─── 8a. get_customer_details ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_customer_details(p_user_id UUID)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'id',                p.id,
    'first_name',        p.first_name,
    'last_name',         p.last_name,
    'email',             p.email,
    'phone',             p.phone,
    'avatar_url',        p.avatar_url,
    'registration_date', p.created_at,
    'last_activity',     GREATEST(p.updated_at, (SELECT MAX(o.created_at) FROM public.orders o WHERE o.user_id = p.id)),
    'orders_count',      (SELECT COUNT(*) FROM public.orders o WHERE o.user_id = p.id AND o.status NOT IN ('cancelled', 'refunded')),
    'total_spent',       (SELECT COALESCE(SUM(o.total), 0) FROM public.orders o WHERE o.user_id = p.id AND o.status NOT IN ('cancelled', 'refunded')),
    'avg_order_value',   CASE WHEN (SELECT COUNT(*) FROM public.orders o WHERE o.user_id = p.id AND o.status NOT IN ('cancelled', 'refunded')) > 0
                           THEN (SELECT SUM(o.total) FROM public.orders o WHERE o.user_id = p.id AND o.status NOT IN ('cancelled', 'refunded')) /
                                (SELECT COUNT(*)::numeric FROM public.orders o WHERE o.user_id = p.id AND o.status NOT IN ('cancelled', 'refunded'))
                           ELSE 0 END,
    'last_order_at',     (SELECT MAX(o.created_at) FROM public.orders o WHERE o.user_id = p.id),
    'segment',           CASE
                           WHEN (SELECT COALESCE(SUM(o.total), 0) FROM public.orders o WHERE o.user_id = p.id AND o.status NOT IN ('cancelled', 'refunded')) >= 1000 THEN 'vip'
                           WHEN (SELECT COUNT(*) FROM public.orders o WHERE o.user_id = p.id AND o.status NOT IN ('cancelled', 'refunded')) >= 2 THEN 'returning'
                           ELSE 'new'
                         END,
    'recent_orders',     COALESCE((
      SELECT jsonb_agg(sub.data) FROM (
        SELECT jsonb_build_object(
          'id',         o.id,
          'order_number', o.order_number,
          'created_at', o.created_at,
          'status',     o.status::TEXT,
          'total',      o.total
        ) AS data
        FROM public.orders o WHERE o.user_id = p.id
        ORDER BY o.created_at DESC LIMIT 10
      ) sub
    ), '[]'::jsonb),
    'addresses',         COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id',       a.id,
        'label',    a.label,
        'line1',    a.line1,
        'line2',    a.line2,
        'city',     a.city,
        'state',    a.state,
        'postal_code', a.postal_code,
        'country',  a.country,
        'is_default', a.is_default
      ) ORDER BY a.is_default DESC, a.created_at DESC)
      FROM public.addresses a WHERE a.user_id = p.id
    ), '[]'::jsonb)
  )
  FROM public.profiles p
  WHERE p.id = p_user_id;
$$;

-- ─── 8b. get_review_details ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_review_details(p_review_id UUID)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'id',              r.id,
    'rating',          r.rating,
    'title',           r.title,
    'review_text',     r.review_text,
    'status',          r.status,
    'admin_note',      r.admin_note,
    'approved_at',     r.approved_at,
    'created_at',      r.created_at,
    'updated_at',      r.updated_at,
    'product_id',      pr.id,
    'product_name',    pr.name,
    'product_slug',    pr.slug,
    'product_image',   (SELECT pi.image_url FROM public.product_images pi WHERE pi.product_id = pr.id ORDER BY pi.sort_order ASC LIMIT 1),
    'user_id',         p.id,
    'customer_name',   p.first_name || ' ' || p.last_name,
    'customer_email',  p.email,
    'customer_avatar', p.avatar_url
  )
  FROM public.reviews r
  JOIN public.products pr ON pr.id = r.product_id
  JOIN public.profiles p ON p.id = r.user_id
  WHERE r.id = p_review_id;
$$;

-- ============================================================================
-- PART 9: MISSING RPCs from migration 016 — Coupons & Gift Cards
-- ============================================================================

-- ─── 9a. create_coupon ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION create_coupon(
  p_code                TEXT,
  p_description         TEXT DEFAULT NULL,
  p_discount_type       TEXT DEFAULT 'percentage',
  p_discount_value      NUMERIC DEFAULT 0,
  p_min_order           NUMERIC DEFAULT 0,
  p_max_uses            INT DEFAULT NULL,
  p_maximum_discount_amount NUMERIC DEFAULT NULL,
  p_starts_at           TIMESTAMPTZ DEFAULT NULL,
  p_expires_at          TIMESTAMPTZ DEFAULT NULL,
  p_metadata            JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_coupon_id UUID;
BEGIN
  IF p_discount_type NOT IN ('percentage', 'fixed') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid discount type');
  END IF;

  IF p_discount_value <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Discount value must be positive');
  END IF;

  IF p_discount_type = 'percentage' AND p_discount_value > 100 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Percentage discount cannot exceed 100');
  END IF;

  IF p_min_order < 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Minimum order amount cannot be negative');
  END IF;

  IF p_maximum_discount_amount IS NOT NULL AND p_maximum_discount_amount < 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Maximum discount amount cannot be negative');
  END IF;

  IF p_starts_at IS NOT NULL AND p_expires_at IS NOT NULL AND p_starts_at >= p_expires_at THEN
    RETURN jsonb_build_object('success', false, 'error', 'Start date must be before expiry date');
  END IF;

  INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order, max_uses, maximum_discount_amount, starts_at, expires_at, metadata)
  VALUES (
    UPPER(TRIM(p_code)),
    p_description,
    p_discount_type::public.discount_type,
    p_discount_value,
    p_min_order,
    p_max_uses,
    p_maximum_discount_amount,
    p_starts_at,
    p_expires_at,
    p_metadata
  )
  RETURNING id INTO v_coupon_id;

  RETURN jsonb_build_object('success', true, 'id', v_coupon_id);
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'error', 'A coupon with this code already exists');
  WHEN others THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ─── 9b. update_coupon ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_coupon(
  p_id                  UUID,
  p_code                TEXT DEFAULT NULL,
  p_description         TEXT DEFAULT NULL,
  p_discount_type       TEXT DEFAULT NULL,
  p_discount_value      NUMERIC DEFAULT NULL,
  p_min_order           NUMERIC DEFAULT NULL,
  p_max_uses            INT DEFAULT NULL,
  p_maximum_discount_amount NUMERIC DEFAULT NULL,
  p_starts_at           TIMESTAMPTZ DEFAULT NULL,
  p_expires_at          TIMESTAMPTZ DEFAULT NULL,
  p_is_active           BOOLEAN DEFAULT NULL,
  p_metadata            JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_code IS NOT NULL THEN
    UPDATE public.coupons SET code = UPPER(TRIM(p_code)) WHERE id = p_id;
  END IF;

  IF p_description IS NOT NULL THEN
    UPDATE public.coupons SET description = p_description WHERE id = p_id;
  END IF;

  IF p_discount_type IS NOT NULL THEN
    IF p_discount_type NOT IN ('percentage', 'fixed') THEN
      RETURN jsonb_build_object('success', false, 'error', 'Invalid discount type');
    END IF;
    UPDATE public.coupons SET discount_type = p_discount_type::public.discount_type WHERE id = p_id;
  END IF;

  IF p_discount_value IS NOT NULL THEN
    IF p_discount_value <= 0 THEN
      RETURN jsonb_build_object('success', false, 'error', 'Discount value must be positive');
    END IF;
    IF EXISTS (SELECT 1 FROM public.coupons WHERE id = p_id AND discount_type = 'percentage' AND p_discount_value > 100) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Percentage discount cannot exceed 100');
    END IF;
    UPDATE public.coupons SET discount_value = p_discount_value WHERE id = p_id;
  END IF;

  IF p_min_order IS NOT NULL THEN
    UPDATE public.coupons SET min_order = p_min_order WHERE id = p_id;
  END IF;

  IF p_max_uses IS NOT NULL THEN
    UPDATE public.coupons SET max_uses = p_max_uses WHERE id = p_id;
  END IF;

  IF p_maximum_discount_amount IS NOT NULL THEN
    UPDATE public.coupons SET maximum_discount_amount = p_maximum_discount_amount WHERE id = p_id;
  END IF;

  IF p_starts_at IS NOT NULL THEN
    UPDATE public.coupons SET starts_at = p_starts_at WHERE id = p_id;
  END IF;

  IF p_expires_at IS NOT NULL THEN
    UPDATE public.coupons SET expires_at = p_expires_at WHERE id = p_id;
  END IF;

  IF p_is_active IS NOT NULL THEN
    UPDATE public.coupons SET is_active = p_is_active WHERE id = p_id;
  END IF;

  IF p_metadata IS NOT NULL THEN
    UPDATE public.coupons SET metadata = p_metadata WHERE id = p_id;
  END IF;

  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'error', 'A coupon with this code already exists');
  WHEN others THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- ─── 9c. get_gift_card_details ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_gift_card_details(p_gift_card_id UUID)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'id',              g.id,
    'code',            g.code,
    'initial_balance', g.initial_balance,
    'current_balance', g.current_balance,
    'status',          g.status,
    'expires_at',      g.expires_at,
    'created_by',      g.created_by,
    'created_at',      g.created_at,
    'updated_at',      g.updated_at,
    'transactions',    COALESCE((
      SELECT jsonb_agg(sub.data) FROM (
        SELECT jsonb_build_object(
          'id',              t.id,
          'gift_card_id',    t.gift_card_id,
          'order_id',        t.order_id,
          'user_id',         t.user_id,
          'transaction_type', t.transaction_type,
          'amount',           t.amount,
          'balance_before',   t.balance_before,
          'balance_after',    t.balance_after,
          'notes',            t.notes,
          'created_at',       t.created_at
        ) AS data
        FROM public.gift_card_transactions t WHERE t.gift_card_id = g.id
        ORDER BY t.created_at DESC LIMIT 100
      ) sub
    ), '[]'::jsonb),
    'usage_count', (SELECT COALESCE(COUNT(*), 0) FROM public.gift_card_transactions t WHERE t.gift_card_id = g.id AND t.transaction_type = 'redemption')
  )
  FROM public.gift_cards g
  WHERE g.id = p_gift_card_id;
$$;

-- ─── 9d. create_gift_card ──────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION create_gift_card(
  p_initial_balance NUMERIC,
  p_expires_at      TIMESTAMPTZ DEFAULT NULL,
  p_notes           TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_code       TEXT;
  v_gift_card_id UUID;
  v_attempts   INT := 0;
BEGIN
  IF p_initial_balance <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Initial balance must be positive');
  END IF;

  LOOP
    v_code := UPPER(
      SUBSTRING(MD5(gen_random_uuid()::TEXT) FROM 1 FOR 4) || '-' ||
      SUBSTRING(MD5(gen_random_uuid()::TEXT) FROM 1 FOR 4) || '-' ||
      SUBSTRING(MD5(gen_random_uuid()::TEXT) FROM 1 FOR 4)
    );
    BEGIN
      INSERT INTO public.gift_cards (code, initial_balance, current_balance, expires_at, created_by)
      VALUES (v_code, p_initial_balance, p_initial_balance, p_expires_at, auth.uid())
      RETURNING id INTO v_gift_card_id;
      EXIT;
    EXCEPTION
      WHEN unique_violation THEN
        v_attempts := v_attempts + 1;
        IF v_attempts >= 10 THEN
          RETURN jsonb_build_object('success', false, 'error', 'Failed to generate unique gift card code');
        END IF;
    END;
  END LOOP;

  INSERT INTO public.gift_card_transactions (gift_card_id, transaction_type, amount, balance_before, balance_after, notes)
  VALUES (v_gift_card_id, 'activation', p_initial_balance, 0, p_initial_balance, p_notes);

  RETURN jsonb_build_object('success', true, 'id', v_gift_card_id, 'code', v_code);
END;
$$;

-- ============================================================================
-- PART 10: MISSING RPCs from migration 019 — Finance & Reports
-- ============================================================================

-- ─── 10a. get_invoice_details ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_invoice_details(p_invoice_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'invoice', row_to_json(i),
    'items', COALESCE((SELECT jsonb_agg(row_to_json(it)) FROM public.invoice_items it WHERE it.invoice_id = i.id ORDER BY it.created_at), '[]'::jsonb),
    'order', row_to_json(o),
    'customer', row_to_json(p)
  )
  INTO v_result
  FROM public.invoices i
  JOIN public.orders o ON o.id = i.order_id
  JOIN public.profiles p ON p.id = i.customer_id
  WHERE i.id = p_invoice_id;

  RETURN v_result;
END;
$$;

-- ─── 10b. generate_invoice ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION generate_invoice(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order         RECORD;
  v_customer      RECORD;
  v_invoice_id    UUID;
  v_invoice_num   TEXT;
  v_existing      UUID;
BEGIN
  SELECT id INTO v_existing FROM public.invoices WHERE order_id = p_order_id;
  IF v_existing IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invoice already exists for this order', 'invoice_id', v_existing);
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  IF v_order IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  SELECT * INTO v_customer FROM public.profiles WHERE id = v_order.user_id;

  v_invoice_num := 'INV-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-' || LPAD(NEXTVAL('public.invoice_number_seq')::TEXT, 6, '0');

  INSERT INTO public.invoices (
    invoice_number, order_id, customer_id, customer_name, customer_email,
    subtotal, tax_amount, tax_rate, discount_amount, shipping_amount, total_amount,
    status, issued_at
  ) VALUES (
    v_invoice_num, p_order_id, v_order.user_id,
    COALESCE(v_customer.first_name || ' ' || v_customer.last_name, v_customer.email),
    v_customer.email,
    v_order.subtotal, COALESCE(v_order.tax_amount, 0), COALESCE(v_order.tax_rate, 0),
    COALESCE(v_order.discount, 0), COALESCE(v_order.shipping_cost, 0), v_order.total,
    'issued', now()
  )
  RETURNING id INTO v_invoice_id;

  INSERT INTO public.invoice_items (invoice_id, product_id, product_name, quantity, unit_price, total_price)
  SELECT v_invoice_id, oi.product_id, oi.name, oi.quantity, oi.price, (oi.price * oi.quantity)
  FROM public.order_items oi
  WHERE oi.order_id = p_order_id;

  RETURN jsonb_build_object('success', true, 'invoice_id', v_invoice_id, 'invoice_number', v_invoice_num);
END;
$$;

-- ─── 10c. update_invoice_status ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_invoice_status(
  p_invoice_id UUID,
  p_status     TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_old_status TEXT;
BEGIN
  SELECT status INTO v_old_status FROM public.invoices WHERE id = p_invoice_id;
  IF v_old_status IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invoice not found');
  END IF;

  IF p_status = 'paid' THEN
    UPDATE public.invoices
    SET status = p_status, paid_at = now()
    WHERE id = p_invoice_id;
  ELSIF p_status = 'cancelled' THEN
    UPDATE public.invoices
    SET status = p_status, cancelled_at = now()
    WHERE id = p_invoice_id;
  ELSE
    UPDATE public.invoices
    SET status = p_status
    WHERE id = p_invoice_id;
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ─── 10d. get_export_data ──────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_export_data(
  p_data_type  TEXT,
  p_start_date DATE DEFAULT NULL,
  p_end_date   DATE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_result JSONB;
BEGIN
  CASE p_data_type
    WHEN 'sales' THEN
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'orderNumber', o.order_number, 'date', o.created_at::TEXT,
        'customer', COALESCE(p.first_name || ' ' || p.last_name, p.email),
        'email', p.email, 'total', o.total, 'status', o.status,
        'paymentStatus', o.payment_status
      ) ORDER BY o.created_at DESC), '[]'::jsonb)
      INTO v_result
      FROM public.orders o
      JOIN public.profiles p ON p.id = o.user_id
      WHERE (p_start_date IS NULL OR o.created_at >= p_start_date::timestamptz)
        AND (p_end_date IS NULL OR o.created_at < (p_end_date::date + 1)::timestamptz);

    WHEN 'customers' THEN
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'name', COALESCE(p.first_name || ' ' || p.last_name, p.email),
        'email', p.email, 'phone', p.phone, 'registered', p.created_at::TEXT,
        'orders', COALESCE(sub.orders, 0),
        'totalSpent', COALESCE(sub.total_spent, 0)
      ) ORDER BY sub.orders DESC NULLS LAST), '[]'::jsonb)
      INTO v_result
      FROM public.profiles p
      LEFT JOIN (
        SELECT o.user_id, COUNT(*) AS orders, COALESCE(SUM(o.total), 0) AS total_spent
        FROM public.orders o WHERE o.payment_status = 'completed'
        GROUP BY o.user_id
      ) sub ON sub.user_id = p.id
      WHERE p.role = 'customer';

    WHEN 'products' THEN
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'name', p.name, 'sku', p.sku, 'price', p.price, 'stock', p.stock,
        'category', c.name, 'status', CASE WHEN p.is_active THEN 'active' ELSE 'inactive' END,
        'totalSold', COALESCE(sub.sold, 0), 'revenue', COALESCE(sub.revenue, 0)
      ) ORDER BY p.name), '[]'::jsonb)
      INTO v_result
      FROM public.products p
      LEFT JOIN public.categories c ON c.id = p.category_id
      LEFT JOIN (
        SELECT oi.product_id, SUM(oi.quantity) AS sold, COALESCE(SUM(oi.price * oi.quantity), 0) AS revenue
        FROM public.order_items oi
        JOIN public.orders o ON o.id = oi.order_id AND o.payment_status = 'completed'
        GROUP BY oi.product_id
      ) sub ON sub.product_id = p.id;

    WHEN 'finance' THEN
      SELECT jsonb_build_object(
        'totals', (SELECT row_to_json(t) FROM (
          SELECT
            COALESCE(SUM(o.total), 0) AS grossRevenue,
            COALESCE(SUM(COALESCE(o.tax_amount,0)), 0) AS totalTaxes,
            COALESCE(SUM(COALESCE(o.discount,0)), 0) AS totalDiscounts,
            COALESCE(SUM(COALESCE(r.amount,0)), 0) AS totalRefunds,
            COUNT(*) AS totalOrders
          FROM public.orders o
          LEFT JOIN public.refunds r ON r.status = 'completed'
          WHERE o.payment_status = 'completed'
            AND (p_start_date IS NULL OR o.created_at >= p_start_date::timestamptz)
            AND (p_end_date IS NULL OR o.created_at < (p_end_date::date + 1)::timestamptz)
        ) t),
        'orders', COALESCE((SELECT jsonb_agg(jsonb_build_object(
          'orderNumber', o.order_number, 'date', o.created_at::TEXT,
          'subtotal', o.subtotal, 'tax', o.tax_amount, 'discount', o.discount,
          'shipping', o.shipping_cost, 'total', o.total
        ) ORDER BY o.created_at DESC) FROM public.orders o
          WHERE o.payment_status = 'completed'
            AND (p_start_date IS NULL OR o.created_at >= p_start_date::timestamptz)
            AND (p_end_date IS NULL OR o.created_at < (p_end_date::date + 1)::timestamptz)), '[]'::jsonb)
      ) INTO v_result;

    WHEN 'inventory' THEN
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'name', p.name, 'sku', p.sku, 'stock', p.stock,
        'price', p.price, 'stockValue', (COALESCE(p.stock,0) * COALESCE(p.price,0)),
        'status', CASE WHEN p.stock = 0 THEN 'out_of_stock' WHEN p.stock <= 10 THEN 'low_stock' ELSE 'in_stock' END
      ) ORDER BY p.name), '[]'::jsonb)
      INTO v_result
      FROM public.products p
      WHERE p.is_active = true;

    ELSE
      v_result := '[]'::jsonb;
  END CASE;

  RETURN v_result;
END;
$$;

-- ============================================================================
-- End of migration 024 — Comprehensive RPC Fix
-- ============================================================================
