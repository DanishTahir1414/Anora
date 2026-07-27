import { Link } from "@tanstack/react-router";
import { Heart, Eye, X, Minus, Plus } from "lucide-react";
import { useState, useMemo } from "react";
import { getProductPriceInfo, type Product } from "@/lib/products";
import { ProductPrice } from "./ProductPrice";
import { useCart, useWishlist } from "@/lib/store";
import { getProductAvailability, validateStockBeforeCheckout } from "@/lib/inventory";
import { toast } from "sonner";

export function ProductCard({ product }: { product: Product }) {
  const priceInfo = getProductPriceInfo(product);
  const wish = useWishlist();
  const cart = useCart();
  const second = product.images[1] ?? product.images[0];

  const activeColor = useMemo(() => {
    if (!product.colorVariants || product.colorVariants.length === 0) return product.color;
    const baseAvailability = getProductAvailability(product);
    const availableVariant = baseAvailability.colorVariants.find((v) => v.isAvailable);
    return availableVariant?.color ?? product.colorVariants[0]?.color ?? product.color;
  }, [product.color, product.colorVariants]);

  const availability = useMemo(() => {
    return getProductAvailability(product, activeColor);
  }, [product, activeColor]);

  const sizeStock = availability.sizeStock ?? {};
  const hasSizeStock = Object.keys(sizeStock).length > 0;
  const allOOS = hasSizeStock && availability.sizes.every((s) => (sizeStock[s] ?? 1) === 0);
  const isOOS = !availability.isAvailable || availability.stock === 0 || allOOS;

  const firstAvailableSize = useMemo(() => {
    if (isOOS) return null;
    return availability.sizes.find((s) => {
      const qty = sizeStock[s];
      const disabled = hasSizeStock && qty !== undefined && qty === 0;
      return !disabled;
    }) ?? null;
  }, [availability.sizes, sizeStock, hasSizeStock, isOOS]);

  const [size, setSize] = useState<string | null>(firstAvailableSize);
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickSize, setQuickSize] = useState(firstAvailableSize ?? product.sizes[0]);
  const [quickQty, setQuickQty] = useState(1);

  const activeVariantId = useMemo(() => {
    return availability.selectedVariant?.id ?? product.colorVariants?.[0]?.id;
  }, [availability.selectedVariant, product.colorVariants]);

  return (
    <>
      <div className="group">
        <div className="relative overflow-hidden bg-neutral aspect-[2/3] sm:aspect-[3/4]">
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

          {!isOOS && (product.badge || (priceInfo.isOnSale && priceInfo.discountPercent > 0)) && (
            <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 z-10">
              {product.badge && (
                <span className="text-[10px] tracking-[0.3em] uppercase bg-background/90 px-3 py-1.5 backdrop-blur text-gold font-semibold rounded-[1px]">
                  {product.badge}
                </span>
              )}
              {priceInfo.isOnSale && priceInfo.discountPercent > 0 && (
                <span className="text-[9px] tracking-[0.18em] uppercase border border-gold/30 text-gold bg-background/95 px-2.5 py-1.5 backdrop-blur font-semibold rounded-full shadow-sm leading-none">
                  {priceInfo.badgeText}
                </span>
              )}
            </div>
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
            className="absolute top-3 right-3 h-9 w-9 grid place-items-center transition-colors duration-300 hover:text-gold text-foreground z-10 group/wishlist"
          >
            <Heart className={`h-[20px] w-[20px] transition-all duration-300 group-hover/wishlist:fill-gold group-hover/wishlist:text-gold ${wish.has(product.id) ? "fill-gold text-gold" : "text-foreground"}`} />
          </button>

          {!isOOS && (
            <div className="absolute inset-x-3 bottom-3 hidden sm:flex gap-2 transition-all duration-500 opacity-100 translate-y-0 lg:opacity-0 lg:translate-y-2 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 z-20">
              <button
                onClick={() => {
                  const chosen = size;
                  if (!chosen) {
                    toast.error("Please select a size first");
                    return;
                  }
                  if (!product.sizes.includes(chosen)) {
                    if (process.env.NODE_ENV === "development") {
                      console.error(`Validation Failure: Selected size "${chosen}" does not exist on product.`, product);
                    }
                    return;
                  }
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
                  const activeVariant = product.colorVariants?.find((v) => v.color === availability.color) ?? { sku: product.sku };
                  const targetSku = activeVariant.sku ?? product.sku;
                  if (!targetSku) {
                    if (process.env.NODE_ENV === "development") {
                      console.error("Validation Failure: Product SKU does not exist.", product);
                    }
                    return;
                  }
                  cart.add(product.id, chosen, 1, activeVariantId);
                  toast.success("Added to bag", { description: `${product.name} · ${chosen}` });
                }}
                className="flex-1 bg-foreground text-background py-3 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink transition-all duration-300"
              >
                Quick Add
              </button>
              <button
                onClick={() => {
                  setQuickSize(firstAvailableSize ?? availability.sizes[0] ?? product.sizes[0]);
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

        <div className="pt-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
          <div className="min-w-0">
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
          <div className="flex flex-row sm:flex-col items-baseline sm:items-end gap-2 sm:gap-0 shrink-0 mt-1 sm:mt-0 flex-wrap">
            <ProductPrice product={product} size="md" />
          </div>
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
                className={`text-[10px] sm:text-[11px] tracking-wider min-w-6 h-6 px-1.5 sm:min-w-8 sm:h-7 sm:px-2 border transition-all duration-300 ${
                  size === s && !disabled
                    ? "border-foreground text-foreground"
                    : disabled
                      ? "border-border/40 text-border/50 line-through diagonal-strike cursor-not-allowed"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>

        {!isOOS && (
          <button
            onClick={() => {
              const chosen = size;
              if (!chosen) {
                toast.error("Please select a size first");
                return;
              }
              if (!product.sizes.includes(chosen)) {
                if (process.env.NODE_ENV === "development") {
                  console.error(`Validation Failure: Selected size "${chosen}" does not exist on product.`, product);
                }
                return;
              }
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
              const activeVariant = product.colorVariants?.find((v) => v.color === availability.color) ?? { sku: product.sku };
              const targetSku = activeVariant.sku ?? product.sku;
              if (!targetSku) {
                if (process.env.NODE_ENV === "development") {
                  console.error("Validation Failure: Product SKU does not exist.", product);
                }
                return;
              }
              cart.add(product.id, chosen, 1, activeVariantId);
              toast.success("Added to bag", { description: `${product.name} · ${chosen}` });
            }}
            className="sm:hidden mt-3 w-full bg-foreground text-background py-3 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink transition-all duration-300"
          >
            Add to Cart
          </button>
        )}
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
              <h1 className="font-serif text-3xl font-light text-foreground">{product.name}</h1>
              <p className="text-xs text-muted-foreground tracking-widest uppercase mt-1">
                {product.subcategory}
              </p>
              <ProductPrice product={product} size="lg" className="mt-5" />

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
                              ? "border-border/40 text-border/50 line-through diagonal-strike cursor-not-allowed"
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
                  const chosen = quickSize;
                  if (!chosen) {
                    toast.error("Please select a size first");
                    return;
                  }
                  if (!product.sizes.includes(chosen)) {
                    if (process.env.NODE_ENV === "development") {
                      console.error(`Validation Failure: Selected size "${chosen}" does not exist on product.`, product);
                    }
                    return;
                  }
                  if (quickQty < 1) {
                    if (process.env.NODE_ENV === "development") {
                      console.error(`Validation Failure: Invalid quantity "${quickQty}".`, product);
                    }
                    return;
                  }
                  const validation = validateStockBeforeCheckout(product, {
                    productId: product.id,
                    size: chosen,
                    quantity: quickQty,
                    color: availability.color,
                  });
                  if (!validation.ok) {
                    toast.error(validation.reason ?? "This size is out of stock");
                    return;
                  }
                  const activeVariant = product.colorVariants?.find((v) => v.color === availability.color) ?? { sku: product.sku };
                  const targetSku = activeVariant.sku ?? product.sku;
                  if (!targetSku) {
                    if (process.env.NODE_ENV === "development") {
                      console.error("Validation Failure: Product SKU does not exist.", product);
                    }
                    return;
                  }
                  cart.add(product.id, chosen, quickQty, activeVariantId);
                  toast.success("Added to bag", {
                    description: `${product.name} · ${chosen} · Qty ${quickQty}`,
                  });
                  setQuickOpen(false);
                }}
                className="mt-6 w-full bg-foreground text-background py-4 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink transition-all duration-300"
              >
                Add to Bag — ${(priceInfo.salePrice * quickQty).toLocaleString()}.00
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
