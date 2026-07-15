import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as rpc } from "./admin-client-C5B6s_l5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-security-vlWQTKFB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useActivityTimeline(page, pageSize, entityType = "", action = "", search = "", dateFrom = "", dateTo = "", actorId = "") {
	const [result, setResult] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setError(null);
			const params = {
				p_page: page,
				p_page_size: pageSize
			};
			if (entityType) params.p_entity_type = entityType;
			if (action) params.p_action = action;
			if (search) params.p_search = search;
			if (dateFrom) params.p_date_from = dateFrom;
			if (dateTo) params.p_date_to = dateTo;
			if (actorId) params.p_actor_id = actorId;
			setResult(await rpc("get_activity_timeline", params));
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, [
		page,
		pageSize,
		entityType,
		action,
		search,
		dateFrom,
		dateTo,
		actorId
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
function useAuditLogs(page, pageSize, entityType = "", action = "", search = "", dateFrom = "", dateTo = "", actorId = "", sortBy = "created_at", sortDir = "desc") {
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
			if (entityType) params.p_entity_type = entityType;
			if (action) params.p_action = action;
			if (search) params.p_search = search;
			if (dateFrom) params.p_date_from = dateFrom;
			if (dateTo) params.p_date_to = dateTo;
			if (actorId) params.p_actor_id = actorId;
			setResult(await rpc("get_audit_logs", params));
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, [
		page,
		pageSize,
		entityType,
		action,
		search,
		dateFrom,
		dateTo,
		actorId,
		sortBy,
		sortDir
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
function useAbandonedCarts(page, pageSize, status = "", search = "", dateFrom = "", dateTo = "", sortBy = "created_at", sortDir = "desc") {
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
			if (status) params.p_status = status;
			if (search) params.p_search = search;
			if (dateFrom) params.p_date_from = dateFrom;
			if (dateTo) params.p_date_to = dateTo;
			setResult(await rpc("get_abandoned_carts", params));
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, [
		page,
		pageSize,
		status,
		search,
		dateFrom,
		dateTo,
		sortBy,
		sortDir
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
function useAbandonedCartAnalytics(dateFrom = "", dateTo = "", groupBy = "day") {
	const [data, setData] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setError(null);
			const params = { p_group_by: groupBy };
			if (dateFrom) params.p_date_from = dateFrom;
			if (dateTo) params.p_date_to = dateTo;
			setData(await rpc("get_abandoned_cart_analytics", params));
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, [
		dateFrom,
		dateTo,
		groupBy
	]);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	return {
		data,
		loading,
		error,
		refetch: load
	};
}
async function markCartRecovered(cartId) {
	return rpc("mark_cart_recovered", { p_cart_id: cartId });
}
//#endregion
export { useAuditLogs as a, useActivityTimeline as i, useAbandonedCartAnalytics as n, useAbandonedCarts as r, markCartRecovered as t };
