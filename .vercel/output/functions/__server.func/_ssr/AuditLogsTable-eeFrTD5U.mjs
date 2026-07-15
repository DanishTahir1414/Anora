import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { E as Monitor, V as Globe, i as User } from "../_libs/lucide-react.mjs";
import { t as Skeleton } from "./skeleton-9naKPw9_.mjs";
import { t as Input } from "./input-Ch8T9SMc.mjs";
import { t as Button } from "./button-Dfd9l4mi.mjs";
import { a as useAuditLogs } from "./admin-security-vlWQTKFB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AuditLogsTable-eeFrTD5U.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ACTION_BADGES = {
	created: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
	updated: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
	deleted: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
	order_status_changed: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
};
function ActionBadge({ action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `inline-block px-2 py-0.5 text-[10px] tracking-[0.15em] uppercase ${ACTION_BADGES[action] ?? "bg-neutral-100 text-muted-foreground"}`,
		children: action.replace(/_/g, " ")
	});
}
function formatTime(ts) {
	return new Date(ts).toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	});
}
function AuditLogsTable() {
	const [page, setPage] = (0, import_react.useState)(1);
	const [search, setSearch] = (0, import_react.useState)("");
	const [searchInput, setSearchInput] = (0, import_react.useState)("");
	const [entityType, setEntityType] = (0, import_react.useState)("");
	const [action, setAction] = (0, import_react.useState)("");
	const [sortBy, setSortBy] = (0, import_react.useState)("created_at");
	const [sortDir, setSortDir] = (0, import_react.useState)("desc");
	const pageSize = 20;
	const { result, loading, error, refetch } = useAuditLogs(page, pageSize, entityType, action, search);
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
					children: "Audit Logs"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-2 max-w-lg",
					children: "Immutable audit trail of all critical actions. Records cannot be edited or deleted."
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col sm:flex-row gap-3 mb-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					placeholder: "Search entity, action, or ID…",
					value: searchInput,
					onChange: (e) => {
						setSearchInput(e.target.value);
						debouncedSearch(e.target.value);
					},
					className: "max-w-sm h-9 text-sm"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					value: entityType,
					onChange: (e) => {
						setEntityType(e.target.value);
						setPage(1);
					},
					className: "h-9 rounded-md border border-input bg-background px-3 text-xs text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "All Entity Types"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "products",
							children: "Products"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "orders",
							children: "Orders"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "coupons",
							children: "Coupons"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "categories",
							children: "Categories"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "reviews",
							children: "Reviews"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "refunds",
							children: "Refunds"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "gift_cards",
							children: "Gift Cards"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					value: action,
					onChange: (e) => {
						setAction(e.target.value);
						setPage(1);
					},
					className: "h-9 rounded-md border border-input bg-background px-3 text-xs text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "All Actions"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "created",
							children: "Created"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "updated",
							children: "Updated"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "deleted",
							children: "Deleted"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "order_status_changed",
							children: "Status Changed"
						})
					]
				})
			]
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
		!loading && !error && result && result.logs.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border border-border/60 p-12 text-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No audit logs found."
			})
		}),
		!loading && !error && result && result.logs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border border-border/60 overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border/60",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Th, {
							onClick: () => toggleSort("action"),
							children: ["Action", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "action" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Th, {
							onClick: () => toggleSort("entity_type"),
							children: ["Entity", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "entity_type" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "Entity ID" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Th, {
							onClick: () => toggleSort("actor_name"),
							children: ["Actor", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "actor_name" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, { children: "IP / Device" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Th, {
							onClick: () => toggleSort("created_at"),
							children: ["Timestamp", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "created_at" })]
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: result.logs.map((log) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border/40 hover:bg-muted/30",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionBadge, { action: log.action })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-sm capitalize",
							children: log.entity_type?.replace(/_/g, " ")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-xs font-mono text-muted-foreground",
							children: log.entity_id ? log.entity_id.slice(0, 12) + "…" : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-3 w-3 text-muted-foreground" }), log.actor_name || "System"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-xs text-muted-foreground",
							children: log.ip_address || log.user_agent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1",
								children: [log.ip_address && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "h-3 w-3" }), log.ip_address] }), log.user_agent && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Monitor, { className: "h-3 w-3 ml-1" }),
									log.user_agent.slice(0, 30),
									"…"
								] })]
							}) : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-xs text-muted-foreground whitespace-nowrap",
							children: formatTime(log.created_at)
						})
					]
				}, log.id)) })]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between pt-4 text-sm text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				result.total,
				" log",
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
//#endregion
export { AuditLogsTable as t };
