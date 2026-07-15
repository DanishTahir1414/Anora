import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { r as supabase } from "./auth-context-oFJLTVEi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-gift-cards-DF1Dj7an.js
var import_react = /* @__PURE__ */ __toESM(require_react());
async function rpc(name, params) {
	const { data, error } = await supabase.rpc(name, params);
	if (error) throw error;
	return data;
}
function useGiftCardsManagement(page, pageSize, search = "", sortBy = "created_at", sortDir = "desc", statusFilter = "") {
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
			setResult(await rpc("get_gift_cards_management", params));
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
		statusFilter
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
function useGiftCardDetails(giftCardId) {
	const [details, setDetails] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		if (!giftCardId) return;
		try {
			setLoading(true);
			setError(null);
			setDetails(await rpc("get_gift_card_details", { p_gift_card_id: giftCardId }));
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, [giftCardId]);
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
function useGiftCardAnalytics() {
	const [data, setData] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setError(null);
			setData(await rpc("get_gift_card_analytics"));
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
async function createGiftCard(params) {
	return rpc("create_gift_card", params);
}
async function toggleGiftCardStatus(giftCardId) {
	return rpc("toggle_gift_card_status", { p_gift_card_id: giftCardId });
}
//#endregion
export { useGiftCardsManagement as a, useGiftCardDetails as i, toggleGiftCardStatus as n, useGiftCardAnalytics as r, createGiftCard as t };
