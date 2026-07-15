import { o as __toESM } from "../_runtime.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useAuth } from "./auth-context-oFJLTVEi.mjs";
import { t as mapForgotPasswordError } from "./auth-errors-B1b4tayZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/forgot-password-BkONsjgi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ForgotPasswordPage() {
	const { resetPassword } = useAuth();
	const [email, setEmail] = (0, import_react.useState)("");
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [sent, setSent] = (0, import_react.useState)(false);
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSubmitting(true);
		const { error: resetError } = await resetPassword(email);
		setSubmitting(false);
		if (resetError) {
			setError(mapForgotPasswordError(resetError));
			return;
		}
		setSent(true);
	};
	if (sent) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 lg:px-10 py-20 max-w-md mx-auto text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "eyebrow",
				children: "Check your inbox"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-4xl mt-4",
				children: "Reset link sent"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-4 leading-relaxed",
				children: "Password reset email sent."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-4 leading-relaxed",
				children: "If an account exists for this email address, you'll receive a password reset link shortly."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-4 leading-relaxed",
				children: "Please also check your Spam or Junk folder."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/login",
				search: {
					redirectTo: "/account",
					confirmed: void 0
				},
				className: "inline-block mt-8 text-[11px] tracking-[0.32em] uppercase hover-underline",
				children: "Back to sign in"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 lg:px-10 py-20 max-w-md mx-auto",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center mb-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "eyebrow",
					children: "Reset"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-serif text-5xl mt-3",
					children: "Forgot Password"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-4 leading-relaxed",
					children: "Enter your email and we'll send you a reset link."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			className: "space-y-5",
			children: [
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] tracking-wider uppercase text-red/80 bg-red/5 border border-red/20 px-4 py-3",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2",
						children: "Email"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "email",
						required: true,
						value: email,
						onChange: (e) => setEmail(e.target.value),
						className: "w-full bg-background border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors",
						autoComplete: "email"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					disabled: submitting,
					className: "w-full bg-foreground text-background py-3.5 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink transition-all duration-300 disabled:opacity-50",
					children: submitting ? "Sending…" : "Send Reset Link"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-center text-xs text-muted-foreground pt-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						search: {
							redirectTo: "/account",
							confirmed: void 0
						},
						className: "hover-underline",
						children: "Back to sign in"
					})
				})
			]
		})]
	});
}
//#endregion
export { ForgotPasswordPage as component };
