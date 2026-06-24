-- ============================================================================
-- ANORA — Coupons & Gift Cards Management System
-- Migration 016: Coupon redemptions tracking, gift cards, analytics RPCs.
-- ============================================================================
-- Apply AFTER 015_customers_reviews.sql
-- ============================================================================

-- ─── ENSURE COUPON TABLE HAS ALL MODERN FIELDS ──────────────────────────────

ALTER TABLE coupons ADD COLUMN IF NOT EXISTS maximum_discount_amount NUMERIC(10,2) CHECK (maximum_discount_amount IS NULL OR maximum_discount_amount >= 0);
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

CREATE TRIGGER set_coupons_updated_at
  BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── COUPON REDEMPTIONS ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id       UUID            NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id         UUID            NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id        UUID            NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  discount_amount NUMERIC(10,2)   NOT NULL CHECK (discount_amount >= 0),
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon   ON coupon_redemptions(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user     ON coupon_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_order    ON coupon_redemptions(order_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_created  ON coupon_redemptions(created_at DESC);

ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage coupon_redemptions"
  ON coupon_redemptions FOR ALL
  USING (is_staff());

CREATE POLICY "Users can view own coupon_redemptions"
  ON coupon_redemptions FOR SELECT
  USING (user_id = auth.uid());

-- ─── GIFT CARDS ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS gift_cards (
  id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT            NOT NULL UNIQUE,
  initial_balance NUMERIC(10,2)   NOT NULL CHECK (initial_balance > 0),
  current_balance NUMERIC(10,2)   NOT NULL CHECK (current_balance >= 0),
  status          TEXT            NOT NULL DEFAULT 'active'
                                  CHECK (status IN ('active', 'inactive', 'expired', 'depleted')),
  expires_at      TIMESTAMPTZ,
  created_by      UUID            REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gift_cards_code        ON gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_gift_cards_status      ON gift_cards(status);
CREATE INDEX IF NOT EXISTS idx_gift_cards_expires     ON gift_cards(expires_at) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_gift_cards_created     ON gift_cards(created_at DESC);

CREATE TRIGGER set_gift_cards_updated_at
  BEFORE UPDATE ON gift_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage gift_cards"
  ON gift_cards FOR ALL
  USING (is_staff());

CREATE POLICY "Anyone can read active gift_cards"
  ON gift_cards FOR SELECT
  USING (
    (status = 'active' AND (expires_at IS NULL OR expires_at > now()))
    OR auth.uid() = created_by
    OR is_staff()
  );

-- ─── GIFT CARD TRANSACTIONS ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS gift_card_transactions (
  id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_card_id    UUID            NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
  order_id        UUID            REFERENCES orders(id) ON DELETE SET NULL,
  user_id         UUID            REFERENCES auth.users(id) ON DELETE SET NULL,
  transaction_type TEXT           NOT NULL CHECK (transaction_type IN ('redemption', 'refund', 'adjustment', 'expiration', 'activation')),
  amount          NUMERIC(10,2)   NOT NULL CHECK (amount > 0),
  balance_before  NUMERIC(10,2)   NOT NULL,
  balance_after   NUMERIC(10,2)   NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gct_gift_card     ON gift_card_transactions(gift_card_id);
CREATE INDEX IF NOT EXISTS idx_gct_user          ON gift_card_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_gct_order         ON gift_card_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_gct_created       ON gift_card_transactions(created_at DESC);

ALTER TABLE gift_card_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage gift_card_transactions"
  ON gift_card_transactions FOR ALL
  USING (is_staff());

CREATE POLICY "Users can view own gift_card_transactions"
  ON gift_card_transactions FOR SELECT
  USING (user_id = auth.uid());

-- ─── COUPON MANAGEMENT RPCs ──────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_coupons_management(
  p_page          INT DEFAULT 1,
  p_page_size     INT DEFAULT 20,
  p_search        TEXT DEFAULT NULL,
  p_sort_by       TEXT DEFAULT 'created_at',
  p_sort_dir      TEXT DEFAULT 'desc',
  p_status_filter TEXT DEFAULT NULL,
  p_type_filter   TEXT DEFAULT NULL
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
      ' AND (c.code ILIKE %L OR c.description ILIKE %L)',
      '%' || p_search || '%',
      '%' || p_search || '%'
    );
  END IF;

  IF p_status_filter IS NOT NULL AND p_status_filter != '' AND p_status_filter != 'all' THEN
    IF p_status_filter = 'active' THEN
      v_where := v_where || ' AND c.is_active = true AND (c.expires_at IS NULL OR c.expires_at > now()) AND (c.max_uses IS NULL OR c.used_count < c.max_uses)';
    ELSIF p_status_filter = 'inactive' THEN
      v_where := v_where || ' AND c.is_active = false';
    ELSIF p_status_filter = 'expired' THEN
      v_where := v_where || ' AND c.expires_at IS NOT NULL AND c.expires_at <= now()';
    ELSIF p_status_filter = 'exhausted' THEN
      v_where := v_where || ' AND c.max_uses IS NOT NULL AND c.used_count >= c.max_uses';
    END IF;
  END IF;

  IF p_type_filter IS NOT NULL AND p_type_filter != '' AND p_type_filter != 'all' THEN
    v_where := v_where || format(' AND c.discount_type = %L', p_type_filter);
  END IF;

  v_total := 0;
  EXECUTE 'SELECT COUNT(*) FROM public.coupons c' || v_where INTO v_total;

  EXECUTE 'SELECT jsonb_build_object(
    ''coupons'', COALESCE(jsonb_agg(sub ORDER BY ' ||
    CASE
      WHEN p_sort_by = 'code'           THEN 'sub.code'
      WHEN p_sort_by = 'discount_type'  THEN 'sub.discount_type'
      WHEN p_sort_by = 'discount_value' THEN 'sub.discount_value'
      WHEN p_sort_by = 'used_count'     THEN 'sub.used_count'
      WHEN p_sort_by = 'max_uses'       THEN 'sub.max_uses'
      WHEN p_sort_by = 'is_active'      THEN 'sub.is_active'
      WHEN p_sort_by = 'starts_at'      THEN 'sub.starts_at'
      WHEN p_sort_by = 'expires_at'     THEN 'sub.expires_at'
      ELSE 'sub.created_at'
    END ||
    CASE WHEN p_sort_dir = 'asc' THEN ' ASC' ELSE ' DESC' END ||
    '), ''[]''::jsonb),
    ''total'', $1
  )
  FROM (
    SELECT
      c.id, c.code, c.description, c.discount_type::TEXT, c.discount_value,
      c.max_uses, c.used_count, c.is_active, c.starts_at, c.expires_at,
      c.maximum_discount_amount,
      c.metadata, c.min_order, c.created_at, c.updated_at,
      (SELECT COALESCE(SUM(cr.discount_amount), 0) FROM public.coupon_redemptions cr WHERE cr.coupon_id = c.id) AS total_discounted
    FROM public.coupons c'
    || v_where ||
    ' ORDER BY ' ||
    CASE
      WHEN p_sort_by = 'code'           THEN 'c.code'
      WHEN p_sort_by = 'discount_type'  THEN 'c.discount_type'
      WHEN p_sort_by = 'discount_value' THEN 'c.discount_value'
      WHEN p_sort_by = 'used_count'     THEN 'c.used_count'
      WHEN p_sort_by = 'max_uses'       THEN 'c.max_uses'
      WHEN p_sort_by = 'is_active'      THEN 'c.is_active'
      WHEN p_sort_by = 'starts_at'      THEN 'c.starts_at'
      WHEN p_sort_by = 'expires_at'     THEN 'c.expires_at'
      ELSE 'c.created_at'
    END ||
    CASE WHEN p_sort_dir = 'asc' THEN ' ASC' ELSE ' DESC' END ||
    ' LIMIT ' || p_page_size || ' OFFSET ' || v_offset || '
  ) sub'
  INTO v_result
  USING v_total;

  RETURN COALESCE(v_result, jsonb_build_object('coupons', '[]'::jsonb, 'total', 0));
END;
$$;

CREATE OR REPLACE FUNCTION get_coupon_details(p_coupon_id UUID)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'id',                c.id,
    'code',              c.code,
    'description',       c.description,
    'discount_type',     c.discount_type::TEXT,
    'discount_value',    c.discount_value,
    'max_uses',          c.max_uses,
    'used_count',        c.used_count,
    'is_active',         c.is_active,
    'starts_at',         c.starts_at,
    'expires_at',        c.expires_at,
    'min_order',         c.min_order,
    'maximum_discount_amount', c.maximum_discount_amount,
    'metadata',          c.metadata,
    'min_order',         c.min_order,
    'created_at',        c.created_at,
    'updated_at',        c.updated_at,
    'redemptions',       COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id',         cr.id,
        'user_id',    cr.user_id,
        'order_id',   cr.order_id,
        'discount_amount', cr.discount_amount,
        'created_at', cr.created_at
      ) ORDER BY cr.created_at DESC)
      FROM public.coupon_redemptions cr WHERE cr.coupon_id = c.id
    ), '[]'::jsonb),
    'total_redeemed', (SELECT COALESCE(COUNT(*), 0) FROM public.coupon_redemptions cr WHERE cr.coupon_id = c.id),
    'total_discounted', (SELECT COALESCE(SUM(cr.discount_amount), 0) FROM public.coupon_redemptions cr WHERE cr.coupon_id = c.id)
  )
  FROM public.coupons c
  WHERE c.id = p_coupon_id;
$$;

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

CREATE OR REPLACE FUNCTION delete_coupon(p_coupon_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.coupons WHERE id = p_coupon_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Coupon not found');
  END IF;
  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION toggle_coupon_status(p_coupon_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current BOOLEAN;
BEGIN
  SELECT is_active INTO v_current FROM public.coupons WHERE id = p_coupon_id;

  IF v_current IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Coupon not found');
  END IF;

  UPDATE public.coupons SET is_active = NOT v_current WHERE id = p_coupon_id;

  RETURN jsonb_build_object('success', true, 'is_active', NOT v_current);
END;
$$;

CREATE OR REPLACE FUNCTION get_coupon_analytics()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'total_coupons',          (SELECT COUNT(*) FROM public.coupons),
    'active_coupons',         (SELECT COUNT(*) FROM public.coupons WHERE is_active = true AND (expires_at IS NULL OR expires_at > now()) AND (max_uses IS NULL OR used_count < max_uses)),
    'expired_coupons',        (SELECT COUNT(*) FROM public.coupons WHERE expires_at IS NOT NULL AND expires_at <= now()),
    'inactive_coupons',       (SELECT COUNT(*) FROM public.coupons WHERE is_active = false),
    'exhausted_coupons',      (SELECT COUNT(*) FROM public.coupons WHERE max_uses IS NOT NULL AND used_count >= max_uses),
    'total_redemptions',      (SELECT COALESCE(COUNT(*), 0) FROM public.coupon_redemptions),
    'total_discounted',       (SELECT COALESCE(SUM(discount_amount), 0) FROM public.coupon_redemptions),
    'percentage_coupons',     (SELECT COUNT(*) FROM public.coupons WHERE discount_type = 'percentage'),
    'fixed_coupons',          (SELECT COUNT(*) FROM public.coupons WHERE discount_type = 'fixed')
  );
$$;

CREATE OR REPLACE FUNCTION get_coupon_redemptions(
  p_coupon_id   UUID DEFAULT NULL,
  p_limit       INT DEFAULT 50,
  p_offset      INT DEFAULT 0
)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'redemptions', COALESCE(jsonb_agg(jsonb_build_object(
      'id',              cr.id,
      'coupon_id',       cr.coupon_id,
      'user_id',         cr.user_id,
      'order_id',        cr.order_id,
      'discount_amount', cr.discount_amount,
      'created_at',      cr.created_at,
      'coupon_code',     c.code,
      'customer_email',  p.email,
      'order_total',     o.total
    ) ORDER BY cr.created_at DESC), '[]'::jsonb),
    'total', (SELECT COUNT(*) FROM public.coupon_redemptions WHERE (p_coupon_id IS NULL OR coupon_id = p_coupon_id))
  )
  FROM public.coupon_redemptions cr
  JOIN public.coupons c ON c.id = cr.coupon_id
  LEFT JOIN public.profiles p ON p.id = cr.user_id
  LEFT JOIN public.orders o ON o.id = cr.order_id
  WHERE (p_coupon_id IS NULL OR cr.coupon_id = p_coupon_id)
  LIMIT p_limit OFFSET p_offset;
$$;

-- ─── GIFT CARD MANAGEMENT RPCs ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_gift_cards_management(
  p_page          INT DEFAULT 1,
  p_page_size     INT DEFAULT 20,
  p_search        TEXT DEFAULT NULL,
  p_sort_by       TEXT DEFAULT 'created_at',
  p_sort_dir      TEXT DEFAULT 'desc',
  p_status_filter TEXT DEFAULT NULL
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
    v_where := v_where || format(' AND (g.code ILIKE %L)', '%' || p_search || '%');
  END IF;

  IF p_status_filter IS NOT NULL AND p_status_filter != '' AND p_status_filter != 'all' THEN
    v_where := v_where || format(' AND g.status = %L', p_status_filter);
  END IF;

  v_total := 0;
  EXECUTE 'SELECT COUNT(*) FROM public.gift_cards g' || v_where INTO v_total;

  EXECUTE 'SELECT jsonb_build_object(
    ''gift_cards'', COALESCE(jsonb_agg(sub ORDER BY ' ||
    CASE
      WHEN p_sort_by = 'code'            THEN 'sub.code'
      WHEN p_sort_by = 'initial_balance' THEN 'sub.initial_balance'
      WHEN p_sort_by = 'current_balance' THEN 'sub.current_balance'
      WHEN p_sort_by = 'status'          THEN 'sub.status'
      WHEN p_sort_by = 'expires_at'      THEN 'sub.expires_at'
      ELSE 'sub.created_at'
    END ||
    CASE WHEN p_sort_dir = 'asc' THEN ' ASC' ELSE ' DESC' END ||
    '), ''[]''::jsonb),
    ''total'', $1
  )
  FROM (
    SELECT
      g.id, g.code, g.initial_balance, g.current_balance, g.status,
      g.expires_at, g.created_at, g.updated_at, g.created_by,
      (SELECT COALESCE(COUNT(*), 0) FROM public.gift_card_transactions gct WHERE gct.gift_card_id = g.id) AS usage_count
    FROM public.gift_cards g'
    || v_where ||
    ' ORDER BY ' ||
    CASE
      WHEN p_sort_by = 'code'            THEN 'g.code'
      WHEN p_sort_by = 'initial_balance' THEN 'g.initial_balance'
      WHEN p_sort_by = 'current_balance' THEN 'g.current_balance'
      WHEN p_sort_by = 'status'          THEN 'g.status'
      WHEN p_sort_by = 'expires_at'      THEN 'g.expires_at'
      ELSE 'g.created_at'
    END ||
    CASE WHEN p_sort_dir = 'asc' THEN ' ASC' ELSE ' DESC' END ||
    ' LIMIT ' || p_page_size || ' OFFSET ' || v_offset || '
  ) sub'
  INTO v_result
  USING v_total;

  RETURN COALESCE(v_result, jsonb_build_object('gift_cards', '[]'::jsonb, 'total', 0));
END;
$$;

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

CREATE OR REPLACE FUNCTION get_gift_card_analytics()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'total_gift_cards',     (SELECT COUNT(*) FROM public.gift_cards),
    'active_gift_cards',    (SELECT COUNT(*) FROM public.gift_cards WHERE status = 'active' AND (expires_at IS NULL OR expires_at > now())),
    'inactive_gift_cards',  (SELECT COUNT(*) FROM public.gift_cards WHERE status = 'inactive'),
    'expired_gift_cards',   (SELECT COUNT(*) FROM public.gift_cards WHERE status = 'expired'),
    'depleted_gift_cards',  (SELECT COUNT(*) FROM public.gift_cards WHERE status = 'depleted'),
    'outstanding_balance',  (SELECT COALESCE(SUM(current_balance), 0) FROM public.gift_cards WHERE status = 'active'),
    'total_issued',         (SELECT COALESCE(SUM(initial_balance), 0) FROM public.gift_cards),
    'total_redeemed',       (SELECT COALESCE(SUM(gc.initial_balance - gc.current_balance), 0) FROM public.gift_cards gc WHERE gc.status = 'depleted'),
    'total_transactions',   (SELECT COALESCE(COUNT(*), 0) FROM public.gift_card_transactions)
  );
$$;

CREATE OR REPLACE FUNCTION get_gift_card_transactions(
  p_gift_card_id UUID,
  p_limit        INT DEFAULT 50,
  p_offset       INT DEFAULT 0
)
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'transactions', COALESCE(jsonb_agg(jsonb_build_object(
      'id',              t.id,
      'gift_card_id',    t.gift_card_id,
      'order_id',        t.order_id,
      'transaction_type', t.transaction_type,
      'amount',           t.amount,
      'balance_before',   t.balance_before,
      'balance_after',    t.balance_after,
      'notes',            t.notes,
      'created_at',       t.created_at
    ) ORDER BY t.created_at DESC), '[]'::jsonb),
    'total', (SELECT COUNT(*) FROM public.gift_card_transactions WHERE gift_card_id = p_gift_card_id)
  )
  FROM public.gift_card_transactions t
  WHERE t.gift_card_id = p_gift_card_id
  LIMIT p_limit OFFSET p_offset;
$$;

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

CREATE OR REPLACE FUNCTION toggle_gift_card_status(p_gift_card_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current TEXT;
  v_balance NUMERIC;
BEGIN
  SELECT status, current_balance INTO v_current, v_balance FROM public.gift_cards WHERE id = p_gift_card_id;

  IF v_current IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gift card not found');
  END IF;

  IF v_current = 'active' THEN
    UPDATE public.gift_cards SET status = 'inactive', updated_at = now() WHERE id = p_gift_card_id;
    RETURN jsonb_build_object('success', true, 'status', 'inactive');
  ELSIF v_current = 'inactive' THEN
    UPDATE public.gift_cards SET status = 'active', updated_at = now() WHERE id = p_gift_card_id;
    INSERT INTO public.gift_card_transactions (gift_card_id, transaction_type, amount, balance_before, balance_after, notes)
    VALUES (p_gift_card_id, 'activation', v_balance, v_balance, v_balance, 'Reactivated');
    RETURN jsonb_build_object('success', true, 'status', 'active');
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Cannot toggle status for ' || v_current || ' gift cards');
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION redeem_gift_card(
  p_gift_card_id UUID,
  p_amount       NUMERIC,
  p_order_id     UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_balance NUMERIC;
  v_new_balance     NUMERIC;
  v_status          TEXT;
BEGIN
  SELECT current_balance, status INTO v_current_balance, v_status
  FROM public.gift_cards WHERE id = p_gift_card_id FOR UPDATE;

  IF v_status IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gift card not found');
  END IF;

  IF v_status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gift card is not active');
  END IF;

  IF v_current_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
  END IF;

  v_new_balance := v_current_balance - p_amount;

  UPDATE public.gift_cards
  SET current_balance = v_new_balance,
      status = CASE WHEN v_new_balance = 0 THEN 'depleted' ELSE status END,
      updated_at = now()
  WHERE id = p_gift_card_id;

  INSERT INTO public.gift_card_transactions (gift_card_id, order_id, user_id, transaction_type, amount, balance_before, balance_after)
  VALUES (p_gift_card_id, p_order_id, auth.uid(), 'redemption', p_amount, v_current_balance, v_new_balance);

  RETURN jsonb_build_object(
    'success', true,
    'amount_redeemed', p_amount,
    'balance_before', v_current_balance,
    'balance_after', v_new_balance
  );
END;
$$;

-- ============================================================================
-- End of migration 016
-- ============================================================================
