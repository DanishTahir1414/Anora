import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const CheckoutItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().nullable().optional(),
  size: z.string().default(""),
  quantity: z.number().int().positive(),
});

const AddressSchema = z.object({
  firstName: z.string().default(""),
  lastName: z.string().default(""),
  line1: z.string().default(""),
  line2: z.string().optional().default(""),
  city: z.string().default(""),
  state: z.string().optional().default(""),
  postalCode: z.string().default(""),
  country: z.string().default(""),
  phone: z.string().default(""),
});

const PaymentIntentSchema = z.object({
  items: z.array(CheckoutItemSchema).min(1),
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema.optional(),
  email: z.string().min(1),
  accessToken: z.string().min(1),
  idempotencyKey: z.string().optional(),
  checkoutRequestId: z.string().optional(),
});

const PayPalCreateSchema = z.object({
  items: z.array(CheckoutItemSchema).min(1),
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema.optional(),
  email: z.string().email(),
  accessToken: z.string().min(1),
});

const PayPalCaptureSchema = z.object({
  paypalOrderId: z.string().min(1),
  accessToken: z.string().min(1),
  email: z.string().email(),
  items: z.array(CheckoutItemSchema).min(1),
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema.optional(),
  paymentMethod: z.string().default("paypal"),
});

const StripeCheckoutSchema = z.object({
  items: z.array(CheckoutItemSchema).min(1),
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema.optional(),
  email: z.string().email(),
  accessToken: z.string().min(1),
});

const UpdatePaymentIntentSchema = z.object({
  paymentIntentId: z.string().min(1),
  email: z.string().email(),
  accessToken: z.string().min(1),
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema.optional(),
});

const CreateOrderSchema = z.object({
  paymentIntentId: z.string().min(1),
  accessToken: z.string().min(1),
});

export const createPaymentIntent = createServerFn({ method: "POST" })
  .validator(PaymentIntentSchema)
  .handler(async ({ data }) => {
    const {
      email,
      items,
      shippingAddress,
      billingAddress,
      accessToken,
      idempotencyKey,
      checkoutRequestId,
    } = data;

    const { supabaseAdmin } = await import("../../server/lib/supabase-admin");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
    if (userError || !userData?.user) throw new Error("Authentication required");

    const { createPaymentIntent: serverCreatePaymentIntent } =
      await import("../../server/lib/payments");
    return await serverCreatePaymentIntent({
      userId: userData.user.id,
      email,
      items,
      shippingAddress,
      billingAddress,
      idempotencyKey,
      checkoutRequestId,
    });
  });

export const createPayPalOrder = createServerFn({ method: "POST" })
  .validator(PayPalCreateSchema)
  .handler(async ({ data }) => {
    const { email, items, shippingAddress, billingAddress, accessToken } = data;

    const { supabaseAdmin } = await import("../../server/lib/supabase-admin");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
    if (userError || !userData?.user) throw new Error("Authentication required");

    const { createPayPalOrder: serverCreatePayPalOrder, validateAndBuildLineItems } =
      await import("../../server/lib/payments");
    const { validation, totals } = await validateAndBuildLineItems(items);

    return await serverCreatePayPalOrder({
      items: validation.items.map((v) => ({
        name: v.productName,
        quantity: v.quantity,
        unitAmount: Math.round(v.unitPrice * 100),
        description: "",
      })),
      subtotal: Math.round(totals.subtotal * 100),
      shipping: Math.round(totals.shipping * 100),
      tax: Math.round(totals.tax * 100),
    });
  });

export const capturePayPalOrder = createServerFn({ method: "POST" })
  .validator(z.object({ orderId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { capturePayPalOrder: serverCapturePayPal } = await import("../../server/lib/payments");
    return await serverCapturePayPal(data.orderId);
  });

export const createStripeCheckoutSession = createServerFn({ method: "POST" })
  .validator(StripeCheckoutSchema)
  .handler(async ({ data }) => {
    const { email, items, shippingAddress, billingAddress, accessToken } = data;

    const { supabaseAdmin } = await import("../../server/lib/supabase-admin");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
    if (userError || !userData?.user) throw new Error("Authentication required");

    const { createStripeCheckoutSession: serverCreateSession } =
      await import("../../server/lib/payments");
    const baseUrl = process.env.PUBLIC_APP_URL ?? "http://localhost:5173";

    return await serverCreateSession({
      userId: userData.user.id,
      email,
      items,
      shippingAddress,
      billingAddress,
      successUrl: `${baseUrl}/order/success`,
      cancelUrl: `${baseUrl}/checkout?canceled=1`,
    });
  });

export const createOrder = createServerFn({ method: "POST" })
  .validator(CreateOrderSchema)
  .handler(async ({ data }) => {
    const { paymentIntentId, accessToken } = data;

    const { supabaseAdmin } = await import("../../server/lib/supabase-admin");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
    if (userError || !userData?.user) throw new Error("Authentication required");

    const { createOrderFromPaymentIntent } = await import("../../server/lib/order-lifecycle");
    return await createOrderFromPaymentIntent({ paymentIntentId });
  });

export const createOrderFromPayPal = createServerFn({ method: "POST" })
  .validator(PayPalCaptureSchema)
  .handler(async ({ data }) => {
    const { paypalOrderId, accessToken, email, items, shippingAddress, billingAddress, paymentMethod } = data;

    const { supabaseAdmin } = await import("../../server/lib/supabase-admin");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
    if (userError || !userData?.user) throw new Error("Authentication required");

    const { capturePayPalOrder: serverCapturePayPal, validateAndBuildLineItems } =
      await import("../../server/lib/payments");

    const captureResult = await serverCapturePayPal(paypalOrderId);
    if (captureResult.status !== "COMPLETED") {
      throw new Error("PayPal payment could not be verified.");
    }

    const { validation: cartValidation } = await validateAndBuildLineItems(items);
    const validatedTotal = cartValidation.items.reduce(
      (sum: number, v: { unitPrice: number; quantity: number }) => sum + v.unitPrice * v.quantity,
      0,
    );

    const { createOrderFromPayPal: serverCreateFromPayPal } = await import("../../server/lib/order-lifecycle");
    return await serverCreateFromPayPal({
      userId: userData.user.id,
      email,
      paypalOrderId,
      items: cartValidation.items.map((v: { productId: string; variantId: string | null; size: string; quantity: number; unitPrice: number; productName: string; imageUrl?: string }) => ({
        productId: v.productId,
        variantId: v.variantId ?? null,
        size: v.size ?? "",
        quantity: v.quantity,
        unitPrice: v.unitPrice,
        productName: v.productName,
        imageUrl: v.imageUrl || undefined,
      })),
      shippingAddress: shippingAddress as Record<string, string>,
      billingAddress: (billingAddress ?? shippingAddress) as Record<string, string>,
      total: validatedTotal,
      paymentMethod: paymentMethod || "paypal",
    });
  });

export const updatePaymentIntent = createServerFn({ method: "POST" })
  .validator(UpdatePaymentIntentSchema)
  .handler(async ({ data }) => {
    const { paymentIntentId, email, shippingAddress, billingAddress, accessToken } = data;

    const { supabaseAdmin } = await import("../../server/lib/supabase-admin");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
    if (userError || !userData?.user) throw new Error("Authentication required");

    const { updatePaymentIntent: serverUpdatePaymentIntent } =
      await import("../../server/lib/payments");
    return await serverUpdatePaymentIntent(paymentIntentId, {
      email,
      shippingAddress,
      billingAddress,
    });
  });

export function getStripePublishableKey(): string {
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_STRIPE_PUBLISHABLE_KEY) {
    return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  }
  return "";
}

export const getPayPalClientId = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { env } = await import("../../server/config/env");
    return env.paypalClientId || "";
  } catch {
    return "";
  }
});

export function createCheckoutRequestId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function formatAddress(address: any): string {
  if (!address) return "";

  if (typeof address === "string") {
    try {
      const parsed = JSON.parse(address);
      if (parsed && typeof parsed === "object") {
        return formatAddress(parsed);
      }
    } catch {
      return address.trim();
    }
  }

  const addr = address as Record<string, any>;

  const firstName = (addr.firstName || addr.first_name || "").trim();
  const lastName = (addr.lastName || addr.last_name || "").trim();
  const name = [firstName, lastName].filter(Boolean).join(" ") || (addr.name || "").trim();

  const line1 = (addr.line1 || addr.address1 || addr.address || "").trim();
  const line2 = (addr.line2 || addr.address2 || "").trim();

  const city = (addr.city || "").trim();
  const state = (addr.state || "").trim();
  const postalCode = (addr.postalCode || addr.postal_code || addr.zip || "").trim();

  let cityStateZip = "";
  if (city && state && postalCode) {
    cityStateZip = `${city}, ${state} ${postalCode}`;
  } else if (city && postalCode) {
    cityStateZip = `${city}, ${postalCode}`;
  } else {
    cityStateZip = [city, state, postalCode].filter(Boolean).join(", ");
  }

  const country = (addr.country || "").trim();
  const phone = (addr.phone || "").trim();
  const phoneStr = phone ? `Phone: ${phone}` : "";

  return [
    name,
    line1,
    line2,
    cityStateZip,
    country,
    phoneStr
  ]
    .filter(Boolean)
    .join("\n");
}

const DownloadInvoiceSchema = z.object({
  invoiceId: z.string().min(1),
  accessToken: z.string().min(1),
});

export const getInvoicePdfUrl = createServerFn({ method: "POST" })
  .validator(DownloadInvoiceSchema)
  .handler(async ({ data }) => {
    const { invoiceId, accessToken } = data;

    const { supabaseAdmin } = await import("../../server/lib/supabase-admin");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
    if (userError || !userData?.user) throw new Error("Authentication required");

    const { data: invoiceRec } = await supabaseAdmin
      .from("invoices")
      .select("customer_id, invoice_number")
      .eq("id", invoiceId)
      .maybeSingle();

    if (!invoiceRec) throw new Error("Invoice not found");

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .maybeSingle();

    const isStaff = profile?.role === "admin";
    if (invoiceRec.customer_id !== userData.user.id && !isStaff) {
      throw new Error("Access denied");
    }

    const { getContainer } = await import("../../server/container");
    const container = getContainer();
    const signedUrl = await container.invoice.getPdfUrl(invoiceId);

    return { signedUrl, invoiceNumber: invoiceRec.invoice_number };
  });
