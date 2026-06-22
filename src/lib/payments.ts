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

export const CreateStripeCheckoutSchema = z.object({
  items: z.array(CheckoutItemSchema).min(1),
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema,
  email: z.string().email(),
});

export type CreateStripeCheckoutInput = z.infer<typeof CreateStripeCheckoutSchema>;

export interface CreateStripeCheckoutResult {
  orderId: string;
  orderNumber: string;
  checkoutUrl: string;
}

export const createStripeCheckoutSession = createServerFn({ method: "POST" })
  .validator(CreateStripeCheckoutSchema)
  .handler(async ({ data }) => {
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Unable to start Stripe checkout");
    }

    return (await response.json()) as CreateStripeCheckoutResult;
  });
