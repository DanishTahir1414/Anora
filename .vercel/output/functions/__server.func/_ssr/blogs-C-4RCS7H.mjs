import { o as __toESM } from "../_runtime.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as blogPosts } from "./products-DA_AUvrV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/blogs-C-4RCS7H.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Blogs() {
	const [q, setQ] = (0, import_react.useState)("");
	const [cat, setCat] = (0, import_react.useState)("All");
	const cats = ["All", ...Array.from(new Set(blogPosts.map((b) => b.category)))];
	const filtered = (0, import_react.useMemo)(() => blogPosts.filter((b) => (cat === "All" || b.category === cat) && (b.title.toLowerCase().includes(q.toLowerCase()) || b.excerpt.toLowerCase().includes(q.toLowerCase()))), [q, cat]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 lg:px-10 py-16 max-w-7xl mx-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center mb-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "eyebrow",
						children: "The Journal"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-serif text-5xl md:text-6xl mt-4",
						children: "Quiet dispatches"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 text-muted-foreground max-w-xl mx-auto",
						children: "Stories from the atelier — craft, material, and the quiet pleasures of dress."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col md:flex-row items-center justify-center gap-6 mb-14",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: q,
					onChange: (e) => setQ(e.target.value),
					placeholder: "Search journal…",
					className: "w-full md:w-64 bg-transparent border-b border-border px-1 py-2 text-sm outline-none focus:border-foreground"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-2",
					children: cats.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setCat(c),
						className: `text-[11px] tracking-[0.28em] uppercase px-4 py-2 border transition-colors ${cat === c ? "border-foreground" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"}`,
						children: c
					}, c))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid md:grid-cols-3 gap-10",
				children: filtered.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/blogs/$slug",
					params: { slug: b.slug },
					className: "group block",
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
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "eyebrow mt-5",
							children: [
								b.category,
								" · ",
								b.readTime
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-serif text-2xl mt-3 group-hover:text-gold transition-colors",
							children: b.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground mt-2 leading-relaxed",
							children: b.excerpt
						})
					]
				}, b.slug))
			})
		]
	});
}
//#endregion
export { Blogs as component };
