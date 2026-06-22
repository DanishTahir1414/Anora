import { supabase } from "./supabase";
import { products as catalog, type Product } from "./products";
import {
  DEFAULT_SIZE_THRESHOLD,
  getProductAvailability,
  validateStockBeforeCheckout,
} from "./inventory";

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string | null;
  size: string;
  quantity: number;
  active: boolean;
  source: "local" | "server";
  updatedAt: number;
}

export interface WishlistState {
  ids: string[];
}

export interface CartSnapshot {
  items: CartItem[];
  count: number;
  subtotal: number;
  detailed: { item: CartItem; product: Product; active: boolean; availableQuantity: number }[];
}

type Listener = () => void;

const CART_KEY = "anora.customer.cart.v2";
const WISH_KEY = "anora.customer.wishlist.v2";
const SESSION_KEY = "anora.customer.session.v1";

let cartItems: CartItem[] = [];
let wishIds: string[] = [];
let currentUserId: string | null = null;
let hydrated = false;
let cartSnapshotCache: CartSnapshot = { items: [], count: 0, subtotal: 0, detailed: [] };
let wishlistSnapshotCache: WishlistState = { ids: [] };
const listeners = new Set<Listener>();
const searchCache = new Map<string, Product[]>();

interface CartRow {
  id: string;
  product_id: string;
  variant_id: string | null;
  size: string | null;
  quantity: number;
}

interface WishlistRow {
  product_id: string;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
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

function hydrate() {
  if (hydrated) return;
  hydrated = true;
  cartItems = readJson<CartItem[]>(CART_KEY, []);
  wishIds = readJson<string[]>(WISH_KEY, []);
  ensureSessionId();
  rebuildSnapshots();
}

function persist() {
  writeJson(CART_KEY, cartItems);
  writeJson(WISH_KEY, wishIds);
}

function rebuildSnapshots() {
  const detailed = cartItems.flatMap((item) => {
    const product = getProduct(item.productId);
    if (!product) return [];
    const validation = validateStockBeforeCheckout(product, {
      productId: item.productId,
      variantId: item.variantId ?? undefined,
      size: item.size,
      quantity: item.quantity,
    });
    return [
      {
        item,
        product,
        active: validation.ok && item.quantity > 0,
        availableQuantity: validation.availableQuantity,
      },
    ];
  });

  cartSnapshotCache = {
    items: cartItems,
    count: cartItems.reduce((sum, item) => sum + activeQuantity(item), 0),
    subtotal: detailed
      .filter((entry) => entry.active)
      .reduce((sum, entry) => sum + entry.item.quantity * entry.product.price, 0),
    detailed,
  };
  wishlistSnapshotCache = { ids: wishIds };
}

function getProduct(productId: string) {
  return catalog.find((entry) => entry.id === productId);
}

function cartKey(productId: string, variantId?: string | null, size?: string) {
  return [productId, variantId ?? "", size ?? ""].join("|");
}

function clamp(qty: number) {
  return Math.max(0, Math.floor(Number(qty) || 0));
}

function activeQuantity(item: CartItem) {
  return item.active ? item.quantity : 0;
}

export function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCartSnapshot(): CartSnapshot {
  hydrate();
  return cartSnapshotCache;
}

export function getWishlistSnapshot() {
  hydrate();
  return wishlistSnapshotCache;
}

export function setCustomerUser(userId: string | null) {
  hydrate();
  currentUserId = userId;
}

export function validateCartStock(items: CartItem[] = cartItems) {
  hydrate();
  const validated = items.map((item) => {
    const product = getProduct(item.productId);
    if (!product) {
      return { ...item, active: false, quantity: 0 };
    }
    const validation = validateStockBeforeCheckout(product, {
      productId: item.productId,
      variantId: item.variantId ?? undefined,
      size: item.size,
      quantity: item.quantity,
    });
    const nextQty = validation.ok
      ? item.quantity
      : Math.min(item.quantity, validation.availableQuantity);
    return {
      ...item,
      active: validation.ok && nextQty > 0,
      quantity: nextQty,
    };
  });
  cartItems = validated;
  persist();
  rebuildSnapshots();
  notify();
  return validated;
}

export async function addToCart(productId: string, variantId?: string | null, size = "", qty = 1) {
  hydrate();
  const product = getProduct(productId);
  if (!product) return;
  const validation = validateStockBeforeCheckout(product, {
    productId,
    variantId: variantId ?? undefined,
    size,
    quantity: qty,
  });
  if (!validation.ok) return;

  const key = cartKey(productId, variantId, size);
  const existing = cartItems.find(
    (item) => cartKey(item.productId, item.variantId, item.size) === key,
  );
  const nextQuantity = clamp((existing?.quantity ?? 0) + qty);
  const capped = Math.min(nextQuantity, validation.availableQuantity);
  const next: CartItem = {
    id: existing?.id ?? crypto.randomUUID(),
    productId,
    variantId: variantId ?? null,
    size,
    quantity: capped,
    active: capped > 0 && validation.ok,
    source: currentUserId ? "server" : "local",
    updatedAt: Date.now(),
  };
  cartItems = existing
    ? cartItems.map((item) => (item.id === existing.id ? next : item))
    : [...cartItems, next];
  persist();
  rebuildSnapshots();
  notify();
  if (currentUserId) {
    await syncCartWithServer();
  }
}

export async function removeFromCart(itemId: string) {
  hydrate();
  cartItems = cartItems.filter((item) => item.id !== itemId);
  persist();
  rebuildSnapshots();
  notify();
  if (currentUserId) {
    await syncCartWithServer();
  }
}

export async function updateCartQuantity(itemId: string, qty: number) {
  hydrate();
  const nextQty = clamp(qty);
  cartItems = cartItems
    .map((item) =>
      item.id === itemId
        ? {
            ...item,
            quantity: nextQty,
            active: nextQty > 0,
            updatedAt: Date.now(),
          }
        : item,
    )
    .filter((item) => item.quantity > 0);
  validateCartStock();
  if (currentUserId) {
    await syncCartWithServer();
  }
}

export async function syncCartWithServer() {
  hydrate();
  if (!currentUserId) return cartItems;

  const { data, error } = await supabase
    .from("cart_items")
    .select("id, product_id, variant_id, size, quantity")
    .eq("user_id", currentUserId);

  if (error) return cartItems;

  const serverItems: CartItem[] = ((data ?? []) as CartRow[]).map((row) => ({
    id: row.id,
    productId: row.product_id,
    variantId: row.variant_id,
    size: row.size ?? "",
    quantity: row.quantity,
    active: true,
    source: "server",
    updatedAt: Date.now(),
  }));

  const merged = new Map<string, CartItem>();
  for (const item of [...serverItems, ...cartItems]) {
    const key = cartKey(item.productId, item.variantId, item.size);
    const existing = merged.get(key);
    if (existing) {
      merged.set(key, {
        ...existing,
        quantity: Math.max(existing.quantity, item.quantity),
        active: existing.active || item.active,
      });
    } else {
      merged.set(key, item);
    }
  }

  cartItems = Array.from(merged.values()).map((item) => {
    const product = getProduct(item.productId);
    if (!product) return { ...item, active: false };
    const validation = validateStockBeforeCheckout(product, {
      productId: item.productId,
      variantId: item.variantId ?? undefined,
      size: item.size,
      quantity: item.quantity,
    });
    return {
      ...item,
      quantity: validation.ok
        ? item.quantity
        : Math.min(item.quantity, validation.availableQuantity),
      active: validation.ok,
      source: "server",
    };
  });

  const payload = cartItems.map((item) => ({
    user_id: currentUserId,
    product_id: item.productId,
    variant_id: item.variantId ?? null,
    size: item.size,
    quantity: item.quantity,
  }));

  await supabase.from("cart_items").delete().eq("user_id", currentUserId);
  if (payload.length > 0) {
    await supabase.from("cart_items").insert(payload);
  }

  persist();
  rebuildSnapshots();
  notify();
  return cartItems;
}

export async function mergeGuestCartToUser(userId: string) {
  hydrate();
  currentUserId = userId;
  const guestItems = cartItems.filter((item) => item.source === "local");
  if (guestItems.length === 0) {
    return syncCartWithServer();
  }

  const { data, error } = await supabase
    .from("cart_items")
    .select("id, product_id, variant_id, size, quantity")
    .eq("user_id", userId);

  if (error) return cartItems;

  const merged = new Map<string, CartItem>();
  for (const item of ((data ?? []) as CartRow[]).map((row) => ({
    id: row.id,
    productId: row.product_id,
    variantId: row.variant_id,
    size: row.size ?? "",
    quantity: row.quantity,
    active: true,
    source: "server" as const,
    updatedAt: Date.now(),
  }))) {
    merged.set(cartKey(item.productId, item.variantId, item.size), item);
  }

  for (const item of guestItems) {
    const key = cartKey(item.productId, item.variantId, item.size);
    const existing = merged.get(key);
    const product = getProduct(item.productId);
    if (!product) continue;
    const validation = validateStockBeforeCheckout(product, {
      productId: item.productId,
      variantId: item.variantId ?? undefined,
      size: item.size,
      quantity: (existing?.quantity ?? 0) + item.quantity,
    });
    const nextQuantity = validation.ok
      ? (existing?.quantity ?? 0) + item.quantity
      : Math.min((existing?.quantity ?? 0) + item.quantity, validation.availableQuantity);
    merged.set(key, {
      id: existing?.id ?? item.id,
      productId: item.productId,
      variantId: item.variantId ?? null,
      size: item.size,
      quantity: nextQuantity,
      active: nextQuantity > 0,
      source: "server",
      updatedAt: Date.now(),
    });
  }

  cartItems = Array.from(merged.values());
  await syncCartWithServer();
  rebuildSnapshots();
  return cartItems;
}

export async function addToWishlist(productId: string) {
  hydrate();
  if (!wishIds.includes(productId)) {
    wishIds = [...wishIds, productId];
    persist();
    rebuildSnapshots();
    notify();
  }
  if (!currentUserId) return;
  await supabase
    .from("wishlists")
    .upsert(
      { user_id: currentUserId, product_id: productId },
      { onConflict: "user_id,product_id" },
    );
}

export async function removeFromWishlist(productId: string) {
  hydrate();
  wishIds = wishIds.filter((id) => id !== productId);
  persist();
  rebuildSnapshots();
  notify();
  if (!currentUserId) return;
  await supabase
    .from("wishlists")
    .delete()
    .eq("user_id", currentUserId)
    .eq("product_id", productId);
}

export function isInWishlist(productId: string) {
  hydrate();
  return wishIds.includes(productId);
}

export async function syncWishlistOnLogin(userId: string) {
  hydrate();
  currentUserId = userId;
  const { data, error } = await supabase
    .from("wishlists")
    .select("product_id")
    .eq("user_id", userId);
  if (error) return wishIds;
  const merged = new Set([
    ...((data ?? []) as WishlistRow[]).map((row) => row.product_id),
    ...wishIds,
  ]);
  wishIds = Array.from(merged);
  await supabase.from("wishlists").upsert(
    wishIds.map((productId) => ({ user_id: userId, product_id: productId })),
    { onConflict: "user_id,product_id" },
  );
  persist();
  rebuildSnapshots();
  notify();
  return wishIds;
}

function scoreProduct(product: Product, query: string) {
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
      ...(Object.values(variant.attributes ?? {}) as Array<string | number | boolean | null>).map(
        String,
      ),
    ]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let score = 0;
  for (const token of query.toLowerCase().split(/\s+/).filter(Boolean)) {
    if (target.includes(token)) score += 2;
    if (product.name.toLowerCase().includes(token)) score += 3;
    if (product.sku.toLowerCase().includes(token)) score += 3;
  }
  return score;
}

export function searchProducts(query: string) {
  hydrate();
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];
  const cached = searchCache.get(trimmed);
  if (cached) return cached;

  const localResults = catalog
    .map((product) => ({ product, score: scoreProduct(product, trimmed) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((entry) => entry.product);

  searchCache.set(trimmed, localResults);
  return localResults;
}

export function getCustomerFlags(product: Product) {
  const availability = getProductAvailability(product);
  return {
    lowStock:
      availability.lowStock || (product.metadata?.low_stock as boolean | undefined) === true,
    threshold: DEFAULT_SIZE_THRESHOLD,
  };
}
