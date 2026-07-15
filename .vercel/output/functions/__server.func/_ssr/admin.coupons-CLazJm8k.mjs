import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { $ as CircleCheckBig, Q as CircleX, Z as Clock, g as Search, st as ArrowUpDown, u as Tag, x as Plus, y as RefreshCw } from "../_libs/lucide-react.mjs";
import { t as AdminLayout } from "./utils-Cy0gksMl.mjs";
import { t as Skeleton } from "./skeleton-9naKPw9_.mjs";
import { t as DashboardCard } from "./DashboardCard-DEbOb3YD.mjs";
import { a as useCouponAnalytics, i as updateCoupon, n as deleteCoupon, o as useCouponsManagement, r as toggleCouponStatus, t as createCoupon } from "./admin-coupons-ChZ61okb.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-3x9W9oz0.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-Dm5O1Pb3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.coupons-CLazJm8k.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PAGE_SIZE = 10;
function CouponsTable() {
	const [page, setPage] = (0, import_react.useState)(1);
	const [search, setSearch] = (0, import_react.useState)("");
	const [sortBy, setSortBy] = (0, import_react.useState)("created_at");
	const [sortDir, setSortDir] = (0, import_react.useState)("desc");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("");
	const [typeFilter, setTypeFilter] = (0, import_react.useState)("");
	const [showAdd, setShowAdd] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [deleting, setDeleting] = (0, import_react.useState)(null);
	const { result, loading, error, refetch } = useCouponsManagement(page, PAGE_SIZE, search, sortBy, sortDir, statusFilter, typeFilter);
	const { data: analytics, refetch: refetchAnalytics } = useCouponAnalytics();
	const totalPages = result ? Math.ceil(result.total / PAGE_SIZE) : 0;
	function toggleSort(col) {
		if (sortBy === col) setSortDir((d) => d === "asc" ? "desc" : "asc");
		else {
			setSortBy(col);
			setSortDir("desc");
		}
		setPage(1);
	}
	function SortIcon({ col }) {
		if (sortBy !== col) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpDown, { className: "h-3 w-3 opacity-30" });
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpDown, { className: `h-3 w-3 ${sortDir === "asc" ? "rotate-180" : ""}` });
	}
	function statusLabel(c) {
		if (!c.is_active) return {
			label: "Inactive",
			color: "text-stone-500 dark:text-stone-400"
		};
		if (c.expires_at && new Date(c.expires_at) <= /* @__PURE__ */ new Date()) return {
			label: "Expired",
			color: "text-red/60"
		};
		if (c.max_uses !== null && c.used_count >= c.max_uses) return {
			label: "Exhausted",
			color: "text-amber-600 dark:text-amber-400"
		};
		if (c.starts_at && new Date(c.starts_at) > /* @__PURE__ */ new Date()) return {
			label: "Scheduled",
			color: "text-blue-600 dark:text-blue-400"
		};
		return {
			label: "Active",
			color: "text-emerald-600 dark:text-emerald-400"
		};
	}
	async function handleDelete() {
		if (!deleting) return;
		try {
			await deleteCoupon(deleting.id);
			setDeleting(null);
			refetch();
			refetchAnalytics();
		} catch (err) {
			console.error(err);
		}
	}
	async function handleToggle(couponId) {
		try {
			await toggleCouponStatus(couponId);
			refetch();
			refetchAnalytics();
		} catch (err) {
			console.error(err);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			analytics && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
						label: "Total Coupons",
						value: analytics.total_coupons.toLocaleString(),
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "h-4 w-4 text-indigo-600 dark:text-indigo-400" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
						label: "Active",
						value: analytics.active_coupons.toLocaleString(),
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-4 w-4 text-emerald-600 dark:text-emerald-400" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
						label: "Expired",
						value: analytics.expired_coupons.toLocaleString(),
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-4 w-4 text-red/60" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
						label: "Redemptions",
						value: analytics.total_redemptions.toLocaleString(),
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 text-sky-600 dark:text-sky-400" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
						label: "Revenue Impact",
						value: `$${analytics.total_discounted.toLocaleString()}`,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "h-4 w-4 text-amber-600 dark:text-amber-400" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex-1 min-w-[200px] max-w-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							placeholder: "Search by code or description...",
							className: "w-full border border-border/60 bg-transparent py-2 pl-10 pr-4 text-sm outline-none focus:border-foreground/30 transition-colors",
							value: search,
							onChange: (e) => {
								setSearch(e.target.value);
								setPage(1);
							}
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "border border-border/60 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/30",
						value: statusFilter,
						onChange: (e) => {
							setStatusFilter(e.target.value);
							setPage(1);
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "All Statuses"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "active",
								children: "Active"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "inactive",
								children: "Inactive"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "expired",
								children: "Expired"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "exhausted",
								children: "Exhausted"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "border border-border/60 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/30",
						value: typeFilter,
						onChange: (e) => {
							setTypeFilter(e.target.value);
							setPage(1);
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "All Types"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "percentage",
								children: "Percentage"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "fixed",
								children: "Fixed"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setShowAdd(true),
						className: "border border-border/60 px-4 py-2 text-[11px] tracking-[0.32em] uppercase hover:bg-neutral/50 transition-colors flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" }), " Add Coupon"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							refetch();
							refetchAnalytics();
						},
						className: "border border-border/60 p-2 text-muted-foreground hover:text-foreground transition-colors",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-4 w-4" })
					})
				]
			}),
			error && !loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border border-red/20 bg-red/5 p-4 text-sm text-red/80",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto border border-border/60",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border/60 bg-neutral/30",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Th, {
								onClick: () => toggleSort("code"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { col: "code" }), " Code"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Th, {
								onClick: () => toggleSort("discount_type"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { col: "discount_type" }), " Type"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Th, {
								onClick: () => toggleSort("discount_value"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { col: "discount_value" }), " Value"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Status" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Th, {
								onClick: () => toggleSort("used_count"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { col: "used_count" }), " Used"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Th, {
								onClick: () => toggleSort("max_uses"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { col: "max_uses" }), " Limit"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Th, {
								onClick: () => toggleSort("starts_at"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { col: "starts_at" }), " Start"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Th, {
								onClick: () => toggleSort("expires_at"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { col: "expires_at" }), " Expiry"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
								className: "text-right",
								children: "Actions"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [
						loading && !result && Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
							className: "border-b border-border/40",
							children: Array.from({ length: 9 }).map((_, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-20" })
							}, j))
						}, i)),
						result && result.coupons.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 9,
							className: "px-4 py-12 text-center text-sm text-muted-foreground",
							children: "No coupons found."
						}) }),
						result && result.coupons.map((c) => {
							const st = statusLabel(c);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border/40 hover:bg-neutral/20 transition-colors",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3 font-medium",
										children: c.code
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3 text-muted-foreground capitalize",
										children: c.discount_type
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3 tabular-nums",
										children: c.discount_type === "percentage" ? `${c.discount_value}%` : `$${c.discount_value}`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `text-[11px] tracking-wider uppercase ${st.color}`,
											children: st.label
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3 tabular-nums",
										children: c.used_count
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3 tabular-nums",
										children: c.max_uses ?? "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3 text-muted-foreground",
										children: c.starts_at ? new Date(c.starts_at).toLocaleDateString() : "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3 text-muted-foreground",
										children: c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-3 text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-end gap-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => setEditing(c),
													className: "px-2 py-1 text-[11px] tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors",
													children: "Edit"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => handleToggle(c.id),
													className: "px-2 py-1 text-[11px] tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors",
													children: c.is_active ? "Deactivate" : "Activate"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => setDeleting(c),
													className: "px-2 py-1 text-[11px] tracking-wider uppercase text-red/60 hover:text-red transition-colors",
													children: "Delete"
												})
											]
										})
									})
								]
							}, c.id);
						})
					] })]
				})
			}),
			result && totalPages > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-[11px] tracking-[0.2em] text-muted-foreground",
					children: [result.total, " total"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							disabled: page === 1,
							onClick: () => setPage((p) => Math.max(1, p - 1)),
							className: "border border-border/60 px-3 py-1.5 text-[11px] tracking-[0.2em] uppercase disabled:opacity-30 disabled:pointer-events-none hover:bg-neutral/50 transition-colors",
							children: "Prev"
						}),
						Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setPage(p),
							className: `border border-border/60 px-3 py-1.5 text-[11px] tracking-[0.2em] transition-colors ${p === page ? "bg-foreground text-background" : "hover:bg-neutral/50"}`,
							children: p
						}, p)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							disabled: page === totalPages,
							onClick: () => setPage((p) => Math.min(totalPages, p + 1)),
							className: "border border-border/60 px-3 py-1.5 text-[11px] tracking-[0.2em] uppercase disabled:opacity-30 disabled:pointer-events-none hover:bg-neutral/50 transition-colors",
							children: "Next"
						})
					]
				})]
			}),
			(showAdd || editing) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CouponFormDialog, {
				coupon: editing,
				onClose: () => {
					setShowAdd(false);
					setEditing(null);
				},
				onSaved: () => {
					setShowAdd(false);
					setEditing(null);
					refetch();
					refetchAnalytics();
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: !!deleting,
				onOpenChange: () => setDeleting(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Delete Coupon" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
					"Are you sure you want to delete coupon ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: deleting?.code }),
					"? This action cannot be undone."
				] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					onClick: handleDelete,
					className: "bg-red/80 hover:bg-red text-white",
					children: "Delete"
				})] })] })
			})
		]
	});
}
function Th({ children, onClick, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
		onClick,
		className: `px-3 py-3 text-[11px] tracking-[0.32em] uppercase text-left ${className ?? ""} ${onClick ? "cursor-pointer hover:text-foreground" : ""}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center gap-1.5",
			children
		})
	});
}
function CouponFormDialog({ coupon, onClose, onSaved }) {
	const [code, setCode] = (0, import_react.useState)(coupon?.code ?? "");
	const [description, setDescription] = (0, import_react.useState)(coupon?.description ?? "");
	const [discountType, setDiscountType] = (0, import_react.useState)(coupon?.discount_type ?? "percentage");
	const [discountValue, setDiscountValue] = (0, import_react.useState)(coupon?.discount_value?.toString() ?? "");
	const [minOrder, setMinOrder] = (0, import_react.useState)(coupon?.min_order?.toString() ?? "0");
	const [maxUses, setMaxUses] = (0, import_react.useState)(coupon?.max_uses?.toString() ?? "");
	const [maxDiscount, setMaxDiscount] = (0, import_react.useState)(coupon?.maximum_discount_amount?.toString() ?? "");
	const [startsAt, setStartsAt] = (0, import_react.useState)(coupon?.starts_at ? coupon.starts_at.slice(0, 16) : "");
	const [expiresAt, setExpiresAt] = (0, import_react.useState)(coupon?.expires_at ? coupon.expires_at.slice(0, 16) : "");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [formError, setFormError] = (0, import_react.useState)(null);
	function validate() {
		if (!code.trim()) return "Code is required";
		if (!discountValue || Number(discountValue) <= 0) return "Discount value must be positive";
		if (discountType === "percentage" && Number(discountValue) > 100) return "Percentage cannot exceed 100";
		return null;
	}
	async function handleSubmit(e) {
		e.preventDefault();
		const err = validate();
		if (err) {
			setFormError(err);
			return;
		}
		setSaving(true);
		setFormError(null);
		try {
			const params = {
				p_code: code.trim(),
				p_description: description || null,
				p_discount_type: discountType,
				p_discount_value: Number(discountValue),
				p_min_order: Number(minOrder),
				p_max_uses: maxUses ? Number(maxUses) : null,
				p_maximum_discount_amount: maxDiscount ? Number(maxDiscount) : null,
				p_starts_at: startsAt ? new Date(startsAt).toISOString() : null,
				p_expires_at: expiresAt ? new Date(expiresAt).toISOString() : null
			};
			if (coupon) {
				const result = await updateCoupon({
					...params,
					p_id: coupon.id
				});
				if (!result.success) {
					setFormError(result.error ?? "Failed to update");
					setSaving(false);
					return;
				}
			} else {
				const result = await createCoupon(params);
				if (!result.success) {
					setFormError(result.error ?? "Failed to create");
					setSaving(false);
					return;
				}
			}
			onSaved();
		} catch (err) {
			setFormError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-lg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: coupon ? "Edit Coupon" : "Add Coupon" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: coupon ? "Update coupon details" : "Create a new discount coupon" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				className: "space-y-4",
				children: [
					formError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-red/80 bg-red/5 p-3",
						children: formError
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "block text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-1.5",
						children: "Code"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						required: true,
						className: "w-full border border-border/60 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/30",
						value: code,
						onChange: (e) => setCode(e.target.value),
						placeholder: "SUMMER20"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "block text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-1.5",
						children: "Description"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "w-full border border-border/60 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/30",
						value: description,
						onChange: (e) => setDescription(e.target.value),
						placeholder: "20% off summer collection"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "block text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-1.5",
							children: "Discount Type"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "w-full border border-border/60 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/30",
							value: discountType,
							onChange: (e) => setDiscountType(e.target.value),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "percentage",
								children: "Percentage"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "fixed",
								children: "Fixed"
							})]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "block text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-1.5",
							children: "Value"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							type: "number",
							step: "0.01",
							min: "0.01",
							className: "w-full border border-border/60 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/30",
							value: discountValue,
							onChange: (e) => setDiscountValue(e.target.value),
							placeholder: discountType === "percentage" ? "20" : "10.00"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "block text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-1.5",
							children: "Min Order"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							step: "0.01",
							min: "0",
							className: "w-full border border-border/60 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/30",
							value: minOrder,
							onChange: (e) => setMinOrder(e.target.value)
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "block text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-1.5",
							children: "Max Discount ($)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							step: "0.01",
							min: "0",
							className: "w-full border border-border/60 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/30",
							value: maxDiscount,
							onChange: (e) => setMaxDiscount(e.target.value),
							placeholder: "Unlimited"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "block text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-1.5",
							children: "Max Uses"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							min: "1",
							className: "w-full border border-border/60 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/30",
							value: maxUses,
							onChange: (e) => setMaxUses(e.target.value),
							placeholder: "Unlimited"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-end gap-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-muted-foreground pb-2",
								children: "—"
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "block text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-1.5",
							children: "Start Date"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "datetime-local",
							className: "w-full border border-border/60 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/30",
							value: startsAt,
							onChange: (e) => setStartsAt(e.target.value)
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "block text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-1.5",
							children: "Expiry Date"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "datetime-local",
							className: "w-full border border-border/60 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/30",
							value: expiresAt,
							onChange: (e) => setExpiresAt(e.target.value)
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-end gap-3 pt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onClose,
							className: "border border-border/60 px-4 py-2 text-[11px] tracking-[0.32em] uppercase hover:bg-neutral/50 transition-colors",
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: saving,
							className: "border border-foreground bg-foreground text-background px-4 py-2 text-[11px] tracking-[0.32em] uppercase hover:opacity-80 transition-colors disabled:opacity-40",
							children: saving ? "Saving..." : coupon ? "Update" : "Create"
						})]
					})
				]
			})]
		})
	});
}
function CouponsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: "Admin"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-4xl mt-2",
				children: "Coupons"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-2 max-w-lg",
				children: "Manage discount coupons — create, edit, activate, and track coupon redemptions."
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CouponsTable, {})] }) });
}
//#endregion
export { CouponsPage as component };
