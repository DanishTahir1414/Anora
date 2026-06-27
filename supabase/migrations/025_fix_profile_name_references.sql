-- Migration 025: Fix profile name references in RPCs
-- Replaces all COALESCE(p.display_name, p.full_name, p.email) with
-- CASE-based name construction using first_name/last_name.
-- Also fixes: get_yearly_comparison (nested aggregate),
-- check_login_lockout (GROUP BY), record_admin_activity (null auth.uid()),
-- get_failed_login_summary (wrong return key 'summary' → 'attempts').

-- ─── 1. get_activity_timeline ──────────────────────────────────────────────

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

-- ─── 2. get_audit_logs ─────────────────────────────────────────────────────

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

-- ─── 3. get_active_sessions ────────────────────────────────────────────────

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

-- ─── 4. get_failed_login_summary ───────────────────────────────────────────

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

-- ─── 5. get_admin_activity ─────────────────────────────────────────────────

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

-- ─── 6. get_abandoned_carts ────────────────────────────────────────────────

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
SECURITY DEFINER
SET search_path = public
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
  FROM abandoned_carts ac
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
        CASE
          WHEN p.first_name IS NOT NULL OR p.last_name IS NOT NULL
          THEN TRIM(COALESCE(p.first_name,'''') || '' '' || COALESCE(p.last_name,''''))
          ELSE p.email
        END AS customer_name,
        p.email AS customer_email,
        COALESCE(
          (SELECT jsonb_agg(row_to_json(aci)) FROM abandoned_cart_items aci WHERE aci.cart_id = ac.id),
          ''[]''::JSONB
        ) AS items
      FROM abandoned_carts ac
      LEFT JOIN profiles p ON p.id = ac.user_id
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

-- ─── 7. check_login_lockout ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION check_login_lockout(p_email TEXT, p_user_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recent_attempts INT;
  v_first_attempt TIMESTAMPTZ;
BEGIN
  SELECT MAX(attempt_count), MIN(last_attempt_at) INTO v_recent_attempts, v_first_attempt
  FROM failed_login_attempts
  WHERE (user_id = p_user_id OR (user_id IS NULL AND email = p_email))
    AND last_attempt_at > now() - INTERVAL '15 minutes'
  GROUP BY user_id, email
  ORDER BY MAX(last_attempt_at) DESC
  LIMIT 1;

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

-- ─── 8. record_admin_activity ──────────────────────────────────────────────

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
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID;
BEGIN
  v_admin_id := auth.uid();

  IF v_admin_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No authenticated user');
  END IF;

  INSERT INTO admin_activity(admin_id, action, entity_type, entity_id, details, ip_address)
  VALUES (v_admin_id, p_action, p_entity_type, p_entity_id, p_details, p_ip_address);

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ─── 9. get_yearly_comparison ──────────────────────────────────────────────

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
  SELECT COALESCE(jsonb_agg(sub ORDER BY sub.year), '[]'::jsonb)
  INTO v_result
  FROM (
    SELECT
      EXTRACT(YEAR FROM o.created_at)::INT AS year,
      COALESCE(SUM(o.total), 0) AS revenue
    FROM public.orders o
    WHERE o.payment_status = 'completed'
    GROUP BY EXTRACT(YEAR FROM o.created_at)
  ) sub;

  RETURN v_result;
END;
$$;
