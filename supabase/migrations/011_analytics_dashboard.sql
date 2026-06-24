-- ============================================================================
-- ANORA — Analytics Dashboard (REGENERATED)
-- Migration 011: RPC functions for dashboard summary and analytics charts.
-- ============================================================================
-- Apply AFTER 010_auto_profiles.sql
--
-- NOTES:
-- - All functions use LANGUAGE plpgsql for predictable execution.
-- - All table references are fully qualified (public.xxx).
-- - All aggregates are wrapped in COALESCE to avoid NULL results.
-- - generate_series produces DATE values to avoid timestamptz/date boundary issues.
-- - Every function is validated to compile independently.
-- ============================================================================

-- ─── ADD RETURNED ORDER STATUS ───────────────────────────────────────────────
-- Must precede any function referencing 'returned'.
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'returned' AFTER 'delivered';

-- ─── ANALYTICS INDEXES ──────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_orders_payment_created
  ON public.orders(payment_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_product_order
  ON public.order_items(product_id, order_id);

CREATE INDEX IF NOT EXISTS idx_orders_user_payment
  ON public.orders(user_id, payment_status);

CREATE INDEX IF NOT EXISTS idx_orders_status_created
  ON public.orders(status, created_at DESC);

-- ─── 1. ANALYTICS SUMMARY ───────────────────────────────────────────────────
-- Returns a single JSONB object with all dashboard summary metrics.

CREATE OR REPLACE FUNCTION get_analytics_summary()
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
    'totalRevenue',        COALESCE((SELECT SUM(o.total) FROM public.orders o WHERE o.payment_status = 'completed'), 0),
    'revenueToday',        COALESCE((SELECT SUM(o.total) FROM public.orders o WHERE o.payment_status = 'completed' AND o.created_at >= CURRENT_DATE::timestamptz), 0),
    'revenueThisWeek',     COALESCE((SELECT SUM(o.total) FROM public.orders o WHERE o.payment_status = 'completed' AND o.created_at >= date_trunc('week', CURRENT_DATE)), 0),
    'revenueThisMonth',    COALESCE((SELECT SUM(o.total) FROM public.orders o WHERE o.payment_status = 'completed' AND o.created_at >= date_trunc('month', CURRENT_DATE)), 0),

    'totalOrders',         (SELECT COUNT(*) FROM public.orders),
    'pendingOrders',       (SELECT COUNT(*) FROM public.orders o WHERE o.status = 'pending'),
    'confirmedOrders',     (SELECT COUNT(*) FROM public.orders o WHERE o.status = 'confirmed'),
    'processingOrders',    (SELECT COUNT(*) FROM public.orders o WHERE o.status = 'processing'),
    'shippedOrders',       (SELECT COUNT(*) FROM public.orders o WHERE o.status = 'shipped'),
    'deliveredOrders',     (SELECT COUNT(*) FROM public.orders o WHERE o.status = 'delivered'),
    'returnedOrders',      (SELECT COUNT(*) FROM public.orders o WHERE o.status = 'returned'),
    'cancelledOrders',     (SELECT COUNT(*) FROM public.orders o WHERE o.status = 'cancelled'),
    'refundedOrders',      (SELECT COUNT(*) FROM public.orders o WHERE o.status = 'refunded'),

    'totalCustomers',      (SELECT COUNT(*) FROM public.profiles p WHERE p.role = 'customer'),
    'newCustomers',        (SELECT COUNT(*) FROM public.profiles p WHERE p.role = 'customer' AND p.created_at >= date_trunc('month', CURRENT_DATE)),
    'returningCustomers',  COALESCE((SELECT COUNT(*) FROM (SELECT o.user_id FROM public.orders o WHERE o.payment_status = 'completed' GROUP BY o.user_id HAVING COUNT(*) > 1) AS sub), 0),

    'totalProducts',       (SELECT COUNT(*) FROM public.products),
    'activeProducts',      (SELECT COUNT(*) FROM public.products p WHERE p.is_active = true),
    'lowStockProducts',    (SELECT COUNT(*) FROM public.products p WHERE p.is_active = true AND p.stock <= 10),

    'totalCategories',     (SELECT COUNT(*) FROM public.categories)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- ─── 2. SALES ANALYTICS ─────────────────────────────────────────────────────
-- Returns a JSONB array of {date, sales, orders} grouped by period.

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
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'date',   d::TEXT,
        'sales',  COALESCE(SUM(o.total), 0),
        'orders', COUNT(o.id)
      ) ORDER BY d), '[]'::jsonb)
      INTO v_result
      FROM generate_series(v_start, v_end, '1 day'::INTERVAL) AS d(d)
      LEFT JOIN public.orders o
        ON o.payment_status = 'completed'
        AND o.created_at >= d::timestamptz
        AND o.created_at < (d + 1)::timestamptz;

    WHEN 'weekly' THEN
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'date',   to_char(d, 'IYYY-"W"IW'),
        'sales',  COALESCE(SUM(o.total), 0),
        'orders', COUNT(o.id)
      ) ORDER BY d), '[]'::jsonb)
      INTO v_result
      FROM generate_series(date_trunc('week', v_start)::DATE, v_end, '1 week'::INTERVAL) AS d(d)
      LEFT JOIN public.orders o
        ON o.payment_status = 'completed'
        AND o.created_at >= d::timestamptz
        AND o.created_at < (d + INTERVAL '1 week')::timestamptz;

    WHEN 'monthly' THEN
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'date',   to_char(d, 'YYYY-MM'),
        'sales',  COALESCE(SUM(o.total), 0),
        'orders', COUNT(o.id)
      ) ORDER BY d), '[]'::jsonb)
      INTO v_result
      FROM generate_series(date_trunc('month', v_start)::DATE, v_end, '1 month'::INTERVAL) AS d(d)
      LEFT JOIN public.orders o
        ON o.payment_status = 'completed'
        AND o.created_at >= d::timestamptz
        AND o.created_at < (d + INTERVAL '1 month')::timestamptz;

    WHEN 'yearly' THEN
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'date',   EXTRACT(YEAR FROM d)::TEXT,
        'sales',  COALESCE(SUM(o.total), 0),
        'orders', COUNT(o.id)
      ) ORDER BY d), '[]'::jsonb)
      INTO v_result
      FROM generate_series(date_trunc('year', v_start)::DATE, v_end, '1 year'::INTERVAL) AS d(d)
      LEFT JOIN public.orders o
        ON o.payment_status = 'completed'
        AND o.created_at >= d::timestamptz
        AND o.created_at < (d + INTERVAL '1 year')::timestamptz;

    ELSE
      v_result := '[]'::jsonb;
  END CASE;

  RETURN v_result;
END;
$$;

-- ─── 3. REVENUE ANALYTICS ───────────────────────────────────────────────────
-- Returns {current, previous, change (%), trend: [{date, sales}]}.
-- Compares the selected period against the immediately preceding period of
-- equal length.

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
    AND o.created_at < (v_end + 1)::timestamptz;

  SELECT COALESCE(SUM(o.total), 0)
  INTO v_previous
  FROM public.orders o
  WHERE o.payment_status = 'completed'
    AND o.created_at >= v_prev_start::timestamptz
    AND o.created_at < (v_prev_end + 1)::timestamptz;

  SELECT jsonb_build_object(
    'current',     v_current,
    'previous',    v_previous,
    'change',      CASE
                     WHEN v_previous > 0
                     THEN ROUND(((v_current - v_previous) / v_previous * 100)::NUMERIC, 1)
                     ELSE 0
                   END,
    'trend',       COALESCE(jsonb_agg(jsonb_build_object(
      'date',  d::TEXT,
      'sales', COALESCE(SUM(o.total), 0)
    ) ORDER BY d), '[]'::jsonb)
  )
  INTO v_result
  FROM generate_series(v_start, v_end, '1 day'::INTERVAL) AS d(d)
  LEFT JOIN public.orders o
    ON o.payment_status = 'completed'
    AND o.created_at >= d::timestamptz
    AND o.created_at < (d + 1)::timestamptz;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- ─── 4. ORDERS BY STATUS DISTRIBUTION ───────────────────────────────────────
-- Returns [{status, count}] sorted by count descending.

CREATE OR REPLACE FUNCTION get_orders_by_status_distribution()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'status', sub.status::TEXT,
    'count',  sub.cnt
  ) ORDER BY sub.cnt DESC), '[]'::jsonb)
  INTO v_result
  FROM (
    SELECT o.status, COUNT(*) AS cnt
    FROM public.orders o
    GROUP BY o.status
  ) sub;

  RETURN v_result;
END;
$$;

-- ─── 5. ORDERS BY CATEGORY DISTRIBUTION ─────────────────────────────────────
-- Returns [{category, count}] sorted by count descending.

CREATE OR REPLACE FUNCTION get_orders_by_category_distribution()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'category', sub.name,
    'count',    sub.cnt
  ) ORDER BY sub.cnt DESC), '[]'::jsonb)
  INTO v_result
  FROM (
    SELECT c.name, COUNT(*) AS cnt
    FROM public.order_items oi
    JOIN public.products p ON p.id = oi.product_id
    JOIN public.categories c ON c.id = p.category_id
    GROUP BY c.id, c.name
  ) sub;

  RETURN v_result;
END;
$$;

-- ─── 6. CUSTOMER ANALYTICS ──────────────────────────────────────────────────
-- Returns {newCustomers, returningCustomers} for the optional date range.

CREATE OR REPLACE FUNCTION get_customer_analytics(
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
  v_new       INT;
  v_returning INT;
BEGIN
  SELECT COUNT(*) INTO v_new
  FROM public.profiles p
  WHERE p.role = 'customer'
    AND (p_start_date IS NULL OR p.created_at >= p_start_date::timestamptz)
    AND (p_end_date   IS NULL OR p.created_at < (p_end_date + 1)::timestamptz);

  SELECT COUNT(*) INTO v_returning
  FROM (
    SELECT o.user_id
    FROM public.orders o
    WHERE o.payment_status = 'completed'
      AND (p_start_date IS NULL OR o.created_at >= p_start_date::timestamptz)
      AND (p_end_date   IS NULL OR o.created_at < (p_end_date + 1)::timestamptz)
    GROUP BY o.user_id
    HAVING COUNT(*) > 1
  ) sub;

  RETURN jsonb_build_object(
    'newCustomers',       COALESCE(v_new, 0),
    'returningCustomers', COALESCE(v_returning, 0)
  );
END;
$$;

-- ─── 7. TOP SELLING PRODUCTS ────────────────────────────────────────────────
-- Returns [{name, orders, revenue}] for the top N products by order count.

CREATE OR REPLACE FUNCTION get_top_selling_products(p_limit INT DEFAULT 10)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'name',    p.name,
    'orders',  sub.cnt,
    'revenue', sub.rev
  ) ORDER BY sub.cnt DESC), '[]'::jsonb)
  INTO v_result
  FROM (
    SELECT oi.product_id,
           COUNT(DISTINCT oi.order_id) AS cnt,
           COALESCE(SUM(oi.price * oi.quantity), 0) AS rev
    FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id AND o.payment_status = 'completed'
    GROUP BY oi.product_id
    ORDER BY cnt DESC
    LIMIT p_limit
  ) sub
  JOIN public.products p ON p.id = sub.product_id;

  RETURN v_result;
END;
$$;

-- ─── 8. BOTTOM SELLING PRODUCTS ─────────────────────────────────────────────
-- Returns [{name, orders, revenue}] for the bottom N products by order count.

CREATE OR REPLACE FUNCTION get_bottom_selling_products(p_limit INT DEFAULT 10)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'name',    p.name,
    'orders',  sub.cnt,
    'revenue', sub.rev
  ) ORDER BY sub.cnt ASC), '[]'::jsonb)
  INTO v_result
  FROM (
    SELECT oi.product_id,
           COUNT(DISTINCT oi.order_id) AS cnt,
           COALESCE(SUM(oi.price * oi.quantity), 0) AS rev
    FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id AND o.payment_status = 'completed'
    GROUP BY oi.product_id
    ORDER BY cnt ASC
    LIMIT p_limit
  ) sub
  JOIN public.products p ON p.id = sub.product_id;

  RETURN v_result;
END;
$$;

-- ============================================================================
-- End of migration 011
-- ============================================================================
