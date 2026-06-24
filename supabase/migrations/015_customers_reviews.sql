-- ============================================================================
-- ANORA — Customers Management & Reviews Administration
-- Migration 015: Reviews table, customer RPCs, review RPCs, indexes, RLS.
-- ============================================================================
-- Apply AFTER 014_categories_inventory.sql
-- ============================================================================

-- ─── REVIEWS TABLE ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reviews (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     UUID          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating      INT           NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title       TEXT,
  review_text TEXT,
  status      TEXT          NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note  TEXT,
  approved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_status      ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id  ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id     ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at  ON reviews(created_at DESC);

DROP TRIGGER IF EXISTS set_reviews_updated_at ON reviews;
CREATE TRIGGER set_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage all reviews"
  ON reviews FOR ALL
  USING (is_staff());

CREATE POLICY "Anyone can read approved reviews"
  ON reviews FOR SELECT
  USING (status = 'approved' OR is_staff());

CREATE POLICY "Customers can create own reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Customers can update own pending reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- ─── CUSTOMER MANAGEMENT RPCs ───────────────────────────────────────────────

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
  v_where   TEXT := 'WHERE p.role = ''customer''';
  v_having  TEXT := '';
BEGIN
  v_offset := (p_page - 1) * p_page_size;

  IF p_search IS NOT NULL AND p_search != '' THEN
    v_where := v_where || format(
      ' AND (p.first_name ILIKE %1$L OR p.last_name ILIKE %1$L OR p.email ILIKE %1$L OR p.first_name || '' '' || p.last_name ILIKE %1$L)',
      '%' || p_search || '%'
    );
  END IF;

  IF p_activity = 'active' THEN
    v_having := 'HAVING MAX(o.created_at) >= NOW() - INTERVAL ''90 days'' OR COUNT(o.id) > 0';
  ELSIF p_activity = 'inactive' THEN
    v_having := 'HAVING (MAX(o.created_at) IS NULL OR MAX(o.created_at) < NOW() - INTERVAL ''90 days'')';
  END IF;

  -- First get total count (without HAVING filters for activity)
  EXECUTE 'SELECT COUNT(*) FROM public.profiles p WHERE p.role = ''customer'' AND (
    p_search IS NULL OR p_search = ''''
    OR p.first_name ILIKE ''%' || COALESCE(p_search, '') || '%''
    OR p.last_name ILIKE ''%' || COALESCE(p_search, '') || '%''
    OR p.email ILIKE ''%' || COALESCE(p_search, '') || '%''
  )' INTO v_total;

  -- Build the main query with segment filter
  EXECUTE 'SELECT jsonb_build_object(
    ''customers'', COALESCE(jsonb_agg(sub ORDER BY ' ||
    CASE
      WHEN p_sort_by = 'name'           THEN 'sub.name'
      WHEN p_sort_by = 'email'          THEN 'sub.email'
      WHEN p_sort_by = 'orders_count'   THEN 'sub.orders_count'
      WHEN p_sort_by = 'total_spent'    THEN 'sub.total_spent'
      WHEN p_sort_by = 'created_at'     THEN 'sub.registration_date'
      WHEN p_sort_by = 'last_activity'  THEN 'sub.last_activity'
      ELSE 'sub.registration_date'
    END ||
    CASE WHEN p_sort_dir = 'asc' THEN ' ASC' ELSE ' DESC' END ||
    '), ''[]''::jsonb),
    ''total'', $1
  )
  FROM (
    SELECT
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
    LEFT JOIN public.orders o ON o.user_id = p.id'
    || v_where ||
    ' GROUP BY p.id' ||
    CASE WHEN p_activity IS NOT NULL AND p_activity != '' THEN
      CASE WHEN p_activity = 'active' THEN
        ' HAVING (MAX(o.created_at) >= NOW() - INTERVAL ''90 days'' OR COUNT(o.id) > 0)'
      WHEN p_activity = 'inactive' THEN
        ' HAVING (MAX(o.created_at) IS NULL OR MAX(o.created_at) < NOW() - INTERVAL ''90 days'')'
      ELSE ''
      END
    ELSE '' END ||
    ') sub'
    || CASE
      WHEN p_segment IS NOT NULL AND p_segment != '' AND p_segment != 'all' THEN
        format(' WHERE sub.segment = %L', p_segment)
      ELSE ''
    END ||
    ' ORDER BY ' ||
    CASE
      WHEN p_sort_by = 'name'           THEN 'sub.name'
      WHEN p_sort_by = 'email'          THEN 'sub.email'
      WHEN p_sort_by = 'orders_count'   THEN 'sub.orders_count'
      WHEN p_sort_by = 'total_spent'    THEN 'sub.total_spent'
      WHEN p_sort_by = 'created_at'     THEN 'sub.registration_date'
      WHEN p_sort_by = 'last_activity'  THEN 'sub.last_activity'
      ELSE 'sub.registration_date'
    END ||
    CASE WHEN p_sort_dir = 'asc' THEN ' ASC' ELSE ' DESC' END ||
    ' LIMIT ' || p_page_size || ' OFFSET ' || v_offset
  INTO v_result
  USING v_total;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

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

CREATE OR REPLACE FUNCTION get_customers_analytics()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'totalCustomers',     (SELECT COUNT(*) FROM public.profiles WHERE role = 'customer'),
    'newCustomers',       (
      SELECT COUNT(*) FROM (
        SELECT p.id
        FROM public.profiles p
        LEFT JOIN public.orders o ON o.user_id = p.id AND o.status NOT IN ('cancelled', 'refunded')
        GROUP BY p.id
        HAVING COUNT(DISTINCT o.id) <= 1
      ) sub
    ),
    'returningCustomers',  (
      SELECT COUNT(*) FROM (
        SELECT p.id
        FROM public.profiles p
        JOIN public.orders o ON o.user_id = p.id AND o.status NOT IN ('cancelled', 'refunded')
        GROUP BY p.id
        HAVING COUNT(DISTINCT o.id) >= 2
          AND COALESCE(SUM(o.total), 0) < 1000
      ) sub
    ),
    'vipCustomers',       (
      SELECT COUNT(*) FROM (
        SELECT p.id
        FROM public.profiles p
        JOIN public.orders o ON o.user_id = p.id AND o.status NOT IN ('cancelled', 'refunded')
        GROUP BY p.id
        HAVING COALESCE(SUM(o.total), 0) >= 1000
      ) sub
    )
  );
$$;

-- ─── REVIEW MANAGEMENT RPCs ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_reviews_management(
  p_page          INT DEFAULT 1,
  p_page_size     INT DEFAULT 20,
  p_search        TEXT DEFAULT NULL,
  p_sort_by       TEXT DEFAULT 'created_at',
  p_sort_dir      TEXT DEFAULT 'desc',
  p_status_filter TEXT DEFAULT NULL,
  p_rating_filter INT DEFAULT NULL
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
      ' AND (pr.name ILIKE %1$L OR p.first_name || '' '' || p.last_name ILIKE %1$L OR p.email ILIKE %1$L OR r.review_text ILIKE %1$L)',
      '%' || p_search || '%'
    );
  END IF;

  IF p_status_filter IS NOT NULL AND p_status_filter != '' AND p_status_filter != 'all' THEN
    v_where := v_where || format(' AND r.status = %L', p_status_filter);
  END IF;

  IF p_rating_filter IS NOT NULL AND p_rating_filter BETWEEN 1 AND 5 THEN
    v_where := v_where || format(' AND r.rating = %L', p_rating_filter);
  END IF;

  EXECUTE 'SELECT COUNT(*) FROM public.reviews r
    JOIN public.products pr ON pr.id = r.product_id
    JOIN public.profiles p ON p.id = r.user_id'
    || v_where INTO v_total;

  EXECUTE 'SELECT jsonb_build_object(
    ''reviews'', COALESCE(jsonb_agg(sub ORDER BY ' ||
    CASE
      WHEN p_sort_by = 'rating'   THEN 'sub.rating'
      WHEN p_sort_by = 'status'   THEN 'sub.status'
      WHEN p_sort_by = 'created_at' THEN 'sub.created_at'
      ELSE 'sub.created_at'
    END ||
    CASE WHEN p_sort_dir = 'asc' THEN ' ASC' ELSE ' DESC' END ||
    '), ''[]''::jsonb),
    ''total'', $1
  )
  FROM (
    SELECT
      r.id,
      r.rating,
      r.title,
      r.review_text,
      r.status,
      r.admin_note,
      r.approved_at,
      r.created_at,
      r.updated_at,
      pr.id AS product_id,
      pr.name AS product_name,
      pr.slug AS product_slug,
      (SELECT pi.image_url FROM public.product_images pi WHERE pi.product_id = pr.id ORDER BY pi.sort_order ASC LIMIT 1) AS product_image,
      p.id AS user_id,
      p.first_name || '' '' || p.last_name AS customer_name,
      p.email AS customer_email
    FROM public.reviews r
    JOIN public.products pr ON pr.id = r.product_id
    JOIN public.profiles p ON p.id = r.user_id'
    || v_where ||
    ' ORDER BY ' ||
    CASE
      WHEN p_sort_by = 'rating'   THEN 'r.rating'
      WHEN p_sort_by = 'status'   THEN 'r.status'
      WHEN p_sort_by = 'created_at' THEN 'r.created_at'
      ELSE 'r.created_at'
    END ||
    CASE WHEN p_sort_dir = 'asc' THEN ' ASC' ELSE ' DESC' END ||
    ' LIMIT ' || p_page_size || ' OFFSET ' || v_offset || '
  ) sub'
  INTO v_result
  USING v_total;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

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

CREATE OR REPLACE FUNCTION approve_review(p_review_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.reviews
  SET status = 'approved', approved_at = now(), updated_at = now()
  WHERE id = p_review_id;
  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION reject_review(p_review_id UUID, p_admin_note TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.reviews
  SET status = 'rejected', admin_note = COALESCE(p_admin_note, admin_note), updated_at = now()
  WHERE id = p_review_id;
  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION delete_review(p_review_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.reviews WHERE id = p_review_id;
  IF FOUND THEN
    RETURN jsonb_build_object('success', true);
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Review not found');
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION get_review_stats()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'total',          (SELECT COUNT(*) FROM public.reviews),
    'pending',        (SELECT COUNT(*) FROM public.reviews WHERE status = 'pending'),
    'approved',       (SELECT COUNT(*) FROM public.reviews WHERE status = 'approved'),
    'rejected',       (SELECT COUNT(*) FROM public.reviews WHERE status = 'rejected'),
    'average_rating', (SELECT ROUND(AVG(rating)::numeric, 2) FROM public.reviews WHERE status = 'approved')
  );
$$;

-- ============================================================================
-- End of migration 015
-- ============================================================================
