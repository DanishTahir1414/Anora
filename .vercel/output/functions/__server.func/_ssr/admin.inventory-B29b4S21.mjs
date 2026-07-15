import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { r as supabase } from "./auth-context-oFJLTVEi.mjs";
import { n as cn, t as AdminLayout } from "./utils-Cy0gksMl.mjs";
import { t as Input } from "./input-Ch8T9SMc.mjs";
import { t as Button } from "./button-Dfd9l4mi.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-CvsFPszi.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-3x9W9oz0.mjs";
import { t as Label } from "./label-DJfgubqt.mjs";
import { a as SelectTrigger, i as SelectItem, n as Select, o as SelectValue, r as SelectContent, t as Badge } from "./badge-BzsAq-GY.mjs";
import { a as SheetHeader, n as SheetContent, o as SheetTitle, r as SheetDescription, t as Sheet } from "./sheet-C1AdHd_R.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.inventory-B29b4S21.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function rpc(name, params) {
	const { data, error } = await supabase.rpc(name, params);
	if (error) throw error;
	return data;
}
function useInventoryManagement(page, pageSize, search = "", sortBy = "name", sortDir = "asc", stockStatus = "", categoryId = "") {
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
			if (stockStatus) params.p_stock_status = stockStatus;
			if (categoryId) params.p_category_id = categoryId;
			setResult(await rpc("get_inventory_management", params));
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
		stockStatus,
		categoryId
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
function useInventorySummary() {
	const [summary, setSummary] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setError(null);
			setSummary(await rpc("get_inventory_summary"));
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
function useInventoryHistory(productId) {
	const [movements, setMovements] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		if (!productId) return;
		try {
			setLoading(true);
			setError(null);
			setMovements(await rpc("get_inventory_history", {
				p_product_id: productId,
				p_limit: 50
			}));
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, [productId]);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	return {
		movements,
		loading,
		error,
		refetch: load
	};
}
function useInventoryAlerts(unresolvedOnly = true) {
	const [alerts, setAlerts] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setError(null);
			setAlerts(await rpc("get_inventory_alerts", { p_unresolved_only: unresolvedOnly }));
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, [unresolvedOnly]);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	return {
		alerts,
		loading,
		error,
		refetch: load
	};
}
async function adjustStock(productId, newStock, reason) {
	return rpc("adjust_stock", {
		p_product_id: productId,
		p_new_stock: newStock,
		p_reason: reason || null
	});
}
async function addStock(productId, quantity, reason) {
	return rpc("add_stock", {
		p_product_id: productId,
		p_quantity: quantity,
		p_reason: reason || null
	});
}
async function removeStock(productId, quantity, reason) {
	return rpc("remove_stock", {
		p_product_id: productId,
		p_quantity: quantity,
		p_reason: reason || null
	});
}
async function resolveAlert(alertId) {
	return rpc("resolve_alert", { p_alert_id: alertId });
}
var Card = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("rounded-xl border bg-card text-card-foreground shadow", className),
	...props
}));
Card.displayName = "Card";
var CardHeader = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex flex-col space-y-1.5 p-6", className),
	...props
}));
CardHeader.displayName = "CardHeader";
var CardTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("font-semibold leading-none tracking-tight", className),
	...props
}));
CardTitle.displayName = "CardTitle";
var CardDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
CardDescription.displayName = "CardDescription";
var CardContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("p-6 pt-0", className),
	...props
}));
CardContent.displayName = "CardContent";
var CardFooter = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex items-center p-6 pt-0", className),
	...props
}));
CardFooter.displayName = "CardFooter";
function InventoryDashboard() {
	const { summary, loading, error } = useInventorySummary();
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-sm text-muted-foreground",
		children: "Loading summary..."
	});
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-sm text-red-500",
		children: error
	});
	if (!summary) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-4 md:grid-cols-5",
		children: [
			{
				title: "Total Products",
				value: summary.totalProducts
			},
			{
				title: "In Stock",
				value: summary.inStock,
				className: "text-green-600"
			},
			{
				title: "Low Stock",
				value: summary.lowStock,
				className: "text-amber-600"
			},
			{
				title: "Out of Stock",
				value: summary.outOfStock,
				className: "text-red-600"
			},
			{
				title: "Overstock",
				value: summary.overstock,
				className: "text-blue-600"
			}
		].map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
			className: "pb-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-sm font-medium text-muted-foreground",
				children: card.title
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: `text-2xl font-bold ${card.className ?? ""}`,
			children: card.value
		}) })] }, card.title))
	});
}
function AdjustStockDialog({ product, open, onOpenChange, onSuccess }) {
	const [mode, setMode] = (0, import_react.useState)("set");
	const [quantity, setQuantity] = (0, import_react.useState)("");
	const [reason, setReason] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	async function handleSubmit(e) {
		e.preventDefault();
		setError("");
		const qty = parseInt(quantity, 10);
		if (isNaN(qty) || qty <= 0) {
			setError("Quantity must be a positive number");
			return;
		}
		setLoading(true);
		let result;
		try {
			if (mode === "set") result = await adjustStock(product.id, qty, reason || void 0);
			else if (mode === "add") result = await addStock(product.id, qty, reason || void 0);
			else result = await removeStock(product.id, qty, reason || void 0);
			if (result.success) onSuccess();
			else setError(result.error ?? "Operation failed");
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Adjust Stock" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
			product.name,
			" — Current stock: ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: product.stock })
		] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Mode" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: mode,
						onValueChange: (v) => setMode(v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "set",
								children: "Set to exact value"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "add",
								children: "Add quantity"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "remove",
								children: "Remove quantity"
							})
						] })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "adj-qty",
						children: mode === "set" ? "New stock value" : mode === "add" ? "Quantity to add" : "Quantity to remove"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "adj-qty",
						type: "number",
						min: 1,
						value: quantity,
						onChange: (e) => setQuantity(e.target.value),
						placeholder: "0"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "adj-reason",
						children: "Reason (optional)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "adj-reason",
						value: reason,
						onChange: (e) => setReason(e.target.value),
						placeholder: "e.g. Inventory count adjustment"
					})]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-red-500 text-sm",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: loading,
					children: loading ? "Saving..." : "Save"
				}) })
			]
		})] })
	});
}
function InventoryHistoryDrawer({ productId, onClose }) {
	const { movements, loading, error } = useInventoryHistory(productId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open: !!productId,
		onOpenChange: (open) => {
			if (!open) onClose();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			className: "sm:max-w-xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: "Inventory History" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, { children: "Stock movements for this product" })] }), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-4",
				children: "Loading..."
			}) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-red-500 mt-4",
				children: error
			}) : !movements || movements.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-4",
				children: "No movements recorded"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 rounded-md border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Type" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Change"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "After"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Reason" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: movements.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "capitalize",
						children: m.movement_type
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: `text-right font-mono ${m.quantity > 0 ? "text-green-600" : "text-red-600"}`,
						children: m.quantity > 0 ? `+${m.quantity}` : m.quantity
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right font-mono",
						children: m.new_stock
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-sm",
						children: m.reason ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-sm whitespace-nowrap",
						children: new Date(m.created_at).toLocaleString()
					})
				] }, m.id)) })] })
			})]
		})
	});
}
function getStockBadge(stock) {
	if (stock <= 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "destructive",
		children: "Critical"
	});
	if (stock <= 10) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "secondary",
		children: "Low"
	});
	if (stock > 100) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: "Overstock" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		variant: "outline",
		children: "Healthy"
	});
}
function InventoryTable() {
	const [page, setPage] = (0, import_react.useState)(1);
	const [search, setSearch] = (0, import_react.useState)("");
	const [sortBy, setSortBy] = (0, import_react.useState)("name");
	const [sortDir, setSortDir] = (0, import_react.useState)("asc");
	const [stockStatus, setStockStatus] = (0, import_react.useState)("all");
	const [categoryId, setCategoryId] = (0, import_react.useState)("all");
	const [categories, setCategories] = (0, import_react.useState)([]);
	const [adjustProduct, setAdjustProduct] = (0, import_react.useState)(null);
	const [historyProductId, setHistoryProductId] = (0, import_react.useState)(null);
	const pageSize = 20;
	const { result, loading, error, refetch } = useInventoryManagement(page, pageSize, search, sortBy, sortDir, stockStatus === "all" ? "" : stockStatus, categoryId === "all" ? "" : categoryId);
	(0, import_react.useEffect)(() => {
		supabase.from("categories").select("id, name").then(({ data }) => {
			if (data) setCategories(data);
		});
	}, []);
	function handleSort(column) {
		if (sortBy === column) setSortDir((d) => d === "asc" ? "desc" : "asc");
		else {
			setSortBy(column);
			setSortDir("asc");
		}
		setPage(1);
	}
	const sortIndicator = (column) => {
		if (sortBy !== column) return " ↕";
		return sortDir === "asc" ? " ↑" : " ↓";
	};
	const totalPages = Math.max(1, Math.ceil((result?.total ?? 0) / pageSize));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Search products...",
						value: search,
						onChange: (e) => {
							setSearch(e.target.value);
							setPage(1);
						},
						className: "max-w-xs"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: stockStatus,
						onValueChange: (val) => {
							setStockStatus(val);
							setPage(1);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "w-36",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All stock" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "All stock"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "critical",
								children: "Critical"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "low",
								children: "Low"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "healthy",
								children: "Healthy"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "overstock",
								children: "Overstock"
							})
						] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: categoryId,
						onValueChange: (val) => {
							setCategoryId(val);
							setPage(1);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "w-44",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All categories" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "all",
							children: "All categories"
						}), categories.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: cat.id,
							children: cat.name
						}, cat.id))] })]
					})
				]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-red-500 text-sm",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-md border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
						className: "cursor-pointer select-none",
						onClick: () => handleSort("name"),
						children: ["Product", sortIndicator("name")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
						className: "cursor-pointer select-none",
						onClick: () => handleSort("sku"),
						children: ["SKU", sortIndicator("sku")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Category" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
						className: "cursor-pointer select-none text-right",
						onClick: () => handleSort("stock"),
						children: ["Stock", sortIndicator("stock")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Actions"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 6,
					className: "text-center text-muted-foreground py-8",
					children: "Loading..."
				}) }) : (result?.products?.length ?? 0) === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 6,
					className: "text-center text-muted-foreground py-8",
					children: "No products found"
				}) }) : result?.products.map((product) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-medium",
						children: product.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-mono text-sm",
						children: product.sku ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-sm",
						children: product.category_name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right font-mono",
						children: product.stock
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: getStockBadge(product.stock) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => setAdjustProduct(product),
								children: "Adjust"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => setHistoryProductId(product.id),
								children: "History"
							})]
						})
					})
				] }, product.id)) })] })
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
							onClick: () => setPage((p) => Math.max(1, p - 1)),
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
							onClick: () => setPage((p) => p + 1),
							children: "Next"
						})
					]
				})]
			}),
			adjustProduct && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdjustStockDialog, {
				product: adjustProduct,
				open: !!adjustProduct,
				onOpenChange: (open) => {
					if (!open) setAdjustProduct(null);
				},
				onSuccess: () => {
					setAdjustProduct(null);
					refetch();
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InventoryHistoryDrawer, {
				productId: historyProductId,
				onClose: () => setHistoryProductId(null)
			})
		]
	});
}
var alertColors = {
	critical: "destructive",
	low: "secondary",
	overstock: "default"
};
function InventoryAlertsWidget() {
	const { alerts, loading, error, refetch } = useInventoryAlerts(true);
	async function handleResolve(alertId) {
		await resolveAlert(alertId);
		refetch();
	}
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-sm text-muted-foreground",
		children: "Loading alerts..."
	});
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-sm text-red-500",
		children: error
	});
	if (!alerts || alerts.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
		className: "text-lg",
		children: "Inventory Alerts"
	}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "No alerts to show"
	}) })] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
		className: "text-lg",
		children: [
			"Inventory Alerts (",
			alerts.length,
			")"
		]
	}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
		className: "space-y-2",
		children: alerts.map((alert) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between rounded-md border p-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: alertColors[alert.alert_type] ?? "outline",
					children: alert.alert_type
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium text-sm",
					children: alert.product_name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						"SKU: ",
						alert.product_sku ?? "—",
						" · Stock: ",
						alert.current_stock,
						" · Threshold: ",
						alert.threshold
					]
				})] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: () => handleResolve(alert.id),
				children: "Resolve"
			})]
		}, alert.id))
	})] });
}
function InventoryPage() {
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
					children: "Inventory"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-2 max-w-lg",
					children: "Manage product stock levels, view alerts, and track inventory history."
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InventoryDashboard, {})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-8 lg:grid-cols-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "lg:col-span-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InventoryTable, {})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InventoryAlertsWidget, {}) })]
		})
	] });
}
//#endregion
export { InventoryPage as component };
