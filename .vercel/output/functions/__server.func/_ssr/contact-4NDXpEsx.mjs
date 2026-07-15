import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { M as Mail, S as Phone, j as MapPin, k as MessageCircle } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/contact-4NDXpEsx.js
var import_jsx_runtime = require_jsx_runtime();
function Contact() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 lg:px-10 py-16 max-w-6xl mx-auto",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center mb-14",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "eyebrow",
					children: "Get in Touch"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-serif text-5xl md:text-6xl mt-3",
					children: "Contact Us"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-5 text-muted-foreground max-w-md mx-auto",
					children: "We answer every message personally, usually within a day."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid lg:grid-cols-2 gap-14",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					e.target.reset();
					toast.success("Message sent", { description: "We'll reply within a day." });
				},
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid sm:grid-cols-2 gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							label: "Name",
							required: true
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							label: "Email",
							type: "email",
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						label: "Phone",
						type: "tel"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2",
							children: "Message"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							required: true,
							rows: 6,
							className: "w-full bg-background border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors resize-none"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "bg-foreground text-background px-8 py-3.5 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink transition-colors",
						children: "Send Message"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-4 w-4" }),
						label: "WhatsApp",
						value: "+1 (347) 325-6525",
						href: "https://wa.me/15555555555"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-4 w-4" }),
						label: "Email",
						value: "care@anora.com",
						href: "mailto:care@anora.com"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-4 w-4" }),
						label: "Phone",
						value: "+1 (212) 555-0199",
						href: "tel:+12125550199"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4" }),
						label: "Atelier",
						value: "12 Atelier Lane, SoHo, New York, NY 10012"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
							title: "ANORA atelier on map",
							src: "https://www.openstreetmap.org/export/embed.html?bbox=-74.005%2C40.720%2C-73.995%2C40.728&layer=mapnik",
							className: "w-full aspect-[16/10] border-0",
							loading: "lazy"
						})
					})
				]
			})]
		})]
	});
}
function Input({ label, ...rest }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			...rest,
			className: "w-full bg-background border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors"
		})]
	});
}
function Info({ icon, label, value, href }) {
	const inner = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "h-9 w-9 grid place-items-center border border-border shrink-0",
			children: icon
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "eyebrow mb-1",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-serif text-lg",
			children: value
		})] })]
	});
	return href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
		href,
		className: "block hover:text-gold transition-colors",
		children: inner
	}) : inner;
}
//#endregion
export { Contact as component };
