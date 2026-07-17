import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";
import { ChevronDown, Heart, Minus, Plus, Share2, Truck, X } from "lucide-react";
import { products } from "@/lib/products";
import { getProductBySlug } from "@/lib/products-db";
import { mapDbProductToStatic } from "@/lib/product-mapper";
import { useCart, useWishlist } from "@/lib/store";
import { registerProduct } from "@/lib/customer-services";
import { getProductAvailability, validateStockBeforeCheckout } from "@/lib/inventory";
import { ProductCard } from "@/components/site/ProductCard";
import { toast } from "sonner";
import type { Product } from "@/lib/products";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const dbResult = await getProductBySlug(params.slug);
    if (!dbResult || !dbResult.product) throw notFound();
    const parentSlug = dbResult.parent_category?.slug ?? "clothing";
    const subName = dbResult.category?.name ?? "";
    const product = mapDbProductToStatic(dbResult.product, dbResult.images, parentSlug, subName);
    return { product, related: getRelatedProducts(product) };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    return {
      meta: [
        { title: p ? `${p.name} — ANORA` : "ANORA" },
        { name: "description", content: p?.description ?? "" },
        { property: "og:title", content: p ? `${p.name} — ANORA` : "ANORA" },
        { property: "og:description", content: p?.description ?? "" },
        { property: "og:image", content: p?.images[0] ?? "" },
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: () => (
    <div className="py-32 text-center">
      <h1 className="font-serif text-4xl">Piece not found</h1>
      <Link
        to="/shop"
        className="inline-block mt-6 text-[11px] tracking-[0.32em] uppercase hover-underline"
      >
        Return to shop
      </Link>
    </div>
  ),
});

function getRelatedProducts(product: Product): Product[] {
  return products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 3);
}

function getActiveState(product: (typeof products)[number], color: string) {
  const availability = getProductAvailability(product, color);
  const variant = availability.selectedVariant;
  if (!variant) {
    return {
      images: product.images,
      sizes: availability.sizes,
      sizeStock: availability.sizeStock,
      stock: availability.stock,
      sku: availability.sku,
      color: availability.color,
      lowStock: availability.lowStock,
      isAvailable: availability.isAvailable,
    };
  }
  return {
    images: variant.images,
    sizes: variant.sizes,
    sizeStock: variant.sizeStock,
    stock: variant.stock,
    sku: variant.sku,
    color: variant.color,
    lowStock: variant.lowStock,
    isAvailable: variant.isAvailable,
  };
}

function ProductPage() {
  const { product, related } = Route.useLoaderData();
  const cart = useCart();
  const wish = useWishlist();

  // Register the product so cart operations can find it by ID
  registerProduct(product);

  const colors = product.colorVariants?.map((v) => v.color) ?? [product.color];
  const [activeColor, setActiveColor] = useState(product.color);
  const active = getActiveState(product, activeColor);

  const [size, setSize] = useState(active.sizes[0]);
  const [qty, setQty] = useState(1);
  const [imgIdx, setImgIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const hasSizeStock = active.sizeStock && Object.keys(active.sizeStock).length > 0;
  const allOOS = hasSizeStock && active.sizes.every((s) => (active.sizeStock![s] ?? 1) === 0);
  const isOOS = !active.isAvailable || active.stock === 0 || allOOS;

  // ─── Color switch ───
  const switchColor = useCallback(
    (c: string) => {
      const next = getActiveState(product, c);
      setActiveColor(c);
      setSize(next.sizes[0]);
      setImgIdx(0);
    },
    [product],
  );

  // ─── Image zoom ───
  const imgRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x, y });
  }, []);

  // ─── Mobile swipe ───
  const touchStart = useRef<number>(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) setImgIdx((i) => Math.min(active.images.length - 1, i + 1));
      else setImgIdx((i) => Math.max(0, i - 1));
    }
  };

  return (
    <div className="pt-10 lg:pt-16 pb-24">
      {/* Breadcrumb */}
      <div className="px-5 lg:px-10 mb-8 text-[11px] tracking-[0.28em] uppercase text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link
          to="/shop/$category"
          params={{ category: product.category as string }}
          className="hover:text-foreground transition-colors"
        >
          {product.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="px-5 lg:px-10 grid lg:grid-cols-2 gap-10 lg:gap-16 max-w-7xl mx-auto">
        {/* ─── Image Gallery ─── */}
        <div className="grid grid-cols-1 md:grid-cols-[64px_1fr] gap-4">
          {/* Thumbnails */}
          <div className="hidden md:flex flex-col gap-3">
            {active.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                className={`overflow-hidden aspect-[3/4] border transition-all duration-300 ${i === imgIdx
                    ? "border-foreground"
                    : "border-transparent opacity-60 hover:opacity-100"
                  }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main image */}
          <div
            ref={imgRef}
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={() => setLightboxOpen(true)}
            className="md:col-start-2 overflow-hidden aspect-[3/4] bg-neutral cursor-crosshair relative"
          >
            <img
              src={active.images[imgIdx]}
              alt={product.name}
              className={`h-full w-full object-cover transition-opacity duration-500 ${zoom ? "opacity-0" : "opacity-100"
                }`}
            />
            {zoom && (
              <img
                src={active.images[imgIdx]}
                alt=""
                className="absolute inset-0 h-[200%] w-[200%] max-w-none pointer-events-none"
                style={{
                  transformOrigin: `${origin.x}% ${origin.y}%`,
                  transform: `translate(-${origin.x / 2}%, -${origin.y / 2}%)`,
                }}
              />
            )}

            {/* Touch arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setImgIdx((i) => Math.max(0, i - 1));
              }}
              className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/80 grid place-items-center hover:text-gold transition-colors"
            >
              <span className="text-sm">‹</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setImgIdx((i) => Math.min(active.images.length - 1, i + 1));
              }}
              className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/80 grid place-items-center hover:text-gold transition-colors"
            >
              <span className="text-sm">›</span>
            </button>
          </div>

          {/* Mobile thumbnails */}
          <div className="md:hidden flex gap-2 mt-3 overflow-x-auto col-span-2">
            {active.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                className={`w-14 aspect-[3/4] flex-none border transition-all duration-300 ${i === imgIdx ? "border-foreground" : "border-transparent opacity-60"
                  }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* ─── Product Info ─── */}
        <div className="lg:pl-6 lg:sticky lg:top-24 lg:self-start">
          {product.badge && <span className="eyebrow text-gold">{product.badge}</span>}
          <h1 className="font-serif text-4xl md:text-5xl mt-3">{product.name}</h1>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className={isOOS ? "text-red/70" : "text-emerald-600/80"}>
              {isOOS ? "Out of Stock" : "In Stock"}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-[11px] tracking-[0.28em] uppercase text-muted-foreground">
              SKU {active.sku}
            </span>
          </div>

          <p className="font-serif text-3xl mt-5">${product.price}.00</p>

          <div className="mt-7 h-px w-full bg-border/60" />

          <p className="mt-7 text-[15px] leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          {/* Fabric / Material */}
          {(product.fabric || product.material) && (
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="eyebrow text-foreground/60">Fabric:</span>
              <span>{product.fabric ?? product.material}</span>
            </div>
          )}

          {/* Color Selection */}
          {colors.length > 1 && (
            <div className="mt-6">
              <span className="eyebrow text-[11px] tracking-[0.28em] uppercase text-muted-foreground">
                Color: <span className="text-foreground">{activeColor}</span>
              </span>
              <div className="flex gap-3 mt-3">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => switchColor(c)}
                    className={`relative h-10 w-10 rounded-full border-2 transition-all duration-300 ${activeColor === c
                        ? "border-gold scale-110"
                        : "border-border/50 hover:border-foreground/50"
                      }`}
                    title={c}
                  >
                    <span
                      className="absolute inset-1 rounded-full"
                      style={{
                        backgroundColor:
                          c === "Ivory"
                            ? "#f5f0e8"
                            : c === "Blush"
                              ? "#f5d6d6"
                              : c === "Gold"
                                ? "#d4af37"
                                : c === "Camel"
                                  ? "#c19a6b"
                                  : c === "Ivory & Gold"
                                    ? "#e8d5b7"
                                    : c === "Midnight Blue"
                                      ? "#191970"
                                      : "#ccc",
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color (single) */}
          {colors.length <= 1 && (
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="eyebrow text-foreground/60">Color:</span>
              <span>{product.color}</span>
            </div>
          )}

          {/* Size */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <span className="eyebrow">Size</span>
              <button
                onClick={() => setGuideOpen(true)}
                className="text-[11px] tracking-[0.28em] uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {active.sizes.map((s) => {
                const qty = active.sizeStock?.[s];
                const disabled = hasSizeStock && qty !== undefined && qty === 0;
                return (
                  <button
                    key={s}
                    onClick={() => {
                      if (!disabled) setSize(s);
                    }}
                    className={`min-w-12 h-11 px-3 text-sm border transition-all duration-300 ${size === s && !disabled
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

          {/* Quantity + Actions */}
          <div className="mt-7 flex items-center gap-4">
            <div className="flex items-center border border-border">
              <button
                aria-label="decrease"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-11 w-11 grid place-items-center hover:bg-neutral transition-colors"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-10 text-center text-sm">{qty}</span>
              <button
                aria-label="increase"
                onClick={() => setQty((q) => q + 1)}
                className="h-11 w-11 grid place-items-center hover:bg-neutral transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              onClick={() => {
                const wasWishlisted = wish.has(product.id);
                wish.toggle(product.id);
                toast(wasWishlisted ? "Removed from Wishlist" : "Added to Wishlist");
              }}
              className="h-11 w-11 grid place-items-center border border-border hover:border-foreground transition-all duration-300 hover:scale-105"
              aria-label="wishlist"
            >
              <Heart className={`h-4 w-4 ${wish.has(product.id) ? "fill-gold text-gold" : ""}`} />
            </button>
            <button
              onClick={() => {
                if (navigator.share)
                  navigator
                    .share({ title: product.name, url: window.location.href })
                    .catch(() => { });
                else {
                  navigator.clipboard.writeText(window.location.href);
                  toast("Link copied to clipboard");
                }
              }}
              className="h-11 w-11 grid place-items-center border border-border hover:border-foreground transition-all duration-300 hover:scale-105"
              aria-label="share"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {/* Add to Cart / Buy Now */}
          <div className="mt-5 grid sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                if (isOOS) return;
                const validation = validateStockBeforeCheckout(product, {
                  productId: product.id,
                  size,
                  quantity: qty,
                  color: activeColor,
                });
                if (!validation.ok) {
                  toast.error(validation.reason ?? "Selected option is unavailable");
                  return;
                }
                cart.add(product.id, size, qty);
                toast.success("Added to bag", {
                  description: `${product.name} · ${size} · Qty ${qty}`,
                });
              }}
              disabled={isOOS}
              className={`py-4 text-[11px] tracking-[0.32em] uppercase transition-all duration-300 ${isOOS
                  ? "bg-border/40 text-muted-foreground cursor-not-allowed"
                  : "bg-foreground text-background hover:bg-gold hover:text-ink"
                }`}
            >
              {isOOS ? "Out of Stock" : "Add to Bag"}
            </button>
            {!isOOS && (
              <Link
                to="/checkout"
                onClick={() => cart.add(product.id, size, qty)}
                className="text-center border border-foreground py-4 text-[11px] tracking-[0.32em] uppercase hover:bg-foreground hover:text-background transition-all duration-300"
              >
                Buy Now
              </Link>
            )}
          </div>

          {/* Delivery */}
          <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <Truck className="h-4 w-4" />
            <span>Complimentary express shipping · arrives in 3–5 business days</span>
          </div>

          {/* Details accordion */}
          <div className="mt-10 divide-y divide-border/60 border-t border-b border-border/60">
            <Detail title="Composition">
              <p>{product.fabric ?? product.material ?? "Premium quality"}</p>
              <p>Colour — {active.color}</p>
            </Detail>
            <Detail title="Care">
              <p>
                Store in the pouch provided. Avoid contact with perfumes, lotions and chlorine.
                Polish with a soft cloth.
              </p>
            </Detail>
            <Detail title="Shipping & Returns">
              <p>
                Complimentary worldwide shipping. 14-day returns on unworn pieces in original
                packaging.
              </p>
            </Detail>
          </div>
        </div>
      </div>

      {/* Related */}
      <section className="px-5 lg:px-10 mt-24 max-w-7xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl mb-10">You may also like</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-3.5 gap-y-10 sm:gap-x-5 sm:gap-y-14">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ─── Lightbox ─── */}
      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-[80] bg-ink/80 backdrop-blur-sm animate-fade flex items-center justify-center p-4"
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 text-background hover:text-gold transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="max-w-2xl max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={active.images[imgIdx]}
              alt={product.name}
              className="w-full h-full object-contain max-h-[85vh]"
            />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setImgIdx((i) => Math.max(0, i - 1));
            }}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-background/70 hover:text-gold text-3xl transition-colors"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setImgIdx((i) => Math.min(active.images.length - 1, i + 1));
            }}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-background/70 hover:text-gold text-3xl transition-colors"
          >
            ›
          </button>
        </div>
      )}

      {/* ─── Size Guide ─── */}
      {guideOpen && (
        <div
          onClick={() => setGuideOpen(false)}
          className="fixed inset-0 z-[70] bg-ink/40 backdrop-blur-sm animate-fade flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-background w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-luxe animate-fade-up p-10"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-2xl">Size Guide</h2>
              <button
                onClick={() => setGuideOpen(false)}
                className="hover:text-gold transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="py-2 text-left font-medium">Size</th>
                  <th className="py-2 text-left font-medium">Bust (in)</th>
                  <th className="py-2 text-left font-medium">Waist (in)</th>
                  <th className="py-2 text-left font-medium">Hip (in)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                  <tr key={s}>
                    <td className="py-2.5 font-medium">{s}</td>
                    <td className="py-2.5 text-muted-foreground">
                      {32 + ["XS", "S", "M", "L", "XL"].indexOf(s) * 2}
                    </td>
                    <td className="py-2.5 text-muted-foreground">
                      {24 + ["XS", "S", "M", "L", "XL"].indexOf(s) * 2}
                    </td>
                    <td className="py-2.5 text-muted-foreground">
                      {34 + ["XS", "S", "M", "L", "XL"].indexOf(s) * 2}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-muted-foreground mt-6">
              Measurements are body measurements. For the best fit, we recommend comparing with a
              piece you already own.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="eyebrow">{title}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="pb-5 text-sm text-muted-foreground leading-relaxed space-y-2 animate-fade">
          {children}
        </div>
      )}
    </div>
  );
}
