import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as Skeleton } from "./skeleton-9naKPw9_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/DashboardCard-DEbOb3YD.js
var import_jsx_runtime = require_jsx_runtime();
function DashboardCard({ label, value, icon, loading }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border border-border/60 p-4 sm:p-6 space-y-2 sm:space-y-3 transition-colors duration-300 hover:border-foreground/20 min-w-0 overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[10px] sm:text-[11px] tracking-[0.28em] sm:tracking-[0.32em] uppercase text-muted-foreground truncate",
				children: label
			}), icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "shrink-0",
				children: icon
			})]
		}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-7 sm:h-8 w-20 sm:w-24" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-serif text-2xl sm:text-3xl tabular-nums tracking-tight",
			children: value ?? "—"
		})]
	});
}
//#endregion
export { DashboardCard as t };
