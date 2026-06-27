-- ============================================================================
-- ANORA — Finance & Reporting RPCs
-- Migration 019: RPCs for Finance Dashboard, Invoices, Reports.
-- ============================================================================

-- ─── 1. FINANCE DASHBOARD ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_finance_dashboard()
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
    -- Revenue
    'grossRevenue',       COALESCE((SELECT SUM(o.total) FROM public.orders o WHERE o.payment_status = 'completed'), 0),
    'netRevenue',         COALESCE((SELECT SUM(o.total - COALESCE(o.tax_amount,0)) FROM public.orders o WHERE o.payment_status = 'completed'), 0),
    'revenueToday',       COALESCE((SELECT SUM(o.total) FROM public.orders o WHERE o.payment_status = 'completed' AND o.created_at >= CURRENT_DATE::timestamptz), 0),
    'revenueThisWeek',    COALESCE((SELECT SUM(o.total) FROM public.orders o WHERE o.payment_status = 'completed' AND o.created_at >= date_trunc('week', CURRENT_DATE)), 0),
    'revenueThisMonth',   COALESCE((SELECT SUM(o.total) FROM public.orders o WHERE o.payment_status = 'completed' AND o.created_at >= date_trunc('month', CURRENT_DATE)), 0),
    'revenueThisYear',    COALESCE((SELECT SUM(o.total) FROM public.orders o WHERE o.payment_status = 'completed' AND o.created_at >= date_trunc('year', CURRENT_DATE)), 0),

    -- Financial metrics
    'taxesCollected',     COALESCE((SELECT SUM(COALESCE(o.tax_amount,0)) FROM public.orders o WHERE o.payment_status = 'completed'), 0),
    'discountsApplied',   COALESCE((SELECT SUM(COALESCE(o.discount,0)) FROM public.orders o WHERE o.payment_status = 'completed'), 0),
    'refundAmounts',      COALESCE((SELECT SUM(COALESCE(r.amount,0)) FROM public.refunds r), 0),
    'averageOrderValue',  COALESCE((SELECT AVG(o.total) FROM public.orders o WHERE o.payment_status = 'completed'), 0),
    'totalPaidOrders',    (SELECT COUNT(*) FROM public.orders o WHERE o.payment_status = 'completed'),
    'outstandingAmounts', COALESCE((SELECT SUM(o.total) FROM public.orders o WHERE o.payment_status NOT IN ('completed', 'refunded', 'failed') AND o.status != 'cancelled'), 0),

    -- Invoice counts
    'totalInvoices',      (SELECT COUNT(*) FROM public.invoices),
    'draftInvoices',      (SELECT COUNT(*) FROM public.invoices WHERE status = 'draft'),
    'issuedInvoices',     (SELECT COUNT(*) FROM public.invoices WHERE status = 'issued'),
    'paidInvoices',       (SELECT COUNT(*) FROM public.invoices WHERE status = 'paid')
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- ─── 2. REVENUE TREND ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_revenue_trend(
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
  v_start DATE;
  v_end   DATE;
  v_result JSONB;
BEGIN
  v_start := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days');
  v_end   := COALESCE(p_end_date, CURRENT_DATE);

  WITH trend AS (
    SELECT d::DATE AS day_date,
           COALESCE(SUM(o.total), 0) AS revenue
    FROM generate_series(v_start, v_end, '1 day'::INTERVAL) AS d(d)
    LEFT JOIN public.orders o
      ON o.payment_status = 'completed'
      AND o.created_at >= d::timestamptz
      AND o.created_at < d::timestamptz + INTERVAL '1 day'
    GROUP BY d
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'date', day_date::TEXT,
    'revenue', revenue
  ) ORDER BY day_date), '[]'::jsonb)
  INTO v_result
  FROM trend;

  RETURN v_result;
END;
$$;

-- ─── 3. TAX TREND ──────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_tax_trend(
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
  v_start DATE;
  v_end   DATE;
  v_result JSONB;
BEGIN
  v_start := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days');
  v_end   := COALESCE(p_end_date, CURRENT_DATE);

  WITH trend AS (
    SELECT d::DATE AS day_date,
           COALESCE(SUM(COALESCE(o.tax_amount,0)), 0) AS tax
    FROM generate_series(v_start, v_end, '1 day'::INTERVAL) AS d(d)
    LEFT JOIN public.orders o
      ON o.payment_status = 'completed'
      AND o.created_at >= d::timestamptz
      AND o.created_at < d::timestamptz + INTERVAL '1 day'
    GROUP BY d
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'date', day_date::TEXT,
    'tax', tax
  ) ORDER BY day_date), '[]'::jsonb)
  INTO v_result
  FROM trend;

  RETURN v_result;
END;
$$;

-- ─── 4. REFUND TREND ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_refund_trend(
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
  v_start DATE;
  v_end   DATE;
  v_result JSONB;
BEGIN
  v_start := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days');
  v_end   := COALESCE(p_end_date, CURRENT_DATE);

  WITH trend AS (
    SELECT d::DATE AS day_date,
           COALESCE(SUM(COALESCE(r.amount,0)), 0) AS refund
    FROM generate_series(v_start, v_end, '1 day'::INTERVAL) AS d(d)
    LEFT JOIN public.refunds r
      ON r.created_at >= d::timestamptz
      AND r.created_at < d::timestamptz + INTERVAL '1 day'
      AND r.status = 'completed'
    GROUP BY d
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'date', day_date::TEXT,
    'refund', refund
  ) ORDER BY day_date), '[]'::jsonb)
  INTO v_result
  FROM trend;

  RETURN v_result;
END;
$$;

-- ─── 5. DISCOUNT TREND ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_discount_trend(
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
  v_start DATE;
  v_end   DATE;
  v_result JSONB;
BEGIN
  v_start := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days');
  v_end   := COALESCE(p_end_date, CURRENT_DATE);

  WITH trend AS (
    SELECT d::DATE AS day_date,
           COALESCE(SUM(COALESCE(o.discount,0)), 0) AS discount
    FROM generate_series(v_start, v_end, '1 day'::INTERVAL) AS d(d)
    LEFT JOIN public.orders o
      ON o.payment_status = 'completed'
      AND o.created_at >= d::timestamptz
      AND o.created_at < d::timestamptz + INTERVAL '1 day'
    GROUP BY d
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'date', day_date::TEXT,
    'discount', discount
  ) ORDER BY day_date), '[]'::jsonb)
  INTO v_result
  FROM trend;

  RETURN v_result;
END;
$$;

-- ─── 6. MONTHLY COMPARISON ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_monthly_comparison(
  p_year INT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_year  INT;
  v_prev  INT;
  v_result JSONB;
BEGIN
  v_year := COALESCE(p_year, EXTRACT(YEAR FROM CURRENT_DATE)::INT);
  v_prev := v_year - 1;

  WITH months AS (
    SELECT generate_series(1, 12) AS m
  ),
  current_year AS (
    SELECT m,
           COALESCE(SUM(o.total), 0) AS revenue
    FROM months
    LEFT JOIN public.orders o
      ON EXTRACT(YEAR FROM o.created_at) = v_year
      AND EXTRACT(MONTH FROM o.created_at) = m
      AND o.payment_status = 'completed'
    GROUP BY m
  ),
  prev_year AS (
    SELECT m,
           COALESCE(SUM(o.total), 0) AS revenue
    FROM months
    LEFT JOIN public.orders o
      ON EXTRACT(YEAR FROM o.created_at) = v_prev
      AND EXTRACT(MONTH FROM o.created_at) = m
      AND o.payment_status = 'completed'
    GROUP BY m
  )
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'month', cy.m,
    'revenue', cy.revenue,
    'previousRevenue', py.revenue
  ) ORDER BY cy.m), '[]'::jsonb)
  INTO v_result
  FROM current_year cy
  JOIN prev_year py ON py.m = cy.m;

  RETURN v_result;
END;
$$;

-- ─── 7. YEARLY COMPARISON ──────────────────────────────────────────────────

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
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'year', y.y,
    'revenue', COALESCE(SUM(o.total), 0)
  ) ORDER BY y.y), '[]'::jsonb)
  INTO v_result
  FROM (SELECT DISTINCT EXTRACT(YEAR FROM created_at)::INT AS y FROM public.orders WHERE payment_status = 'completed') y
  LEFT JOIN public.orders o
    ON EXTRACT(YEAR FROM o.created_at) = y.y
    AND o.payment_status = 'completed'
  GROUP BY y.y;

  RETURN v_result;
END;
$$;

-- ─── 8. INVOICES MANAGEMENT ─────────────────────────────────────────────────

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
    v_where := v_where || format(' AND i.issued_at < (%L::date + 1)::timestamptz', p_date_to);
  END IF;

  EXECUTE format('SELECT COUNT(*) FROM public.invoices i WHERE %s', v_where) INTO v_total;

  EXECUTE format(
    'SELECT jsonb_build_object(
      ''invoices'', COALESCE((SELECT jsonb_agg(sub2) FROM (
        SELECT i.id, i.invoice_number, i.customer_name, i.customer_email, i.total_amount,
               i.status, i.issued_at, i.created_at, o.order_number,
               i.subtotal, i.tax_amount, i.discount_amount, i.shipping_amount
        FROM public.invoices i
        LEFT JOIN public.orders o ON o.id = i.order_id
        WHERE %s
        ORDER BY %s %s
        LIMIT %s OFFSET %s
      ) sub2), ''[]''::jsonb),
      ''total'', %s
    )',
    v_where,
    CASE
      WHEN p_sort_by = 'number'       THEN 'i.invoice_number'
      WHEN p_sort_by = 'customer'     THEN 'i.customer_name'
      WHEN p_sort_by = 'total'        THEN 'i.total_amount'
      WHEN p_sort_by = 'status'       THEN 'i.status'
      WHEN p_sort_by = 'issue_date'   THEN 'COALESCE(i.issued_at, i.created_at)'
      ELSE 'i.created_at'
    END,
    CASE WHEN p_sort_dir = 'asc' THEN 'ASC' ELSE 'DESC' END,
    p_page_size::TEXT,
    v_offset::TEXT,
    v_total::TEXT
  ) INTO v_result;

  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- ─── 9. INVOICE DETAILS ─────────────────────────────────────────────────────

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

-- ─── 10. GENERATE INVOICE ───────────────────────────────────────────────────

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
  -- Check if invoice already exists for this order
  SELECT id INTO v_existing FROM public.invoices WHERE order_id = p_order_id;
  IF v_existing IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invoice already exists for this order', 'invoice_id', v_existing);
  END IF;

  -- Fetch order
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  IF v_order IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Order not found');
  END IF;

  -- Fetch customer
  SELECT * INTO v_customer FROM public.profiles WHERE id = v_order.user_id;

  -- Generate invoice number
  v_invoice_num := 'INV-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-' || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 6, '0');

  -- Create invoice
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

  -- Create invoice items from order_items
  INSERT INTO public.invoice_items (invoice_id, product_id, product_name, quantity, unit_price, total_price)
  SELECT v_invoice_id, oi.product_id, oi.name, oi.quantity, oi.price, (oi.price * oi.quantity)
  FROM public.order_items oi
  WHERE oi.order_id = p_order_id;

  -- Return the new invoice
  RETURN jsonb_build_object('success', true, 'invoice_id', v_invoice_id, 'invoice_number', v_invoice_num);
END;
$$;

-- ─── 11. UPDATE INVOICE STATUS ──────────────────────────────────────────────

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

-- ─── 12. REVENUE REPORT ─────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_revenue_report(
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
  v_start DATE;
  v_end   DATE;
  v_result JSONB;
BEGIN
  v_start := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days');
  v_end   := COALESCE(p_end_date, CURRENT_DATE);

  WITH daily AS (
    SELECT d::DATE AS day_date,
           COALESCE(SUM(o.total), 0) AS gross_revenue,
           COALESCE(SUM(o.total - COALESCE(o.tax_amount,0)), 0) AS net_revenue,
           COALESCE(SUM(o.discount), 0) AS discounts,
           COALESCE(SUM(o.tax_amount), 0) AS taxes,
           COUNT(o.id) AS orders_count
    FROM generate_series(v_start, v_end, '1 day'::INTERVAL) AS d(d)
    LEFT JOIN public.orders o
      ON o.payment_status = 'completed'
      AND o.created_at >= d::timestamptz
      AND o.created_at < d::timestamptz + INTERVAL '1 day'
    GROUP BY d
  )
  SELECT jsonb_build_object(
    'totalGrossRevenue', COALESCE((SELECT SUM(gross_revenue) FROM daily), 0),
    'totalNetRevenue', COALESCE((SELECT SUM(net_revenue) FROM daily), 0),
    'totalTaxes', COALESCE((SELECT SUM(taxes) FROM daily), 0),
    'totalDiscounts', COALESCE((SELECT SUM(discounts) FROM daily), 0),
    'totalOrders', (SELECT SUM(orders_count) FROM daily),
    'daily', COALESCE((SELECT jsonb_agg(jsonb_build_object(
      'date', day_date::TEXT, 'grossRevenue', gross_revenue, 'netRevenue', net_revenue,
      'discounts', discounts, 'taxes', taxes, 'orders', orders_count
    ) ORDER BY day_date) FROM daily), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- ─── 13. FINANCIAL REPORT ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_financial_report(
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
  v_start DATE;
  v_end   DATE;
  v_result JSONB;
BEGIN
  v_start := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days');
  v_end   := COALESCE(p_end_date, CURRENT_DATE);

  WITH daily AS (
    SELECT d::DATE AS day_date,
           COALESCE(SUM(COALESCE(o.tax_amount,0)), 0) AS taxes,
           COALESCE(SUM(COALESCE(o.discount,0)), 0) AS discounts,
           COALESCE(SUM(COALESCE(r.amount,0)), 0) AS refunds
    FROM generate_series(v_start, v_end, '1 day'::INTERVAL) AS d(d)
    LEFT JOIN public.orders o
      ON o.payment_status = 'completed'
      AND o.created_at >= d::timestamptz
      AND o.created_at < d::timestamptz + INTERVAL '1 day'
    LEFT JOIN public.refunds r
      ON r.status = 'completed'
      AND r.created_at >= d::timestamptz
      AND r.created_at < d::timestamptz + INTERVAL '1 day'
    GROUP BY d
  )
  SELECT jsonb_build_object(
    'totalTaxes', COALESCE((SELECT SUM(taxes) FROM daily), 0),
    'totalDiscounts', COALESCE((SELECT SUM(discounts) FROM daily), 0),
    'totalRefunds', COALESCE((SELECT SUM(refunds) FROM daily), 0),
    'daily', COALESCE((SELECT jsonb_agg(jsonb_build_object(
      'date', day_date::TEXT, 'taxes', taxes, 'discounts', discounts, 'refunds', refunds
    ) ORDER BY day_date) FROM daily), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- ─── 14. CUSTOMER REPORT ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_customer_report(
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
  SELECT jsonb_build_object(
    'newCustomers',       (SELECT COUNT(*) FROM public.profiles WHERE role = 'customer'
                            AND (p_start_date IS NULL OR created_at >= p_start_date::timestamptz)
                            AND (p_end_date IS NULL OR created_at < (p_end_date::date + 1)::timestamptz)),
    'returningCustomers', COALESCE((SELECT COUNT(*) FROM (
                            SELECT o.user_id FROM public.orders o
                            WHERE o.payment_status = 'completed'
                            GROUP BY o.user_id HAVING COUNT(*) > 1
                          ) sub), 0),
    'vipCustomers',       COALESCE((SELECT COUNT(*) FROM (
                            SELECT o.user_id FROM public.orders o
                            WHERE o.payment_status = 'completed'
                            GROUP BY o.user_id
                            HAVING COALESCE(SUM(o.total), 0) >= 1000
                          ) sub), 0),
    'totalCustomers',     (SELECT COUNT(*) FROM public.profiles WHERE role = 'customer'),
    'averageLifetimeValue', COALESCE((
      SELECT AVG(customer_totals.total) FROM (
        SELECT COALESCE(SUM(o.total), 0) AS total
        FROM public.orders o
        WHERE o.payment_status = 'completed'
        GROUP BY o.user_id
      ) customer_totals
    ), 0)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- ─── 15. INVENTORY REPORT ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_inventory_report()
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
    'totalProducts',    (SELECT COUNT(*) FROM public.products WHERE is_active = true),
    'inStock',          (SELECT COUNT(*) FROM public.products WHERE is_active = true AND stock > 10),
    'lowStock',         (SELECT COUNT(*) FROM public.products WHERE is_active = true AND stock > 0 AND stock <= 10),
    'outOfStock',       (SELECT COUNT(*) FROM public.products WHERE is_active = true AND stock = 0),
    'totalStockValue',  COALESCE((SELECT SUM(COALESCE(p.stock,0) * COALESCE(p.price,0)) FROM public.products p WHERE p.is_active = true), 0),
    'recentMovements',  (SELECT COUNT(*) FROM public.inventory_logs WHERE created_at >= CURRENT_DATE - INTERVAL '30 days')
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- ─── 16. EXPORT DATA ────────────────────────────────────────────────────────

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
-- End of migration 019
-- ============================================================================
