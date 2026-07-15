import { o as __toESM } from "../_runtime.mjs";
import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as getPayPalClientId, E as getStripePublishableKey, c as capturePayPalOrder, m as createPayPalOrder, p as createOrderFromPayPal } from "./ssr.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { r as supabase } from "./auth-context-oFJLTVEi.mjs";
import { $ as CircleCheckBig } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as useStripe, n as PaymentElement, r as useElements, t as Elements } from "../_libs/@stripe/react-stripe-js+[...].mjs";
import { t as loadStripe } from "../_libs/stripe__stripe-js.mjs";
import { n as PayPalScriptProvider, t as PayPalButtons } from "../_libs/paypal__react-paypal-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/checkout-CPDVF_is.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PAYMENT_METHODS = {
	stripe: {
		id: "stripe",
		title: "Credit / Debit Card",
		subtitle: "Visa • Mastercard • Amex • Apple Pay • Google Pay • Link"
	},
	paypal: {
		id: "paypal",
		title: "PayPal",
		subtitle: "PayPal • Credit • Debit • Venmo • Pay Later"
	}
};
function StripeIcon() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 24 24",
		className: "h-5 w-5",
		fill: "#635BFF",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: "2",
			y: "4",
			width: "20",
			height: "16",
			rx: "3"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
			x: "12",
			y: "16",
			textAnchor: "middle",
			fill: "#fff",
			fontSize: "8",
			fontWeight: "bold",
			fontFamily: "sans-serif",
			children: "S"
		})]
	});
}
function PayPalIcon() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		className: "h-5 w-5",
		fill: "#003087",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M7.08 20.5H3.5l1.76-11.03H9.1c2.16 0 3.77.37 4.6 1.07.46.39.74.87.85 1.44.11.57.04 1.26-.21 2.06-.26.83-.64 1.51-1.14 2.04-.5.53-1.12.93-1.87 1.17-.75.24-1.64.24-2.67.24h-.95L7.08 20.5z" })
	});
}
var PAYMENT_ICONS = {
	stripe: StripeIcon,
	paypal: PayPalIcon
};
function PaymentMethodCard({ id, selected, onClick, disabled }) {
	const config = PAYMENT_METHODS[id];
	const Icon = PAYMENT_ICONS[id];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		role: "radio",
		"aria-checked": selected,
		"aria-label": config.title,
		disabled,
		onClick,
		className: `w-full text-left p-4 rounded-lg border transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground ${selected ? "border-foreground shadow-soft bg-background" : "border-border bg-background hover:border-foreground/40"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-shrink-0 mt-0.5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-medium",
						children: config.title
					}), selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-4 w-4 text-foreground flex-shrink-0" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground mt-1",
					children: config.subtitle
				})]
			})]
		})
	});
}
function PaymentMethodList({ methods, selected, onSelect, disabled }) {
	if (methods.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-2",
		role: "radiogroup",
		"aria-label": "Payment methods",
		children: methods.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentMethodCard, {
			id,
			selected: selected === id,
			onClick: () => onSelect(id),
			disabled
		}, id))
	});
}
var stripePromiseCache = /* @__PURE__ */ new Map();
function getStripePromise(key) {
	if (!stripePromiseCache.has(key)) stripePromiseCache.set(key, loadStripe(key));
	return stripePromiseCache.get(key);
}
var STRIPE_KEY = getStripePublishableKey();
if (STRIPE_KEY) getStripePromise(STRIPE_KEY);
var StripeInnerForm = (0, import_react.memo)(function StripeInnerForm({ onConfirmReady }) {
	const stripe = useStripe();
	const elements = useElements();
	const registered = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (!stripe || !elements || registered.current) return;
		registered.current = true;
		onConfirmReady(async (clientSecret, returnUrl) => {
			const { error: submitError } = await elements.submit();
			if (submitError) return { error: submitError };
			return stripe.confirmPayment({
				elements,
				clientSecret,
				confirmParams: { return_url: returnUrl },
				redirect: "if_required"
			});
		});
	}, [
		stripe,
		elements,
		onConfirmReady
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentElement, { options: { layout: { type: "accordion" } } });
});
var StripePaymentForm = (0, import_react.memo)(function StripePaymentForm({ stripeKey, clientSecret, onConfirmReady }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Elements, {
		stripe: getStripePromise(stripeKey),
		options: {
			clientSecret,
			appearance: { theme: "stripe" }
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StripeInnerForm, { onConfirmReady })
	});
});
var paypalClientIdCache = void 0;
var paypalClientIdPromise = null;
function fetchPayPalClientId() {
	if (paypalClientIdPromise === null) paypalClientIdPromise = getPayPalClientId().then((id) => {
		paypalClientIdCache = id || null;
		return paypalClientIdCache;
	});
	return paypalClientIdPromise;
}
fetchPayPalClientId();
var PayPalPayment = (0, import_react.memo)(function PayPalPayment({ items, email, getAddress, onSuccess, onError }) {
	const [clientId, setClientId] = (0, import_react.useState)(paypalClientIdCache !== void 0 ? paypalClientIdCache : null);
	const [sdkLoading, setSdkLoading] = (0, import_react.useState)(paypalClientIdCache === void 0);
	const pendingDataRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (paypalClientIdCache !== void 0) return;
		fetchPayPalClientId().then((id) => {
			setClientId(id);
			setSdkLoading(false);
		});
	}, []);
	const createOrder = (0, import_react.useCallback)(async () => {
		const { data: { session } } = await supabase.auth.getSession();
		if (!session?.access_token) throw new Error("Your session expired. Please sign in again.");
		const { shippingAddress, billingAddress } = getAddress();
		pendingDataRef.current = {
			email,
			shippingAddress,
			billingAddress,
			items
		};
		return (await createPayPalOrder({ data: {
			accessToken: session.access_token,
			email,
			items: items.map((i) => ({
				productId: i.productId,
				variantId: i.variantId ?? null,
				size: i.size ?? "",
				quantity: i.quantity
			})),
			shippingAddress,
			billingAddress
		} })).id;
	}, [
		items,
		email,
		getAddress
	]);
	const onApprove = (0, import_react.useCallback)(async (data) => {
		const pending = pendingDataRef.current;
		if (!pending) {
			onError("Session data not found. Please try again.");
			return;
		}
		try {
			const { data: { session } } = await supabase.auth.getSession();
			if (!session?.access_token) {
				onError("Your session expired. Please sign in again.");
				return;
			}
			if ((await capturePayPalOrder({ data: { orderId: data.orderID } })).status !== "COMPLETED") {
				onError("PayPal payment could not be completed. Please try again.");
				return;
			}
			const result = await createOrderFromPayPal({ data: {
				paypalOrderId: data.orderID,
				accessToken: session.access_token,
				email: pending.email,
				items: pending.items.map((i) => ({
					productId: i.productId,
					variantId: i.variantId ?? null,
					size: i.size ?? "",
					quantity: i.quantity
				})),
				shippingAddress: pending.shippingAddress,
				billingAddress: pending.billingAddress,
				total: 1,
				paymentMethod: "paypal"
			} });
			if (result.success) onSuccess(result);
			else onError(result.error ?? "Failed to create order");
		} catch (err) {
			onError(err instanceof Error ? err.message : "Payment could not be completed.");
		}
	}, [onSuccess, onError]);
	if (sdkLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3 animate-pulse",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-10 bg-neutral rounded-md" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-10 bg-neutral rounded-md" })]
	});
	if (!clientId) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-xs text-red/70",
		children: "PayPal is not configured. Please contact support."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PayPalScriptProvider, {
		options: {
			clientId,
			currency: "USD",
			intent: "capture",
			"enable-funding": "paypal,venmo,paylater,card",
			"disable-funding": ""
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayPalButtons, {
			style: {
				layout: "vertical",
				shape: "rect",
				color: "gold",
				label: "paypal",
				tagline: false
			},
			createOrder,
			onApprove,
			onError: () => {
				toast.error("PayPal encountered an error. Please try again.");
			},
			onCancel: () => {
				toast.info("PayPal payment was cancelled.");
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[10px] text-muted-foreground text-center mt-2 tracking-wider",
			children: "PayPal • Credit • Debit • Venmo • Pay Later"
		})]
	});
});
var $$splitComponentImporter = () => import("./checkout-B9QI66WC.mjs");
var Route = createFileRoute("/checkout")({
	validateSearch: (search) => ({
		success: search.success,
		canceled: search.canceled,
		payment_intent: search.payment_intent,
		redirect_status: search.redirect_status
	}),
	head: () => ({ meta: [{ title: "Checkout — ANORA" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { StripePaymentForm as i, PaymentMethodList as n, Route as r, PayPalPayment as t };
