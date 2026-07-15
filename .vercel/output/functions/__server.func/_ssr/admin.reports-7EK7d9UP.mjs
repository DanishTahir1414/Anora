import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { J as Download, Y as DollarSign, c as TrendingUp, r as Users, w as Package } from "../_libs/lucide-react.mjs";
import { t as AdminLayout } from "./utils-Cy0gksMl.mjs";
import { t as Skeleton } from "./skeleton-9naKPw9_.mjs";
import { t as DashboardCard } from "./DashboardCard-DEbOb3YD.mjs";
import { t as Button } from "./button-Dfd9l4mi.mjs";
import { a as XAxis, c as Bar, d as ResponsiveContainer, f as Tooltip, i as YAxis, o as Area, p as Legend, r as BarChart, s as CartesianGrid, t as AreaChart } from "../_libs/recharts+[...].mjs";
import { t as rpc } from "./admin-client-C5B6s_l5.mjs";
import { n as exportExcel, r as exportPDF, t as exportCSV } from "./admin-export-7Fw4PX4D.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.reports-7EK7d9UP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useRevenueReport(startDate, endDate) {
	const [data, setData] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setError(null);
			const params = {};
			if (startDate) params.p_start_date = startDate;
			if (endDate) params.p_end_date = endDate;
			setData(await rpc("get_revenue_report", params));
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, [startDate, endDate]);
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
function useFinancialReport(startDate, endDate) {
	const [data, setData] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setError(null);
			const params = {};
			if (startDate) params.p_start_date = startDate;
			if (endDate) params.p_end_date = endDate;
			setData(await rpc("get_financial_report", params));
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, [startDate, endDate]);
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
function useCustomerReport(startDate, endDate) {
	const [data, setData] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setError(null);
			const params = {};
			if (startDate) params.p_start_date = startDate;
			if (endDate) params.p_end_date = endDate;
			setData(await rpc("get_customer_report", params));
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, [startDate, endDate]);
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
function useInventoryReport() {
	const [data, setData] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setError(null);
			setData(await rpc("get_inventory_report"));
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
function ReportsDashboard() {
	const [activeTab, setActiveTab] = (0, import_react.useState)("sales");
	const [dateRange, setDateRange] = (0, import_react.useState)("30days");
	const startDate = dateRange === "30days" ? (/* @__PURE__ */ new Date(Date.now() - 30 * 864e5)).toISOString().split("T")[0] : dateRange === "90days" ? (/* @__PURE__ */ new Date(Date.now() - 90 * 864e5)).toISOString().split("T")[0] : dateRange === "1year" ? (/* @__PURE__ */ new Date(Date.now() - 365 * 864e5)).toISOString().split("T")[0] : void 0;
	const endDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
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
					children: "Reports"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-2 max-w-lg",
					children: "Sales, financial, customer, and inventory reports with export support."
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-2 mb-8",
			children: [
				"sales",
				"finance",
				"customers",
				"inventory"
			].map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setActiveTab(tab),
				className: `px-4 py-2 text-[11px] tracking-[0.2em] uppercase rounded-md transition-colors ${activeTab === tab ? "bg-foreground text-background" : "border border-border/60 text-muted-foreground hover:border-foreground/30"}`,
				children: tab === "sales" ? "Sales" : tab === "finance" ? "Finance" : tab === "customers" ? "Customers" : "Inventory"
			}, tab))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex gap-2 mb-8",
			children: [
				"30days",
				"90days",
				"1year"
			].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setDateRange(r),
				className: `px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase rounded-md transition-colors ${dateRange === r ? "bg-foreground text-background" : "border border-border/60 text-muted-foreground hover:border-foreground/30"}`,
				children: r === "30days" ? "30 Days" : r === "90days" ? "90 Days" : "1 Year"
			}, r))
		}),
		activeTab === "sales" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SalesReports, {
			startDate,
			endDate
		}),
		activeTab === "finance" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FinanceReports, {
			startDate,
			endDate
		}),
		activeTab === "customers" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerReports, {
			startDate,
			endDate
		}),
		activeTab === "inventory" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InventoryReports, {})
	] });
}
function SalesReports({ startDate, endDate }) {
	const { data, loading } = useRevenueReport(startDate, endDate);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-48 w-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-48 w-full" })]
	});
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-sm text-muted-foreground py-12 text-center",
		children: "No data available"
	});
	const dailyData = (data.daily || []).map((d) => ({
		...d,
		date: d.date?.slice(5, 10)
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-2 md:grid-cols-5 gap-4 mb-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
					label: "Gross Revenue",
					value: `$${Number(data.totalGrossRevenue).toLocaleString()}`,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-4 w-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
					label: "Net Revenue",
					value: `$${Number(data.totalNetRevenue).toLocaleString()}`,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-4 w-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
					label: "Taxes",
					value: `$${Number(data.totalTaxes).toLocaleString()}`,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-4 w-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
					label: "Discounts",
					value: `$${Number(data.totalDiscounts).toLocaleString()}`,
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-4 w-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
					label: "Orders",
					value: data.totalOrders.toLocaleString(),
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-4 w-4" })
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border border-border/60 p-6 mb-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-medium mb-4",
				children: "Daily Revenue"
			}), dailyData.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
				width: "100%",
				height: 320,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
					data: dailyData,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
							strokeDasharray: "3 3",
							stroke: "hsl(var(--border))"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
							dataKey: "date",
							tick: { fontSize: 10 }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
							tick: { fontSize: 10 },
							tickFormatter: (v) => `$${(v / 1e3).toFixed(0)}k`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
							dataKey: "grossRevenue",
							fill: "hsl(var(--foreground))",
							name: "Gross Revenue"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
							dataKey: "netRevenue",
							fill: "hsl(var(--gold))",
							name: "Net Revenue"
						})
					]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-64 flex items-center justify-center text-sm text-muted-foreground",
				children: "No sales data"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => {
						exportPDF("Sales Report", [
							"Date",
							"Gross Revenue",
							"Net Revenue",
							"Taxes",
							"Discounts",
							"Orders"
						], (data.daily || []).map((d) => [
							d.date,
							d.grossRevenue,
							d.netRevenue,
							d.taxes,
							d.discounts,
							d.orders
						]), `sales-report-${endDate}`);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5 mr-1.5" }), " PDF"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => {
						exportCSV((data.daily || []).map((d) => ({
							Date: d.date,
							"Gross Revenue": d.grossRevenue,
							"Net Revenue": d.netRevenue,
							Taxes: d.taxes,
							Discounts: d.discounts,
							Orders: d.orders
						})), `sales-report-${endDate}`);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5 mr-1.5" }), " CSV"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => {
						exportExcel((data.daily || []).map((d) => ({
							Date: d.date,
							GrossRevenue: d.grossRevenue,
							NetRevenue: d.netRevenue,
							Taxes: d.taxes,
							Discounts: d.discounts,
							Orders: d.orders
						})), `sales-report-${endDate}`, "Sales");
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5 mr-1.5" }), " Excel"]
				})
			]
		})
	] });
}
function FinanceReports({ startDate, endDate }) {
	const { data, loading } = useFinancialReport(startDate, endDate);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-48 w-full" });
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-sm text-muted-foreground py-12 text-center",
		children: "No data available"
	});
	const dailyData = (data.daily || []).map((d) => ({
		...d,
		date: d.date?.slice(5, 10)
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
					label: "Total Taxes",
					value: `$${Number(data.totalTaxes).toLocaleString()}`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
					label: "Total Discounts",
					value: `$${Number(data.totalDiscounts).toLocaleString()}`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
					label: "Total Refunds",
					value: `$${Number(data.totalRefunds).toLocaleString()}`
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border border-border/60 p-6 mb-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-sm font-medium mb-4",
				children: "Daily Financial Breakdown"
			}), dailyData.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
				width: "100%",
				height: 320,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
					data: dailyData,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
							strokeDasharray: "3 3",
							stroke: "hsl(var(--border))"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
							dataKey: "date",
							tick: { fontSize: 10 }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { tick: { fontSize: 10 } }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
							type: "monotone",
							dataKey: "taxes",
							stroke: "hsl(var(--foreground))",
							fill: "hsl(var(--foreground))",
							fillOpacity: .1,
							name: "Taxes"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
							type: "monotone",
							dataKey: "discounts",
							stroke: "#f59e0b",
							fill: "#f59e0b",
							fillOpacity: .1,
							name: "Discounts"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
							type: "monotone",
							dataKey: "refunds",
							stroke: "#ef4444",
							fill: "#ef4444",
							fillOpacity: .1,
							name: "Refunds"
						})
					]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-64 flex items-center justify-center text-sm text-muted-foreground",
				children: "No financial data"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => {
						exportPDF("Financial Report", [
							"Date",
							"Taxes",
							"Discounts",
							"Refunds"
						], (data.daily || []).map((d) => [
							d.date,
							d.taxes,
							d.discounts,
							d.refunds
						]), `finance-report-${endDate}`);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5 mr-1.5" }), " PDF"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => {
						exportCSV((data.daily || []).map((d) => ({
							Date: d.date,
							Taxes: d.taxes,
							Discounts: d.discounts,
							Refunds: d.refunds
						})), `finance-report-${endDate}`);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5 mr-1.5" }), " CSV"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => {
						exportExcel((data.daily || []).map((d) => ({
							Date: d.date,
							Taxes: d.taxes,
							Discounts: d.discounts,
							Refunds: d.refunds
						})), `finance-report-${endDate}`, "Finance");
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5 mr-1.5" }), " Excel"]
				})
			]
		})
	] });
}
function CustomerReports({ startDate, endDate }) {
	const { data, loading } = useCustomerReport(startDate, endDate);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-48 w-full" });
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-sm text-muted-foreground py-12 text-center",
		children: "No data available"
	});
	const rows = [
		["New Customers", data.newCustomers.toLocaleString()],
		["Returning Customers", data.returningCustomers.toLocaleString()],
		["VIP Customers", data.vipCustomers.toLocaleString()],
		["Total Customers", data.totalCustomers.toLocaleString()],
		["Avg Lifetime Value", `$${Number(data.averageLifetimeValue).toFixed(2)}`]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-2 md:grid-cols-5 gap-4 mb-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
				label: "New Customers",
				value: data.newCustomers.toLocaleString(),
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
				label: "Returning",
				value: data.returningCustomers.toLocaleString(),
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
				label: "VIP",
				value: data.vipCustomers.toLocaleString(),
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
				label: "Total",
				value: data.totalCustomers.toLocaleString(),
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
				label: "Avg LTV",
				value: `$${Number(data.averageLifetimeValue).toFixed(2)}`,
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-4 w-4" })
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex gap-2 mt-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			size: "sm",
			onClick: () => exportPDF("Customer Report", ["Metric", "Value"], rows, `customer-report-${endDate || "all"}`),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5 mr-1.5" }), " PDF"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			size: "sm",
			onClick: () => exportCSV(rows.map((r) => ({
				Metric: r[0],
				Value: r[1]
			})), `customer-report-${endDate || "all"}`),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5 mr-1.5" }), " CSV"]
		})]
	})] });
}
function InventoryReports() {
	const { data, loading } = useInventoryReport();
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-48 w-full" });
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-sm text-muted-foreground py-12 text-center",
		children: "No data available"
	});
	const rows = [
		["Total Active Products", data.totalProducts.toLocaleString()],
		["In Stock", data.inStock.toLocaleString()],
		["Low Stock", data.lowStock.toLocaleString()],
		["Out of Stock", data.outOfStock.toLocaleString()],
		["Total Stock Value", `$${Number(data.totalStockValue).toLocaleString()}`],
		["Recent Movements (30d)", data.recentMovements.toLocaleString()]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
				label: "Active Products",
				value: data.totalProducts.toLocaleString(),
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-4 w-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
				label: "In Stock",
				value: data.inStock.toLocaleString(),
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-4 w-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
				label: "Low Stock",
				value: data.lowStock.toLocaleString(),
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-4 w-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
				label: "Out of Stock",
				value: data.outOfStock.toLocaleString(),
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-4 w-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
				label: "Stock Value",
				value: `$${Number(data.totalStockValue).toLocaleString()}`,
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-4 w-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
				label: "Movements (30d)",
				value: data.recentMovements.toLocaleString(),
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-4 w-4" })
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex gap-2 mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				onClick: () => exportPDF("Inventory Report", ["Metric", "Value"], rows, "inventory-report"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5 mr-1.5" }), " PDF"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				onClick: () => exportCSV(rows.map((r) => ({
					Metric: r[0],
					Value: r[1]
				})), "inventory-report"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5 mr-1.5" }), " CSV"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				onClick: () => exportExcel([{
					Metric: "Total Products",
					Value: data.totalProducts
				}, {
					Metric: "In Stock",
					Value: data.inStock
				}], "inventory-report", "Inventory"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5 mr-1.5" }), " Excel"]
			})
		]
	})] });
}
function ReportsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportsDashboard, {}) });
}
//#endregion
export { ReportsPage as component };
