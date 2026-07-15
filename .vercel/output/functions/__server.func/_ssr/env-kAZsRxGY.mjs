import { r as __exportAll$1 } from "../_runtime.mjs";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
//#region node_modules/.nitro/vite/services/ssr/assets/env-kAZsRxGY.js
var env_kAZsRxGY_exports = /* @__PURE__ */ __exportAll$1({
	n: () => env_exports,
	r: () => __exportAll,
	t: () => env
});
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var env_exports = /* @__PURE__ */ __exportAll({ env: () => env });
var REQUIRED_VARS = [
	{
		key: "VITE_SUPABASE_URL",
		required: true
	},
	{
		key: "SUPABASE_SERVICE_ROLE_KEY",
		required: true
	},
	{
		key: "STRIPE_SECRET_KEY",
		required: true
	},
	{
		key: "VITE_STRIPE_PUBLISHABLE_KEY",
		required: true
	},
	{
		key: "RESEND_API_KEY",
		required: false
	},
	{
		key: "STRIPE_WEBHOOK_SECRET",
		required: false
	},
	{
		key: "PAYPAL_CLIENT_ID",
		required: false
	},
	{
		key: "PAYPAL_SECRET",
		required: false
	},
	{
		key: "PAYPAL_WEBHOOK_ID",
		required: false
	}
];
function loadDotEnv() {
	const __dirname = dirname(fileURLToPath(import.meta.url));
	const searchPaths = [
		resolve(__dirname, "..", "..", ".env"),
		resolve(__dirname, "..", "..", "..", ".env"),
		resolve(process.cwd(), ".env")
	];
	for (const envPath of searchPaths) if (existsSync(envPath)) {
		const content = readFileSync(envPath, "utf-8");
		const vars = {};
		for (const line of content.split("\n")) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("#")) continue;
			const eq = trimmed.indexOf("=");
			if (eq === -1) continue;
			const key = trimmed.slice(0, eq).trim();
			let val = trimmed.slice(eq + 1).trim();
			if (val.startsWith("\"") && val.endsWith("\"") || val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
			vars[key] = val;
		}
		return vars;
	}
	return {};
}
function readAll() {
	const dotenv = loadDotEnv();
	const result = {};
	const keys = new Set([...Object.keys(process.env), ...Object.keys(dotenv)]);
	for (const key of keys) {
		const val = process.env[key] || dotenv[key] || "";
		if (val) result[key] = val;
	}
	return result;
}
var env = class Environment {
	static _instance;
	_vars;
	_validated = false;
	constructor(vars) {
		this._vars = vars;
	}
	static load() {
		if (Environment._instance) return Environment._instance;
		Environment._instance = new Environment(readAll());
		return Environment._instance;
	}
	validate() {
		if (this._validated) return this;
		const missing = [];
		for (const v of REQUIRED_VARS) if (v.required && !this._vars[v.key]) missing.push(v.key);
		if (missing.length > 0) throw new Error(`Missing required environment variables: ${missing.join(", ")}. Check your .env file or environment configuration.`);
		this._validated = true;
		return this;
	}
	get(key) {
		return this._vars[key] || "";
	}
	getOrThrow(key) {
		const val = this._vars[key];
		if (!val) throw new Error(`Environment variable ${key} is not set`);
		return val;
	}
	has(key) {
		return !!this._vars[key];
	}
	get supabaseUrl() {
		return this.get("VITE_SUPABASE_URL") || this.get("SUPABASE_URL");
	}
	get supabaseServiceKey() {
		return this.get("SUPABASE_SERVICE_ROLE_KEY") || this.get("SUPABASE_SERVICE_KEY");
	}
	get stripeSecretKey() {
		return this.get("STRIPE_SECRET_KEY");
	}
	get stripePublishableKey() {
		return this.get("VITE_STRIPE_PUBLISHABLE_KEY");
	}
	get stripeWebhookSecret() {
		return this.get("STRIPE_WEBHOOK_SECRET");
	}
	get resendApiKey() {
		return this.get("RESEND_API_KEY");
	}
	get paypalClientId() {
		return this.get("PAYPAL_CLIENT_ID") || this.get("VITE_PAYPAL_CLIENT_ID");
	}
	get paypalSecret() {
		return this.get("PAYPAL_SECRET");
	}
	get paypalEnvironment() {
		return this.get("PAYPAL_ENVIRONMENT") || "sandbox";
	}
	get paypalWebhookId() {
		return this.get("PAYPAL_WEBHOOK_ID");
	}
	get fromEmail() {
		return this.get("FROM_EMAIL") || "orders@anora-elegance.com";
	}
	get adminEmail() {
		return this.get("ADMIN_EMAIL") || this.get("FROM_EMAIL") || "orders@anora-elegance.com";
	}
	get publicAppUrl() {
		return this.get("PUBLIC_APP_URL") || this.get("VITE_PUBLIC_APP_URL") || "http://localhost:3000";
	}
	toJSON() {
		return { ...this._vars };
	}
}.load();
//#endregion
export { env as n, env_kAZsRxGY_exports as r, __exportAll as t };
