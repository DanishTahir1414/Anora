import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop._category.index-BTe1OYDo.js
var $$splitComponentImporter = () => import("./shop._category.index-Dyc1AS1W.mjs");
var Route = createFileRoute("/shop/$category/")({
	head: ({ params }) => {
		const name = params.category.charAt(0).toUpperCase() + params.category.slice(1);
		return { meta: [
			{ title: `${name} — ANORA` },
			{
				name: "description",
				content: `Explore the ANORA ${params.category} collection.`
			},
			{
				property: "og:title",
				content: `${name} — ANORA`
			}
		] };
	},
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
