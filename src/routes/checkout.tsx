import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useCart } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — ANORA" }] }),
  component: Checkout,
});

function Checkout() {
  const cart = useCart();
  const [placed, setPlaced] = useState(false);
  const [payment, setPayment] = useState("card");
  const [billingSame, setBillingSame] = useState(true);

  const shipping = 0;
  const total = cart.subtotal + shipping;

  if (placed) {
    return (
      <div className="px-6 py-24 text-center max-w-md mx-auto">
        <span className="eyebrow text-gold">Order Confirmed</span>
        <h1 className="font-serif text-5xl mt-4">Thank you</h1>
        <p className="mt-5 text-muted-foreground">
          Your pieces are being prepared in our atelier. A confirmation has
          been sent to your email.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block bg-foreground text-background px-8 py-3 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink"
        >
          Return Home
        </Link>
      </div>
    );
  }

  if (cart.detailed.length === 0) {
    return (
      <div className="px-6 py-24 text-center max-w-md mx-auto">
        <h1 className="font-serif text-4xl">Your bag is empty</h1>
        <Link to="/shop" className="mt-6 inline-block text-[11px] tracking-[0.32em] uppercase hover-underline">
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
        onSubmit={(e) => {
          e.preventDefault();
          cart.clear();
          setPlaced(true);
          toast.success("Order placed");
        }}
        className="grid lg:grid-cols-[1fr_360px] gap-12"
      >
        <div className="space-y-10">
          <Section title="Contact Information">
            <Input label="Email" type="email" required />
            <Input label="Phone" type="tel" required />
          </Section>

          <Section title="Shipping Address">
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="First name" required />
              <Input label="Last name" required />
            </div>
            <Input label="Address" required />
            <div className="grid sm:grid-cols-3 gap-4">
              <Input label="City" required />
              <Input label="Postal code" required />
              <Input label="Country" required defaultValue="United States" />
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
                <Input label="Billing address" required />
                <div className="grid sm:grid-cols-3 gap-4">
                  <Input label="City" required />
                  <Input label="Postal code" required />
                  <Input label="Country" required />
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
                  <span className="block text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Method</span>
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
                  <img src={product.images[0]} alt={product.name} className="w-14 h-16 object-cover" />
                  <div className="flex-1 text-sm">
                    <p className="font-serif text-base">{product.name}</p>
                    <p className="text-xs text-muted-foreground">Size {item.size} · Qty {item.quantity}</p>
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
            <button className="mt-6 w-full bg-foreground text-background py-4 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink transition-colors">
              Place Order
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

function Input({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="block text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">{label}</span>
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
