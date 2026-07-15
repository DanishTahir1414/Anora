import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { r as supabase } from "./auth-context-oFJLTVEi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-orders-DRh_-Ycm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
async function rpc(name, params) {
	const { data, error } = await supabase.rpc(name, params);
	if (error) throw error;
	return data;
}
function useOrderMetrics() {
	const [metrics, setMetrics] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setError(null);
			setMetrics(await rpc("get_order_metrics"));
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
		metrics,
		loading,
		error,
		refetch: load
	};
}
function useOrdersManagement(page, pageSize, search = "", sortBy = "created_at", sortDir = "desc", status = "", paymentStatus = "", dateFrom = "", dateTo = "") {
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
			if (status) params.p_status = status;
			if (paymentStatus) params.p_payment_status = paymentStatus;
			if (dateFrom) params.p_date_from = dateFrom;
			if (dateTo) params.p_date_to = dateTo;
			setResult(await rpc("get_orders_management", params));
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
		status,
		paymentStatus,
		dateFrom,
		dateTo
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
function useOrderDetails(orderId) {
	const [details, setDetails] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		if (!orderId) return;
		try {
			setLoading(true);
			setError(null);
			setDetails((await rpc("get_order_details", { p_order_id: orderId })).order);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, [orderId]);
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
async function updateOrderStatus(orderId, status) {
	return rpc("update_order_status", {
		p_order_id: orderId,
		p_status: status
	});
}
async function processReturn(returnId, status, adminNotes) {
	const params = {
		p_return_id: returnId,
		p_status: status
	};
	if (adminNotes) params.p_admin_notes = adminNotes;
	return rpc("process_return", params);
}
async function processRefund(refundId, status) {
	return rpc("process_refund", {
		p_refund_id: refundId,
		p_status: status
	});
}
async function cancelOrder(orderId, reason, cancelledBy = "admin") {
	return rpc("cancel_order", {
		p_order_id: orderId,
		p_reason: reason,
		p_cancelled_by: cancelledBy
	});
}
async function addInternalNote(orderId, note) {
	return rpc("add_internal_note", {
		p_order_id: orderId,
		p_note: note
	});
}
async function requestRefund(orderId, reason, description) {
	const params = {
		p_order_id: orderId,
		p_reason: reason
	};
	if (description) params.p_description = description;
	return rpc("request_refund", params);
}
//#endregion
export { requestRefund as a, useOrderMetrics as c, processReturn as i, useOrdersManagement as l, cancelOrder as n, updateOrderStatus as o, processRefund as r, useOrderDetails as s, addInternalNote as t };
