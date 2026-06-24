-- ============================================================================
-- ANORA — Orders Management System
-- Migration 012: Return/refund tables + admin RPCs for the orders page.
-- ============================================================================
-- Apply AFTER 011_analytics_dashboard.sql
-- ============================================================================

-- ─── RETURN REQUESTS ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS return_requests (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id   UUID        REFERENCES order_items(id) ON DELETE SET NULL,
  reason          TEXT        NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'requested'
                              CHECK (status IN ('requested', 'approved', 'rejected', 'refunded')),
  requested_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at     TIMESTAMPTZ,
  rejected_at     TIMESTAMPTZ,
  admin_notes     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_return_requests_order   ON return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_status  ON return_requests(status);

CREATE TRIGGER set_return_requests_updated_at
  BEFORE UPDATE ON return_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage return_requests"
  ON return_requests FOR ALL
  USING (is_staff());

CREATE POLICY "Users can read own return_requests"
  ON return_requests FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = return_requests.order_id AND (orders.user_id = auth.uid() OR is_staff())));

CREATE POLICY "Users can create return_requests"
  ON return_requests FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = return_requests.order_id AND orders.user_id = auth.uid()));

-- ─── REFUNDS ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS refunds (
  id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID            NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount          NUMERIC(10,2)   NOT NULL CHECK (amount >= 0),
  reason          TEXT,
  status          TEXT            NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  requested_at    TIMESTAMPTZ     NOT NULL DEFAULT now(),
  processed_at    TIMESTAMPTZ,
  processed_by    UUID            REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refunds_order   ON refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status  ON refunds(status);

CREATE TRIGGER set_refunds_updated_at
  BEFORE UPDATE ON refunds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage refunds"
  ON refunds FOR ALL
  USING (is_staff());

-- ─── ORDER MANAGEMENT INDEXES ────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_orders_status_payment
  ON orders(status, payment_status);

-- ─── 1. ORDER METRICS ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_order_metrics()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'totalOrders',      (SELECT COUNT(*) FROM public.orders),
    'pendingOrders',    (SELECT COUNT(*) FROM public.orders WHERE status = 'pending'),
    'processingOrders', (SELECT COUNT(*) FROM public.orders WHERE status = 'processing'),
    'deliveredOrders',  (SELECT COUNT(*) FROM public.orders WHERE status = 'delivered'),
    'cancelledOrders',  (SELECT COUNT(*) FROM public.orders WHERE status = 'cancelled'),
    'returnedOrders',   (SELECT COUNT(*) FROM public.orders WHERE status = 'returned'),
    'refundedOrders',   (SELECT COUNT(*) FROM public.orders WHERE status = 'refunded')
  );
$$;

-- ─── 2. ORDERS LIST (paginated, filtered, sorted) ───────────────────────────

CREATE OR REPLACE FUNCTION get_orders_management(
  p_page          INT DEFAULT 1,
  p_page_size     INT DEFAULT 20,
  p_search        TEXT DEFAULT NULL,
  p_sort_by       TEXT DEFAULT 'created_at',
  p_sort_dir      TEXT DEFAULT 'desc',
  p_status        TEXT DEFAULT NULL,
  p_payment_status TEXT DEFAULT NULL,
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
  v_sql    TEXT;
  v_count_sql TEXT;
  v_where  TEXT := ' WHERE 1=1';
BEGIN
  v_offset := (p_page - 1) * p_page_size;

  IF p_search IS NOT NULL AND p_search != '' THEN
    v_where := v_where || format(
      ' AND (o.order_number ILIKE %L OR p.first_name ILIKE %L OR p.last_name ILIKE %L OR p.email ILIKE %L)',
      '%' || p_search || '%',
      '%' || p_search || '%',
      '%' || p_search || '%',
      '%' || p_search || '%'
    );
  END IF;

  IF p_status IS NOT NULL AND p_status != '' THEN
    v_where := v_where || format(' AND o.status = %L', p_status);
  END IF;

  IF p_payment_status IS NOT NULL AND p_payment_status != '' THEN
    v_where := v_where || format(' AND o.payment_status = %L', p_payment_status);
  END IF;

  IF p_date_from IS NOT NULL THEN
    v_where := v_where || format(' AND DATE(o.created_at) >= %L', p_date_from);
  END IF;

  IF p_date_to IS NOT NULL THEN
    v_where := v_where || format(' AND DATE(o.created_at) <= %L', p_date_to);
  END IF;

  v_count_sql := 'SELECT COUNT(*) FROM public.orders o LEFT JOIN public.profiles p ON p.id = o.user_id' || v_where;
  EXECUTE v_count_sql INTO v_total;

  v_sql := 'SELECT jsonb_build_object(
    ''orders'', COALESCE(jsonb_agg(sub ORDER BY ' ||
    CASE
      WHEN p_sort_by = 'total'        THEN 'sub.total'
      WHEN p_sort_by = 'status'       THEN 'sub.status'
      WHEN p_sort_by = 'payment_status' THEN 'sub.payment_status'
      WHEN p_sort_by = 'customer_name' THEN 'sub.customer_name'
      ELSE 'sub.created_at'
    END ||
    CASE WHEN p_sort_dir = 'asc' THEN ' ASC' ELSE ' DESC' END ||
    '), ''[]''::jsonb),
    ''total'', ' || v_total || '
  )
  FROM (
    SELECT
      o.id, o.order_number, o.total, o.status, o.payment_status,
      o.payment_method, o.created_at, o.updated_at,
      COALESCE(p.first_name || '' '' || p.last_name, p.email, ''—'') AS customer_name,
      COALESCE(p.email, ''—'') AS customer_email,
      (SELECT COUNT(*) FROM public.order_items oi WHERE oi.order_id = o.id) AS item_count
    FROM public.orders o
    LEFT JOIN public.profiles p ON p.id = o.user_id'
    || v_where || '
    ORDER BY ' ||
    CASE
      WHEN p_sort_by = 'total'        THEN 'o.total'
      WHEN p_sort_by = 'status'       THEN 'o.status'
      WHEN p_sort_by = 'payment_status' THEN 'o.payment_status'
      WHEN p_sort_by = 'customer_name' THEN 'p.first_name, p.last_name'
      ELSE 'o.created_at'
    END ||
    CASE WHEN p_sort_dir = 'asc' THEN ' ASC' ELSE ' DESC' END ||
    ' LIMIT ' || p_page_size || ' OFFSET ' || v_offset || '
  ) sub';

  EXECUTE v_sql INTO v_result;
  RETURN COALESCE(v_result, jsonb_build_object('orders', '[]'::jsonb, 'total', 0));
END;
$$;

-- ─── 3. ORDER DETAILS (single order with items, customer, financials) ───────

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

-- ─── 4. UPDATE ORDER STATUS ─────────────────────────────────────────────────

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

-- ─── 5. CREATE RETURN REQUEST ───────────────────────────────────────────────

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

-- ─── 6. PROCESS RETURN ──────────────────────────────────────────────────────

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

-- ─── 7. CREATE REFUND ───────────────────────────────────────────────────────

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

-- ─── 8. PROCESS REFUND ──────────────────────────────────────────────────────

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
-- End of migration 012
-- ============================================================================
