import { P as notFound, m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as blogPosts } from "./products-DA_AUvrV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/blogs._slug-wqYhH4zJ.js
var $$splitNotFoundComponentImporter = () => import("./blogs._slug-BUsJmn4F.mjs");
var $$splitComponentImporter = () => import("./blogs._slug-B2KD9OOD.mjs");
var Route = createFileRoute("/blogs/$slug")({
	loader: ({ params }) => {
		const post = blogPosts.find((b) => b.slug === params.slug);
		if (!post) throw notFound();
		return { post };
	},
	head: ({ loaderData }) => {
		const p = loaderData?.post;
		return { meta: [
			{ title: p ? `${p.title} — ANORA Journal` : "Journal — ANORA" },
			{
				name: "description",
				content: p?.excerpt ?? ""
			},
			{
				property: "og:title",
				content: p ? `${p.title} — ANORA` : "ANORA Journal"
			},
			{
				property: "og:description",
				content: p?.excerpt ?? ""
			},
			{
				property: "og:image",
				content: p?.cover ?? ""
			}
		] };
	},
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
//#endregion
export { Route as t };
