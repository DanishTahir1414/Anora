//#region node_modules/.nitro/vite/services/ssr/assets/inventory-engine-C_1gi1aY.js
var ErrorCodes = {
	PRODUCT_UNAVAILABLE: "PRODUCT_UNAVAILABLE",
	PRODUCT_ARCHIVED: "PRODUCT_ARCHIVED",
	PRODUCT_DRAFT: "PRODUCT_DRAFT",
	PRODUCT_INACTIVE: "PRODUCT_INACTIVE",
	VARIANT_INACTIVE: "VARIANT_INACTIVE",
	VARIANT_NOT_FOUND: "VARIANT_NOT_FOUND",
	SIZE_NOT_FOUND: "SIZE_NOT_FOUND",
	SIZE_OUT_OF_STOCK: "SIZE_OUT_OF_STOCK",
	PRODUCT_OUT_OF_STOCK: "PRODUCT_OUT_OF_STOCK",
	PRICE_MISMATCH: "PRICE_MISMATCH",
	QUANTITY_EXCEEDED: "QUANTITY_EXCEEDED",
	INVALID_QUANTITY: "INVALID_QUANTITY"
};
function clampStock(value) {
	return Math.max(0, Number(value ?? 0) || 0);
}
function normalizeSizeStock(sizeStock) {
	if (!sizeStock) return {};
	const raw = Object.fromEntries(Object.entries(sizeStock).map(([size, quantity]) => [size, clampStock(quantity)]));
	return Object.values(raw).some((v) => v > 0) ? raw : {};
}
function isSizeTracked(sizeStock) {
	return Object.keys(sizeStock).length > 0;
}
function getAvailableStock(product, size) {
	const stockMap = normalizeSizeStock(product.size_stock);
	if (!isSizeTracked(stockMap)) return { quantity: product.stock };
	if (!size) return { quantity: product.stock };
	const sizeQty = stockMap[size];
	if (sizeQty === void 0) return {
		quantity: 0,
		error: {
			code: ErrorCodes.SIZE_NOT_FOUND,
			message: "Selected size is unavailable"
		}
	};
	return { quantity: Math.min(product.stock, sizeQty) };
}
function validatePrice(dbPrice, expectedPrice) {
	if (expectedPrice == null) return void 0;
	if (Math.abs(dbPrice - expectedPrice) > .001) return {
		code: ErrorCodes.PRICE_MISMATCH,
		message: "Price has changed"
	};
}
function isStockOnlyError(code) {
	return code === ErrorCodes.SIZE_OUT_OF_STOCK || code === ErrorCodes.PRODUCT_OUT_OF_STOCK || code === ErrorCodes.QUANTITY_EXCEEDED;
}
function isStructuralError(code) {
	return code === ErrorCodes.PRODUCT_UNAVAILABLE || code === ErrorCodes.PRODUCT_ARCHIVED || code === ErrorCodes.PRODUCT_DRAFT || code === ErrorCodes.PRODUCT_INACTIVE || code === ErrorCodes.VARIANT_INACTIVE || code === ErrorCodes.VARIANT_NOT_FOUND || code === ErrorCodes.SIZE_NOT_FOUND || code === ErrorCodes.PRICE_MISMATCH || code === ErrorCodes.INVALID_QUANTITY;
}
function validateProductStatus(product) {
	if (!product.is_active) return {
		code: ErrorCodes.PRODUCT_INACTIVE,
		message: `${product.name ?? "Product"} is no longer available.`
	};
	if (product.status && product.status !== "active") {
		if (product.status === "archived") return {
			code: ErrorCodes.PRODUCT_ARCHIVED,
			message: `${product.name ?? "Product"} has been archived.`
		};
		if (product.status === "draft") return {
			code: ErrorCodes.PRODUCT_DRAFT,
			message: `${product.name ?? "Product"} is not available for purchase.`
		};
		return {
			code: ErrorCodes.PRODUCT_UNAVAILABLE,
			message: `${product.name ?? "Product"} is unavailable.`
		};
	}
}
function validateVariant(variant, productName) {
	if (!variant) return {
		code: ErrorCodes.VARIANT_NOT_FOUND,
		message: `Variant unavailable for ${productName ?? "product"}.`
	};
	if (!variant.is_active) return {
		code: ErrorCodes.VARIANT_INACTIVE,
		message: `Variant is no longer available for ${productName ?? "product"}.`
	};
	if (variant.stock <= 0) return {
		code: ErrorCodes.PRODUCT_OUT_OF_STOCK,
		message: `${productName ?? "Product"} variant is out of stock.`
	};
}
function validateSizeInList(size, sizes, productName) {
	if (size && sizes && sizes.length > 0 && !sizes.includes(size)) return {
		code: ErrorCodes.SIZE_NOT_FOUND,
		message: `Selected size is unavailable for ${productName ?? "product"}.`
	};
}
function validateSizeStock(size, sizeStock, productName) {
	if (!size) return void 0;
	const stockMap = normalizeSizeStock(sizeStock);
	if (!isSizeTracked(stockMap)) return void 0;
	const qty = stockMap[size];
	if (qty === void 0) return {
		code: ErrorCodes.SIZE_NOT_FOUND,
		message: `Selected size is unavailable for ${productName ?? "product"}.`
	};
	if (qty <= 0) return {
		code: ErrorCodes.SIZE_OUT_OF_STOCK,
		message: `Selected size is out of stock for ${productName ?? "product"}.`
	};
}
function validateQuantity(requested, available, productName) {
	if (requested <= 0) return {
		code: ErrorCodes.INVALID_QUANTITY,
		message: "Quantity must be positive"
	};
	if (requested > available) return {
		code: ErrorCodes.QUANTITY_EXCEEDED,
		message: `Only ${available} unit${available !== 1 ? "s" : ""} remaining for ${productName ?? "product"}.`
	};
}
//#endregion
export { isStructuralError as a, validateProductStatus as c, validateSizeStock as d, validateVariant as f, isStockOnlyError as i, validateQuantity as l, getAvailableStock as n, normalizeSizeStock as o, isSizeTracked as r, validatePrice as s, clampStock as t, validateSizeInList as u };
