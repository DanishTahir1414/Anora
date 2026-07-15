import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/order.success--OUKHVR4.js
var $$splitComponentImporter = () => import("./order.success-C5ohzu0h.mjs");
var Route = createFileRoute("/order/success")({
	validateSearch: (search) => ({
		session_id: search.session_id,
		orderNumber: search.orderNumber,
		invoiceNumber: search.invoiceNumber,
		orderId: search.orderId
	}),
	head: () => ({ meta: [{ title: "Order Confirmed — ANORA" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
