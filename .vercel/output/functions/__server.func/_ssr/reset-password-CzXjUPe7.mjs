import { o as __toESM } from "../_runtime.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useAuth, r as supabase } from "./auth-context-oFJLTVEi.mjs";
import { K as Eye, q as EyeOff } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as mapResetPasswordError } from "./auth-errors-B1b4tayZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-password-CzXjUPe7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ResetPasswordPage() {
	useNavigate();
	const { user, loading: authLoading } = useAuth();
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirmPassword, setConfirmPassword] = (0, import_react.useState)("");
	const [showPw, setShowPw] = (0, import_react.useState)(false);
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [redirecting, setRedirecting] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [isRecoveryLink, setIsRecoveryLink] = (0, import_react.useState)(() => {
		return window.location.hash.includes("type=recovery");
	});
	(0, import_react.useEffect)(() => {
		if (!isRecoveryLink) return;
		if (user) {
			setIsRecoveryLink(false);
			return;
		}
		const timer = setTimeout(() => setIsRecoveryLink(false), 5e3);
		return () => clearTimeout(timer);
	}, [isRecoveryLink, user]);
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		if (password.length < 6) {
			setError("Password must be at least 6 characters");
			return;
		}
		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}
		setSubmitting(true);
		const { error: updateError } = await supabase.auth.updateUser({ password });
		setSubmitting(false);
		if (updateError) {
			setError(mapResetPasswordError(updateError));
			return;
		}
		toast.success("Password updated", { description: "Your password has been updated successfully. Redirecting you to the login page..." });
		setRedirecting(true);
		await supabase.auth.signOut();
		window.location.href = "/login?confirmed=Password reset successful. Sign in with your new password.";
	};
	if (authLoading || isRecoveryLink || redirecting) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-[60vh] items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-8 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" })
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 lg:px-10 py-20 max-w-md mx-auto text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "eyebrow",
				children: "Expired or invalid"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-4xl mt-4",
				children: "Reset link not recognised"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-4 leading-relaxed",
				children: "This password reset link may have expired or is invalid. Please request a new one."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/forgot-password",
				className: "inline-block mt-8 text-[11px] tracking-[0.32em] uppercase hover-underline",
				children: "Request new link"
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
					children: "New Password"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-4 leading-relaxed",
					children: "Enter your new password below."
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
						children: "New password"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: showPw ? "text" : "password",
							required: true,
							value: password,
							onChange: (e) => setPassword(e.target.value),
							className: "w-full bg-background border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors pr-11",
							autoComplete: "new-password",
							minLength: 6
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setShowPw((v) => !v),
							className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
							tabIndex: -1,
							children: showPw ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" })
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2",
						children: "Confirm new password"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "password",
						required: true,
						value: confirmPassword,
						onChange: (e) => setConfirmPassword(e.target.value),
						className: "w-full bg-background border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors",
						autoComplete: "new-password"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					disabled: submitting,
					className: "w-full bg-foreground text-background py-3.5 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink transition-all duration-300 disabled:opacity-50",
					children: submitting ? "Updating…" : "Update Password"
				})
			]
		})]
	});
}
//#endregion
export { ResetPasswordPage as component };
