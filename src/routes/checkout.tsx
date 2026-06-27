import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ProtectedRoute, useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { createStripeCheckoutSession } from "@/lib/payments";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — ANORA" }] }),
  component: CheckoutPage,
});

function Checkout() {
  const cart = useCart();
  const { user } = useAuth();
  const [payment, setPayment] = useState("card");
  const [billingSame, setBillingSame] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ─── Checkout lock token ───────────────────────────────────
  // Generated once per page mount. Sent to server to lock the
  // cart state. Any cart change before submit invalidates it.
  const checkoutSessionToken = useRef(crypto.randomUUID()).current;
  const cartSnapshot = useRef(JSON.stringify(cart.items)).current;

  const shipping = 0;
  const total = cart.subtotal + shipping;

  if (cart.detailed.length === 0) {
    return (
      <div className="px-6 py-24 text-center max-w-md mx-auto">
        <h1 className="font-serif text-4xl">Your bag is empty</h1>
        <Link
          to="/shop"
          className="mt-6 inline-block text-[11px] tracking-[0.32em] uppercase hover-underline"
        >
          Continue Shopping
        </Link>
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
        onSubmit={async (e) => {
          e.preventDefault();
          if (!user) {
            toast.error("Please sign in to complete checkout");
            return;
          }

          // Read form data synchronously BEFORE any await — after the first
          // await, React's synthetic event sets currentTarget to null, causing
          // "Cannot read properties of null (reading 'elements')".
          const form = e.currentTarget;
          const val = (name: string) =>
            (form.elements.namedItem(name) as HTMLInputElement | null)?.value ?? "";

          setSubmitting(true);
          try {
            const { data } = await supabase.auth.getSession();
            const accessToken = data.session?.access_token;
            if (!accessToken) {
              throw new Error("Your session expired. Please sign in again.");
            }

            if (JSON.stringify(cart.items) !== cartSnapshot) {
              toast.error("Your bag has changed. Please review before checking out.");
              setSubmitting(false);
              return;
            }

            if (payment === "cod") {
              const response = await fetch("/api/checkout/cod", {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                  authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                  email: user.email ?? "",
                  checkoutSessionToken,
                  items: cart.items.map((item) => ({
                    productId: item.productId,
                    variantId: item.variantId ?? null,
                    size: item.size,
                    quantity: item.quantity,
                  })),
                  shippingAddress: {
                    firstName: val("firstName"),
                    lastName: val("lastName"),
                    line1: val("address"),
                    city: val("city"),
                    postalCode: val("postalCode"),
                    country: val("country"),
                    phone: val("phone"),
                  },
                  billingAddress: billingSame
                    ? undefined
                    : {
                        line1: val("billingAddress"),
                        city: val("billingCity"),
                        postalCode: val("billingPostalCode"),
                        country: val("billingCountry"),
                      },
                }),
              });

              if (!response.ok) {
                throw new Error(await response.text());
              }

              const codResult = (await response.json()) as {
                orderId: string;
                orderNumber: string;
                checkoutUrl: string;
              };
              cart.clear();
              toast.success(`Order ${codResult.orderNumber} placed!`, {
                description: "You'll pay upon delivery. We'll contact you with updates.",
              });
              window.location.assign(codResult.checkoutUrl);
              return;
            }

            const result = await createStripeCheckoutSession({
              accessToken,
              email: user.email ?? "",
              items: cart.items.map((item) => ({
                productId: item.productId,
                variantId: item.variantId ?? null,
                size: item.size,
                quantity: item.quantity,
              })),
              shippingAddress: {
                firstName: val("firstName"),
                lastName: val("lastName"),
                line1: val("address"),
                city: val("city"),
                postalCode: val("postalCode"),
                country: val("country"),
                phone: val("phone"),
              },
              billingAddress: billingSame
                ? undefined
                : {
                    line1: val("billingAddress"),
                    city: val("billingCity"),
                    postalCode: val("billingPostalCode"),
                    country: val("billingCountry"),
                  },
            });

            window.location.assign(result.checkoutUrl);
          } catch (error) {
            toast.error("Checkout could not start", {
              description: error instanceof Error ? error.message : "Please try again.",
            });
          } finally {
            setSubmitting(false);
          }
        }}
        className="grid lg:grid-cols-[1fr_360px] gap-12"
      >
        <div className="space-y-10">
          <Section title="Contact Information">
            <Input
              label="Email"
              name="email"
              type="email"
              required
              defaultValue={user?.email ?? ""}
            />
            <Input label="Phone" name="phone" type="tel" required />
          </Section>

          <Section title="Shipping Address">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="First name" name="firstName" required />
              <Input label="Last name" name="lastName" required />
            </div>
            <Input label="Address" name="address" required />
            <div className="grid sm:grid-cols-3 gap-4">
              <Input label="City" name="city" required />
              <Input label="Postal code" name="postalCode" required />
              <Input label="Country" name="country" required defaultValue="United States" />
            </div>
          </Section>

          <Section title="Billing Address">
            <label className="flex items-center gap-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={billingSame}
                onChange={(e) => setBillingSame(e.target.checked)}
                className="h-4 w-4 accent-foreground"
              />
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

          <Section title="Payment Method">
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { id: "card", label: "Credit Card" },
                { id: "paypal", label: "PayPal" },
                { id: "stripe", label: "Stripe" },
                { id: "cod", label: "Cash on Delivery" },
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPayment(m.id)}
                  className={`text-left px-5 py-4 border text-sm transition-colors ${
                    payment === m.id ? "border-foreground" : "border-border hover:border-foreground"
                  }`}
                >
                  <span className="block text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                    Method
                  </span>
                  <span className="font-serif text-lg">{m.label}</span>
                </button>
              ))}
            </div>
            {payment === "card" && (
              <div className="mt-5 space-y-4">
                <Input label="Card number" placeholder="•••• •••• •••• ••••" required />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Expiry" placeholder="MM / YY" required />
                  <Input label="CVC" required />
                </div>
              </div>
            )}
          </Section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="bg-neutral p-7">
            <p className="eyebrow mb-5">Order Summary</p>
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {cart.detailed.map(({ item, product }) => (
                <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-14 h-16 object-cover"
                  />
                  <div className="flex-1 text-sm">
                    <p className="font-serif text-base">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Size {item.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm">${product.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="h-px bg-border my-5" />
            <Row label="Subtotal" value={`$${cart.subtotal}`} />
            <Row label="Shipping" value="Complimentary" />
            <div className="h-px bg-border my-5" />
            <Row label="Total" value={`$${total}`} bold />
            <button
              disabled={submitting}
              className="mt-6 w-full bg-foreground text-background py-4 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink transition-colors disabled:opacity-60"
            >
              {submitting ? "Redirecting" : "Place Order"}
            </button>
            <p className="mt-3 text-[11px] text-center text-muted-foreground">
              By placing your order you agree to our Terms.
            </p>
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

function Input({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="block text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
        {label}
      </span>
      <input
        {...rest}
        className="w-full bg-background border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors"
      />
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
      <Checkout />
    </ProtectedRoute>
  );
}
