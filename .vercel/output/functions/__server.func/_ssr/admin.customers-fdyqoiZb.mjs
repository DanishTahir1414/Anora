import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { r as supabase } from "./auth-context-oFJLTVEi.mjs";
import { t as AdminLayout } from "./utils-Cy0gksMl.mjs";
import { t as Skeleton } from "./skeleton-9naKPw9_.mjs";
import { t as Input } from "./input-Ch8T9SMc.mjs";
import { t as Button } from "./button-Dfd9l4mi.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-CvsFPszi.mjs";
import { a as SelectTrigger, i as SelectItem, n as Select, o as SelectValue, r as SelectContent, t as Badge } from "./badge-BzsAq-GY.mjs";
import { a as SheetHeader, n as SheetContent, o as SheetTitle, r as SheetDescription, t as Sheet } from "./sheet-C1AdHd_R.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.customers-fdyqoiZb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function rpc(name, params) {
	const { data, error } = await supabase.rpc(name, params);
	if (error) throw error;
	return data;
}
function useCustomersManagement(page, pageSize, search = "", sortBy = "created_at", sortDir = "desc", segment = "", activity = "") {
	const [result, setResult] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setError(null);
			const params = {
				p_page: page,
				p_page_size: pageSize,
				p_sort_by: sortBy,
				p_sort_dir: sortDir
			};
			if (search) params.p_search = search;
			if (segment) params.p_segment = segment;
			if (activity) params.p_activity = activity;
			setResult(await rpc("get_customers_management", params));
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
		sortDir,
		segment,
		activity
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
function useCustomerDetails(userId) {
	const [details, setDetails] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		if (!userId) return;
		try {
			setLoading(true);
			setError(null);
			setDetails(await rpc("get_customer_details", { p_user_id: userId }));
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, [userId]);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	return {
		details,
		loading,
		error,
		refetch: load
	};
}
function useCustomersAnalytics() {
	const [analytics, setAnalytics] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setError(null);
			setAnalytics(await rpc("get_customers_analytics"));
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
var statusColors = {
	pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
	confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
	processing: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
	shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
	delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
	cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
	refunded: "bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-300"
};
var segmentColors = {
	new: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
	returning: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
	vip: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
};
function CustomerProfileDrawer({ userId, open, onClose }) {
	const { details, loading, error, refetch } = useCustomerDetails(userId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open,
		onOpenChange: (o) => {
			if (!o) onClose();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			className: "sm:max-w-xl overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, {
				className: "mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: "Customer Profile" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, { children: "Detailed customer information and statistics." })]
			}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-40" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-60" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-48" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-4 mt-6",
						children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-16 mb-2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-12" })]
						}, i))
					})
				]
			}) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border border-red/20 bg-red/5 p-4 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-red/80",
					children: error
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: refetch,
					className: "text-sm underline mt-2",
					children: "Retry"
				})]
			}) : !details ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Customer not found."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "font-semibold text-lg",
							children: [
								details.first_name ?? "",
								" ",
								details.last_name ?? ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: details.email
						}),
						details.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: details.phone
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center gap-2 mt-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `inline-block px-2 py-0.5 text-[10px] tracking-[0.2em] uppercase ${segmentColors[details.segment] ?? ""}`,
								children: details.segment
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-muted-foreground mt-2 space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Registered: ", new Date(details.registration_date).toLocaleDateString()] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								"Last activity:",
								" ",
								details.last_activity ? new Date(details.last_activity).toLocaleDateString() : "—"
							] })]
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground uppercase tracking-wider",
									children: "Orders"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xl font-bold mt-1",
									children: details.orders_count
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground uppercase tracking-wider",
									children: "Total Spent"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xl font-bold mt-1",
									children: ["$", Number(details.total_spent).toLocaleString()]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground uppercase tracking-wider",
									children: "Avg Order Value"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xl font-bold mt-1",
									children: ["$", Number(details.avg_order_value).toLocaleString()]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg border p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground uppercase tracking-wider",
									children: "Last Order"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium mt-1",
									children: details.last_order_at ? new Date(details.last_order_at).toLocaleDateString() : "—"
								})]
							})
						]
					}),
					details.recent_orders.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "font-semibold mb-2",
						children: "Recent Orders"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-md border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Order" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
								className: "text-right",
								children: "Total"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date" })
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: details.recent_orders.map((order) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-mono text-xs",
								children: order.order_number ?? order.id.slice(0, 8)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `inline-block px-2 py-0.5 text-[10px] tracking-[0.2em] uppercase ${statusColors[order.status] ?? ""}`,
								children: order.status
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
								className: "text-right font-serif tabular-nums",
								children: ["$", Number(order.total).toLocaleString()]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "text-xs text-muted-foreground whitespace-nowrap",
								children: new Date(order.created_at).toLocaleDateString()
							})
						] }, order.id)) })] })
					})] }),
					details.addresses.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "font-semibold mb-2",
						children: "Addresses"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2",
						children: details.addresses.map((addr) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md border p-3 text-sm",
							children: [
								addr.label && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium text-xs uppercase text-muted-foreground",
									children: addr.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [addr.line1, addr.line2 ? `, ${addr.line2}` : ""] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
									addr.city,
									addr.state ? `, ${addr.state}` : "",
									" ",
									addr.postal_code
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: addr.country }),
								addr.is_default && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "outline",
									className: "mt-1 text-[10px]",
									children: "Default"
								})
							]
						}, addr.id))
					})] }),
					details.addresses.length === 0 && details.recent_orders.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No additional information available."
					})
				]
			})]
		})
	});
}
var segmentBadge = {
	new: "secondary",
	returning: "default",
	vip: "outline"
};
function CustomersTable() {
	const [page, setPage] = (0, import_react.useState)(1);
	const [search, setSearch] = (0, import_react.useState)("");
	const [searchInput, setSearchInput] = (0, import_react.useState)("");
	const [sortBy, setSortBy] = (0, import_react.useState)("created_at");
	const [sortDir, setSortDir] = (0, import_react.useState)("desc");
	const [segment, setSegment] = (0, import_react.useState)("all");
	const [activity, setActivity] = (0, import_react.useState)("all");
	const [selectedUserId, setSelectedUserId] = (0, import_react.useState)(null);
	const [drawerOpen, setDrawerOpen] = (0, import_react.useState)(false);
	const pageSize = 20;
	const { result, loading, error, refetch } = useCustomersManagement(page, pageSize, search, sortBy, sortDir, segment === "all" ? "" : segment, activity === "all" ? "" : activity);
	const { analytics, loading: analyticsLoading } = useCustomersAnalytics();
	const debouncedSearch = (0, import_react.useCallback)((() => {
		let timer;
		return (val) => {
			clearTimeout(timer);
			timer = setTimeout(() => {
				setSearch(val);
				setPage(1);
			}, 300);
		};
	})(), []);
	function handleSort(column) {
		if (sortBy === column) setSortDir((d) => d === "asc" ? "desc" : "asc");
		else {
			setSortBy(column);
			setSortDir("desc");
		}
		setPage(1);
	}
	const sortIndicator = (column) => {
		if (sortBy !== column) return " ↕";
		return sortDir === "asc" ? " ↑" : " ↓";
	};
	function openDrawer(userId) {
		setSelectedUserId(userId);
		setDrawerOpen(true);
	}
	const totalPages = Math.max(1, Math.ceil((result?.total ?? 0) / pageSize));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			analyticsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 md:grid-cols-4 gap-4",
				children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-20 mb-2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-7 w-12" })]
				}, i))
			}) : analytics ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 md:grid-cols-4 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground uppercase tracking-wider",
							children: "Total"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-2xl font-bold mt-1",
							children: analytics.totalCustomers
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground uppercase tracking-wider",
							children: "New"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-2xl font-bold mt-1",
							children: analytics.newCustomers
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground uppercase tracking-wider",
							children: "Returning"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-2xl font-bold mt-1",
							children: analytics.returningCustomers
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground uppercase tracking-wider",
							children: "VIP"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-2xl font-bold mt-1",
							children: analytics.vipCustomers
						})]
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Search by name or email...",
						value: searchInput,
						onChange: (e) => {
							setSearchInput(e.target.value);
							debouncedSearch(e.target.value);
						},
						className: "max-w-xs"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: segment,
						onValueChange: (val) => {
							setSegment(val);
							setPage(1);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "w-32",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All segments" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "All segments"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "new",
								children: "New"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "returning",
								children: "Returning"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "vip",
								children: "VIP"
							})
						] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: activity,
						onValueChange: (val) => {
							setActivity(val);
							setPage(1);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "w-32",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All activity" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "All activity"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "active",
								children: "Active"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "inactive",
								children: "Inactive"
							})
						] })]
					})
				]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border border-red/20 bg-red/5 p-4 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-red/80",
					children: error
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					onClick: refetch,
					className: "mt-2",
					children: "Retry"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-md border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
						className: "cursor-pointer select-none",
						onClick: () => handleSort("name"),
						children: ["Customer", sortIndicator("name")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
						className: "cursor-pointer select-none",
						onClick: () => handleSort("orders_count"),
						children: ["Orders", sortIndicator("orders_count")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
						className: "cursor-pointer select-none text-right",
						onClick: () => handleSort("total_spent"),
						children: ["Total Spent", sortIndicator("total_spent")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Segment" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
						className: "cursor-pointer select-none",
						onClick: () => handleSort("created_at"),
						children: ["Registered", sortIndicator("created_at")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
						className: "cursor-pointer select-none",
						onClick: () => handleSort("last_activity"),
						children: ["Last Activity", sortIndicator("last_activity")]
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: loading ? Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-32" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-8" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-16 ml-auto" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-16" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-24" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-24" }) })
				] }, i)) : (result?.customers?.length ?? 0) === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 6,
					className: "text-center text-muted-foreground py-8",
					children: search || segment !== "all" || activity !== "all" ? "No customers match your filters" : "No customers found"
				}) }) : result?.customers.map((customer) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "cursor-pointer hover:bg-muted/30",
					onClick: () => openDrawer(customer.id),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-medium",
							children: [
								customer.first_name ?? "",
								" ",
								customer.last_name ?? ""
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: customer.email
						})] }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "tabular-nums",
							children: customer.orders_count
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
							className: "text-right font-serif tabular-nums",
							children: ["$", Number(customer.total_spent).toLocaleString()]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: segmentBadge[customer.segment] ?? "secondary",
							className: "capitalize",
							children: customer.segment
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs text-muted-foreground whitespace-nowrap",
							children: new Date(customer.registration_date).toLocaleDateString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs text-muted-foreground whitespace-nowrap",
							children: customer.last_activity ? new Date(customer.last_activity).toLocaleDateString() : "—"
						})
					]
				}, customer.id)) })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [result?.total ?? 0, " total"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
							className: "text-sm text-muted-foreground",
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
							onClick: () => setPage(page + 1),
							children: "Next"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerProfileDrawer, {
				userId: selectedUserId,
				open: drawerOpen,
				onClose: () => {
					setDrawerOpen(false);
					setSelectedUserId(null);
				}
			})
		]
	});
}
function CustomersPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminLayout, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: "Admin"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-4xl mt-2",
				children: "Customers"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-2 max-w-lg",
				children: "View customer profiles, track orders and spending, and manage customer segments."
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomersTable, {})] });
}
//#endregion
export { CustomersPage as component };
