import { useState, useEffect, useCallback, useRef, memo } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { getPayPalClientId, createPayPalOrder, capturePayPalOrder, createOrderFromPayPal } from "@/lib/payments";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { CheckoutItem, CheckoutAddress, PaymentResult } from "@/payments/types";

interface PayPalPaymentProps {
  items: CheckoutItem[];
  email: string;
  getAddress: () => { shippingAddress: CheckoutAddress; billingAddress: CheckoutAddress };
  onSuccess: (result: PaymentResult) => void;
  onError: (error: string) => void;
}

interface PendingOrderData {
  email: string;
  shippingAddress: CheckoutAddress;
  billingAddress: CheckoutAddress;
  items: CheckoutItem[];
}

// ── Module-level PayPal client ID cache ──────────────────────────────────
// The server round-trip to fetch the PayPal client ID is done once and
// cached for the lifetime of the page. Subsequent renders skip the network
// request entirely and use the cached value synchronously.
let paypalClientIdCache: string | null | undefined = undefined;
let paypalClientIdPromise: Promise<string | null> | null = null;

function fetchPayPalClientId(): Promise<string | null> {
  if (paypalClientIdPromise === null) {
    paypalClientIdPromise = getPayPalClientId().then((id) => {
      paypalClientIdCache = id || null;
      return paypalClientIdCache;
    });
  }
  return paypalClientIdPromise;
}

// Kick off PayPal client-ID fetch immediately when this module is imported
// so the result is (likely) already cached by the time the component mounts.
fetchPayPalClientId();

// ── Component ─────────────────────────────────────────────────────────────
// Memoised — PayPalScriptProvider only remounts when clientId changes
// (which never happens after the initial load).
export const PayPalPayment = memo(function PayPalPayment({
  items,
  email,
  getAddress,
  onSuccess,
  onError,
}: PayPalPaymentProps) {
  // Start with cached value if already available (avoids flash of skeleton)
  const [clientId, setClientId] = useState<string | null>(
    paypalClientIdCache !== undefined ? paypalClientIdCache : null,
  );
  const [sdkLoading, setSdkLoading] = useState(paypalClientIdCache === undefined);
  const pendingDataRef = useRef<PendingOrderData | null>(null);

  useEffect(() => {
    // Already resolved synchronously from cache — no effect needed
    if (paypalClientIdCache !== undefined) return;

    fetchPayPalClientId().then((id) => {
      setClientId(id);
      setSdkLoading(false);
    });
  }, []);

  const createOrder = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Your session expired. Please sign in again.");

    const { shippingAddress, billingAddress } = getAddress();

    pendingDataRef.current = {
      email,
      shippingAddress,
      billingAddress,
      items,
    };

    const result = await createPayPalOrder({
      data: {
        accessToken: session.access_token,
        email,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId ?? null,
          size: i.size ?? "",
          quantity: i.quantity,
        })),
        shippingAddress,
        billingAddress,
      },
    });
    return result.id;
  }, [items, email, getAddress]);

  const onApprove = useCallback(async (data: { orderID: string }) => {
    const pending = pendingDataRef.current;
    if (!pending) {
      onError("Session data not found. Please try again.");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        onError("Your session expired. Please sign in again.");
        return;
      }

      const captureResult = await capturePayPalOrder({
        data: { orderId: data.orderID },
      });

      if (captureResult.status !== "COMPLETED") {
        onError("PayPal payment could not be completed. Please try again.");
        return;
      }

      const result = await createOrderFromPayPal({
        data: {
          paypalOrderId: data.orderID,
          accessToken: session.access_token,
          email: pending.email,
          items: pending.items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId ?? null,
            size: i.size ?? "",
            quantity: i.quantity,
          })),
          shippingAddress: pending.shippingAddress,
          billingAddress: pending.billingAddress,
          paymentMethod: "paypal",
        },
      });

      if (result.success) {
        onSuccess(result);
      } else {
        onError(result.error ?? "Failed to create order");
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : "Payment could not be completed.");
    }
  }, [onSuccess, onError]);

  if (sdkLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-10 bg-neutral rounded-md" />
        <div className="h-10 bg-neutral rounded-md" />
      </div>
    );
  }

  if (!clientId) {
    return (
      <p className="text-xs text-red/70">
        PayPal is not configured. Please contact support.
      </p>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: "USD",
        intent: "capture",
        "enable-funding": "paypal,venmo,paylater,card",
        "disable-funding": "",
      }}
    >
      <PayPalButtons
        style={{
          layout: "vertical",
          shape: "rect",
          color: "gold",
          label: "paypal",
          tagline: false,
        }}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={() => {
          toast.error("PayPal encountered an error. Please try again.");
        }}
        onCancel={() => {
          toast.info("PayPal payment was cancelled.");
        }}
      />
      <p className="text-[10px] text-muted-foreground text-center mt-2 tracking-wider">
        PayPal • Credit • Debit • Venmo • Pay Later
      </p>
    </PayPalScriptProvider>
  );
});
