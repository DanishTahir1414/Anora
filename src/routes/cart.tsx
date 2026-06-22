import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Bag — ANORA" }] }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const shipping = cart.subtotal > 0 ? 0 : 0;
  const total = Math.max(0, cart.subtotal - discount + shipping);

  if (cart.detailed.length === 0) {
    return (
      <div className="px-5 lg:px-10 py-24 text-center max-w-md mx-auto">
        <span className="eyebrow">Your Bag</span>
        <h1 className="font-serif text-4xl mt-4">Your bag is empty</h1>
        <p className="text-muted-foreground mt-3">
          Begin with a quiet piece from the atelier.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-block bg-foreground text-background px-8 py-3 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink transition-colors"
        >
          Discover the Atelier
        </Link>
      </div>
    );
  }

  return (
    <div className="px-5 lg:px-10 py-16 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <span className="eyebrow">Your Bag</span>
        <h1 className="font-serif text-5xl mt-3">Shopping Bag</h1>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-12">
        <div className="divide-y divide-border border-t border-b border-border">
          {cart.detailed.map(({ item, product }) => (
            <div key={`${item.productId}-${item.size}`} className="py-6 flex gap-5">
              <Link to="/product/$slug" params={{ slug: product.slug }} className="shrink-0">
                <img src={product.images[0]} alt={product.name} className="w-24 h-32 object-cover bg-neutral" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link to="/product/$slug" params={{ slug: product.slug }} className="font-serif text-xl hover:text-gold">
                      {product.name}
                    </Link>
                    <p className="text-[11px] tracking-[0.28em] uppercase text-muted-foreground mt-1">
                      Size {item.size} · {product.color}
                    </p>
                  </div>
                  <button onClick={() => cart.remove(item.productId, item.size)} aria-label="remove" className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <div className="flex items-center border border-border">
                    <button
                      onClick={() => cart.setQty(item.productId, item.size, item.quantity - 1)}
                      className="h-9 w-9 grid place-items-center hover:bg-neutral"
                      aria-label="decrease"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-10 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => cart.setQty(item.productId, item.size, item.quantity + 1)}
                      className="h-9 w-9 grid place-items-center hover:bg-neutral"
                      aria-label="increase"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="font-serif text-lg">${product.price * item.quantity}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="bg-neutral p-7">
            <p className="eyebrow mb-5">Order Summary</p>
            <Row label="Subtotal" value={`$${cart.subtotal}`} />
            <Row label="Shipping" value="Complimentary" />
            {discount > 0 && <Row label="Discount" value={`- $${discount}`} accent />}
            <div className="h-px bg-border my-5" />
            <Row label="Total" value={`$${total}`} bold />

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (code.trim().toUpperCase() === "ANORA10") {
                  setDiscount(Math.round(cart.subtotal * 0.1));
                  toast.success("Coupon applied", { description: "10% off your order" });
                } else {
                  setDiscount(0);
                  toast.error("Invalid coupon", { description: "Try ANORA10" });
                }
              }}
              className="mt-6 flex gap-2"
            >
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Coupon code"
                className="flex-1 px-3 py-3 bg-background border border-border text-sm outline-none focus:border-foreground"
              />
              <button className="px-5 text-[11px] tracking-[0.3em] uppercase bg-foreground text-background hover:bg-gold hover:text-ink transition-colors">
                Apply
              </button>
            </form>

            <Link
              to="/checkout"
              className="mt-5 block text-center bg-foreground text-background py-4 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink transition-colors"
            >
              Checkout
            </Link>
            <Link to="/shop" className="mt-3 block text-center text-[11px] tracking-[0.3em] uppercase hover-underline">
              Continue Shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className={`text-sm ${bold ? "eyebrow" : "text-muted-foreground"}`}>{label}</span>
      <span className={`${bold ? "font-serif text-xl" : "text-sm"} ${accent ? "text-gold" : ""}`}>{value}</span>
    </div>
  );
}
