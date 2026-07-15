import { n as env } from "./env-kAZsRxGY.mjs";
import { D as logger, b as getContainer, n as PaymentError } from "./ssr.mjs";
import { a as isStructuralError, c as validateProductStatus, d as validateSizeStock, f as validateVariant, i as isStockOnlyError, l as validateQuantity, n as getAvailableStock, s as validatePrice, u as validateSizeInList } from "./inventory-engine-C_1gi1aY.mjs";
import { t as supabaseAdmin } from "./supabase-admin-JA7MKHST.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/payments-BHcFd9Yh.js
function collectErrors(errors) {
	const structural = errors.filter((e) => isStructuralError(e.code));
	const stock = errors.filter((e) => isStockOnlyError(e.code));
	if (structural.length > 0) {
		const msgs = structural.map((e) => e.message).slice(0, 3);
		const remaining = structural.length - msgs.length;
		const suffix = remaining > 0 ? ` (and ${remaining} other issue${remaining > 1 ? "s" : ""})` : "";
		return {
			message: `Your bag has changed: ${msgs.join("; ")}${suffix}`,
			isStructural: true
		};
	}
	if (stock.length === 1) return {
		message: stock[0].message,
		isStructural: false
	};
	const msgs = stock.map((e) => e.message).slice(0, 3);
	const remaining = stock.length - msgs.length;
	const suffix = remaining > 0 ? ` (and ${remaining} other issue${remaining > 1 ? "s" : ""})` : "";
	return {
		message: `${msgs.join("; ")}${suffix}`,
		isStructural: false
	};
}
async function validateCartItems(input) {
	if (!Array.isArray(input) || input.length === 0) return {
		ok: false,
		error: "Cart is empty",
		items: [],
		subtotal: 0,
		total: 0
	};
	for (const item of input) if (!item.productId || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 999) return {
		ok: false,
		error: "Invalid cart item",
		items: [],
		subtotal: 0,
		total: 0
	};
	const productIds = [...new Set(input.map((i) => i.productId))];
	const variantRequests = input.filter((i) => i.variantId);
	const variantIds = [...new Set(variantRequests.map((i) => i.variantId))];
	const { data: products, error: productError } = await supabaseAdmin.from("products").select("id, name, price, stock, size_stock, sizes, is_active, status, updated_at").in("id", productIds);
	if (productError) return {
		ok: false,
		error: "Unable to validate cart",
		items: [],
		subtotal: 0,
		total: 0
	};
	if (!products || products.length !== productIds.length) {
		const found = new Set((products ?? []).map((p) => p.id));
		const missing = productIds.filter((id) => !found.has(id));
		if (missing.length >= 1) return {
			ok: false,
			error: missing.length === 1 ? "Product no longer exists." : `Products no longer exist: ${missing.length} items removed from catalog.`,
			items: [],
			subtotal: 0,
			total: 0
		};
	}
	const productMap = /* @__PURE__ */ new Map();
	for (const p of products) productMap.set(p.id, p);
	const variantMap = /* @__PURE__ */ new Map();
	if (variantIds.length > 0) {
		const { data: variants, error: variantError } = await supabaseAdmin.from("product_variants").select("id, product_id, price, stock, is_active").in("id", variantIds);
		if (!variantError && variants) for (const v of variants) variantMap.set(v.id, v);
	}
	const errors = [];
	const validated = [];
	let subtotal = 0;
	for (const item of input) {
		const product = productMap.get(item.productId);
		if (!product) {
			errors.push({
				code: "PRODUCT_UNAVAILABLE",
				message: "Product no longer exists."
			});
			continue;
		}
		const statusError = validateProductStatus(product);
		if (statusError) {
			errors.push(statusError);
			continue;
		}
		const size = item.size ?? "";
		const sizeListError = validateSizeInList(size, product.sizes, product.name);
		if (sizeListError) {
			errors.push(sizeListError);
			continue;
		}
		if (item.expectedUnitPrice != null) {
			const priceError = validatePrice(Number(product.price), item.expectedUnitPrice);
			if (priceError) {
				errors.push(priceError);
				continue;
			}
		}
		if (item.variantId) {
			const variant = variantMap.get(item.variantId) ?? null;
			const variantError = validateVariant(variant?.product_id === item.productId ? variant : null, product.name);
			if (variantError) {
				errors.push(variantError);
				continue;
			}
			const unitPrice = variant.price ?? product.price;
			if (item.expectedUnitPrice != null) {
				const priceError = validatePrice(Number(unitPrice), item.expectedUnitPrice);
				if (priceError) {
					errors.push(priceError);
					continue;
				}
			}
			const qtyError = validateQuantity(item.quantity, variant.stock, product.name);
			if (qtyError) {
				errors.push(qtyError);
				continue;
			}
			const lineSubtotal = Number(unitPrice) * item.quantity;
			subtotal += lineSubtotal;
			validated.push({
				productId: item.productId,
				variantId: item.variantId,
				size,
				productName: product.name,
				unitPrice: Number(unitPrice),
				quantity: item.quantity,
				maxAvailable: variant.stock,
				subtotal: lineSubtotal
			});
			continue;
		}
		const sizeStockError = validateSizeStock(size, product.size_stock, product.name);
		if (sizeStockError) {
			errors.push(sizeStockError);
			continue;
		}
		const { quantity: maxAvailable } = getAvailableStock(product, size);
		const qtyError = validateQuantity(item.quantity, maxAvailable, product.name);
		if (qtyError) {
			errors.push(qtyError);
			continue;
		}
		const lineSubtotal = Number(product.price) * item.quantity;
		subtotal += lineSubtotal;
		validated.push({
			productId: item.productId,
			variantId: null,
			size,
			productName: product.name,
			unitPrice: Number(product.price),
			quantity: item.quantity,
			maxAvailable,
			subtotal: lineSubtotal
		});
	}
	if (errors.length > 0) {
		const { message } = collectErrors(errors);
		return {
			ok: false,
			error: message,
			items: [],
			subtotal: 0,
			total: 0
		};
	}
	return {
		ok: true,
		items: validated,
		subtotal,
		total: subtotal
	};
}
function calculateTotals(validatedItems, options) {
	const subtotal = validatedItems.reduce((sum, item) => sum + item.subtotal, 0);
	const shipping = options?.shippingCost ?? 0;
	const discount = options?.discountAmount ?? 0;
	const taxableAmount = subtotal - discount;
	const taxRate = options?.taxRate ?? 0;
	const tax = Math.round(taxableAmount * taxRate * 100) / 100;
	const total = Math.max(0, taxableAmount + tax + shipping);
	return {
		subtotal: Math.round(subtotal * 100) / 100,
		shipping: Math.round(shipping * 100) / 100,
		tax: Math.round(tax * 100) / 100,
		discount: Math.round(discount * 100) / 100,
		total: Math.round(total * 100) / 100,
		currency: options?.currency ?? "usd"
	};
}
async function createPaymentIntent(input) {
	const container = getContainer();
	const validation = await validateCartItems(input.items.map((item) => ({
		productId: item.productId,
		variantId: item.variantId,
		size: item.size,
		quantity: item.quantity
	})));
	if (!validation.ok) throw new PaymentError(validation.error ?? "Cart validation failed");
	const totals = calculateTotals(validation.items);
	const amountInCents = Math.round(totals.total * 100);
	const metadata = {
		user_id: input.userId,
		email: input.email,
		subtotal: String(totals.subtotal),
		total: String(totals.total),
		currency: totals.currency,
		shipping_address: JSON.stringify(input.shippingAddress),
		validated_items: JSON.stringify(validation.items.map((v) => ({
			productId: v.productId,
			variantId: v.variantId,
			size: v.size,
			quantity: v.quantity,
			unitPrice: v.unitPrice,
			productName: v.productName
		})))
	};
	if (input.billingAddress) metadata.billing_address = JSON.stringify(input.billingAddress);
	if (input.checkoutRequestId) metadata.checkout_request_id = input.checkoutRequestId;
	const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email);
	const params = {
		amount: amountInCents,
		currency: totals.currency,
		automatic_payment_methods: { enabled: true },
		metadata,
		...isValidEmail ? { receipt_email: input.email } : {},
		shipping: {
			name: `${input.shippingAddress.firstName} ${input.shippingAddress.lastName}`.trim() || "Customer",
			address: {
				line1: input.shippingAddress.line1 || void 0,
				line2: input.shippingAddress.line2 || void 0,
				city: input.shippingAddress.city || void 0,
				state: input.shippingAddress.state || void 0,
				postal_code: input.shippingAddress.postalCode || void 0,
				country: input.shippingAddress.country || void 0
			},
			phone: input.shippingAddress.phone || void 0
		}
	};
	let paymentIntent;
	try {
		paymentIntent = await container.stripe.paymentIntents.create(params, { idempotencyKey: input.idempotencyKey });
	} catch (stripeErr) {
		logger.error("Stripe PaymentIntent creation failed", {
			error: stripeErr instanceof Error ? stripeErr.message : String(stripeErr),
			userId: input.userId
		});
		throw stripeErr;
	}
	if (input.checkoutRequestId) try {
		await container.supabase.from("payment_sessions").upsert({
			checkout_request_id: input.checkoutRequestId,
			user_id: input.userId,
			email: input.email,
			status: "pending",
			payment_intent_id: paymentIntent.id,
			payment_method: "card",
			currency: totals.currency,
			amount: amountInCents,
			metadata: {},
			expires_at: new Date(Date.now() + 1800 * 1e3).toISOString(),
			browser: input.browser ?? null,
			ip_address: input.ipAddress ?? null,
			device_type: input.deviceType ?? null
		}, {
			onConflict: "checkout_request_id",
			ignoreDuplicates: false
		});
	} catch (sessionErr) {
		logger.warn("Failed to create payment session", { error: String(sessionErr) });
	}
	return {
		clientSecret: paymentIntent.client_secret,
		id: paymentIntent.id,
		amount: paymentIntent.amount,
		paymentMethodTypes: paymentIntent.payment_method_types,
		validatedItems: validation.items.map((v) => ({
			productId: v.productId,
			name: v.productName,
			unitPrice: v.unitPrice,
			quantity: v.quantity,
			size: v.size,
			variantId: v.variantId
		})),
		totals
	};
}
async function updatePaymentIntent(paymentIntentId, input) {
	const container = getContainer();
	const params = {
		receipt_email: input.email,
		shipping: {
			name: `${input.shippingAddress.firstName} ${input.shippingAddress.lastName}`,
			address: {
				line1: input.shippingAddress.line1,
				line2: input.shippingAddress.line2,
				city: input.shippingAddress.city,
				state: input.shippingAddress.state,
				postal_code: input.shippingAddress.postalCode,
				country: input.shippingAddress.country
			},
			phone: input.shippingAddress.phone
		},
		metadata: {
			email: input.email,
			shipping_address: JSON.stringify(input.shippingAddress),
			billing_address: JSON.stringify(input.billingAddress ?? input.shippingAddress)
		}
	};
	const paymentIntent = await container.stripe.paymentIntents.update(paymentIntentId, params);
	return {
		clientSecret: paymentIntent.client_secret,
		id: paymentIntent.id
	};
}
async function validateAndBuildLineItems(items) {
	const validation = await validateCartItems(items.map((item) => ({
		productId: item.productId,
		variantId: item.variantId,
		size: item.size,
		quantity: item.quantity
	})));
	if (!validation.ok) throw new PaymentError(validation.error ?? "Cart validation failed");
	return {
		validation,
		totals: calculateTotals(validation.items)
	};
}
async function createStripeCheckoutSession(input) {
	const { validation, totals } = await validateAndBuildLineItems(input.items);
	const publicUrl = env.publicAppUrl;
	const sessionParams = new URLSearchParams();
	sessionParams.set("mode", "payment");
	sessionParams.set("success_url", input.successUrl || `${publicUrl}/order/success`);
	sessionParams.set("cancel_url", input.cancelUrl || `${publicUrl}/checkout?canceled=1`);
	sessionParams.set("customer_email", input.email);
	sessionParams.set("automatic_payment_methods[enabled]", "true");
	sessionParams.set("shipping_address_collection[allowed_countries][]", "US");
	sessionParams.set("metadata[user_id]", input.userId);
	sessionParams.set("metadata[email]", input.email);
	sessionParams.set("metadata[subtotal]", String(totals.subtotal));
	sessionParams.set("metadata[total]", String(totals.total));
	sessionParams.set("metadata[shipping_address]", JSON.stringify(input.shippingAddress));
	if (input.billingAddress) sessionParams.set("metadata[billing_address]", JSON.stringify(input.billingAddress));
	const itemsMeta = validation.items.map((v) => ({
		productId: v.productId,
		variantId: v.variantId,
		size: v.size,
		quantity: v.quantity,
		unitPrice: v.unitPrice,
		productName: v.productName
	}));
	sessionParams.set("metadata[validated_items]", JSON.stringify(itemsMeta));
	validation.items.forEach((v, index) => {
		sessionParams.set(`line_items[${index}][quantity]`, String(v.quantity));
		sessionParams.set(`line_items[${index}][price_data][currency]`, totals.currency);
		sessionParams.set(`line_items[${index}][price_data][unit_amount]`, String(Math.round(v.unitPrice * 100)));
		sessionParams.set(`line_items[${index}][price_data][product_data][name]`, v.productName);
	});
	const secretKey = env.stripeSecretKey;
	if (!secretKey) throw new PaymentError("Stripe secret key is not configured");
	const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${secretKey}`,
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: sessionParams
	});
	const payload = await response.json();
	if (!response.ok) throw new PaymentError(typeof payload.error === "object" && payload.error !== null && "message" in payload.error ? String(payload.error.message ?? "Stripe request failed") : "Stripe request failed");
	const stripeSession = payload;
	if (!stripeSession.id || !stripeSession.url) throw new PaymentError("Stripe session creation failed");
	return { checkoutUrl: stripeSession.url };
}
async function createPayPalOrder(input) {
	const clientId = env.paypalClientId;
	const secret = env.paypalSecret;
	if (!clientId || !secret) throw new PaymentError("PayPal is not configured");
	const apiBase = env.paypalEnvironment === "production" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
	const tokenData = await (await fetch(`${apiBase}/v1/oauth2/token`, {
		method: "POST",
		headers: {
			Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: "grant_type=client_credentials"
	})).json();
	if (!tokenData.access_token) throw new PaymentError("PayPal authentication failed");
	const total = input.subtotal + input.shipping + input.tax;
	const orderData = await (await fetch(`${apiBase}/v2/checkout/orders`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${tokenData.access_token}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			intent: "CAPTURE",
			payment_source: { paypal: { experience_context: {
				payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
				landing_page: "LOGIN",
				user_action: "PAY_NOW"
			} } },
			purchase_units: [{
				amount: {
					currency_code: "USD",
					value: (total / 100).toFixed(2),
					breakdown: {
						item_total: {
							currency_code: "USD",
							value: (input.subtotal / 100).toFixed(2)
						},
						shipping: {
							currency_code: "USD",
							value: (input.shipping / 100).toFixed(2)
						},
						tax_total: {
							currency_code: "USD",
							value: (input.tax / 100).toFixed(2)
						}
					}
				},
				items: input.items.map((item) => ({
					name: item.name,
					quantity: String(item.quantity),
					unit_amount: {
						currency_code: "USD",
						value: (item.unitAmount / 100).toFixed(2)
					},
					description: item.description
				}))
			}]
		})
	})).json();
	if (!orderData.id) throw new PaymentError("PayPal order creation failed");
	const approveLink = orderData.links?.find((l) => l.rel === "approve")?.href;
	if (!approveLink) throw new PaymentError("PayPal approval link not found");
	return {
		id: orderData.id,
		approveUrl: approveLink
	};
}
async function capturePayPalOrder(orderId) {
	const clientId = env.paypalClientId;
	const secret = env.paypalSecret;
	if (!clientId || !secret) throw new PaymentError("PayPal is not configured");
	const apiBase = env.paypalEnvironment === "production" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
	const tokenData = await (await fetch(`${apiBase}/v1/oauth2/token`, {
		method: "POST",
		headers: {
			Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: "grant_type=client_credentials"
	})).json();
	if (!tokenData.access_token) throw new PaymentError("PayPal authentication failed");
	const captureData = await (await fetch(`${apiBase}/v2/checkout/orders/${orderId}/capture`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${tokenData.access_token}`,
			"Content-Type": "application/json"
		}
	})).json();
	if (!captureData.id) throw new PaymentError("PayPal capture failed");
	return {
		status: captureData.status ?? "UNKNOWN",
		id: captureData.id,
		purchase_units: captureData.purchase_units
	};
}
//#endregion
export { capturePayPalOrder, createPayPalOrder, createPaymentIntent, createStripeCheckoutSession, updatePaymentIntent, validateAndBuildLineItems };
