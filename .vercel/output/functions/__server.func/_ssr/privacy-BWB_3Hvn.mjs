import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/privacy-BWB_3Hvn.js
var import_jsx_runtime = require_jsx_runtime();
function Privacy() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 lg:px-10 py-16 max-w-3xl mx-auto",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center mb-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "eyebrow",
				children: "Legal"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-5xl mt-3",
				children: "Privacy Policy"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-10 text-[15px] leading-[1.85] text-foreground/90",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Information Collection",
					children: "We collect only the information required to fulfil your order and improve your experience — name, contact details, delivery address, and payment information."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Cookies",
					children: "Cookies allow us to remember your preferences and personalise content. You may disable cookies in your browser at any time."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Payment Security",
					children: "Payments are processed by certified PCI-DSS compliant providers. We do not store your card details on our servers."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Third Party Services",
					children: "Selected partners assist us with shipping, analytics and marketing. They are bound by strict confidentiality agreements."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					title: "Your Rights",
					children: [
						"You may request access, correction or deletion of your personal data at any time by contacting ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-gold",
							children: "privacy@anora.com"
						}),
						"."
					]
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
export { Privacy as component };
