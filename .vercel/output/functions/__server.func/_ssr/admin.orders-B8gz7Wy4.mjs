import { o as __toESM } from "../_runtime.mjs";
import { y as formatAddress } from "./ssr.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { c as useOrderMetrics, i as processReturn, l as useOrdersManagement, n as cancelOrder, o as updateOrderStatus, r as processRefund, s as useOrderDetails, t as addInternalNote } from "./admin-orders-DRh_-Ycm.mjs";
import { rt as Check, t as X } from "../_libs/lucide-react.mjs";
import { t as AdminLayout } from "./utils-Cy0gksMl.mjs";
import { t as Skeleton } from "./skeleton-9naKPw9_.mjs";
import { t as DashboardCard } from "./DashboardCard-DEbOb3YD.mjs";
import { t as Input } from "./input-Ch8T9SMc.mjs";
import { t as Button } from "./button-Dfd9l4mi.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-CvsFPszi.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-Dm5O1Pb3.mjs";
import { a as SheetHeader, n as SheetContent, o as SheetTitle, r as SheetDescription, t as Sheet } from "./sheet-C1AdHd_R.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.orders-B8gz7Wy4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_BADGES$1 = {
	pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
	confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
	processing: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
	packed: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
	shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
	out_for_delivery: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
	delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
	cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
	returned: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
	refunded: "bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-300"
};
var PAYMENT_BADGES$1 = {
	pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
	completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
	failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
	refunded: "bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-300"
};
function Badge({ value, map }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `inline-block px-2.5 py-1 text-[10px] tracking-[0.2em] uppercase ${map[value] ?? "bg-neutral-100 text-muted-foreground"}`,
		children: value
	});
}
function formatCurrency(n) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD"
	}).format(n);
}
function formatDate(d) {
	return new Date(d).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	});
}
function DetailRow({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between py-1.5 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-medium text-right ml-4",
			children: value || "—"
		})]
	});
}
var STATUS_TRANSITIONS = {
	pending: ["confirmed", "cancelled"],
	confirmed: ["processing", "cancelled"],
	processing: ["packed", "cancelled"],
	packed: ["shipped", "cancelled"],
	shipped: ["out_for_delivery"],
	out_for_delivery: ["delivered"],
	delivered: ["returned"],
	cancelled: ["refunded"],
	returned: ["refunded"]
};
function StatusManager({ currentStatus, orderId, onUpdated }) {
	const [nextStatus, setNextStatus] = (0, import_react.useState)(null);
	const [confirming, setConfirming] = (0, import_react.useState)(false);
	const [updating, setUpdating] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const transitions = STATUS_TRANSITIONS[currentStatus] ?? [];
	async function handleConfirm() {
		if (!nextStatus) return;
		setUpdating(true);
		setError(null);
		try {
			const result = await updateOrderStatus(orderId, nextStatus);
			if (!result.success) {
				setError(result.error ?? "Failed to update status");
				return;
			}
			onUpdated();
			setConfirming(false);
			setNextStatus(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setUpdating(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-2",
			children: "Update Status"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-wrap gap-2",
			children: transitions.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => {
					setNextStatus(s);
					setConfirming(true);
				},
				className: `px-3 py-1.5 text-[11px] tracking-[0.2em] uppercase rounded border transition-colors ${s === "cancelled" ? "border-red/30 text-red/70 hover:border-red/60 hover:text-red" : "border-border/60 text-muted-foreground hover:border-foreground/30 hover:text-foreground"}`,
				children: s
			}, s))
		}),
		error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-red/80 mt-2",
			children: error
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
			open: confirming,
			onOpenChange: setConfirming,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Update Order Status" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
				"Change order status from ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: currentStatus }),
				" to",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: nextStatus }),
				"?"
			] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
				disabled: updating,
				children: "Cancel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
				onClick: handleConfirm,
				disabled: updating,
				children: updating ? "Updating..." : "Confirm"
			})] })] })
		})
	] });
}
function AdminCancelDialog({ orderId, currentStatus, onUpdated }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [reason, setReason] = (0, import_react.useState)("");
	const [customReason, setCustomReason] = (0, import_react.useState)("");
	const [updating, setUpdating] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const adminReasons = [
		"Customer Requested",
		"Out of Stock",
		"Payment Failed",
		"Fraud Detected",
		"Other"
	];
	if (![
		"pending",
		"confirmed",
		"processing",
		"packed"
	].includes(currentStatus)) return null;
	async function handleConfirm() {
		const finalReason = reason === "Other" ? customReason : reason;
		if (!finalReason) return;
		setUpdating(true);
		setError(null);
		try {
			const result = await cancelOrder(orderId, finalReason, "admin");
			if (!result.success) {
				setError(result.error ?? "Failed to cancel order");
				return;
			}
			onUpdated();
			setOpen(false);
			setReason("");
			setCustomReason("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setUpdating(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			onClick: () => setOpen(true),
			className: "px-3 py-1.5 text-[11px] tracking-[0.2em] uppercase rounded border border-red/30 text-red/70 hover:border-red/60 hover:text-red transition-colors",
			children: "Cancel Order"
		}),
		error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-red/80 mt-2",
			children: error
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
			open,
			onOpenChange: setOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Cancel Order" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "This will cancel the order. Select a reason." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: reason,
						onChange: (e) => setReason(e.target.value),
						className: "w-full h-9 rounded-md border border-input bg-background px-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Select a reason…"
						}), adminReasons.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: r,
							children: r
						}, r))]
					}), reason === "Other" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: customReason,
						onChange: (e) => setCustomReason(e.target.value),
						placeholder: "Describe the reason…",
						rows: 2,
						className: "w-full bg-background border border-border px-3 py-2 text-sm outline-none focus:border-foreground transition-colors resize-none"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
					disabled: updating,
					children: "Keep Order"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					onClick: handleConfirm,
					disabled: updating || !reason || reason === "Other" && !customReason,
					className: "bg-red/80 hover:bg-red",
					children: updating ? "Cancelling..." : "Cancel Order"
				})] })
			] })
		})
	] });
}
function InternalNotesSection({ orderId, internalNotes, onUpdated }) {
	const [note, setNote] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	async function handleAdd() {
		if (!note.trim()) return;
		setSaving(true);
		setError(null);
		try {
			const result = await addInternalNote(orderId, note.trim());
			if (!result.success) {
				setError(result.error ?? "Failed to add note");
				return;
			}
			setNote("");
			onUpdated();
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-3",
		children: "Internal Notes"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border border-border/60 p-3",
		children: [
			internalNotes ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "text-xs text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed mb-3 max-h-40 overflow-y-auto",
				children: internalNotes
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground mb-3",
				children: "No internal notes."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: note,
					onChange: (e) => setNote(e.target.value),
					placeholder: "Add a note…",
					className: "flex-1 bg-background border border-border px-3 py-1.5 text-sm outline-none focus:border-foreground transition-colors"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: handleAdd,
					disabled: saving || !note.trim(),
					className: "px-3 py-1.5 text-[11px] tracking-[0.2em] uppercase rounded border border-border/60 text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors disabled:opacity-50",
					children: saving ? "Saving..." : "Add"
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-red/80 mt-2",
				children: error
			})
		]
	})] });
}
function StatusHistorySection({ history }) {
	if (!history || history.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-3",
		children: "Status History"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "border border-border/60 p-4 space-y-3",
		children: history.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-3 text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-2 h-2 rounded-full bg-gold mt-1.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium capitalize",
					children: entry.new_status
				}), entry.previous_status && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-muted-foreground",
					children: [
						" ",
						"(was ",
						entry.previous_status,
						")"
					]
				})] }),
				entry.note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground mt-0.5",
					children: entry.note
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground mt-0.5",
					children: new Date(entry.created_at).toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
						year: "numeric",
						hour: "2-digit",
						minute: "2-digit"
					})
				})
			] })]
		}, entry.id))
	})] });
}
function ReturnManager({ details, onUpdated }) {
	const [processingId, setProcessingId] = (0, import_react.useState)(null);
	const [action, setAction] = (0, import_react.useState)(null);
	const pendingReturns = details.return_requests.filter((r) => r.status === "requested");
	async function handleProcess(returnId) {
		if (!action) return;
		try {
			if ((await processReturn(returnId, action === "approve" ? "approved" : "rejected")).success) onUpdated();
		} catch {} finally {
			setProcessingId(null);
			setAction(null);
		}
	}
	if (details.return_requests.length === 0 && pendingReturns.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-3",
				children: "Returns"
			}),
			details.return_requests.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border border-border/60 p-3 mb-2 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2 mb-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							value: r.status,
							map: {
								requested: "bg-amber-100 text-amber-800",
								approved: "bg-emerald-100 text-emerald-800",
								rejected: "bg-red-100 text-red-800",
								refunded: "bg-stone-100 text-stone-800"
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: formatDate(r.requested_at)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-muted-foreground text-xs mt-1",
						children: ["Reason: ", r.reason]
					}),
					r.admin_notes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-muted-foreground text-xs mt-1",
						children: ["Notes: ", r.admin_notes]
					}),
					r.status === "requested" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2 mt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => {
								setProcessingId(r.id);
								setAction("approve");
								handleProcess(r.id);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3 mr-1" }), " Approve"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							onClick: () => {
								setProcessingId(r.id);
								setAction("reject");
								handleProcess(r.id);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3 mr-1" }), " Reject"]
						})]
					})
				]
			}, r.id)),
			pendingReturns.length === 0 && details.return_requests.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "All returns processed."
			})
		]
	});
}
function RefundManager({ details, onUpdated }) {
	const [processing, setProcessing] = (0, import_react.useState)(false);
	const pendingRefunds = details.refunds.filter((r) => r.status === "pending");
	async function handleProcess(refundId, status) {
		setProcessing(true);
		try {
			if ((await processRefund(refundId, status)).success) onUpdated();
		} catch {} finally {
			setProcessing(false);
		}
	}
	if (details.refunds.length === 0 && pendingRefunds.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-3",
			children: "Refunds"
		}), details.refunds.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border border-border/60 p-3 mb-2 text-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2 mb-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						value: r.status,
						map: {
							pending: "bg-amber-100 text-amber-800",
							approved: "bg-emerald-100 text-emerald-800",
							rejected: "bg-red-100 text-red-800",
							completed: "bg-stone-100 text-stone-800"
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: formatCurrency(r.amount)
					})]
				}),
				r.reason && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-muted-foreground text-xs mt-1",
					children: ["Reason: ", r.reason]
				}),
				r.processed_at && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-muted-foreground text-xs mt-1",
					children: ["Processed: ", formatDate(r.processed_at)]
				}),
				r.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2 mt-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							disabled: processing,
							onClick: () => handleProcess(r.id, "approved"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3 mr-1" }), " Approve"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							disabled: processing,
							onClick: () => handleProcess(r.id, "rejected"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3 mr-1" }), " Reject"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "outline",
							disabled: processing,
							onClick: () => handleProcess(r.id, "completed"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3 mr-1" }), " Complete Refund"]
						})
					]
				})
			]
		}, r.id))]
	});
}
function OrderDetailsContent({ details, onUpdated }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8 pb-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusManager, {
				currentStatus: details.status,
				orderId: details.id,
				onUpdated
			}),
			details.status !== "cancelled" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminCancelDialog, {
				currentStatus: details.status,
				orderId: details.id,
				onUpdated
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-3",
				children: "Order Information"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border border-border/60 p-4 space-y-1 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
						label: "Order ID",
						value: details.id
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
						label: "Order Number",
						value: details.order_number ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
						label: "Created",
						value: formatDate(details.created_at)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
						label: "Updated",
						value: formatDate(details.updated_at)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between py-1.5 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Status"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							value: details.status,
							map: STATUS_BADGES$1
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between py-1.5 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Payment"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							value: details.payment_status,
							map: PAYMENT_BADGES$1
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
						label: "Payment Method",
						value: details.payment_method ?? "—"
					}),
					details.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
						label: "Notes",
						value: details.notes
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-3",
				children: "Customer"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border border-border/60 p-4 space-y-1 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
						label: "Name",
						value: [details.customer.first_name, details.customer.last_name].filter(Boolean).join(" ") || "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
						label: "Email",
						value: details.customer.email
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
						label: "Phone",
						value: details.customer.phone ?? "—"
					})
				]
			})] }),
			details.shipping_address && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-3",
				children: "Shipping Address"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border border-border/60 p-4 text-sm text-muted-foreground whitespace-pre-line leading-relaxed",
				children: formatAddress(details.shipping_address)
			})] }),
			details.items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-3",
				children: [
					"Items (",
					details.items.length,
					")"
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border border-border/60 overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border/40",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left p-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-medium",
								children: "Product"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left p-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-medium",
								children: "SKU"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-right p-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-medium",
								children: "Qty"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-right p-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-medium",
								children: "Price"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-right p-3 text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-medium",
								children: "Total"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: details.items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border/20 last:border-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-3 font-medium",
								children: item.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-3 text-muted-foreground text-xs",
								children: item.sku ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-3 text-right tabular-nums",
								children: item.quantity
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-3 text-right tabular-nums",
								children: formatCurrency(item.price)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "p-3 text-right tabular-nums font-medium",
								children: formatCurrency(item.total)
							})
						]
					}, item.id)) })]
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-3",
				children: "Financial Summary"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border border-border/60 p-4 space-y-1 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
						label: "Subtotal",
						value: formatCurrency(details.subtotal)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
						label: "Shipping",
						value: formatCurrency(details.shipping_cost)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
						label: "Discount",
						value: details.discount > 0 ? `-${formatCurrency(details.discount)}` : "—"
					}),
					details.coupon_code && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
						label: "Coupon",
						value: details.coupon_code
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-t border-border/40 pt-2 mt-2 flex justify-between text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: "Grand Total"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-serif font-bold",
							children: formatCurrency(details.total)
						})]
					})
				]
			})] }),
			details.cancelled_by && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-3",
				children: "Cancellation"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border border-red/20 bg-red/5 p-4 space-y-1 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
						label: "Cancelled by",
						value: details.cancelled_by === "customer" ? "Customer" : "Staff"
					}),
					details.cancelled_at && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
						label: "Date",
						value: formatDate(details.cancelled_at)
					}),
					details.cancellation_reason && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailRow, {
						label: "Reason",
						value: details.cancellation_reason
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusHistorySection, { history: details.status_history }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InternalNotesSection, {
				orderId: details.id,
				internalNotes: details.internal_notes,
				onUpdated
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReturnManager, {
				details,
				onUpdated
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefundManager, {
				details,
				onUpdated
			})
		]
	});
}
function OrderDetailsDrawer({ orderId, open, onClose, onUpdated }) {
	const { details, loading, error, refetch } = useOrderDetails(orderId);
	(0, import_react.useEffect)(() => {
		if (open && orderId) refetch();
	}, [
		open,
		orderId,
		refetch
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open,
		onOpenChange: (o) => {
			if (!o) onClose();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			className: "w-full sm:max-w-xl md:max-w-2xl overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, {
					className: "mb-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: details ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Order ", details.order_number ?? details.id.slice(0, 8)] }) : "Order Details" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, { children: details && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						value: details.status,
						map: STATUS_BADGES$1
					}) })]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border border-red/20 bg-red/5 p-6 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-red/80",
						children: error
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: refetch,
						className: "mt-3",
						children: "Retry"
					})]
				}),
				loading && !error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-48" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 w-full" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32 w-full" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-52 w-full" })
					]
				}),
				!loading && !error && details && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderDetailsContent, {
					details,
					onUpdated: refetch
				})
			]
		})
	});
}
var STATUS_BADGES = {
	pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
	confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
	processing: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
	packed: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
	shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
	out_for_delivery: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
	delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
	cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
	returned: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
	refunded: "bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-300"
};
var PAYMENT_BADGES = {
	pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
	completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
	failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
	refunded: "bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-300"
};
function StatusBadge({ status, map }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `inline-block px-2.5 py-1 text-[10px] tracking-[0.2em] uppercase ${map[status] ?? "bg-neutral-100 text-muted-foreground"}`,
		children: status
	});
}
var ORDER_STATUSES = [
	"",
	"pending",
	"confirmed",
	"processing",
	"packed",
	"shipped",
	"out_for_delivery",
	"delivered",
	"cancelled",
	"returned",
	"refunded"
];
var PAYMENT_STATUSES = [
	"",
	"pending",
	"completed",
	"failed",
	"refunded"
];
var DATE_PRESETS = [
	{
		label: "All",
		value: ""
	},
	{
		label: "Today",
		value: "today"
	},
	{
		label: "7 Days",
		value: "7days"
	},
	{
		label: "30 Days",
		value: "30days"
	},
	{
		label: "90 Days",
		value: "90days"
	}
];
function getDateRange(preset) {
	const now = /* @__PURE__ */ new Date();
	const to = now.toISOString().split("T")[0];
	if (preset === "today") return {
		from: to,
		to
	};
	if (preset === "7days") {
		const d = new Date(now);
		d.setDate(d.getDate() - 7);
		return {
			from: d.toISOString().split("T")[0],
			to
		};
	}
	if (preset === "30days") {
		const d = new Date(now);
		d.setDate(d.getDate() - 30);
		return {
			from: d.toISOString().split("T")[0],
			to
		};
	}
	if (preset === "90days") {
		const d = new Date(now);
		d.setDate(d.getDate() - 90);
		return {
			from: d.toISOString().split("T")[0],
			to
		};
	}
	return {
		from: "",
		to: ""
	};
}
var SORTABLE_COLUMNS = new Set([
	"created_at",
	"total",
	"status",
	"payment_status",
	"customer_name"
]);
function OrdersPage() {
	const { metrics, loading: metricsLoading, error: metricsError, refetch: refetchMetrics } = useOrderMetrics();
	const [page, setPage] = (0, import_react.useState)(1);
	const [search, setSearch] = (0, import_react.useState)("");
	const [searchInput, setSearchInput] = (0, import_react.useState)("");
	const [sortBy, setSortBy] = (0, import_react.useState)("created_at");
	const [sortDir, setSortDir] = (0, import_react.useState)("desc");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("");
	const [paymentFilter, setPaymentFilter] = (0, import_react.useState)("");
	const [datePreset, setDatePreset] = (0, import_react.useState)("");
	const [customFrom, setCustomFrom] = (0, import_react.useState)("");
	const [customTo, setCustomTo] = (0, import_react.useState)("");
	const [selectedOrderId, setSelectedOrderId] = (0, import_react.useState)(null);
	const [drawerOpen, setDrawerOpen] = (0, import_react.useState)(false);
	const pageSize = 15;
	const dateRange = datePreset === "custom" ? {
		from: customFrom,
		to: customTo
	} : getDateRange(datePreset);
	const { result, loading: ordersLoading, error: ordersError, refetch: refetchOrders } = useOrdersManagement(page, pageSize, search, sortBy, sortDir, statusFilter, paymentFilter, dateRange.from, dateRange.to);
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
	function toggleSort(column) {
		if (!SORTABLE_COLUMNS.has(column)) return;
		if (sortBy === column) setSortDir((d) => d === "asc" ? "desc" : "asc");
		else {
			setSortBy(column);
			setSortDir("desc");
		}
		setPage(1);
	}
	function SortIcon({ column }) {
		if (!SORTABLE_COLUMNS.has(column)) return null;
		if (sortBy !== column) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground/40 ml-1",
			children: "↕"
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "ml-1",
			children: sortDir === "asc" ? "↑" : "↓"
		});
	}
	function handleDatePreset(preset) {
		setDatePreset(preset);
		setCustomFrom("");
		setCustomTo("");
		setPage(1);
	}
	function openDrawer(orderId) {
		setSelectedOrderId(orderId);
		setDrawerOpen(true);
	}
	const totalPages = Math.max(1, Math.ceil((result?.total ?? 0) / pageSize));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow",
					children: "Admin"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-serif text-4xl mt-2",
					children: "Orders"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-2 max-w-lg",
					children: "Manage orders, process returns, and handle refunds."
				})
			]
		}),
		metricsError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border border-red/20 bg-red/5 p-6 text-center mb-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-red/80",
				children: metricsError
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				size: "sm",
				onClick: refetchMetrics,
				className: "mt-3",
				children: "Retry"
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8",
			children: metricsLoading ? Array.from({ length: 7 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
				label: "—",
				loading: true
			}, i)) : metrics ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
					label: "Total Orders",
					value: metrics.totalOrders.toLocaleString()
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
					label: "Pending",
					value: metrics.pendingOrders.toLocaleString(),
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						status: "pending",
						map: STATUS_BADGES
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
					label: "Processing",
					value: metrics.processingOrders.toLocaleString(),
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						status: "processing",
						map: STATUS_BADGES
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
					label: "Delivered",
					value: metrics.deliveredOrders.toLocaleString(),
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						status: "delivered",
						map: STATUS_BADGES
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
					label: "Cancelled",
					value: metrics.cancelledOrders.toLocaleString(),
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						status: "cancelled",
						map: STATUS_BADGES
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
					label: "Returned",
					value: metrics.returnedOrders.toLocaleString(),
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						status: "returned",
						map: STATUS_BADGES
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
					label: "Refunded",
					value: metrics.refundedOrders.toLocaleString(),
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						status: "refunded",
						map: STATUS_BADGES
					})
				})
			] }) : null
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4 mb-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Search by order ID, customer name, email…",
					value: searchInput,
					onChange: (e) => {
						setSearchInput(e.target.value);
						debouncedSearch(e.target.value);
					},
					className: "max-w-sm h-9 text-sm"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2 flex-wrap",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: statusFilter,
						onChange: (e) => {
							setStatusFilter(e.target.value);
							setPage(1);
						},
						className: "h-9 rounded-md border border-input bg-background px-3 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "All Statuses"
						}), ORDER_STATUSES.filter(Boolean).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: s,
							children: s.charAt(0).toUpperCase() + s.slice(1)
						}, s))]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: paymentFilter,
						onChange: (e) => {
							setPaymentFilter(e.target.value);
							setPage(1);
						},
						className: "h-9 rounded-md border border-input bg-background px-3 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "All Payments"
						}), PAYMENT_STATUSES.filter(Boolean).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: s,
							children: s.charAt(0).toUpperCase() + s.slice(1)
						}, s))]
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					DATE_PRESETS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => handleDatePreset(p.value),
						className: `px-3 py-1.5 text-[11px] tracking-[0.2em] uppercase rounded-md transition-colors ${datePreset === p.value ? "bg-foreground text-background" : "border border-border/60 text-muted-foreground hover:border-foreground/30"}`,
						children: p.label
					}, p.value)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setDatePreset("custom"),
						className: `px-3 py-1.5 text-[11px] tracking-[0.2em] uppercase rounded-md transition-colors ${datePreset === "custom" ? "bg-foreground text-background" : "border border-border/60 text-muted-foreground hover:border-foreground/30"}`,
						children: "Custom"
					}),
					datePreset === "custom" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 ml-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: customFrom,
								onChange: (e) => setCustomFrom(e.target.value),
								className: "h-8 w-36 text-xs"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "to"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "date",
								value: customTo,
								onChange: (e) => setCustomTo(e.target.value),
								className: "h-8 w-36 text-xs"
							})
						]
					})
				]
			})]
		}),
		ordersError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border border-red/20 bg-red/5 p-6 text-center mb-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-red/80",
				children: ordersError
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				size: "sm",
				onClick: refetchOrders,
				className: "mt-3",
				children: "Retry"
			})]
		}),
		ordersLoading && !ordersError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" }), Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-12 w-full" }, i))]
		}),
		!ordersLoading && !ordersError && result && result.orders.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border border-border/60 p-12 text-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: search || statusFilter || paymentFilter || datePreset ? "No orders match your filters" : "No orders found"
			})
		}),
		!ordersLoading && !ordersError && result && result.orders.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border border-border/60 overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
					className: "cursor-pointer",
					onClick: () => toggleSort("customer_name"),
					children: ["Customer", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "customer_name" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Email" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
					className: "cursor-pointer text-right",
					onClick: () => toggleSort("total"),
					children: ["Total", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "total" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
					className: "cursor-pointer",
					onClick: () => toggleSort("payment_status"),
					children: ["Payment", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "payment_status" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
					className: "cursor-pointer",
					onClick: () => toggleSort("status"),
					children: ["Status", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "status" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					className: "text-right",
					children: "Items"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
					className: "cursor-pointer",
					onClick: () => toggleSort("created_at"),
					children: ["Date", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "created_at" })]
				})
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: result.orders.map((order) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
				className: "cursor-pointer hover:bg-muted/30",
				onClick: () => openDrawer(order.id),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-medium",
						children: order.customer_name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-muted-foreground text-xs",
						children: order.customer_email
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "font-serif text-right tabular-nums",
						children: ["$", Number(order.total).toLocaleString()]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						status: order.payment_status,
						map: PAYMENT_BADGES
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						status: order.status,
						map: STATUS_BADGES
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right text-xs text-muted-foreground tabular-nums",
						children: order.item_count
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs text-muted-foreground whitespace-nowrap",
						children: new Date(order.created_at).toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
							year: "numeric"
						})
					})
				]
			}, order.id)) })] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between pt-4 text-sm text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				result.total,
				" order",
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
					Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
						const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
						if (p > totalPages) return null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setPage(p),
							className: `w-8 h-8 text-xs rounded-md ${p === page ? "bg-foreground text-background" : "border border-border/60 text-muted-foreground hover:border-foreground/30"}`,
							children: p
						}, p);
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
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderDetailsDrawer, {
			orderId: selectedOrderId,
			open: drawerOpen,
			onClose: () => {
				setDrawerOpen(false);
				setSelectedOrderId(null);
			},
			onUpdated: () => {
				refetchOrders();
				refetchMetrics();
			}
		})
	] }) });
}
//#endregion
export { OrdersPage as component };
