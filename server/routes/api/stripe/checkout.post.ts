import { getRequestURL, getHeader, createError, defineEventHandler, readBody } from "h3";
import { createStripeCheckoutSession } from "../../../lib/payments";
import { validateCartItems } from "../../../lib/cart-validation";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const authorization = getHeader(event, "authorization") ?? "";
  const accessToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";

  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: "Authentication required" });
  }

  const { data: userResult, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
  if (userError || !userResult.user) {
    throw createError({ statusCode: 401, statusMessage: "Invalid session" });
  }

  // ─── Server-side cart validation ──────────────────────────────────────
  // NEVER trust client prices or quantities. Verify everything server-side.
  const items = Array.isArray(body.items) ? body.items : [];
  const validated = validateCartItems(items);
  if (!validated.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: validated.error ?? "Cart validation failed",
    });
  }

  const baseUrl =
    process.env.PUBLIC_APP_URL ?? getRequestURL(event).origin ?? "http://localhost:5173";

  const response = await createStripeCheckoutSession({
    userId: userResult.user.id,
    email: userResult.user.email ?? body.email ?? "",
    items,
    shippingAddress: body.shippingAddress ?? undefined,
    billingAddress: body.billingAddress ?? undefined,
    successUrl: `${baseUrl}/checkout?success=1`,
    cancelUrl: `${baseUrl}/checkout?canceled=1`,
    checkoutSessionToken: typeof body.checkoutSessionToken === "string" ? body.checkoutSessionToken : undefined,
  });

  return response;
});
