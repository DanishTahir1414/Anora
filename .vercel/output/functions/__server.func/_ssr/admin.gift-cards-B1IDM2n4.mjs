import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { H as Gift, K as Eye, X as CreditCard, g as Search, st as ArrowUpDown, x as Plus, y as RefreshCw } from "../_libs/lucide-react.mjs";
import { t as AdminLayout } from "./utils-Cy0gksMl.mjs";
import { t as Skeleton } from "./skeleton-9naKPw9_.mjs";
import { t as DashboardCard } from "./DashboardCard-DEbOb3YD.mjs";
import { a as useGiftCardsManagement, i as useGiftCardDetails, n as toggleGiftCardStatus, r as useGiftCardAnalytics, t as createGiftCard } from "./admin-gift-cards-DF1Dj7an.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-3x9W9oz0.mjs";
import { a as SheetHeader, n as SheetContent, o as SheetTitle, r as SheetDescription, t as Sheet } from "./sheet-C1AdHd_R.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.gift-cards-B1IDM2n4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PAGE_SIZE = 10;
function GiftCardsTable() {
	const [page, setPage] = (0, import_react.useState)(1);
	const [search, setSearch] = (0, import_react.useState)("");
	const [sortBy, setSortBy] = (0, import_react.useState)("created_at");
	const [sortDir, setSortDir] = (0, import_react.useState)("desc");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("");
	const [showAdd, setShowAdd] = (0, import_react.useState)(false);
	const [viewing, setViewing] = (0, import_react.useState)(null);
	const { result, loading, error, refetch } = useGiftCardsManagement(page, PAGE_SIZE, search, sortBy, sortDir, statusFilter);
	const { data: analytics, refetch: refetchAnalytics } = useGiftCardAnalytics();
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
	function statusBadge(status) {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `text-[11px] tracking-wider uppercase ${{
				active: "text-emerald-600 dark:text-emerald-400",
				inactive: "text-stone-500 dark:text-stone-400",
				expired: "text-red/60",
				depleted: "text-amber-600 dark:text-amber-400"
			}[status] ?? "text-muted-foreground"}`,
			children: status
		});
	}
	async function handleToggle(cardId) {
		try {
			await toggleGiftCardStatus(cardId);
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
						label: "Total",
						value: analytics.total_gift_cards.toLocaleString(),
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "h-4 w-4 text-indigo-600 dark:text-indigo-400" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
						label: "Active",
						value: analytics.active_gift_cards.toLocaleString(),
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-4 w-4 text-emerald-600 dark:text-emerald-400" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
						label: "Outstanding Balance",
						value: `$${analytics.outstanding_balance.toLocaleString()}`,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-4 w-4 text-sky-600 dark:text-sky-400" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
						label: "Total Redeemed",
						value: `$${analytics.total_redeemed.toLocaleString()}`,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-4 w-4 text-amber-600 dark:text-amber-400" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardCard, {
						label: "Transactions",
						value: analytics.total_transactions.toLocaleString(),
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-4 w-4 text-purple-600 dark:text-purple-400" })
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
							placeholder: "Search by code...",
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
								value: "depleted",
								children: "Depleted"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setShowAdd(true),
						className: "border border-border/60 px-4 py-2 text-[11px] tracking-[0.32em] uppercase hover:bg-neutral/50 transition-colors flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" }), " Add Gift Card"]
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
								onClick: () => toggleSort("initial_balance"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { col: "initial_balance" }), " Initial"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Th, {
								onClick: () => toggleSort("current_balance"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { col: "current_balance" }), " Current"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Th, {
								onClick: () => toggleSort("status"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { col: "status" }), " Status"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Usage" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Th, {
								onClick: () => toggleSort("expires_at"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { col: "expires_at" }), " Expires"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Th, {
								onClick: () => toggleSort("created_at"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { col: "created_at" }), " Created"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
								className: "text-right",
								children: "Actions"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [
						loading && !result && Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
							className: "border-b border-border/40",
							children: Array.from({ length: 8 }).map((_, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-20" })
							}, j))
						}, i)),
						result && result.gift_cards.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 8,
							className: "px-4 py-12 text-center text-sm text-muted-foreground",
							children: "No gift cards found."
						}) }),
						result && result.gift_cards.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border/40 hover:bg-neutral/20 transition-colors",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 font-mono text-xs",
									children: g.code
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-3 py-3 tabular-nums",
									children: ["$", g.initial_balance.toFixed(2)]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-3 py-3 tabular-nums",
									children: ["$", g.current_balance.toFixed(2)]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3",
									children: statusBadge(g.status)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 tabular-nums",
									children: g.usage_count
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 text-muted-foreground",
									children: g.expires_at ? new Date(g.expires_at).toLocaleDateString() : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 text-muted-foreground",
									children: new Date(g.created_at).toLocaleDateString()
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-3 text-right",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-end gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => setViewing(g.id),
											className: "px-2 py-1 text-[11px] tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3.5 w-3.5 inline mr-1" }), " View"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => handleToggle(g.id),
											className: "px-2 py-1 text-[11px] tracking-wider uppercase text-muted-foreground hover:text-foreground transition-colors",
											children: g.status === "active" ? "Deactivate" : g.status === "inactive" ? "Activate" : "—"
										})]
									})
								})
							]
						}, g.id))
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
						Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
							return i + Math.max(1, Math.min(page - 2, totalPages - 4));
						}).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
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
			showAdd && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GiftCardFormDialog, {
				onClose: () => setShowAdd(false),
				onSaved: () => {
					setShowAdd(false);
					refetch();
					refetchAnalytics();
				}
			}),
			viewing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GiftCardDetailsDrawer, {
				giftCardId: viewing,
				onClose: () => setViewing(null)
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
function GiftCardFormDialog({ onClose, onSaved }) {
	const [balance, setBalance] = (0, import_react.useState)("");
	const [expiresAt, setExpiresAt] = (0, import_react.useState)("");
	const [notes, setNotes] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [formError, setFormError] = (0, import_react.useState)(null);
	const [result, setResult] = (0, import_react.useState)(null);
	async function handleSubmit(e) {
		e.preventDefault();
		if (!balance || Number(balance) <= 0) {
			setFormError("Balance must be positive");
			return;
		}
		setSaving(true);
		setFormError(null);
		try {
			const res = await createGiftCard({
				p_initial_balance: Number(balance),
				p_expires_at: expiresAt ? new Date(expiresAt).toISOString() : void 0,
				p_notes: notes || void 0
			});
			if (!res.success) {
				setFormError(res.error ?? "Failed to create");
				setSaving(false);
				return;
			}
			setResult({ code: res.code ?? "" });
		} catch (err) {
			setFormError(err instanceof Error ? err.message : "An error occurred");
			setSaving(false);
		}
	}
	if (result) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Gift Card Created" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Share this code with the recipient." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center py-6 space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] tracking-[0.32em] uppercase text-muted-foreground",
						children: "Gift Card Code"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-2xl tracking-[0.3em]",
						children: result.code
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "This code will not be shown again."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "border border-border/60 px-6 py-2 text-[11px] tracking-[0.32em] uppercase hover:bg-neutral/50 transition-colors",
						children: "Done"
					})
				]
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: true,
		onOpenChange: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Create Gift Card" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Generate a new gift card with a unique code." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				className: "space-y-4",
				children: [
					formError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-red/80 bg-red/5 p-3",
						children: formError
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "block text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-1.5",
						children: "Initial Balance ($)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						required: true,
						type: "number",
						step: "0.01",
						min: "1",
						className: "w-full border border-border/60 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/30",
						value: balance,
						onChange: (e) => setBalance(e.target.value),
						placeholder: "50.00"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "block text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-1.5",
						children: "Expires At (optional)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "datetime-local",
						className: "w-full border border-border/60 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/30",
						value: expiresAt,
						onChange: (e) => setExpiresAt(e.target.value)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "block text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-1.5",
						children: "Notes (optional)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "w-full border border-border/60 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/30",
						value: notes,
						onChange: (e) => setNotes(e.target.value),
						placeholder: "Internal notes"
					})] }),
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
							children: saving ? "Generating..." : "Generate"
						})]
					})
				]
			})]
		})
	});
}
function GiftCardDetailsDrawer({ giftCardId, onClose }) {
	const { details, loading, error } = useGiftCardDetails(giftCardId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open: true,
		onOpenChange: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			className: "sm:max-w-xl w-full overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: "Gift Card Details" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, { children: "Balance history and transaction log." })] }),
				loading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4 mt-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-6 w-40" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 w-full" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40 w-full" })
					]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "border border-red/20 bg-red/5 p-4 mt-6 text-sm text-red/80",
					children: error
				}),
				details && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border border-border/60 p-4 space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-lg tracking-[0.2em]",
								children: details.code
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-4 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] tracking-[0.32em] uppercase text-muted-foreground",
										children: "Initial Balance"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "tabular-nums mt-1",
										children: ["$", details.initial_balance.toFixed(2)]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] tracking-[0.32em] uppercase text-muted-foreground",
										children: "Current Balance"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "tabular-nums mt-1 font-medium",
										children: ["$", details.current_balance.toFixed(2)]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] tracking-[0.32em] uppercase text-muted-foreground",
										children: "Status"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 capitalize",
										children: details.status
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] tracking-[0.32em] uppercase text-muted-foreground",
										children: "Usage Count"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "tabular-nums mt-1",
										children: details.usage_count
									})] })
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] tracking-[0.32em] uppercase text-muted-foreground",
									children: "Balance Used"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-2 bg-neutral/40 rounded-full overflow-hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full bg-foreground/60 rounded-full transition-all",
										style: { width: `${details.initial_balance > 0 ? (details.initial_balance - details.current_balance) / details.initial_balance * 100 : 0}%` }
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between text-[11px] text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"$",
										(details.initial_balance - details.current_balance).toFixed(2),
										" used"
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"$",
										details.current_balance.toFixed(2),
										" remaining"
									] })]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] tracking-[0.32em] uppercase text-muted-foreground mb-3",
							children: "Transaction History"
						}), details.transactions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No transactions yet."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: details.transactions.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border border-border/40 p-3 text-sm flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] tracking-wider uppercase text-muted-foreground",
										children: t.transaction_type
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-0.5",
										children: new Date(t.created_at).toLocaleString()
									}),
									t.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-1",
										children: t.notes
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-right",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "tabular-nums font-medium",
										children: ["-$", t.amount.toFixed(2)]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-[11px] text-muted-foreground tabular-nums",
										children: [
											"$",
											t.balance_before.toFixed(2),
											" → $",
											t.balance_after.toFixed(2)
										]
									})]
								})]
							}, t.id))
						})] })
					]
				})
			]
		})
	});
}
function GiftCardsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: "Admin"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-4xl mt-2",
				children: "Gift Cards"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-2 max-w-lg",
				children: "Manage gift cards — create, track balances, and monitor redemption history."
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GiftCardsTable, {})] }) });
}
//#endregion
export { GiftCardsPage as component };
