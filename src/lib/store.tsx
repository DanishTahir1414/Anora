import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { products as catalog, type Product } from "./products";

// ───────────────────────── Cart ─────────────────────────
export interface CartItem {
  productId: string;
  size: string;
  quantity: number;
}

interface CartCtx {
  items: CartItem[];
  add: (productId: string, size: string, quantity?: number) => void;
  remove: (productId: string, size: string) => void;
  setQty: (productId: string, size: string, quantity: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  detailed: { item: CartItem; product: Product }[];
}

const CartContext = createContext<CartCtx | null>(null);
const CART_KEY = "anora.cart.v1";

// ───────────────────────── Wishlist ─────────────────────
interface WishCtx {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
  remove: (id: string) => void;
  count: number;
}

const WishContext = createContext<WishCtx | null>(null);
const WISH_KEY = "anora.wish.v1";

function useLocal<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [val, setVal] = useState<T>(initial);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setVal(JSON.parse(raw) as T);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {
      /* ignore */
    }
  }, [key, val]);
  return [val, setVal];
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useLocal<CartItem[]>(CART_KEY, []);
  const [ids, setIds] = useLocal<string[]>(WISH_KEY, []);

  const add: CartCtx["add"] = useCallback(
    (productId, size, quantity = 1) => {
      setItems((prev) => {
        const i = prev.findIndex((x) => x.productId === productId && x.size === size);
        if (i >= 0) {
          const next = [...prev];
          next[i] = { ...next[i], quantity: next[i].quantity + quantity };
          return next;
        }
        return [...prev, { productId, size, quantity }];
      });
    },
    [setItems],
  );

  const remove: CartCtx["remove"] = useCallback(
    (productId, size) =>
      setItems((prev) => prev.filter((x) => !(x.productId === productId && x.size === size))),
    [setItems],
  );

  const setQty: CartCtx["setQty"] = useCallback(
    (productId, size, quantity) =>
      setItems((prev) =>
        prev
          .map((x) =>
            x.productId === productId && x.size === size
              ? { ...x, quantity: Math.max(1, quantity) }
              : x,
          )
          .filter((x) => x.quantity > 0),
      ),
    [setItems],
  );

  const clear = useCallback(() => setItems([]), [setItems]);

  const detailed = useMemo(
    () =>
      items
        .map((item) => {
          const product = catalog.find((p) => p.id === item.productId);
          return product ? { item, product } : null;
        })
        .filter((x): x is { item: CartItem; product: Product } => x !== null),
    [items],
  );

  const subtotal = useMemo(
    () => detailed.reduce((sum, { item, product }) => sum + item.quantity * product.price, 0),
    [detailed],
  );
  const count = useMemo(() => items.reduce((n, x) => n + x.quantity, 0), [items]);

  const cartValue: CartCtx = { items, add, remove, setQty, clear, count, subtotal, detailed };

  const toggle = useCallback(
    (id: string) =>
      setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    [setIds],
  );
  const has = useCallback((id: string) => ids.includes(id), [ids]);
  const wishRemove = useCallback(
    (id: string) => setIds((prev) => prev.filter((x) => x !== id)),
    [setIds],
  );
  const wishValue: WishCtx = { ids, toggle, has, remove: wishRemove, count: ids.length };

  return (
    <CartContext.Provider value={cartValue}>
      <WishContext.Provider value={wishValue}>{children}</WishContext.Provider>
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within StoreProvider");
  return ctx;
}

export function useWishlist() {
  const ctx = useContext(WishContext);
  if (!ctx) throw new Error("useWishlist must be used within StoreProvider");
  return ctx;
}
