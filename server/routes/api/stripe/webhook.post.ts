import { createError, defineEventHandler, getHeader, readRawBody } from "h3";
import { createOrderFromPayment, createOrderFromPaymentIntent } from "../../../lib/order-lifecycle";
import { getContainer } from "../../../container";
import { env } from "../../../config/env";
import { logger } from "../../../lib/logger";

async function acquireWebhookEvent(
  eventId: string,
  eventType: string,
): Promise<{ status: "new" | "retry" | "duplicate"; orderId?: string }> {
  const { supabase } = getContainer();

  const { data: existing } = await (supabase
    .from("webhook_events") as any)
    .select("status, order_id")
    .eq("event_id", eventId)
    .maybeSingle();

  if (existing) {
    if (existing.status === "completed") {
      return { status: "duplicate", orderId: existing.order_id ?? undefined };
    }
    await (supabase
      .from("webhook_events") as any)
      .update({ status: "processing", processed_at: new Date().toISOString() })
      .eq("event_id", eventId);
    return { status: "retry" };
  }

  const { error: insertError } = await (supabase.from("webhook_events") as any).insert({
    event_id: eventId,
    event_type: eventType,
    status: "processing",
  });

  if (insertError && insertError.code === "23505") {
    const { data: race } = await (supabase
      .from("webhook_events") as any)
      .select("status, order_id")
      .eq("event_id", eventId)
      .maybeSingle();
    if (race?.status === "completed") {
      return { status: "duplicate", orderId: race.order_id ?? undefined };
    }
    return { status: "retry" };
  }

  if (insertError) {
    throw createError({ statusCode: 500, statusMessage: "Failed to record webhook event" });
  }

  return { status: "new" };
}

async function finalizeWebhookEvent(
  eventId: string,
  status: "completed" | "failed",
  orderId?: string,
  errorMessage?: string,
): Promise<void> {
  const { supabase } = getContainer();
  const update: Record<string, unknown> = {
    status,
    processed_at: new Date().toISOString(),
  };
  if (orderId) update.order_id = orderId;
  if (errorMessage) update.error_message = errorMessage;
  await (supabase.from("webhook_events") as any).update(update).eq("event_id", eventId);
}

export default defineEventHandler(async (event) => {
  const rawBody = await readRawBody(event, "utf8");
  const signature = getHeader(event, "stripe-signature");

  logger.info("Stripe Webhook: Event received");

  // Validate server configuration
  const webhookSecret = env.stripeWebhookSecret;
  if (!webhookSecret) {
    logger.error("Stripe Webhook: STRIPE_WEBHOOK_SECRET is not configured on the server");
    throw createError({
      statusCode: 500,
      statusMessage: "STRIPE_WEBHOOK_SECRET is not configured on the server",
    });
  }

  const { stripe } = getContainer();
  if (!stripe) {
    logger.error("Stripe Webhook: Stripe client not initialized inside ServerContainer");
    throw createError({
      statusCode: 500,
      statusMessage: "Stripe client not initialized",
    });
  }

  if (!rawBody || !signature) {
    logger.warn("Stripe Webhook: Missing request body or signature header");
    throw createError({
      statusCode: 400,
      statusMessage: "Missing request body or stripe-signature header",
    });
  }

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    logger.info("Stripe Webhook: Signature verified", {
      eventId: stripeEvent.id,
      eventType: stripeEvent.type,
    });
  } catch (err: any) {
    logger.warn("Stripe Webhook: Signature verification failed", { error: err.message });
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid Stripe signature: ${err.message}`,
    });
  }

  const acquisition = await acquireWebhookEvent(stripeEvent.id, stripeEvent.type);
  if (acquisition.status === "duplicate") {
    logger.info("Stripe Webhook: Duplicate event detected", {
      eventId: stripeEvent.id,
      eventType: stripeEvent.type,
      orderId: acquisition.orderId,
    });
    return { received: true, duplicated: true, order_id: acquisition.orderId };
  }

  try {
    if (stripeEvent.type === "payment_intent.succeeded") {
      const paymentIntent = stripeEvent.data.object as any;
      const piId = paymentIntent.id as string;
      if (!piId) {
        throw new Error("Missing payment intent ID in Stripe payload");
      }

      logger.info("Stripe Webhook: Payment succeeded", {
        eventId: stripeEvent.id,
        paymentIntentId: piId,
      });

      const result = await createOrderFromPaymentIntent({ paymentIntentId: piId });
      if (!result.success) {
        throw new Error(`Order creation failed: ${result.error}`);
      }

      await finalizeWebhookEvent(stripeEvent.id, "completed", result.orderId);
      logger.info("Stripe Webhook: Database event finalized", {
        eventId: stripeEvent.id,
        status: "completed",
        orderId: result.orderId,
      });

      return { received: true, order_id: result.orderId, order_number: result.orderNumber };
    }

    if (stripeEvent.type === "checkout.session.completed") {
      const session = stripeEvent.data.object as any;
      if (!session.id) {
        throw new Error("Missing session ID in Stripe payload");
      }

      logger.info("Stripe Webhook: Checkout session completed", {
        eventId: stripeEvent.id,
        sessionId: session.id,
      });

      const metadata = (session.metadata ?? {}) as Record<string, string>;
      const userId = metadata.user_id;
      const email = metadata.email;
      const subtotal = parseFloat(metadata.subtotal ?? "0");
      const shippingAddressRaw = metadata.shipping_address;
      const billingAddressRaw = metadata.billing_address;
      const itemsRaw = metadata.validated_items;

      if (!userId || !email) {
        throw new Error("Missing user metadata (user_id/email) in session");
      }

      let items = [];
      try {
        if (itemsRaw) items = JSON.parse(itemsRaw);
      } catch {
        throw new Error("Invalid items metadata structure in session");
      }

      if (items.length === 0) {
        throw new Error("No items found in session metadata");
      }

      let shippingAddress: Record<string, string> = {};
      try {
        shippingAddress = shippingAddressRaw ? JSON.parse(shippingAddressRaw) : {};
      } catch {
        shippingAddress = {};
      }

      let billingAddress: Record<string, string> | undefined;
      if (billingAddressRaw) {
        try {
          billingAddress = JSON.parse(billingAddressRaw);
        } catch {
          /* ignore */
        }
      }

      const result = await createOrderFromPayment({
        userId,
        email,
        phone: shippingAddress.phone ?? "",
        subtotal,
        shippingAddress,
        billingAddress,
        items,
        stripeSessionId: session.id as string,
        stripePaymentIntentId: (session.payment_intent as string) ?? "",
        stripePaymentMethod: (session.mode as string) ?? "card",
      });

      if (!result.success) {
        throw new Error(`Order creation failed: ${result.error}`);
      }

      await finalizeWebhookEvent(stripeEvent.id, "completed", result.orderId);
      logger.info("Stripe Webhook: Database event finalized", {
        eventId: stripeEvent.id,
        status: "completed",
        orderId: result.orderId,
      });

      return { received: true, order_id: result.orderId, order_number: result.orderNumber };
    }

    if (stripeEvent.type === "payment_intent.payment_failed") {
      const paymentIntent = stripeEvent.data.object as any;
      logger.warn("Stripe Webhook: Payment failed", {
        eventId: stripeEvent.id,
        paymentIntentId: paymentIntent.id,
        error: paymentIntent.last_payment_error,
      });

      await finalizeWebhookEvent(stripeEvent.id, "completed");
      return { received: true, status: "payment_failed" };
    }

    if (stripeEvent.type === "charge.refunded") {
      const charge = stripeEvent.data.object as any;
      logger.info("Stripe Webhook: Refund received", {
        eventId: stripeEvent.id,
        chargeId: charge.id,
        paymentIntentId: charge.payment_intent,
      });

      await finalizeWebhookEvent(stripeEvent.id, "completed");
      return { received: true, status: "refunded" };
    }

    // Default fallback for unhandled event types
    await finalizeWebhookEvent(stripeEvent.id, "completed");
    logger.info("Stripe Webhook: Database event finalized", {
      eventId: stripeEvent.id,
      status: "completed",
    });
    return { received: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await finalizeWebhookEvent(stripeEvent.id, "failed", undefined, message);
    logger.error("Stripe Webhook processing failed", {
      eventType: stripeEvent.type,
      error: message,
    });
    throw createError({
      statusCode: 500,
      statusMessage: `Webhook processing failed: ${message}`,
    });
  }
});
