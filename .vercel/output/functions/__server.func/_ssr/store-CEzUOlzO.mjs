import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useAuth, r as supabase } from "./auth-context-oFJLTVEi.mjs";
import { d as validateSizeStock, i as isStockOnlyError, l as validateQuantity, n as getAvailableStock, o as normalizeSizeStock, r as isSizeTracked, t as clampStock } from "./inventory-engine-C_1gi1aY.mjs";
import { l as products } from "./products-DA_AUvrV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-CEzUOlzO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function getVariantRecord(product, color) {
	return product.colorVariants?.find((variant) => variant.color === (color ?? product.color));
}
function getEffectiveSizeStock(product, variant) {
	return normalizeSizeStock(variant?.sizeStock ?? product.sizeStock);
}
function getVariantStock(product, color) {
	return clampStock(getVariantRecord(product, color)?.stock ?? product.stock);
}
function getProductAvailability(product, color) {
	const selectedVariant = getVariantRecord(product, color);
	const colorVariants = (product.colorVariants?.length ? product.colorVariants : [{
		color: product.color,
		images: product.images,
		sizes: product.sizes,
		sizeStock: product.sizeStock,
		stock: product.stock,
		sku: product.sku
	}]).map((variant) => {
		const normalizedSizeStock = getEffectiveSizeStock(product, variant);
		const variantStock = clampStock(variant.stock ?? product.stock);
		const availableBySize = Object.values(normalizedSizeStock).some((quantity) => quantity > 0);
		const sizeTracked = isSizeTracked(normalizedSizeStock);
		const available = variantStock > 0 && (!sizeTracked || availableBySize);
		return {
			color: variant.color,
			sku: variant.sku ?? product.sku,
			stock: variantStock,
			isAvailable: available,
			lowStock: variantStock > 0 && variantStock <= 5,
			images: variant.images,
			sizes: variant.sizes ?? product.sizes,
			sizeStock: normalizedSizeStock
		};
	});
	const stock = getVariantStock(product, color);
	const sizeStock = getEffectiveSizeStock(product, selectedVariant);
	const sizeTracked = isSizeTracked(sizeStock);
	const sizeStocks = Object.values(sizeStock);
	const anySizeAvailable = !sizeTracked || sizeStocks.some((quantity) => quantity > 0);
	return {
		productId: product.id,
		slug: product.slug,
		category: product.category,
		sku: selectedVariant?.sku ?? product.sku,
		color: selectedVariant?.color ?? product.color,
		stock,
		isAvailable: stock > 0 && anySizeAvailable,
		lowStock: stock > 0 && stock <= 5,
		lowStockThreshold: 5,
		sizes: selectedVariant?.sizes ?? product.sizes,
		sizeStock,
		colorVariants,
		selectedVariant: selectedVariant ? {
			color: selectedVariant.color,
			sku: selectedVariant.sku ?? product.sku,
			stock,
			isAvailable: stock > 0 && anySizeAvailable,
			lowStock: stock > 0 && stock <= 5,
			images: selectedVariant.images,
			sizes: selectedVariant.sizes ?? product.sizes,
			sizeStock
		} : void 0
	};
}
function validateStockBeforeCheckout(product, line) {
	const availability = getProductAvailability(product, line.color);
	const { quantity: availableQuantity, error: stockError } = getAvailableStock({
		stock: availability.stock,
		size_stock: availability.sizeStock
	}, line.size);
	if (!availability.isAvailable) return {
		ok: false,
		reason: "Product is unavailable",
		code: "PRODUCT_OUT_OF_STOCK",
		availableQuantity,
		availability
	};
	const sizeError = validateSizeStock(line.size, availability.sizeStock, product.name);
	if (sizeError) return {
		ok: false,
		reason: sizeError.message,
		code: sizeError.code,
		availableQuantity,
		availability
	};
	const qtyError = validateQuantity(line.quantity, availableQuantity, product.name);
	if (qtyError) return {
		ok: false,
		reason: qtyError.message,
		code: qtyError.code,
		availableQuantity,
		availability
	};
	return {
		ok: true,
		availableQuantity,
		availability
	};
}
var CART_KEY = "anora.customer.cart.v2";
var WISH_KEY = "anora.customer.wishlist.v2";
var SESSION_KEY = "anora.customer.session.v1";
var cartItems = [];
var wishIds = [];
var currentUserId = null;
var hydrated = false;
var cartSnapshotCache = {
	items: [],
	count: 0,
	subtotal: 0,
	detailed: []
};
var wishlistSnapshotCache = { ids: [] };
var listeners = /* @__PURE__ */ new Set();
var productRegistry = /* @__PURE__ */ new Map();
var searchCache = /* @__PURE__ */ new Map();
for (const p of products) productRegistry.set(p.id, p);
function isBrowser() {
	return typeof window !== "undefined";
}
function readJson(key, fallback) {
	if (!isBrowser()) return fallback;
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : fallback;
	} catch {
		return fallback;
	}
}
function writeJson(key, value) {
	if (!isBrowser()) return;
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {}
}
function ensureSessionId() {
	if (!isBrowser()) return "server";
	const existing = sessionStorage.getItem(SESSION_KEY);
	if (existing) return existing;
	const next = crypto.randomUUID();
	sessionStorage.setItem(SESSION_KEY, next);
	return next;
}
function notify() {
	listeners.forEach((listener) => listener());
}
function initCrossTabSync() {
	if (!isBrowser()) return;
	window.addEventListener("storage", (e) => {
		if (e.key === CART_KEY || e.key === WISH_KEY) {
			hydrated = false;
			hydrate();
			notify();
		}
	});
}
function hydrate() {
	if (hydrated) return;
	hydrated = true;
	cartItems = readJson(CART_KEY, []);
	wishIds = readJson(WISH_KEY, []);
	ensureSessionId();
	rebuildSnapshots();
	const missingIds = cartItems.map((i) => i.productId).filter((id) => !productRegistry.has(id) && !products.find((p) => p.id === id));
	if (missingIds.length > 0) loadProductsByIds(missingIds).then(() => {
		rebuildSnapshots();
		notify();
	});
}
function persist() {
	writeJson(CART_KEY, cartItems);
	writeJson(WISH_KEY, wishIds);
}
function rebuildSnapshots() {
	const detailed = cartItems.flatMap((item) => {
		const product = getProduct(item.productId);
		if (!product) return [{
			item,
			product: {
				id: item.productId,
				slug: "",
				name: "",
				price: 0,
				category: "clothing",
				subcategory: "",
				description: "",
				color: "",
				sizes: [],
				sku: "",
				stock: 0,
				sizeStock: {},
				images: []
			},
			active: false,
			availableQuantity: 0
		}];
		const validation = validateStockBeforeCheckout(product, {
			productId: item.productId,
			variantId: item.variantId ?? void 0,
			size: item.size,
			quantity: item.quantity
		});
		return [{
			item,
			product,
			active: (!validation.ok && validation.code ? isStockOnlyError(validation.code) : false) ? item.quantity > 0 : validation.ok && item.quantity > 0,
			availableQuantity: validation.availableQuantity
		}];
	});
	const activeDetailed = detailed.filter((entry) => entry.active);
	cartSnapshotCache = {
		items: cartItems,
		count: activeDetailed.reduce((sum, entry) => sum + entry.item.quantity, 0),
		subtotal: activeDetailed.reduce((sum, entry) => {
			const price = entry.product?.price ?? 0;
			return sum + entry.item.quantity * price;
		}, 0),
		detailed
	};
	wishlistSnapshotCache = { ids: wishIds };
}
function registerProduct(product) {
	productRegistry.set(product.id, product);
}
function getProduct(productId) {
	return productRegistry.get(productId) ?? products.find((entry) => entry.id === productId);
}
var productsLoading = /* @__PURE__ */ new Set();
async function loadProductsByIds(ids) {
	const missing = ids.filter((id) => !productRegistry.has(id) && !products.find((p) => p.id === id) && !productsLoading.has(id));
	if (missing.length === 0) return;
	for (const id of missing) productsLoading.add(id);
	try {
		const { data: stockRows } = await supabase.from("products").select("id, stock, size_stock, sizes, sku, price, name, slug, color, description, material, fabric, is_new, is_best_seller, low_stock_threshold, category_id").in("id", missing);
		const { data: imageRows } = await supabase.from("product_images").select("product_id, image_url, sort_order").in("product_id", missing).order("sort_order");
		const imageMap = /* @__PURE__ */ new Map();
		if (imageRows) for (const row of imageRows) {
			const list = imageMap.get(row.product_id) ?? [];
			list.push(row.image_url);
			imageMap.set(row.product_id, list);
		}
		if (stockRows) for (const row of stockRows) {
			const stub = {
				id: row.id,
				slug: row.slug,
				name: row.name,
				price: row.price,
				category: "clothing",
				subcategory: "",
				description: row.description ?? "",
				fabric: row.fabric ?? void 0,
				material: row.material ?? void 0,
				color: row.color ?? "Ivory",
				sizes: row.sizes ?? [],
				sku: row.sku ?? "",
				stock: row.stock,
				sizeStock: row.size_stock ?? {},
				images: imageMap.get(row.id) ?? [],
				badge: row.is_new ? "New" : row.is_best_seller ? "Best Seller" : void 0
			};
			productRegistry.set(row.id, stub);
		}
	} catch {} finally {
		for (const id of missing) productsLoading.delete(id);
	}
}
function cartKey(productId, variantId, size) {
	return [
		productId,
		variantId ?? "",
		size ?? ""
	].join("|");
}
function clamp(qty) {
	return Math.max(0, Math.floor(Number(qty) || 0));
}
function computeCartItem(existing, productId, variantId, size, quantity) {
	return {
		id: existing?.id ?? crypto.randomUUID(),
		productId,
		variantId: variantId ?? null,
		size,
		quantity: clamp(quantity),
		source: currentUserId ? "server" : "local"
	};
}
function subscribe(listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}
function getCartSnapshot() {
	hydrate();
	return cartSnapshotCache;
}
function getWishlistSnapshot() {
	hydrate();
	return wishlistSnapshotCache;
}
function setCustomerUser(userId) {
	hydrate();
	currentUserId = userId;
}
function validateCartStock(items = cartItems) {
	hydrate();
	const validated = items.map((item) => {
		const product = getProduct(item.productId);
		if (!product) return {
			...item,
			quantity: 0
		};
		const validation = validateStockBeforeCheckout(product, {
			productId: item.productId,
			variantId: item.variantId ?? void 0,
			size: item.size,
			quantity: item.quantity
		});
		const isStockIssue = !validation.ok && validation.code ? isStockOnlyError(validation.code) : false;
		if (!validation.ok && !isStockIssue) return {
			...item,
			quantity: 0
		};
		const nextQty = validation.ok ? item.quantity : Math.min(item.quantity, validation.availableQuantity);
		return {
			...item,
			quantity: nextQty
		};
	});
	cartItems = validated;
	persist();
	rebuildSnapshots();
	notify();
	return validated;
}
async function addToCart(productId, variantId, size = "", qty = 1) {
	hydrate();
	const product = getProduct(productId);
	const validation = product ? validateStockBeforeCheckout(product, {
		productId,
		variantId: variantId ?? void 0,
		size,
		quantity: qty
	}) : null;
	if (validation && !validation.ok) {
		if (!(validation.code ? isStockOnlyError(validation.code) : false)) return;
	}
	const key = cartKey(productId, variantId, size);
	const existing = cartItems.find((item) => cartKey(item.productId, item.variantId, item.size) === key);
	const nextQuantity = clamp((existing?.quantity ?? 0) + qty);
	const next = computeCartItem(existing, productId, variantId, size, validation ? Math.min(nextQuantity, validation.availableQuantity) : nextQuantity);
	cartItems = existing ? cartItems.map((item) => item.id === existing.id ? next : item) : [...cartItems, next];
	persist();
	rebuildSnapshots();
	notify();
	if (currentUserId) await syncCartWithServer();
}
async function removeFromCart(itemId) {
	hydrate();
	cartItems = cartItems.filter((item) => item.id !== itemId);
	persist();
	rebuildSnapshots();
	notify();
	if (currentUserId) await syncCartWithServer();
}
async function clearCart() {
	hydrate();
	cartItems = [];
	persist();
	rebuildSnapshots();
	notify();
	if (currentUserId) await syncCartWithServer();
}
async function updateCartQuantity(itemId, qty) {
	hydrate();
	const nextQty = clamp(qty);
	cartItems = cartItems.map((item) => item.id === itemId ? {
		...item,
		quantity: nextQty
	} : item).filter((item) => item.quantity > 0);
	validateCartStock();
	if (currentUserId) await syncCartWithServer();
}
async function syncCartWithServer() {
	hydrate();
	if (!currentUserId) return cartItems;
	await loadProductsByIds(cartItems.map((i) => i.productId));
	cartItems = cartItems.map((item) => {
		const product = getProduct(item.productId);
		if (!product) return {
			...item,
			source: "server"
		};
		const validation = validateStockBeforeCheckout(product, {
			productId: item.productId,
			variantId: item.variantId ?? void 0,
			size: item.size,
			quantity: item.quantity
		});
		const isStockIssue = !validation.ok && validation.code ? isStockOnlyError(validation.code) : false;
		if (!validation.ok && !isStockIssue) return {
			...item,
			quantity: 0,
			source: "server"
		};
		return {
			...item,
			quantity: validation.ok ? item.quantity : Math.min(item.quantity, validation.availableQuantity),
			source: "server"
		};
	});
	const { error: deleteError } = await supabase.from("cart_items").delete().eq("user_id", currentUserId);
	if (deleteError) return cartItems;
	if (cartItems.length > 0) {
		const { data: inserted, error: insertError } = await supabase.from("cart_items").insert(cartItems.map((item) => ({
			user_id: currentUserId,
			product_id: item.productId,
			variant_id: item.variantId ?? null,
			size: item.size,
			quantity: item.quantity
		}))).select("id, product_id, variant_id, size");
		if (!insertError && inserted) {
			const idMap = /* @__PURE__ */ new Map();
			for (const row of inserted) {
				const key = cartKey(row.product_id, row.variant_id, row.size ?? "");
				idMap.set(key, row.id);
			}
			cartItems = cartItems.map((item) => ({
				...item,
				id: idMap.get(cartKey(item.productId, item.variantId, item.size)) ?? item.id,
				source: "server"
			}));
		}
	}
	persist();
	rebuildSnapshots();
	notify();
	return cartItems;
}
async function mergeGuestCartToUser(userId) {
	hydrate();
	currentUserId = userId;
	const { data, error } = await supabase.from("cart_items").select("id, product_id, variant_id, size, quantity").eq("user_id", userId);
	if (error) return cartItems;
	const freshLocal = readJson(CART_KEY, []);
	if (freshLocal.length === 0 && cartItems.length > 0) {
		cartItems = [];
		await supabase.from("cart_items").delete().eq("user_id", userId);
		persist();
		rebuildSnapshots();
		notify();
		return cartItems;
	}
	cartItems = freshLocal;
	await loadProductsByIds(cartItems.map((i) => i.productId));
	const localMap = /* @__PURE__ */ new Map();
	for (const item of cartItems) {
		const key = cartKey(item.productId, item.variantId, item.size);
		const existing = localMap.get(key);
		if (existing) existing.quantity = Math.min(existing.quantity + item.quantity, 999);
		else localMap.set(key, { ...item });
	}
	const merged = /* @__PURE__ */ new Map();
	for (const row of data ?? []) {
		const key = cartKey(row.product_id, row.variant_id, row.size ?? "");
		merged.set(key, {
			id: row.id,
			productId: row.product_id,
			variantId: row.variant_id,
			size: row.size ?? "",
			quantity: row.quantity,
			source: "server"
		});
	}
	for (const [key, item] of localMap) {
		const existing = merged.get(key);
		if (existing) {
			const maxQty = Math.max(existing.quantity, item.quantity);
			const product = getProduct(item.productId);
			const validation = product ? validateStockBeforeCheckout(product, {
				productId: item.productId,
				variantId: item.variantId ?? void 0,
				size: item.size,
				quantity: maxQty
			}) : null;
			merged.set(key, {
				...existing,
				quantity: validation?.ok ? maxQty : Math.min(maxQty, validation?.availableQuantity ?? maxQty)
			});
		} else merged.set(key, {
			...item,
			source: "server"
		});
	}
	cartItems = Array.from(merged.values());
	await syncCartWithServer();
	rebuildSnapshots();
	return cartItems;
}
async function addToWishlist(productId) {
	hydrate();
	if (!wishIds.includes(productId)) {
		wishIds = [...wishIds, productId];
		persist();
		rebuildSnapshots();
		notify();
	}
	if (!currentUserId) return;
	await supabase.from("wishlists").upsert({
		user_id: currentUserId,
		product_id: productId
	}, { onConflict: "user_id,product_id" });
}
async function removeFromWishlist(productId) {
	hydrate();
	wishIds = wishIds.filter((id) => id !== productId);
	persist();
	rebuildSnapshots();
	notify();
	if (!currentUserId) return;
	await supabase.from("wishlists").delete().eq("user_id", currentUserId).eq("product_id", productId);
}
function isInWishlist(productId) {
	hydrate();
	return wishIds.includes(productId);
}
async function syncWishlistOnLogin(userId) {
	hydrate();
	currentUserId = userId;
	const { data, error } = await supabase.from("wishlists").select("product_id").eq("user_id", userId);
	if (error) return wishIds;
	const merged = new Set([...(data ?? []).map((row) => row.product_id), ...wishIds]);
	wishIds = Array.from(merged);
	await supabase.from("wishlists").upsert(wishIds.map((productId) => ({
		user_id: userId,
		product_id: productId
	})), { onConflict: "user_id,product_id" });
	persist();
	rebuildSnapshots();
	notify();
	return wishIds;
}
function scoreProduct(product, query) {
	const target = [
		product.name,
		product.slug,
		product.color,
		product.fabric,
		product.material,
		product.category,
		product.subcategory,
		product.sku,
		...(product.colorVariants ?? []).flatMap((variant) => [
			variant.color,
			variant.sku ?? "",
			...Object.values(variant.attributes ?? {}).map(String)
		])
	].filter(Boolean).join(" ").toLowerCase();
	let score = 0;
	for (const token of query.toLowerCase().split(/\s+/).filter(Boolean)) {
		if (target.includes(token)) score += 2;
		if (product.name.toLowerCase().includes(token)) score += 3;
		if (product.sku.toLowerCase().includes(token)) score += 3;
	}
	return score;
}
function searchProducts(query) {
	hydrate();
	const trimmed = query.trim().toLowerCase();
	if (!trimmed) return [];
	const cached = searchCache.get(trimmed);
	if (cached) return cached;
	const localResults = products.map((product) => ({
		product,
		score: scoreProduct(product, trimmed)
	})).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score).slice(0, 12).map((entry) => entry.product);
	searchCache.set(trimmed, localResults);
	return localResults;
}
var CartContext = (0, import_react.createContext)(null);
var WishContext = (0, import_react.createContext)(null);
function StoreProvider({ children }) {
	const { user } = useAuth();
	const cartSnapshot = (0, import_react.useSyncExternalStore)(subscribe, getCartSnapshot, getCartSnapshot);
	const wishSnapshot = (0, import_react.useSyncExternalStore)(subscribe, getWishlistSnapshot, getWishlistSnapshot);
	(0, import_react.useEffect)(() => {
		initCrossTabSync();
		setCustomerUser(user?.id ?? null);
		if (!user) return;
		mergeGuestCartToUser(user.id);
		syncWishlistOnLogin(user.id);
	}, [user]);
	const cartValue = (0, import_react.useMemo)(() => ({
		items: cartSnapshot.items,
		add: (productId, size, quantity = 1, variantId) => void addToCart(productId, variantId, size, quantity),
		remove: (productId, size) => {
			const item = cartSnapshot.items.find((entry) => entry.productId === productId && entry.size === size);
			if (item) removeFromCart(item.id);
		},
		setQty: (productId, size, quantity) => {
			const item = cartSnapshot.items.find((entry) => entry.productId === productId && entry.size === size);
			if (item) updateCartQuantity(item.id, quantity);
		},
		clear: () => {
			clearCart();
		},
		count: cartSnapshot.count,
		subtotal: cartSnapshot.subtotal,
		detailed: cartSnapshot.detailed,
		syncCartWithServer,
		validateCartStock
	}), [cartSnapshot]);
	const wishValue = (0, import_react.useMemo)(() => ({
		ids: wishSnapshot.ids,
		toggle: (id) => {
			if (isInWishlist(id)) removeFromWishlist(id);
			else addToWishlist(id);
		},
		has: isInWishlist,
		remove: (id) => void removeFromWishlist(id),
		count: wishSnapshot.ids.length,
		syncWishlistOnLogin,
		addToWishlist: (id) => addToWishlist(id),
		removeFromWishlist: (id) => removeFromWishlist(id),
		isInWishlist
	}), [wishSnapshot]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartContext.Provider, {
		value: cartValue,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WishContext.Provider, {
			value: wishValue,
			children
		})
	});
}
function useCart() {
	const ctx = (0, import_react.useContext)(CartContext);
	if (!ctx) throw new Error("useCart must be used within StoreProvider");
	return ctx;
}
function useWishlist() {
	const ctx = (0, import_react.useContext)(WishContext);
	if (!ctx) throw new Error("useWishlist must be used within StoreProvider");
	return ctx;
}
//#endregion
export { useCart as a, searchProducts as i, getProductAvailability as n, useWishlist as o, registerProduct as r, validateStockBeforeCheckout as s, StoreProvider as t };
