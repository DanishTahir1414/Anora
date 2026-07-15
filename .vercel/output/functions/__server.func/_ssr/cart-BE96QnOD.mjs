import { o as __toESM } from "../_runtime.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { D as Minus, t as X, x as Plus } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as useCart } from "./store-CEzUOlzO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cart-BE96QnOD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CartPage() {
	const cart = useCart();
	const [code, setCode] = (0, import_react.useState)("");
	const [discount, setDiscount] = (0, import_react.useState)(0);
	const shipping = cart.subtotal > 0 ? 0 : 0;
	const total = Math.max(0, cart.subtotal - discount + shipping);
	if (cart.detailed.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 lg:px-10 py-24 text-center max-w-md mx-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "eyebrow",
				children: "Your Bag"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-4xl mt-4",
				children: "Your bag is empty"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground mt-3",
				children: "Begin with a quiet piece from the atelier."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/shop",
				className: "mt-8 inline-block bg-foreground text-background px-8 py-3 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink transition-colors",
				children: "Discover the Atelier"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 lg:px-10 py-16 max-w-6xl mx-auto",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center mb-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "eyebrow",
				children: "Your Bag"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-5xl mt-3",
				children: "Shopping Bag"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid lg:grid-cols-[1fr_360px] gap-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "divide-y divide-border border-t border-b border-border",
				children: cart.detailed.map(({ item, product, active }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `py-6 flex gap-5 ${active ? "" : "opacity-60"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/product/$slug",
						params: { slug: product.slug },
						className: "shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: product.images[0],
							alt: product.name,
							className: "w-24 h-32 object-cover bg-neutral"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/product/$slug",
								params: { slug: product.slug },
								className: "font-serif text-xl hover:text-gold",
								children: product.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[11px] tracking-[0.28em] uppercase text-muted-foreground mt-1",
								children: [
									"Size ",
									item.size,
									" · ",
									product.color
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => cart.remove(item.productId, item.size),
								"aria-label": "remove",
								className: "text-muted-foreground hover:text-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center border border-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => cart.setQty(item.productId, item.size, item.quantity - 1),
										disabled: !active,
										className: "h-9 w-9 grid place-items-center hover:bg-neutral",
										"aria-label": "decrease",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "h-3 w-3" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-10 text-center text-sm",
										children: item.quantity
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => cart.setQty(item.productId, item.size, item.quantity + 1),
										disabled: !active,
										className: "h-9 w-9 grid place-items-center hover:bg-neutral",
										"aria-label": "increase",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" })
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-serif text-lg",
								children: ["$", product.price * item.quantity]
							})]
						})]
					})]
				}, `${item.productId}-${item.size}`))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "lg:sticky lg:top-24 lg:self-start",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-neutral p-7",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow mb-5",
							children: "Order Summary"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Subtotal",
							value: `$${cart.subtotal}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Shipping",
							value: "Complimentary"
						}),
						discount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Discount",
							value: `- $${discount}`,
							accent: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px bg-border my-5" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Total",
							value: `$${total}`,
							bold: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: (e) => {
								e.preventDefault();
								if (code.trim().toUpperCase() === "ANORA10") {
									setDiscount(Math.round(cart.subtotal * .1));
									toast.success("Coupon applied", { description: "10% off your order" });
								} else {
									setDiscount(0);
									toast.error("Invalid coupon", { description: "Try ANORA10" });
								}
							},
							className: "mt-6 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: code,
								onChange: (e) => setCode(e.target.value),
								placeholder: "Coupon code",
								className: "flex-1 px-3 py-3 bg-background border border-border text-sm outline-none focus:border-foreground"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "px-5 text-[11px] tracking-[0.3em] uppercase bg-foreground text-background hover:bg-gold hover:text-ink transition-colors",
								children: "Apply"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/checkout",
							className: "mt-5 block text-center bg-foreground text-background py-4 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink transition-colors",
							children: "Checkout"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/shop",
							className: "mt-3 block text-center text-[11px] tracking-[0.3em] uppercase hover-underline",
							children: "Continue Shopping"
						})
					]
				})
			})]
		})]
	});
}
function Row({ label, value, bold, accent }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between py-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `text-sm ${bold ? "eyebrow" : "text-muted-foreground"}`,
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `${bold ? "font-serif text-xl" : "text-sm"} ${accent ? "text-gold" : ""}`,
			children: value
		})]
	});
}
//#endregion
export { CartPage as component };
