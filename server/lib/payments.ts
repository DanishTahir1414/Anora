import crypto from "node:crypto";
import { products } from "@/lib/products";
import { validateStockBeforeCheckout, type CheckoutLine } from "@/lib/inventory";
import { validateCartItems } from "./cart-validation";
import { supabaseAdmin } from "./supabase-admin";

export interface CheckoutItemInput {
  productId: string;
  variantId?: string | null;
  size?: string;
  quantity: number;
}

export interface CheckoutAddress {
  firstName?: string;
  lastName?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

export interface CreateCheckoutSessionInput {
  userId: string;
  email: string;
  items: CheckoutItemInput[];
  shippingAddress?: CheckoutAddress;
  billingAddress?: CheckoutAddress;
  successUrl: string;
  cancelUrl: string;
  checkoutSessionToken?: string;
}

export interface CheckoutSessionResult {
  orderId: string;
  orderNumber: string;
  checkoutUrl: string;
}

export interface WebhookResult {
  ok: boolean;
  processed: boolean;
  message: string;
}

interface StripeSessionResponse {
  id: string;
  url: string | null;
  payment_intent: string | null;
}

function readEnv(name: string) {
  if (typeof process !== "undefined" && process.env?.[name]) {
    return process.env[name];
  }
  if (typeof import.meta !== "undefined" && import.meta.env?.[name]) {
    return import.meta.env[name];
  }
  return "";
}

function clampMoney(value: number) {
  return Number(Math.max(0, value).toFixed(2));
}

function buildOrderNumber() {
  return `ANR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function getProduct(productId: string) {
  return products.find((product) => product.id === productId);
}

function getUnitPrice(productId: string) {
  const product = getProduct(productId);
  if (!product) throw new Error(`Unknown product: ${productId}`);
  return product.price;
}

function readStripeConfig() {
  const secretKey = readEnv("STRIPE_SECRET_KEY");
  const webhookSecret = readEnv("STRIPE_WEBHOOK_SECRET");
  const publicUrl = readEnv("PUBLIC_APP_URL") || "http://localhost:5173";

  if (!secretKey) {
    throw new Error("Stripe secret key is not configured");
  }

  return { secretKey, webhookSecret, publicUrl };
}

async function stripeRequest(
  path: string,
  init: {
    method?: "POST" | "GET";
    body?: URLSearchParams;
  } = {},
) {
  const { secretKey } = readStripeConfig();
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: init.method ?? "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: init.body,
  });

  const payload = (await response.json()) as Record<string, unknown>;
  if (!response.ok) {
    const message =
      typeof payload.error === "object" && payload.error !== null && "message" in payload.error
        ? String((payload.error as { message?: string }).message ?? "Stripe request failed")
        : "Stripe request failed";
    throw new Error(message);
  }
  return payload;
}

function buildLineItems(items: CheckoutItemInput[]) {
  return items.map((item) => {
    const product = getProduct(item.productId);
    if (!product) {
      throw new Error(`Unknown product: ${item.productId}`);
    }

    const line: CheckoutLine = {
      productId: item.productId,
      variantId: item.variantId ?? undefined,
      size: item.size ?? "",
      quantity: item.quantity,
    };
    const validation = validateStockBeforeCheckout(product, line);
    if (!validation.ok) {
      throw new Error(validation.reason ?? "Item is unavailable");
    }

    return {
      product,
      quantity: item.quantity,
      size: item.size ?? "",
      variantId: item.variantId ?? null,
      unitAmount: Math.round(getUnitPrice(item.productId) * 100),
    };
  });
}

async function createPendingOrder(input: CreateCheckoutSessionInput) {
  // Server-calculated totals — NEVER trust client prices
  const validated = validateCartItems(input.items);
  if (!validated.ok) {
    throw new Error(validated.error ?? "Cart validation failed");
  }

  const lineItems = buildLineItems(input.items);
  const shippingCost = 0;
  const total = clampMoney(validated.subtotal + shippingCost);
  const orderNumber = buildOrderNumber();

  const cartSnapshot = JSON.stringify(validated.items);

  const insertFields: Record<string, unknown> = {
    user_id: input.userId,
    status: "pending",
    subtotal: validated.subtotal,
    shipping_cost: shippingCost,
    discount: 0,
    total,
    coupon_code: null,
    payment_status: "pending",
    payment_method: "stripe",
    shipping_address: input.shippingAddress ?? null,
    billing_address: input.billingAddress ?? null,
    notes: "Stripe Checkout pending confirmation",
    order_number: orderNumber,
    payment_provider: "stripe",
    cart_snapshot: cartSnapshot,
    checkout_started_at: new Date().toISOString(),
  };

  if (input.checkoutSessionToken) {
    insertFields.checkout_session_token = input.checkoutSessionToken;
  }

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert(insertFields)
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message ?? "Unable to create order draft");
  }

  const { error: itemsError } = await supabaseAdmin.from("order_items").insert(
    lineItems.map((line) => ({
      order_id: order.id,
      product_id: line.product.id,
      variant_id: line.variantId,
      name: line.product.name,
      price: Number(line.unitAmount) / 100,
      quantity: line.quantity,
      image_url: line.product.images[0] ?? null,
      attributes: {
        size: line.size,
        color: line.product.color,
        sku: line.product.sku,
      },
    })),
  );

  if (itemsError) {
    await supabaseAdmin.from("orders").delete().eq("id", order.id);
    throw new Error(itemsError.message);
  }

  return { order, subtotal: validated.subtotal, total, lineItems };
}

export async function createStripeCheckoutSession(
  input: CreateCheckoutSessionInput,
): Promise<CheckoutSessionResult> {
  const { publicUrl } = readStripeConfig();
  const draft = await createPendingOrder(input);

  const sessionParams = new URLSearchParams();
  sessionParams.set("mode", "payment");
  sessionParams.set("success_url", input.successUrl || `${publicUrl}/checkout?success=1`);
  sessionParams.set("cancel_url", input.cancelUrl || `${publicUrl}/checkout?canceled=1`);
  sessionParams.set("customer_email", input.email);
  sessionParams.set("client_reference_id", draft.order.order_number);
  sessionParams.set("metadata[order_id]", draft.order.id);
  sessionParams.set("metadata[order_number]", draft.order.order_number);
  sessionParams.set("shipping_address_collection[allowed_countries][]", "US");

  draft.lineItems.forEach((line, index) => {
    sessionParams.set(`line_items[${index}][quantity]`, String(line.quantity));
    sessionParams.set(`line_items[${index}][price_data][currency]`, "usd");
    sessionParams.set(`line_items[${index}][price_data][unit_amount]`, String(line.unitAmount));
    sessionParams.set(`line_items[${index}][price_data][product_data][name]`, line.product.name);
    sessionParams.set(
      `line_items[${index}][price_data][product_data][description]`,
      line.product.description.slice(0, 200),
    );
    sessionParams.set(
      `line_items[${index}][price_data][product_data][metadata][product_id]`,
      line.product.id,
    );
    sessionParams.set(`line_items[${index}][price_data][product_data][metadata][size]`, line.size);
    if (line.variantId) {
      sessionParams.set(
        `line_items[${index}][price_data][product_data][metadata][variant_id]`,
        line.variantId,
      );
    }
  });

  const stripeSession = (await stripeRequest("checkout/sessions", {
    method: "POST",
    body: sessionParams,
  })) as StripeSessionResponse;

  if (!stripeSession.id || !stripeSession.url) {
    throw new Error("Stripe session creation failed");
  }

  const { error: updateError } = await supabaseAdmin
    .from("orders")
    .update({
      stripe_session_id: stripeSession.id,
      stripe_payment_intent_id: stripeSession.payment_intent ?? null,
    })
    .eq("id", draft.order.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return {
    orderId: draft.order.id,
    orderNumber: draft.order.order_number,
    checkoutUrl: stripeSession.url,
  };
}

function hmacSha256(value: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(value, "utf8").digest("hex");
}

export function verifyStripeWebhookSignature(payload: string, signatureHeader: string | null) {
  const { webhookSecret } = readStripeConfig();
  if (!webhookSecret || !signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    }),
  );

  const timestamp = parts.t;
  const receivedSignature = parts.v1;
  if (!timestamp || !receivedSignature) return false;

  const expected = hmacSha256(`${timestamp}.${payload}`, webhookSecret);
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(receivedSignature);
  if (expectedBuffer.length !== receivedBuffer.length) return false;

  const currentWindow = Math.abs(Date.now() / 1000 - Number(timestamp));
  return currentWindow <= 300 && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

async function refundOrder(paymentIntentId: string) {
  const body = new URLSearchParams();
  body.set("payment_intent", paymentIntentId);
  await stripeRequest("refunds", { method: "POST", body });
}

export async function confirmStripeOrder(event: {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
}): Promise<WebhookResult> {
  if (event.type !== "checkout.session.completed") {
    return { ok: true, processed: false, message: "Ignored event" };
  }

  const session = event.data.object as Record<string, unknown>;
  const sessionId = String(session.id ?? "");
  const paymentIntentId = String(session.payment_intent ?? "");
  const metadata = (session.metadata as Record<string, string> | undefined) ?? {};
  const orderId = metadata.order_id ?? "";

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select(
      "id, order_number, status, payment_status, stripe_session_id, stripe_payment_intent_id, payment_provider, cart_snapshot",
    )
    .or(
      orderId
        ? `id.eq.${orderId},stripe_session_id.eq.${sessionId}`
        : `stripe_session_id.eq.${sessionId}`,
    )
    .maybeSingle();

  if (orderError) {
    throw new Error(orderError.message);
  }
  if (!order) {
    return { ok: true, processed: false, message: "Order not found" };
  }

  // ─── Idempotency: claim the webhook atomically ─────────────────────────
  // This prevents double-processing from retried webhook deliveries.
  const idempotencyKey = `${event.id}::${order.id}`;
  const { data: claimed, error: claimError } = await supabaseAdmin.rpc(
    "try_claim_webhook",
    {
      p_order_id: order.id,
      p_idempotency_key: idempotencyKey,
      p_payment_intent: paymentIntentId || null,
      p_session_id: sessionId || null,
    },
  );

  if (claimError) {
    throw new Error(claimError.message);
  }
  if (claimed === false) {
    return { ok: true, processed: false, message: "Duplicate webhook — already processed" };
  }

  // ─── Stock decrement ──────────────────────────────────────────────────
  const { data: items, error: itemsError } = await supabaseAdmin
    .from("order_items")
    .select("product_id, variant_id, quantity, attributes")
    .eq("order_id", order.id);
  if (itemsError) {
    throw new Error(itemsError.message);
  }

  const decrements = await Promise.all(
    (items ?? []).map((item) =>
      supabaseAdmin.rpc("decrement_checkout_stock", {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
        p_size: String((item.attributes as { size?: string } | null)?.size ?? ""),
        p_variant_id: item.variant_id,
        p_reference: sessionId,
        p_notes: `stripe:${order.order_number}`,
      }),
    ),
  );

  const anyFailed = decrements.some(({ data, error }) => error || data !== true);
  if (anyFailed) {
    if (paymentIntentId) {
      await refundOrder(paymentIntentId);
    }
    await supabaseAdmin
      .from("orders")
      .update({
        status: "cancelled",
        payment_status: paymentIntentId ? "refunded" : "failed",
        stripe_payment_intent_id: paymentIntentId || null,
        notes: "Auto-refunded due to stock conflict",
      })
      .eq("id", order.id);
    return {
      ok: false,
      processed: true,
      message: "Stock conflict detected; refund initiated",
    };
  }

  const { error: updateError } = await supabaseAdmin
    .from("orders")
    .update({
      status: "confirmed",
      payment_status: "completed",
      stripe_session_id: sessionId || order.stripe_session_id,
      stripe_payment_intent_id: paymentIntentId || order.stripe_payment_intent_id,
      paid_at: new Date().toISOString(),
      payment_provider: "stripe",
    })
    .eq("id", order.id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return { ok: true, processed: true, message: "Order confirmed" };
}
