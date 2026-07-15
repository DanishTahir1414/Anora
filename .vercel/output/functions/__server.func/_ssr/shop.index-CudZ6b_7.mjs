import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { l as products } from "./products-DA_AUvrV.mjs";
import { t as ProductCard } from "./ProductCard-CsDAKnP1.mjs";
import { i as useActiveCategories } from "./categories-64c7mSWo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop.index-CudZ6b_7.js
var import_jsx_runtime = require_jsx_runtime();
function ShopAll() {
	const { data: categories = [] } = useActiveCategories();
	const totalProducts = products.length;
	const subCount = categories.reduce((sum, c) => sum + c.children.length, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 lg:px-10 pt-16 pb-24",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center mb-14 max-w-2xl mx-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "eyebrow",
						children: "The Atelier"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-4 font-serif text-5xl md:text-6xl",
						children: "All Pieces"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 text-muted-foreground",
						children: "A complete edit of our current collection, across both houses."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap justify-center gap-3 mb-14",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/shop",
					activeOptions: { exact: true },
					activeProps: { className: "border-foreground text-foreground" },
					className: "text-[11px] tracking-[0.32em] uppercase px-5 py-2.5 border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors",
					children: "All"
				}), categories.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/shop/$category",
					params: { category: cat.slug },
					className: "text-[11px] tracking-[0.32em] uppercase px-5 py-2.5 border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors",
					children: cat.name
				}, cat.id))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-14 max-w-7xl mx-auto",
				children: products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, { product: p }, p.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-center text-xs text-muted-foreground mt-16",
				children: [
					subCount,
					" subcategories · ",
					totalProducts,
					" pieces"
				]
			})
		]
	});
}
//#endregion
export { ShopAll as component };
