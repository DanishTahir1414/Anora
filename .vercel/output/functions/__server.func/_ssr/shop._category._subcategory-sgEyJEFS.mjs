import { P as notFound, m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as getActiveCategories } from "./categories-64c7mSWo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop._category._subcategory-sgEyJEFS.js
var $$splitNotFoundComponentImporter = () => import("./shop._category._subcategory-1BZWc2jE.mjs");
var $$splitComponentImporter = () => import("./shop._category._subcategory-CHoMEdzs.mjs");
var VALID_PARENT_SLUGS = ["clothing", "jewellery"];
var Route = createFileRoute("/shop/$category/$subcategory")({
	loader: async ({ params }) => {
		if (!VALID_PARENT_SLUGS.includes(params.category)) throw notFound();
		const child = (await getActiveCategories()).find((c) => c.slug === params.category)?.children.find((c) => c.slug === params.subcategory);
		if (!child) throw notFound();
		return {
			category: params.category,
			subcategory: params.subcategory,
			childName: child.name
		};
	},
	head: ({ params }) => {
		return { meta: [{ title: `${params.subcategory.charAt(0).toUpperCase() + params.subcategory.slice(1)} — ANORA` }, {
			name: "description",
			content: `Explore ANORA ${params.subcategory}.`
		}] };
	},
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
//#endregion
export { Route as t };
