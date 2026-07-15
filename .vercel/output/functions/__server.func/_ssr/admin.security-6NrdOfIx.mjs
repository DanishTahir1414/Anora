import { f as Outlet, l as useLocation } from "../_libs/@tanstack/react-router+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as AdminLayout } from "./utils-Cy0gksMl.mjs";
import { t as AuditLogsTable } from "./AuditLogsTable-eeFrTD5U.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.security-6NrdOfIx.js
var import_jsx_runtime = require_jsx_runtime();
function SecurityPage() {
	if (!(useLocation().pathname === "/admin/security")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuditLogsTable, {}) });
}
//#endregion
export { SecurityPage as component };
