import { o as __toESM } from "../_runtime.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useAuth, r as supabase } from "./auth-context-oFJLTVEi.mjs";
import { K as Eye, q as EyeOff } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as mapSignInError } from "./auth-errors-B1b4tayZ.mjs";
import { t as Route } from "./login-x9H7ejCE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-B4Ruiqho.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const { user, loading, signIn } = useAuth();
	const { redirectTo, confirmed } = Route.useSearch();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [remember, setRemember] = (0, import_react.useState)(false);
	const [showPw, setShowPw] = (0, import_react.useState)(false);
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const shouldRedirect = !loading && user && !confirmed;
	(0, import_react.useEffect)(() => {
		if (shouldRedirect) window.location.href = redirectTo;
	}, [shouldRedirect, redirectTo]);
	if (loading) return null;
	if (user && !confirmed) return null;
	const isLoggedInAndConfirmed = user && confirmed;
	async function determineRedirect() {
		if (redirectTo !== "/account") return redirectTo;
		const { data } = await supabase.rpc("has_admin_role", { required: "admin" });
		return data ? "/admin" : "/account";
	}
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSubmitting(true);
		const { error: signInError } = await signIn(email, password, remember);
		setSubmitting(false);
		if (signInError) {
			setError(mapSignInError(signInError));
			return;
		}
		toast.success("Welcome back");
		window.location.href = await determineRedirect();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 lg:px-10 py-20 max-w-md mx-auto",
		children: [confirmed && !isLoggedInAndConfirmed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-8 p-4 border border-emerald-500/30 bg-emerald-50/50 text-sm text-emerald-800",
			children: confirmed === "1" ? "Email confirmed. You can now sign in." : confirmed
		}), isLoggedInAndConfirmed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-8 p-4 border border-emerald-500/30 bg-emerald-50/50 text-sm text-emerald-800",
				children: confirmed === "1" ? "Email confirmed. Your account is ready." : confirmed
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/account",
				className: "inline-block bg-foreground text-background px-8 py-3.5 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink transition-all duration-300",
				children: "Go to My Account"
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center mb-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "eyebrow",
				children: "Welcome"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-5xl mt-3",
				children: "Sign In"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			className: "space-y-5",
			children: [
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] tracking-wider uppercase text-red/80 bg-red/5 border border-red/20 px-4 py-3",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Email",
					error: !!error,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "email",
						required: true,
						value: email,
						onChange: (e) => setEmail(e.target.value),
						className: "w-full bg-background border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors",
						autoComplete: "email"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Password",
					error: !!error,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: showPw ? "text" : "password",
							required: true,
							value: password,
							onChange: (e) => setPassword(e.target.value),
							className: "w-full bg-background border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors pr-11",
							autoComplete: "current-password"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setShowPw((v) => !v),
							className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
							tabIndex: -1,
							children: showPw ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" })
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center gap-2.5 text-sm text-muted-foreground cursor-pointer select-none",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: remember,
						onChange: (e) => setRemember(e.target.checked),
						className: "h-4 w-4 accent-foreground"
					}), "Remember me"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					disabled: submitting,
					className: "w-full bg-foreground text-background py-3.5 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink transition-all duration-300 disabled:opacity-50",
					children: submitting ? "Signing in…" : "Sign In"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between text-xs pt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/forgot-password",
						className: "hover-underline text-muted-foreground",
						children: "Forgot password?"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/register",
						className: "hover-underline",
						children: "Create account"
					})]
				})
			]
		})] })]
	});
}
function Field({ label, error, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2",
			children: label
		}), children]
	});
}
//#endregion
export { LoginPage as component };
