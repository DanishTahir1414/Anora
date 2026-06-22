import { createError, defineEventHandler, getHeader, readRawBody } from "h3";
import { confirmStripeOrder, verifyStripeWebhookSignature } from "../../../lib/payments";

export default defineEventHandler(async (event) => {
  const rawBody = await readRawBody(event, "utf8");
  const signature = getHeader(event, "stripe-signature");

  if (!rawBody || !verifyStripeWebhookSignature(rawBody, signature)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid Stripe signature" });
  }

  const payload = JSON.parse(rawBody) as {
    id: string;
    type: string;
    data: { object: Record<string, unknown> };
  };

  const result = await confirmStripeOrder(payload);
  return {
    received: true,
    ...result,
  };
});
