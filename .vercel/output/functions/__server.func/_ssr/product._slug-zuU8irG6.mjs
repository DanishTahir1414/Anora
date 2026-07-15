import { o as __toESM } from "../_runtime.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { B as Heart, D as Minus, h as Share2, nt as ChevronDown, o as Truck, t as X, x as Plus } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as useCart, n as getProductAvailability, o as useWishlist, r as registerProduct, s as validateStockBeforeCheckout } from "./store-CEzUOlzO.mjs";
import { t as Route } from "./product._slug-BkVbUp6N.mjs";
import { t as ProductCard } from "./ProductCard-CsDAKnP1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/product._slug-zuU8irG6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function getActiveState(product, color) {
	const availability = getProductAvailability(product, color);
	const variant = availability.selectedVariant;
	if (!variant) return {
		images: product.images,
		sizes: availability.sizes,
		sizeStock: availability.sizeStock,
		stock: availability.stock,
		sku: availability.sku,
		color: availability.color,
		lowStock: availability.lowStock,
		isAvailable: availability.isAvailable
	};
	return {
		images: variant.images,
		sizes: variant.sizes,
		sizeStock: variant.sizeStock,
		stock: variant.stock,
		sku: variant.sku,
		color: variant.color,
		lowStock: variant.lowStock,
		isAvailable: variant.isAvailable
	};
}
function ProductPage() {
	const { product, related } = Route.useLoaderData();
	const cart = useCart();
	const wish = useWishlist();
	registerProduct(product);
	const colors = product.colorVariants?.map((v) => v.color) ?? [product.color];
	const [activeColor, setActiveColor] = (0, import_react.useState)(product.color);
	const active = getActiveState(product, activeColor);
	const [size, setSize] = (0, import_react.useState)(active.sizes[0]);
	const [qty, setQty] = (0, import_react.useState)(1);
	const [imgIdx, setImgIdx] = (0, import_react.useState)(0);
	const [lightboxOpen, setLightboxOpen] = (0, import_react.useState)(false);
	const [guideOpen, setGuideOpen] = (0, import_react.useState)(false);
	const hasSizeStock = active.sizeStock && Object.keys(active.sizeStock).length > 0;
	const allOOS = hasSizeStock && active.sizes.every((s) => (active.sizeStock[s] ?? 1) === 0);
	const isOOS = !active.isAvailable || active.stock === 0 || allOOS;
	const switchColor = (0, import_react.useCallback)((c) => {
		const next = getActiveState(product, c);
		setActiveColor(c);
		setSize(next.sizes[0]);
		setImgIdx(0);
	}, [product]);
	const imgRef = (0, import_react.useRef)(null);
	const [zoom, setZoom] = (0, import_react.useState)(false);
	const [origin, setOrigin] = (0, import_react.useState)({
		x: 50,
		y: 50
	});
	const handleMouseMove = (0, import_react.useCallback)((e) => {
		const rect = imgRef.current?.getBoundingClientRect();
		if (!rect) return;
		setOrigin({
			x: (e.clientX - rect.left) / rect.width * 100,
			y: (e.clientY - rect.top) / rect.height * 100
		});
	}, []);
	const touchStart = (0, import_react.useRef)(0);
	const handleTouchStart = (e) => {
		touchStart.current = e.touches[0].clientX;
	};
	const handleTouchEnd = (e) => {
		const diff = touchStart.current - e.changedTouches[0].clientX;
		if (Math.abs(diff) > 50) if (diff > 0) setImgIdx((i) => Math.min(active.images.length - 1, i + 1));
		else setImgIdx((i) => Math.max(0, i - 1));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pt-10 lg:pt-16 pb-24",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-5 lg:px-10 mb-8 text-[11px] tracking-[0.28em] uppercase text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "hover:text-foreground transition-colors",
						children: "Home"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mx-2",
						children: "/"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/shop/$category",
						params: { category: product.category },
						className: "hover:text-foreground transition-colors",
						children: product.category
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mx-2",
						children: "/"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-foreground",
						children: product.name
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-5 lg:px-10 grid lg:grid-cols-2 gap-10 lg:gap-16 max-w-7xl mx-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-[64px_1fr] gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "hidden md:flex flex-col gap-3",
							children: active.images.map((img, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setImgIdx(i),
								className: `overflow-hidden aspect-[3/4] border transition-all duration-300 ${i === imgIdx ? "border-foreground" : "border-transparent opacity-60 hover:opacity-100"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: img,
									alt: "",
									className: "h-full w-full object-cover"
								})
							}, i))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							ref: imgRef,
							onMouseEnter: () => setZoom(true),
							onMouseLeave: () => setZoom(false),
							onMouseMove: handleMouseMove,
							onTouchStart: handleTouchStart,
							onTouchEnd: handleTouchEnd,
							onClick: () => setLightboxOpen(true),
							className: "md:col-start-2 overflow-hidden aspect-[3/4] bg-neutral cursor-crosshair relative",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: active.images[imgIdx],
									alt: product.name,
									className: `h-full w-full object-cover transition-opacity duration-500 ${zoom ? "opacity-0" : "opacity-100"}`
								}),
								zoom && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: active.images[imgIdx],
									alt: "",
									className: "absolute inset-0 h-[200%] w-[200%] max-w-none pointer-events-none",
									style: {
										transformOrigin: `${origin.x}% ${origin.y}%`,
										transform: `translate(-${origin.x / 2}%, -${origin.y / 2}%)`
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: (e) => {
										e.stopPropagation();
										setImgIdx((i) => Math.max(0, i - 1));
									},
									className: "md:hidden absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/80 grid place-items-center hover:text-gold transition-colors",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm",
										children: "‹"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: (e) => {
										e.stopPropagation();
										setImgIdx((i) => Math.min(active.images.length - 1, i + 1));
									},
									className: "md:hidden absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/80 grid place-items-center hover:text-gold transition-colors",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm",
										children: "›"
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "md:hidden flex gap-2 mt-3 overflow-x-auto col-span-2",
							children: active.images.map((img, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setImgIdx(i),
								className: `w-14 aspect-[3/4] flex-none border transition-all duration-300 ${i === imgIdx ? "border-foreground" : "border-transparent opacity-60"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: img,
									alt: "",
									className: "h-full w-full object-cover"
								})
							}, i))
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lg:pl-6 lg:sticky lg:top-24 lg:self-start",
					children: [
						product.badge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "eyebrow text-gold",
							children: product.badge
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-serif text-4xl md:text-5xl mt-3",
							children: product.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex items-center gap-4 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: isOOS ? "text-red/70" : "text-emerald-600/80",
									children: isOOS ? "Out of Stock" : "In Stock"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "·"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[11px] tracking-[0.28em] uppercase text-muted-foreground",
									children: ["SKU ", active.sku]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-serif text-3xl mt-5",
							children: [
								"$",
								product.price,
								".00"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-7 h-px w-full bg-border/60" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-7 text-[15px] leading-relaxed text-muted-foreground",
							children: product.description
						}),
						(product.fabric || product.material) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex items-center gap-2 text-sm text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "eyebrow text-foreground/60",
								children: "Fabric:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: product.fabric ?? product.material })]
						}),
						colors.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "eyebrow text-[11px] tracking-[0.28em] uppercase text-muted-foreground",
								children: ["Color: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-foreground",
									children: activeColor
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex gap-3 mt-3",
								children: colors.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => switchColor(c),
									className: `relative h-10 w-10 rounded-full border-2 transition-all duration-300 ${activeColor === c ? "border-gold scale-110" : "border-border/50 hover:border-foreground/50"}`,
									title: c,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "absolute inset-1 rounded-full",
										style: { backgroundColor: c === "Ivory" ? "#f5f0e8" : c === "Blush" ? "#f5d6d6" : c === "Gold" ? "#d4af37" : c === "Camel" ? "#c19a6b" : c === "Ivory & Gold" ? "#e8d5b7" : c === "Midnight Blue" ? "#191970" : "#ccc" }
									})
								}, c))
							})]
						}),
						colors.length <= 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex items-center gap-2 text-sm text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "eyebrow text-foreground/60",
								children: "Color:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: product.color })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between mb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "eyebrow",
									children: "Size"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setGuideOpen(true),
									className: "text-[11px] tracking-[0.28em] uppercase text-muted-foreground hover:text-foreground transition-colors",
									children: "Size Guide"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2",
								children: active.sizes.map((s) => {
									const qty = active.sizeStock?.[s];
									const disabled = hasSizeStock && qty !== void 0 && qty === 0;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => {
											if (!disabled) setSize(s);
										},
										className: `min-w-12 h-11 px-3 text-sm border transition-all duration-300 ${size === s && !disabled ? "border-foreground bg-foreground text-background" : disabled ? "border-border/40 text-border/50 line-through cursor-not-allowed" : "border-border hover:border-foreground"}`,
										children: s
									}, s);
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-7 flex items-center gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center border border-border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											"aria-label": "decrease",
											onClick: () => setQty((q) => Math.max(1, q - 1)),
											className: "h-11 w-11 grid place-items-center hover:bg-neutral transition-colors",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "h-3.5 w-3.5" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "w-10 text-center text-sm",
											children: qty
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											"aria-label": "increase",
											onClick: () => setQty((q) => q + 1),
											className: "h-11 w-11 grid place-items-center hover:bg-neutral transition-colors",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" })
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => {
										wish.toggle(product.id);
										toast(wish.has(product.id) ? "Removed from wishlist" : "Saved to wishlist");
									},
									className: "h-11 w-11 grid place-items-center border border-border hover:border-foreground transition-all duration-300 hover:scale-105",
									"aria-label": "wishlist",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: `h-4 w-4 ${wish.has(product.id) ? "fill-gold text-gold" : ""}` })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => {
										if (navigator.share) navigator.share({
											title: product.name,
											url: window.location.href
										}).catch(() => {});
										else {
											navigator.clipboard.writeText(window.location.href);
											toast("Link copied to clipboard");
										}
									},
									className: "h-11 w-11 grid place-items-center border border-border hover:border-foreground transition-all duration-300 hover:scale-105",
									"aria-label": "share",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "h-4 w-4" })
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 grid sm:grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => {
									if (isOOS) return;
									const validation = validateStockBeforeCheckout(product, {
										productId: product.id,
										size,
										quantity: qty,
										color: activeColor
									});
									if (!validation.ok) {
										toast.error(validation.reason ?? "Selected option is unavailable");
										return;
									}
									cart.add(product.id, size, qty);
									toast.success("Added to bag", { description: `${product.name} · ${size} · Qty ${qty}` });
								},
								disabled: isOOS,
								className: `py-4 text-[11px] tracking-[0.32em] uppercase transition-all duration-300 ${isOOS ? "bg-border/40 text-muted-foreground cursor-not-allowed" : "bg-foreground text-background hover:bg-gold hover:text-ink"}`,
								children: isOOS ? "Out of Stock" : "Add to Bag"
							}), !isOOS && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/checkout",
								onClick: () => cart.add(product.id, size, qty),
								className: "text-center border border-foreground py-4 text-[11px] tracking-[0.32em] uppercase hover:bg-foreground hover:text-background transition-all duration-300",
								children: "Buy Now"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex items-center gap-2 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Complimentary express shipping · arrives in 3–5 business days" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-10 divide-y divide-border/60 border-t border-b border-border/60",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Detail, {
									title: "Composition",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: product.fabric ?? product.material ?? "Premium quality" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Colour — ", active.color] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Detail, {
									title: "Care",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Store in the pouch provided. Avoid contact with perfumes, lotions and chlorine. Polish with a soft cloth." })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Detail, {
									title: "Shipping & Returns",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Complimentary worldwide shipping. 14-day returns on unworn pieces in original packaging." })
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "px-5 lg:px-10 mt-24 max-w-7xl mx-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-serif text-3xl md:text-4xl mb-10",
					children: "You may also like"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-14",
					children: related.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, { product: p }, p.id))
				})]
			}),
			lightboxOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				onClick: () => setLightboxOpen(false),
				className: "fixed inset-0 z-[80] bg-ink/80 backdrop-blur-sm animate-fade flex items-center justify-center p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setLightboxOpen(false),
						className: "absolute top-6 right-6 text-background hover:text-gold transition-colors",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-6 w-6" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "max-w-2xl max-h-[85vh]",
						onClick: (e) => e.stopPropagation(),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: active.images[imgIdx],
							alt: product.name,
							className: "w-full h-full object-contain max-h-[85vh]"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: (e) => {
							e.stopPropagation();
							setImgIdx((i) => Math.max(0, i - 1));
						},
						className: "absolute left-6 top-1/2 -translate-y-1/2 text-background/70 hover:text-gold text-3xl transition-colors",
						children: "‹"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: (e) => {
							e.stopPropagation();
							setImgIdx((i) => Math.min(active.images.length - 1, i + 1));
						},
						className: "absolute right-6 top-1/2 -translate-y-1/2 text-background/70 hover:text-gold text-3xl transition-colors",
						children: "›"
					})
				]
			}),
			guideOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				onClick: () => setGuideOpen(false),
				className: "fixed inset-0 z-[70] bg-ink/40 backdrop-blur-sm animate-fade flex items-center justify-center p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					onClick: (e) => e.stopPropagation(),
					className: "bg-background w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-luxe animate-fade-up p-10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between mb-8",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-serif text-2xl",
								children: "Size Guide"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setGuideOpen(false),
								className: "hover:text-gold transition-colors",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border/60",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 text-left font-medium",
										children: "Size"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 text-left font-medium",
										children: "Bust (in)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 text-left font-medium",
										children: "Waist (in)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-2 text-left font-medium",
										children: "Hip (in)"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
								className: "divide-y divide-border/40",
								children: [
									"XS",
									"S",
									"M",
									"L",
									"XL",
									"XXL"
								].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2.5 font-medium",
										children: s
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2.5 text-muted-foreground",
										children: 32 + [
											"XS",
											"S",
											"M",
											"L",
											"XL"
										].indexOf(s) * 2
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2.5 text-muted-foreground",
										children: 24 + [
											"XS",
											"S",
											"M",
											"L",
											"XL"
										].indexOf(s) * 2
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2.5 text-muted-foreground",
										children: 34 + [
											"XS",
											"S",
											"M",
											"L",
											"XL"
										].indexOf(s) * 2
									})
								] }, s))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-6",
							children: "Measurements are body measurements. For the best fit, we recommend comparing with a piece you already own."
						})
					]
				})
			})
		]
	});
}
function Detail({ title, children }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick: () => setOpen((v) => !v),
		className: "w-full flex items-center justify-between py-5 text-left",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "eyebrow",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}` })]
	}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pb-5 text-sm text-muted-foreground leading-relaxed space-y-2 animate-fade",
		children
	})] });
}
//#endregion
export { ProductPage as component };
