import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { ProtectedRoute, useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { z } from "zod";
import { createPaymentIntent, createOrder, updatePaymentIntent } from "@/lib/payments";
import { StripePaymentForm } from "@/payments/hooks/useStripeCheckout";
import { PayPalPayment } from "@/components/payment/PayPalPayment";
import type { CheckoutItem, CheckoutAddress, PaymentResult } from "@/payments/types";
import { getProductPriceInfo } from "@/lib/products";
import { ProductPrice } from "@/components/site/ProductPrice";
import { CheckoutSkeleton } from "@/payments/CheckoutSkeleton";

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, string | undefined>): {
    success?: string;
    canceled?: string;
    payment_intent?: string;
    redirect_status?: string;
  } => ({
    success: search.success,
    canceled: search.canceled,
    payment_intent: search.payment_intent,
    redirect_status: search.redirect_status,
  }),
  head: () => ({ meta: [{ title: "Checkout — ANORA" }] }),
  component: CheckoutPage,
});

const emptyAddress: CheckoutAddress = {
  firstName: "", lastName: "", line1: "", line2: "", city: "", state: "",
  postalCode: "", country: "US", phone: "",
};

// Module-level cache for reusing valid PaymentIntents
let cachedClientSecret: string | null = null;
let cachedCartHash: string | null = null;
let cachedCheckoutRequestId: string | null = null;

function getFormValue(form: HTMLFormElement, name: string): string {
  return (form.elements.namedItem(name) as HTMLInputElement | null)?.value ?? "";
}

function readAddressFromForm(form: HTMLFormElement) {
  return {
    firstName: getFormValue(form, "firstName"),
    lastName: getFormValue(form, "lastName"),
    line1: getFormValue(form, "address"),
    line2: getFormValue(form, "address2"),
    city: getFormValue(form, "city"),
    state: getFormValue(form, "state"),
    postalCode: getFormValue(form, "postalCode"),
    country: getFormValue(form, "country"),
    phone: getFormValue(form, "phone"),
  };
}

class StripeErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error: Error) => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Stripe payment element rendering error caught by boundary:", error, errorInfo);
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

export function CheckoutForm() {
  const cart = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, canceled, payment_intent, redirect_status } = Route.useSearch();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [email, setEmail] = useState(() => user?.email ?? "");
  const [billingSame, setBillingSame] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [activeStep, setActiveStep] = useState<"email" | "shipping" | "payment">("email");
  const [completedSteps, setCompletedSteps] = useState({
    email: false,
    shipping: false,
  });
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express" | "intl">("standard");

  const shippingOptions = useMemo(() => [
    { id: "standard" as const, label: "Standard Shipping", time: "5–7 Business Days", price: "Complimentary" },
    { id: "express" as const, label: "Express Delivery", time: "2–4 Business Days", price: "$20.00" },
    { id: "intl" as const, label: "International Shipping", time: "5–10 Business Days", price: "$12.00" },
  ], []);

  const handleEmailContinue = useCallback(() => {
    const emailResult = z.string().email().safeParse(email);
    if (!emailResult.success) {
      toast.error("Please enter a valid email address");
      return;
    }
    setCompletedSteps((prev) => ({ ...prev, email: true }));
    setActiveStep("shipping");
  }, [email]);

  const handleShippingContinue = useCallback(() => {
    if (!formRef.current) return;
    const firstName = getFormValue(formRef.current, "firstName");
    const lastName = getFormValue(formRef.current, "lastName");
    const address = getFormValue(formRef.current, "address");
    const city = getFormValue(formRef.current, "city");
    const postalCode = getFormValue(formRef.current, "postalCode");
    const country = getFormValue(formRef.current, "country");
    const phone = getFormValue(formRef.current, "phone");

    if (!firstName || !lastName || !address || !city || !postalCode || !country || !phone) {
      toast.error("Please fill in all required shipping address fields");
      return;
    }

    setCompletedSteps((prev) => ({ ...prev, shipping: true }));
    setActiveStep("payment");
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cartHash = useMemo(() => {
    return cart.items.map((i) => `${i.productId}:${i.variantId || ""}:${i.size}:${i.quantity}`).join(",");
  }, [cart.items]);

  // Validate cart stock on checkout mount/update to prevent overselling
  useEffect(() => {
    if (cart.items.length > 0) {
      const originalItemsStr = JSON.stringify(
        cart.items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          size: i.size,
          quantity: i.quantity,
        }))
      );
      
      const checkAndWarn = async () => {
        const validated = await cart.validateCartStock();
        const validatedStr = JSON.stringify(
          validated.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            size: i.size,
            quantity: i.quantity,
          }))
        );
        if (originalItemsStr !== validatedStr) {
          toast.error("Some items are no longer available. Your cart has been updated automatically.");
        }
      };
      
      void checkAndWarn();
    }
  }, [cartHash]);

  const [submitting, setSubmitting] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<string>("");
  const [clientSecret, setClientSecret] = useState<string | null>(() => {
    return cachedCartHash === cartHash ? cachedClientSecret : null;
  });
  const [stripeLoadFailed, setStripeLoadFailed] = useState(false);
  const [orderCreating, setOrderCreating] = useState(false);
  const orderAttempted = useRef(false);
  const checkoutRequestId = useRef(
    cachedCartHash === cartHash && cachedCheckoutRequestId
      ? cachedCheckoutRequestId
      : crypto.randomUUID()
  );

  const [confirmHandler, setConfirmHandler] = useState<
    | ((
      cs: string,
      returnUrl: string,
    ) => Promise<{
      error?: { message?: string };
      paymentIntent?: { id: string; status: string };
    }>)
    | null
  >(null);

  // Handle 3DS redirect return / redirect success callback
  useEffect(() => {
    if (
      success === "1" &&
      payment_intent &&
      redirect_status === "succeeded" &&
      !orderAttempted.current
    ) {
      orderAttempted.current = true;
      setOrderCreating(true);

      supabase.auth.getSession().then(async ({ data: sessionData }) => {
        const accessToken = sessionData.session?.access_token || undefined;
        try {
          const order = await createOrder({ data: { paymentIntentId: payment_intent, accessToken } });
          if (order.success) {
            cart.clear();
            navigate({ to: "/order/success", search: { orderNumber: order.orderNumber ?? "", invoiceNumber: order.invoiceNumber ?? "", orderId: order.orderId ?? "" } });
          } else {
            toast.error(order.error ?? "Order could not be created. Please contact support.");
            setOrderCreating(false);
          }
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Order could not be created. Please contact support.");
          setOrderCreating(false);
        }
      });
    }
  }, [success, payment_intent, redirect_status, navigate, cart]);

  useEffect(() => {
    if (success === "1" && !payment_intent) {
      navigate({ to: "/order/success", search: { orderNumber: "", invoiceNumber: "", orderId: "" } });
    }
  }, [success, payment_intent, navigate]);


  // Sync email with logged in user
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  // Reset clientSecret if cart items change, to force recreation of PaymentIntent with new amount/items
  useEffect(() => {
    if (cachedCartHash !== cartHash) {
      setClientSecret(null);
      cachedClientSecret = null;
      cachedCartHash = null;
      cachedCheckoutRequestId = null;
    }
  }, [cartHash]);

  // Auto-initialize Stripe PaymentIntent on page load or when valid email is entered
  useEffect(() => {
    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      setStripeLoadFailed(true);
      return;
    }

    const isEmailValid = z.string().email().safeParse(email).success;
    if (cart.items.length === 0 || !isEmailValid || clientSecret) return;

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token || undefined;

        // Create a unique idempotency key for this email and cart state
        const cartItemsHash = cart.items.map(i => `${i.productId}-${i.variantId ?? "none"}-${i.size}-${i.quantity}`).join("|");
        const cleanEmail = email.replace(/[^a-zA-Z0-9]/g, "");
        const cleanCart = cartItemsHash.replace(/[^a-zA-Z0-9]/g, "");
        const idempotencyKey = `init-${checkoutRequestId.current}-${cleanEmail}-${cleanCart}`.substring(0, 100);

        const result = await createPaymentIntent({
          data: {
            accessToken,
            email,
            items: cart.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId ?? null,
              size: item.size,
              quantity: item.quantity,
            })),
            shippingAddress: emptyAddress,
            billingAddress: emptyAddress,
            checkoutRequestId: checkoutRequestId.current,
            idempotencyKey,
          },
        });
        setClientSecret(result.clientSecret);
        cachedClientSecret = result.clientSecret;
        cachedCartHash = cartHash;
        cachedCheckoutRequestId = checkoutRequestId.current;
      } catch (err) {
        console.error("PaymentIntent initialization failed:", err);
        setStripeLoadFailed(true);
      }
    };

    init();
  }, [cartHash, email, clientSecret]);

  const handleConfirmReady = useCallback((fn: Exclude<typeof confirmHandler, null>) => {
    setConfirmHandler(() => fn);
  }, []);

  const handleStripeSubmit = async () => {
    if (submitting) return;
    if (!clientSecret || !confirmHandler) {
      toast.error("Payment methods are still loading. Please wait a moment.");
      return;
    }
    setSubmitting(true);
    setCheckoutStep("Preparing Order...");

    try {
      if (!formRef.current) throw new Error("Form not found");
      const email = getFormValue(formRef.current, "email");
      const { shippingAddress, billingAddress } = getAddress();

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token || undefined;

      setCheckoutStep("Verifying Cart...");
      const piId = clientSecret.split("_secret_")[0];
      await updatePaymentIntent({
        data: {
          paymentIntentId: piId,
          email,
          accessToken,
          shippingAddress,
          billingAddress,
        },
      });

      setCheckoutStep("Initializing Secure Payment...");
      const returnUrl = `${window.location.origin}/checkout?success=1`;
      setCheckoutStep("Verifying Payment...");
      const confirmResult = await confirmHandler(clientSecret, returnUrl);

      if (confirmResult.error) {
        toast.error(confirmResult.error.message ?? "Payment could not be processed.");
        setSubmitting(false);
        setCheckoutStep("");
      } else if (confirmResult.paymentIntent) {
        setOrderCreating(true);
        setCheckoutStep("Creating Order...");
        const order = await createOrder({
          data: { paymentIntentId: confirmResult.paymentIntent.id, accessToken },
        });
        if (order.success) {
          setCheckoutStep("Order Confirmed");
          cachedClientSecret = null;
          cachedCartHash = null;
          cachedCheckoutRequestId = null;
          cart.clear();
          navigate({ to: "/order/success", search: { orderNumber: order.orderNumber ?? "", invoiceNumber: order.invoiceNumber ?? "", orderId: order.orderId ?? "" } });
        } else {
          toast.error(order.error ?? "Order could not be created. Please contact support.");
          setSubmitting(false);
          setOrderCreating(false);
          setCheckoutStep("");
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to complete payment. Please try again.");
      setSubmitting(false);
      setCheckoutStep("");
    }
  };

  const handlePayPalSuccess = useCallback((result: PaymentResult) => {
    cart.clear();
    navigate({ to: "/order/success", search: { orderNumber: result.orderNumber ?? "", invoiceNumber: result.invoiceNumber ?? "", orderId: result.orderId ?? "" } });
  }, [navigate, cart]);

  const handlePayPalError = useCallback((error: string) => {
    toast.error(error);
  }, []);

  const getAddress = useCallback(() => {
    if (!formRef.current) return { shippingAddress: emptyAddress, billingAddress: emptyAddress };
    const addr = readAddressFromForm(formRef.current);
    const billingAddr = billingSame
      ? addr
      : {
        firstName: addr.firstName, lastName: addr.lastName, line1: getFormValue(formRef.current, "billingAddress"),
        line2: "", city: getFormValue(formRef.current, "billingCity"), state: "",
        postalCode: getFormValue(formRef.current, "billingPostalCode"), country: getFormValue(formRef.current, "billingCountry"), phone: addr.phone,
      };
    return {
      shippingAddress: addr,
      billingAddress: billingAddr,
    };
  }, [billingSame]);

  const total = cart.subtotal;

  if (!isMounted || cart.isRestoring) {
    return (
      <div className="px-5 lg:px-10 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="eyebrow">Secure Checkout</span>
          <h1 className="font-serif text-5xl mt-3">Checkout</h1>
        </div>
        <CheckoutSkeleton />
      </div>
    );
  }

  if (success === "1" && orderCreating) {
    return (
      <div className="px-6 py-24 text-center max-w-md mx-auto">
        <h1 className="font-serif text-4xl">Payment Successful</h1>
        <p className="text-muted-foreground mt-4">Creating your order...</p>
      </div>
    );
  }

  if (canceled === "1") {
    return (
      <div className="px-6 py-24 text-center max-w-md mx-auto">
        <h1 className="font-serif text-4xl">Payment Canceled</h1>
        <p className="text-muted-foreground mt-4">Your payment was not completed. Your cart items are still saved.</p>
        <Link to="/checkout" className="mt-8 inline-block text-[11px] tracking-[0.32em] uppercase hover-underline">Try Again</Link>
      </div>
    );
  }

  if (cart.detailed.length === 0) {
    return (
      <div className="px-6 py-24 text-center max-w-md mx-auto">
        <h1 className="font-serif text-4xl">Your bag is empty</h1>
        <Link to="/shop" className="mt-6 inline-block text-[11px] tracking-[0.32em] uppercase hover-underline">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="px-5 lg:px-10 py-16 max-w-7xl mx-auto font-sans bg-background">
      <div className="text-left mb-12 border-b border-border/30 pb-6 flex items-center justify-between">
        <div>
          <h1 className="font-brand text-3xl tracking-[0.18em] uppercase text-foreground leading-none">Checkout</h1>
        </div>
        <Link to="/cart" className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors">
          ← Back to Bag
        </Link>
      </div>

      <form
        ref={formRef}
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const emailVal = getFormValue(form, "email");
          const emailResult = z.string().email().safeParse(emailVal);
          if (!emailResult.success) { toast.error("Please enter a valid email address"); return; }

          await handleStripeSubmit();
        }}
        className="grid lg:grid-cols-[1.6fr_1fr] gap-12 lg:gap-20 items-start"
      >
        <div className="space-y-8">
          {/* ─── STEP 1: ENTER EMAIL ─── */}
          <div className="space-y-4">
            {activeStep !== "email" && completedSteps.email ? (
              <div className="bg-neutral/40 border border-border/40 rounded-lg p-6 flex items-center justify-between transition-all duration-300">
                <div className="flex items-center gap-3.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/80 font-bold">ENTER EMAIL</div>
                    <div className="text-sm font-semibold text-foreground mt-0.5">{email}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStep("email")}
                  className="text-muted-foreground hover:text-foreground p-2 transition-colors focus:outline-none"
                  title="Edit Email"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="bg-background border border-border rounded-lg p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-border/30 pb-4">
                  <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold font-sans">1</div>
                  <h2 className="text-sm tracking-[0.2em] font-bold uppercase text-foreground">ENTER EMAIL</h2>
                </div>
                <div className="space-y-4 max-w-xl">
                  <Input 
                    label="Email Address" 
                    name="email" 
                    type="email" 
                    required 
                    placeholder="your.email@example.com"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleEmailContinue}
                      className="h-12 px-8 bg-foreground text-background text-xs tracking-[0.2em] uppercase font-bold rounded-md hover:bg-gold hover:text-ink transition-all duration-300"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ─── STEP 2: SHIPPING ADDRESS ─── */}
          <div className="space-y-4">
            {!completedSteps.email ? (
              <div className="bg-neutral/10 border border-border/20 rounded-lg p-6 opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-neutral text-muted-foreground/60 flex items-center justify-center text-xs font-bold">2</div>
                  <h2 className="text-sm tracking-[0.2em] font-semibold uppercase text-muted-foreground/70">SHIPPING ADDRESS</h2>
                </div>
              </div>
            ) : activeStep !== "shipping" && completedSteps.shipping ? (
              <div className="bg-neutral/40 border border-border/40 rounded-lg p-6 flex items-center justify-between transition-all duration-300">
                <div className="flex items-center gap-3.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/80 font-bold">SHIPPING ADDRESS</div>
                    <div className="text-sm font-semibold text-foreground mt-1">
                      {formRef.current ? `${getFormValue(formRef.current, "firstName")} ${getFormValue(formRef.current, "lastName")}` : ""}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {formRef.current ? `${getFormValue(formRef.current, "address")}${getFormValue(formRef.current, "address2") ? ", " + getFormValue(formRef.current, "address2") : ""}, ${getFormValue(formRef.current, "city")}, ${getFormValue(formRef.current, "postalCode")}` : ""}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Phone: {formRef.current ? getFormValue(formRef.current, "phone") : ""}
                    </div>
                    <div className="text-xs text-muted-foreground/75 mt-0.5">
                      Method: {shippingOptions.find(o => o.id === shippingMethod)?.label} ({shippingOptions.find(o => o.id === shippingMethod)?.price})
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStep("shipping")}
                  className="text-muted-foreground hover:text-foreground p-2 transition-colors focus:outline-none"
                  title="Edit Shipping"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="bg-background border border-border rounded-lg p-8 shadow-sm space-y-8 animate-fade-up">
                <div className="flex items-center gap-3 border-b border-border/30 pb-4">
                  <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold">2</div>
                  <h2 className="text-sm tracking-[0.2em] font-bold uppercase text-foreground">SHIPPING ADDRESS</h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/80 font-bold">Customer Details</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input label="First name" name="firstName" required />
                      <Input label="Last name" name="lastName" required />
                    </div>
                    <Input label="Mobile Number" name="phone" type="tel" required placeholder="+1 (555) 000-0000" />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/80 font-bold">Address Details</h3>
                    <Input label="Street Address" name="address" required placeholder="123 Main St" />
                    <Input label="House / Apartment Number" name="address2" placeholder="Apt, Suite, Unit" />
                    <div className="grid sm:grid-cols-3 gap-4">
                      <Input label="City" name="city" required />
                      <Input label="State / Province" name="state" />
                      <Input label="Postal code" name="postalCode" required />
                    </div>
                    <Input label="Country" name="country" required defaultValue="United States" />
                  </div>

                  {/* Billing Address Option */}
                  <div className="space-y-4 pt-2">
                    <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={billingSame} 
                        onChange={(e) => setBillingSame(e.target.checked)} 
                        className="h-4.5 w-4.5 accent-foreground rounded border-border" 
                      />
                      <span className="text-sm font-medium text-foreground">Same as shipping address</span>
                    </label>
                    {!billingSame && (
                      <div className="space-y-4 animate-fade-up pl-1.5 border-l border-border mt-3">
                        <Input label="Billing address" name="billingAddress" required />
                        <div className="grid sm:grid-cols-3 gap-4">
                          <Input label="City" name="billingCity" required />
                          <Input label="Postal code" name="billingPostalCode" required />
                          <Input label="Country" name="billingCountry" required />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Shipping Methods */}
                  <div className="space-y-4 pt-4 border-t border-border/45">
                    <h3 className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/80 font-bold">Shipping Method</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {shippingOptions.map((opt) => {
                        const isSel = shippingMethod === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => setShippingMethod(opt.id)}
                            className={`border p-4 rounded-lg cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                              isSel
                                ? "border-foreground bg-foreground/[0.02] shadow-sm ring-1 ring-foreground/10"
                                : "border-border hover:border-foreground/50 hover:bg-neutral/10"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3.5">
                              <span className="text-xs font-bold text-foreground tracking-wide">{opt.label}</span>
                              <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${isSel ? "border-foreground" : "border-border"}`}>
                                {isSel && <div className="h-2.5 w-2.5 rounded-full bg-foreground" />}
                              </div>
                            </div>
                            <div>
                              <p className="text-[11px] text-muted-foreground">{opt.time}</p>
                              <p className="text-xs font-semibold text-foreground mt-1.5">{opt.price}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleShippingContinue}
                      className="h-12 px-8 bg-foreground text-background text-xs tracking-[0.2em] uppercase font-bold rounded-md hover:bg-gold hover:text-ink transition-all duration-300"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ─── STEP 3: PAYMENT ─── */}
          <div className="space-y-4">
            {!completedSteps.shipping ? (
              <div className="bg-neutral/10 border border-border/20 rounded-lg p-6 opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-neutral text-muted-foreground/60 flex items-center justify-center text-xs font-bold">3</div>
                  <h2 className="text-sm tracking-[0.2em] font-semibold uppercase text-muted-foreground/70">PAYMENT</h2>
                </div>
              </div>
            ) : (
              <div className="bg-background border border-border rounded-lg p-8 shadow-sm space-y-6 animate-fade-up">
                <div className="flex items-center gap-3 border-b border-border/30 pb-4">
                  <div className="w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold">3</div>
                  <h2 className="text-sm tracking-[0.2em] font-bold uppercase text-foreground">PAYMENT</h2>
                </div>

                <div className="space-y-4">
                  <div className="border border-border rounded-lg p-6 bg-neutral/10">
                    <StripeErrorBoundary onError={() => setStripeLoadFailed(true)}>
                      <StripePaymentForm
                        stripeKey={import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""}
                        total={total}
                        clientSecret={clientSecret}
                        onConfirmReady={handleConfirmReady}
                      />
                    </StripeErrorBoundary>
                  </div>

                  <div className="my-8 flex items-center justify-between gap-4">
                    <div className="h-px bg-border/40 flex-1" />
                    <span className="text-[10px] tracking-widest text-muted-foreground uppercase font-bold">Or pay via PayPal</span>
                    <div className="h-px bg-border/40 flex-1" />
                  </div>

                  <div className="border border-border rounded-lg p-6 bg-neutral/10">
                    <PayPalPayment
                      items={cart.items as CheckoutItem[]}
                      email={email}
                      getAddress={getAddress}
                      onSuccess={handlePayPalSuccess}
                      onError={handlePayPalError}
                      submitting={submitting}
                      setSubmitting={setSubmitting}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">
          <div className="bg-neutral/40 border border-border/40 rounded-lg p-6 lg:p-8 space-y-6">
            <h2 className="text-xs tracking-[0.25em] uppercase text-foreground font-bold border-b border-border/40 pb-4">Order Summary</h2>
            <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
              {cart.detailed.map(({ item, product }) => {
                const variant = item.variantId ? product.colorVariants?.find((v: any) => v.id === item.variantId) : undefined;
                const itemImage = variant?.images?.[0] ?? product.images[0];
                const itemColor = variant?.color ?? product.color;
                const priceInfo = getProductPriceInfo(product, variant?.color);
                const unitPrice = priceInfo.salePrice;
                const unitComparePrice = priceInfo.isOnSale ? priceInfo.originalPrice : (variant?.comparePriceOverride !== undefined ? variant.comparePriceOverride : product.compare_price);

                return (
                  <div key={`${item.productId}-${item.variantId || ""}-${item.size}`} className="flex gap-4">
                    <img src={itemImage} alt={product.name} className="w-16 h-20 object-cover rounded-md border border-border/20 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-sm font-semibold truncate text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground/90 mt-1">Color: {itemColor}</p>
                      <p className="text-xs text-muted-foreground/90">Size: {item.size} · Qty: {item.quantity}</p>
                      <div className="mt-2.5">
                        <ProductPrice
                          product={{
                            ...product,
                            price: unitPrice * item.quantity,
                            compare_price: unitComparePrice ? unitComparePrice * item.quantity : null,
                          }}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="h-px bg-border/40" />

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${cart.subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>Complimentary</span>
              </div>
              <div className="h-px bg-border/40 my-3" />
              <div className="flex items-center justify-between text-foreground font-bold font-sans">
                <span className="text-xs tracking-[0.2em] uppercase">Total</span>
                <span className="font-serif text-xl">${total}</span>
              </div>
            </div>

            {activeStep === "payment" && (
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-foreground text-background h-12 text-xs tracking-[0.25em] uppercase font-bold rounded-md hover:bg-gold hover:text-ink hover:shadow-md transition-all duration-300 disabled:opacity-60 flex items-center justify-center"
              >
                {submitting ? checkoutStep || "Processing..." : "Place Order"}
              </button>
            )}
          </div>

          <div className="bg-neutral/20 border border-border/20 rounded-lg p-5 grid grid-cols-2 gap-4 text-center">
            {[
              { icon: "🔒", label: "Secure Checkout" },
              { icon: "🔑", label: "SSL Encrypted" },
              { icon: "🔄", label: "Easy Returns" },
              { icon: "💳", label: "Secure Payment" }
            ].map((badge) => (
              <div key={badge.label} className="flex flex-col items-center gap-1.5 p-2">
                <span className="text-lg">{badge.icon}</span>
                <span className="text-[10px] tracking-wider text-muted-foreground/90 font-medium uppercase">{badge.label}</span>
              </div>
            ))}
          </div>
        </aside>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <span className="gold-rule" />
        <h2 className="eyebrow">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Input({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block w-full">
      <span className="block text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-2 font-medium">{label}</span>
      <input 
        {...rest} 
        className="w-full h-12 bg-background border border-border/70 rounded-md px-4 text-sm outline-none focus:border-foreground focus:ring-1 focus:ring-foreground/10 transition-all duration-300 placeholder:text-muted-foreground/45" 
      />
    </label>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className={`${bold ? "font-bold text-foreground tracking-wide uppercase text-xs" : "text-muted-foreground"}`}>{label}</span>
      <span className={bold ? "font-serif text-lg font-bold text-foreground" : "text-muted-foreground"}>{value}</span>
    </div>
  );
}

function CheckoutPage() {
  return <CheckoutForm />;
}
