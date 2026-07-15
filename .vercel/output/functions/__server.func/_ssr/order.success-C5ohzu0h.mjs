import { o as __toESM } from "../_runtime.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { S as getInvoicePdfUrl, y as formatAddress } from "./ssr.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useAuth, n as ProtectedRoute, r as supabase } from "./auth-context-oFJLTVEi.mjs";
import { $ as CircleCheckBig, P as Loader, W as FileDown } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Route } from "./order.success--OUKHVR4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/order.success-C5ohzu0h.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function OrderSuccessPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProtectedRoute, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderSuccess, {}) });
}
async function downloadInvoice(invoiceId) {
	try {
		const { data: sessionData } = await supabase.auth.getSession();
		const token = sessionData.session?.access_token;
		if (!token) {
			toast.error("Please sign in to download your invoice.");
			return false;
		}
		const result = await getInvoicePdfUrl({ data: {
			invoiceId,
			accessToken: token
		} });
		const blob = await (await fetch(result.signedUrl)).blob();
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${result.invoiceNumber}.pdf`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
		return true;
	} catch (err) {
		toast.error(err instanceof Error ? err.message : "Failed to download invoice PDF.");
		return false;
	}
}
function DownloadInvoice({ invoiceId }) {
	const [loading, setLoading] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: async () => {
			setLoading(true);
			await downloadInvoice(invoiceId);
			setLoading(false);
		},
		disabled: loading,
		className: "mt-3 inline-flex items-center gap-2 text-sm text-gold hover:underline disabled:opacity-50",
		children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Loader, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDown, { className: "h-4 w-4" }), loading ? "Downloading..." : "Download Invoice PDF"]
	});
}
function OrderSuccess() {
	const { user } = useAuth();
	const { orderNumber, invoiceNumber, orderId } = Route.useSearch();
	const [order, setOrder] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const sessionId = (typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams()).get("session_id");
	(0, import_react.useEffect)(() => {
		if (!user) return;
		async function fetchByOrderId() {
			if (!orderId) return null;
			const { data } = await supabase.from("orders").select(`id, order_number, status, subtotal, total, payment_status, payment_method,
           shipping_address, billing_address, created_at,
           order_items (id, product_id, name, price, quantity, image_url, attributes),
           invoices (id, invoice_number, status, total_amount),
           order_timeline (id, event_type, description, created_at)`).eq("id", orderId).eq("user_id", user.id).maybeSingle();
			return data;
		}
		async function fetchBySessionId() {
			if (!sessionId) return null;
			const { data } = await supabase.from("orders").select(`id, order_number, status, subtotal, total, payment_status, payment_method,
           shipping_address, billing_address, created_at,
           order_items (id, product_id, name, price, quantity, image_url, attributes),
           invoices (id, invoice_number, status, total_amount),
           order_timeline (id, event_type, description, created_at)`).eq("stripe_session_id", sessionId).maybeSingle();
			return data;
		}
		async function load() {
			let data = await fetchByOrderId();
			if (data) {
				setOrder(data);
				setLoading(false);
				return;
			}
			data = await fetchBySessionId();
			if (data) {
				setOrder(data);
				setLoading(false);
				return;
			}
			if (orderNumber) {
				setLoading(false);
				return;
			}
			if (!sessionId && !orderId) {
				const { data: recentOrder } = await supabase.from("orders").select(`id, order_number, status, subtotal, total, payment_status, payment_method,
             shipping_address, billing_address, created_at,
             order_items (id, product_id, name, price, quantity, image_url, attributes),
             invoices (id, invoice_number, status, total_amount),
             order_timeline (id, event_type, description, created_at)`).eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
				if (recentOrder) {
					setOrder(recentOrder);
					setLoading(false);
					return;
				}
				if (!orderNumber) {
					setError("No order information found.");
					setLoading(false);
					return;
				}
			}
			if (sessionId) {
				let retries = 0;
				const maxRetries = 15;
				async function poll() {
					const found = await fetchBySessionId();
					if (found) {
						setOrder(found);
						setLoading(false);
						return;
					}
					retries++;
					if (retries < maxRetries) setTimeout(poll, 1500);
					else {
						setError("Order is being processed. Please check your account shortly.");
						setLoading(false);
					}
				}
				setTimeout(poll, 2e3);
			} else setLoading(false);
		}
		load();
	}, [
		user,
		sessionId,
		orderId,
		orderNumber
	]);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "px-6 py-24 text-center max-w-md mx-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "animate-pulse space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-12 w-12 rounded-full bg-neutral mx-auto" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-6 w-48 bg-neutral mx-auto rounded" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 w-64 bg-neutral mx-auto rounded" })
			]
		})
	});
	if (error) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-6 py-24 text-center max-w-md mx-auto",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted-foreground",
			children: error
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/account",
			className: "mt-6 inline-block text-[11px] tracking-[0.32em] uppercase hover-underline",
			children: "View My Orders"
		})]
	});
	const displayOrderNumber = order?.order_number ?? orderNumber ?? "";
	const displayInvoiceNumber = invoiceNumber ?? "";
	const items = order?.order_items ?? [];
	const invoice = (order?.invoices)?.[0] ?? null;
	const shippingAddr = order?.shipping_address;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 lg:px-10 py-16 max-w-2xl mx-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center mb-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-12 w-12 mx-auto text-emerald-600 mb-4" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "eyebrow",
						children: "Payment Successful"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-serif text-4xl mt-2",
						children: "Thank You"
					}),
					displayOrderNumber && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-muted-foreground mt-2",
						children: ["Order ", displayOrderNumber]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border border-border/60 divide-y divide-border/60",
				children: [
					items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-6 space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "eyebrow",
								children: "Order Summary"
							}),
							items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [item.image_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: item.image_url,
										alt: item.name,
										className: "w-10 h-12 object-cover"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										String(item.name ?? ""),
										" × ",
										String(item.quantity ?? "")
									] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["$", (Number(item.price ?? 0) * Number(item.quantity ?? 0)).toFixed(2)] })]
							}, item.id)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px bg-border my-3" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between font-serif text-lg",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total Paid" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["$", Number(order?.total ?? 0).toFixed(2)] })]
							})
						]
					}),
					(invoice || displayInvoiceNumber) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "eyebrow mb-3",
								children: "Invoice"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: String(invoice?.invoice_number ?? displayInvoiceNumber ?? "")
							}),
							invoice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted-foreground",
									children: ["Status: ", String(invoice.status ?? "")]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted-foreground",
									children: ["Amount: $", Number(invoice.total_amount ?? 0).toFixed(2)]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DownloadInvoice, { invoiceId: String(invoice.id ?? "") })
							] })
						]
					}),
					shippingAddr && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "eyebrow mb-3",
							children: "Shipping Address"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm text-muted-foreground leading-relaxed whitespace-pre-line",
							children: formatAddress(shippingAddr)
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex flex-col sm:flex-row gap-4 justify-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/account",
					className: "bg-foreground text-background py-3 px-8 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink transition-colors text-center",
					children: "View My Orders"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/shop",
					className: "border border-border py-3 px-8 text-[11px] tracking-[0.32em] uppercase hover:border-foreground transition-colors text-center",
					children: "Continue Shopping"
				})]
			})
		]
	});
}
//#endregion
export { OrderSuccessPage as component };
