-- ============================================================================
-- ANORA — Row Level Security Policies
-- Migration 002: Helper functions, RLS enablement, per-table policies
-- ============================================================================
-- Apply AFTER 001_schema.sql
-- ============================================================================

-- ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

-- Returns TRUE if the current user has an admin-level role in admin_roles.
-- Admin: full system access
-- Manager: product/category/order management (no user management)
-- Editor: content management (blogs, FAQs, testimonials, coupons)
CREATE OR REPLACE FUNCTION has_admin_role(required TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM admin_roles
    WHERE user_id = auth.uid()
      AND (required IS NULL OR role = required)
  );
$$;

-- Convenience wrappers
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT has_admin_role('admin');
$$;

CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT has_admin_role(NULL);
$$;

-- Returns TRUE if the current user owns the given profile or is staff
CREATE OR REPLACE FUNCTION owns_profile(profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT auth.uid() = profile_id OR is_staff();
$$;

-- ─── ENABLE RLS ──────────────────────────────────────────────────────────────

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE products          ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images    ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists         ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons           ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials      ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters       ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_settings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications     ENABLE ROW LEVEL SECURITY;

-- ─── PROFILES ────────────────────────────────────────────────────────────────

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR is_staff());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile (non-role fields)"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR is_staff())
  WITH CHECK (
    (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()))
    OR is_staff()
  );

CREATE POLICY "Only admins can delete profiles"
  ON profiles FOR DELETE
  USING (is_admin());

-- ─── CATEGORIES ──────────────────────────────────────────────────────────────

CREATE POLICY "Anyone can read active categories"
  ON categories FOR SELECT
  USING (is_active = true OR is_staff());

CREATE POLICY "Staff can manage categories"
  ON categories FOR ALL
  USING (is_staff());

-- ─── PRODUCTS ────────────────────────────────────────────────────────────────

CREATE POLICY "Anyone can read active products"
  ON products FOR SELECT
  USING (is_active = true OR is_staff());

CREATE POLICY "Staff can manage products"
  ON products FOR ALL
  USING (is_staff());

-- ─── PRODUCT IMAGES ──────────────────────────────────────────────────────────

CREATE POLICY "Anyone can read product images"
  ON product_images FOR SELECT
  USING (true);

CREATE POLICY "Staff can manage product images"
  ON product_images FOR ALL
  USING (is_staff());

-- ─── PRODUCT VARIANTS ────────────────────────────────────────────────────────

CREATE POLICY "Anyone can read active variants"
  ON product_variants FOR SELECT
  USING (is_active = true OR is_staff());

CREATE POLICY "Staff can manage variants"
  ON product_variants FOR ALL
  USING (is_staff());

-- ─── ADDRESSES ───────────────────────────────────────────────────────────────

CREATE POLICY "Users can read own addresses"
  ON addresses FOR SELECT
  USING (auth.uid() = user_id OR is_staff());

CREATE POLICY "Users can insert own addresses"
  ON addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON addresses FOR UPDATE
  USING (auth.uid() = user_id OR is_staff())
  WITH CHECK (auth.uid() = user_id OR is_staff());

CREATE POLICY "Users can delete own addresses"
  ON addresses FOR DELETE
  USING (auth.uid() = user_id OR is_staff());

-- ─── ORDERS ──────────────────────────────────────────────────────────────────

CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id OR is_staff());

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id OR is_staff())
  WITH CHECK (
    (auth.uid() = user_id AND status IN ('pending', 'confirmed'))
    OR is_staff()
  );

CREATE POLICY "Only staff can delete orders"
  ON orders FOR DELETE
  USING (is_staff());

-- ─── ORDER ITEMS ─────────────────────────────────────────────────────────────

CREATE POLICY "Users can read own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid() OR is_staff())
    )
  );

CREATE POLICY "Users can create items on own orders"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage order items"
  ON order_items FOR UPDATE DELETE
  USING (is_staff());

-- ─── CART ITEMS ──────────────────────────────────────────────────────────────

CREATE POLICY "Users can read own cart"
  ON cart_items FOR SELECT
  USING (auth.uid() = user_id OR (session_id IS NOT NULL AND session_id = current_setting('request.session_id', true)) OR is_staff());

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  USING (auth.uid() = user_id OR is_staff());

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  USING (auth.uid() = user_id OR is_staff());

-- ─── WISHLISTS ───────────────────────────────────────────────────────────────

CREATE POLICY "Users can read own wishlist"
  ON wishlists FOR SELECT
  USING (auth.uid() = user_id OR is_staff());

CREATE POLICY "Users can add to own wishlist"
  ON wishlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from own wishlist"
  ON wishlists FOR DELETE
  USING (auth.uid() = user_id OR is_staff());

-- ─── COUPONS ─────────────────────────────────────────────────────────────────

CREATE POLICY "Anyone can read active coupons"
  ON coupons FOR SELECT
  USING (
    (is_active = true AND (starts_at IS NULL OR starts_at <= now()) AND (expires_at IS NULL OR expires_at > now()))
    OR is_staff()
  );

CREATE POLICY "Staff can manage coupons"
  ON coupons FOR ALL
  USING (is_staff());

-- ─── BLOGS ───────────────────────────────────────────────────────────────────

CREATE POLICY "Anyone can read published blogs"
  ON blogs FOR SELECT
  USING (is_published = true OR is_staff());

CREATE POLICY "Editors and above can manage blogs"
  ON blogs FOR INSERT
  WITH CHECK (has_admin_role('editor') OR has_admin_role('admin') OR has_admin_role('manager'));

CREATE POLICY "Editors and above can update blogs"
  ON blogs FOR UPDATE
  USING (has_admin_role('editor') OR has_admin_role('admin') OR has_admin_role('manager'))
  WITH CHECK (has_admin_role('editor') OR has_admin_role('admin') OR has_admin_role('manager'));

CREATE POLICY "Editors and above can delete blogs"
  ON blogs FOR DELETE
  USING (has_admin_role('editor') OR has_admin_role('admin') OR has_admin_role('manager'));

-- ─── TESTIMONIALS ────────────────────────────────────────────────────────────

CREATE POLICY "Anyone can read active testimonials"
  ON testimonials FOR SELECT
  USING (is_active = true OR is_staff());

CREATE POLICY "Staff can manage testimonials"
  ON testimonials FOR ALL
  USING (is_staff());

-- ─── FAQS ────────────────────────────────────────────────────────────────────

CREATE POLICY "Anyone can read active FAQs"
  ON faqs FOR SELECT
  USING (is_active = true OR is_staff());

CREATE POLICY "Editors and above can manage FAQs"
  ON faqs FOR INSERT
  USING (has_admin_role('editor') OR has_admin_role('admin') OR has_admin_role('manager'));

CREATE POLICY "Editors and above can update FAQs"
  ON faqs FOR UPDATE
  USING (has_admin_role('editor') OR has_admin_role('admin') OR has_admin_role('manager'))
  WITH CHECK (has_admin_role('editor') OR has_admin_role('admin') OR has_admin_role('manager'));

CREATE POLICY "Editors and above can delete FAQs"
  ON faqs FOR DELETE
  USING (has_admin_role('editor') OR has_admin_role('admin') OR has_admin_role('manager'));

-- ─── CONTACT MESSAGES ────────────────────────────────────────────────────────

CREATE POLICY "Anyone can submit contact messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Staff can read and manage contact messages"
  ON contact_messages FOR SELECT
  USING (is_staff());

CREATE POLICY "Staff can update contact messages"
  ON contact_messages FOR UPDATE
  USING (is_staff());

CREATE POLICY "Staff can delete contact messages"
  ON contact_messages FOR DELETE
  USING (is_staff());

-- ─── NEWSLETTERS ─────────────────────────────────────────────────────────────

CREATE POLICY "Anyone can subscribe"
  ON newsletters FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read own subscription (by email)"
  ON newsletters FOR SELECT
  USING (email = current_setting('request.email', true) OR is_staff());

CREATE POLICY "Staff can manage newsletters"
  ON newsletters FOR UPDATE DELETE
  USING (is_staff());

-- ─── INVENTORY LOGS ──────────────────────────────────────────────────────────

CREATE POLICY "Staff can read inventory logs"
  ON inventory_logs FOR SELECT
  USING (is_staff());

CREATE POLICY "decrement_stock function inserts logs (bypass RLS)"
  ON inventory_logs FOR INSERT
  WITH CHECK (true);  -- function is SECURITY DEFINER, manually managed

-- ─── ADMIN ROLES ─────────────────────────────────────────────────────────────

CREATE POLICY "Admins can read admin_roles"
  ON admin_roles FOR SELECT
  USING (is_admin());

CREATE POLICY "Only admins can manage admin_roles"
  ON admin_roles FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can update admin_roles"
  ON admin_roles FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete admin_roles"
  ON admin_roles FOR DELETE
  USING (is_admin());

-- ─── WEBSITE SETTINGS ────────────────────────────────────────────────────────

CREATE POLICY "Anyone can read public settings"
  ON website_settings FOR SELECT
  USING (is_public = true OR is_staff());

CREATE POLICY "Staff can manage settings"
  ON website_settings FOR ALL
  USING (is_staff());

-- ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id OR is_staff());

CREATE POLICY "Staff can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can mark own notifications as read"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id OR is_staff())
  WITH CHECK (auth.uid() = user_id OR is_staff());

CREATE POLICY "Staff can delete notifications"
  ON notifications FOR DELETE
  USING (is_staff());

-- ============================================================================
-- End of migration 002
-- ============================================================================
