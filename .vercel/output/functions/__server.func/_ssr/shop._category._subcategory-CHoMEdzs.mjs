import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as ProductCard } from "./ProductCard-CsDAKnP1.mjs";
import { o as useSubcategoryProducts, r as toProductProps } from "./categories-64c7mSWo.mjs";
import { t as Route } from "./shop._category._subcategory-sgEyJEFS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop._category._subcategory-CHoMEdzs.js
var import_jsx_runtime = require_jsx_runtime();
function ShopSubcategory() {
	const { category, subcategory, childName } = Route.useLoaderData();
	const { data: dbProducts = [] } = useSubcategoryProducts(category, subcategory);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pt-16 pb-24",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center px-6 mb-14 max-w-2xl mx-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "eyebrow",
				children: "The House of"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-4 font-serif text-5xl md:text-6xl",
				children: childName
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-5 lg:px-10",
			children: dbProducts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-center text-muted-foreground py-20",
				children: "New pieces in this collection are arriving soon."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-14 max-w-7xl mx-auto",
				children: dbProducts.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, { product: toProductProps(p) }, p.id))
			})
		})]
	});
}
//#endregion
export { ShopSubcategory as component };
