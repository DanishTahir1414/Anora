import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as blogPosts } from "./products-DA_AUvrV.mjs";
import { t as Route } from "./blogs._slug-wqYhH4zJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/blogs._slug-B2KD9OOD.js
var import_jsx_runtime = require_jsx_runtime();
function BlogPost() {
	const { post } = Route.useLoaderData();
	const recent = blogPosts.filter((b) => b.slug !== post.slug).slice(0, 2);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "pb-24",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "px-5 lg:px-10 pt-16 pb-12 text-center max-w-3xl mx-auto",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "eyebrow text-gold",
						children: post.category
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-serif text-4xl md:text-6xl mt-5 leading-[1.05]",
						children: post.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-6 text-sm text-muted-foreground",
						children: [
							post.date,
							" · ",
							post.readTime
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: post.cover,
				alt: post.title,
				className: "w-full max-w-5xl mx-auto aspect-[16/9] object-cover"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-w-2xl mx-auto px-6 py-14 space-y-6 text-[17px] leading-[1.85] text-foreground/90 font-serif",
				children: post.content.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: p }, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "px-5 lg:px-10 max-w-5xl mx-auto pt-10 border-t border-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow mb-6 text-center",
					children: "Continue Reading"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid md:grid-cols-2 gap-10",
					children: recent.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/blogs/$slug",
						params: { slug: b.slug },
						className: "group",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "overflow-hidden aspect-[4/3] bg-neutral",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: b.cover,
									alt: b.title,
									loading: "lazy",
									className: "h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-serif text-2xl mt-4 group-hover:text-gold transition-colors",
								children: b.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground mt-2",
								children: b.excerpt
							})
						]
					}, b.slug))
				})]
			})
		]
	});
}
//#endregion
export { BlogPost as component };
