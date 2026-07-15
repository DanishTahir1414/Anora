import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { Y as DollarSign, c as TrendingUp, f as ShoppingCart, y as RefreshCw } from "../_libs/lucide-react.mjs";
import { t as AdminLayout } from "./utils-Cy0gksMl.mjs";
import { t as Skeleton } from "./skeleton-9naKPw9_.mjs";
import { t as DashboardCard } from "./DashboardCard-DEbOb3YD.mjs";
import { t as Input } from "./input-Ch8T9SMc.mjs";
import { t as Button } from "./button-Dfd9l4mi.mjs";
import { n as useAbandonedCartAnalytics, r as useAbandonedCarts, t as markCartRecovered } from "./admin-security-vlWQTKFB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.abandoned-carts-Dg9hL212.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_BADGES = {
	abandoned: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
	recovered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
	converted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
	expired: "bg-neutral-100 text-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-300"
};
function StatusBadge({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `inline-block px-2.5 py-1 text-[10px] tracking-[0.2em] uppercase ${STATUS_BADGES[status] ?? "bg-neutral-100 text-muted-foreground"}`,
		children: status
	});
}
function formatCurrency(val) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(val);
}
function AbandonedCartsTable() {
	const [page, setPage] = (0, import_react.useState)(1);
	const [status, setStatus] = (0, import_react.useState)("");
	const [search, setSearch] = (0, import_react.useState)("");
	const [searchInput, setSearchInput] = (0, import_react.useState)("");
	const [sortBy, setSortBy] = (0, import_react.useState)("created_at");
	const [sortDir, setSortDir] = (0, import_react.useState)("desc");
	const pageSize = 15;
	const { result, loading, error, refetch } = useAbandonedCarts(page, pageSize, status, search);
	const { data: analytics } = useAbandonedCartAnalytics();
	const totalPages = Math.max(1, Math.ceil((result?.total ?? 0) / pageSize));
	const debouncedSearch = (() => {
		let timer;
		return (val) => {
			clearTimeout(timer);
			timer = setTimeout(() => {
				setSearch(val);
				setPage(1);
			}, 300);
		};
	})();
	function toggleSort(col) {
		if (sortBy === col) setSortDir((d) => d === "asc" ? "desc" : "asc");
		else {
			setSortBy(col);
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
	const metricCards = analytics ? [
		{
			label: "Abandoned Carts",
			value: analytics.total_abandoned_carts.toLocaleString(),
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-4 w-4" })
		},
		{
			label: "Lost Revenue",
			value: formatCurrency(analytics.lost_revenue),
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-4 w-4" })
		},
		{
			label: "Recovered Value",
			value: formatCurrency(analytics.recovered_revenue),
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-4 w-4" })
		},
		{
			label: "Recovery Rate",
			value: `${analytics.recovery_rate}%`,
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-4 w-4" })
		},
		{
			label: "Avg Cart Value",
			value: formatCurrency(analytics.average_cart_value),
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-4 w-4" })
		}
	] : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow",
					children: "Admin"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-serif text-4xl mt-2",
					children: "Abandoned Carts"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-2 max-w-lg",
					children: "Track, recover, and analyze abandoned shopping carts."
				})
			]
		}),
		analytics && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8",
			children: metricCards.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
				label: c.label,
				value: c.value,
				icon: c.icon
			}, c.label))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col sm:flex-row gap-3 mb-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: "Search by customer or session…",
				value: searchInput,
				onChange: (e) => {
					setSearchInput(e.target.value);
					debouncedSearch(e.target.value);
				},
				className: "max-w-sm h-9 text-sm"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
				value: status,
				onChange: (e) => {
					setStatus(e.target.value);
					setPage(1);
				},
				className: "h-9 rounded-md border border-input bg-background px-3 text-xs text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "All Statuses"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "abandoned",
						children: "Abandoned"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "recovered",
						children: "Recovered"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "converted",
						children: "Converted"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "expired",
						children: "Expired"
					})
				]
			})]
		}),
		error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border border-red/20 bg-red/5 p-6 text-center mb-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-red/80",
				children: error
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				size: "sm",
				onClick: () => refetch(),
				className: "mt-3",
				children: "Retry"
			})]
		}),
		loading && !error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" }), Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-14 w-full" }, i))]
		}),
		!loading && !error && result && result.carts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border border-border/60 p-12 text-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No abandoned carts found."
			})
		}),
		!loading && !error && result && result.carts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border border-border/60 overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border/60",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Th, {
							onClick: () => toggleSort("user_name"),
							children: ["Customer", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "user_name" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Th, {
							onClick: () => toggleSort("subtotal"),
							children: ["Value", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "subtotal" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Items" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Th, {
							onClick: () => toggleSort("status"),
							children: ["Status", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "status" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Th, {
							onClick: () => toggleSort("created_at"),
							children: ["Created", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "created_at" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
							className: "text-right",
							children: "Actions"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: result.carts.map((cart) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border/40 hover:bg-muted/30",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-sm",
							children: cart.customer_name || "Guest"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-sm font-serif tabular-nums",
							children: formatCurrency(cart.subtotal)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3 text-xs text-muted-foreground",
							children: [
								cart.item_count,
								" item",
								cart.item_count !== 1 ? "s" : ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: cart.status })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-xs text-muted-foreground",
							children: new Date(cart.created_at).toLocaleDateString("en-US", {
								month: "short",
								day: "numeric"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-right",
							children: cart.status === "abandoned" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								onClick: async () => {
									await markCartRecovered(cart.id);
									refetch();
								},
								children: "Mark Recovered"
							})
						})
					]
				}, cart.id)) })]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between pt-4 text-sm text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				result.total,
				" cart",
				result.total !== 1 ? "s" : ""
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						disabled: page <= 1,
						onClick: () => setPage(page - 1),
						children: "Previous"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs",
						children: [
							page,
							" of ",
							totalPages
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						disabled: page >= totalPages,
						onClick: () => setPage(page + 1),
						children: "Next"
					})
				]
			})]
		})] })
	] });
}
function Th({ children, onClick, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
		className: `px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-medium ${onClick ? "cursor-pointer hover:text-foreground" : ""} ${className}`,
		onClick,
		children
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AbandonedCartsTable, {}) });
//#endregion
export { SplitComponent as component };
