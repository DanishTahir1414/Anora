import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { r as supabase } from "./auth-context-oFJLTVEi.mjs";
import { t as AdminLayout } from "./utils-Cy0gksMl.mjs";
import { t as Skeleton } from "./skeleton-9naKPw9_.mjs";
import { t as Input } from "./input-Ch8T9SMc.mjs";
import { t as Button } from "./button-Dfd9l4mi.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-CvsFPszi.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-Dm5O1Pb3.mjs";
import { t as Label } from "./label-DJfgubqt.mjs";
import { a as SelectTrigger, i as SelectItem, n as Select, o as SelectValue, r as SelectContent, t as Badge } from "./badge-BzsAq-GY.mjs";
import { a as SheetHeader, i as SheetFooter, n as SheetContent, o as SheetTitle, r as SheetDescription, t as Sheet } from "./sheet-C1AdHd_R.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.reviews-Bo-0WvKA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function rpc(name, params) {
	const { data, error } = await supabase.rpc(name, params);
	if (error) throw error;
	return data;
}
function useReviewsManagement(page, pageSize, search = "", sortBy = "created_at", sortDir = "desc", statusFilter = "", ratingFilter = 0) {
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
			if (ratingFilter) params.p_rating_filter = ratingFilter;
			setResult(await rpc("get_reviews_management", params));
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
		ratingFilter
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
function useReviewDetails(reviewId) {
	const [details, setDetails] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		if (!reviewId) return;
		try {
			setLoading(true);
			setError(null);
			setDetails(await rpc("get_review_details", { p_review_id: reviewId }));
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, [reviewId]);
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
function useAdminReviewStats() {
	const [stats, setStats] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setError(null);
			setStats(await rpc("get_review_stats"));
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
		stats,
		loading,
		error,
		refetch: load
	};
}
async function approveReview(reviewId) {
	return rpc("approve_review", { p_review_id: reviewId });
}
async function rejectReview(reviewId, adminNote) {
	return rpc("reject_review", {
		p_review_id: reviewId,
		p_admin_note: adminNote ?? null
	});
}
async function deleteReview(reviewId) {
	return rpc("delete_review", { p_review_id: reviewId });
}
var statusColors$1 = {
	pending: "secondary",
	approved: "default",
	rejected: "outline"
};
function ReviewDetailsDrawer({ reviewId, open, onClose, onUpdated }) {
	const { details, loading, error, refetch } = useReviewDetails(reviewId);
	const [rejectNote, setRejectNote] = (0, import_react.useState)("");
	const [showRejectInput, setShowRejectInput] = (0, import_react.useState)(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = (0, import_react.useState)(false);
	const [actionLoading, setActionLoading] = (0, import_react.useState)(false);
	async function handleApprove() {
		if (!reviewId) return;
		setActionLoading(true);
		try {
			await approveReview(reviewId);
			refetch();
			onUpdated();
		} catch {} finally {
			setActionLoading(false);
		}
	}
	async function handleReject() {
		if (!reviewId) return;
		setActionLoading(true);
		try {
			await rejectReview(reviewId, rejectNote || void 0);
			refetch();
			onUpdated();
			setShowRejectInput(false);
			setRejectNote("");
		} catch {} finally {
			setActionLoading(false);
		}
	}
	async function handleDelete() {
		if (!reviewId) return;
		setActionLoading(true);
		try {
			await deleteReview(reviewId);
			setShowDeleteConfirm(false);
			onUpdated();
			onClose();
		} catch {} finally {
			setActionLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open,
		onOpenChange: (o) => {
			if (!o) {
				onClose();
				setShowRejectInput(false);
			}
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			className: "sm:max-w-lg overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, {
				className: "mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: "Review Details" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, { children: "Review content and moderation actions." })]
			}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-40" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-60" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-full" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-3/4" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-1/2" })
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
				children: "Review not found."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground uppercase tracking-wider mb-1",
						children: "Product"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: details.product_name
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground uppercase tracking-wider mb-1",
							children: "Customer"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: details.customer_name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: details.customer_email
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground uppercase tracking-wider mb-1",
						children: "Rating"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-lg",
						children: [details.rating, "/5"]
					})] }),
					details.title && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground uppercase tracking-wider mb-1",
						children: "Title"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: details.title
					})] }),
					details.review_text && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground uppercase tracking-wider mb-1",
						children: "Review"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm whitespace-pre-wrap",
						children: details.review_text
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground uppercase tracking-wider mb-1",
						children: "Status"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: statusColors$1[details.status] ?? "outline",
						className: "capitalize",
						children: details.status
					})] }),
					details.admin_note && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground uppercase tracking-wider mb-1",
						children: "Admin Note"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm",
						children: details.admin_note
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Created: ", new Date(details.created_at).toLocaleString()] }), details.approved_at && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Approved: ", new Date(details.approved_at).toLocaleString()] })]
					}),
					details.status === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-t pt-4 space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold",
								children: "Moderation"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									onClick: handleApprove,
									disabled: actionLoading,
									children: actionLoading ? "Processing..." : "Approve"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: () => setShowRejectInput(true),
									disabled: actionLoading,
									children: "Reject"
								})]
							}),
							showRejectInput && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "reject-note",
										children: "Admin note (optional)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "reject-note",
										value: rejectNote,
										onChange: (e) => setRejectNote(e.target.value),
										placeholder: "Reason for rejection..."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "outline",
											size: "sm",
											onClick: () => setShowRejectInput(false),
											children: "Cancel"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "destructive",
											size: "sm",
											onClick: handleReject,
											disabled: actionLoading,
											children: actionLoading ? "Processing..." : "Confirm Reject"
										})]
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetFooter, {
						className: "border-t pt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							className: "text-red-500 hover:text-red-700",
							onClick: () => setShowDeleteConfirm(true),
							children: "Delete Review"
						})
					})
				]
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
		open: showDeleteConfirm,
		onOpenChange: setShowDeleteConfirm,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Delete Review" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "Are you sure you want to delete this review? This action cannot be undone." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
			onClick: handleDelete,
			disabled: actionLoading,
			children: actionLoading ? "Deleting..." : "Delete"
		})] })] })
	})] });
}
var statusColors = {
	pending: "secondary",
	approved: "default",
	rejected: "outline"
};
function ReviewsTable() {
	const [page, setPage] = (0, import_react.useState)(1);
	const [search, setSearch] = (0, import_react.useState)("");
	const [sortBy, setSortBy] = (0, import_react.useState)("created_at");
	const [sortDir, setSortDir] = (0, import_react.useState)("desc");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("all");
	const [ratingFilter, setRatingFilter] = (0, import_react.useState)(0);
	const [selectedReviewId, setSelectedReviewId] = (0, import_react.useState)(null);
	const [drawerOpen, setDrawerOpen] = (0, import_react.useState)(false);
	const pageSize = 20;
	const { result, loading, error, refetch } = useReviewsManagement(page, pageSize, search, sortBy, sortDir, statusFilter === "all" ? "" : statusFilter, ratingFilter);
	const { stats, loading: statsLoading } = useAdminReviewStats();
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
	function openDrawer(reviewId) {
		setSelectedReviewId(reviewId);
		setDrawerOpen(true);
	}
	const totalPages = Math.max(1, Math.ceil((result?.total ?? 0) / pageSize));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			statsLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 md:grid-cols-5 gap-4",
				children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-16 mb-2" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-7 w-10" })]
				}, i))
			}) : stats ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 md:grid-cols-5 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground uppercase tracking-wider",
							children: "Total"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-2xl font-bold mt-1",
							children: stats.total
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground uppercase tracking-wider",
							children: "Pending"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-2xl font-bold mt-1",
							children: stats.pending
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground uppercase tracking-wider",
							children: "Approved"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-2xl font-bold mt-1",
							children: stats.approved
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground uppercase tracking-wider",
							children: "Rejected"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-2xl font-bold mt-1",
							children: stats.rejected
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg border p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground uppercase tracking-wider",
							children: "Avg Rating"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-2xl font-bold mt-1",
							children: stats.average_rating ? Number(stats.average_rating).toFixed(1) : "—"
						})]
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Search by product, customer, or text...",
						value: search,
						onChange: (e) => {
							setSearch(e.target.value);
							setPage(1);
						},
						className: "max-w-xs"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: statusFilter,
						onValueChange: (val) => {
							setStatusFilter(val);
							setPage(1);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "w-32",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All statuses" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "all",
								children: "All statuses"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "pending",
								children: "Pending"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "approved",
								children: "Approved"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "rejected",
								children: "Rejected"
							})
						] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: String(ratingFilter),
						onValueChange: (val) => {
							setRatingFilter(Number(val));
							setPage(1);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "w-32",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All ratings" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "0",
								children: "All ratings"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "1",
								children: "1 Star"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "2",
								children: "2 Stars"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "3",
								children: "3 Stars"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "4",
								children: "4 Stars"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: "5",
								children: "5 Stars"
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
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: refetch,
					className: "text-sm underline mt-2",
					children: "Retry"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-md border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Product" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Customer" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
						className: "cursor-pointer select-none",
						onClick: () => handleSort("rating"),
						children: ["Rating", sortIndicator("rating")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
						className: "cursor-pointer select-none",
						onClick: () => handleSort("status"),
						children: ["Status", sortIndicator("status")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
						className: "cursor-pointer select-none",
						onClick: () => handleSort("created_at"),
						children: ["Date", sortIndicator("created_at")]
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: loading ? Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-32" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-24" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-16" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-5 w-16" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-24" }) })
				] }, i)) : (result?.reviews?.length ?? 0) === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 5,
					className: "text-center text-muted-foreground py-8",
					children: search || statusFilter !== "all" || ratingFilter !== 0 ? "No reviews match your filters" : "No reviews found"
				}) }) : result?.reviews.map((review) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
					className: "cursor-pointer hover:bg-muted/30",
					onClick: () => openDrawer(review.id),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "font-medium",
							children: review.product_name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-sm",
							children: review.customer_name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "tabular-nums",
							children: [review.rating, "/5"]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: statusColors[review.status] ?? "outline",
							className: "capitalize",
							children: review.status
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
							className: "text-xs text-muted-foreground whitespace-nowrap",
							children: new Date(review.created_at).toLocaleDateString()
						})
					]
				}, review.id)) })] })
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewDetailsDrawer, {
				reviewId: selectedReviewId,
				open: drawerOpen,
				onClose: () => {
					setDrawerOpen(false);
					setSelectedReviewId(null);
				},
				onUpdated: refetch
			})
		]
	});
}
function ReviewsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: "Admin"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-4xl mt-2",
				children: "Reviews"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-2 max-w-lg",
				children: "Manage product reviews — approve, reject, and moderate customer feedback."
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewsTable, {})] }) });
}
//#endregion
export { ReviewsPage as component };
