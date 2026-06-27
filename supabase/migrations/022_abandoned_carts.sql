-- 022_abandoned_carts.sql
-- Abandoned cart tracking tables, analytics, and RPCs

-- ─── abandoned_carts table ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS abandoned_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  item_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'abandoned'
    CHECK (status IN ('abandoned', 'recovered', 'converted', 'expired')),
  recovered_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  converted_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── abandoned_cart_items table ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS abandoned_cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES abandoned_carts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity INT NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Indexes ───────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_abandoned_carts_user
  ON abandoned_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_status
  ON abandoned_carts(status);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_created
  ON abandoned_carts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_updated
  ON abandoned_carts(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_abandoned_carts_session
  ON abandoned_carts(session_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_cart_items_cart
  ON abandoned_cart_items(cart_id);

-- ─── RLS ───────────────────────────────────────────────────────────────────

ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE abandoned_cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read abandoned carts"
  ON abandoned_carts FOR SELECT
  USING (is_staff());
CREATE POLICY "Staff can update abandoned carts"
  ON abandoned_carts FOR UPDATE
  USING (is_staff());
CREATE POLICY "System can insert abandoned carts"
  ON abandoned_carts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can read abandoned cart items"
  ON abandoned_cart_items FOR SELECT
  USING (is_staff());
CREATE POLICY "System can insert abandoned cart items"
  ON abandoned_cart_items FOR INSERT
  WITH CHECK (true);

-- ─── Trigger: updated_at ───────────────────────────────────────────────────

CREATE TRIGGER set_abandoned_carts_updated_at
  BEFORE UPDATE ON abandoned_carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── RPC: get_abandoned_cart_analytics ─────────────────────────────────────

CREATE OR REPLACE FUNCTION get_abandoned_cart_analytics(
  p_date_from TIMESTAMPTZ DEFAULT NULL,
  p_date_to TIMESTAMPTZ DEFAULT NULL,
  p_group_by TEXT DEFAULT 'day'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_abandoned INT;
  v_lost_revenue NUMERIC;
  v_recovered_revenue NUMERIC;
  v_recovered_carts INT;
  v_converted_carts INT;
  v_recovery_rate NUMERIC;
  v_avg_cart_value NUMERIC;
  v_trend JSONB;
BEGIN
  SELECT
    COUNT(*) FILTER (WHERE status = 'abandoned' OR status = 'expired'),
    COALESCE(SUM(subtotal) FILTER (WHERE status = 'abandoned' OR status = 'expired'), 0),
    COALESCE(SUM(subtotal) FILTER (WHERE status = 'recovered'), 0),
    COUNT(*) FILTER (WHERE status = 'recovered'),
    COUNT(*) FILTER (WHERE status = 'converted'),
    CASE
      WHEN COUNT(*) > 0 THEN ROUND(COUNT(*) FILTER (WHERE status IN ('recovered', 'converted'))::NUMERIC / COUNT(*) * 100, 1)
      ELSE 0
    END,
    COALESCE(ROUND(AVG(subtotal), 2), 0)
  INTO
    v_total_abandoned, v_lost_revenue, v_recovered_revenue,
    v_recovered_carts, v_converted_carts, v_recovery_rate, v_avg_cart_value
  FROM abandoned_carts
  WHERE (p_date_from IS NULL OR created_at >= p_date_from)
    AND (p_date_to IS NULL OR created_at <= p_date_to);

  SELECT COALESCE(jsonb_agg(sub), '[]'::JSONB) INTO v_trend
  FROM (
    SELECT
      CASE
        WHEN p_group_by = 'month' THEN to_char(created_at, 'YYYY-MM')
        WHEN p_group_by = 'week' THEN to_char(created_at, 'YYYY-"W"WW')
        ELSE to_char(created_at, 'YYYY-MM-DD')
      END AS period,
      COUNT(*) AS total_carts,
      COALESCE(SUM(subtotal), 0) AS total_value,
      COUNT(*) FILTER (WHERE status IN ('recovered', 'converted')) AS recovered,
      COALESCE(SUM(subtotal) FILTER (WHERE status IN ('recovered', 'converted')), 0) AS recovered_value
    FROM abandoned_carts
    WHERE (p_date_from IS NULL OR created_at >= p_date_from)
      AND (p_date_to IS NULL OR created_at <= p_date_to)
    GROUP BY period
    ORDER BY period
  ) sub;

  RETURN jsonb_build_object(
    'total_abandoned_carts', v_total_abandoned,
    'lost_revenue', v_lost_revenue,
    'recovered_revenue', v_recovered_revenue,
    'recovered_carts', v_recovered_carts,
    'converted_carts', v_converted_carts,
    'recovery_rate', v_recovery_rate,
    'average_cart_value', v_avg_cart_value,
    'trend', v_trend
  );
END;
$$;

-- ─── RPC: get_abandoned_carts ──────────────────────────────────────────────

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
        COALESCE(p.display_name, p.full_name, p.email) AS customer_name,
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

-- ─── RPC: mark_cart_recovered ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION mark_cart_recovered(p_cart_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE abandoned_carts
  SET status = 'recovered', recovered_at = now()
  WHERE id = p_cart_id AND status = 'abandoned';

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ─── RPC: mark_cart_converted ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION mark_cart_converted(p_cart_id UUID, p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE abandoned_carts
  SET status = 'converted', converted_at = now(), converted_order_id = p_order_id
  WHERE id = p_cart_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ─── Abandoned cart analytics view ─────────────────────────────────────────

CREATE OR REPLACE VIEW abandoned_cart_analytics AS
SELECT
  COUNT(*) FILTER (WHERE status IN ('abandoned', 'expired')) AS total_abandoned,
  COALESCE(SUM(subtotal) FILTER (WHERE status IN ('abandoned', 'expired')), 0) AS lost_revenue,
  COALESCE(SUM(subtotal) FILTER (WHERE status = 'recovered'), 0) AS recovered_revenue,
  CASE WHEN COUNT(*) > 0
    THEN ROUND(COUNT(*) FILTER (WHERE status IN ('recovered', 'converted'))::NUMERIC / COUNT(*) * 100, 1)
    ELSE 0
  END AS recovery_rate
FROM abandoned_carts;
