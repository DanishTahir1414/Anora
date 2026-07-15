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

  const { data: existing } = await supabase
    .from("webhook_events")
    .select("status, order_id")
    .eq("event_id", eventId)
    .maybeSingle();

  if (existing) {
    if (existing.status === "completed") {
      return { status: "duplicate", orderId: existing.order_id ?? undefined };
    }
    await supabase
      .from("webhook_events")
      .update({ status: "processing", processed_at: new Date().toISOString() })
      .eq("event_id", eventId);
    return { status: "retry" };
  }

  const { error: insertError } = await supabase.from("webhook_events").insert({
    event_id: eventId,
    event_type: eventType,
    status: "processing",
  });

  if (insertError && insertError.code === "23505") {
    const { data: race } = await supabase
      .from("webhook_events")
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
  await supabase.from("webhook_events").update(update).eq("event_id", eventId);
}

async function verifyPayPalWebhook(
  headers: Record<string, string>,
  body: string,
): Promise<boolean> {
  const webhookId = env.paypalWebhookId;
  if (!webhookId) return false;

  const authAlgo = headers["paypal-auth-algo"];
  const certUrl = headers["paypal-cert-url"];
  const transmissionId = headers["paypal-transmission-id"];
  const transmissionSig = headers["paypal-transmission-sig"];
  const transmissionTime = headers["paypal-transmission-time"];

  if (!authAlgo || !certUrl || !transmissionId || !transmissionSig || !transmissionTime) {
    return false;
  }

  const isProduction = env.paypalEnvironment === "production";
  const apiBase = isProduction ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

  const clientId = env.paypalClientId;
  const secret = env.paypalSecret;
  if (!clientId || !secret) return false;

  const tokenResponse = await fetch(`${apiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

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

  const verifyData = (await verifyResponse.json()) as { verification_status?: string };
  return verifyData.verification_status === "SUCCESS";
}

export default defineEventHandler(async (event) => {
  const rawBody = await readRawBody(event, "utf8");
  if (!rawBody) {
    throw createError({ statusCode: 400, statusMessage: "Missing request body" });
  }

  const headers: Record<string, string> = {};
  for (const key of ["paypal-auth-algo", "paypal-cert-url", "paypal-transmission-id", "paypal-transmission-sig", "paypal-transmission-time"]) {
    const val = getHeader(event, key);
    if (val) headers[key] = String(val);
  }

  const verified = await verifyPayPalWebhook(headers, rawBody);
  if (!verified) {
    const webhookId = env.paypalWebhookId;
    if (webhookId) {
      logger.warn("PayPal webhook verification failed");
      throw createError({ statusCode: 400, statusMessage: "Invalid PayPal webhook signature" });
    }
    logger.warn("PayPal webhook verification skipped — PAYPAL_WEBHOOK_ID not configured");
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
    return { received: true, duplicated: true, order_id: acquisition.orderId };
  }

  try {
    if (parsed.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const resource = parsed.resource as Record<string, unknown> | undefined;
      if (!resource) {
        throw createError({ statusCode: 400, statusMessage: "Invalid resource data" });
      }

      const customId = resource.custom_id as string | undefined;
      if (!customId) {
        logger.info("Webhook: PayPal capture completed without custom_id — skipping", {
          resourceId: resource.id,
        });
        await finalizeWebhookEvent(parsed.id, "completed");
        return { received: true, skipped: true, reason: "no_custom_id" };
      }

      const paypalOrderId = customId;

      logger.info("Processing PayPal capture completed", { paypalOrderId, resourceId: resource.id });
      throw createError({
        statusCode: 501,
        statusMessage: "PayPal webhook order creation requires full session data",
      });
    }

    if (parsed.event_type === "CHECKOUT.ORDER.APPROVED") {
      logger.info("PayPal order approved webhook received", { eventId: parsed.id });
    }

    await finalizeWebhookEvent(parsed.id, "completed");
    return { received: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await finalizeWebhookEvent(parsed.id, "failed", undefined, message);
    logger.error("PayPal webhook processing failed", { eventType: parsed.event_type, error: message });
    throw err;
  }
});
