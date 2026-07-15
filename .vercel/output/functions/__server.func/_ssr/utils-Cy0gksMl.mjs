import { o as __toESM } from "../_runtime.mjs";
import { _ as useNavigate, g as Link, l as useLocation } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useAuth, r as supabase } from "./auth-context-oFJLTVEi.mjs";
import { F as ListOrdered, H as Gift, I as LayoutList, L as LayoutDashboard, N as LogOut, O as MessageSquare, T as PackagePlus, U as FileText, Y as DollarSign, Z as Clock, d as Store, f as ShoppingCart, it as ChartColumn, m as Shield, n as Warehouse, r as Users, u as Tag } from "../_libs/lucide-react.mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-Cy0gksMl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminGuard({ children }) {
	const { user, loading, isAdmin } = useAuth();
	const navigate = useNavigate();
	const [serverVerified, setServerVerified] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (loading) return;
		if (!user) {
			navigate({
				to: "/login",
				search: {
					redirectTo: "/admin",
					confirmed: void 0
				},
				replace: true
			});
			return;
		}
		if (!isAdmin) {
			navigate({
				to: "/account",
				replace: true
			});
			return;
		}
		supabase.rpc("has_admin_role", { required: "admin" }).then(({ data, error }) => {
			if (error || !data) {
				navigate({
					to: "/login",
					search: {
						redirectTo: "/admin",
						confirmed: void 0
					},
					replace: true
				});
				return;
			}
			setServerVerified(true);
		});
	}, [
		user,
		loading,
		isAdmin,
		navigate
	]);
	if (loading || !loading && user && isAdmin && !serverVerified) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-8 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" })
	});
	if (!user || !isAdmin || !serverVerified) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var ITEMS = [
	{
		label: "Dashboard",
		to: "/admin",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutDashboard, { className: "h-4 w-4" })
	},
	{
		label: "Orders",
		to: "/admin/orders",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListOrdered, { className: "h-4 w-4" })
	},
	{
		label: "Products",
		to: "/admin/products",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackagePlus, { className: "h-4 w-4" })
	},
	{
		label: "Categories",
		to: "/admin/categories",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutList, { className: "h-4 w-4" })
	},
	{
		label: "Inventory",
		to: "/admin/inventory",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Warehouse, { className: "h-4 w-4" })
	},
	{
		label: "Customers",
		to: "/admin/customers",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4" })
	},
	{
		label: "Reviews",
		to: "/admin/reviews",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-4 w-4" })
	},
	{
		label: "Coupons",
		to: "/admin/coupons",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "h-4 w-4" })
	},
	{
		label: "Gift Cards",
		to: "/admin/gift-cards",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "h-4 w-4" })
	},
	{
		label: "Finance",
		to: "/admin/finance",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-4 w-4" })
	},
	{
		label: "Invoices",
		to: "/admin/finance/invoices",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" })
	},
	{
		label: "Reports",
		to: "/admin/reports",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "h-4 w-4" })
	},
	{
		label: "Activity",
		to: "/admin/activity",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4" })
	},
	{
		label: "Audit Logs",
		to: "/admin/security/audit-logs",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-4 w-4" })
	},
	{
		label: "Abandoned Carts",
		to: "/admin/abandoned-carts",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-4 w-4" })
	}
];
var USER_ITEMS = [{
	label: "Back to Store",
	to: "/",
	icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { className: "h-4 w-4" })
}];
function AdminSidebar() {
	const location = useLocation();
	const { signOut } = useAuth();
	function isActive(to) {
		if (to === "/admin") return location.pathname === "/admin";
		return location.pathname.startsWith(to);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "fixed left-0 top-0 h-screen w-56 border-r border-border/60 bg-background hidden lg:flex lg:flex-col z-40",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-4 border-b border-border/40 shrink-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/admin",
					className: "font-serif text-lg tracking-wide",
					children: "ANORA"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10px] tracking-[0.32em] uppercase text-muted-foreground mt-0.5",
					children: "Admin"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "flex-1 overflow-y-auto p-3 space-y-1 min-h-0",
				children: ITEMS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: item.to,
					className: `flex items-center gap-3 px-3 py-2 text-sm rounded transition-colors ${isActive(item.to) ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-neutral/50"}`,
					children: [item.icon, item.label]
				}, item.to))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-3 border-t border-border/40 space-y-1 shrink-0",
				children: [USER_ITEMS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: item.to,
					className: "flex items-center gap-3 px-3 py-2 text-sm rounded text-muted-foreground hover:text-foreground hover:bg-neutral/50 transition-colors",
					children: [item.icon, item.label]
				}, item.to + item.label)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: signOut,
					className: "flex w-full items-center gap-3 px-3 py-2 text-sm rounded text-muted-foreground hover:text-red/80 hover:bg-neutral/50 transition-colors",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" }), "Logout"]
				})]
			})
		]
	});
}
function AdminTopBar() {
	const { backToStore, signOut } = useAuth();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur-sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pl-56 flex items-center justify-end gap-3 px-6 h-14",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: backToStore,
					className: "flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { className: "h-3.5 w-3.5" }), "Back to Store"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground/40",
					children: "|"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: signOut,
					className: "flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-red/80 transition-colors",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-3.5 w-3.5" }), "Logout"]
				})
			]
		})
	});
}
function AdminLayout({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminGuard, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminSidebar, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pl-56",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTopBar, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "px-6 sm:px-8 lg:px-12 py-10 max-w-7xl mx-auto w-full",
				children
			})]
		})]
	}) });
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
export { cn as n, AdminLayout as t };
