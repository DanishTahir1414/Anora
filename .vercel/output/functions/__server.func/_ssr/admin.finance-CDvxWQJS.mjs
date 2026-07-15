import { o as __toESM } from "../_runtime.mjs";
import { f as Outlet, l as useLocation } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { C as Percent, U as FileText, Y as DollarSign, _ as RotateCcw, b as Receipt, c as TrendingUp, f as ShoppingCart, ot as Ban } from "../_libs/lucide-react.mjs";
import { t as AdminLayout } from "./utils-Cy0gksMl.mjs";
import { t as Skeleton } from "./skeleton-9naKPw9_.mjs";
import { t as DashboardCard } from "./DashboardCard-DEbOb3YD.mjs";
import { a as XAxis, c as Bar, d as ResponsiveContainer, f as Tooltip, i as YAxis, o as Area, p as Legend, r as BarChart, s as CartesianGrid, t as AreaChart } from "../_libs/recharts+[...].mjs";
import { a as useRevenueTrend, i as useRefundTrend, n as useFinanceDashboard, o as useTaxTrend, r as useMonthlyComparison, s as useYearlyComparison, t as useDiscountTrend } from "./admin-finance-DKZCH8M6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.finance-CDvxWQJS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MONTH_NAMES = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
];
function formatCurrency(val) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(val);
}
function FinanceDashboard() {
	const [dateRange, setDateRange] = (0, import_react.useState)("30days");
	const startDate = dateRange === "30days" ? (/* @__PURE__ */ new Date(Date.now() - 30 * 864e5)).toISOString().split("T")[0] : dateRange === "90days" ? (/* @__PURE__ */ new Date(Date.now() - 90 * 864e5)).toISOString().split("T")[0] : dateRange === "1year" ? (/* @__PURE__ */ new Date(Date.now() - 365 * 864e5)).toISOString().split("T")[0] : void 0;
	const endDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
	const { data: dashboard, loading: dashLoading } = useFinanceDashboard();
	const { data: revenueTrend, loading: revLoading } = useRevenueTrend(startDate, endDate);
	const { data: taxTrend } = useTaxTrend(startDate, endDate);
	const { data: refundTrend } = useRefundTrend(startDate, endDate);
	const { data: discountTrend } = useDiscountTrend(startDate, endDate);
	const { data: monthlyCmp } = useMonthlyComparison();
	const { data: yearlyCmp } = useYearlyComparison();
	const revenueCards = dashboard ? [
		{
			label: "Gross Revenue",
			value: formatCurrency(dashboard.grossRevenue),
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-4 w-4" })
		},
		{
			label: "Net Revenue",
			value: formatCurrency(dashboard.netRevenue),
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-4 w-4" })
		},
		{
			label: "Revenue Today",
			value: formatCurrency(dashboard.revenueToday),
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-4 w-4" })
		},
		{
			label: "This Week",
			value: formatCurrency(dashboard.revenueThisWeek),
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-4 w-4" })
		},
		{
			label: "This Month",
			value: formatCurrency(dashboard.revenueThisMonth),
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-4 w-4" })
		},
		{
			label: "This Year",
			value: formatCurrency(dashboard.revenueThisYear),
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-4 w-4" })
		}
	] : [];
	const financialCards = dashboard ? [
		{
			label: "Taxes Collected",
			value: formatCurrency(dashboard.taxesCollected),
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-4 w-4" })
		},
		{
			label: "Discounts Applied",
			value: formatCurrency(dashboard.discountsApplied),
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Percent, { className: "h-4 w-4" })
		},
		{
			label: "Refund Amounts",
			value: formatCurrency(dashboard.refundAmounts),
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-4 w-4" })
		},
		{
			label: "Avg Order Value",
			value: formatCurrency(dashboard.averageOrderValue),
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-4 w-4" })
		},
		{
			label: "Paid Orders",
			value: dashboard.totalPaidOrders.toLocaleString(),
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" })
		},
		{
			label: "Outstanding",
			value: formatCurrency(dashboard.outstandingAmounts),
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ban, { className: "h-4 w-4" })
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
					children: "Finance Dashboard"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-2 max-w-lg",
					children: "Revenue, taxes, refunds, and financial metrics at a glance."
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-2 mb-8",
			children: [
				"30days",
				"90days",
				"1year"
			].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setDateRange(r),
				className: `px-3 py-1.5 text-[11px] tracking-[0.2em] uppercase rounded-md transition-colors ${dateRange === r ? "bg-foreground text-background" : "border border-border/60 text-muted-foreground hover:border-foreground/30"}`,
				children: r === "30days" ? "30 Days" : r === "90days" ? "90 Days" : "1 Year"
			}, r))
		}),
		dashLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-6",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4",
				children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
					label: "—",
					loading: true
				}, i))
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium mb-4 uppercase tracking-wider text-muted-foreground",
					children: "Revenue"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4",
					children: revenueCards.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
						label: c.label,
						value: c.value,
						icon: c.icon
					}, c.label))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium mb-4 uppercase tracking-wider text-muted-foreground",
					children: "Financial Metrics"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4",
					children: financialCards.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
						label: c.label,
						value: c.value,
						icon: c.icon
					}, c.label))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-8 lg:grid-cols-2 mb-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border border-border/60 p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-medium mb-4",
						children: "Revenue Trend"
					}), revLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 w-full" }) : revenueTrend && revenueTrend.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: 280,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
							data: revenueTrend,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "hsl(var(--border))"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "date",
									tick: { fontSize: 10 },
									tickFormatter: (v) => v.slice(5, 10)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tick: { fontSize: 10 },
									tickFormatter: (v) => `$${(v / 1e3).toFixed(0)}k`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
									type: "monotone",
									dataKey: "revenue",
									stroke: "hsl(var(--foreground))",
									fill: "hsl(var(--foreground))",
									fillOpacity: .1
								})
							]
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-64 flex items-center justify-center text-sm text-muted-foreground",
						children: "No data"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border border-border/60 p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-medium mb-4",
						children: "Tax & Discounts Trend"
					}), taxTrend && taxTrend.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: 280,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: taxTrend.map((t, i) => ({
								...t,
								discounts: discountTrend?.[i]?.discount || 0
							})),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "hsl(var(--border))"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "date",
									tick: { fontSize: 10 },
									tickFormatter: (v) => v.slice(5, 10)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { tick: { fontSize: 10 } }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "tax",
									fill: "hsl(var(--foreground))",
									opacity: .6,
									name: "Tax"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "discounts",
									fill: "hsl(var(--gold))",
									name: "Discounts"
								})
							]
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-64 flex items-center justify-center text-sm text-muted-foreground",
						children: "No data"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-8 lg:grid-cols-2 mb-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border border-border/60 p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-medium mb-4",
						children: "Refund Trend"
					}), refundTrend && refundTrend.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: 280,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
							data: refundTrend,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "hsl(var(--border))"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "date",
									tick: { fontSize: 10 },
									tickFormatter: (v) => v.slice(5, 10)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { tick: { fontSize: 10 } }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
									type: "monotone",
									dataKey: "refund",
									stroke: "#ef4444",
									fill: "#ef4444",
									fillOpacity: .1
								})
							]
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-64 flex items-center justify-center text-sm text-muted-foreground",
						children: "No refund data"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border border-border/60 p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-medium mb-4",
						children: "Monthly Comparison"
					}), monthlyCmp && monthlyCmp.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: 280,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: monthlyCmp,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									stroke: "hsl(var(--border))"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "month",
									tick: { fontSize: 10 },
									tickFormatter: (v) => MONTH_NAMES[v - 1]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tick: { fontSize: 10 },
									tickFormatter: (v) => `$${(v / 1e3).toFixed(0)}k`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "revenue",
									fill: "hsl(var(--foreground))",
									name: "This Year"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "previousRevenue",
									fill: "hsl(var(--muted-foreground))",
									name: "Previous Year"
								})
							]
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-64 flex items-center justify-center text-sm text-muted-foreground",
						children: "No comparison data"
					})]
				})]
			})
		] })
	] });
}
function FinancePage() {
	if (!(useLocation().pathname === "/admin/finance")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FinanceDashboard, {}) });
}
//#endregion
export { FinancePage as component };
