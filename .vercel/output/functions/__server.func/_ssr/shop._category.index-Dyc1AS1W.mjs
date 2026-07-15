import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as ProductCard } from "./ProductCard-CsDAKnP1.mjs";
import { a as useCategoryProducts, i as useActiveCategories, r as toProductProps } from "./categories-64c7mSWo.mjs";
import { t as Route } from "./shop._category.index-BTe1OYDo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop._category.index-Dyc1AS1W.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ShopCategory() {
	const { category } = Route.useParams();
	const [sub, setSub] = (0, import_react.useState)("All");
	const { data: dbProducts = [] } = useCategoryProducts(category);
	const { data: allCats = [] } = useActiveCategories();
	const children = allCats.find((c) => c.slug === category)?.children ?? [];
	const subs = ["All", ...children.map((c) => c.name)];
	const filtered = sub === "All" ? dbProducts : dbProducts.filter((p) => p.category_slug === children.find((c) => c.name === sub)?.slug);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pt-16 pb-24",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center px-6 mb-14 max-w-2xl mx-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "eyebrow",
					children: "The House of"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 font-serif text-5xl md:text-6xl",
					children: category === "clothing" ? "Clothing" : "Jewellery"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-5 text-muted-foreground",
					children: category === "clothing" ? "Silks, cashmere and ceremonial dress — slow tailored in our atelier." : "Recycled 18k gold and considered stones, finished entirely by hand."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-5 lg:px-10",
			children: [subs.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap justify-center gap-2 mb-14",
				children: subs.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setSub(s),
					className: `text-[11px] tracking-[0.28em] uppercase px-4 py-2 border transition-colors ${sub === s ? "border-foreground text-foreground" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"}`,
					children: s
				}, s))
			}), filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-center text-muted-foreground py-20",
				children: "New pieces in this collection are arriving soon."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-14 max-w-7xl mx-auto",
				children: filtered.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, { product: toProductProps(p) }, p.id))
			})]
		})]
	});
}
//#endregion
export { ShopCategory as component };
