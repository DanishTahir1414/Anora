-- ============================================================================
-- ANORA — Fix Broken RPCs
-- Migration 017: Repair three RPCs with runtime errors on PG17.
-- ============================================================================
-- Apply AFTER 016_coupons_gift_cards.sql
--
-- BUGS FIXED:
-- 1. get_sales_analytics:     "operator does not exist: timestamp with time zone + integer"
--    Root cause: generate_series(date, date, interval) returns timestamptz on PG17,
--    but (d + 1) tried integer addition on timestamptz → invalid.
--    Fix: use d + INTERVAL '1 day' instead of (d + 1)::timestamptz.
--    Plus: "aggregate function calls cannot be nested" — SUM/COUNT inside jsonb_agg.
--    Fix: use a lateral subquery to pre-aggregate per-day before jsonb_agg.
--
-- 2. get_revenue_analytics:   Same operator + nested aggregate bugs in trend subquery.
--    Fix: use d + INTERVAL '1 day' and lateral subquery for trend pre-aggregation.
--    Also: (v_end::date + 1) explicit cast for clarity.
--
-- 3. get_customers_management:
--    a) "column p_search does not exist" — bare parameter ref in EXECUTE string.
--       Fix: use format() with %L.
--    b) "column sub.registration_date must appear in GROUP BY or be used in aggregate"
--       Root cause: outer ORDER BY on sub.registration_date in aggregate query.
--       Fix: move ordering inside the subquery, remove outer ORDER BY.
-- ============================================================================

-- ─── 1. FIX get_sales_analytics ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_sales_analytics(
  p_period      TEXT DEFAULT 'daily',
  p_start_date  DATE DEFAULT NULL,
  p_end_date    DATE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_start  DATE;
  v_end    DATE;
  v_result JSONB;
BEGIN
  v_start := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days');
  v_end   := COALESCE(p_end_date,   CURRENT_DATE);

  CASE p_period
    WHEN 'daily' THEN
      WITH daily AS (
        SELECT d::TEXT AS day_label,
               COALESCE(SUM(o.total), 0) AS sales,
               COUNT(o.id) AS orders
        FROM generate_series(v_start, v_end, '1 day'::INTERVAL) AS d(d)
        LEFT JOIN public.orders o
          ON o.payment_status = 'completed'
          AND o.created_at >= d::timestamptz
          AND o.created_at < d + INTERVAL '1 day'
        GROUP BY d
      )
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'date',   day_label,
        'sales',  sales,
        'orders', orders
      ) ORDER BY day_label), '[]'::jsonb)
      INTO v_result
      FROM daily;

    WHEN 'weekly' THEN
      WITH weekly AS (
        SELECT to_char(d, 'IYYY-"W"IW') AS week_label,
               COALESCE(SUM(o.total), 0) AS sales,
               COUNT(o.id) AS orders
        FROM generate_series(date_trunc('week', v_start)::DATE, v_end, '1 week'::INTERVAL) AS d(d)
        LEFT JOIN public.orders o
          ON o.payment_status = 'completed'
          AND o.created_at >= d::timestamptz
          AND o.created_at < d + INTERVAL '1 week'
        GROUP BY d
      )
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'date',   week_label,
        'sales',  sales,
        'orders', orders
      ) ORDER BY week_label), '[]'::jsonb)
      INTO v_result
      FROM weekly;

    WHEN 'monthly' THEN
      WITH monthly AS (
        SELECT to_char(d, 'YYYY-MM') AS month_label,
               COALESCE(SUM(o.total), 0) AS sales,
               COUNT(o.id) AS orders
        FROM generate_series(date_trunc('month', v_start)::DATE, v_end, '1 month'::INTERVAL) AS d(d)
        LEFT JOIN public.orders o
          ON o.payment_status = 'completed'
          AND o.created_at >= d::timestamptz
          AND o.created_at < d + INTERVAL '1 month'
        GROUP BY d
      )
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'date',   month_label,
        'sales',  sales,
        'orders', orders
      ) ORDER BY month_label), '[]'::jsonb)
      INTO v_result
      FROM monthly;

    WHEN 'yearly' THEN
      WITH yearly AS (
        SELECT EXTRACT(YEAR FROM d)::TEXT AS year_label,
               COALESCE(SUM(o.total), 0) AS sales,
               COUNT(o.id) AS orders
        FROM generate_series(date_trunc('year', v_start)::DATE, v_end, '1 year'::INTERVAL) AS d(d)
        LEFT JOIN public.orders o
          ON o.payment_status = 'completed'
          AND o.created_at >= d::timestamptz
          AND o.created_at < d + INTERVAL '1 year'
        GROUP BY d
      )
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'date',   year_label,
        'sales',  sales,
        'orders', orders
      ) ORDER BY year_label), '[]'::jsonb)
      INTO v_result
      FROM yearly;

    ELSE
      v_result := '[]'::jsonb;
  END CASE;

  RETURN v_result;
END;
$$;

-- ─── 2. FIX get_revenue_analytics ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_revenue_analytics(
  p_start_date  DATE DEFAULT NULL,
  p_end_date    DATE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_start       DATE;
  v_end         DATE;
  v_prev_start  DATE;
  v_prev_end    DATE;
  v_num_days    INT;
  v_current     NUMERIC;
  v_previous    NUMERIC;
  v_result      JSONB;
BEGIN
  v_start    := COALESCE(p_start_date, date_trunc('month', CURRENT_DATE)::DATE);
  v_end      := COALESCE(p_end_date,   CURRENT_DATE);
  v_num_days := (v_end - v_start) + 1;
  v_prev_end := v_start - 1;
  v_prev_start := v_prev_end - v_num_days + 1;

  SELECT COALESCE(SUM(o.total), 0)
  INTO v_current
  FROM public.orders o
  WHERE o.payment_status = 'completed'
    AND o.created_at >= v_start::timestamptz
    AND o.created_at < (v_end::date + 1)::timestamptz;

  SELECT COALESCE(SUM(o.total), 0)
  INTO v_previous
  FROM public.orders o
  WHERE o.payment_status = 'completed'
    AND o.created_at >= v_prev_start::timestamptz
    AND o.created_at < (v_prev_end::date + 1)::timestamptz;

  WITH trend AS (
    SELECT d::TEXT AS day_label,
           COALESCE(SUM(o.total), 0) AS sales
    FROM generate_series(v_start, v_end, '1 day'::INTERVAL) AS d(d)
    LEFT JOIN public.orders o
      ON o.payment_status = 'completed'
      AND o.created_at >= d::timestamptz
      AND o.created_at < d + INTERVAL '1 day'
    GROUP BY d
  )
  SELECT jsonb_build_object(
    'current',     v_current,
    'previous',    v_previous,
    'change',      CASE
                     WHEN v_previous > 0
                     THEN ROUND(((v_current - v_previous) / v_previous * 100)::NUMERIC, 1)
                     ELSE 0
                   END,
    'trend',       COALESCE((SELECT jsonb_agg(jsonb_build_object(
      'date',  day_label,
      'sales', sales
    ) ORDER BY day_label) FROM trend), '[]'::jsonb)
  )
  INTO v_result;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- ─── 3. FIX get_customers_management ─────────────────────────────────────────

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
  v_offset  INT;
  v_total   INT;
  v_result  JSONB;
  v_where   TEXT := 'p.role = ''customer''';
BEGIN
  v_offset := (p_page - 1) * p_page_size;

  IF p_search IS NOT NULL AND p_search != '' THEN
    v_where := v_where || format(
      ' AND (p.first_name ILIKE %1$L OR p.last_name ILIKE %1$L OR p.email ILIKE %1$L OR p.first_name || '' '' || p.last_name ILIKE %1$L)',
      '%' || p_search || '%'
    );
  END IF;

  -- Get total count
  EXECUTE format(
    'SELECT COUNT(*) FROM public.profiles p WHERE %s', v_where
  ) INTO v_total;

  -- Build the main query with segment filter.
  -- Use a subquery to pre-aggregate and apply HAVING for activity.
  -- The outer query selects from the subquery and applies segment filter + pagination.
  -- This avoids the "must appear in GROUP BY" error from ordering in an aggregate query
  -- by putting ordering inside the jsonb_agg ORDER BY.
  EXECUTE format(
    'SELECT jsonb_build_object(
      ''customers'', COALESCE(
        (SELECT jsonb_agg(row_to_json(sub2)) FROM (
          SELECT *
          FROM (%s) sub1
          WHERE (%s)
          ORDER BY %s %s
          LIMIT %s OFFSET %s
        ) sub2),
        ''[]''::jsonb
      ),
      ''total'', %s
    )',
    -- First %s: inner subquery with aggregation
    'SELECT
      p.id,
      p.first_name,
      p.last_name,
      p.email,
      p.phone,
      p.avatar_url,
      p.created_at AS registration_date,
      GREATEST(p.updated_at, MAX(o.created_at)) AS last_activity,
      COUNT(DISTINCT o.id) AS orders_count,
      COALESCE(SUM(o.total) FILTER (WHERE o.status NOT IN (''cancelled'', ''refunded'')), 0) AS total_spent,
      MAX(o.created_at) AS last_order_at,
      CASE
        WHEN COALESCE(SUM(o.total) FILTER (WHERE o.status NOT IN (''cancelled'', ''refunded'')), 0) >= 1000 THEN ''vip''
        WHEN COUNT(DISTINCT o.id) >= 2 THEN ''returning''
        ELSE ''new''
      END AS segment
    FROM public.profiles p
    LEFT JOIN public.orders o ON o.user_id = p.id
    WHERE ' || v_where || '
    GROUP BY p.id'
    ||
    CASE
      WHEN p_activity = 'active' THEN
        ' HAVING (MAX(o.created_at) >= NOW() - INTERVAL ''90 days'' OR COUNT(o.id) > 0)'
      WHEN p_activity = 'inactive' THEN
        ' HAVING (MAX(o.created_at) IS NULL OR MAX(o.created_at) < NOW() - INTERVAL ''90 days'')'
      ELSE ''
    END,
    -- Second %s: segment filter
    CASE
      WHEN p_segment IS NOT NULL AND p_segment != '' AND p_segment != 'all'
      THEN 'segment = ' || quote_literal(p_segment)
      ELSE 'TRUE'
    END,
    -- Third %s: sort column
    CASE
      WHEN p_sort_by = 'name'           THEN 'first_name'
      WHEN p_sort_by = 'email'          THEN 'email'
      WHEN p_sort_by = 'orders_count'   THEN 'orders_count'
      WHEN p_sort_by = 'total_spent'    THEN 'total_spent'
      WHEN p_sort_by = 'created_at'     THEN 'registration_date'
      WHEN p_sort_by = 'last_activity'  THEN 'last_activity'
      ELSE 'registration_date'
    END,
    -- Fourth %s: sort direction
    CASE WHEN p_sort_dir = 'asc' THEN 'ASC' ELSE 'DESC' END,
    -- Fifth %s: limit
    p_page_size::TEXT,
    -- Sixth %s: offset
    v_offset::TEXT,
    -- Seventh %s: total count
    v_total::TEXT
  ) INTO v_result;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- ============================================================================
-- End of migration 017
-- ============================================================================
