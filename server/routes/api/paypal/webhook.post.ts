import { createError, defineEventHandler, getHeader, readRawBody } from "h3";
import { createOrderFromPayPal } from "../../../lib/order-lifecycle";
import { env } from "../../../config/env";
import { getContainer } from "../../../container";
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

async function verifyPayPalWebhook(
  headers: Record<string, string>,
  body: string,
): Promise<boolean> {
  const webhookId = env.paypalWebhookId;
  if (!webhookId) {
    logger.warn("PayPal Webhook: PAYPAL_WEBHOOK_ID not configured — signature verification skipped");
    return true; // Graceful degradation
  }

  const authAlgo = headers["paypal-auth-algo"];
  const certUrl = headers["paypal-cert-url"];
  const transmissionId = headers["paypal-transmission-id"];
  const transmissionSig = headers["paypal-transmission-sig"];
  const transmissionTime = headers["paypal-transmission-time"];

  if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
    logger.warn("PayPal Webhook: Missing required verification headers");
    return false;
  }

  const isProduction = env.paypalEnvironment === "production";
  const apiBase = isProduction ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

  const clientId = env.paypalClientId;
  const secret = env.paypalSecret;
  if (!clientId || !secret) {
    logger.warn("PayPal Webhook: PAYPAL_CLIENT_ID or PAYPAL_SECRET not configured — signature verification impossible");
    return false;
  }

  try {
    const tokenResponse = await fetch(`${apiBase}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenResponse.ok) {
      logger.error("PayPal Webhook: OAuth token fetch failed", { status: tokenResponse.status });
      return false;
    }

    const tokenData = (await tokenResponse.json()) as { access_token?: string };
    if (!tokenData.access_token) return false;

    const verificationBody = {
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    };

    const verifyResponse = await fetch(
      `${apiBase}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(verificationBody),
      },
    );

    if (!verifyResponse.ok) {
      logger.error("PayPal Webhook: Signature verification endpoint returned error", { status: verifyResponse.status });
      return false;
    }

    const verifyData = (await verifyResponse.json()) as { verification_status?: string };
    return verifyData.verification_status === "SUCCESS";
  } catch (err) {
    logger.error("PayPal Webhook: Verification request failed", { error: String(err) });
    return false;
  }
}

export default defineEventHandler(async (event) => {
  const rawBody = await readRawBody(event, "utf8");
  if (!rawBody) {
    throw createError({ statusCode: 400, statusMessage: "Missing request body" });
  }

  logger.info("PayPal Webhook: Event received");

  const headers: Record<string, string> = {};
  for (const key of ["paypal-auth-algo", "paypal-cert-url", "paypal-transmission-id", "paypal-transmission-sig", "paypal-transmission-time"]) {
    const val = getHeader(event, key);
    if (val) headers[key] = String(val);
  }

  const verified = await verifyPayPalWebhook(headers, rawBody);
  if (!verified) {
    const webhookId = env.paypalWebhookId;
    if (webhookId) {
      logger.warn("PayPal Webhook: Signature verification failed");
      throw createError({ statusCode: 400, statusMessage: "Invalid PayPal webhook signature" });
    }
  } else {
    logger.info("PayPal Webhook: Signature verified");
  }

  const parsed = JSON.parse(rawBody) as {
    id?: string;
    event_type?: string;
    resource?: Record<string, unknown>;
  };

  if (!parsed.id || !parsed.event_type) {
    throw createError({ statusCode: 400, statusMessage: "Invalid webhook payload" });
  }

  const acquisition = await acquireWebhookEvent(parsed.id, parsed.event_type);
  if (acquisition.status === "duplicate") {
    logger.info("PayPal Webhook: Duplicate event detected", {
      eventId: parsed.id,
      eventType: parsed.event_type,
      orderId: acquisition.orderId,
    });
    return { received: true, duplicated: true, order_id: acquisition.orderId };
  }

  try {
    if (parsed.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const resource = parsed.resource as Record<string, unknown> | undefined;
      if (!resource) {
        throw new Error("Invalid capture resource data");
      }

      const customId = resource.custom_id as string | undefined;
      if (!customId) {
        logger.info("PayPal Webhook: Capture completed without custom_id (skipping order creation fallback)", {
          resourceId: resource.id,
        });
        await finalizeWebhookEvent(parsed.id, "completed");
        logger.info("PayPal Webhook: Database event finalized", { eventId: parsed.id, status: "completed" });
        return { received: true, skipped: true, reason: "no_custom_id" };
      }

      const paypalOrderId = customId;
      logger.info("PayPal Webhook: Payment succeeded", {
        eventId: parsed.id,
        paypalOrderId,
        resourceId: resource.id,
      });

      // Handled synchronously client-side via capture callback; webhook finalized as completed
      await finalizeWebhookEvent(parsed.id, "completed");
      logger.info("PayPal Webhook: Database event finalized", {
        eventId: parsed.id,
        status: "completed",
      });

      return { received: true, status: "completed", paypal_order_id: paypalOrderId };
    }

    if (parsed.event_type === "PAYMENT.CAPTURE.DENIED") {
      const resource = parsed.resource as Record<string, unknown> | undefined;
      logger.warn("PayPal Webhook: Payment failed", {
        eventId: parsed.id,
        resourceId: resource?.id,
        reason: resource?.status_details,
      });

      await finalizeWebhookEvent(parsed.id, "completed");
      logger.info("PayPal Webhook: Database event finalized", { eventId: parsed.id, status: "completed" });
      return { received: true, status: "denied" };
    }

    if (parsed.event_type === "PAYMENT.CAPTURE.REFUNDED") {
      const resource = parsed.resource as Record<string, unknown> | undefined;
      logger.info("PayPal Webhook: Refund received", {
        eventId: parsed.id,
        resourceId: resource?.id,
        amount: resource?.amount,
      });

      await finalizeWebhookEvent(parsed.id, "completed");
      logger.info("PayPal Webhook: Database event finalized", { eventId: parsed.id, status: "completed" });
      return { received: true, status: "refunded" };
    }

    // Default fallback for other events
    await finalizeWebhookEvent(parsed.id, "completed");
    logger.info("PayPal Webhook: Database event finalized", {
      eventId: parsed.id,
      status: "completed",
    });
    return { received: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await finalizeWebhookEvent(parsed.id, "failed", undefined, message);
    logger.error("PayPal Webhook processing failed", {
      eventType: parsed.event_type,
      error: message,
    });
    throw createError({
      statusCode: 500,
      statusMessage: `Webhook processing failed: ${message}`,
    });
  }
});
