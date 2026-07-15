import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { r as supabase } from "./auth-context-oFJLTVEi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-coupons-ChZ61okb.js
var import_react = /* @__PURE__ */ __toESM(require_react());
async function rpc(name, params) {
	const { data, error } = await supabase.rpc(name, params);
	if (error) throw error;
	return data;
}
function useCouponsManagement(page, pageSize, search = "", sortBy = "created_at", sortDir = "desc", statusFilter = "", typeFilter = "") {
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
			if (typeFilter) params.p_type_filter = typeFilter;
			setResult(await rpc("get_coupons_management", params));
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
		typeFilter
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
function useCouponAnalytics() {
	const [data, setData] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setError(null);
			setData(await rpc("get_coupon_analytics"));
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
		data,
		loading,
		error,
		refetch: load
	};
}
async function createCoupon(params) {
	return rpc("create_coupon", params);
}
async function updateCoupon(params) {
	return rpc("update_coupon", params);
}
async function deleteCoupon(couponId) {
	return rpc("delete_coupon", { p_coupon_id: couponId });
}
async function toggleCouponStatus(couponId) {
	return rpc("toggle_coupon_status", { p_coupon_id: couponId });
}
//#endregion
export { useCouponAnalytics as a, updateCoupon as i, deleteCoupon as n, useCouponsManagement as o, toggleCouponStatus as r, createCoupon as t };
