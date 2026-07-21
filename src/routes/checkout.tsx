import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { ProtectedRoute, useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { z } from "zod";
import { createPaymentIntent, createOrder, updatePaymentIntent } from "@/lib/payments";
import { PaymentMethodList } from "@/components/payment/PaymentMethodList";
import { StripePaymentForm } from "@/payments/hooks/useStripeCheckout";
import { PayPalPayment } from "@/components/payment/PayPalPayment";
import { type PaymentMethodId } from "@/payments/types";
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

export function CheckoutForm() {
  const cart = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, canceled, payment_intent, redirect_status } = Route.useSearch();
  const [billingSame, setBillingSame] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>("stripe");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderCreating, setOrderCreating] = useState(false);
  const orderAttempted = useRef(false);
  const checkoutRequestId = useRef(crypto.randomUUID());
  const formRef = useRef<HTMLFormElement | null>(null);

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
        const accessToken = sessionData.session?.access_token;
        if (!accessToken) { navigate({ to: "/login" }); return; }
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

  // Auto-initialize Stripe PaymentIntent on page load
  useEffect(() => {
    if (cart.items.length === 0 || !user?.email || clientSecret) return;

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const result = await createPaymentIntent({
          data: {
            accessToken: session.access_token,
            email: user.email!,
            items: cart.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId ?? null,
              size: item.size,
              quantity: item.quantity,
            })),
            shippingAddress: emptyAddress,
            billingAddress: emptyAddress,
            checkoutRequestId: checkoutRequestId.current,
            idempotencyKey: `init-${checkoutRequestId.current}`,
          },
        });
        setClientSecret(result.clientSecret);
      } catch (err) {
        console.error("PaymentIntent initialization failed:", err);
      }
    };

    init();
  }, [cart.items, user?.email, clientSecret]);

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

    try {
      if (!formRef.current) throw new Error("Form not found");
      const email = getFormValue(formRef.current, "email");
      const { shippingAddress, billingAddress } = getAddress();

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("Please sign in to complete checkout");

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

      const returnUrl = `${window.location.origin}/checkout?success=1`;
      const confirmResult = await confirmHandler(clientSecret, returnUrl);

      if (confirmResult.error) {
        toast.error(confirmResult.error.message ?? "Payment could not be processed.");
        setSubmitting(false);
      } else if (confirmResult.paymentIntent) {
        setOrderCreating(true);
        const order = await createOrder({
          data: { paymentIntentId: confirmResult.paymentIntent.id, accessToken },
        });
        if (order.success) {
          cart.clear();
          navigate({ to: "/order/success", search: { orderNumber: order.orderNumber ?? "", invoiceNumber: order.invoiceNumber ?? "", orderId: order.orderId ?? "" } });
        } else {
          toast.error(order.error ?? "Order could not be created. Please contact support.");
          setSubmitting(false);
          setOrderCreating(false);
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to complete payment. Please try again.");
      setSubmitting(false);
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

  if (cart.isRestoring) {
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
    <div className="px-5 lg:px-10 py-16 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <span className="eyebrow">Secure Checkout</span>
        <h1 className="font-serif text-5xl mt-3">Checkout</h1>
      </div>

      <form
        ref={formRef}
        onSubmit={async (e) => {
          e.preventDefault();
          if (!user) { toast.error("Please sign in to complete checkout"); return; }
          const form = e.currentTarget;
          const email = getFormValue(form, "email");
          const emailResult = z.string().email().safeParse(email);
          if (!emailResult.success) { toast.error("Please enter a valid email address"); return; }

          if (selectedMethod === "stripe") {
            await handleStripeSubmit();
          }
        }}
        className="grid lg:grid-cols-[1fr_360px] gap-12"
      >
        <div className="space-y-10">
          <Section title="Contact Information">
            <Input label="Email" name="email" type="email" required defaultValue={user?.email ?? ""} />
            <Input label="Phone" name="phone" type="tel" required />
          </Section>

          <Section title="Shipping Address">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="First name" name="firstName" required />
              <Input label="Last name" name="lastName" required />
            </div>
            <Input label="Address" name="address" required />
            <Input label="Apartment, suite, etc." name="address2" />
            <div className="grid sm:grid-cols-3 gap-4">
              <Input label="City" name="city" required />
              <Input label="State" name="state" />
              <Input label="Postal code" name="postalCode" required />
            </div>
            <Input label="Country" name="country" required defaultValue="United States" />
          </Section>

          <Section title="Billing Address">
            <label className="flex items-center gap-3 text-sm cursor-pointer">
              <input type="checkbox" checked={billingSame} onChange={(e) => setBillingSame(e.target.checked)} className="h-4 w-4 accent-foreground" />
              Same as shipping address
            </label>
            {!billingSame && (
              <div className="mt-5 space-y-4">
                <Input label="Billing address" name="billingAddress" required />
                <div className="grid sm:grid-cols-3 gap-4">
                  <Input label="City" name="billingCity" required />
                  <Input label="Postal code" name="billingPostalCode" required />
                  <Input label="Country" name="billingCountry" required />
                </div>
              </div>
            )}
          </Section>

          <Section title="Choose Payment Method">
            <PaymentMethodList
              methods={["stripe", "paypal"]}
              selected={selectedMethod}
              onSelect={setSelectedMethod}
              disabled={submitting}
            />

            <div className={`mt-5${selectedMethod === "stripe" ? "" : " hidden"}`}>
              {clientSecret ? (
                <StripePaymentForm
                  stripeKey={import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""}
                  clientSecret={clientSecret}
                  onConfirmReady={handleConfirmReady}
                />
              ) : (
                <div className="space-y-3 animate-pulse">
                  <div className="h-11 bg-neutral rounded-md" />
                  <div className="h-11 bg-neutral rounded-md" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-11 bg-neutral rounded-md" />
                    <div className="h-11 bg-neutral rounded-md" />
                  </div>
                </div>
              )}
            </div>

            <div className={`mt-5${selectedMethod === "paypal" ? "" : " hidden"}`}>
              <PayPalPayment
                items={cart.items as CheckoutItem[]}
                email={user?.email ?? ""}
                getAddress={getAddress}
                onSuccess={handlePayPalSuccess}
                onError={handlePayPalError}
              />
            </div>
          </Section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="bg-neutral p-7">
            <p className="eyebrow mb-5">Order Summary</p>
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {cart.detailed.map(({ item, product }) => {
                const variant = item.variantId ? product.colorVariants?.find((v: any) => v.id === item.variantId) : undefined;
                const itemImage = variant?.images?.[0] ?? product.images[0];
                const itemColor = variant?.color ?? product.color;
                const priceInfo = getProductPriceInfo(product, variant?.color);
                const unitPrice = priceInfo.salePrice;
                const unitComparePrice = priceInfo.isOnSale ? priceInfo.originalPrice : (variant?.comparePriceOverride !== undefined ? variant.comparePriceOverride : product.compare_price);

                return (
                  <div key={`${item.productId}-${item.variantId || ""}-${item.size}`} className="flex gap-3">
                    <img src={itemImage} alt={product.name} className="w-14 h-16 object-cover" />
                    <div className="flex-1 text-sm">
                      <p className="font-serif text-base">{product.name}</p>
                      <p className="text-xs text-muted-foreground">Size {item.size} · {itemColor} · Qty {item.quantity}</p>
                    </div>
                    <ProductPrice
                      product={{
                        ...product,
                        price: unitPrice * item.quantity,
                        compare_price: unitComparePrice ? unitComparePrice * item.quantity : null,
                      }}
                      size="sm"
                    />
                  </div>
                );
              })}
            </div>
            <div className="h-px bg-border my-5" />
            <Row label="Subtotal" value={`$${cart.subtotal}`} />
            <Row label="Shipping" value="Complimentary" />
            <div className="h-px bg-border my-5" />
            <Row label="Total" value={`$${total}`} bold />
            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full bg-foreground text-background py-4 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink transition-colors disabled:opacity-60"
            >
              {submitting ? "Processing Payment..." : "Place Order"}
            </button>
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
    <label className="block">
      <span className="block text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">{label}</span>
      <input {...rest} className="w-full bg-background border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors" />
    </label>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className={`text-sm ${bold ? "eyebrow" : "text-muted-foreground"}`}>{label}</span>
      <span className={bold ? "font-serif text-xl" : "text-sm"}>{value}</span>
    </div>
  );
}

function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutForm />
    </ProtectedRoute>
  );
}
