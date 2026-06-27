import type { Product, ColorVariant, Category } from "./products";

export const DEFAULT_SIZE_THRESHOLD = 5;

export type InventoryChannel = "product" | "variant" | "size";

export interface AvailabilityState {
  productId: string;
  slug: string;
  category: Category;
  sku: string;
  color: string;
  stock: number;
  isAvailable: boolean;
  lowStock: boolean;
  lowStockThreshold: number;
  sizes: string[];
  sizeStock: Record<string, number>;
  colorVariants: Array<{
    color: string;
    sku: string;
    stock: number;
    isAvailable: boolean;
    lowStock: boolean;
    images: string[];
    sizes: string[];
    sizeStock: Record<string, number>;
  }>;
  selectedVariant?: {
    color: string;
    sku: string;
    stock: number;
    isAvailable: boolean;
    lowStock: boolean;
    images: string[];
    sizes: string[];
    sizeStock: Record<string, number>;
  };
}

export interface CheckoutLine {
  productId: string;
  quantity: number;
  size: string;
  color?: string;
  variantId?: string;
}

export interface StockValidationResult {
  ok: boolean;
  reason?: string;
  availableQuantity: number;
  availability: AvailabilityState;
}

export interface InventoryLogEntry {
  productId: string;
  variantSku?: string;
  quantityChange: number;
  quantityAfter: number;
  changeType: "order" | "restock" | "adjustment" | "return" | "cancellation";
  notes?: string;
}

function clampStock(value: number | undefined | null) {
  return Math.max(0, Number(value ?? 0) || 0);
}

function normalizeSizeStock(sizeStock?: Record<string, number> | null) {
  const raw = Object.fromEntries(
    Object.entries(sizeStock ?? {}).map(([size, quantity]) => [size, clampStock(quantity)]),
  );
  const hasAnyNonZero = Object.values(raw).some((v) => v > 0);
  return hasAnyNonZero ? raw : {};
}

function getVariantRecord(product: Product, color?: string) {
  return product.colorVariants?.find((variant) => variant.color === (color ?? product.color));
}

function getEffectiveSizeStock(product: Product, variant?: ColorVariant) {
  return normalizeSizeStock(variant?.sizeStock ?? product.sizeStock);
}

export function getVariantStock(product: Product, color?: string) {
  const variant = getVariantRecord(product, color);
  return clampStock(variant?.stock ?? product.stock);
}

export function getSizeStock(product: Product, size: string, color?: string) {
  const variant = getVariantRecord(product, color);
  const stockMap = getEffectiveSizeStock(product, variant);
  return clampStock(stockMap[size]);
}

export function getProductAvailability(product: Product, color?: string): AvailabilityState {
  const selectedVariant = getVariantRecord(product, color);
  const variantList = product.colorVariants?.length
    ? product.colorVariants
    : [
        {
          color: product.color,
          images: product.images,
          sizes: product.sizes,
          sizeStock: product.sizeStock,
          stock: product.stock,
          sku: product.sku,
        },
      ];

  const colorVariants = variantList.map((variant) => {
    const normalizedSizeStock = getEffectiveSizeStock(product, variant);
    const variantStock = clampStock(variant.stock ?? product.stock);
    const availableBySize = Object.values(normalizedSizeStock).some((quantity) => quantity > 0);
    const available =
      variantStock > 0 && (Object.keys(normalizedSizeStock).length === 0 || availableBySize);
    return {
      color: variant.color,
      sku: variant.sku ?? product.sku,
      stock: variantStock,
      isAvailable: available,
      lowStock: variantStock > 0 && variantStock <= DEFAULT_SIZE_THRESHOLD,
      images: variant.images,
      sizes: variant.sizes ?? product.sizes,
      sizeStock: normalizedSizeStock,
    };
  });

  const stock = getVariantStock(product, color);
  const sizeStock = getEffectiveSizeStock(product, selectedVariant);
  const sizeStocks = Object.values(sizeStock);
  const anySizeAvailable = sizeStocks.length === 0 || sizeStocks.some((quantity) => quantity > 0);

  return {
    productId: product.id,
    slug: product.slug,
    category: product.category,
    sku: selectedVariant?.sku ?? product.sku,
    color: selectedVariant?.color ?? product.color,
    stock,
    isAvailable: stock > 0 && anySizeAvailable,
    lowStock: stock > 0 && stock <= DEFAULT_SIZE_THRESHOLD,
    lowStockThreshold: DEFAULT_SIZE_THRESHOLD,
    sizes: selectedVariant?.sizes ?? product.sizes,
    sizeStock,
    colorVariants,
    selectedVariant: selectedVariant
      ? {
          color: selectedVariant.color,
          sku: selectedVariant.sku ?? product.sku,
          stock,
          isAvailable: stock > 0 && anySizeAvailable,
          lowStock: stock > 0 && stock <= DEFAULT_SIZE_THRESHOLD,
          images: selectedVariant.images,
          sizes: selectedVariant.sizes ?? product.sizes,
          sizeStock,
        }
      : undefined,
  };
}

export function validateStockBeforeCheckout(
  product: Product,
  line: CheckoutLine,
): StockValidationResult {
  const availability = getProductAvailability(product, line.color);
  const sizeQuantity = availability.sizeStock[line.size];
  const sizeLimited = Object.keys(availability.sizeStock).length > 0;
  const availableQuantity = sizeLimited ? clampStock(sizeQuantity) : availability.stock;
  if (!availability.isAvailable) {
    return { ok: false, reason: "Product is unavailable", availableQuantity, availability };
  }
  if (line.quantity <= 0) {
    return { ok: false, reason: "Quantity must be positive", availableQuantity, availability };
  }
  if (sizeLimited && sizeQuantity === 0) {
    return { ok: false, reason: "Selected size is out of stock", availableQuantity, availability };
  }
  if (line.quantity > availableQuantity) {
    return {
      ok: false,
      reason: "Requested quantity exceeds stock",
      availableQuantity,
      availability,
    };
  }
  return { ok: true, availableQuantity, availability };
}

export function decrementStockSafe(
  product: Product,
  line: CheckoutLine,
): {
  nextProduct: Product;
  log: InventoryLogEntry;
} | null {
  const validation = validateStockBeforeCheckout(product, line);
  if (!validation.ok) return null;

  const selectedVariant = getVariantRecord(product, line.color);
  const nextProduct = structuredClone(product);
  const quantity = line.quantity;
  const variantIndex =
    nextProduct.colorVariants?.findIndex((variant) => variant.color === selectedVariant?.color) ??
    -1;

  if (variantIndex >= 0 && nextProduct.colorVariants) {
    const variant = nextProduct.colorVariants[variantIndex];
    variant.stock = clampStock(variant.stock - quantity);
    if (variant.sizeStock) {
      variant.sizeStock[line.size] = clampStock((variant.sizeStock[line.size] ?? 0) - quantity);
    }
    nextProduct.stock = clampStock(nextProduct.stock - quantity);
  } else {
    nextProduct.stock = clampStock(nextProduct.stock - quantity);
    if (nextProduct.sizeStock) {
      nextProduct.sizeStock[line.size] = clampStock(
        (nextProduct.sizeStock[line.size] ?? 0) - quantity,
      );
    }
  }

  const after = validation.availableQuantity - quantity;
  const log: InventoryLogEntry = {
    productId: product.id,
    variantSku: validation.availability.selectedVariant?.sku,
    quantityChange: -quantity,
    quantityAfter: after,
    changeType: "order",
    notes: line.variantId ? `variant:${line.variantId}` : undefined,
  };

  return { nextProduct, log };
}

export function getLowStockFlag(product: Product, color?: string) {
  return getProductAvailability(product, color).lowStock;
}
