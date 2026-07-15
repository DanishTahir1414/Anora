import { o as __toESM } from "../_runtime.mjs";
import { f as Outlet, l as useLocation } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { r as supabase } from "./auth-context-oFJLTVEi.mjs";
import { $ as CircleCheckBig, D as Minus, H as Gift, Q as CircleX, R as Layers, Y as DollarSign, Z as Clock, _ as RotateCcw, a as UserPlus, c as TrendingUp, ct as ArrowRightLeft, f as ShoppingCart, l as TrendingDown, r as Users, s as TriangleAlert, u as Tag, v as Repeat, w as Package, y as RefreshCw } from "../_libs/lucide-react.mjs";
import { t as AdminLayout } from "./utils-Cy0gksMl.mjs";
import { t as Skeleton } from "./skeleton-9naKPw9_.mjs";
import { t as DashboardCard } from "./DashboardCard-DEbOb3YD.mjs";
import { t as Input } from "./input-Ch8T9SMc.mjs";
import { t as Button } from "./button-Dfd9l4mi.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-CvsFPszi.mjs";
import { a as useCouponAnalytics } from "./admin-coupons-ChZ61okb.mjs";
import { r as useGiftCardAnalytics } from "./admin-gift-cards-DF1Dj7an.mjs";
import { a as XAxis, c as Bar, d as ResponsiveContainer, f as Tooltip, i as YAxis, l as Pie, n as PieChart, o as Area, p as Legend, r as BarChart, s as CartesianGrid, t as AreaChart, u as Cell } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-BD0qzwia.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useAdminOrders(page, pageSize, search = "", sortBy = "created_at", sortDir = "desc") {
	const [result, setResult] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setError(null);
			const offset = (page - 1) * pageSize;
			let query = supabase.from("orders").select("id, order_number, total, status, payment_status, created_at, shipping_address, user_id", { count: "exact" });
			if (search) {
				const sanitized = search.replace(/[^a-zA-Z0-9 @._-]/g, "");
				if (sanitized) query = query.or(`order_number.ilike.%${sanitized}%,shipping_address->>firstName.ilike.%${sanitized}%,shipping_address->>lastName.ilike.%${sanitized}%`);
			}
			const safeSortBy = new Set([
				"created_at",
				"total",
				"status",
				"order_number"
			]).has(sortBy) ? sortBy : "created_at";
			const safeSortDir = sortDir === "asc" ? "asc" : "desc";
			const { data, error: err, count } = await query.order(safeSortBy, { ascending: safeSortDir === "asc" }).range(offset, offset + pageSize - 1);
			if (err) throw err;
			setResult({
				orders: (data ?? []).map((row) => {
					const addr = typeof row.shipping_address === "object" && row.shipping_address !== null ? row.shipping_address : {};
					return {
						id: row.id,
						order_number: row.order_number,
						customer_name: [addr.firstName, addr.lastName].filter(Boolean).join(" ") || "—",
						customer_email: addr.email ?? "—",
						total: Number(row.total),
						status: row.status,
						created_at: row.created_at
					};
				}),
				total: count ?? 0
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, [
		page,
		pageSize,
		search,
		sortBy,
		sortDir
	]);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	return {
		result,
		loading,
		error,
		refetch: load
	};
}
function useAdminCustomers(page, pageSize, search = "", sortBy = "created_at", sortDir = "desc") {
	const [result, setResult] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setError(null);
			const offset = (page - 1) * pageSize;
			let query = supabase.from("profiles").select("id, email, first_name, last_name, role, created_at, updated_at", { count: "exact" });
			if (search) {
				const sanitized = search.replace(/[^a-zA-Z0-9 @._-]/g, "");
				if (sanitized) query = query.or(`email.ilike.%${sanitized}%,first_name.ilike.%${sanitized}%,last_name.ilike.%${sanitized}%`);
			}
			const safeSortBy = new Set(["first_name", "created_at"]).has(sortBy) ? sortBy : "created_at";
			const safeSortDir = sortDir === "asc" ? "asc" : "desc";
			const { data, error: err, count } = await query.order(safeSortBy, { ascending: safeSortDir === "asc" }).range(offset, offset + pageSize - 1);
			if (err) throw err;
			const profileIds = (data ?? []).map((r) => r.id);
			const orderCountMap = /* @__PURE__ */ new Map();
			if (profileIds.length > 0) {
				const { data: orderRows } = await supabase.from("orders").select("user_id").in("user_id", profileIds);
				if (orderRows) for (const o of orderRows) orderCountMap.set(o.user_id, (orderCountMap.get(o.user_id) ?? 0) + 1);
			}
			const customers = (data ?? []).map((row) => ({
				id: row.id,
				first_name: row.first_name,
				last_name: row.last_name,
				email: row.email,
				role: row.role,
				created_at: row.created_at,
				updated_at: row.updated_at,
				total_orders: orderCountMap.get(row.id) ?? 0
			}));
			if (sortBy === "total_orders") customers.sort((a, b) => safeSortDir === "asc" ? a.total_orders - b.total_orders : b.total_orders - a.total_orders);
			setResult({
				customers,
				total: count ?? 0
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, [
		page,
		pageSize,
		search,
		sortBy,
		sortDir
	]);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	return {
		result,
		loading,
		error,
		refetch: load
	};
}
function useAdminLowStock(page, pageSize, search = "") {
	const [result, setResult] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setError(null);
			const offset = (page - 1) * pageSize;
			let query = supabase.from("products").select("id, name, sku, stock", { count: "exact" }).eq("is_active", true).lte("stock", 10);
			if (search) {
				const sanitized = search.replace(/[^a-zA-Z0-9 @._/-]/g, "");
				if (sanitized) query = query.or(`name.ilike.%${sanitized}%,sku.ilike.%${sanitized}%`);
			}
			const { data, error: err, count } = await query.order("stock", { ascending: true }).range(offset, offset + pageSize - 1);
			if (err) throw err;
			setResult({
				products: (data ?? []).map((row) => ({
					id: row.id,
					name: row.name,
					sku: row.sku,
					stock: row.stock
				})),
				total: count ?? 0
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, [
		page,
		pageSize,
		search
	]);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	return {
		result,
		loading,
		error,
		refetch: load
	};
}
var STOCK_STATUS = {
	critical: {
		label: "Critical",
		classes: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
	},
	low: {
		label: "Low",
		classes: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
	},
	warning: {
		label: "Warning",
		classes: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
	}
};
function getStockStatus(stock) {
	if (stock <= 2) return STOCK_STATUS.critical;
	if (stock <= 5) return STOCK_STATUS.low;
	return STOCK_STATUS.warning;
}
function LowStockSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" }), Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-12 w-full" }, i))]
	});
}
function LowStockEmptyState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "border border-border/60 p-10 text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "All products are well-stocked"
		})
	});
}
function LowStockErrorState({ message, onRetry }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border border-red/20 bg-red/5 p-6 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-red/80",
			children: message
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			size: "sm",
			onClick: onRetry,
			className: "mt-3",
			children: "Retry"
		})]
	});
}
function Pagination$2({ page, total, pageSize, onPage }) {
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between text-sm text-muted-foreground pt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
			total,
			" product",
			total !== 1 ? "s" : ""
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					disabled: page <= 1,
					onClick: () => onPage(page - 1),
					children: "Previous"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs",
					children: [
						"Page ",
						page,
						" of ",
						totalPages
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					disabled: page >= totalPages,
					onClick: () => onPage(page + 1),
					children: "Next"
				})
			]
		})]
	});
}
function LowStockWidget() {
	const [page, setPage] = (0, import_react.useState)(1);
	const [searchInput, setSearchInput] = (0, import_react.useState)("");
	const [debouncedSearch, setDebouncedSearch] = (0, import_react.useState)("");
	const pageSize = 10;
	(0, import_react.useEffect)(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchInput);
		}, 300);
		return () => clearTimeout(timer);
	}, [searchInput]);
	const { result, loading, error, refetch } = useAdminLowStock(page, pageSize, debouncedSearch);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between mb-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-serif text-xl",
				children: "Low Stock Products"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: "Search products…",
				value: searchInput,
				onChange: (e) => {
					setSearchInput(e.target.value);
					setPage(1);
				},
				className: "max-w-60 h-9 text-sm"
			})]
		}),
		error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LowStockErrorState, {
			message: error,
			onRetry: refetch
		}),
		loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LowStockSkeleton, {}),
		!loading && !error && result && result.products.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LowStockEmptyState, {}),
		!loading && !error && result && result.products.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border border-border/60 overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Product Name" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "SKU" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					className: "text-right",
					children: "Current Stock"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Stock Status" })
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: result.products.map((p) => {
				const status = getStockStatus(p.stock);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-medium",
						children: p.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs text-muted-foreground font-mono",
						children: p.sku ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right font-mono",
						children: p.stock
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `inline-block px-2.5 py-1 text-[10px] tracking-[0.2em] uppercase ${status.classes}`,
						children: status.label
					}) })
				] }, p.id);
			}) })] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination$2, {
			page,
			total: result.total,
			pageSize,
			onPage: setPage
		})] })
	] });
}
function CustomersSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" }), Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-12 w-full" }, i))]
	});
}
function CustomersEmptyState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "border border-border/60 p-10 text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "No customers found"
		})
	});
}
function CustomersErrorState({ message, onRetry }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border border-red/20 bg-red/5 p-6 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-red/80",
			children: message
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			size: "sm",
			onClick: onRetry,
			className: "mt-3",
			children: "Retry"
		})]
	});
}
function Pagination$1({ page, total, pageSize, onPage }) {
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between text-sm text-muted-foreground pt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
			total,
			" customer",
			total !== 1 ? "s" : ""
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					disabled: page <= 1,
					onClick: () => onPage(page - 1),
					children: "Previous"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs",
					children: [
						"Page ",
						page,
						" of ",
						totalPages
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					disabled: page >= totalPages,
					onClick: () => onPage(page + 1),
					children: "Next"
				})
			]
		})]
	});
}
function RecentCustomersTable() {
	const [page, setPage] = (0, import_react.useState)(1);
	const [searchInput, setSearchInput] = (0, import_react.useState)("");
	const [debouncedSearch, setDebouncedSearch] = (0, import_react.useState)("");
	const [sortBy, setSortBy] = (0, import_react.useState)("created_at");
	const [sortDir, setSortDir] = (0, import_react.useState)("desc");
	const pageSize = 10;
	(0, import_react.useEffect)(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchInput);
		}, 300);
		return () => clearTimeout(timer);
	}, [searchInput]);
	const { result, loading, error, refetch } = useAdminCustomers(page, pageSize, debouncedSearch, sortBy, sortDir);
	function toggleSort(column) {
		if (sortBy === column) setSortDir((d) => d === "asc" ? "desc" : "asc");
		else {
			setSortBy(column);
			setSortDir("desc");
		}
		setPage(1);
	}
	function SortIcon({ column }) {
		if (sortBy !== column) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground/40 ml-1",
			children: "↕"
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "ml-1",
			children: sortDir === "asc" ? "↑" : "↓"
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between mb-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-serif text-xl",
				children: "Recent Customers"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: "Search customers…",
				value: searchInput,
				onChange: (e) => {
					setSearchInput(e.target.value);
					setPage(1);
				},
				className: "max-w-60 h-9 text-sm"
			})]
		}),
		error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomersErrorState, {
			message: error,
			onRetry: refetch
		}),
		loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomersSkeleton, {}),
		!loading && !error && result && result.customers.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomersEmptyState, {}),
		!loading && !error && result && result.customers.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border border-border/60 overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
					className: "cursor-pointer",
					onClick: () => toggleSort("first_name"),
					children: ["Customer", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "first_name" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Email" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Role" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
					className: "cursor-pointer",
					onClick: () => toggleSort("created_at"),
					children: ["Registration Date", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "created_at" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
					className: "cursor-pointer text-right",
					onClick: () => toggleSort("total_orders"),
					children: ["Total Orders", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "total_orders" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Last Activity" })
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: result.customers.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "font-medium",
					children: [c.first_name, c.last_name].filter(Boolean).join(" ") || "—"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "text-xs text-muted-foreground",
					children: c.email
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "text-xs capitalize",
					children: c.role
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "text-xs text-muted-foreground",
					children: new Date(c.created_at).toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
						year: "numeric"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "text-right",
					children: c.total_orders
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "text-xs text-muted-foreground",
					children: new Date(c.updated_at).toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
						year: "numeric"
					})
				})
			] }, c.id)) })] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination$1, {
			page,
			total: result.total,
			pageSize,
			onPage: setPage
		})] })
	] });
}
var STATUS_BADGES = {
	pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
	confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
	processing: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
	shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
	delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
	cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
	refunded: "bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-300"
};
function StatusBadge({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `inline-block px-2.5 py-1 text-[10px] tracking-[0.2em] uppercase ${STATUS_BADGES[status] ?? "bg-neutral-100 text-muted-foreground"}`,
		children: status
	});
}
function OrdersTableSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" }), Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-12 w-full" }, i))]
	});
}
function OrdersEmptyState() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "border border-border/60 p-10 text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "No orders found"
		})
	});
}
function OrdersErrorState({ message, onRetry }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border border-red/20 bg-red/5 p-6 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-red/80",
			children: message
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			size: "sm",
			onClick: onRetry,
			className: "mt-3",
			children: "Retry"
		})]
	});
}
function Pagination({ page, total, pageSize, onPage }) {
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between text-sm text-muted-foreground pt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
			total,
			" order",
			total !== 1 ? "s" : ""
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					disabled: page <= 1,
					onClick: () => onPage(page - 1),
					children: "Previous"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs",
					children: [
						"Page ",
						page,
						" of ",
						totalPages
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					disabled: page >= totalPages,
					onClick: () => onPage(page + 1),
					children: "Next"
				})
			]
		})]
	});
}
function RecentOrdersTable() {
	const [page, setPage] = (0, import_react.useState)(1);
	const [search, setSearch] = (0, import_react.useState)("");
	const [sortBy, setSortBy] = (0, import_react.useState)("created_at");
	const [sortDir, setSortDir] = (0, import_react.useState)("desc");
	const pageSize = 10;
	const { result, loading, error, refetch } = useAdminOrders(page, pageSize, search, sortBy, sortDir);
	function toggleSort(column) {
		if (sortBy === column) setSortDir((d) => d === "asc" ? "desc" : "asc");
		else {
			setSortBy(column);
			setSortDir("desc");
		}
		setPage(1);
	}
	function SortIcon({ column }) {
		if (sortBy !== column) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground/40 ml-1",
			children: "↕"
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "ml-1",
			children: sortDir === "asc" ? "↑" : "↓"
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between mb-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-serif text-xl",
				children: "Recent Orders"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: "Search orders…",
				value: search,
				onChange: (e) => {
					setSearch(e.target.value);
					setPage(1);
				},
				className: "max-w-60 h-9 text-sm"
			})]
		}),
		error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrdersErrorState, {
			message: error,
			onRetry: refetch
		}),
		loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrdersTableSkeleton, {}),
		!loading && !error && result && result.orders.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrdersEmptyState, {}),
		!loading && !error && result && result.orders.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border border-border/60 overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
					className: "cursor-pointer",
					onClick: () => toggleSort("order_number"),
					children: ["Order", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "order_number" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Customer" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Email" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
					className: "cursor-pointer",
					onClick: () => toggleSort("total"),
					children: ["Total", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "total" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
					className: "cursor-pointer",
					onClick: () => toggleSort("status"),
					children: ["Status", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "status" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
					className: "cursor-pointer",
					onClick: () => toggleSort("created_at"),
					children: ["Date", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "created_at" })]
				})
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: result.orders.map((order) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "font-mono text-xs",
					children: order.order_number ?? order.id.slice(0, 8)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: order.customer_name }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "text-muted-foreground text-xs",
					children: order.customer_email
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
					className: "font-serif",
					children: ["$", Number(order.total).toLocaleString()]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: order.status }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					className: "text-xs text-muted-foreground",
					children: new Date(order.created_at).toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
						year: "numeric"
					})
				})
			] }, order.id)) })] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
			page,
			total: result.total,
			pageSize,
			onPage: setPage
		})] })
	] });
}
async function rpc(name, params) {
	const { data, error } = await supabase.rpc(name, params);
	if (error) throw error;
	return data;
}
function useAnalyticsSummary() {
	const [summary, setSummary] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setError(null);
			setSummary(await rpc("get_analytics_summary"));
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	return {
		summary,
		loading,
		error,
		refetch: load
	};
}
function useSalesAnalytics(period = "daily") {
	const [data, setData] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setError(null);
			setData(await rpc("get_sales_analytics", { p_period: period }));
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, [period]);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	return {
		data,
		loading,
		error,
		refetch: load
	};
}
function useRevenueAnalytics() {
	const [analytics, setAnalytics] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setError(null);
			setAnalytics(await rpc("get_revenue_analytics"));
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	return {
		analytics,
		loading,
		error,
		refetch: load
	};
}
function useOrdersByStatus() {
	const [data, setData] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setError(null);
			setData(await rpc("get_orders_by_status_distribution"));
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	return {
		data,
		loading,
		error,
		refetch: load
	};
}
function useOrdersByCategory() {
	const [data, setData] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setError(null);
			setData(await rpc("get_orders_by_category_distribution"));
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	return {
		data,
		loading,
		error,
		refetch: load
	};
}
function useCustomerAnalytics() {
	const [analytics, setAnalytics] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setError(null);
			setAnalytics(await rpc("get_customer_analytics"));
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	return {
		analytics,
		loading,
		error,
		refetch: load
	};
}
function useTopSellingProducts() {
	const [data, setData] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setError(null);
			setData(await rpc("get_top_selling_products", { p_limit: 10 }));
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	return {
		data,
		loading,
		error,
		refetch: load
	};
}
function useBottomSellingProducts() {
	const [data, setData] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setError(null);
			setData(await rpc("get_bottom_selling_products", { p_limit: 10 }));
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	return {
		data,
		loading,
		error,
		refetch: load
	};
}
var PERIODS = [
	{
		key: "daily",
		label: "Daily"
	},
	{
		key: "weekly",
		label: "Weekly"
	},
	{
		key: "monthly",
		label: "Monthly"
	},
	{
		key: "yearly",
		label: "Yearly"
	}
];
function formatSalesValue(n) {
	if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
	if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
	return `$${n.toFixed(0)}`;
}
function ChartContent({ data, period }) {
	if (data.length === 0 || data.every((d) => d.orders === 0 && d.sales === 0)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col items-center justify-center py-16 text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "No sales data for this period"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
		width: "100%",
		height: 320,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
			data,
			margin: {
				top: 8,
				right: 8,
				left: 0,
				bottom: 0
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
					strokeDasharray: "3 3",
					className: "stroke-border/50"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
					dataKey: period === "yearly" ? "date" : "date",
					tick: { fontSize: 11 },
					className: "text-muted-foreground",
					tickLine: false,
					axisLine: false,
					interval: "preserveStartEnd"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
					tick: { fontSize: 11 },
					className: "text-muted-foreground",
					tickLine: false,
					axisLine: false,
					tickFormatter: formatSalesValue
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: ({ active, payload, label }) => {
					if (!active || !payload?.length) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium mb-1",
							children: label
						}), payload.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-2 w-2 rounded-full",
									style: { backgroundColor: entry.color }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted-foreground",
									children: [entry.name === "sales" ? "Revenue" : "Orders", ":"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium tabular-nums",
									children: entry.dataKey === "sales" ? `$${Number(entry.value).toLocaleString()}` : Number(entry.value).toLocaleString()
								})
							]
						}, entry.dataKey))]
					});
				} }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { formatter: (value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs text-muted-foreground",
					children: value === "sales" ? "Revenue" : "Orders"
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					dataKey: "sales",
					fill: "hsl(var(--primary))",
					radius: [
						2,
						2,
						0,
						0
					],
					opacity: .85,
					name: "sales"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					dataKey: "orders",
					fill: "hsl(var(--chart-2, 200 70% 50%))",
					radius: [
						2,
						2,
						0,
						0
					],
					opacity: .5,
					name: "orders"
				})
			]
		})
	});
}
function SalesChart() {
	const [period, setPeriod] = (0, import_react.useState)("monthly");
	const { data, loading, error, refetch } = useSalesAnalytics(period);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: "Analytics"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-serif text-2xl mt-1",
				children: "Sales"
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1 rounded-lg bg-muted p-1",
				children: PERIODS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setPeriod(p.key),
					className: `px-3 py-1.5 text-[11px] tracking-[0.2em] uppercase rounded-md transition-colors ${period === p.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
					children: p.label
				}, p.key))
			})]
		}),
		error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border border-red/20 bg-red/5 p-8 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-red/80",
				children: error
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: refetch,
				className: "mt-4 text-[11px] tracking-[0.32em] uppercase text-muted-foreground hover:text-foreground transition-colors",
				children: "Try again"
			})]
		}),
		loading && !error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-[320px] w-full rounded-lg" }),
		!loading && !error && data && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartContent, {
			data,
			period
		})
	] });
}
function formatCurrency$1(n) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(n);
}
function RevenueChart() {
	const { analytics, loading, error, refetch } = useRevenueAnalytics();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: "Analytics"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-serif text-2xl mt-1",
				children: "Revenue"
			})]
		}),
		error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border border-red/20 bg-red/5 p-8 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-red/80",
				children: error
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: refetch,
				className: "mt-4 text-[11px] tracking-[0.32em] uppercase text-muted-foreground hover:text-foreground transition-colors",
				children: "Try again"
			})]
		}),
		loading && !error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 rounded-lg" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 rounded-lg" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 rounded-lg" })
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-[280px] w-full rounded-lg" })]
		}),
		!loading && !error && analytics && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border border-border/60 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] sm:text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-1",
						children: "Current Period"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-serif text-2xl tabular-nums tracking-tight",
						children: formatCurrency$1(analytics.current)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border border-border/60 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] sm:text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-1",
						children: "Previous Period"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-serif text-2xl tabular-nums tracking-tight",
						children: formatCurrency$1(analytics.previous)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border border-border/60 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] sm:text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-1",
						children: "Change"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [analytics.change > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-5 w-5 text-emerald-500" }) : analytics.change < 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "h-5 w-5 text-red-500" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "h-5 w-5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: `font-serif text-2xl tabular-nums tracking-tight ${analytics.change > 0 ? "text-emerald-600 dark:text-emerald-400" : analytics.change < 0 ? "text-red-600 dark:text-red-400" : ""}`,
							children: [
								analytics.change > 0 ? "+" : "",
								analytics.change,
								"%"
							]
						})]
					})]
				})
			]
		}), analytics.trend.length > 0 && analytics.trend.some((t) => t.sales > 0) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: 280,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
				data: analytics.trend,
				margin: {
					top: 8,
					right: 8,
					left: 0,
					bottom: 0
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
						id: "revenueGradient",
						x1: "0",
						y1: "0",
						x2: "0",
						y2: "1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "5%",
							stopColor: "hsl(var(--primary))",
							stopOpacity: .3
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "95%",
							stopColor: "hsl(var(--primary))",
							stopOpacity: 0
						})]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
						strokeDasharray: "3 3",
						className: "stroke-border/50"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "date",
						tick: { fontSize: 11 },
						className: "text-muted-foreground",
						tickLine: false,
						axisLine: false,
						interval: "preserveStartEnd"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						tick: { fontSize: 11 },
						className: "text-muted-foreground",
						tickLine: false,
						axisLine: false,
						tickFormatter: (v) => `$${(v / 1e3).toFixed(0)}K`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: ({ active, payload, label }) => {
						if (!active || !payload?.length) return null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium mb-1",
								children: label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "tabular-nums",
								children: formatCurrency$1(Number(payload[0].value))
							})]
						});
					} }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
						type: "monotone",
						dataKey: "sales",
						stroke: "hsl(var(--primary))",
						fill: "url(#revenueGradient)",
						strokeWidth: 2
					})
				]
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col items-center justify-center py-16 text-center border border-border/60",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No revenue data available"
			})
		})] })
	] });
}
var STATUS_COLORS = {
	pending: "#f59e0b",
	confirmed: "#3b82f6",
	processing: "#8b5cf6",
	shipped: "#06b6d4",
	delivered: "#10b981",
	returned: "#f97316",
	cancelled: "#ef4444",
	refunded: "#6b7280"
};
var CATEGORY_COLORS = [
	"#6366f1",
	"#ec4899",
	"#14b8a6",
	"#f97316",
	"#8b5cf6",
	"#06b6d4",
	"#84cc16",
	"#e11d48",
	"#0ea5e9",
	"#a855f7"
];
function EmptyState({ message }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col items-center justify-center py-12 text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: message
		})
	});
}
function ErrorState({ error, onRetry }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border border-red/20 bg-red/5 p-6 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-red/80",
			children: error
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			onClick: onRetry,
			className: "mt-3 text-[11px] tracking-[0.32em] uppercase text-muted-foreground hover:text-foreground transition-colors",
			children: "Try again"
		})]
	});
}
function ChartSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-[260px] w-full rounded-lg" });
}
function OrdersByStatusChartContent({ data }) {
	if (data.length === 0 || data.every((d) => d.count === 0)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { message: "No orders found" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
		width: "100%",
		height: 260,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
			data,
			layout: "vertical",
			margin: {
				top: 4,
				right: 8,
				left: 0,
				bottom: 0
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
					strokeDasharray: "3 3",
					className: "stroke-border/50",
					horizontal: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
					type: "number",
					tick: { fontSize: 11 },
					className: "text-muted-foreground",
					tickLine: false,
					axisLine: false
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
					type: "category",
					dataKey: "status",
					tick: { fontSize: 11 },
					className: "text-muted-foreground [&_.recharts-text]:capitalize",
					tickLine: false,
					axisLine: false,
					width: 80
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: ({ active, payload, label }) => {
					if (!active || !payload?.length) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "capitalize font-medium mb-1",
							children: label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "tabular-nums",
							children: [Number(payload[0].value).toLocaleString(), " orders"]
						})]
					});
				} }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					dataKey: "count",
					radius: [
						0,
						2,
						2,
						0
					],
					children: data.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: STATUS_COLORS[entry.status] || "#6b7280" }, entry.status))
				})
			]
		})
	});
}
function OrdersByCategoryChartContent({ data }) {
	if (data.length === 0 || data.every((d) => d.count === 0)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { message: "No category data available" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
		width: "100%",
		height: 260,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
				data,
				dataKey: "count",
				nameKey: "category",
				cx: "50%",
				cy: "50%",
				outerRadius: 90,
				innerRadius: 50,
				paddingAngle: 2,
				children: data.map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }, index))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: ({ active, payload }) => {
				if (!active || !payload?.length) return null;
				const entry = payload[0];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium mb-1",
						children: entry.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "tabular-nums",
						children: [Number(entry.value).toLocaleString(), " orders"]
					})]
				});
			} }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, { formatter: (value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-muted-foreground",
				children: value
			}) })
		] })
	});
}
function OrdersAnalytics() {
	const { data: statusData, loading: statusLoading, error: statusError, refetch: statusRefetch } = useOrdersByStatus();
	const { data: categoryData, loading: categoryLoading, error: categoryError, refetch: categoryRefetch } = useOrdersByCategory();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "eyebrow",
			children: "Analytics"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-serif text-2xl mt-1",
			children: "Orders"
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-1 lg:grid-cols-2 gap-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border border-border/60 p-4 sm:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10px] sm:text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-4",
					children: "By Status"
				}),
				statusError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
					error: statusError,
					onRetry: statusRefetch
				}),
				statusLoading && !statusError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartSkeleton, {}),
				!statusLoading && !statusError && statusData && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrdersByStatusChartContent, { data: statusData })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border border-border/60 p-4 sm:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[10px] sm:text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-4",
					children: "By Category"
				}),
				categoryError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
					error: categoryError,
					onRetry: categoryRefetch
				}),
				categoryLoading && !categoryError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartSkeleton, {}),
				!categoryLoading && !categoryError && categoryData && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrdersByCategoryChartContent, { data: categoryData })
			]
		})]
	})] });
}
var COLORS = ["#6366f1", "#14b8a6"];
function CustomerAnalytics() {
	const { analytics, loading, error, refetch } = useCustomerAnalytics();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: "Analytics"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-serif text-2xl mt-1",
				children: "Customers"
			})]
		}),
		error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border border-red/20 bg-red/5 p-8 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-red/80",
				children: error
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: refetch,
				className: "mt-4 text-[11px] tracking-[0.32em] uppercase text-muted-foreground hover:text-foreground transition-colors",
				children: "Try again"
			})]
		}),
		loading && !error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 rounded-lg" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 rounded-lg" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 rounded-lg" })
			]
		}),
		!loading && !error && analytics && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border border-border/60 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2 mb-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] sm:text-[11px] tracking-[0.32em] uppercase text-muted-foreground",
							children: "New Customers"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-4 w-4 text-indigo-500" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-serif text-2xl tabular-nums tracking-tight",
						children: analytics.newCustomers.toLocaleString()
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border border-border/60 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2 mb-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] sm:text-[11px] tracking-[0.32em] uppercase text-muted-foreground",
							children: "Returning Customers"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, { className: "h-4 w-4 text-teal-500" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-serif text-2xl tabular-nums tracking-tight",
						children: analytics.returningCustomers.toLocaleString()
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border border-border/60 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2 mb-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] sm:text-[11px] tracking-[0.32em] uppercase text-muted-foreground",
							children: "Total Active"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4 text-muted-foreground" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-serif text-2xl tabular-nums tracking-tight",
						children: (analytics.newCustomers + analytics.returningCustomers).toLocaleString()
					})]
				})
			]
		}), analytics.newCustomers === 0 && analytics.returningCustomers === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col items-center justify-center py-12 text-center border border-border/60",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No customer activity data available"
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: 220,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
				data: [{
					name: "New Customers",
					value: analytics.newCustomers
				}, {
					name: "Returning Customers",
					value: analytics.returningCustomers
				}],
				margin: {
					top: 8,
					right: 8,
					left: 0,
					bottom: 0
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
						strokeDasharray: "3 3",
						className: "stroke-border/50",
						vertical: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "name",
						tick: { fontSize: 11 },
						className: "text-muted-foreground",
						tickLine: false,
						axisLine: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						tick: { fontSize: 11 },
						className: "text-muted-foreground",
						tickLine: false,
						axisLine: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: ({ active, payload, label }) => {
						if (!active || !payload?.length) return null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium mb-1",
								children: label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "tabular-nums",
								children: Number(payload[0].value).toLocaleString()
							})]
						});
					} }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Bar, {
						dataKey: "value",
						radius: [
							4,
							4,
							0,
							0
						],
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: COLORS[0] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: COLORS[1] })]
					})
				]
			})
		})] })
	] });
}
function formatCurrency(n) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(n);
}
function ProductTable({ title, data, loading, error, onRetry, variant }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border border-border/60 p-4 sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[10px] sm:text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-4",
				children: title
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border border-red/20 bg-red/5 p-6 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-red/80",
					children: error
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onRetry,
					className: "mt-3 text-[11px] tracking-[0.32em] uppercase text-muted-foreground hover:text-foreground transition-colors",
					children: "Try again"
				})]
			}),
			loading && !error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full rounded" }, i))
			}),
			!loading && !error && data && data.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col items-center justify-center py-10 text-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No data available"
				})
			}),
			!loading && !error && data && data.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border/40",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 pr-4 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-medium",
								children: "#"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 pr-4 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-medium",
								children: "Product"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 pr-4 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-medium text-right",
								children: "Orders"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "pb-2 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-medium text-right",
								children: "Revenue"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: data.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border/20 last:border-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2.5 pr-4 text-muted-foreground tabular-nums w-8",
								children: variant === "top" ? index + 1 : data.length - index
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2.5 pr-4 font-medium truncate max-w-[200px]",
								children: item.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2.5 pr-4 text-right tabular-nums",
								children: item.orders
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2.5 text-right tabular-nums",
								children: formatCurrency(item.revenue)
							})
						]
					}, item.name)) })]
				})
			})
		]
	});
}
function ProductAnalytics() {
	const { data: topData, loading: topLoading, error: topError, refetch: topRefetch } = useTopSellingProducts();
	const { data: bottomData, loading: bottomLoading, error: bottomError, refetch: bottomRefetch } = useBottomSellingProducts();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "eyebrow",
			children: "Analytics"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "font-serif text-2xl mt-1",
			children: "Products"
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-1 lg:grid-cols-2 gap-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductTable, {
			title: "Best Selling Products",
			data: topData,
			loading: topLoading,
			error: topError,
			onRetry: topRefetch,
			variant: "top"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductTable, {
			title: "Worst Selling Products",
			data: bottomData,
			loading: bottomLoading,
			error: bottomError,
			onRetry: bottomRefetch,
			variant: "bottom"
		})]
	})] });
}
var REVENUE_CARDS = [
	{
		key: "totalRevenue",
		label: "Total Revenue",
		getValue: (s) => `$${s.totalRevenue.toLocaleString()}`,
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-4 w-4" }),
		accent: "text-emerald-600 dark:text-emerald-400"
	},
	{
		key: "revenueToday",
		label: "Revenue Today",
		getValue: (s) => `$${s.revenueToday.toLocaleString()}`,
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-4 w-4" }),
		accent: "text-emerald-500 dark:text-emerald-300"
	},
	{
		key: "revenueThisWeek",
		label: "Revenue This Week",
		getValue: (s) => `$${s.revenueThisWeek.toLocaleString()}`,
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-4 w-4" }),
		accent: "text-emerald-500 dark:text-emerald-300"
	},
	{
		key: "revenueThisMonth",
		label: "Revenue This Month",
		getValue: (s) => `$${s.revenueThisMonth.toLocaleString()}`,
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-4 w-4" }),
		accent: "text-emerald-500 dark:text-emerald-300"
	}
];
var ORDER_CARDS = [
	{
		key: "totalOrders",
		label: "Total Orders",
		getValue: (s) => s.totalOrders.toLocaleString(),
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-4 w-4" }),
		accent: "text-sky-600 dark:text-sky-400"
	},
	{
		key: "pendingOrders",
		label: "Pending",
		getValue: (s) => s.pendingOrders.toLocaleString(),
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4" }),
		accent: "text-amber-600 dark:text-amber-400"
	},
	{
		key: "confirmedOrders",
		label: "Confirmed",
		getValue: (s) => s.confirmedOrders.toLocaleString(),
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-4 w-4" }),
		accent: "text-blue-600 dark:text-blue-400"
	},
	{
		key: "processingOrders",
		label: "Processing",
		getValue: (s) => s.processingOrders.toLocaleString(),
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightLeft, { className: "h-4 w-4" }),
		accent: "text-purple-600 dark:text-purple-400"
	},
	{
		key: "shippedOrders",
		label: "Shipped",
		getValue: (s) => s.shippedOrders.toLocaleString(),
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-4 w-4" }),
		accent: "text-cyan-600 dark:text-cyan-400"
	},
	{
		key: "deliveredOrders",
		label: "Delivered",
		getValue: (s) => s.deliveredOrders.toLocaleString(),
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-4 w-4" }),
		accent: "text-emerald-600 dark:text-emerald-400"
	},
	{
		key: "cancelledOrders",
		label: "Cancelled",
		getValue: (s) => s.cancelledOrders.toLocaleString(),
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-4 w-4" }),
		accent: "text-red-600 dark:text-red-400"
	},
	{
		key: "refundedOrders",
		label: "Refunded",
		getValue: (s) => s.refundedOrders.toLocaleString(),
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-4 w-4" }),
		accent: "text-stone-600 dark:text-stone-400"
	}
];
var CUSTOMER_CARDS = [
	{
		key: "totalCustomers",
		label: "Total Customers",
		getValue: (s) => s.totalCustomers.toLocaleString(),
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4" }),
		accent: "text-violet-600 dark:text-violet-400"
	},
	{
		key: "newCustomers",
		label: "New This Month",
		getValue: (s) => s.newCustomers.toLocaleString(),
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-4 w-4" }),
		accent: "text-indigo-500 dark:text-indigo-300"
	},
	{
		key: "returningCustomers",
		label: "Returning",
		getValue: (s) => s.returningCustomers.toLocaleString(),
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4" }),
		accent: "text-teal-600 dark:text-teal-400"
	}
];
var PRODUCT_CARDS = [
	{
		key: "totalProducts",
		label: "Total Products",
		getValue: (s) => s.totalProducts.toLocaleString(),
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "h-4 w-4" }),
		accent: "text-indigo-600 dark:text-indigo-400"
	},
	{
		key: "activeProducts",
		label: "Active",
		getValue: (s) => s.activeProducts.toLocaleString(),
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-4 w-4" }),
		accent: "text-green-600 dark:text-green-400"
	},
	{
		key: "lowStockProducts",
		label: "Low Stock",
		getValue: (s) => s.lowStockProducts.toLocaleString(),
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4" }),
		accent: "text-orange-600 dark:text-orange-400"
	},
	{
		key: "totalCategories",
		label: "Categories",
		getValue: (s) => s.totalCategories.toLocaleString(),
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "h-4 w-4" }),
		accent: "text-pink-600 dark:text-pink-400"
	}
];
function formatRelativeTime(ms) {
	const seconds = Math.floor((Date.now() - ms) / 1e3);
	if (seconds < 5) return "just now";
	if (seconds < 60) return `${seconds} seconds ago`;
	const minutes = Math.floor(seconds / 60);
	if (minutes === 1) return "1 minute ago";
	if (minutes < 60) return `${minutes} minutes ago`;
	const hours = Math.floor(minutes / 60);
	if (hours === 1) return "1 hour ago";
	return `${hours} hours ago`;
}
function CardGrid({ cards, summary, loading }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: cards.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
		label: c.label,
		value: summary ? c.getValue(summary) : void 0,
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: c.accent,
			children: c.icon
		}),
		loading
	}, c.key)) });
}
function SectionError({ error, onRetry }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "col-span-full border border-red/20 bg-red/5 p-8 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-red/80",
			children: error
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			onClick: onRetry,
			className: "mt-4 text-[11px] tracking-[0.32em] uppercase text-muted-foreground hover:text-foreground transition-colors",
			children: "Try again"
		})]
	});
}
function AdminPage() {
	const isDashboard = useLocation().pathname === "/admin";
	const { summary, loading, error, refetch } = useAnalyticsSummary();
	const { data: couponData, loading: couponLoading, refetch: refetchCoupons } = useCouponAnalytics();
	const { data: giftCardData, loading: giftCardLoading, refetch: refetchGiftCards } = useGiftCardAnalytics();
	const [, setTick] = (0, import_react.useState)(0);
	const lastUpdated = summary ? Date.now() : null;
	(0, import_react.useEffect)(() => {
		if (!lastUpdated) return;
		const id = setInterval(() => setTick((n) => n + 1), 1e4);
		return () => clearInterval(id);
	}, [lastUpdated]);
	if (!isDashboard) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
	const timestamp = lastUpdated !== null ? formatRelativeTime(lastUpdated) : "—";
	const allCards = [
		...REVENUE_CARDS,
		...ORDER_CARDS,
		...CUSTOMER_CARDS,
		...PRODUCT_CARDS
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminLayout, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow",
					children: "Admin"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-serif text-4xl mt-2",
					children: "Dashboard"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-2 max-w-lg",
					children: "Store overview — revenue, orders, customers, and analytics at a glance."
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3 mb-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-[10px] sm:text-[11px] tracking-[0.2em] text-muted-foreground whitespace-nowrap",
				children: ["Updated ", timestamp]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: refetch,
				className: "border border-border/60 p-2 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-40 disabled:pointer-events-none",
				"aria-label": "Refresh dashboard",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-4 w-4" })
			})]
		}),
		error && !loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionError, {
			error,
			onRetry: refetch
		}),
		loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
			children: allCards.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
				label: c.label,
				loading: true
			}, c.key))
		}),
		!error && !loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-4",
				children: "Revenue"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardGrid, {
					cards: REVENUE_CARDS,
					summary,
					loading: false
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-4",
					children: "Orders"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 md:grid-cols-4 gap-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardGrid, {
						cards: ORDER_CARDS,
						summary,
						loading: false
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-4",
					children: "Customers"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 md:grid-cols-3 gap-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardGrid, {
						cards: CUSTOMER_CARDS,
						summary,
						loading: false
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-4",
					children: "Products & Categories"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 md:grid-cols-4 gap-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardGrid, {
						cards: PRODUCT_CARDS,
						summary,
						loading: false
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-4",
					children: "Coupons"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 md:grid-cols-4 gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
							label: "Total Coupons",
							value: couponData?.total_coupons.toLocaleString(),
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "h-4 w-4 text-indigo-600 dark:text-indigo-400" }),
							loading: couponLoading
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
							label: "Active",
							value: couponData?.active_coupons.toLocaleString(),
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "h-4 w-4 text-emerald-600 dark:text-emerald-400" }),
							loading: couponLoading
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
							label: "Redemptions",
							value: couponData?.total_redemptions.toLocaleString(),
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "h-4 w-4 text-sky-600 dark:text-sky-400" }),
							loading: couponLoading
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
							label: "Revenue Impact",
							value: couponData ? `$${couponData.total_discounted.toLocaleString()}` : void 0,
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "h-4 w-4 text-amber-600 dark:text-amber-400" }),
							loading: couponLoading
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-4",
					children: "Gift Cards"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 md:grid-cols-4 gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
							label: "Total",
							value: giftCardData?.total_gift_cards.toLocaleString(),
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "h-4 w-4 text-indigo-600 dark:text-indigo-400" }),
							loading: giftCardLoading
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
							label: "Active",
							value: giftCardData?.active_gift_cards.toLocaleString(),
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "h-4 w-4 text-emerald-600 dark:text-emerald-400" }),
							loading: giftCardLoading
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
							label: "Outstanding",
							value: giftCardData ? `$${giftCardData.outstanding_balance.toLocaleString()}` : void 0,
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "h-4 w-4 text-sky-600 dark:text-sky-400" }),
							loading: giftCardLoading
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
							label: "Redeemed",
							value: giftCardData ? `$${giftCardData.total_redeemed.toLocaleString()}` : void 0,
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "h-4 w-4 text-amber-600 dark:text-amber-400" }),
							loading: giftCardLoading
						})
					]
				})]
			})
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mt-16 border-t border-border/40 pt-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SalesChart, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mt-14 border-t border-border/40 pt-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RevenueChart, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mt-14 border-t border-border/40 pt-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrdersAnalytics, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mt-14 border-t border-border/40 pt-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerAnalytics, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mt-14 border-t border-border/40 pt-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductAnalytics, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mt-14 border-t border-border/40 pt-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecentOrdersTable, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mt-14 border-t border-border/40 pt-12",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecentCustomersTable, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "mt-14",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LowStockWidget, {})
		})
	] });
}
//#endregion
export { AdminPage as component };
