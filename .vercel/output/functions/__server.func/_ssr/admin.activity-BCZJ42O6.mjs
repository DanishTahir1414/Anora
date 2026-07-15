import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { Z as Clock, i as User, tt as ChevronRight } from "../_libs/lucide-react.mjs";
import { t as AdminLayout } from "./utils-Cy0gksMl.mjs";
import { t as Skeleton } from "./skeleton-9naKPw9_.mjs";
import { t as Input } from "./input-Ch8T9SMc.mjs";
import { t as Button } from "./button-Dfd9l4mi.mjs";
import { i as useActivityTimeline } from "./admin-security-vlWQTKFB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.activity-BCZJ42O6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function formatTime(ts) {
	const d = new Date(ts);
	const diff = (/* @__PURE__ */ new Date()).getTime() - d.getTime();
	if (diff < 6e4) return "Just now";
	if (diff < 36e5) return `${Math.floor(diff / 6e4)}m ago`;
	if (diff < 864e5) return `${Math.floor(diff / 36e5)}h ago`;
	return d.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric"
	});
}
var ENTITY_TYPES = [
	{
		label: "All",
		value: ""
	},
	{
		label: "Products",
		value: "products"
	},
	{
		label: "Orders",
		value: "orders"
	},
	{
		label: "Coupons",
		value: "coupons"
	},
	{
		label: "Categories",
		value: "categories"
	},
	{
		label: "Reviews",
		value: "reviews"
	},
	{
		label: "Refunds",
		value: "refunds"
	},
	{
		label: "Gift Cards",
		value: "gift_cards"
	}
];
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
function ActivityTimeline() {
	const [page, setPage] = (0, import_react.useState)(1);
	const [entityType, setEntityType] = (0, import_react.useState)("");
	const [search, setSearch] = (0, import_react.useState)("");
	const [searchInput, setSearchInput] = (0, import_react.useState)("");
	const pageSize = 30;
	const { result, loading, error, refetch } = useActivityTimeline(page, pageSize, entityType, "", search);
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
					children: "Activity Timeline"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-2 max-w-lg",
					children: "Real-time activity log across all entities."
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col sm:flex-row gap-3 mb-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: "Search activities…",
				value: searchInput,
				onChange: (e) => {
					setSearchInput(e.target.value);
					debouncedSearch(e.target.value);
				},
				className: "max-w-sm h-9 text-sm"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				value: entityType,
				onChange: (e) => {
					setEntityType(e.target.value);
					setPage(1);
				},
				className: "h-9 rounded-md border border-input bg-background px-3 text-xs text-muted-foreground",
				children: ENTITY_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: t.value,
					children: t.label
				}, t.value))
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
		loading && !error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-4 p-4 border border-border/40",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-8 rounded-full" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-48" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-32" })]
				})]
			}, i))
		}),
		!loading && !error && result && result.activities.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border border-border/60 p-12 text-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No activity recorded yet."
			})
		}),
		!loading && !error && result && result.activities.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2",
			children: result.activities.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-4 p-4 border border-border/40 hover:bg-muted/20 transition-colors",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0",
						children: entry.actor_avatar ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: entry.actor_avatar,
							alt: "",
							className: "h-8 w-8 rounded-full object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-4 w-4 text-muted-foreground" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 flex-wrap",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm font-medium",
										children: entry.actor_name || "System"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionBadge, { action: entry.action }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm text-muted-foreground capitalize",
										children: entry.entity_type?.replace(/_/g, " ")
									}),
									entry.entity_id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[10px] text-muted-foreground font-mono",
										children: ["#", entry.entity_id.slice(0, 8)]
									})
								]
							}),
							entry.metadata && entry.action === "order_status_changed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground mt-1",
								children: [
									"Status changed: ",
									entry.metadata.from_status,
									" →",
									" ",
									entry.metadata.to_status
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[10px] text-muted-foreground mt-1 flex items-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3 w-3" }),
									" ",
									formatTime(entry.created_at)
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4 text-muted-foreground/40 shrink-0" })
				]
			}, entry.id))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between pt-6 text-sm text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				result.total,
				" activity event",
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
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityTimeline, {}) });
//#endregion
export { SplitComponent as component };
