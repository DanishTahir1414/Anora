import { o as __toESM } from "../_runtime.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { B as Heart, D as Minus, K as Eye, t as X, x as Plus } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as useCart, n as getProductAvailability, o as useWishlist, s as validateStockBeforeCheckout } from "./store-CEzUOlzO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ProductCard-CsDAKnP1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProductCard({ product }) {
	const wish = useWishlist();
	const cart = useCart();
	const [size, setSize] = (0, import_react.useState)(null);
	const [quickOpen, setQuickOpen] = (0, import_react.useState)(false);
	const [quickSize, setQuickSize] = (0, import_react.useState)(product.sizes[0]);
	const [quickQty, setQuickQty] = (0, import_react.useState)(1);
	const second = product.images[1] ?? product.images[0];
	const availability = getProductAvailability(product);
	const sizeStock = availability.sizeStock ?? {};
	const hasSizeStock = Object.keys(sizeStock).length > 0;
	const allOOS = hasSizeStock && availability.sizes.every((s) => (sizeStock[s] ?? 1) === 0);
	const isOOS = !availability.isAvailable || availability.stock === 0 || allOOS;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "group",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative overflow-hidden bg-neutral aspect-[3/4]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/product/$slug",
						params: { slug: product.slug },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: product.images[0],
							alt: product.name,
							loading: "lazy",
							className: "absolute inset-0 h-full w-full object-cover transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 group-hover:opacity-0"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: second,
							alt: "",
							loading: "lazy",
							"aria-hidden": true,
							className: "absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100 group-hover:scale-105"
						})]
					}),
					product.badge && !isOOS && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute top-3 left-3 text-[10px] tracking-[0.3em] uppercase bg-background/90 px-3 py-1.5 backdrop-blur",
						children: product.badge
					}),
					isOOS && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[11px] tracking-[0.32em] uppercase text-foreground/70",
							children: "Out of Stock"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						"aria-label": "Add to wishlist",
						onClick: () => {
							wish.toggle(product.id);
							toast(wish.has(product.id) ? "Removed from wishlist" : "Saved to wishlist");
						},
						className: "absolute top-3 right-3 h-9 w-9 grid place-items-center bg-background/90 backdrop-blur transition-all duration-300 hover:text-gold hover:scale-105",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: `h-4 w-4 ${wish.has(product.id) ? "fill-gold text-gold" : ""}` })
					}),
					!isOOS && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-x-3 bottom-3 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								const chosen = size ?? product.sizes[0];
								const validation = validateStockBeforeCheckout(product, {
									productId: product.id,
									size: chosen,
									quantity: 1,
									color: availability.color
								});
								if (!validation.ok) {
									toast.error(validation.reason ?? "This size is out of stock");
									return;
								}
								cart.add(product.id, chosen, 1);
								toast.success("Added to bag", { description: `${product.name} · ${chosen}` });
							},
							className: "flex-1 bg-foreground text-background py-3 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink transition-all duration-300",
							children: "Quick Add"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								setQuickSize(availability.sizes[0]);
								setQuickQty(1);
								setQuickOpen(true);
							},
							"aria-label": "Quick view",
							className: "w-11 bg-background/90 backdrop-blur grid place-items-center hover:text-gold transition-all duration-300 hover:scale-105",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" })
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pt-4 flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/product/$slug",
					params: { slug: product.slug },
					className: "font-serif text-lg leading-tight hover:text-gold transition-colors duration-300",
					children: product.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] tracking-[0.24em] uppercase text-muted-foreground mt-1",
					children: product.subcategory
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-serif text-base shrink-0",
					children: ["$", product.price]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-1.5",
				children: availability.sizes.map((s) => {
					const qty = sizeStock[s];
					const disabled = hasSizeStock && qty !== void 0 && qty === 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							if (disabled) return;
							setSize(s);
						},
						className: `text-[11px] tracking-wider min-w-8 h-7 px-2 border transition-all duration-300 ${size === s && !disabled ? "border-foreground text-foreground" : disabled ? "border-border/40 text-border/50 line-through cursor-not-allowed" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"}`,
						children: s
					}, s);
				})
			})
		]
	}), quickOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		onClick: () => setQuickOpen(false),
		className: "fixed inset-0 z-[70] bg-ink/40 backdrop-blur-sm animate-fade flex items-center justify-center p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			onClick: (e) => e.stopPropagation(),
			className: "bg-background w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-luxe animate-fade-up grid md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "aspect-[3/4] bg-neutral",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: product.images[0],
					alt: product.name,
					className: "h-full w-full object-cover"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-8 lg:p-10 flex flex-col justify-center relative",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setQuickOpen(false),
						"aria-label": "Close",
						className: "absolute top-4 right-4 hover:text-gold transition-colors",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
					}),
					product.badge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "eyebrow text-gold mb-2",
						children: product.badge
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-3xl md:text-4xl",
						children: product.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[11px] tracking-[0.28em] uppercase text-muted-foreground mt-2",
						children: [
							product.subcategory,
							" · SKU ",
							product.sku
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-serif text-2xl mt-5",
						children: ["$", product.price]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground mt-5 leading-relaxed",
						children: product.description
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow mb-3",
							children: "Size"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: availability.sizes.map((s) => {
								const qty = sizeStock[s];
								const disabled = hasSizeStock && qty !== void 0 && qty === 0;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => {
										if (disabled) return;
										setQuickSize(s);
									},
									className: `min-w-10 h-10 px-3 text-sm border transition-all duration-300 ${quickSize === s && !disabled ? "border-foreground bg-foreground text-background" : disabled ? "border-border/40 text-border/50 line-through cursor-not-allowed" : "border-border hover:border-foreground"}`,
									children: s
								}, s);
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 flex items-center gap-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center border border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									"aria-label": "decrease",
									onClick: () => setQuickQty((q) => Math.max(1, q - 1)),
									className: "h-10 w-10 grid place-items-center hover:bg-neutral transition-colors",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "h-3.5 w-3.5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-10 text-center text-sm",
									children: quickQty
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									"aria-label": "increase",
									onClick: () => setQuickQty((q) => q + 1),
									className: "h-10 w-10 grid place-items-center hover:bg-neutral transition-colors",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" })
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							const validation = validateStockBeforeCheckout(product, {
								productId: product.id,
								size: quickSize,
								quantity: quickQty,
								color: availability.color
							});
							if (!validation.ok) {
								toast.error(validation.reason ?? "This size is out of stock");
								return;
							}
							cart.add(product.id, quickSize, quickQty);
							toast.success("Added to bag", { description: `${product.name} · ${quickSize} · Qty ${quickQty}` });
							setQuickOpen(false);
						},
						className: "mt-6 w-full bg-foreground text-background py-4 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink transition-all duration-300",
						children: [
							"Add to Bag — $",
							(product.price * quickQty).toLocaleString(),
							".00"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/product/$slug",
						params: { slug: product.slug },
						onClick: () => setQuickOpen(false),
						className: "mt-4 text-center text-[11px] tracking-[0.28em] uppercase text-muted-foreground hover:text-foreground transition-colors",
						children: "Full Details"
					})
				]
			})]
		})
	})] });
}
//#endregion
export { ProductCard as t };
