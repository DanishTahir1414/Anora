import { useRef, useEffect, memo } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { getStripePublishableKey } from "@/lib/payments";

// ── Stripe SDK — loaded once at module evaluation time ────────────────────
// The promise is cached so the Elements provider reuses it with zero extra
// network requests, regardless of how many times this module is imported.
const stripePromiseCache = new Map<string, Promise<Stripe | null>>();

export function getStripePromise(key: string): Promise<Stripe | null> {
  if (!stripePromiseCache.has(key)) {
    stripePromiseCache.set(key, loadStripe(key));
  }
  return stripePromiseCache.get(key)!;
}

// Eagerly start downloading stripe.js as soon as this chunk is imported.
const STRIPE_KEY = getStripePublishableKey();
if (STRIPE_KEY) getStripePromise(STRIPE_KEY);

// ── Types ─────────────────────────────────────────────────────────────────
export type ConfirmFn = (
  clientSecret: string,
  returnUrl: string,
) => Promise<{
  error?: { message?: string };
  paymentIntent?: { id: string; status: string };
}>;

// ── Inner form ────────────────────────────────────────────────────────────
// Registers the confirm handler once stripe + elements are ready.
// Memoised so it never remounts due to parent re-renders.
const StripeInnerForm = memo(function StripeInnerForm({
  onConfirmReady,
}: {
  onConfirmReady: (fn: ConfirmFn) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const registered = useRef(false);

  useEffect(() => {
    if (!stripe || !elements || registered.current) return;
    registered.current = true;
    onConfirmReady(async (clientSecret, returnUrl) => {
      const { error: submitError } = await elements.submit();
      if (submitError) return { error: submitError };
      return stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: { return_url: returnUrl },
        redirect: "if_required",
      });
    });
  }, [stripe, elements, onConfirmReady]);

  return (
    <PaymentElement options={{ layout: { type: "accordion" } }} />
  );
});

// ── Public component ──────────────────────────────────────────────────────
// Mounts the Elements provider with the given clientSecret.
// Memoised — only remounts when clientSecret changes.
export const StripePaymentForm = memo(function StripePaymentForm({
  stripeKey,
  clientSecret,
  onConfirmReady,
}: {
  stripeKey: string;
  clientSecret: string;
  onConfirmReady: (fn: ConfirmFn) => void;
}) {
  return (
    <Elements
      stripe={getStripePromise(stripeKey)}
      options={{ clientSecret, appearance: { theme: "stripe" } }}
    >
      <StripeInnerForm onConfirmReady={onConfirmReady} />
    </Elements>
  );
});
