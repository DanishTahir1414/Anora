import { o as __toESM } from "../_runtime.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as stringType } from "../_libs/zod.mjs";
import { M as updatePaymentIntent, f as createOrder, h as createPaymentIntent } from "./ssr.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useAuth, n as ProtectedRoute, r as supabase } from "./auth-context-oFJLTVEi.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as useCart } from "./store-CEzUOlzO.mjs";
import { i as StripePaymentForm, n as PaymentMethodList, r as Route, t as PayPalPayment } from "./checkout-CPDVF_is.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/checkout-B9QI66WC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var emptyAddress = {
	firstName: "",
	lastName: "",
	line1: "",
	line2: "",
	city: "",
	state: "",
	postalCode: "",
	country: "US",
	phone: ""
};
function getFormValue(form, name) {
	return form.elements.namedItem(name)?.value ?? "";
}
function readAddressFromForm(form) {
	return {
		firstName: getFormValue(form, "firstName"),
		lastName: getFormValue(form, "lastName"),
		line1: getFormValue(form, "address"),
		line2: getFormValue(form, "address2"),
		city: getFormValue(form, "city"),
		state: getFormValue(form, "state"),
		postalCode: getFormValue(form, "postalCode"),
		country: getFormValue(form, "country"),
		phone: getFormValue(form, "phone")
	};
}
function CheckoutForm() {
	const cart = useCart();
	const { user } = useAuth();
	const navigate = useNavigate();
	const { success, canceled, payment_intent, redirect_status } = Route.useSearch();
	const [billingSame, setBillingSame] = (0, import_react.useState)(true);
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [selectedMethod, setSelectedMethod] = (0, import_react.useState)("stripe");
	const [clientSecret, setClientSecret] = (0, import_react.useState)(null);
	const [orderCreating, setOrderCreating] = (0, import_react.useState)(false);
	const orderAttempted = (0, import_react.useRef)(false);
	const checkoutRequestId = (0, import_react.useRef)(crypto.randomUUID());
	const formRef = (0, import_react.useRef)(null);
	const [confirmHandler, setConfirmHandler] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (success === "1" && payment_intent && redirect_status === "succeeded" && !orderAttempted.current) {
			orderAttempted.current = true;
			setOrderCreating(true);
			supabase.auth.getSession().then(async ({ data: sessionData }) => {
				const accessToken = sessionData.session?.access_token;
				if (!accessToken) {
					navigate({ to: "/login" });
					return;
				}
				try {
					const order = await createOrder({ data: {
						paymentIntentId: payment_intent,
						accessToken
					} });
					if (order.success) {
						cart.clear();
						navigate({
							to: "/order/success",
							search: {
								orderNumber: order.orderNumber ?? "",
								invoiceNumber: order.invoiceNumber ?? "",
								orderId: order.orderId ?? ""
							}
						});
					} else {
						toast.error(order.error ?? "Order could not be created. Please contact support.");
						setOrderCreating(false);
					}
				} catch (err) {
					toast.error(err instanceof Error ? err.message : "Order could not be created. Please contact support.");
					setOrderCreating(false);
				}
			});
		}
	}, [
		success,
		payment_intent,
		redirect_status,
		navigate,
		cart
	]);
	(0, import_react.useEffect)(() => {
		if (success === "1" && !payment_intent) navigate({
			to: "/order/success",
			search: {
				orderNumber: "",
				invoiceNumber: "",
				orderId: ""
			}
		});
	}, [
		success,
		payment_intent,
		navigate
	]);
	(0, import_react.useEffect)(() => {
		if (cart.items.length === 0 || !user?.email || clientSecret) return;
		const init = async () => {
			try {
				const { data: { session } } = await supabase.auth.getSession();
				if (!session?.access_token) return;
				setClientSecret((await createPaymentIntent({ data: {
					accessToken: session.access_token,
					email: user.email,
					items: cart.items.map((item) => ({
						productId: item.productId,
						variantId: item.variantId ?? null,
						size: item.size,
						quantity: item.quantity
					})),
					shippingAddress: emptyAddress,
					billingAddress: emptyAddress,
					checkoutRequestId: checkoutRequestId.current,
					idempotencyKey: `init-${checkoutRequestId.current}`
				} })).clientSecret);
			} catch (err) {
				console.error("PaymentIntent initialization failed:", err);
			}
		};
		init();
	}, [
		cart.items,
		user?.email,
		clientSecret
	]);
	const handleConfirmReady = (0, import_react.useCallback)((fn) => {
		setConfirmHandler(() => fn);
	}, []);
	const handleStripeSubmit = async () => {
		if (submitting) return;
		if (!clientSecret || !confirmHandler) {
			toast.error("Payment methods are still loading. Please wait a moment.");
			return;
		}
		setSubmitting(true);
		try {
			if (!formRef.current) throw new Error("Form not found");
			const email = getFormValue(formRef.current, "email");
			const { shippingAddress, billingAddress } = getAddress();
			const { data: sessionData } = await supabase.auth.getSession();
			const accessToken = sessionData.session?.access_token;
			if (!accessToken) throw new Error("Please sign in to complete checkout");
			const piId = clientSecret.split("_secret_")[0];
			await updatePaymentIntent({ data: {
				paymentIntentId: piId,
				email,
				accessToken,
				shippingAddress,
				billingAddress
			} });
			const confirmResult = await confirmHandler(clientSecret, `${window.location.origin}/checkout?success=1`);
			if (confirmResult.error) {
				toast.error(confirmResult.error.message ?? "Payment could not be processed.");
				setSubmitting(false);
			} else if (confirmResult.paymentIntent) {
				setOrderCreating(true);
				const order = await createOrder({ data: {
					paymentIntentId: confirmResult.paymentIntent.id,
					accessToken
				} });
				if (order.success) {
					cart.clear();
					navigate({
						to: "/order/success",
						search: {
							orderNumber: order.orderNumber ?? "",
							invoiceNumber: order.invoiceNumber ?? "",
							orderId: order.orderId ?? ""
						}
					});
				} else {
					toast.error(order.error ?? "Order could not be created. Please contact support.");
					setSubmitting(false);
					setOrderCreating(false);
				}
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Unable to complete payment. Please try again.");
			setSubmitting(false);
		}
	};
	const handlePayPalSuccess = (0, import_react.useCallback)((result) => {
		cart.clear();
		navigate({
			to: "/order/success",
			search: {
				orderNumber: result.orderNumber ?? "",
				invoiceNumber: result.invoiceNumber ?? "",
				orderId: result.orderId ?? ""
			}
		});
	}, [navigate, cart]);
	const handlePayPalError = (0, import_react.useCallback)((error) => {
		toast.error(error);
	}, []);
	const getAddress = (0, import_react.useCallback)(() => {
		if (!formRef.current) return {
			shippingAddress: emptyAddress,
			billingAddress: emptyAddress
		};
		const addr = readAddressFromForm(formRef.current);
		return {
			shippingAddress: addr,
			billingAddress: billingSame ? addr : {
				firstName: addr.firstName,
				lastName: addr.lastName,
				line1: getFormValue(formRef.current, "billingAddress"),
				line2: "",
				city: getFormValue(formRef.current, "billingCity"),
				state: "",
				postalCode: getFormValue(formRef.current, "billingPostalCode"),
				country: getFormValue(formRef.current, "billingCountry"),
				phone: addr.phone
			}
		};
	}, [billingSame]);
	const total = cart.subtotal;
	if (success === "1" && orderCreating) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-6 py-24 text-center max-w-md mx-auto",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-serif text-4xl",
			children: "Payment Successful"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-muted-foreground mt-4",
			children: "Creating your order..."
		})]
	});
	if (canceled === "1") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-6 py-24 text-center max-w-md mx-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-4xl",
				children: "Payment Canceled"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground mt-4",
				children: "Your payment was not completed. Your cart items are still saved."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/checkout",
				className: "mt-8 inline-block text-[11px] tracking-[0.32em] uppercase hover-underline",
				children: "Try Again"
			})
		]
	});
	if (cart.detailed.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-6 py-24 text-center max-w-md mx-auto",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-serif text-4xl",
			children: "Your bag is empty"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/shop",
			className: "mt-6 inline-block text-[11px] tracking-[0.32em] uppercase hover-underline",
			children: "Continue Shopping"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 lg:px-10 py-16 max-w-6xl mx-auto",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center mb-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "eyebrow",
				children: "Secure Checkout"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-5xl mt-3",
				children: "Checkout"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			ref: formRef,
			onSubmit: async (e) => {
				e.preventDefault();
				if (!user) {
					toast.error("Please sign in to complete checkout");
					return;
				}
				const form = e.currentTarget;
				const email = getFormValue(form, "email");
				if (!stringType().email().safeParse(email).success) {
					toast.error("Please enter a valid email address");
					return;
				}
				if (selectedMethod === "stripe") await handleStripeSubmit();
			},
			className: "grid lg:grid-cols-[1fr_360px] gap-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						title: "Contact Information",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							label: "Email",
							name: "email",
							type: "email",
							required: true,
							defaultValue: user?.email ?? ""
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							label: "Phone",
							name: "phone",
							type: "tel",
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						title: "Shipping Address",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid sm:grid-cols-2 gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									label: "First name",
									name: "firstName",
									required: true
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									label: "Last name",
									name: "lastName",
									required: true
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								label: "Address",
								name: "address",
								required: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								label: "Apartment, suite, etc.",
								name: "address2"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid sm:grid-cols-3 gap-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										label: "City",
										name: "city",
										required: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										label: "State",
										name: "state"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										label: "Postal code",
										name: "postalCode",
										required: true
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								label: "Country",
								name: "country",
								required: true,
								defaultValue: "United States"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						title: "Billing Address",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-3 text-sm cursor-pointer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: billingSame,
								onChange: (e) => setBillingSame(e.target.checked),
								className: "h-4 w-4 accent-foreground"
							}), "Same as shipping address"]
						}), !billingSame && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								label: "Billing address",
								name: "billingAddress",
								required: true
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid sm:grid-cols-3 gap-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										label: "City",
										name: "billingCity",
										required: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										label: "Postal code",
										name: "billingPostalCode",
										required: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										label: "Country",
										name: "billingCountry",
										required: true
									})
								]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
						title: "Choose Payment Method",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentMethodList, {
								methods: ["stripe", "paypal"],
								selected: selectedMethod,
								onSelect: setSelectedMethod,
								disabled: submitting
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `mt-5${selectedMethod === "stripe" ? "" : " hidden"}`,
								children: clientSecret ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StripePaymentForm, {
									stripeKey: "pk_test_51ToxtVDQ13PfPOmZNFk4L8bDSPXMJeN5jjtAgM83UoqGYL3t4IoQGrdb1VnZAZPT1ol0WMj0vztkFBVqlr1AEiZG00qEbnOFwm",
									clientSecret,
									onConfirmReady: handleConfirmReady
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3 animate-pulse",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-11 bg-neutral rounded-md" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-11 bg-neutral rounded-md" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-11 bg-neutral rounded-md" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-11 bg-neutral rounded-md" })]
										})
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `mt-5${selectedMethod === "paypal" ? "" : " hidden"}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayPalPayment, {
									items: cart.items,
									email: user?.email ?? "",
									getAddress,
									onSuccess: handlePayPalSuccess,
									onError: handlePayPalError
								})
							})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: "lg:sticky lg:top-24 lg:self-start",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-neutral p-7",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow mb-5",
							children: "Order Summary"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-4 max-h-72 overflow-y-auto pr-1",
							children: cart.detailed.map(({ item, product }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: product.images[0],
										alt: product.name,
										className: "w-14 h-16 object-cover"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-serif text-base",
											children: product.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted-foreground",
											children: [
												"Size ",
												item.size,
												" · Qty ",
												item.quantity
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-sm",
										children: ["$", product.price * item.quantity]
									})
								]
							}, `${item.productId}-${item.size}`))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px bg-border my-5" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Subtotal",
							value: `$${cart.subtotal}`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Shipping",
							value: "Complimentary"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px bg-border my-5" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							label: "Total",
							value: `$${total}`,
							bold: true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: submitting,
							className: "mt-6 w-full bg-foreground text-background py-4 text-[11px] tracking-[0.32em] uppercase hover:bg-gold hover:text-ink transition-colors disabled:opacity-60",
							children: submitting ? "Processing Payment..." : "Place Order"
						})
					]
				})
			})]
		})]
	});
}
function Section({ title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 mb-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gold-rule" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "eyebrow",
			children: title
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-4",
		children
	})] });
}
function Input({ label, ...rest }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "block text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			...rest,
			className: "w-full bg-background border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors"
		})]
	});
}
function Row({ label, value, bold }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between py-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `text-sm ${bold ? "eyebrow" : "text-muted-foreground"}`,
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: bold ? "font-serif text-xl" : "text-sm",
			children: value
		})]
	});
}
function CheckoutPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProtectedRoute, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckoutForm, {}) });
}
//#endregion
export { CheckoutForm, CheckoutPage as component };
