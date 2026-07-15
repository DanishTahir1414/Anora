import { i as stringType, n as numberType, r as objectType, t as arrayType } from "../_libs/zod.mjs";
import { a as TSS_SERVER_FUNCTION, g as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/payments-DtOs8o_a.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var CheckoutItemSchema = objectType({
	productId: stringType().min(1),
	variantId: stringType().nullable().optional(),
	size: stringType().default(""),
	quantity: numberType().int().positive()
});
var AddressSchema = objectType({
	firstName: stringType().default(""),
	lastName: stringType().default(""),
	line1: stringType().default(""),
	line2: stringType().optional().default(""),
	city: stringType().default(""),
	state: stringType().optional().default(""),
	postalCode: stringType().default(""),
	country: stringType().default(""),
	phone: stringType().default("")
});
var PaymentIntentSchema = objectType({
	items: arrayType(CheckoutItemSchema).min(1),
	shippingAddress: AddressSchema,
	billingAddress: AddressSchema.optional(),
	email: stringType().min(1),
	accessToken: stringType().min(1),
	idempotencyKey: stringType().optional(),
	checkoutRequestId: stringType().optional()
});
var PayPalCreateSchema = objectType({
	items: arrayType(CheckoutItemSchema).min(1),
	shippingAddress: AddressSchema,
	billingAddress: AddressSchema.optional(),
	email: stringType().email(),
	accessToken: stringType().min(1)
});
var PayPalCaptureSchema = objectType({
	paypalOrderId: stringType().min(1),
	accessToken: stringType().min(1),
	email: stringType().email(),
	items: arrayType(CheckoutItemSchema).min(1),
	shippingAddress: AddressSchema,
	billingAddress: AddressSchema.optional(),
	paymentMethod: stringType().default("paypal")
});
var StripeCheckoutSchema = objectType({
	items: arrayType(CheckoutItemSchema).min(1),
	shippingAddress: AddressSchema,
	billingAddress: AddressSchema.optional(),
	email: stringType().email(),
	accessToken: stringType().min(1)
});
var UpdatePaymentIntentSchema = objectType({
	paymentIntentId: stringType().min(1),
	email: stringType().email(),
	accessToken: stringType().min(1),
	shippingAddress: AddressSchema,
	billingAddress: AddressSchema.optional()
});
var CreateOrderSchema = objectType({
	paymentIntentId: stringType().min(1),
	accessToken: stringType().min(1)
});
var createPaymentIntent_createServerFn_handler = createServerRpc({
	id: "2fcd2ca4f42d824330f952304cff9375335150845fcced022e07331b066607e1",
	name: "createPaymentIntent",
	filename: "src/lib/payments.ts"
}, (opts) => createPaymentIntent.__executeServer(opts));
var createPaymentIntent = createServerFn({ method: "POST" }).validator(PaymentIntentSchema).handler(createPaymentIntent_createServerFn_handler, async ({ data }) => {
	const { email, items, shippingAddress, billingAddress, accessToken, idempotencyKey, checkoutRequestId } = data;
	const { supabaseAdmin } = await import("./supabase-admin-JA7MKHST.mjs").then((n) => n.n);
	const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
	if (userError || !userData?.user) throw new Error("Authentication required");
	const { createPaymentIntent: serverCreatePaymentIntent } = await import("./payments-BHcFd9Yh.mjs");
	return await serverCreatePaymentIntent({
		userId: userData.user.id,
		email,
		items,
		shippingAddress,
		billingAddress,
		idempotencyKey,
		checkoutRequestId
	});
});
var createPayPalOrder_createServerFn_handler = createServerRpc({
	id: "65a328596f783a810efebd02b829f5fcd65117faee849ada160524ec626bd86d",
	name: "createPayPalOrder",
	filename: "src/lib/payments.ts"
}, (opts) => createPayPalOrder.__executeServer(opts));
var createPayPalOrder = createServerFn({ method: "POST" }).validator(PayPalCreateSchema).handler(createPayPalOrder_createServerFn_handler, async ({ data }) => {
	const { email, items, shippingAddress, billingAddress, accessToken } = data;
	const { supabaseAdmin } = await import("./supabase-admin-JA7MKHST.mjs").then((n) => n.n);
	const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
	if (userError || !userData?.user) throw new Error("Authentication required");
	const { createPayPalOrder: serverCreatePayPalOrder, validateAndBuildLineItems } = await import("./payments-BHcFd9Yh.mjs");
	const { validation, totals } = await validateAndBuildLineItems(items);
	return await serverCreatePayPalOrder({
		items: validation.items.map((v) => ({
			name: v.productName,
			quantity: v.quantity,
			unitAmount: Math.round(v.unitPrice * 100),
			description: ""
		})),
		subtotal: Math.round(totals.subtotal * 100),
		shipping: Math.round(totals.shipping * 100),
		tax: Math.round(totals.tax * 100)
	});
});
var capturePayPalOrder_createServerFn_handler = createServerRpc({
	id: "b98beab47c7da24e45a5aa76901b6c9c14a44ce8252e510ed37392c6daf56e3b",
	name: "capturePayPalOrder",
	filename: "src/lib/payments.ts"
}, (opts) => capturePayPalOrder.__executeServer(opts));
var capturePayPalOrder = createServerFn({ method: "POST" }).validator(objectType({ orderId: stringType().min(1) })).handler(capturePayPalOrder_createServerFn_handler, async ({ data }) => {
	const { capturePayPalOrder: serverCapturePayPal } = await import("./payments-BHcFd9Yh.mjs");
	return await serverCapturePayPal(data.orderId);
});
var createStripeCheckoutSession_createServerFn_handler = createServerRpc({
	id: "59837370dca5e7aeec2f5b35a2516890ce8beb69f4aa55f11181763b71fac69e",
	name: "createStripeCheckoutSession",
	filename: "src/lib/payments.ts"
}, (opts) => createStripeCheckoutSession.__executeServer(opts));
var createStripeCheckoutSession = createServerFn({ method: "POST" }).validator(StripeCheckoutSchema).handler(createStripeCheckoutSession_createServerFn_handler, async ({ data }) => {
	const { email, items, shippingAddress, billingAddress, accessToken } = data;
	const { supabaseAdmin } = await import("./supabase-admin-JA7MKHST.mjs").then((n) => n.n);
	const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
	if (userError || !userData?.user) throw new Error("Authentication required");
	const { createStripeCheckoutSession: serverCreateSession } = await import("./payments-BHcFd9Yh.mjs");
	const baseUrl = process.env.PUBLIC_APP_URL ?? "http://localhost:5173";
	return await serverCreateSession({
		userId: userData.user.id,
		email,
		items,
		shippingAddress,
		billingAddress,
		successUrl: `${baseUrl}/order/success`,
		cancelUrl: `${baseUrl}/checkout?canceled=1`
	});
});
var createOrder_createServerFn_handler = createServerRpc({
	id: "099e313e1b893a73975c0f2555ec6d530bbf2dcb64697208b8b578d47f06926a",
	name: "createOrder",
	filename: "src/lib/payments.ts"
}, (opts) => createOrder.__executeServer(opts));
var createOrder = createServerFn({ method: "POST" }).validator(CreateOrderSchema).handler(createOrder_createServerFn_handler, async ({ data }) => {
	const { paymentIntentId, accessToken } = data;
	const { supabaseAdmin } = await import("./supabase-admin-JA7MKHST.mjs").then((n) => n.n);
	const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
	if (userError || !userData?.user) throw new Error("Authentication required");
	const { createOrderFromPaymentIntent } = await import("./order-lifecycle-D6OSpTgj.mjs");
	return await createOrderFromPaymentIntent({ paymentIntentId });
});
var createOrderFromPayPal_createServerFn_handler = createServerRpc({
	id: "172868133c2a3ab7d4f0f1f072f5e5d7403861c4b49e49331f925fbf957c777b",
	name: "createOrderFromPayPal",
	filename: "src/lib/payments.ts"
}, (opts) => createOrderFromPayPal.__executeServer(opts));
var createOrderFromPayPal = createServerFn({ method: "POST" }).validator(PayPalCaptureSchema).handler(createOrderFromPayPal_createServerFn_handler, async ({ data }) => {
	const { paypalOrderId, accessToken, email, items, shippingAddress, billingAddress, paymentMethod } = data;
	const { supabaseAdmin } = await import("./supabase-admin-JA7MKHST.mjs").then((n) => n.n);
	const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
	if (userError || !userData?.user) throw new Error("Authentication required");
	const { capturePayPalOrder: serverCapturePayPal, validateAndBuildLineItems } = await import("./payments-BHcFd9Yh.mjs");
	if ((await serverCapturePayPal(paypalOrderId)).status !== "COMPLETED") throw new Error("PayPal payment could not be verified.");
	const { validation: cartValidation } = await validateAndBuildLineItems(items);
	const validatedTotal = cartValidation.items.reduce((sum, v) => sum + v.unitPrice * v.quantity, 0);
	const { createOrderFromPayPal: serverCreateFromPayPal } = await import("./order-lifecycle-D6OSpTgj.mjs");
	return await serverCreateFromPayPal({
		userId: userData.user.id,
		email,
		paypalOrderId,
		items: cartValidation.items.map((v) => ({
			productId: v.productId,
			variantId: v.variantId ?? null,
			size: v.size ?? "",
			quantity: v.quantity,
			unitPrice: v.unitPrice,
			productName: v.productName
		})),
		shippingAddress,
		billingAddress: billingAddress ?? shippingAddress,
		total: validatedTotal,
		paymentMethod: paymentMethod || "paypal"
	});
});
var updatePaymentIntent_createServerFn_handler = createServerRpc({
	id: "522572d6cc52f832d5182047f6b34fe4843366bc87004897c5b463fb3127ad3c",
	name: "updatePaymentIntent",
	filename: "src/lib/payments.ts"
}, (opts) => updatePaymentIntent.__executeServer(opts));
var updatePaymentIntent = createServerFn({ method: "POST" }).validator(UpdatePaymentIntentSchema).handler(updatePaymentIntent_createServerFn_handler, async ({ data }) => {
	const { paymentIntentId, email, shippingAddress, billingAddress, accessToken } = data;
	const { supabaseAdmin } = await import("./supabase-admin-JA7MKHST.mjs").then((n) => n.n);
	const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
	if (userError || !userData?.user) throw new Error("Authentication required");
	const { updatePaymentIntent: serverUpdatePaymentIntent } = await import("./payments-BHcFd9Yh.mjs");
	return await serverUpdatePaymentIntent(paymentIntentId, {
		email,
		shippingAddress,
		billingAddress
	});
});
var getPayPalClientId_createServerFn_handler = createServerRpc({
	id: "4e67e51eb1c5277923ccf0a66d67553ad9a097b1002a4733d19ac43561fdedeb",
	name: "getPayPalClientId",
	filename: "src/lib/payments.ts"
}, (opts) => getPayPalClientId.__executeServer(opts));
var getPayPalClientId = createServerFn({ method: "GET" }).handler(getPayPalClientId_createServerFn_handler, async () => {
	try {
		const { env } = await import("./env-kAZsRxGY.mjs").then((n) => n.r).then((n) => n.n);
		return env.paypalClientId || "";
	} catch {
		return "";
	}
});
var DownloadInvoiceSchema = objectType({
	invoiceId: stringType().min(1),
	accessToken: stringType().min(1)
});
var getInvoicePdfUrl_createServerFn_handler = createServerRpc({
	id: "94fa8344331b3e50e641d337a93da74bd7dbaebf49f7d1ca0bc6ea68428c0028",
	name: "getInvoicePdfUrl",
	filename: "src/lib/payments.ts"
}, (opts) => getInvoicePdfUrl.__executeServer(opts));
var getInvoicePdfUrl = createServerFn({ method: "POST" }).validator(DownloadInvoiceSchema).handler(getInvoicePdfUrl_createServerFn_handler, async ({ data }) => {
	const { invoiceId, accessToken } = data;
	const { supabaseAdmin } = await import("./supabase-admin-JA7MKHST.mjs").then((n) => n.n);
	const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);
	if (userError || !userData?.user) throw new Error("Authentication required");
	const { data: invoiceRec } = await supabaseAdmin.from("invoices").select("customer_id, invoice_number").eq("id", invoiceId).maybeSingle();
	if (!invoiceRec) throw new Error("Invoice not found");
	const { data: profile } = await supabaseAdmin.from("profiles").select("role").eq("id", userData.user.id).maybeSingle();
	const isStaff = profile?.role === "admin";
	if (invoiceRec.customer_id !== userData.user.id && !isStaff) throw new Error("Access denied");
	const { getContainer } = await import("./ssr.mjs").then((n) => n.j).then((n) => n.t);
	return {
		signedUrl: await getContainer().invoice.getPdfUrl(invoiceId),
		invoiceNumber: invoiceRec.invoice_number
	};
});
//#endregion
export { capturePayPalOrder_createServerFn_handler, createOrderFromPayPal_createServerFn_handler, createOrder_createServerFn_handler, createPayPalOrder_createServerFn_handler, createPaymentIntent_createServerFn_handler, createStripeCheckoutSession_createServerFn_handler, getInvoicePdfUrl_createServerFn_handler, getPayPalClientId_createServerFn_handler, updatePaymentIntent_createServerFn_handler };
