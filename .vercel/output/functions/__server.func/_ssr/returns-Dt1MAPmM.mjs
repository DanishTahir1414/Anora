import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/returns-Dt1MAPmM.js
var import_jsx_runtime = require_jsx_runtime();
function Returns() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 lg:px-10 py-16 max-w-3xl mx-auto",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center mb-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "eyebrow",
				children: "Care"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-5xl mt-3",
				children: "Exchange & Returns"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-10 text-[15px] leading-[1.85] text-foreground/90",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Return Period",
					children: "We accept returns within 14 days of delivery. Pieces must be unworn, unwashed and returned in their original packaging with all tags attached."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Exchange Conditions",
					children: "Exchanges are offered for size or colour, subject to availability. Fine jewellery and made-to-order garments are final sale."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
					title: "Refund Policy",
					children: "Refunds are processed to the original payment method within 5–7 business days of our receiving and inspecting your return."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
					title: "How to Request an Exchange",
					children: [
						"Request an exchange from My Orders, or email",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-gold",
							children: "care@anora.com"
						}),
						" with your order number. We will arrange complimentary collection and dispatch your new piece the moment your original is received."
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
export { Returns as component };
