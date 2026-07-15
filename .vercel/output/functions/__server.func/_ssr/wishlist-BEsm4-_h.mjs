import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as X } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { l as products } from "./products-DA_AUvrV.mjs";
import { a as useCart, o as useWishlist } from "./store-CEzUOlzO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wishlist-BEsm4-_h.js
var import_jsx_runtime = require_jsx_runtime();
function WishlistPage() {
	const wish = useWishlist();
	const cart = useCart();
	const items = products.filter((p) => wish.ids.includes(p.id));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 lg:px-10 py-16 max-w-7xl mx-auto",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center mb-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "eyebrow",
				children: "Saved Pieces"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-5xl mt-3",
				children: "Wishlist"
			})]
		}), items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center py-20",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: "No pieces saved yet."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/shop",
				className: "mt-6 inline-block bg-foreground text-background px-8 py-3 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink transition-colors",
				children: "Discover the Atelier"
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-14",
			children: items.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative group",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/product/$slug",
						params: { slug: p.slug },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "aspect-[3/4] bg-neutral overflow-hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: p.images[0],
								alt: p.name,
								loading: "lazy",
								className: "h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => wish.remove(p.id),
						className: "absolute top-3 right-3 h-9 w-9 bg-background/90 backdrop-blur grid place-items-center hover:text-gold",
						"aria-label": "remove",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pt-4 flex items-start justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/product/$slug",
							params: { slug: p.slug },
							className: "font-serif text-lg hover:text-gold",
							children: p.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] tracking-[0.28em] uppercase text-muted-foreground mt-1",
							children: p.subcategory
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-serif",
							children: ["$", p.price]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							cart.add(p.id, p.sizes[0], 1);
							toast.success("Added to bag", { description: p.name });
						},
						className: "mt-4 w-full border border-foreground py-3 text-[11px] tracking-[0.32em] uppercase hover:bg-foreground hover:text-background transition-colors",
						children: "Add to Bag"
					})
				]
			}, p.id))
		})]
	});
}
//#endregion
export { WishlistPage as component };
