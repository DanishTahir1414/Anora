import { o as __toESM } from "../_runtime.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useAuth } from "./auth-context-oFJLTVEi.mjs";
import { K as Eye, q as EyeOff } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as mapSignUpError } from "./auth-errors-B1b4tayZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/register-C84XE0fL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RegisterPage() {
	const { user, loading, signUp } = useAuth();
	const navigate = useNavigate();
	const [firstName, setFirstName] = (0, import_react.useState)("");
	const [lastName, setLastName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirmPassword, setConfirmPassword] = (0, import_react.useState)("");
	const [showPw, setShowPw] = (0, import_react.useState)(false);
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [done, setDone] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!loading && user) navigate({ to: "/account" });
	}, [user, loading]);
	if (loading) return null;
	if (user) return null;
	if (done) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 lg:px-10 py-20 max-w-md mx-auto text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "eyebrow",
				children: "Check your inbox"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-4xl mt-4",
				children: "Confirm your email"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground mt-4 leading-relaxed",
				children: [
					"We've sent a confirmation link to ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
						className: "text-foreground",
						children: email
					}),
					". Click the link to activate your account."
				]
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
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		if (password.length < 8) {
			setError("Choose a stronger password (minimum 8 characters).");
			return;
		}
		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}
		setSubmitting(true);
		const { error: signUpError, needsConfirmation } = await signUp(email, password, firstName, lastName);
		setSubmitting(false);
		if (signUpError) {
			setError(mapSignUpError(signUpError));
			return;
		}
		if (needsConfirmation) setDone(true);
		else {
			toast.success("Account created");
			navigate({ to: "/account" });
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 lg:px-10 py-20 max-w-md mx-auto",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center mb-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "eyebrow",
				children: "Welcome"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-5xl mt-3",
				children: "Create Account"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			className: "space-y-5",
			children: [
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] tracking-wider uppercase text-red/80 bg-red/5 border border-red/20 px-4 py-3",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "First name",
						error: !!error,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							value: firstName,
							onChange: (e) => setFirstName(e.target.value),
							className: "w-full bg-background border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors",
							autoComplete: "given-name"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Last name",
						error: !!error,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							value: lastName,
							onChange: (e) => setLastName(e.target.value),
							className: "w-full bg-background border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors",
							autoComplete: "family-name"
						})
					})]
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
							autoComplete: "new-password",
							minLength: 6
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setShowPw((v) => !v),
							className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
							tabIndex: -1,
							children: showPw ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" })
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Confirm password",
					error: !!error,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "password",
						required: true,
						value: confirmPassword,
						onChange: (e) => setConfirmPassword(e.target.value),
						className: "w-full bg-background border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors",
						autoComplete: "new-password"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					disabled: submitting,
					className: "w-full bg-foreground text-background py-3.5 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink transition-all duration-300 disabled:opacity-50",
					children: submitting ? "Creating account…" : "Create Account"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-center text-xs text-muted-foreground pt-2",
					children: [
						"Already have an account?",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/login",
							search: {
								redirectTo: "/account",
								confirmed: void 0
							},
							className: "hover-underline",
							children: "Sign in"
						})
					]
				})
			]
		})]
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
export { RegisterPage as component };
