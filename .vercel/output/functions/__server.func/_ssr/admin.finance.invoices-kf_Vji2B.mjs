import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { $ as CircleCheckBig, J as Download, K as Eye, M as Mail, Q as CircleX, U as FileText } from "../_libs/lucide-react.mjs";
import { t as AdminLayout } from "./utils-Cy0gksMl.mjs";
import { t as Skeleton } from "./skeleton-9naKPw9_.mjs";
import { t as DashboardCard } from "./DashboardCard-DEbOb3YD.mjs";
import { t as Input } from "./input-Ch8T9SMc.mjs";
import { t as Button } from "./button-Dfd9l4mi.mjs";
import { t as rpc } from "./admin-client-C5B6s_l5.mjs";
import { n as useFinanceDashboard } from "./admin-finance-DKZCH8M6.mjs";
import { i as generateInvoicePDF, t as exportCSV } from "./admin-export-7Fw4PX4D.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.finance.invoices-kf_Vji2B.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useInvoicesManagement(page, pageSize, search = "", sortBy = "created_at", sortDir = "desc", statusFilter = "", dateFrom = "", dateTo = "") {
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
			if (statusFilter) params.p_status_filter = statusFilter;
			if (dateFrom) params.p_date_from = dateFrom;
			if (dateTo) params.p_date_to = dateTo;
			setResult(await rpc("get_invoices_management", params));
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
		statusFilter,
		dateFrom,
		dateTo
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
function useInvoiceDetails(invoiceId) {
	const [data, setData] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const load = (0, import_react.useCallback)(async () => {
		if (!invoiceId) {
			setData(null);
			return;
		}
		try {
			setLoading(true);
			setData(await rpc("get_invoice_details", { p_invoice_id: invoiceId }));
		} catch {
			setData(null);
		} finally {
			setLoading(false);
		}
	}, [invoiceId]);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	return {
		data,
		loading
	};
}
async function generateInvoice(orderId) {
	return rpc("generate_invoice", { p_order_id: orderId });
}
async function updateInvoiceStatus(invoiceId, status) {
	return rpc("update_invoice_status", {
		p_invoice_id: invoiceId,
		p_status: status
	});
}
async function sendInvoiceEmail(invoiceId) {
	const functionUrl = `${"https://zqapvgxlnzpmdcwqlfyt.supabase.co".replace(/\/$/, "")}/functions/v1/send-invoice`;
	return (await fetch(functionUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ invoice_id: invoiceId })
	})).json();
}
var STATUS_BADGES = {
	draft: "bg-neutral-100 text-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-300",
	issued: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
	paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
	cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
	refunded: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
};
function StatusBadge({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `inline-block px-2.5 py-1 text-[10px] tracking-[0.2em] uppercase ${STATUS_BADGES[status] ?? "bg-neutral-100 text-muted-foreground"}`,
		children: status
	});
}
function InvoicesTable() {
	const [page, setPage] = (0, import_react.useState)(1);
	const [search, setSearch] = (0, import_react.useState)("");
	const [searchInput, setSearchInput] = (0, import_react.useState)("");
	const [sortBy, setSortBy] = (0, import_react.useState)("created_at");
	const [sortDir, setSortDir] = (0, import_react.useState)("desc");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("");
	const [selectedInvoiceId, setSelectedInvoiceId] = (0, import_react.useState)(null);
	const [detailOpen, setDetailOpen] = (0, import_react.useState)(false);
	const [generateOrderId, setGenerateOrderId] = (0, import_react.useState)("");
	const [generateOpen, setGenerateOpen] = (0, import_react.useState)(false);
	const pageSize = 15;
	const { result: invResult, loading, error, refetch } = useInvoicesManagement(page, pageSize, search, sortBy, sortDir, statusFilter);
	const { data: detailData, loading: detailLoading } = useInvoiceDetails(selectedInvoiceId);
	const { data: financeDash } = useFinanceDashboard();
	const [genLoading, setGenLoading] = (0, import_react.useState)(false);
	const [genError, setGenError] = (0, import_react.useState)(null);
	const [statusLoading, setStatusLoading] = (0, import_react.useState)(false);
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
	const totalPages = Math.max(1, Math.ceil((invResult?.total ?? 0) / pageSize));
	const invoiceCards = financeDash ? [
		{
			label: "Total Invoices",
			value: financeDash.totalInvoices.toLocaleString()
		},
		{
			label: "Draft",
			value: financeDash.draftInvoices.toLocaleString(),
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" })
		},
		{
			label: "Issued",
			value: financeDash.issuedInvoices.toLocaleString(),
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" })
		},
		{
			label: "Paid",
			value: financeDash.paidInvoices.toLocaleString(),
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-4 w-4" })
		}
	] : [];
	function handleDownloadPDF(invoice) {
		if (!detailData) return;
		generateInvoicePDF({
			invoiceNumber: invoice.invoice_number,
			orderNumber: invoice.order_number,
			customerName: invoice.customer_name,
			customerEmail: invoice.customer_email,
			issuedAt: invoice.issued_at,
			items: (detailData.items || []).map((item) => ({
				productName: item.product_name,
				quantity: item.quantity,
				unitPrice: item.unit_price,
				totalPrice: item.total_price
			})),
			subtotal: invoice.subtotal,
			taxAmount: invoice.tax_amount,
			discountAmount: invoice.discount_amount,
			shippingAmount: invoice.shipping_amount,
			totalAmount: invoice.total_amount
		});
	}
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
					children: "Invoices"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-2 max-w-lg",
					children: "Generate, view, and manage invoices for orders."
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-8",
			children: invoiceCards.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
				label: c.label,
				value: c.value,
				icon: c.icon
			}, c.label))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => setGenerateOpen(!generateOpen),
					children: "Generate Invoice"
				}), invResult?.invoices && invResult.invoices.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => {
						exportCSV(invResult.invoices.map((inv) => ({
							"Invoice #": inv.invoice_number,
							Customer: inv.customer_name,
							Email: inv.customer_email,
							Total: inv.total_amount,
							Status: inv.status,
							Issued: inv.issued_at ? new Date(inv.issued_at).toLocaleDateString() : ""
						})), `invoices-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}`);
					},
					children: "Export CSV"
				})]
			}), generateOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2 items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Order ID",
					value: generateOrderId,
					onChange: (e) => setGenerateOrderId(e.target.value),
					className: "w-64 h-9 text-sm"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					disabled: !generateOrderId || genLoading,
					onClick: async () => {
						setGenLoading(true);
						setGenError(null);
						try {
							const res = await generateInvoice(generateOrderId);
							if (res.success) {
								setGenerateOrderId("");
								setGenerateOpen(false);
								refetch();
							} else setGenError(res.error || "Failed to generate invoice");
						} catch (err) {
							setGenError(err instanceof Error ? err.message : "An error occurred");
						} finally {
							setGenLoading(false);
						}
					},
					children: genLoading ? "Generating..." : "Create"
				})]
			})]
		}),
		genError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border border-red/20 bg-red/5 p-4 text-sm text-red/80 mb-6",
			children: genError
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col sm:flex-row gap-3 mb-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: "Search invoices, customers…",
				value: searchInput,
				onChange: (e) => {
					setSearchInput(e.target.value);
					debouncedSearch(e.target.value);
				},
				className: "max-w-sm h-9 text-sm"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
				value: statusFilter,
				onChange: (e) => {
					setStatusFilter(e.target.value);
					setPage(1);
				},
				className: "h-9 rounded-md border border-input bg-background px-3 text-xs text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "All Statuses"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "draft",
						children: "Draft"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "issued",
						children: "Issued"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "paid",
						children: "Paid"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "cancelled",
						children: "Cancelled"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "refunded",
						children: "Refunded"
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
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" }), Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-12 w-full" }, i))]
		}),
		!loading && !error && invResult && invResult.invoices.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border border-border/60 p-12 text-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: search || statusFilter ? "No invoices match your filters" : "No invoices yet. Generate one from an order."
			})
		}),
		!loading && !error && invResult && invResult.invoices.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border border-border/60 overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border/60",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Th, {
							onClick: () => toggleSort("number"),
							children: ["Invoice #", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "number" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Th, {
							onClick: () => toggleSort("customer"),
							children: ["Customer", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "customer" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Th, {
							onClick: () => toggleSort("total"),
							className: "text-right",
							children: ["Total", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "total" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Th, {
							onClick: () => toggleSort("status"),
							children: ["Status", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "status" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Th, {
							onClick: () => toggleSort("issue_date"),
							children: ["Date", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "issue_date" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
							className: "text-right",
							children: "Actions"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: invResult.invoices.map((inv) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border/40 hover:bg-muted/30 cursor-pointer",
					onClick: () => {
						setSelectedInvoiceId(inv.id);
						setDetailOpen(true);
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-sm font-medium",
							children: inv.invoice_number
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3 text-sm",
							children: [
								inv.customer_name,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: inv.customer_email
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3 text-sm text-right font-serif tabular-nums",
							children: ["$", Number(inv.total_amount).toLocaleString()]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: inv.status })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-xs text-muted-foreground whitespace-nowrap",
							children: inv.issued_at ? new Date(inv.issued_at).toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
								year: "numeric"
							}) : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-end gap-1",
								onClick: (e) => e.stopPropagation(),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "p-1.5 text-muted-foreground hover:text-foreground",
										title: "View",
										onClick: () => {
											setSelectedInvoiceId(inv.id);
											setDetailOpen(true);
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3.5 w-3.5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "p-1.5 text-muted-foreground hover:text-foreground",
										title: "Download PDF",
										onClick: () => {
											setSelectedInvoiceId(inv.id);
											setTimeout(() => handleDownloadPDF(inv), 200);
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "p-1.5 text-muted-foreground hover:text-foreground",
										title: "Email Invoice",
										onClick: async () => {
											try {
												const res = await sendInvoiceEmail(inv.id);
												if (res.success) alert("Invoice sent to customer.");
												else alert(res.error || "Failed to send email.");
											} catch {
												alert("Failed to send email.");
											}
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-3.5 w-3.5" })
									}),
									inv.status === "draft" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "p-1.5 text-muted-foreground hover:text-emerald-600",
										title: "Mark Paid",
										disabled: statusLoading,
										onClick: async () => {
											setStatusLoading(true);
											try {
												if ((await updateInvoiceStatus(inv.id, "paid")).success) refetch();
											} finally {
												setStatusLoading(false);
											}
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-3.5 w-3.5" })
									}),
									(inv.status === "draft" || inv.status === "issued") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "p-1.5 text-muted-foreground hover:text-red-600",
										title: "Cancel",
										disabled: statusLoading,
										onClick: async () => {
											setStatusLoading(true);
											try {
												if ((await updateInvoiceStatus(inv.id, "cancelled")).success) refetch();
											} finally {
												setStatusLoading(false);
											}
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-3.5 w-3.5" })
									})
								]
							})
						})
					]
				}, inv.id)) })]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between pt-4 text-sm text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				invResult.total,
				" invoice",
				invResult.total !== 1 ? "s" : ""
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
		})] }),
		detailOpen && selectedInvoiceId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "fixed inset-0 z-50 flex justify-end",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 bg-black/20",
				onClick: () => setDetailOpen(false)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative w-full max-w-lg bg-background border-l border-border/60 p-6 overflow-y-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between items-start mb-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-serif text-xl",
						children: detailData?.invoice?.invoice_number || "Invoice"
					}), detailData?.order?.order_number && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground mt-1",
						children: ["Order: ", detailData.order.order_number]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setDetailOpen(false),
						className: "text-muted-foreground hover:text-foreground text-lg leading-none",
						children: "×"
					})]
				}), detailLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-6 w-48" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-32" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32 w-full" })
					]
				}) : detailData ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-6 p-4 bg-neutral/50 text-sm space-y-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: "Status: "
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: detailData.invoice.status })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: "Customer: "
							}), detailData.invoice.customer_name] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: "Email: "
							}), detailData.invoice.customer_email] }),
							detailData.invoice.issued_at && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: "Issued: "
							}), new Date(detailData.invoice.issued_at).toLocaleDateString()] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-xs uppercase tracking-wider text-muted-foreground mb-3",
						children: "Items"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border border-border/60 mb-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border/60 text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left px-3 py-2 font-medium",
										children: "Item"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-center px-3 py-2 font-medium",
										children: "Qty"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-right px-3 py-2 font-medium",
										children: "Price"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-right px-3 py-2 font-medium",
										children: "Total"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: detailData.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border/40",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2",
										children: item.product_name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2 text-center text-muted-foreground",
										children: item.quantity
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-3 py-2 text-right tabular-nums",
										children: ["$", Number(item.unit_price).toFixed(2)]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-3 py-2 text-right tabular-nums",
										children: ["$", Number(item.total_price).toFixed(2)]
									})
								]
							}, item.id)) })]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-sm space-y-1.5 ml-auto w-48",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Subtotal"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["$", Number(detailData.invoice.subtotal).toFixed(2)] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Tax"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["$", Number(detailData.invoice.tax_amount).toFixed(2)] })]
							}),
							Number(detailData.invoice.discount_amount) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Discount"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["-$", Number(detailData.invoice.discount_amount).toFixed(2)] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Shipping"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["$", Number(detailData.invoice.shipping_amount).toFixed(2)] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between font-semibold pt-2 border-t border-border/40",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["$", Number(detailData.invoice.total_amount).toFixed(2)] })]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							className: "flex-1",
							onClick: () => handleDownloadPDF(detailData.invoice),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5 mr-1.5" }), " PDF"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							className: "flex-1",
							onClick: async () => {
								if (!selectedInvoiceId) return;
								try {
									const res = await sendInvoiceEmail(selectedInvoiceId);
									if (res.success) alert("Invoice sent to customer.");
									else alert(res.error || "Failed to send email.");
								} catch {
									alert("Failed to send email.");
								}
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-3.5 w-3.5 mr-1.5" }), " Email"]
						})]
					})
				] }) : null]
			})]
		})
	] });
}
function Th({ children, onClick, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
		className: `px-4 py-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-medium ${onClick ? "cursor-pointer hover:text-foreground" : ""} ${className}`,
		onClick,
		children
	});
}
function InvoicesPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvoicesTable, {}) });
}
//#endregion
export { InvoicesPage as component };
