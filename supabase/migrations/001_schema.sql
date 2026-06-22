-- ============================================================================
-- ANORA — Production Database Schema
-- Migration 001: Enums, Tables, Constraints, Indexes, Triggers, Functions
-- ============================================================================
-- Apply via: psql or Supabase SQL Editor (do not auto-execute)
-- Depends on: auth.users (Supabase built-in)
-- ============================================================================

-- ─── SAFETY: DROP IF EXISTS (idempotent) ──────────────────────────────────
-- Remove this section for production — kept here for development iteration.
-- ===========================================================================

DROP TABLE IF EXISTS inventory_logs     CASCADE;
DROP TABLE IF EXISTS order_items        CASCADE;
DROP TABLE IF EXISTS orders             CASCADE;
DROP TABLE IF EXISTS cart_items         CASCADE;
DROP TABLE IF EXISTS wishlists          CASCADE;
DROP TABLE IF EXISTS addresses          CASCADE;
DROP TABLE IF EXISTS admin_roles        CASCADE;
DROP TABLE IF EXISTS product_variants   CASCADE;
DROP TABLE IF EXISTS product_images     CASCADE;
DROP TABLE IF EXISTS products           CASCADE;
DROP TABLE IF EXISTS categories         CASCADE;
DROP TABLE IF EXISTS coupons            CASCADE;
DROP TABLE IF EXISTS blogs              CASCADE;
DROP TABLE IF EXISTS testimonials       CASCADE;
DROP TABLE IF EXISTS faqs               CASCADE;
DROP TABLE IF EXISTS contact_messages   CASCADE;
DROP TABLE IF EXISTS newsletters        CASCADE;
DROP TABLE IF EXISTS website_settings   CASCADE;
DROP TABLE IF EXISTS notifications      CASCADE;
DROP TABLE IF EXISTS profiles           CASCADE;

DROP TYPE IF EXISTS order_status        CASCADE;
DROP TYPE IF EXISTS payment_status      CASCADE;
DROP TYPE IF EXISTS discount_type       CASCADE;
DROP TYPE IF EXISTS notification_type   CASCADE;
DROP TYPE IF EXISTS inventory_change_type CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS decrement_stock           CASCADE;
DROP FUNCTION IF EXISTS is_admin                  CASCADE;

-- ─── ENUMS ───────────────────────────────────────────────────────────────────

CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'refunded'
);

CREATE TYPE discount_type AS ENUM (
  'percentage',
  'fixed'
);

CREATE TYPE notification_type AS ENUM (
  'order_update',
  'promo',
  'newsletter',
  'system'
);

CREATE TYPE inventory_change_type AS ENUM (
  'order',
  'restock',
  'adjustment',
  'return',
  'cancellation'
);

-- ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

-- Auto-updates updated_at on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Safe stock decrement with row-level locking and logging.
-- Returns TRUE if stock was sufficient and decremented, FALSE otherwise.
-- Call within a transaction to ensure atomicity.
CREATE OR REPLACE FUNCTION decrement_stock(
  p_product_id UUID,
  p_quantity   INT,
  p_variant_id UUID DEFAULT NULL,
  p_reference  TEXT  DEFAULT NULL,
  p_notes      TEXT  DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_current_stock INT;
  v_change_type   inventory_change_type := 'order';
BEGIN
  IF p_variant_id IS NOT NULL THEN
    -- Decrement variant stock
    SELECT stock INTO v_current_stock
    FROM product_variants
    WHERE id = p_variant_id
    FOR UPDATE;

    IF v_current_stock IS NULL THEN
      RETURN FALSE;
    END IF;

    IF v_current_stock < p_quantity THEN
      RETURN FALSE;
    END IF;

    UPDATE product_variants
    SET stock = stock - p_quantity
    WHERE id = p_variant_id;

    INSERT INTO inventory_logs (
      product_id, variant_id, change_type, quantity_change,
      quantity_after, reference_id, notes
    ) VALUES (
      p_product_id, p_variant_id, v_change_type, -p_quantity,
      v_current_stock - p_quantity, p_reference, p_notes
    );
  ELSE
    -- Decrement product-level stock
    SELECT stock INTO v_current_stock
    FROM products
    WHERE id = p_product_id
    FOR UPDATE;

    IF v_current_stock IS NULL THEN
      RETURN FALSE;
    END IF;

    IF v_current_stock < p_quantity THEN
      RETURN FALSE;
    END IF;

    UPDATE products
    SET stock = stock - p_quantity
    WHERE id = p_product_id;

    INSERT INTO inventory_logs (
      product_id, change_type, quantity_change,
      quantity_after, reference_id, notes
    ) VALUES (
      p_product_id, v_change_type, -p_quantity,
      v_current_stock - p_quantity, p_reference, p_notes
    );
  END IF;

  RETURN TRUE;
END;
$$;

-- ─── TABLES ──────────────────────────────────────────────────────────────────

-- 1. profiles ────────────────────────────────────────────────────────────────
-- Extends Supabase auth.users with business-specific profile data.

CREATE TABLE profiles (
  id                UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             TEXT        NOT NULL,
  first_name        TEXT,
  last_name         TEXT,
  phone             TEXT,
  avatar_url        TEXT,
  role              TEXT        NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  metadata          JSONB       DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role  ON profiles(role);

-- 2. categories ───────────────────────────────────────────────────────────────
-- Supports two-level hierarchy: top-level (clothing, jewellery) and subcategories.

CREATE TABLE categories (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id       UUID        REFERENCES categories(id) ON DELETE SET NULL,
  name            TEXT        NOT NULL,
  slug            TEXT        NOT NULL UNIQUE,
  description     TEXT,
  image_url       TEXT,
  sort_order      INT         NOT NULL DEFAULT 0,
  is_active       BOOLEAN     NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_slug       ON categories(slug);
CREATE INDEX idx_categories_parent     ON categories(parent_id);
CREATE INDEX idx_categories_active     ON categories(is_active) WHERE is_active = true;

-- 3. products ─────────────────────────────────────────────────────────────────
-- Core product entity. fabric, material, color, sizes are denormalized for
-- quick querying; variant-specific values live in product_variants.

CREATE TABLE products (
  id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID           NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  name            TEXT           NOT NULL,
  slug            TEXT           NOT NULL UNIQUE,
  description     TEXT,
  price           NUMERIC(10,2)  NOT NULL CHECK (price >= 0),
  compare_price   NUMERIC(10,2)  CHECK (compare_price IS NULL OR compare_price >= 0),
  sku             TEXT           UNIQUE,
  stock           INT            NOT NULL DEFAULT 0 CHECK (stock >= 0),
  badge           TEXT,
  fabric          TEXT,
  material        TEXT,
  color           TEXT           NOT NULL DEFAULT 'Ivory',
  sizes           TEXT[]         DEFAULT '{}',
  size_stock      JSONB          DEFAULT '{}'::jsonb,
  is_active       BOOLEAN        NOT NULL DEFAULT true,
  featured        BOOLEAN        NOT NULL DEFAULT false,
  metadata        JSONB          DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_slug        ON products(slug);
CREATE INDEX idx_products_category    ON products(category_id);
CREATE INDEX idx_products_active      ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_products_featured    ON products(featured) WHERE featured = true;
CREATE INDEX idx_products_created     ON products(created_at DESC);
CREATE INDEX idx_products_price       ON products(price);
CREATE INDEX idx_products_badge       ON products(badge);
-- GIN index for array searches on sizes column
CREATE INDEX idx_products_sizes       ON products USING GIN (sizes);

-- 4. product_images ───────────────────────────────────────────────────────────
-- Supports multiple images per product with explicit ordering.

CREATE TABLE product_images (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url       TEXT        NOT NULL,
  alt_text        TEXT,
  sort_order      INT         NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_order   ON product_images(product_id, sort_order);

-- 5. product_variants ─────────────────────────────────────────────────────────
-- Supports color, size, and jewellery-specific variations.
-- attributes JSONB stores variant-specific data:
--   { "color": "Blush", "size": "M", "size_stock": { "XS": 0, "S": 3, ... } }

CREATE TABLE product_variants (
  id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID           NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name            TEXT           NOT NULL,
  sku             TEXT           UNIQUE,
  price           NUMERIC(10,2)  CHECK (price IS NULL OR price >= 0),
  stock           INT            NOT NULL DEFAULT 0 CHECK (stock >= 0),
  attributes      JSONB          NOT NULL DEFAULT '{}'::jsonb,
  is_active       BOOLEAN        NOT NULL DEFAULT true,
  sort_order      INT            NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_variants_active  ON product_variants(product_id, is_active) WHERE is_active = true;
-- GIN index for JSONB querying (e.g., attributes @> '{"color":"Blush"}')
CREATE INDEX idx_product_variants_attrs   ON product_variants USING GIN (attributes);

-- 6. addresses ────────────────────────────────────────────────────────────────
-- Normalized address storage supporting multiple addresses per user.

CREATE TABLE addresses (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label           TEXT,                          -- "Home", "Work", "Office"
  first_name      TEXT,
  last_name       TEXT,
  phone           TEXT,
  line1           TEXT        NOT NULL,
  line2           TEXT,
  city            TEXT        NOT NULL,
  state           TEXT,
  postal_code     TEXT        NOT NULL,
  country         TEXT        NOT NULL DEFAULT 'United States',
  is_default      BOOLEAN     NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_addresses_user         ON addresses(user_id);
CREATE INDEX idx_addresses_default      ON addresses(user_id, is_default) WHERE is_default = true;

-- 7. orders ───────────────────────────────────────────────────────────────────
-- Shipping and billing addresses are denormalized (snapshotted at order time).

CREATE TABLE orders (
  id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID            NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status          order_status    NOT NULL DEFAULT 'pending',
  subtotal        NUMERIC(10,2)   NOT NULL CHECK (subtotal >= 0),
  shipping_cost   NUMERIC(10,2)   NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
  discount        NUMERIC(10,2)   NOT NULL DEFAULT 0 CHECK (discount >= 0),
  total           NUMERIC(10,2)   NOT NULL CHECK (total >= 0),
  coupon_code     TEXT,
  payment_status  payment_status  NOT NULL DEFAULT 'pending',
  payment_method  TEXT,
  shipping_address JSONB,
  billing_address  JSONB,
  notes           TEXT,
  order_number    TEXT            UNIQUE,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_user        ON orders(user_id);
CREATE INDEX idx_orders_status      ON orders(status);
CREATE INDEX idx_orders_created     ON orders(created_at DESC);
CREATE INDEX idx_orders_payment     ON orders(payment_status);
CREATE INDEX idx_orders_number      ON orders(order_number);

-- 8. order_items ──────────────────────────────────────────────────────────────
-- Snapshots product details at time of purchase (name, price, image).

CREATE TABLE order_items (
  id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID            NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id      UUID            NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id      UUID            REFERENCES product_variants(id) ON DELETE SET NULL,
  name            TEXT            NOT NULL,
  price           NUMERIC(10,2)   NOT NULL CHECK (price >= 0),
  quantity        INT             NOT NULL CHECK (quantity > 0),
  image_url       TEXT,
  attributes      JSONB           DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order     ON order_items(order_id);
CREATE INDEX idx_order_items_product   ON order_items(product_id);

-- 9. cart_items ───────────────────────────────────────────────────────────────
-- Supports both authenticated (user_id) and guest (session_id) carts.

CREATE TABLE cart_items (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id      TEXT,
  product_id      UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id      UUID        REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity        INT         NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT cart_owner_check CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE INDEX idx_cart_items_user    ON cart_items(user_id);
CREATE INDEX idx_cart_items_session ON cart_items(session_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);

-- 10. wishlists ───────────────────────────────────────────────────────────────

CREATE TABLE wishlists (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id      UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlists_user    ON wishlists(user_id);
CREATE INDEX idx_wishlists_product ON wishlists(product_id);

-- 11. coupons ─────────────────────────────────────────────────────────────────

CREATE TABLE coupons (
  id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT            NOT NULL UNIQUE,
  description     TEXT,
  discount_type   discount_type   NOT NULL,
  discount_value  NUMERIC(10,2)   NOT NULL CHECK (discount_value > 0),
  min_order       NUMERIC(10,2)   DEFAULT 0 CHECK (min_order >= 0),
  max_uses        INT             CHECK (max_uses IS NULL OR max_uses > 0),
  used_count      INT             NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  starts_at       TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,
  is_active       BOOLEAN         NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_coupons_code          ON coupons(code);
CREATE INDEX idx_coupons_active        ON coupons(is_active) WHERE is_active = true;
CREATE INDEX idx_coupons_valid_period  ON coupons(starts_at, expires_at) WHERE is_active = true;

-- 12. blogs ───────────────────────────────────────────────────────────────────

CREATE TABLE blogs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT        NOT NULL,
  slug            TEXT        NOT NULL UNIQUE,
  excerpt         TEXT,
  content         TEXT,
  cover_image     TEXT,
  category        TEXT,
  author_id       UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  tags            TEXT[]      DEFAULT '{}',
  seo_title       TEXT,
  seo_description TEXT,
  published_at    TIMESTAMPTZ,
  is_published    BOOLEAN     NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_blogs_slug        ON blogs(slug);
CREATE INDEX idx_blogs_published   ON blogs(published_at DESC) WHERE is_published = true;
CREATE INDEX idx_blogs_author      ON blogs(author_id);
CREATE INDEX idx_blogs_category    ON blogs(category);
CREATE INDEX idx_blogs_tags        ON blogs USING GIN (tags);

-- 13. testimonials ────────────────────────────────────────────────────────────

CREATE TABLE testimonials (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,
  role            TEXT,
  avatar_url      TEXT,
  content         TEXT        NOT NULL,
  rating          INT         CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  sort_order      INT         NOT NULL DEFAULT 0,
  is_active       BOOLEAN     NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_testimonials_active ON testimonials(is_active, sort_order);

-- 14. faqs ────────────────────────────────────────────────────────────────────

CREATE TABLE faqs (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  question        TEXT        NOT NULL,
  answer          TEXT        NOT NULL,
  category        TEXT,
  sort_order      INT         NOT NULL DEFAULT 0,
  is_active       BOOLEAN     NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_faqs_active ON faqs(is_active, sort_order);

-- 15. contact_messages ────────────────────────────────────────────────────────

CREATE TABLE contact_messages (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,
  email           TEXT        NOT NULL,
  phone           TEXT,
  subject         TEXT,
  message         TEXT        NOT NULL,
  is_read         BOOLEAN     NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contact_messages_read    ON contact_messages(is_read);
CREATE INDEX idx_contact_messages_created ON contact_messages(created_at DESC);

-- 16. newsletters ─────────────────────────────────────────────────────────────

CREATE TABLE newsletters (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT        NOT NULL UNIQUE,
  is_active       BOOLEAN     NOT NULL DEFAULT true,
  source          TEXT,
  metadata        JSONB       DEFAULT '{}'::jsonb,
  subscribed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ
);

CREATE INDEX idx_newsletter_email   ON newsletters(email);
CREATE INDEX idx_newsletter_active  ON newsletters(is_active) WHERE is_active = true;

-- 17. inventory_logs ──────────────────────────────────────────────────────────
-- Audit trail for all stock movements. Insert-only (no updates or deletes).

CREATE TABLE inventory_logs (
  id              UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID                 REFERENCES products(id) ON DELETE CASCADE,
  variant_id      UUID                 REFERENCES product_variants(id) ON DELETE CASCADE,
  change_type     inventory_change_type NOT NULL,
  quantity_change INT                  NOT NULL,   -- positive = restock, negative = sale
  quantity_after  INT                  NOT NULL,
  reference_id    TEXT,                            -- order_id or external reference
  notes           TEXT,
  created_by      UUID                 REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ          NOT NULL DEFAULT now()
);

CREATE INDEX idx_inventory_logs_product   ON inventory_logs(product_id);
CREATE INDEX idx_inventory_logs_variant   ON inventory_logs(variant_id);
CREATE INDEX idx_inventory_logs_type      ON inventory_logs(change_type);
CREATE INDEX idx_inventory_logs_created   ON inventory_logs(created_at DESC);
CREATE INDEX idx_inventory_logs_reference ON inventory_logs(reference_id);

-- 18. admin_roles ─────────────────────────────────────────────────────────────
-- Granular role assignments for staff. Only users with an entry here
-- (with role = 'admin') can manage other admin_roles.

CREATE TABLE admin_roles (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT        NOT NULL CHECK (role IN ('admin', 'manager', 'editor')),
  granted_by      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX idx_admin_roles_user  ON admin_roles(user_id);
CREATE INDEX idx_admin_roles_role  ON admin_roles(role);

-- 19. website_settings ────────────────────────────────────────────────────────

CREATE TABLE website_settings (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  key             TEXT        NOT NULL UNIQUE,
  value           JSONB       NOT NULL DEFAULT '{}'::jsonb,
  group_name      TEXT,
  type            TEXT        DEFAULT 'text',
  description     TEXT,
  is_public       BOOLEAN     NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_settings_key    ON website_settings(key);
CREATE INDEX idx_settings_group  ON website_settings(group_name);
CREATE INDEX idx_settings_public ON website_settings(is_public) WHERE is_public = true;

-- 20. notifications ───────────────────────────────────────────────────────────

CREATE TABLE notifications (
  id              UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID              NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type            notification_type NOT NULL DEFAULT 'system',
  title           TEXT              NOT NULL,
  message         TEXT,
  data            JSONB             DEFAULT '{}'::jsonb,
  is_read         BOOLEAN           NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ       NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user    ON notifications(user_id);
CREATE INDEX idx_notifications_unread  ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ─── UPDATED_AT TRIGGERS ─────────────────────────────────────────────────────
-- Applied to all tables with an updated_at column.

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_product_variants_updated_at
  BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_addresses_updated_at
  BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_cart_items_updated_at
  BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_blogs_updated_at
  BEFORE UPDATE ON blogs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_faqs_updated_at
  BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_website_settings_updated_at
  BEFORE UPDATE ON website_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── REALTIME ────────────────────────────────────────────────────────────────
-- Enable realtime for tables that benefit from live updates.

ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE cart_items;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE inventory_logs;

-- ============================================================================
-- End of migration 001
-- ============================================================================
