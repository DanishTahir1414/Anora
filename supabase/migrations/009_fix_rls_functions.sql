-- ============================================================================
-- ANORA — Fix RLS Helper Functions
-- Migration 009: Qualify all table references in SECURITY DEFINER functions
-- that use SET search_path = ''
-- ============================================================================
-- Root cause: has_admin_role(), is_admin(), is_staff(), and
-- get_admin_dashboard_stats() use `SET search_path = ''` but reference tables
-- without schema qualifiers (e.g. `FROM admin_roles` instead of
-- `FROM public.admin_roles`). With an empty search path, PostgreSQL only
-- searches pg_catalog — the `public` schema is never resolved, so the
-- functions silently fail when evaluated inside RLS policies.
--
-- Consequence: All RLS policies using is_staff() (orders, products, profiles
-- SELECT, etc.) evaluate to FALSE for every row, returning zero results even
-- for authenticated admin users.
-- ============================================================================

-- ─── FIX has_admin_role ───────────────────────────────────────────────────────
-- Qualify admin_roles as public.admin_roles so it resolves with search_path=''

CREATE OR REPLACE FUNCTION has_admin_role(required TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_roles
    WHERE user_id = auth.uid()
      AND (required IS NULL OR role = required)
  );
$$;

-- ─── FIX get_admin_dashboard_stats ────────────────────────────────────────────
-- Qualify orders, products, and profiles as public.* so they resolve

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

-- ─── SELF-READ POLICY ON admin_roles ──────────────────────────────────────────
-- Belt-and-suspenders: allows users to read their own admin_roles row even if
-- is_admin() were to fail. Used by fetchProfileRole() in auth-context.tsx.

CREATE POLICY "Users can read own admin role"
  ON admin_roles FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- End of migration 009
-- ============================================================================
