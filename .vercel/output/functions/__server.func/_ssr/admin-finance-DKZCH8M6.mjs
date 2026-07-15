import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as rpc } from "./admin-client-C5B6s_l5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-finance-DKZCH8M6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useFinanceDashboard() {
	const [data, setData] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setError(null);
			setData(await rpc("get_finance_dashboard"));
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
function useTrendQuery(rpcName, startDate, endDate) {
	const [data, setData] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			const params = {};
			if (startDate) params.p_start_date = startDate;
			if (endDate) params.p_end_date = endDate;
			setData(await rpc(rpcName, params));
		} catch {
			setData([]);
		} finally {
			setLoading(false);
		}
	}, [
		rpcName,
		startDate,
		endDate
	]);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	return {
		data,
		loading
	};
}
function useRevenueTrend(startDate, endDate) {
	return useTrendQuery("get_revenue_trend", startDate, endDate);
}
function useTaxTrend(startDate, endDate) {
	return useTrendQuery("get_tax_trend", startDate, endDate);
}
function useRefundTrend(startDate, endDate) {
	return useTrendQuery("get_refund_trend", startDate, endDate);
}
function useDiscountTrend(startDate, endDate) {
	return useTrendQuery("get_discount_trend", startDate, endDate);
}
function useMonthlyComparison(year) {
	const [data, setData] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			const params = {};
			if (year) params.p_year = year;
			setData(await rpc("get_monthly_comparison", params));
		} catch {
			setData([]);
		} finally {
			setLoading(false);
		}
	}, [year]);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	return {
		data,
		loading
	};
}
function useYearlyComparison() {
	const [data, setData] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setData(await rpc("get_yearly_comparison"));
		} catch {
			setData([]);
		} finally {
			setLoading(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	return {
		data,
		loading
	};
}
//#endregion
export { useRevenueTrend as a, useRefundTrend as i, useFinanceDashboard as n, useTaxTrend as o, useMonthlyComparison as r, useYearlyComparison as s, useDiscountTrend as t };
