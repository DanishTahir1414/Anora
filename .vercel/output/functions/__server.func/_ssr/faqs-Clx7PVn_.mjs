import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { nt as ChevronDown } from "../_libs/lucide-react.mjs";
import { n as faqs } from "./products-DA_AUvrV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/faqs-Clx7PVn_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FaqsPage() {
	const [open, setOpen] = (0, import_react.useState)(0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 lg:px-10 py-16 max-w-3xl mx-auto",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center mb-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "eyebrow",
				children: "Help"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-5xl mt-3",
				children: "Frequently Asked"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "divide-y divide-border border-t border-b border-border",
			children: faqs.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => setOpen(open === i ? null : i),
				className: "w-full flex items-start justify-between gap-6 py-6 text-left",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-serif text-xl md:text-2xl pr-6",
					children: f.q
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `mt-2 h-4 w-4 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}` })]
			}), open === i && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "pb-6 -mt-2 text-muted-foreground leading-relaxed animate-fade",
				children: f.a
			})] }, f.q))
		})]
	});
}
//#endregion
export { FaqsPage as component };
