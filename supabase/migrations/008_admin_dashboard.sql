-- ============================================================================
-- ANORA — Admin Dashboard Support
-- Migration 008: Aggregate functions for admin dashboard queries.
-- ============================================================================
-- Apply AFTER 007_checkout_hardening.sql
-- ============================================================================

-- ─── DASHBOARD STATS AGGREGATE ───────────────────────────────────────────────
-- Single-query aggregate for the dashboard overview cards.
-- More efficient than N separate count queries.

CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'totalOrders',     (SELECT COUNT(*) FROM public.orders),
    'totalRevenue',    (SELECT COALESCE(SUM(total), 0) FROM public.orders WHERE payment_status = 'completed'),
    'pendingOrders',   (SELECT COUNT(*) FROM public.orders WHERE status = 'pending'),
    'deliveredOrders', (SELECT COUNT(*) FROM public.orders WHERE status = 'delivered'),
    'cancelledOrders', (SELECT COUNT(*) FROM public.orders WHERE status = 'cancelled'),
    'refundRequests',  (SELECT COUNT(*) FROM public.orders WHERE status = 'refunded'),
    'totalProducts',   (SELECT COUNT(*) FROM public.products WHERE is_active = true),
    'totalCustomers',  (SELECT COUNT(*) FROM public.profiles WHERE role = 'customer')
  );
$$;

-- ============================================================================
-- End of migration 008
-- ============================================================================
