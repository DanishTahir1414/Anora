import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/terms-H2c3sgNO.js
var import_jsx_runtime = require_jsx_runtime();
function Terms() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 lg:px-10 py-16 max-w-3xl mx-auto",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center mb-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "eyebrow",
				children: "Legal"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-5xl mt-3",
				children: "Terms & Conditions"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-10 text-[15px] leading-[1.85] text-foreground/90",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "These terms govern your use of the ANORA website and services. By accessing the site you agree to these terms in full." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Use of the Site",
					children: "The site and its contents are owned by ANORA and protected by copyright. Personal, non-commercial use is permitted."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Orders",
					children: "All orders are subject to availability and confirmation. We reserve the right to refuse or cancel any order."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Pricing",
					children: "Prices are displayed in USD and may be subject to local taxes and duties at checkout."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Liability",
					children: "To the fullest extent permitted by law, ANORA shall not be liable for any indirect or consequential loss arising from use of the site."
				})
			]
		})]
	});
}
function Section({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 mb-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gold-rule" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "eyebrow",
			children: title
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children })] });
}
//#endregion
export { Terms as component };
