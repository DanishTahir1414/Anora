import { getContainer } from "../container";
import { logger } from "../lib/logger";
import { PaymentError, NotFoundError } from "../lib/errors";
import { validateCartItems, type CartItemInput } from "./cart-validation";
import { calculateTotals } from "./totals";
import {
  buildAdminNotificationHtml,
  buildInvoiceEmailHtml,
  buildThankYouHtml,
  type EmailItem,
} from "../templates";
import { formatAddress } from "../../src/lib/payments";

export interface OrderCreationResult {
  success: boolean;
  error?: string;
  orderId?: string;
  orderNumber?: string;
  invoiceNumber?: string;
  invoiceId?: string;
}

export interface OrderCreationInput {
  userId: string;
  email: string;
  phone?: string;
  subtotal: number;
  shippingAddress: Record<string, string>;
  billingAddress?: Record<string, string>;
  items: Array<{
    productId: string;
    variantId?: string | null;
    size: string;
    quantity: number;
    unitPrice: number;
    productName: string;
    imageUrl?: string;
  }>;
  stripeSessionId: string;
  stripePaymentIntentId: string;
  stripePaymentMethod: string;
}

export interface PaymentIntentCreationInput {
  paymentIntentId: string;
}

export interface PayPalOrderCreationInput {
  userId: string;
  email: string;
  paypalOrderId: string;
  items: Array<{
    productId: string;
    variantId: string | null;
    size: string;
    quantity: number;
    unitPrice: number;
    productName: string;
    imageUrl?: string;
  }>;
  shippingAddress: Record<string, string>;
  billingAddress: Record<string, string>;
  total: number;
  paymentMethod: string;
}

type EmailPayloadInput = {
  orderId: string;
  invoiceId: string;
  customerEmail: string;
  customerProfile?: { firstName?: string | null; lastName?: string | null; displayName?: string | null } | null;
  phone: string;
  orderNumber: string;
  invoiceNumber: string;
  orderDate: string;
  billingAddress: Record<string, string>;
  shippingAddress: Record<string, string>;
  items: EmailItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
};

function estimatedDeliveryFrom(orderDateIso: string): string {
  const deliveryDate = new Date(orderDateIso);
  deliveryDate.setDate(deliveryDate.getDate() + 7);
  return deliveryDate.toISOString().slice(0, 10);
}

function buildEmailPayload(input: EmailPayloadInput): Record<string, unknown> {
  const shippingAddressText = formatAddress(input.shippingAddress);
  const billingAddressText = formatAddress(input.billingAddress);

  const customerNameInput = {
    firstName: input.customerProfile?.firstName,
    lastName: input.customerProfile?.lastName,
    displayName: input.customerProfile?.displayName,
    shippingAddress: {
      firstName: input.shippingAddress.firstName,
      lastName: input.shippingAddress.lastName
    },
    billingAddress: {
      firstName: input.billingAddress.firstName,
      lastName: input.billingAddress.lastName
    },
    email: input.customerEmail
  };

  return {
    ...input,
    shippingAddressText,
    billingAddressText,
    thankYouHtml: buildThankYouHtml({
      customer: customerNameInput,
      orderNumber: input.orderNumber,
      orderDate: input.orderDate,
      items: input.items,
      subtotal: input.subtotal,
      shippingAddress: shippingAddressText,
      estimatedDelivery: estimatedDeliveryFrom(input.orderDate),
      shipping: input.shipping,
      tax: input.tax,
      total: input.total,
      paymentMethod: input.paymentMethod,
    }),
    invoiceEmailHtml: buildInvoiceEmailHtml({
      customer: customerNameInput,
      invoiceNumber: input.invoiceNumber,
      orderNumber: input.orderNumber,
      orderDate: input.orderDate,
      billingAddress: billingAddressText,
      shippingAddress: shippingAddressText,
      items: input.items,
      subtotal: input.subtotal,
      shipping: input.shipping,
      tax: input.tax,
      total: input.total,
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentStatus,
    }),
    adminSubject: `New order ${input.orderNumber}`,
    adminHtml: buildAdminNotificationHtml({
      customer: customerNameInput,
      customerEmail: input.customerEmail,
      phone: input.phone,
      orderNumber: input.orderNumber,
      invoiceNumber: input.invoiceNumber,
      amountPaid: input.total,
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentStatus,
      shippingAddress: shippingAddressText,
      items: input.items,
      total: input.total,
      orderTime: input.orderDate,
    }),
  };
}

async function nextOrderNumber(): Promise<string> {
  const { supabase } = getContainer();
  const year = new Date().getFullYear();
  const { data, error } = await supabase.rpc("next_order_number");
  if (error || !data) {
    throw new Error("Failed to generate order number");
  }
  return `AN-${year}-${String(Number(data)).padStart(6, "0")}`;
}

async function nextInvoiceNumber(): Promise<string> {
  const { supabase } = getContainer();
  const year = new Date().getFullYear();
  const { data, error } = await supabase.rpc("next_invoice_number");
  if (error || !data) {
    throw new Error("Failed to generate invoice number");
  }
  return `INV-${year}-${String(Number(data)).padStart(6, "0")}`;
}

async function verifyPaymentIntent(paymentIntentId: string): Promise<{
  ok: boolean;
  userId?: string;
  email?: string;
  subtotal?: number;
  shippingAddress?: Record<string, string>;
  billingAddress?: Record<string, string>;
  items?: Array<{
    productId: string;
    variantId?: string | null;
    size: string;
    quantity: number;
    unitPrice: number;
    productName: string;
    imageUrl?: string;
  }>;
  paymentMethod?: string;
  amount?: number;
  currency?: string;
  checkoutRequestId?: string;
  error?: string;
}> {
  const { stripe } = getContainer();

  try {
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["latest_charge"],
    });

    if (pi.status !== "succeeded") {
      return {
        ok: false,
        error: `Payment not completed: ${pi.status}`,
      };
    }

    const metadata = pi.metadata ?? {};
    const userId = metadata.user_id;
    const email = metadata.email;
    const subtotal = parseFloat(metadata.subtotal ?? "0");

    if (!userId || !email) {
      return { ok: false, error: "PaymentIntent missing user metadata" };
    }

    let shippingAddress: Record<string, string> = {};
    try {
      shippingAddress = metadata.shipping_address ? JSON.parse(metadata.shipping_address) : {};
    } catch {
      shippingAddress = {};
    }

    let billingAddress: Record<string, string> | undefined;
    if (metadata.billing_address) {
      try {
        billingAddress = JSON.parse(metadata.billing_address);
      } catch {
        /* ignore */
      }
    }

    let items: Array<{
      productId: string;
      variantId?: string | null;
      size: string;
      quantity: number;
      unitPrice: number;
      productName: string;
      imageUrl?: string;
    }> = [];
    try {
      if (metadata.validated_items) {
        items = JSON.parse(metadata.validated_items);
      }
    } catch {
      return { ok: false, error: "Invalid items metadata" };
    }

    if (items.length === 0) {
      return { ok: false, error: "No items in PaymentIntent metadata" };
    }

    const charge = (pi.latest_charge as any) as Record<string, unknown> | undefined;
    const paymentMethodDetails = charge?.payment_method_details as
      | Record<string, unknown>
      | undefined;
    const methodType = (paymentMethodDetails?.type as string) ?? "card";

    return {
      ok: true,
      userId,
      email,
      subtotal,
      shippingAddress,
      billingAddress,
      items,
      paymentMethod: methodType,
      amount: pi.amount_received ?? 0,
      currency: pi.currency ?? "usd",
      checkoutRequestId: metadata.checkout_request_id || undefined,
    };
  } catch (err) {
    return {
      ok: false,
      error: `Stripe verification failed: ${err instanceof Error ? err.message : "unknown error"}`,
    };
  }
}

async function verifyStripePayment(stripeSessionId: string): Promise<{
  ok: boolean;
  paymentIntentId?: string;
  paymentMethod?: string;
  amount?: number;
  currency?: string;
  error?: string;
}> {
  const { stripe } = getContainer();

  try {
    const session = await stripe.checkout.sessions.retrieve(stripeSessionId, {
      expand: ["payment_intent"],
    });

    const paymentIntent = (session.payment_intent as any) as Record<string, unknown> | undefined;

    if (!paymentIntent) {
      return { ok: false, error: "No payment intent found for session" };
    }

    const paymentStatus = paymentIntent.status as string;
    if (paymentStatus !== "succeeded" && paymentStatus !== "processing") {
      return {
        ok: false,
        error: `Payment not completed: ${paymentStatus}`,
      };
    }

    const charges = paymentIntent.charges as Record<string, unknown> | undefined;
    const chargeData = charges?.data as Array<Record<string, unknown>> | undefined;
    const paymentMethodDetails = chargeData?.[0]?.payment_method_details as
      | Record<string, unknown>
      | undefined;
    const methodType = (paymentMethodDetails?.type as string) ?? "card";

    return {
      ok: true,
      paymentIntentId: paymentIntent.id as string,
      paymentMethod: methodType,
      amount: (paymentIntent.amount_received as number) ?? 0,
      currency: (paymentIntent.currency as string) ?? "usd",
    };
  } catch (err) {
    return {
      ok: false,
      error: `Stripe verification failed: ${err instanceof Error ? err.message : "unknown error"}`,
    };
  }
}

export async function createOrderFromPaymentIntent(
  input: PaymentIntentCreationInput,
): Promise<OrderCreationResult> {
  const { paymentIntentId } = input;
  const { supabase, queue } = getContainer();

  logger.info("Creating order from PaymentIntent", { paymentIntentId });

  const verification = await verifyPaymentIntent(paymentIntentId);
  if (!verification.ok) {
    logger.warn("PaymentIntent verification failed", { error: verification.error });
    return { success: false, error: verification.error };
  }

  // Check for existing order (idempotency)
  const { data: existingOrder } = await (supabase
    .from("orders") as any)
    .select("id, order_number, status")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();

  if (existingOrder) {
    logger.info("Existing order found", { orderId: existingOrder.id });
    const { data: invoiceRecord } = await (supabase
      .from("invoices") as any)
      .select("id, invoice_number")
      .eq("order_id", existingOrder.id)
      .maybeSingle();

    return {
      success: true,
      orderId: existingOrder.id,
      orderNumber: existingOrder.order_number ?? undefined,
      invoiceNumber: invoiceRecord?.invoice_number ?? undefined,
      invoiceId: invoiceRecord?.id ?? undefined,
    };
  }

  const checkoutRequestId = verification.checkoutRequestId;

  if (checkoutRequestId) {
    await (supabase
      .from("payment_sessions") as any)
      .update({ status: "processing" })
      .eq("checkout_request_id", checkoutRequestId);
  }

  const orderNumber = await nextOrderNumber();
  const invoiceNumber = await nextInvoiceNumber();
  const amount = verification.amount ? verification.amount / 100 : (verification.subtotal ?? 0);
  const total = verification.subtotal ?? amount;

  const orderItems = (verification.items ?? []).map((item) => ({
    product_id: item.productId,
    variant_id: item.variantId ?? null,
    name: item.productName,
    price: item.unitPrice,
    quantity: item.quantity,
    image_url: item.imageUrl ?? null,
    size: item.size,
    attributes: JSON.stringify({ size: item.size }),
  }));

  const shippingAddressJson = JSON.stringify(verification.shippingAddress ?? {});
  const billingAddressJson = verification.billingAddress
    ? JSON.stringify(verification.billingAddress)
    : shippingAddressJson;

  // Call the database RPC to create the order, decrement stock, create invoice
  const { data: rpcResult, error: rpcError } = await (supabase.rpc as any)("create_order_from_payment", {
    p_user_id: verification.userId,
    p_order_number: orderNumber,
    p_subtotal: total,
    p_total: total,
    p_shipping_address: shippingAddressJson,
    p_billing_address: billingAddressJson,
    p_stripe_session_id: "",
    p_stripe_payment_intent_id: paymentIntentId,
    p_payment_method: verification.paymentMethod ?? "card",
    p_currency: verification.currency ?? "usd",
    p_amount: amount,
    p_invoice_number: invoiceNumber,
    p_items: JSON.stringify(orderItems),
    p_checkout_request_id: checkoutRequestId ?? null,
  });

  if (rpcError) {
    logger.error("RPC create_order_from_payment failed", { error: rpcError.message });
    return { success: false, error: `Database error: ${rpcError.message}` };
  }

  const result = rpcResult as Record<string, unknown>;
  if (!result?.success) {
    logger.error("RPC returned failure", { error: result?.error });
    return {
      success: false,
      error: (result?.error as string) ?? "Failed to create order",
    };
  }

  const orderId = result.order_id as string;
  const outInvoiceNumber = (result.invoice_number as string) ?? invoiceNumber;
  const invoiceId = (result.invoice_id as string) ?? "";

  logger.info("Order created via RPC", { orderId, orderNumber, invoiceId });

  // Build email data for background jobs
  const shippingAddr = verification.shippingAddress ?? {};
  const billingAddr = verification.billingAddress ?? verification.shippingAddress ?? {};

  let customerProfile: { firstName?: string | null; lastName?: string | null; displayName?: string | null } | null = null;
  try {
    const { data: profile } = await (supabase
      .from("profiles") as any)
      .select("first_name, last_name, email, metadata")
      .eq("id", verification.userId)
      .maybeSingle();
    if (profile) {
      customerProfile = {
        firstName: profile.first_name,
        lastName: profile.last_name,
        displayName: (profile.metadata as Record<string, any>)?.displayName || "",
      };
    }
  } catch (err) {
    logger.warn("Failed to fetch customer profile for order email", { error: String(err) });
  }

  const orderDate = new Date().toISOString();
  const emailPayload = buildEmailPayload({
    orderId,
    invoiceId,
    customerEmail: verification.email ?? "",
    customerProfile,
    phone: shippingAddr.phone ?? "",
    orderNumber,
    invoiceNumber: outInvoiceNumber,
    orderDate,
    billingAddress: billingAddr,
    shippingAddress: shippingAddr,
    items: (verification.items ?? []).map((i) => ({
      name: i.productName,
      imageUrl: i.imageUrl,
      size: i.size,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
    subtotal: total,
    shipping: 0,
    tax: 0,
    total,
    paymentMethod: verification.paymentMethod ?? "card",
    paymentStatus: "completed",
  });

  // Enqueue background jobs (non-blocking)
  console.log("[DIAGNOSTIC] Step 1: Checkout completed", {
    orderId,
    customerEmail: emailPayload.customerEmail,
    orderNumber,
  });
  console.log("[DIAGNOSTIC] Step 2: Before enqueueing full payload", {
    customerEmail: emailPayload.customerEmail,
    invoiceId: emailPayload.invoiceId,
    orderId: emailPayload.orderId,
  });
  queue.enqueue(orderId, emailPayload).catch((err) => {
    logger.error("Job enqueue failed", { orderId, error: String(err) });
  });

  return {
    success: true,
    orderId,
    orderNumber: result.order_number as string,
    invoiceNumber: outInvoiceNumber,
    invoiceId,
  };
}

export async function createOrderFromPayment(
  input: OrderCreationInput,
): Promise<OrderCreationResult> {
  const { stripeSessionId } = input;
  const { supabase, queue } = getContainer();

  const verification = await verifyStripePayment(stripeSessionId);
  if (!verification.ok) {
    return { success: false, error: verification.error };
  }

  const { data: existingOrder } = await (supabase
    .from("orders") as any)
    .select("id, order_number, status")
    .eq("stripe_session_id", stripeSessionId)
    .maybeSingle();

  if (existingOrder) {
    return {
      success: true,
      orderId: existingOrder.id,
      orderNumber: existingOrder.order_number ?? undefined,
    };
  }

  const orderNumber = await nextOrderNumber();
  const invoiceNumber = await nextInvoiceNumber();
  const total = input.subtotal;

  const orderItems = input.items.map((item) => ({
    product_id: item.productId,
    variant_id: item.variantId ?? null,
    name: item.productName,
    price: item.unitPrice,
    quantity: item.quantity,
    image_url: item.imageUrl ?? null,
    size: item.size,
    attributes: JSON.stringify({ size: item.size }),
  }));

  const shippingAddressJson = JSON.stringify(input.shippingAddress);
  const billingAddressJson = input.billingAddress
    ? JSON.stringify(input.billingAddress)
    : shippingAddressJson;

  const { data: rpcResult, error: rpcError } = await (supabase.rpc as any)("create_order_from_payment", {
    p_user_id: input.userId,
    p_order_number: orderNumber,
    p_subtotal: input.subtotal,
    p_total: total,
    p_shipping_address: shippingAddressJson,
    p_billing_address: billingAddressJson,
    p_stripe_session_id: stripeSessionId,
    p_stripe_payment_intent_id: verification.paymentIntentId ?? input.stripePaymentIntentId,
    p_payment_method: verification.paymentMethod ?? input.stripePaymentMethod ?? "card",
    p_currency: verification.currency ?? "usd",
    p_amount: verification.amount ? verification.amount / 100 : input.subtotal,
    p_invoice_number: invoiceNumber,
    p_items: JSON.stringify(orderItems),
    p_checkout_request_id: null,
  });

  if (rpcError) {
    return { success: false, error: `Database error: ${rpcError.message}` };
  }

  const result = rpcResult as Record<string, unknown>;
  if (!result?.success) {
    return {
      success: false,
      error: (result?.error as string) ?? "Failed to create order",
    };
  }

  const orderId = result.order_id as string;
  const outInvoiceNumber = (result.invoice_number as string) ?? invoiceNumber;
  const invoiceId = (result.invoice_id as string) ?? "";

  const shippingAddr = input.shippingAddress;
  const billingAddr = input.billingAddress || input.shippingAddress;

  let customerProfile: { firstName?: string | null; lastName?: string | null; displayName?: string | null } | null = null;
  try {
    const { data: profile } = await (supabase
      .from("profiles") as any)
      .select("first_name, last_name, email, metadata")
      .eq("id", input.userId)
      .maybeSingle();
    if (profile) {
      customerProfile = {
        firstName: profile.first_name,
        lastName: profile.last_name,
        displayName: (profile.metadata as Record<string, any>)?.displayName || "",
      };
    }
  } catch (err) {
    logger.warn("Failed to fetch customer profile for order email", { error: String(err) });
  }

  const orderDate = new Date().toISOString();
  const emailPayload = buildEmailPayload({
    orderId,
    invoiceId,
    customerEmail: input.email,
    customerProfile,
    phone: input.phone || "",
    orderNumber,
    invoiceNumber: outInvoiceNumber,
    orderDate,
    billingAddress: billingAddr,
    shippingAddress: shippingAddr,
    items: input.items.map((i) => ({
      name: i.productName,
      imageUrl: i.imageUrl,
      size: i.size,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
    subtotal: input.subtotal,
    shipping: 0,
    tax: 0,
    total,
    paymentMethod: verification.paymentMethod ?? input.stripePaymentMethod ?? "card",
    paymentStatus: "completed",
  });

  console.log("[DIAGNOSTIC] Step 1: Checkout completed", {
    orderId,
    customerEmail: emailPayload.customerEmail,
    orderNumber,
  });
  console.log("[DIAGNOSTIC] Step 2: Before enqueueing full payload", {
    customerEmail: emailPayload.customerEmail,
    invoiceId: emailPayload.invoiceId,
    orderId: emailPayload.orderId,
  });
  queue.enqueue(orderId, emailPayload).catch((err) => {
    logger.error("Job enqueue failed", { orderId, error: String(err) });
  });

  return {
    success: true,
    orderId,
    orderNumber: result.order_number as string,
    invoiceNumber: outInvoiceNumber,
    invoiceId,
  };
}

export async function createOrderFromPayPal(
  input: PayPalOrderCreationInput,
): Promise<OrderCreationResult> {
  const { supabase, queue } = getContainer();

  logger.info("Creating order from PayPal", { paypalOrderId: input.paypalOrderId });

  const { data: existingOrder } = await (supabase
    .from("orders") as any)
    .select("id, order_number, status")
    .eq("paypal_order_id", input.paypalOrderId)
    .maybeSingle();

  if (existingOrder) {
    logger.info("Existing order found for PayPal", { orderId: existingOrder.id });
    const { data: invoiceRecord } = await (supabase
      .from("invoices") as any)
      .select("id, invoice_number")
      .eq("order_id", existingOrder.id)
      .maybeSingle();
    return {
      success: true,
      orderId: existingOrder.id,
      orderNumber: existingOrder.order_number ?? undefined,
      invoiceNumber: invoiceRecord?.invoice_number ?? undefined,
      invoiceId: invoiceRecord?.id ?? undefined,
    };
  }

  const orderNumber = await nextOrderNumber();
  const invoiceNumber = await nextInvoiceNumber();
  const total = input.total;

  const orderItems = input.items.map((item) => ({
    product_id: item.productId,
    variant_id: item.variantId ?? null,
    name: item.productName,
    price: item.unitPrice,
    quantity: item.quantity,
    image_url: item.imageUrl ?? null,
    size: item.size,
    attributes: JSON.stringify({ size: item.size }),
  }));

  const shippingAddressJson = JSON.stringify(input.shippingAddress);
  const billingAddressJson = JSON.stringify(input.billingAddress);

  const { data: rpcResult, error: rpcError } = await (supabase.rpc as any)("create_order_from_payment", {
    p_user_id: input.userId,
    p_order_number: orderNumber,
    p_subtotal: total,
    p_total: total,
    p_shipping_address: shippingAddressJson,
    p_billing_address: billingAddressJson,
    p_stripe_session_id: "",
    p_stripe_payment_intent_id: `paypal_${input.paypalOrderId}`,
    p_payment_method: input.paymentMethod,
    p_currency: "usd",
    p_amount: total,
    p_invoice_number: invoiceNumber,
    p_items: JSON.stringify(orderItems),
    p_checkout_request_id: null,
  });

  if (rpcError) {
    logger.error("RPC create_order_from_payment failed for PayPal", { error: rpcError.message });
    return { success: false, error: `Database error: ${rpcError.message}` };
  }

  const result = rpcResult as Record<string, unknown>;
  if (!result?.success) {
    logger.error("RPC returned failure for PayPal", { error: result?.error });
    return {
      success: false,
      error: (result?.error as string) ?? "Failed to create order",
    };
  }

  const orderId = result.order_id as string;
  const outInvoiceNumber = (result.invoice_number as string) ?? invoiceNumber;
  const invoiceId = (result.invoice_id as string) ?? "";

  logger.info("Order created via PayPal", { orderId, orderNumber, invoiceId });

  try {
    await (supabase.from("orders") as any).update({ paypal_order_id: input.paypalOrderId }).eq("id", orderId);
  } catch {
    // paypal_order_id reference is non-critical
  }

  const shippingAddr = input.shippingAddress;
  const billingAddr = input.billingAddress;

  let customerProfile: { firstName?: string | null; lastName?: string | null; displayName?: string | null } | null = null;
  try {
    const { data: profile } = await (supabase
      .from("profiles") as any)
      .select("first_name, last_name, email, metadata")
      .eq("id", input.userId)
      .maybeSingle();
    if (profile) {
      customerProfile = {
        firstName: profile.first_name,
        lastName: profile.last_name,
        displayName: (profile.metadata as Record<string, any>)?.displayName || "",
      };
    }
  } catch (err) {
    logger.warn("Failed to fetch customer profile for order email", { error: String(err) });
  }

  const orderDate = new Date().toISOString();
  const emailPayload = buildEmailPayload({
    orderId,
    invoiceId,
    customerEmail: input.email,
    customerProfile,
    phone: shippingAddr.phone ?? "",
    orderNumber,
    invoiceNumber: outInvoiceNumber,
    orderDate,
    billingAddress: billingAddr,
    shippingAddress: shippingAddr,
    items: input.items.map((i) => ({
      name: i.productName,
      imageUrl: i.imageUrl,
      size: i.size,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
    subtotal: total,
    shipping: 0,
    tax: 0,
    total,
    paymentMethod: input.paymentMethod,
    paymentStatus: "completed",
  });

  console.log("[DIAGNOSTIC] Step 1: Checkout completed", {
    orderId,
    customerEmail: emailPayload.customerEmail,
    orderNumber,
  });
  console.log("[DIAGNOSTIC] Step 2: Before enqueueing full payload", {
    customerEmail: emailPayload.customerEmail,
    invoiceId: emailPayload.invoiceId,
    orderId: emailPayload.orderId,
  });
  queue.enqueue(orderId, emailPayload).catch((err) => {
    logger.error("Job enqueue failed", { orderId, error: String(err) });
  });

  return {
    success: true,
    orderId,
    orderNumber: result.order_number as string,
    invoiceNumber: outInvoiceNumber,
    invoiceId,
  };
}
