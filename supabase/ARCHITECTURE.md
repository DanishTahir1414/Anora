# ANORA — Supabase Architecture Notes

## Overview

This document describes the production Supabase schema for the ANORA ecommerce platform. It covers the migration files, table design decisions, inventory architecture, RLS strategy, storage setup, and frontend integration plan.

---

## Migration Files

| File | Purpose |
|---|---|
| `001_schema.sql` | Enums, tables, constraints, indexes, triggers, helper functions, realtime |
| `002_rls.sql` | RLS helper functions, row-level security policies on all tables |
| `003_storage.sql` | Storage bucket creation and storage-level RLS policies |
| `zod-schemas.ts` | Zod validation schemas mirroring all DB tables for runtime validation |

**Order of execution:** 1 → 2 → 3 (all must run in sequence)

---

## Inventory Architecture (Overselling Prevention)

### Problem

In a concurrent ecommerce system, two users can attempt to purchase the last item simultaneously. Without safeguards, both get a success response but only one actually receives the item.

### Solution: Three-Layer Defense

#### Layer 1 — Database Constraints

```sql
CHECK (stock >= 0)
```

Applied on both `products.stock` and `product_variants.stock`. This is the last line of defense — any attempt to go below zero is rejected at the database level.

#### Layer 2 — Row-Level Locking via `decrement_stock()`

The `decrement_stock()` function uses `SELECT ... FOR UPDATE` which acquires a row-level lock. While one transaction holds this lock, all other transactions must wait. This prevents race conditions:

```sql
SELECT stock INTO v_current_stock
FROM products WHERE id = p_product_id
FOR UPDATE;  -- blocks other concurrent purchases
```

This is the primary mechanism for preventing overselling. The function:
1. Acquires an exclusive lock on the product/variant row
2. Checks if sufficient stock exists
3. Decrements atomically
4. Logs to `inventory_logs`
5. Returns success/failure as a boolean

**Usage pattern in application code:**

```typescript
const { data, error } = await supabase.rpc('decrement_stock', {
  p_product_id: productId,
  p_quantity: quantity,
  p_variant_id: variantId, // null for non-variant products
  p_reference: orderId,    // link to the order
});
```

#### Layer 3 — Inventory Audit Trail

Every stock mutation is recorded in `inventory_logs` with:
- `change_type`: order, restock, adjustment, return, cancellation
- `quantity_change`: positive (restock) or negative (sale)
- `quantity_after`: resulting stock after mutation
- `reference_id`: links to order or external reference
- `created_by`: the user who triggered the change

This provides full traceability for all stock movements.

### Cart Reservation Strategy

**Recommended approach:** Do NOT decrement stock on "Add to Cart". Instead:
1. Decrement stock only on **successful order placement** (inside the checkout transaction)
2. Use temporary cart-level stock holds only for time-limited checkout sessions (e.g., 15-minute reservation via application logic)
3. Validate stock availability at checkout time before charging payment

---

## RLS Design

### Role Hierarchy

```
anonymous (no auth)
  └── authenticated (any signed-in user)
        └── staff (has entry in admin_roles)
              ├── editor   (blogs, FAQs, content)
              ├── manager  (products, orders, coupons, content)
              └── admin    (everything including user management)
```

### Helper Functions

| Function | Purpose |
|---|---|
| `has_admin_role(required TEXT)` | Checks if current user has the specified admin role (or any if NULL) |
| `is_admin()` | Shortcut for `has_admin_role('admin')` |
| `is_staff()` | Shortcut for any entry in `admin_roles` (admin/manager/editor) |
| `owns_profile(profile_id UUID)` | Checks if current user owns the profile or is staff |

### Policy Summary by Table

| Table | Public Read | Auth Insert | Auth Update | Auth Delete | Staff Access |
|---|---|---|---|---|---|
| `profiles` | No | Own | Own (not role) | No | Full |
| `categories` | Active only | No | No | No | Full |
| `products` | Active only | No | No | No | Full |
| `product_images` | Yes | No | No | No | Full |
| `product_variants` | Active only | No | No | No | Full |
| `addresses` | No | Own | Own | Own | Full |
| `orders` | No | Own | Own (pending) | No | Full |
| `order_items` | Joiner | Via order | No | No | Full |
| `cart_items` | Own | Own/session | Own | Own | Full |
| `wishlists` | No | Own | No | Own | Full |
| `coupons` | Active valid | No | No | No | Full |
| `blogs` | Published | Editor+ | Editor+ | Editor+ | Full |
| `testimonials` | Active | No | No | No | Full |
| `faqs` | Active | Editor+ | Editor+ | Editor+ | Full |
| `contact_messages` | No | Anyone (insert) | No | No | Full |
| `newsletters` | By email | Anyone (insert) | No | No | Full |
| `inventory_logs` | No | Staff only | No | No | Full |
| `admin_roles` | No | Admin | Admin | Admin | Admin only |
| `website_settings` | Public | No | No | No | Full |
| `notifications` | Own | Staff | Own (read) | No | Full |

---

## Category Design

The `categories` table supports a two-level hierarchy:

```
clothing                 (parent_id = NULL, level = top)
  └── Unstitched         (parent_id = clothing.id)
  └── Pret               (parent_id = clothing.id)
  └── Luxury Pret        (parent_id = clothing.id)

jewellery                (parent_id = NULL, level = top)
  └── Rings              (parent_id = jewellery.id)
  └── Earrings           (parent_id = jewellery.id)
```

To query products by a top-level category (including subcategories):

```sql
SELECT p.* FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.id = 'top-level-uuid'
   OR c.parent_id = 'top-level-uuid';
```

---

## Product Data Mapping: Frontend → Database

The current frontend `Product` interface maps to the database as follows:

| Frontend Field | DB Location | Notes |
|---|---|---|
| `id` | `products.id` | UUID |
| `slug` | `products.slug` | UNIQUE |
| `name` | `products.name` | |
| `price` | `products.price` | |
| `category` | `categories` table | Join via `products.category_id` |
| `subcategory` | `categories` table | Subcategories are child rows |
| `description` | `products.description` | |
| `fabric` | `products.fabric` | Denormalized for queryability |
| `material` | `products.material` | Denormalized for queryability |
| `color` | `products.color` | Default color |
| `sizes` | `products.sizes` | TEXT[] array |
| `sku` | `products.sku` | UNIQUE |
| `stock` | `products.stock` | Total stock count |
| `sizeStock` | `products.size_stock` | JSONB: `{ "XS": 0, "S": 3 }` |
| `images` | `product_images` table | Ordered by `sort_order` |
| `badge` | `products.badge` | "New", "Best Seller", etc. |
| `colorVariants` | `product_variants` table | Each variant = one color; `attributes` JSONB stores color, images, sizes |

---

## Order Number Generation

Use a dedicated sequence for human-readable order numbers:

```sql
CREATE SEQUENCE order_number_seq START 10000;

-- In application code (or trigger):
-- 'ANR-' || nextval('order_number_seq') => 'ANR-10001'
```

---

## Index Strategy

### High-Cardinality Columns (index always beneficial)
- All foreign keys (`category_id`, `user_id`, `product_id`, `order_id`)
- All slug columns (unique lookups)
- `created_at` (sorted queries)
- Email columns

### Low-Cardinality Filters (partial indexes)
- `WHERE is_active = true` on products, categories, variants, coupons, testimonials, faqs
- `WHERE is_published = true` on blogs
- `WHERE featured = true` on products

### JSONB & Array Indexes
- GIN index on `product_variants.attributes` (for JSONB querying)
- GIN index on `products.sizes` (for array contain operations)
- GIN index on `blogs.tags` (for array contain operations)

### Composite Indexes
- `(product_id, sort_order)` on product_images and product_variants
- `(user_id, is_default) WHERE is_default = true` on addresses
- `(user_id, is_read) WHERE is_read = false` on notifications
- `(starts_at, expires_at) WHERE is_active = true` on coupons

---

## Realtime Tables

The following tables are added to the `supabase_realtime` publication:

| Table | Use Case |
|---|---|
| `orders` | Staff dashboard live updates |
| `order_items` | Order detail live updates |
| `cart_items` | Cross-device cart sync |
| `notifications` | Live notification delivery |
| `products` | Product availability updates |
| `inventory_logs` | Monitoring/inventory dashboards |

---

## Updating `profiles.role` vs `admin_roles`

- `profiles.role` is a **quick gate** with only two values: `customer` or `admin`
- `admin_roles` provides **granular** access: `admin`, `manager`, `editor`
- The `is_admin()` function checks `admin_roles.role = 'admin'`
- The `is_staff()` function checks for any entry in `admin_roles`

When promoting a user to staff, they should get:
1. An entry in `admin_roles` with their role
2. (Optional) Their `profiles.role` set to `admin` for quick checks

---

## Storage Conventions

### File Path Patterns
```
product-images/{product_id}/{uuid}.{ext}
blog-images/{blog_id}/{uuid}.{ext}
banners/{slug}-{uuid}.{ext}
avatars/{user_id}/{uuid}.{ext}
```

### Recommended Upload Flow

1. Client uploads directly to Supabase Storage using the client SDK
2. For product images: staff uploads to `product-images/{product_id}/`
3. After upload succeeds, store the public URL in `product_images.image_url`
4. For avatars: authenticated user uploads to `avatars/{user_id}/`

### Image Optimization

- Format: WebP or AVIF (significantly smaller than JPEG/PNG)
- Product images: 1200×1600px (3:4 aspect ratio)
- Blog cover: 1600×900px (16:9 aspect ratio)
- Banners: 1920×800px
- Avatars: 400×400px (1:1 square)
- Use Supabase Image Transformation API for dynamic resizing:
  `https://<project>.supabase.co/storage/v1/render/image/public/<bucket>/<path>?width=400&height=600&resize=contain`

---

## Migration Checklist

- [ ] Enable Storage in Supabase dashboard
- [ ] Run `001_schema.sql` (all tables, enums, functions)
- [ ] Run `002_rls.sql` (helper functions, RLS policies)
- [ ] Run `003_storage.sql` (storage buckets, storage policies)
- [ ] Verify RLS by testing with anon/anonymous key
- [ ] Insert seed data for categories and admin user
- [ ] Generate TypeScript types: `supabase gen types typescript --linked > src/lib/database.types.ts`

---

## Seed Data Template

```sql
-- Top-level categories
INSERT INTO categories (name, slug, sort_order) VALUES
  ('Clothing',  'clothing',  1),
  ('Jewellery', 'jewellery', 2);

-- Subcategories
INSERT INTO categories (name, slug, parent_id, sort_order) VALUES
  ('Unstitched',   'unstitched',    (SELECT id FROM categories WHERE slug = 'clothing'),  1),
  ('Pret',         'pret',          (SELECT id FROM categories WHERE slug = 'clothing'),  2),
  ('Luxury Pret',  'luxury-pret',   (SELECT id FROM categories WHERE slug = 'clothing'),  3),
  ('Formal Wear',  'formal-wear',   (SELECT id FROM categories WHERE slug = 'clothing'),  4),
  ('Casual Wear',  'casual-wear',   (SELECT id FROM categories WHERE slug = 'clothing'),  5),
  ('Rings',        'rings',         (SELECT id FROM categories WHERE slug = 'jewellery'), 1),
  ('Earrings',     'earrings',      (SELECT id FROM categories WHERE slug = 'jewellery'), 2),
  ('Bracelets',    'bracelets',     (SELECT id FROM categories WHERE slug = 'jewellery'), 3),
  ('Necklaces',    'necklaces',     (SELECT id FROM categories WHERE slug = 'jewellery'), 4);

-- Promotional banners (reference for storage)
INSERT INTO website_settings (key, value, group_name, type, is_public) VALUES
  ('announcement_bar', '{"text": "Complimentary Express Shipping Worldwide"}', 'appearance', 'json', true);
```

---

## TypeScript Generation

After migrations are applied, generate database types:

```bash
npx supabase gen types typescript --linked > src/lib/database.types.ts
```

This generates types for all tables, enums, and functions. Use these types with the Supabase client:

```typescript
import { supabase } from './supabase';
import type { Database } from './database.types';

// Fully typed query
const { data } = await supabase
  .from('products')
  .select('id, name, price, category:categories(name)')
  .eq('is_active', true);
```
