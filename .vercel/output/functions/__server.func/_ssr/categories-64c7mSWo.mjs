import { r as supabase } from "./auth-context-oFJLTVEi.mjs";
import { r as registerProduct } from "./store-CEzUOlzO.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/categories-64c7mSWo.js
async function getActiveCategories() {
	const { data, error } = await supabase.rpc("get_active_categories");
	if (error) throw error;
	return data ?? [];
}
async function getCategoryBySlug(slug) {
	const { data, error } = await supabase.rpc("get_category_by_slug", { p_slug: slug });
	if (error) throw error;
	return data;
}
async function augmentProducts(products) {
	if (products.length === 0) return;
	const ids = products.map((p) => p.id);
	const { data: stockRows } = await supabase.from("products").select("id, stock, size_stock, sizes, sku, color").in("id", ids);
	const { data: imageRows } = await supabase.from("product_images").select("product_id, image_url, sort_order").in("product_id", ids).order("sort_order");
	if (stockRows) {
		const stockMap = new Map(stockRows.map((r) => [r.id, r]));
		for (const p of products) {
			const s = stockMap.get(p.id);
			if (s) {
				p.stock = s.stock;
				p.size_stock = s.size_stock;
				p.sizes = s.sizes;
				p.sku = s.sku;
				p.color = s.color;
			}
		}
	}
	if (imageRows) {
		const imageMap = /* @__PURE__ */ new Map();
		for (const row of imageRows) {
			const list = imageMap.get(row.product_id);
			if (list) list.push(row.image_url);
			else imageMap.set(row.product_id, [row.image_url]);
		}
		for (const p of products) p.images = imageMap.get(p.id) ?? [];
	}
}
async function getProductsByCategorySlug(slug, page = 1, pageSize = 50) {
	const { data, error } = await supabase.rpc("get_products_by_category_slug", {
		p_slug: slug,
		p_page: page,
		p_page_size: pageSize
	});
	if (error) throw error;
	const products = data ?? [];
	await augmentProducts(products);
	return products;
}
async function getProductsByCategoryAndSubcategory(categorySlug, subcategorySlug) {
	const { data, error } = await supabase.rpc("get_products_by_category_and_subcategory", {
		p_category_slug: categorySlug,
		p_subcategory_slug: subcategorySlug
	});
	if (error) throw error;
	const products = data ?? [];
	await augmentProducts(products);
	return products;
}
function useActiveCategories() {
	return useQuery({
		queryKey: ["active-categories"],
		queryFn: getActiveCategories
	});
}
function useCategoryProducts(slug) {
	return useQuery({
		queryKey: ["category-products", slug],
		queryFn: () => getProductsByCategorySlug(slug),
		enabled: !!slug
	});
}
function useSubcategoryProducts(categorySlug, subcategorySlug) {
	return useQuery({
		queryKey: [
			"subcategory-products",
			categorySlug,
			subcategorySlug
		],
		queryFn: () => getProductsByCategoryAndSubcategory(categorySlug, subcategorySlug),
		enabled: !!categorySlug && !!subcategorySlug
	});
}
function toProductProps(p) {
	const product = {
		id: p.id,
		slug: p.slug,
		name: p.name,
		price: Number(p.price),
		category: p.category_slug,
		subcategory: p.category_name,
		description: p.description ?? "",
		color: p.color ?? "Ivory",
		sizes: p.sizes ?? [],
		sku: p.sku ?? "",
		stock: p.stock ?? 0,
		sizeStock: p.size_stock ?? {},
		images: p.images ?? [],
		badge: p.badge ?? void 0
	};
	registerProduct(product);
	return product;
}
//#endregion
export { useCategoryProducts as a, useActiveCategories as i, getCategoryBySlug as n, useSubcategoryProducts as o, toProductProps as r, getActiveCategories as t };
