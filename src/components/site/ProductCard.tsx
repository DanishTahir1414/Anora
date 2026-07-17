import { Link } from "@tanstack/react-router";
import { Heart, Eye, X, Minus, Plus } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/products";
import { useCart, useWishlist } from "@/lib/store";
import { getProductAvailability, validateStockBeforeCheckout } from "@/lib/inventory";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const wish = useWishlist();
  const cart = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickSize, setQuickSize] = useState(product.sizes[0]);
  const [quickQty, setQuickQty] = useState(1);
  const second = product.images[1] ?? product.images[0];

  const availability = getProductAvailability(product);
  const sizeStock = availability.sizeStock ?? {};
  const hasSizeStock = Object.keys(sizeStock).length > 0;
  const allOOS = hasSizeStock && availability.sizes.every((s) => (sizeStock[s] ?? 1) === 0);
  const isOOS = !availability.isAvailable || availability.stock === 0 || allOOS;

  return (
    <>
      <div className="group">
        <div className="relative overflow-hidden bg-neutral aspect-[3/4]">
          <Link to="/product/$slug" params={{ slug: product.slug }}>
            <img
              src={product.images[0]}
              alt={product.name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 group-hover:opacity-0"
            />
            <img
              src={second}
              alt=""
              loading="lazy"
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100 group-hover:scale-105"
            />
          </Link>

          {product.badge && !isOOS && (
            <span className="absolute top-3 left-3 text-[10px] tracking-[0.3em] uppercase bg-background/90 px-3 py-1.5 backdrop-blur">
              {product.badge}
            </span>
          )}

          {isOOS && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-[11px] tracking-[0.32em] uppercase text-foreground/70">
                Out of Stock
              </span>
            </div>
          )}

          <button
            aria-label="Add to wishlist"
            onClick={() => {
              const wasWishlisted = wish.has(product.id);
              wish.toggle(product.id);
              toast(wasWishlisted ? "Removed from Wishlist" : "Added to Wishlist");
            }}
            className="absolute top-3 right-3 h-9 w-9 grid place-items-center bg-background/90 backdrop-blur transition-all duration-300 hover:text-gold hover:scale-105"
          >
            <Heart className={`h-4 w-4 ${wish.has(product.id) ? "fill-gold text-gold" : ""}`} />
          </button>

          {!isOOS && (
            <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
              <button
                onClick={() => {
                  const chosen = size ?? product.sizes[0];
                  const validation = validateStockBeforeCheckout(product, {
                    productId: product.id,
                    size: chosen,
                    quantity: 1,
                    color: availability.color,
                  });
                  if (!validation.ok) {
                    toast.error(validation.reason ?? "This size is out of stock");
                    return;
                  }
                  cart.add(product.id, chosen, 1);
                  toast.success("Added to bag", { description: `${product.name} · ${chosen}` });
                }}
                className="flex-1 bg-foreground text-background py-3 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink transition-all duration-300"
              >
                Quick Add
              </button>
              <button
                onClick={() => {
                  setQuickSize(availability.sizes[0]);
                  setQuickQty(1);
                  setQuickOpen(true);
                }}
                aria-label="Quick view"
                className="w-11 bg-background/90 backdrop-blur grid place-items-center hover:text-gold transition-all duration-300 hover:scale-105"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="pt-4 flex items-start justify-between gap-3">
          <div>
            <Link
              to="/product/$slug"
              params={{ slug: product.slug }}
              className="font-serif text-lg leading-tight hover:text-gold transition-colors duration-300"
            >
              {product.name}
            </Link>
            <p className="text-[11px] tracking-[0.24em] uppercase text-muted-foreground mt-1">
              {product.subcategory}
            </p>
          </div>
          <span className="font-serif text-base shrink-0">${product.price}</span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {availability.sizes.map((s) => {
            const qty = sizeStock[s];
            const disabled = hasSizeStock && qty !== undefined && qty === 0;
            return (
              <button
                key={s}
                onClick={() => {
                  if (disabled) return;
                  setSize(s);
                }}
                className={`text-[11px] tracking-wider min-w-8 h-7 px-2 border transition-all duration-300 ${
                  size === s && !disabled
                    ? "border-foreground text-foreground"
                    : disabled
                      ? "border-border/40 text-border/50 line-through cursor-not-allowed"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Quick View Modal ─── */}
      {quickOpen && (
        <div
          onClick={() => setQuickOpen(false)}
          className="fixed inset-0 z-[70] bg-ink/40 backdrop-blur-sm animate-fade flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-background w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-luxe animate-fade-up grid md:grid-cols-2"
          >
            {/* Image */}
            <div className="aspect-[3/4] bg-neutral">
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="p-8 lg:p-10 flex flex-col justify-center relative">
              <button
                onClick={() => setQuickOpen(false)}
                aria-label="Close"
                className="absolute top-4 right-4 hover:text-gold transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {product.badge && <span className="eyebrow text-gold mb-2">{product.badge}</span>}
              <h2 className="font-serif text-3xl md:text-4xl">{product.name}</h2>
              <p className="text-[11px] tracking-[0.28em] uppercase text-muted-foreground mt-2">
                {product.subcategory} · SKU {product.sku}
              </p>
              <p className="font-serif text-2xl mt-5">${product.price}</p>

              <p className="text-sm text-muted-foreground mt-5 leading-relaxed">
                {product.description}
              </p>

              {/* Sizes */}
              <div className="mt-6">
                <p className="eyebrow mb-3">Size</p>
                <div className="flex flex-wrap gap-2">
                  {availability.sizes.map((s) => {
                    const qty = sizeStock[s];
                    const disabled = hasSizeStock && qty !== undefined && qty === 0;
                    return (
                      <button
                        key={s}
                        onClick={() => {
                          if (disabled) return;
                          setQuickSize(s);
                        }}
                        className={`min-w-10 h-10 px-3 text-sm border transition-all duration-300 ${
                          quickSize === s && !disabled
                            ? "border-foreground bg-foreground text-background"
                            : disabled
                              ? "border-border/40 text-border/50 line-through cursor-not-allowed"
                              : "border-border hover:border-foreground"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity + Add */}
              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center border border-border">
                  <button
                    aria-label="decrease"
                    onClick={() => setQuickQty((q) => Math.max(1, q - 1))}
                    className="h-10 w-10 grid place-items-center hover:bg-neutral transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm">{quickQty}</span>
                  <button
                    aria-label="increase"
                    onClick={() => setQuickQty((q) => q + 1)}
                    className="h-10 w-10 grid place-items-center hover:bg-neutral transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  const validation = validateStockBeforeCheckout(product, {
                    productId: product.id,
                    size: quickSize,
                    quantity: quickQty,
                    color: availability.color,
                  });
                  if (!validation.ok) {
                    toast.error(validation.reason ?? "This size is out of stock");
                    return;
                  }
                  cart.add(product.id, quickSize, quickQty);
                  toast.success("Added to bag", {
                    description: `${product.name} · ${quickSize} · Qty ${quickQty}`,
                  });
                  setQuickOpen(false);
                }}
                className="mt-6 w-full bg-foreground text-background py-4 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink transition-all duration-300"
              >
                Add to Bag — ${(product.price * quickQty).toLocaleString()}.00
              </button>

              <Link
                to="/product/$slug"
                params={{ slug: product.slug }}
                onClick={() => setQuickOpen(false)}
                className="mt-4 text-center text-[11px] tracking-[0.28em] uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                Full Details
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
