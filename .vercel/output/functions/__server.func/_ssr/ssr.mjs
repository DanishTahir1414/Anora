import { r as __exportAll } from "../_runtime.mjs";
import { n as env, t as __exportAll$1 } from "./env-kAZsRxGY.mjs";
import { n as createClient } from "../_libs/@supabase/ssr+[...].mjs";
import { t as Stripe } from "../_libs/stripe.mjs";
import { n as StandardFonts, r as rgb, t as PDFDocument } from "../_libs/pdf-lib.mjs";
import { d as mergeHeaders, i as defaultSerovalPlugins, s as makeSerovalPlugin } from "../_libs/@tanstack/router-core+[...].mjs";
import { A as parseRedirect, O as isRedirect } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as stringType, n as numberType, r as objectType, t as arrayType } from "../_libs/zod.mjs";
import { t as Resend } from "../_libs/resend+standardwebhooks.mjs";
import crypto$1 from "node:crypto";
import { AsyncLocalStorage } from "node:async_hooks";
//#region node_modules/.nitro/vite/services/ssr/index.js
var ssr_exports = /* @__PURE__ */ __exportAll({
	A: () => getServerFnById,
	C: () => safeObjectMerge,
	D: () => TSS_SERVER_FUNCTION,
	E: () => TSS_FORMDATA_CONTEXT,
	M: () => logger,
	N: () => renderErrorPage,
	O: () => X_TSS_RAW_RESPONSE,
	S: () => createNullProtoObject,
	T: () => TSS_CONTENT_TYPE_FRAMED_VERSIONED,
	_: () => createMiddleware,
	a: () => createOrderFromPayPal,
	b: () => getStartContext,
	c: () => formatAddress,
	d: () => getStripePublishableKey,
	default: () => server_default,
	f: () => updatePaymentIntent,
	g: () => createCsrfMiddleware,
	h: () => createStart,
	i: () => createOrder,
	j: () => PaymentError,
	k: () => X_TSS_SERIALIZED,
	l: () => getInvoicePdfUrl,
	m: () => getDefaultSerovalPlugins,
	n: () => getContainer,
	o: () => createPayPalOrder,
	p: () => mergeHeaders,
	r: () => capturePayPalOrder,
	s: () => createPaymentIntent,
	t: () => container_exports,
	u: () => getPayPalClientId,
	v: () => createServerFn,
	w: () => FrameType,
	x: () => runWithStartContext,
	y: () => flattenMiddlewares
});
var lastCapturedError;
var TTL_MS = 5e3;
function record(error) {
	lastCapturedError = {
		error,
		at: Date.now()
	};
}
if (typeof globalThis.addEventListener === "function") {
	globalThis.addEventListener("error", (event) => record(event.error ?? event));
	globalThis.addEventListener("unhandledrejection", (event) => record(event.reason));
}
function consumeLastCapturedError() {
	if (!lastCapturedError) return void 0;
	if (Date.now() - lastCapturedError.at > TTL_MS) {
		lastCapturedError = void 0;
		return;
	}
	const { error } = lastCapturedError;
	lastCapturedError = void 0;
	return error;
}
function renderErrorPage() {
	return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}
var config = {
	queue: {
		pollIntervalMs: 6e4,
		retryIntervalMs: 3e4,
		batchSize: 10,
		maxRetries: 3,
		retryDelaysSec: [
			30,
			120,
			600
		]
	},
	invoice: {
		bucketName: "invoice-pdfs",
		signedUrlExpirySec: 3600,
		pdf: {
			fontSize: 10,
			headerFontSize: 24,
			tableHeaderBg: "#C9A96E",
			tableHeaderText: "#FFFFFF",
			bodyText: "#1A1A1A",
			mutedText: "#666666",
			borderColor: "#E5E5E5"
		}
	},
	resend: { defaultFromName: "ANORA Elegance Atelier" },
	stripe: {
		apiVersion: "2025-02-24.acacia",
		idempotencyPrefix: "anora_"
	}
};
var logger = class Logger {
	static _instance;
	static get() {
		if (!Logger._instance) Logger._instance = new Logger();
		return Logger._instance;
	}
	formatTimestamp() {
		return (/* @__PURE__ */ new Date()).toISOString();
	}
	log(level, message, context) {
		const entry = {
			timestamp: this.formatTimestamp(),
			level,
			message,
			...context ? { context } : {}
		};
		const line = JSON.stringify(entry);
		switch (level) {
			case "error":
				console.error(line);
				break;
			case "warn":
				console.warn(line);
				break;
			case "debug":
				console.debug(line);
				break;
			default: console.log(line);
		}
	}
	debug(message, context) {
		this.log("debug", message, context);
	}
	info(message, context) {
		this.log("info", message, context);
	}
	warn(message, context) {
		this.log("warn", message, context);
	}
	error(message, context) {
		this.log("error", message, context);
	}
}.get();
var ApplicationError = class extends Error {
	code;
	statusCode;
	cause;
	constructor(message, code, statusCode = 500, cause) {
		super(message);
		this.code = code;
		this.statusCode = statusCode;
		this.cause = cause;
		this.name = this.constructor.name;
	}
};
var QueueError = class extends ApplicationError {
	constructor(message, cause) {
		super(message, "QUEUE_ERROR", 500, cause);
	}
};
var EmailError = class extends ApplicationError {
	constructor(message, cause) {
		super(message, "EMAIL_ERROR", 500, cause);
	}
};
var StorageError = class extends ApplicationError {
	constructor(message, cause) {
		super(message, "STORAGE_ERROR", 500, cause);
	}
};
var PaymentError = class extends ApplicationError {
	constructor(message, code = "PAYMENT_ERROR", cause) {
		super(message, code, 402, cause);
	}
};
var NotFoundError = class extends ApplicationError {
	constructor(message = "Not found") {
		super(message, "NOT_FOUND", 404);
	}
};
var StorageService = class {
	supabase;
	constructor(supabase) {
		this.supabase = supabase;
	}
	get bucket() {
		return config.invoice.bucketName;
	}
	async upload(path, data, contentType) {
		logger.debug("Storage upload", {
			path,
			contentType
		});
		const { error } = await this.supabase.storage.from(this.bucket).upload(path, data, {
			contentType,
			upsert: true
		});
		if (error) throw new StorageError(`Upload failed: ${error.message}`, error);
		return path;
	}
	async download(path) {
		logger.debug("Storage download", { path });
		const { data, error } = await this.supabase.storage.from(this.bucket).download(path);
		if (error) throw new StorageError(`Download failed: ${error.message}`, error);
		const arrayBuf = await data.arrayBuffer();
		return {
			data: new Uint8Array(arrayBuf),
			contentType: data.type || "application/octet-stream"
		};
	}
	async exists(path) {
		const { data, error } = await this.supabase.storage.from(this.bucket).list("", { search: path });
		if (error) return false;
		return data.some((f) => f.name === path);
	}
	async delete(path) {
		const { error } = await this.supabase.storage.from(this.bucket).remove([path]);
		if (error) throw new StorageError(`Delete failed: ${error.message}`, error);
	}
	async signedUrl(path) {
		const { data, error } = await this.supabase.storage.from(this.bucket).createSignedUrl(path, config.invoice.signedUrlExpirySec);
		if (error) throw new StorageError(`Signed URL failed: ${error.message}`, error);
		return data.signedUrl;
	}
	async ensureBucket() {
		const { data: buckets } = await this.supabase.storage.listBuckets();
		if (buckets?.some((b) => b.name === this.bucket)) return;
		try {
			const { error } = await this.supabase.storage.createBucket(this.bucket, {
				public: false,
				fileSizeLimit: 10 * 1024 * 1024
			});
			if (error) throw new StorageError(`Bucket creation failed: ${error.message}`, error);
			logger.info("Storage bucket created", { bucket: this.bucket });
		} catch (err) {
			if (err instanceof StorageError && err.message.toLowerCase().includes("already exists")) {
				logger.info("Storage bucket already exists (race)", { bucket: this.bucket });
				return;
			}
			throw err;
		}
	}
};
var manifest = {
	"099e313e1b893a73975c0f2555ec6d530bbf2dcb64697208b8b578d47f06926a": {
		functionName: "createOrder_createServerFn_handler",
		importer: () => import("./payments-DtOs8o_a.mjs")
	},
	"172868133c2a3ab7d4f0f1f072f5e5d7403861c4b49e49331f925fbf957c777b": {
		functionName: "createOrderFromPayPal_createServerFn_handler",
		importer: () => import("./payments-DtOs8o_a.mjs")
	},
	"2fcd2ca4f42d824330f952304cff9375335150845fcced022e07331b066607e1": {
		functionName: "createPaymentIntent_createServerFn_handler",
		importer: () => import("./payments-DtOs8o_a.mjs")
	},
	"4e67e51eb1c5277923ccf0a66d67553ad9a097b1002a4733d19ac43561fdedeb": {
		functionName: "getPayPalClientId_createServerFn_handler",
		importer: () => import("./payments-DtOs8o_a.mjs")
	},
	"522572d6cc52f832d5182047f6b34fe4843366bc87004897c5b463fb3127ad3c": {
		functionName: "updatePaymentIntent_createServerFn_handler",
		importer: () => import("./payments-DtOs8o_a.mjs")
	},
	"59837370dca5e7aeec2f5b35a2516890ce8beb69f4aa55f11181763b71fac69e": {
		functionName: "createStripeCheckoutSession_createServerFn_handler",
		importer: () => import("./payments-DtOs8o_a.mjs")
	},
	"65a328596f783a810efebd02b829f5fcd65117faee849ada160524ec626bd86d": {
		functionName: "createPayPalOrder_createServerFn_handler",
		importer: () => import("./payments-DtOs8o_a.mjs")
	},
	"94fa8344331b3e50e641d337a93da74bd7dbaebf49f7d1ca0bc6ea68428c0028": {
		functionName: "getInvoicePdfUrl_createServerFn_handler",
		importer: () => import("./payments-DtOs8o_a.mjs")
	},
	"b98beab47c7da24e45a5aa76901b6c9c14a44ce8252e510ed37392c6daf56e3b": {
		functionName: "capturePayPalOrder_createServerFn_handler",
		importer: () => import("./payments-DtOs8o_a.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
var TSS_FORMDATA_CONTEXT = "__TSS_CONTEXT";
var TSS_SERVER_FUNCTION = Symbol.for("TSS_SERVER_FUNCTION");
var TSS_SERVER_FUNCTION_FACTORY = Symbol.for("TSS_SERVER_FUNCTION_FACTORY");
var X_TSS_SERIALIZED = "x-tss-serialized";
var X_TSS_RAW_RESPONSE = "x-tss-raw";
/** Content-Type for multiplexed framed responses (RawStream support) */
var TSS_CONTENT_TYPE_FRAMED = "application/x-tss-framed";
/**
* Frame types for binary multiplexing protocol.
*/
var FrameType = {
	/** Seroval JSON chunk (NDJSON line) */
	JSON: 0,
	/** Raw stream data chunk */
	CHUNK: 1,
	/** Raw stream end (EOF) */
	END: 2,
	/** Raw stream error */
	ERROR: 3
};
/** Full Content-Type header value with version parameter */
var TSS_CONTENT_TYPE_FRAMED_VERSIONED = `${TSS_CONTENT_TYPE_FRAMED}; v=1`;
function isSafeKey(key) {
	return key !== "__proto__" && key !== "constructor" && key !== "prototype";
}
/**
* Merge target and source into a new null-proto object, filtering dangerous keys.
*/
function safeObjectMerge(target, source) {
	const result = Object.create(null);
	if (target) {
		for (const key of Object.keys(target)) if (isSafeKey(key)) result[key] = target[key];
	}
	if (source && typeof source === "object") {
		for (const key of Object.keys(source)) if (isSafeKey(key)) result[key] = source[key];
	}
	return result;
}
/**
* Create a null-prototype object, optionally copying from source.
*/
function createNullProtoObject(source) {
	if (!source) return Object.create(null);
	const obj = Object.create(null);
	for (const key of Object.keys(source)) if (isSafeKey(key)) obj[key] = source[key];
	return obj;
}
var GLOBAL_STORAGE_KEY = Symbol.for("tanstack-start:start-storage-context");
var globalObj = globalThis;
if (!globalObj[GLOBAL_STORAGE_KEY]) globalObj[GLOBAL_STORAGE_KEY] = new AsyncLocalStorage();
var startStorage = globalObj[GLOBAL_STORAGE_KEY];
async function runWithStartContext(context, fn) {
	return startStorage.run(context, fn);
}
function getStartContext(opts) {
	const context = startStorage.getStore();
	if (!context && opts?.throwIfNotFound !== false) throw new Error(`No Start context found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`);
	return context;
}
var getStartOptions = () => getStartContext().startOptions;
var getStartContextServerOnly = getStartContext;
var createServerFn = (options, __opts) => {
	const resolvedOptions = __opts || options || {};
	if (typeof resolvedOptions.method === "undefined") resolvedOptions.method = "GET";
	const setValidator = (validator) => {
		return createServerFn(void 0, {
			...resolvedOptions,
			validator,
			inputValidator: validator
		});
	};
	const res = {
		options: resolvedOptions,
		middleware: (middleware) => {
			const newMiddleware = [...resolvedOptions.middleware || []];
			middleware.map((m) => {
				if (TSS_SERVER_FUNCTION_FACTORY in m) {
					if (m.options.middleware) newMiddleware.push(...m.options.middleware);
				} else newMiddleware.push(m);
			});
			const res = createServerFn(void 0, {
				...resolvedOptions,
				middleware: newMiddleware
			});
			res[TSS_SERVER_FUNCTION_FACTORY] = true;
			return res;
		},
		validator: setValidator,
		inputValidator: setValidator,
		handler: (...args) => {
			const [extractedFn, serverFn] = args;
			const newOptions = {
				...resolvedOptions,
				extractedFn,
				serverFn
			};
			const resolvedMiddleware = [...newOptions.middleware || [], serverFnBaseToMiddleware(newOptions)];
			extractedFn.method = resolvedOptions.method;
			return Object.assign(async (opts) => {
				const result = await executeMiddleware(resolvedMiddleware, "client", {
					...extractedFn,
					...newOptions,
					data: opts?.data,
					headers: opts?.headers,
					signal: opts?.signal,
					fetch: opts?.fetch,
					context: createNullProtoObject()
				});
				const redirect = parseRedirect(result.error);
				if (redirect) throw redirect;
				if (result.error) throw result.error;
				return result.result;
			}, {
				...extractedFn,
				method: resolvedOptions.method,
				__executeServer: async (opts) => {
					const startContext = getStartContextServerOnly();
					const serverContextAfterGlobalMiddlewares = startContext.contextAfterGlobalMiddlewares;
					return await executeMiddleware(resolvedMiddleware, "server", {
						...extractedFn,
						...opts,
						serverFnMeta: extractedFn.serverFnMeta,
						context: safeObjectMerge(opts.context, serverContextAfterGlobalMiddlewares),
						request: startContext.request
					}).then((d) => ({
						result: d.result,
						error: d.error,
						context: d.sendContext
					}));
				}
			});
		}
	};
	const fun = (options) => {
		return createServerFn(void 0, {
			...resolvedOptions,
			...options
		});
	};
	return Object.assign(fun, res);
};
async function executeMiddleware(middlewares, env, opts) {
	let flattenedMiddlewares = flattenMiddlewares([...getStartOptions()?.functionMiddleware || [], ...middlewares]);
	if (env === "server") {
		const startContext = getStartContextServerOnly({ throwIfNotFound: false });
		if (startContext?.executedRequestMiddlewares) flattenedMiddlewares = flattenedMiddlewares.filter((m) => !startContext.executedRequestMiddlewares.has(m));
	}
	const callNextMiddleware = async (ctx) => {
		const nextMiddleware = flattenedMiddlewares.shift();
		if (!nextMiddleware) return ctx;
		try {
			let validator = "validator" in nextMiddleware.options ? nextMiddleware.options.validator : void 0;
			if (!validator && "inputValidator" in nextMiddleware.options) validator = nextMiddleware.options.inputValidator;
			if (validator && env === "server") ctx.data = await execValidator(validator, ctx.data);
			let middlewareFn = void 0;
			if (env === "client") {
				if ("client" in nextMiddleware.options) middlewareFn = nextMiddleware.options.client;
			} else if ("server" in nextMiddleware.options) middlewareFn = nextMiddleware.options.server;
			if (middlewareFn) {
				const userNext = async (userCtx = {}) => {
					const result = await callNextMiddleware({
						...ctx,
						...userCtx,
						context: safeObjectMerge(ctx.context, userCtx.context),
						sendContext: safeObjectMerge(ctx.sendContext, userCtx.sendContext),
						headers: mergeHeaders(ctx.headers, userCtx.headers),
						_callSiteFetch: ctx._callSiteFetch,
						fetch: ctx._callSiteFetch ?? userCtx.fetch ?? ctx.fetch,
						result: userCtx.result !== void 0 ? userCtx.result : userCtx instanceof Response ? userCtx : ctx.result,
						error: userCtx.error ?? ctx.error
					});
					if (result.error) throw result.error;
					return result;
				};
				const result = await middlewareFn({
					...ctx,
					next: userNext
				});
				if (isRedirect(result)) return {
					...ctx,
					error: result
				};
				if (result instanceof Response) return {
					...ctx,
					result
				};
				if (!result) throw new Error("User middleware returned undefined. You must call next() or return a result in your middlewares.");
				return result;
			}
			return callNextMiddleware(ctx);
		} catch (error) {
			return {
				...ctx,
				error
			};
		}
	};
	return callNextMiddleware({
		...opts,
		headers: opts.headers || {},
		sendContext: opts.sendContext || {},
		context: opts.context || createNullProtoObject(),
		_callSiteFetch: opts.fetch
	});
}
function flattenMiddlewares(middlewares, maxDepth = 100) {
	const seen = /* @__PURE__ */ new Set();
	const flattened = [];
	const recurse = (middleware, depth) => {
		if (depth > maxDepth) throw new Error(`Middleware nesting depth exceeded maximum of ${maxDepth}. Check for circular references.`);
		middleware.forEach((m) => {
			if (m.options.middleware) recurse(m.options.middleware, depth + 1);
			if (!seen.has(m)) {
				seen.add(m);
				flattened.push(m);
			}
		});
	};
	recurse(middlewares, 0);
	return flattened;
}
async function execValidator(validator, input) {
	if (validator == null) return {};
	if ("~standard" in validator) {
		const result = await validator["~standard"].validate(input);
		if (result.issues) throw new Error(JSON.stringify(result.issues, void 0, 2));
		return result.value;
	}
	if ("parse" in validator) return validator.parse(input);
	if (typeof validator === "function") return validator(input);
	throw new Error("Invalid validator type!");
}
function serverFnBaseToMiddleware(options) {
	return {
		"~types": void 0,
		options: {
			inputValidator: options.validator ?? options.inputValidator,
			client: async ({ next, sendContext, fetch, ...ctx }) => {
				const payload = {
					...ctx,
					context: sendContext,
					fetch
				};
				return next(await options.extractedFn?.(payload));
			},
			server: async ({ next, ...ctx }) => {
				const result = await options.serverFn?.(ctx);
				return next({
					...ctx,
					result
				});
			}
		}
	};
}
var createMiddleware = (options, __opts) => {
	const resolvedOptions = {
		type: "request",
		...__opts || options
	};
	const setValidator = (validator) => {
		return createMiddleware({}, Object.assign(resolvedOptions, {
			validator,
			inputValidator: validator
		}));
	};
	return {
		options: resolvedOptions,
		middleware: (middleware) => {
			return createMiddleware({}, Object.assign(resolvedOptions, { middleware }));
		},
		validator: setValidator,
		inputValidator: setValidator,
		client: (client) => {
			return createMiddleware({}, Object.assign(resolvedOptions, { client }));
		},
		server: (server) => {
			return createMiddleware({}, Object.assign(resolvedOptions, { server }));
		}
	};
};
var innerCreateCsrfMiddleware = (opts = {}) => {
	return createMiddleware().server(async (ctx) => {
		const csrfCtx = ctx;
		if (opts.filter && !await opts.filter(csrfCtx)) return ctx.next();
		if (await isCsrfRequestAllowed(opts, csrfCtx)) return ctx.next();
		return getFailureResponse(opts, csrfCtx);
	});
};
var createCsrfMiddleware = innerCreateCsrfMiddleware;
async function isCsrfRequestAllowed(opts, ctx) {
	const result = await getCsrfRequestValidationResult(opts, ctx);
	return result === true || result === void 0 && opts.allowRequestsWithoutOriginCheck === true;
}
async function getCsrfRequestValidationResult(opts, ctx) {
	const fetchSite = ctx.request.headers.get("Sec-Fetch-Site");
	if (fetchSite !== null) return matchValue(opts.secFetchSite ?? "same-origin", fetchSite, ctx);
	const origin = ctx.request.headers.get("Origin");
	if (origin !== null) {
		if (opts.origin) return matchValue(opts.origin, origin, ctx);
		return origin === new URL(ctx.request.url).origin;
	}
	const referer = ctx.request.headers.get("Referer");
	if (referer === null || opts.referer === false) return;
	if (typeof opts.referer === "function") return opts.referer(referer, ctx);
	if (opts.origin) {
		const refererOrigin = getOriginFromUrl(referer);
		return refererOrigin !== void 0 && matchValue(opts.origin, refererOrigin, ctx);
	}
	return isRefererSameOrigin(referer, new URL(ctx.request.url).origin);
}
async function matchValue(matcher, value, ctx) {
	if (typeof matcher === "function") return matcher(value, ctx);
	if (Array.isArray(matcher)) return matcher.includes(value);
	return value === matcher;
}
function getOriginFromUrl(url) {
	try {
		return new URL(url).origin;
	} catch {
		return;
	}
}
function isRefererSameOrigin(referer, requestOrigin) {
	if (referer === requestOrigin) return true;
	if (!referer.startsWith(requestOrigin)) return false;
	if (referer.length === requestOrigin.length) return true;
	const code = referer.charCodeAt(requestOrigin.length);
	return code === 47 || code === 63 || code === 35;
}
async function getFailureResponse(opts, ctx) {
	if (typeof opts.failureResponse === "function") return opts.failureResponse(ctx);
	return opts.failureResponse?.clone() ?? new Response("Forbidden", { status: 403 });
}
function dedupeSerializationAdapters(deduped, serializationAdapters) {
	for (let i = 0, len = serializationAdapters.length; i < len; i++) {
		const current = serializationAdapters[i];
		if (!deduped.has(current)) {
			deduped.add(current);
			if (current.extends) dedupeSerializationAdapters(deduped, current.extends);
		}
	}
}
var createStart = (getOptions) => {
	return {
		getOptions: async () => {
			const options = await getOptions();
			if (options.serializationAdapters) {
				const deduped = /* @__PURE__ */ new Set();
				dedupeSerializationAdapters(deduped, options.serializationAdapters);
				options.serializationAdapters = Array.from(deduped);
			}
			return options;
		},
		createMiddleware
	};
};
function getDefaultSerovalPlugins() {
	return [...(getStartOptions()?.serializationAdapters)?.map(makeSerovalPlugin) ?? [], ...defaultSerovalPlugins];
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
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
var createPaymentIntent = createServerFn({ method: "POST" }).validator(PaymentIntentSchema).handler(createSsrRpc("2fcd2ca4f42d824330f952304cff9375335150845fcced022e07331b066607e1"));
var createPayPalOrder = createServerFn({ method: "POST" }).validator(PayPalCreateSchema).handler(createSsrRpc("65a328596f783a810efebd02b829f5fcd65117faee849ada160524ec626bd86d"));
var capturePayPalOrder = createServerFn({ method: "POST" }).validator(objectType({ orderId: stringType().min(1) })).handler(createSsrRpc("b98beab47c7da24e45a5aa76901b6c9c14a44ce8252e510ed37392c6daf56e3b"));
createServerFn({ method: "POST" }).validator(StripeCheckoutSchema).handler(createSsrRpc("59837370dca5e7aeec2f5b35a2516890ce8beb69f4aa55f11181763b71fac69e"));
var createOrder = createServerFn({ method: "POST" }).validator(CreateOrderSchema).handler(createSsrRpc("099e313e1b893a73975c0f2555ec6d530bbf2dcb64697208b8b578d47f06926a"));
var createOrderFromPayPal = createServerFn({ method: "POST" }).validator(PayPalCaptureSchema).handler(createSsrRpc("172868133c2a3ab7d4f0f1f072f5e5d7403861c4b49e49331f925fbf957c777b"));
var updatePaymentIntent = createServerFn({ method: "POST" }).validator(UpdatePaymentIntentSchema).handler(createSsrRpc("522572d6cc52f832d5182047f6b34fe4843366bc87004897c5b463fb3127ad3c"));
function getStripePublishableKey() {
	if (typeof import.meta !== "undefined" && "pk_test_51ToxtVDQ13PfPOmZNFk4L8bDSPXMJeN5jjtAgM83UoqGYL3t4IoQGrdb1VnZAZPT1ol0WMj0vztkFBVqlr1AEiZG00qEbnOFwm") return "pk_test_51ToxtVDQ13PfPOmZNFk4L8bDSPXMJeN5jjtAgM83UoqGYL3t4IoQGrdb1VnZAZPT1ol0WMj0vztkFBVqlr1AEiZG00qEbnOFwm";
	return "";
}
var getPayPalClientId = createServerFn({ method: "GET" }).handler(createSsrRpc("4e67e51eb1c5277923ccf0a66d67553ad9a097b1002a4733d19ac43561fdedeb"));
function formatAddress(address) {
	if (!address) return "";
	if (typeof address === "string") try {
		const parsed = JSON.parse(address);
		if (parsed && typeof parsed === "object") return formatAddress(parsed);
	} catch {
		return address.trim();
	}
	const addr = address;
	const name = [(addr.firstName || addr.first_name || "").trim(), (addr.lastName || addr.last_name || "").trim()].filter(Boolean).join(" ") || (addr.name || "").trim();
	const line1 = (addr.line1 || addr.address1 || addr.address || "").trim();
	const line2 = (addr.line2 || addr.address2 || "").trim();
	const city = (addr.city || "").trim();
	const state = (addr.state || "").trim();
	const postalCode = (addr.postalCode || addr.postal_code || addr.zip || "").trim();
	let cityStateZip = "";
	if (city && state && postalCode) cityStateZip = `${city}, ${state} ${postalCode}`;
	else if (city && postalCode) cityStateZip = `${city}, ${postalCode}`;
	else cityStateZip = [
		city,
		state,
		postalCode
	].filter(Boolean).join(", ");
	const country = (addr.country || "").trim();
	const phone = (addr.phone || "").trim();
	const phoneStr = phone ? `Phone: ${phone}` : "";
	return [
		name,
		line1,
		line2,
		cityStateZip,
		country,
		phoneStr
	].filter(Boolean).join("\n");
}
var DownloadInvoiceSchema = objectType({
	invoiceId: stringType().min(1),
	accessToken: stringType().min(1)
});
var getInvoicePdfUrl = createServerFn({ method: "POST" }).validator(DownloadInvoiceSchema).handler(createSsrRpc("94fa8344331b3e50e641d337a93da74bd7dbaebf49f7d1ca0bc6ea68428c0028"));
function formatDate(dateStr) {
	return new Date(dateStr).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric"
	});
}
async function generateInvoicePdf(data) {
	const pdfDoc = await PDFDocument.create();
	const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
	const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
	const page = pdfDoc.addPage([612, 792]);
	const { width, height } = page.getSize();
	const GOLD = rgb(.788, .663, .431);
	const DARK = rgb(.102, .102, .102);
	const MUTED = rgb(.4, .4, .4);
	const BORDER = rgb(.898, .898, .898);
	const WHITE = rgb(1, 1, 1);
	let y = height - 60;
	page.drawText("ANORA", {
		x: 50,
		y,
		size: 28,
		font: bold,
		color: GOLD
	});
	page.drawText("ELEGANCE ATELIER", {
		x: 50,
		y: y - 20,
		size: 10,
		font,
		color: MUTED
	});
	page.drawText("INVOICE", {
		x: width - 150,
		y,
		size: 24,
		font: bold,
		color: DARK
	});
	page.drawText(`#${data.invoiceNumber}`, {
		x: width - 150,
		y: y - 22,
		size: 10,
		font,
		color: MUTED
	});
	y -= 60;
	page.drawLine({
		start: {
			x: 50,
			y
		},
		end: {
			x: width - 50,
			y
		},
		thickness: 1,
		color: BORDER
	});
	y -= 20;
	const details = [
		{
			label: "Invoice Date",
			value: formatDate(data.createdAt)
		},
		{
			label: "Order Number",
			value: data.orderNumber
		},
		{
			label: "Payment Method",
			value: data.paymentMethod
		},
		{
			label: "Payment Status",
			value: data.paymentStatus
		}
	];
	for (const d of details) {
		page.drawText(d.label, {
			x: 50,
			y,
			size: 9,
			font,
			color: MUTED
		});
		page.drawText(d.value, {
			x: 180,
			y,
			size: 9,
			font: bold,
			color: DARK
		});
		y -= 16;
	}
	y -= 10;
	page.drawText("Bill To:", {
		x: 50,
		y,
		size: 9,
		font: bold,
		color: DARK
	});
	y -= 14;
	page.drawText(data.billingAddress, {
		x: 50,
		y,
		size: 9,
		font,
		color: DARK
	});
	y -= 40;
	page.drawText("Ship To:", {
		x: width / 2 + 25,
		y,
		size: 9,
		font: bold,
		color: DARK
	});
	y -= 14;
	page.drawText(data.shippingAddress, {
		x: width / 2 + 25,
		y,
		size: 9,
		font,
		color: DARK
	});
	y -= 40;
	const tableTop = y;
	const cols = [
		{
			x: 50,
			w: 220
		},
		{
			x: 270,
			w: 50
		},
		{
			x: 340,
			w: 60
		},
		{
			x: 420,
			w: 80
		},
		{
			x: 510,
			w: 70
		}
	];
	const headers = [
		"Item",
		"Size",
		"Qty",
		"Unit Price",
		"Total"
	];
	page.drawRectangle({
		x: 50,
		y: tableTop - 18,
		width: width - 100,
		height: 18,
		color: GOLD
	});
	headers.forEach((h, i) => {
		page.drawText(h, {
			x: cols[i].x + 4,
			y: tableTop - 14,
			size: 9,
			font: bold,
			color: WHITE
		});
	});
	y = tableTop - 30;
	for (const item of data.items) {
		page.drawText(item.name, {
			x: cols[0].x + 4,
			y,
			size: 9,
			font,
			color: DARK
		});
		page.drawText(item.size || "-", {
			x: cols[1].x + 4,
			y,
			size: 9,
			font,
			color: DARK
		});
		page.drawText(String(item.quantity), {
			x: cols[2].x + 4,
			y,
			size: 9,
			font,
			color: DARK
		});
		page.drawText(`$${item.unitPrice.toFixed(2)}`, {
			x: cols[3].x + 4,
			y,
			size: 9,
			font,
			color: DARK
		});
		page.drawText(`$${item.totalPrice.toFixed(2)}`, {
			x: cols[4].x + 4,
			y,
			size: 9,
			font: bold,
			color: DARK
		});
		y -= 20;
	}
	y -= 10;
	const totals = [
		{
			label: "Subtotal",
			value: data.subtotal
		},
		{
			label: "Shipping",
			value: data.shipping
		},
		{
			label: "Tax",
			value: data.tax
		}
	];
	for (const t of totals) {
		page.drawText(t.label, {
			x: 420,
			y,
			size: 9,
			font,
			color: MUTED
		});
		page.drawText(`$${t.value.toFixed(2)}`, {
			x: 510,
			y,
			size: 9,
			font,
			color: DARK
		});
		y -= 18;
	}
	page.drawLine({
		start: {
			x: 420,
			y
		},
		end: {
			x: width - 50,
			y
		},
		thickness: 1,
		color: DARK
	});
	y -= 18;
	page.drawText("Total", {
		x: 420,
		y,
		size: 11,
		font: bold,
		color: DARK
	});
	page.drawText(`$${data.total.toFixed(2)}`, {
		x: 510,
		y,
		size: 11,
		font: bold,
		color: GOLD
	});
	const footerY = 50;
	page.drawLine({
		start: {
			x: 50,
			y: 60
		},
		end: {
			x: width - 50,
			y: 60
		},
		thickness: 1,
		color: BORDER
	});
	page.drawText("ANORA Elegance Atelier", {
		x: 50,
		y: footerY - 6,
		size: 8,
		font,
		color: MUTED
	});
	page.drawText(`Invoice #${data.invoiceNumber}`, {
		x: width - 150,
		y: footerY - 6,
		size: 8,
		font,
		color: MUTED
	});
	return pdfDoc.save();
}
var InvoiceService = class {
	supabase;
	storage;
	constructor(supabase, storage) {
		this.supabase = supabase;
		this.storage = storage;
	}
	async create(data) {
		const invoiceId = crypto$1.randomUUID();
		const { error } = await this.supabase.from("invoices").insert({
			id: invoiceId,
			invoice_number: data.invoiceNumber,
			order_id: data.orderId,
			customer_name: data.customerName,
			customer_email: data.customerEmail,
			subtotal: data.subtotal,
			total_amount: data.total,
			status: "paid",
			issued_at: (/* @__PURE__ */ new Date()).toISOString()
		});
		if (error) throw error;
		const items = data.items.map((item) => ({
			invoice_id: invoiceId,
			product_name: item.name,
			quantity: item.quantity,
			unit_price: item.unitPrice,
			total_price: item.totalPrice
		}));
		if (items.length > 0) {
			const { error: itemsError } = await this.supabase.from("invoice_items").insert(items);
			if (itemsError) throw itemsError;
		}
		logger.info("Invoice created", {
			invoiceId,
			invoiceNumber: data.invoiceNumber
		});
		return invoiceId;
	}
	async generatePdf(data) {
		return generateInvoicePdf(data);
	}
	async uploadPdf(invoiceNumber, pdfBytes) {
		await this.storage.ensureBucket();
		const path = `${invoiceNumber}.pdf`;
		await this.storage.upload(path, pdfBytes, "application/pdf");
		await this.supabase.from("invoices").update({ pdf_path: path }).eq("invoice_number", invoiceNumber);
		logger.info("Invoice PDF uploaded", {
			invoiceNumber,
			path
		});
		return path;
	}
	async getPdfUrl(invoiceId) {
		const { data: invoice, error } = await this.supabase.from("invoices").select("invoice_number, pdf_path").eq("id", invoiceId).single();
		if (error || !invoice) throw new NotFoundError("Invoice not found");
		if (invoice.pdf_path) return this.storage.signedUrl(invoice.pdf_path);
		const invoiceData = await this.loadInvoiceData(invoiceId);
		const pdfBytes = await this.generatePdf(invoiceData);
		await this.uploadPdf(invoice.invoice_number, pdfBytes);
		return this.storage.signedUrl(`${invoice.invoice_number}.pdf`);
	}
	async generateAndUploadForInvoice(invoiceId) {
		const invoiceData = await this.loadInvoiceData(invoiceId);
		const pdfBytes = await this.generatePdf(invoiceData);
		return this.uploadPdf(invoiceData.invoiceNumber, pdfBytes);
	}
	async loadInvoiceData(invoiceId) {
		const { data: invoice, error } = await this.supabase.from("invoices").select("*, orders(*)").eq("id", invoiceId).single();
		if (error || !invoice) throw new NotFoundError("Invoice not found");
		const order = invoice.orders;
		const { data: items } = await this.supabase.from("invoice_items").select("*").eq("invoice_id", invoiceId);
		return {
			invoiceNumber: invoice.invoice_number,
			orderNumber: order.order_number,
			orderId: order.id,
			createdAt: invoice.issued_at || order.created_at,
			customerName: invoice.customer_name,
			customerEmail: invoice.customer_email,
			currency: "usd",
			subtotal: Number(invoice.subtotal),
			shipping: 0,
			tax: 0,
			total: Number(invoice.total_amount),
			paymentStatus: invoice.status,
			paymentMethod: order.payment_method || "card",
			shippingAddress: formatAddress(order.shipping_address),
			billingAddress: formatAddress(order.billing_address),
			items: (items || []).map((i) => ({
				name: i.product_name,
				quantity: i.quantity,
				unitPrice: Number(i.unit_price),
				totalPrice: Number(i.total_price)
			}))
		};
	}
};
var EmailService = class {
	resend;
	ready = false;
	constructor() {
		if (env.resendApiKey) {
			this.resend = new Resend(env.resendApiKey);
			this.ready = true;
		} else logger.warn("Resend API key not configured — emails disabled");
	}
	isReady() {
		return this.ready;
	}
	getFrom() {
		return env.fromEmail;
	}
	getAdminEmail() {
		return env.adminEmail;
	}
	async logSend(log) {
		try {
			const { error } = await supabaseAdmin.from("email_logs").insert({
				order_id: log.order_id,
				email_type: log.email_type,
				recipient: log.recipient,
				status: log.status,
				subject: log.subject,
				error_message: log.error_message,
				sent_at: (/* @__PURE__ */ new Date()).toISOString()
			});
			if (error) logger.warn("Failed to log email", { error: error.message });
		} catch (err) {
			logger.warn("Failed to log email", { error: String(err) });
		}
	}
	async checkDuplicate(orderId, emailType) {
		if (!orderId) return false;
		const { count, error } = await supabaseAdmin.from("email_logs").select("id", {
			count: "exact",
			head: true
		}).eq("order_id", orderId).eq("email_type", emailType).eq("status", "sent");
		if (error) return false;
		return (count ?? 0) > 0;
	}
	async send(options) {
		if (!this.ready) {
			logger.warn("Email not sent — Resend not configured", {
				to: options.to,
				subject: options.subject
			});
			return;
		}
		const payload = {
			from: options.from || this.getFrom(),
			to: options.to,
			subject: options.subject,
			html: options.html,
			headers: options.headers
		};
		if (options.attachments && options.attachments.length > 0) payload.attachments = options.attachments.map((a) => ({
			filename: a.filename,
			content: Buffer.isBuffer(a.content) ? a.content : Buffer.from(a.content)
		}));
		try {
			const { error } = await this.resend.emails.send(payload);
			if (error) throw new EmailError(error.message);
			logger.info("Email sent", {
				to: options.to,
				subject: options.subject
			});
		} catch (err) {
			throw new EmailError(`Failed to send email: ${err instanceof Error ? err.message : String(err)}`, err);
		}
	}
	async sendWithLogging(options) {
		const logEntry = {
			order_id: options.orderId,
			email_type: options.emailType,
			recipient: options.to,
			status: "failed",
			subject: options.subject
		};
		if (await this.checkDuplicate(options.orderId, options.emailType)) {
			logger.info("Skipping duplicate email", {
				orderId: options.orderId,
				emailType: options.emailType
			});
			return;
		}
		try {
			await this.send(options);
			logEntry.status = "sent";
		} catch (err) {
			logEntry.error_message = err instanceof Error ? err.message : String(err);
			throw err;
		} finally {
			await this.logSend(logEntry);
		}
	}
	async sendThankYou(to, orderNumber, html, orderId) {
		return this.sendWithLogging({
			to,
			subject: `Order Confirmed — ${orderNumber}`,
			html,
			emailType: "thank_you",
			orderId
		});
	}
	async sendInvoice(to, invoiceNumber, html, pdfAttachment, orderId) {
		return this.sendWithLogging({
			to,
			subject: `Invoice ${invoiceNumber}`,
			html,
			attachments: pdfAttachment ? [pdfAttachment] : void 0,
			emailType: "invoice",
			orderId
		});
	}
	async sendAdminNotification(subject, html, orderId) {
		return this.sendWithLogging({
			to: this.getAdminEmail(),
			subject,
			html,
			emailType: "admin_notification",
			orderId
		});
	}
};
var supabaseAdmin;
function initEmailService(supabase) {
	supabaseAdmin = supabase;
}
var JOB_TYPES = [
	"generate_invoice",
	"generate_invoice_pdf",
	"send_thank_you_email",
	"send_invoice_email",
	"send_admin_email",
	"analytics_events",
	"application_logs"
];
var JOB_SEQUENCE = {
	generate_invoice: 1,
	generate_invoice_pdf: 2,
	send_thank_you_email: 3,
	send_invoice_email: 4,
	send_admin_email: 5,
	analytics_events: 6,
	application_logs: 7
};
var QueueService = class {
	supabase;
	handlers = /* @__PURE__ */ new Map();
	running = false;
	pollTimer = null;
	retryTimer = null;
	constructor(supabase) {
		this.supabase = supabase;
	}
	register(jobType, handler) {
		this.handlers.set(jobType, handler);
	}
	ensureHandler(jobType) {
		const handler = this.handlers.get(jobType);
		if (!handler) throw new QueueError(`No handler registered for job type: ${jobType}`);
		return handler;
	}
	async enqueue(orderId, payload) {
		const jobs = JOB_TYPES.map((jobType) => ({
			order_id: orderId,
			job_type: jobType,
			sequence: JOB_SEQUENCE[jobType],
			status: "pending",
			payload,
			max_retries: config.queue.maxRetries
		}));
		const payloadSize = JSON.stringify(payload).length;
		logger.info("Enqueue payload details", {
			orderId,
			payloadKeys: Object.keys(payload),
			payloadSize,
			hasCustomerEmail: typeof payload.customerEmail === "string" && payload.customerEmail.length > 0,
			hasThankYouHtml: typeof payload.thankYouHtml === "string" && payload.thankYouHtml.length > 0,
			hasInvoiceEmailHtml: typeof payload.invoiceEmailHtml === "string" && payload.invoiceEmailHtml.length > 0,
			hasAdminSubject: typeof payload.adminSubject === "string" && payload.adminSubject.length > 0,
			hasAdminHtml: typeof payload.adminHtml === "string" && payload.adminHtml.length > 0
		});
		const { error } = await this.supabase.from("background_jobs").insert(jobs);
		if (error) throw new QueueError(`Failed to enqueue jobs: ${error.message}`, error);
		logger.info("Jobs enqueued", {
			orderId,
			count: jobs.length
		});
	}
	async processPending(limit = config.queue.batchSize) {
		const { data: jobs, error } = await this.supabase.rpc("get_pending_jobs", { p_limit: limit });
		if (error) {
			logger.error("Failed to fetch pending jobs", { error: error.message });
			return 0;
		}
		if (!jobs || jobs.length === 0) return 0;
		let processed = 0;
		for (const job of jobs) if (await this.execute(job)) processed++;
		return processed;
	}
	async execute(job) {
		const jobId = job.id;
		const { data: claimed, error: claimError } = await this.supabase.from("background_jobs").update({ status: "processing" }).eq("id", jobId).eq("status", "pending").select().single();
		if (claimError || !claimed) return false;
		logger.info("Processing job", {
			jobId,
			jobType: job.job_type,
			orderId: job.order_id
		});
		logger.info("Claimed payload diagnostics", {
			jobId,
			jobType: job.job_type,
			claimedPayloadType: typeof claimed.payload,
			claimedPayloadIsNull: claimed.payload === null,
			claimedPayloadKeys: typeof claimed.payload === "object" && claimed.payload !== null ? Object.keys(claimed.payload) : [],
			hasCustomerEmail: typeof claimed.payload.customerEmail === "string",
			hasThankYouHtml: typeof claimed.payload.thankYouHtml === "string",
			hasInvoiceEmailHtml: typeof claimed.payload.invoiceEmailHtml === "string",
			hasAdminSubject: typeof claimed.payload.adminSubject === "string",
			hasAdminHtml: typeof claimed.payload.adminHtml === "string"
		});
		try {
			await this.ensureHandler(job.job_type)(claimed);
			await this.supabase.from("background_jobs").update({
				status: "completed",
				completed_at: (/* @__PURE__ */ new Date()).toISOString()
			}).eq("id", jobId);
			logger.info("Job completed", {
				jobId,
				jobType: job.job_type
			});
			return true;
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : String(err);
			const newRetryCount = (job.retry_count || 0) + 1;
			const maxRetries = job.max_retries || config.queue.maxRetries;
			logger.error("Job failed", {
				jobId,
				jobType: job.job_type,
				retryCount: newRetryCount,
				maxRetries,
				error: errorMessage
			});
			if (newRetryCount >= maxRetries) await this.moveToDlq(jobId, errorMessage);
			else {
				const delaySec = config.queue.retryDelaysSec[Math.min(newRetryCount - 1, config.queue.retryDelaysSec.length - 1)] || config.queue.retryDelaysSec[config.queue.retryDelaysSec.length - 1];
				const nextRetryAt = new Date(Date.now() + delaySec * 1e3).toISOString();
				await this.supabase.from("background_jobs").update({
					status: "failed",
					retry_count: newRetryCount,
					next_retry_at: nextRetryAt,
					error_message: errorMessage
				}).eq("id", jobId);
			}
			return false;
		}
	}
	async moveToDlq(jobId, errorMessage) {
		try {
			await this.supabase.rpc("move_to_dead_letter", {
				p_job_id: jobId,
				p_error: errorMessage
			});
		} catch {
			await this.supabase.from("background_jobs").update({
				status: "dlq",
				error_message: errorMessage
			}).eq("id", jobId);
		}
		logger.warn("Job moved to DLQ", {
			jobId,
			error: errorMessage
		});
	}
	async retryFailed(limit = config.queue.batchSize) {
		const { data: jobs, error } = await this.supabase.rpc("get_retryable_jobs", { p_limit: limit });
		if (error) {
			logger.error("Failed to fetch retryable jobs", { error: error.message });
			return 0;
		}
		if (!jobs || jobs.length === 0) return 0;
		let retried = 0;
		for (const job of jobs) if (await this.execute(job)) retried++;
		return retried;
	}
	start() {
		if (this.running) return;
		this.running = true;
		logger.info("Queue service starting", {
			pollIntervalMs: config.queue.pollIntervalMs,
			retryIntervalMs: config.queue.retryIntervalMs
		});
		this.tickPoll();
		this.tickRetry();
		this.pollTimer = setInterval(() => this.tickPoll(), config.queue.pollIntervalMs);
		this.retryTimer = setInterval(() => this.tickRetry(), config.queue.retryIntervalMs);
	}
	stop() {
		this.running = false;
		if (this.pollTimer) clearInterval(this.pollTimer);
		if (this.retryTimer) clearInterval(this.retryTimer);
		this.pollTimer = null;
		this.retryTimer = null;
		logger.info("Queue service stopped");
	}
	async tickPoll() {
		try {
			await this.processPending();
		} catch (err) {
			logger.error("Queue poll tick failed", { error: String(err) });
		}
	}
	async tickRetry() {
		try {
			await this.retryFailed();
		} catch (err) {
			logger.error("Queue retry tick failed", { error: String(err) });
		}
	}
	isRunning() {
		return this.running;
	}
};
var container_exports = /* @__PURE__ */ __exportAll$1({
	ServerContainer: () => ServerContainer,
	getContainer: () => getContainer,
	initContainer: () => initContainer
});
var ServerContainer = class {
	_supabase = null;
	_stripe = null;
	_storage = null;
	_invoice = null;
	_email = null;
	_queue = null;
	_initialized = false;
	async initialize() {
		logger.info("Server container initializing");
		env.validate();
		logger.info("Environment validated");
		this._supabase = createClient(env.supabaseUrl, env.supabaseServiceKey, { auth: {
			autoRefreshToken: false,
			persistSession: false
		} });
		logger.info("Supabase admin client created");
		this._stripe = new Stripe(env.stripeSecretKey, {
			apiVersion: config.stripe.apiVersion,
			typescript: true
		});
		logger.info("Stripe client created");
		this._storage = new StorageService(this.supabase);
		await this._storage.ensureBucket();
		logger.info("Storage service initialized");
		initEmailService(this.supabase);
		this._email = new EmailService();
		logger.info("Email service initialized", { ready: this._email.isReady() });
		this._invoice = new InvoiceService(this.supabase, this.storage);
		this._queue = new QueueService(this.supabase);
		this.registerJobHandlers();
		logger.info("Queue service initialized");
		this._initialized = true;
		logger.info("Server container initialized successfully");
	}
	registerJobHandlers() {
		if (!this._queue) return;
		this._queue.register("generate_invoice", async (job) => {
			logger.info("Job: generate_invoice", { orderId: job.order_id });
		});
		this._queue.register("generate_invoice_pdf", async (job) => {
			const payload = job.payload;
			if (!payload.invoiceId) {
				logger.warn("Missing invoiceId in job payload — skipping PDF generation", {
					jobId: job.id,
					orderId: job.order_id
				});
				return;
			}
			await this.invoice.generateAndUploadForInvoice(payload.invoiceId);
		});
		this._queue.register("send_thank_you_email", async (job) => {
			const payload = job.payload;
			if (!payload.customerEmail || !payload.thankYouHtml) {
				logger.error("Missing email data in job payload", {
					jobId: job.id,
					orderId: job.order_id,
					payloadType: typeof job.payload,
					payloadIsNull: job.payload === null,
					payloadKeys: typeof job.payload === "object" && job.payload !== null ? Object.keys(job.payload) : [],
					customerEmailType: typeof payload.customerEmail,
					customerEmailValue: payload.customerEmail ? payload.customerEmail.substring(0, 50) : "EMPTY",
					thankYouHtmlType: typeof payload.thankYouHtml,
					thankYouHtmlLength: payload.thankYouHtml?.length ?? 0
				});
				throw new Error("Missing email data in job payload");
			}
			await this.email.sendThankYou(payload.customerEmail, payload.orderNumber || "", payload.thankYouHtml, job.order_id);
		});
		this._queue.register("send_invoice_email", async (job) => {
			const payload = job.payload;
			if (!payload.customerEmail || !payload.invoiceEmailHtml) {
				logger.error("Missing invoice email data in job payload", {
					jobId: job.id,
					orderId: job.order_id,
					payloadType: typeof job.payload,
					payloadIsNull: job.payload === null,
					payloadKeys: typeof job.payload === "object" && job.payload !== null ? Object.keys(job.payload) : [],
					customerEmailType: typeof payload.customerEmail,
					customerEmailValue: payload.customerEmail ? payload.customerEmail.substring(0, 50) : "EMPTY",
					invoiceEmailHtmlType: typeof payload.invoiceEmailHtml,
					invoiceEmailHtmlLength: payload.invoiceEmailHtml?.length ?? 0
				});
				throw new Error("Missing invoice email data in job payload");
			}
			let pdfAttachment;
			try {
				const { data: invoiceRec } = await this.supabase.from("invoices").select("pdf_path").eq("invoice_number", payload.invoiceNumber).single();
				if (invoiceRec?.pdf_path) {
					const pdfResult = await this.storage.download(invoiceRec.pdf_path);
					pdfAttachment = {
						filename: `${payload.invoiceNumber}.pdf`,
						content: Buffer.from(pdfResult.data)
					};
				}
			} catch {}
			await this.email.sendInvoice(payload.customerEmail, payload.invoiceNumber || "", payload.invoiceEmailHtml, pdfAttachment, job.order_id);
		});
		this._queue.register("send_admin_email", async (job) => {
			const payload = job.payload;
			if (!payload.adminSubject || !payload.adminHtml) {
				logger.error("Missing admin email data in job payload", {
					jobId: job.id,
					orderId: job.order_id,
					payloadType: typeof job.payload,
					payloadIsNull: job.payload === null,
					payloadKeys: typeof job.payload === "object" && job.payload !== null ? Object.keys(job.payload) : [],
					adminSubjectType: typeof payload.adminSubject,
					adminSubjectValue: payload.adminSubject ? payload.adminSubject.substring(0, 100) : "EMPTY",
					adminHtmlType: typeof payload.adminHtml,
					adminHtmlLength: payload.adminHtml?.length ?? 0
				});
				throw new Error("Missing admin email data in job payload");
			}
			await this.email.sendAdminNotification(payload.adminSubject, payload.adminHtml, job.order_id);
		});
		this._queue.register("analytics_events", async (job) => {
			await this.supabase.from("audit_logs").insert({
				event_type: "purchase",
				entity_type: "order",
				entity_id: job.order_id,
				metadata: job.payload,
				created_at: (/* @__PURE__ */ new Date()).toISOString()
			});
		});
		this._queue.register("application_logs", async (job) => {
			await this.supabase.from("audit_logs").insert({
				event_type: "order_processing",
				entity_type: "order",
				entity_id: job.order_id,
				metadata: {
					...job.payload,
					job_completed_at: (/* @__PURE__ */ new Date()).toISOString()
				},
				created_at: (/* @__PURE__ */ new Date()).toISOString()
			});
		});
	}
	get supabase() {
		if (!this._supabase) throw new Error("ServerContainer not initialized");
		return this._supabase;
	}
	get stripe() {
		if (!this._stripe) throw new Error("ServerContainer not initialized");
		return this._stripe;
	}
	get storage() {
		if (!this._storage) throw new Error("ServerContainer not initialized");
		return this._storage;
	}
	get invoice() {
		if (!this._invoice) throw new Error("ServerContainer not initialized");
		return this._invoice;
	}
	get email() {
		if (!this._email) throw new Error("ServerContainer not initialized");
		return this._email;
	}
	get queue() {
		if (!this._queue) throw new Error("ServerContainer not initialized");
		return this._queue;
	}
	get initialized() {
		return this._initialized;
	}
};
var _container = null;
function getContainer() {
	if (!_container) _container = new ServerContainer();
	return _container;
}
async function initContainer() {
	const container = getContainer();
	if (!container.initialized) await container.initialize();
	return container;
}
var serverEntryPromise;
async function getServerEntry() {
	if (!serverEntryPromise) serverEntryPromise = import("./server-Dqam62No.mjs").then((m) => m.default ?? m);
	return serverEntryPromise;
}
var initialized = false;
async function ensureServer() {
	if (initialized) return;
	initialized = true;
	await initContainer();
	logger.info("Server container initialized on first request");
	getContainer().queue.start();
	logger.info("Queue service started on first request");
}
async function flushPendingJobs() {
	try {
		if (!getContainer().initialized) return;
		await getContainer().queue.processPending(10);
		await getContainer().queue.retryFailed(10);
	} catch {}
}
async function normalizeCatastrophicSsrResponse(response) {
	if (response.status < 500) return response;
	if (!(response.headers.get("content-type") ?? "").includes("application/json")) return response;
	const body = await response.clone().text();
	if (!body.includes("\"unhandled\":true") || !body.includes("\"message\":\"HTTPError\"")) return response;
	console.error(consumeLastCapturedError() ?? /* @__PURE__ */ new Error(`h3 swallowed SSR error: ${body}`));
	return new Response(renderErrorPage(), {
		status: 500,
		headers: { "content-type": "text/html; charset=utf-8" }
	});
}
var server_default = { async fetch(request, env, ctx) {
	try {
		await ensureServer();
		const normalized = await normalizeCatastrophicSsrResponse(await (await getServerEntry()).fetch(request, env, ctx));
		flushPendingJobs();
		return normalized;
	} catch (error) {
		logger.error("SSR fetch handler failed", { error: String(error) });
		return new Response(renderErrorPage(), {
			status: 500,
			headers: { "content-type": "text/html; charset=utf-8" }
		});
	}
} };
//#endregion
export { safeObjectMerge as A, getPayPalClientId as C, logger as D, getStripePublishableKey as E, updatePaymentIntent as M, renderErrorPage as O, getInvoicePdfUrl as S, getStartContext as T, createStart as _, TSS_SERVER_FUNCTION as a, getContainer as b, capturePayPalOrder as c, createNullProtoObject as d, createOrder as f, createServerFn as g, createPaymentIntent as h, TSS_FORMDATA_CONTEXT as i, ssr_exports as j, runWithStartContext as k, createCsrfMiddleware as l, createPayPalOrder as m, PaymentError as n, X_TSS_RAW_RESPONSE as o, createOrderFromPayPal as p, TSS_CONTENT_TYPE_FRAMED_VERSIONED as r, X_TSS_SERIALIZED as s, FrameType as t, createMiddleware as u, flattenMiddlewares as v, getServerFnById as w, getDefaultSerovalPlugins as x, formatAddress as y };
