import { getRequestURL, getHeader, createError, defineEventHandler, readBody } from "h3";
import { createCODOrder } from "../../../lib/payments";
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

  const items = Array.isArray(body.items) ? body.items : [];
  const validated = validateCartItems(items);
  if (!validated.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: validated.error ?? "Cart validation failed",
    });
  }

  const result = await createCODOrder({
    userId: userResult.user.id,
    email: userResult.user.email ?? body.email ?? "",
    items,
    shippingAddress: body.shippingAddress ?? undefined,
    billingAddress: body.billingAddress ?? undefined,
    checkoutSessionToken:
      typeof body.checkoutSessionToken === "string" ? body.checkoutSessionToken : undefined,
  });

  return result;
});
