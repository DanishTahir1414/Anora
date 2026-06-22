import { products } from "@/lib/products";
import { validateStockBeforeCheckout, type CheckoutLine } from "@/lib/inventory";
import { supabaseAdmin } from "./supabase-admin";

export interface ValidatedLineItem {
  productId: string;
  variantId: string | null;
  size: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  maxAvailable: number;
  subtotal: number;
}

export interface CartValidationResult {
  ok: boolean;
  error?: string;
  items: ValidatedLineItem[];
  subtotal: number;
  total: number;
}

export function validateCartItems(
  input: Array<{
    productId: string;
    variantId?: string | null;
    size?: string;
    quantity: number;
  }>,
): CartValidationResult {
  if (!Array.isArray(input) || input.length === 0) {
    return { ok: false, error: "Cart is empty", items: [], subtotal: 0, total: 0 };
  }

  const validated: ValidatedLineItem[] = [];

  for (const item of input) {
    if (!item.productId || item.quantity < 1) {
      return { ok: false, error: "Invalid cart item", items: [], subtotal: 0, total: 0 };
    }

    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      return { ok: false, error: `Unknown product: ${item.productId}`, items: [], subtotal: 0, total: 0 };
    }

    const line: CheckoutLine = {
      productId: item.productId,
      variantId: item.variantId ?? undefined,
      size: item.size ?? "",
      quantity: item.quantity,
    };

    const validation = validateStockBeforeCheckout(product, line);
    if (!validation.ok) {
      return {
        ok: false,
        error: validation.reason ?? `Item unavailable: ${product.name}`,
        items: [],
        subtotal: 0,
        total: 0,
      };
    }

    validated.push({
      productId: item.productId,
      variantId: item.variantId ?? null,
      size: item.size ?? "",
      productName: product.name,
      unitPrice: product.price,
      quantity: item.quantity,
      maxAvailable: validation.availableQuantity,
      subtotal: product.price * item.quantity,
    });
  }

  const subtotal = validated.reduce((sum, item) => sum + item.subtotal, 0);
  return {
    ok: true,
    items: validated,
    subtotal,
    total: subtotal,
  };
}

export interface CouponValidationResult {
  ok: boolean;
  error?: string;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
}

export async function validateCoupon(
  code: string,
  subtotal?: number,
): Promise<CouponValidationResult> {
  if (!code) return { ok: false, error: "No coupon code provided" };

  const { data, error } = await supabaseAdmin
    .from("coupons")
    .select("discount_type, discount_value, min_order, max_uses, used_count, starts_at, expires_at")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return { ok: false, error: "Invalid coupon code" };
  }

  const now = new Date();

  if (data.starts_at && new Date(data.starts_at) > now) {
    return { ok: false, error: "Coupon is not yet active" };
  }

  if (data.expires_at && new Date(data.expires_at) < now) {
    return { ok: false, error: "Coupon has expired" };
  }

  if (data.max_uses && data.used_count >= data.max_uses) {
    return { ok: false, error: "Coupon usage limit has been reached" };
  }

  if (subtotal !== undefined && data.min_order && subtotal < Number(data.min_order)) {
    return {
      ok: false,
      error: `Minimum order of $${Number(data.min_order).toFixed(2)} required`,
    };
  }

  return {
    ok: true,
    discountType: data.discount_type as "percentage" | "fixed",
    discountValue: Number(data.discount_value),
  };
}
