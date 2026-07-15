import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-x9H7ejCE.js
var $$splitComponentImporter = () => import("./login-B4Ruiqho.mjs");
var Route = createFileRoute("/login")({
	validateSearch: (search) => ({
		redirectTo: typeof search.redirectTo === "string" ? search.redirectTo : "/account",
		confirmed: typeof search.confirmed === "string" ? search.confirmed : void 0
	}),
	head: () => ({ meta: [{ title: "Sign In — ANORA" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
