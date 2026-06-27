import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const CheckoutItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().nullable().optional(),
  size: z.string().default(""),
  quantity: z.number().int().positive(),
});

const AddressSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    line1: z.string().optional(),
    line2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    phone: z.string().optional(),
  })
  .optional();

const StripeCheckoutSchema = z.object({
  items: z.array(CheckoutItemSchema).min(1),
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema,
  email: z.string().email(),
  accessToken: z.string(),
});

export const createStripeCheckoutSession = createServerFn({ method: "POST" })
  .validator(StripeCheckoutSchema)
  .handler(async ({ data }) => {
    const { accessToken, email, items, shippingAddress, billingAddress } = data;

    const { createStripeCheckoutSession: serverCreateSession } =
      await import("../../server/lib/payments");
    const { supabaseAdmin } = await import("../../server/lib/supabase-admin");

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
    if (userError || !userData?.user) {
      throw new Error("Authentication required");
    }

    const baseUrl = process.env.PUBLIC_APP_URL ?? "http://localhost:5173";

    return await serverCreateSession({
      userId: userData.user.id,
      email,
      items,
      shippingAddress: shippingAddress ?? undefined,
      billingAddress: billingAddress ?? undefined,
      successUrl: `${baseUrl}/checkout?success=1`,
      cancelUrl: `${baseUrl}/checkout?canceled=1`,
    });
  });
