// ============================================================================
// ANORA — Zod Validation Schemas
// ============================================================================
// Place in src/lib/schemas.ts after moving to application code.
// These mirror the database schema for runtime validation on API boundaries.
// ============================================================================

import { z } from "zod";

// ─── ENUMS ───────────────────────────────────────────────────────────────────

export const OrderStatus = z.enum([
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

export const PaymentStatus = z.enum(["pending", "completed", "failed", "refunded"]);

export const DiscountType = z.enum(["percentage", "fixed"]);

export const NotificationType = z.enum(["order_update", "promo", "newsletter", "system"]);

export const InventoryChangeType = z.enum([
  "order",
  "restock",
  "adjustment",
  "return",
  "cancellation",
]);

// ─── PROFILES ────────────────────────────────────────────────────────────────

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  phone: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
  role: z.enum(["customer", "admin"]),
  metadata: z.record(z.unknown()).nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const ProfileUpdateSchema = ProfileSchema.pick({
  first_name: true,
  last_name: true,
  phone: true,
  avatar_url: true,
  metadata: true,
}).partial();

// ─── CATEGORIES ──────────────────────────────────────────────────────────────

export const CategorySchema = z.object({
  id: z.string().uuid(),
  parent_id: z.string().uuid().nullable(),
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().nullable(),
  image_url: z.string().url().nullable(),
  sort_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export const CategoryCreateSchema = CategorySchema.omit({ id: true });

// ─── PRODUCTS ────────────────────────────────────────────────────────────────

const numericDecimal = z.string().or(z.number()).pipe(z.coerce.number().min(0));

export const ProductSchema = z.object({
  id: z.string().uuid(),
  category_id: z.string().uuid(),
  name: z.string().min(1, "Product name is required"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().nullable(),
  price: numericDecimal,
  compare_price: numericDecimal.nullable(),
  sku: z.string().nullable(),
  stock: z.number().int().min(0).default(0),
  badge: z.string().nullable(),
  fabric: z.string().nullable(),
  material: z.string().nullable(),
  color: z.string().default("Ivory"),
  sizes: z.array(z.string()).default([]),
  size_stock: z.record(z.number().int().min(0)).nullable(),
  is_active: z.boolean().default(true),
  featured: z.boolean().default(false),
  metadata: z.record(z.unknown()).nullable(),
});

export const ProductCreateSchema = ProductSchema.omit({ id: true });

export const ProductUpdateSchema = ProductCreateSchema.partial();

// ─── PRODUCT IMAGES ──────────────────────────────────────────────────────────

export const ProductImageSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  image_url: z.string().url(),
  alt_text: z.string().nullable(),
  sort_order: z.number().int().min(0).default(0),
});

export const ProductImageCreateSchema = ProductImageSchema.omit({ id: true });

// ─── PRODUCT VARIANTS ────────────────────────────────────────────────────────

export const ProductVariantSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  name: z.string().min(1),
  sku: z.string().nullable(),
  price: numericDecimal.nullable(),
  stock: z.number().int().min(0).default(0),
  attributes: z.record(z.unknown()).default({}),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
});

export const ProductVariantCreateSchema = ProductVariantSchema.omit({ id: true });

// ─── ADDRESSES ───────────────────────────────────────────────────────────────

export const AddressSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  label: z.string().nullable(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  phone: z.string().nullable(),
  line1: z.string().min(1, "Street address is required"),
  line2: z.string().nullable(),
  city: z.string().min(1, "City is required"),
  state: z.string().nullable(),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().default("United States"),
  is_default: z.boolean().default(false),
});

export const AddressCreateSchema = AddressSchema.omit({ id: true, user_id: true });
export const AddressUpdateSchema = AddressCreateSchema.partial();

// ─── ORDERS ──────────────────────────────────────────────────────────────────

export const OrderSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  status: OrderStatus.default("pending"),
  subtotal: numericDecimal,
  shipping_cost: numericDecimal.default("0"),
  discount: numericDecimal.default("0"),
  total: numericDecimal,
  coupon_code: z.string().nullable(),
  payment_status: PaymentStatus.default("pending"),
  payment_method: z.string().nullable(),
  shipping_address: z.record(z.unknown()).nullable(),
  billing_address: z.record(z.unknown()).nullable(),
  notes: z.string().nullable(),
  order_number: z.string().nullable(),
});

export const OrderCreateSchema = OrderSchema.omit({
  id: true,
  user_id: true,
  status: true,
  payment_status: true,
  order_number: true,
});

// ─── ORDER ITEMS ─────────────────────────────────────────────────────────────

export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().nullable(),
  name: z.string().min(1),
  price: numericDecimal,
  quantity: z.number().int().min(1),
  image_url: z.string().url().nullable(),
  attributes: z.record(z.unknown()).nullable(),
});

export const OrderItemCreateSchema = OrderItemSchema.omit({ id: true, order_id: true });

// ─── CART ITEMS ──────────────────────────────────────────────────────────────

export const CartItemSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  session_id: z.string().nullable(),
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().nullable(),
  size: z.string().default(""),
  quantity: z.number().int().min(1).default(1),
});

export const CartItemCreateSchema = CartItemSchema.omit({
  id: true,
  user_id: true,
});

// ─── WISHLISTS ───────────────────────────────────────────────────────────────

export const WishlistSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  product_id: z.string().uuid(),
});

export const WishlistCreateSchema = WishlistSchema.omit({ id: true, user_id: true });

// ─── COUPONS ─────────────────────────────────────────────────────────────────

export const CouponSchema = z.object({
  id: z.string().uuid(),
  code: z.string().min(1).toUpperCase(),
  description: z.string().nullable(),
  discount_type: DiscountType,
  discount_value: numericDecimal,
  min_order: numericDecimal.default("0"),
  max_uses: z.number().int().positive().nullable(),
  used_count: z.number().int().min(0).default(0),
  starts_at: z.string().datetime().nullable(),
  expires_at: z.string().datetime().nullable(),
  is_active: z.boolean().default(true),
});

export const CouponCreateSchema = CouponSchema.omit({ id: true, used_count: true });

// ─── BLOGS ───────────────────────────────────────────────────────────────────

export const BlogSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  excerpt: z.string().nullable(),
  content: z.string().nullable(),
  cover_image: z.string().url().nullable(),
  category: z.string().nullable(),
  author_id: z.string().uuid().nullable(),
  tags: z.array(z.string()).default([]),
  seo_title: z.string().nullable(),
  seo_description: z.string().nullable(),
  published_at: z.string().datetime().nullable(),
  is_published: z.boolean().default(false),
});

export const BlogCreateSchema = BlogSchema.omit({ id: true });
export const BlogUpdateSchema = BlogCreateSchema.partial();

// ─── TESTIMONIALS ────────────────────────────────────────────────────────────

export const TestimonialSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  role: z.string().nullable(),
  avatar_url: z.string().url().nullable(),
  content: z.string().min(1),
  rating: z.number().int().min(1).max(5).nullable(),
  sort_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export const TestimonialCreateSchema = TestimonialSchema.omit({ id: true });

// ─── FAQS ────────────────────────────────────────────────────────────────────

export const FaqSchema = z.object({
  id: z.string().uuid(),
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().nullable(),
  sort_order: z.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export const FaqCreateSchema = FaqSchema.omit({ id: true });

// ─── CONTACT MESSAGES ────────────────────────────────────────────────────────

export const ContactMessageSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().nullable(),
  subject: z.string().nullable(),
  message: z.string().min(1, "Message is required"),
  is_read: z.boolean().default(false),
});

export const ContactMessageCreateSchema = ContactMessageSchema.omit({
  id: true,
  is_read: true,
});

// ─── NEWSLETTERS ─────────────────────────────────────────────────────────────

export const NewsletterSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  is_active: z.boolean().default(true),
  source: z.string().nullable(),
  metadata: z.record(z.unknown()).nullable(),
});

export const NewsletterCreateSchema = NewsletterSchema.omit({
  id: true,
  is_active: true,
  metadata: true,
});

// ─── INVENTORY LOGS ──────────────────────────────────────────────────────────

export const InventoryLogSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().nullable(),
  change_type: InventoryChangeType,
  quantity_change: z.number().int(),
  quantity_after: z.number().int().min(0),
  reference_id: z.string().nullable(),
  notes: z.string().nullable(),
  created_by: z.string().uuid().nullable(),
});

// ─── ADMIN ROLES ─────────────────────────────────────────────────────────────

export const AdminRoleSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum(["admin", "manager", "editor"]),
  granted_by: z.string().uuid().nullable(),
});

export const AdminRoleCreateSchema = AdminRoleSchema.omit({ id: true, granted_by: true });

// ─── CHECKOUT (composite, for order creation) ────────────────────────────────

export const CheckoutItemSchema = z.object({
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().nullable(),
  quantity: z.number().int().min(1),
});

export const CheckoutSchema = z.object({
  items: z.array(CheckoutItemSchema).min(1, "Cart is empty"),
  shipping_address: z.record(z.unknown()),
  billing_address: z.record(z.unknown()).optional(),
  coupon_code: z.string().optional(),
  notes: z.string().optional(),
  payment_method: z.string().min(1),
});

// ─── AUTH FORMS ──────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

export const RegisterSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Valid email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Valid email is required"),
});

// ─── NEWSLETTER SUBSCRIPTION ─────────────────────────────────────────────────

export const NewsletterSubscribeSchema = z.object({
  email: z.string().email("Valid email is required"),
});

// ─── SUPABASE TYPE HELPER ────────────────────────────────────────────────────
// Generates TypeScript types from your Supabase schema:
//   npx supabase gen types typescript --linked > src/lib/database.types.ts
// ============================================================================
