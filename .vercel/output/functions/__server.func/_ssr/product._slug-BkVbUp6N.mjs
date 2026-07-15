import { P as notFound, m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as supabase } from "./auth-context-oFJLTVEi.mjs";
import { l as products } from "./products-DA_AUvrV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/product._slug-BkVbUp6N.js
async function getProductBySlug(slug) {
	const { data, error } = await supabase.rpc("get_product_by_slug", { p_slug: slug });
	if (error) throw error;
	return data;
}
function mapImages(images) {
	return images.sort((a, b) => a.sort_order - b.sort_order).map((img) => img.image_url).filter(Boolean);
}
function mapColorsToVariants(db, imageUrls) {
	if (!db.colors || db.colors.length === 0) return void 0;
	return db.colors.map((c) => ({
		color: c.name,
		images: imageUrls,
		sizes: db.sizes,
		sizeStock: db.size_stock ?? {},
		stock: db.stock,
		sku: db.sku ?? ""
	}));
}
function mapDbProductToStatic(db, dbImages, parentCategorySlug, subcategoryName) {
	const imageUrls = mapImages(dbImages);
	const variants = mapColorsToVariants(db, imageUrls);
	return {
		id: db.id,
		slug: db.slug,
		name: db.name,
		price: db.price,
		category: parentCategorySlug,
		subcategory: subcategoryName,
		description: db.description ?? "",
		fabric: db.fabric ?? void 0,
		material: db.material ?? void 0,
		color: db.colors?.[0]?.name ?? "Ivory",
		sizes: db.sizes,
		sku: db.sku ?? "",
		stock: db.stock,
		sizeStock: db.size_stock ?? {},
		images: imageUrls,
		badge: db.is_new ? "New" : db.is_best_seller ? "Best Seller" : void 0,
		colorVariants: variants,
		metadata: { low_stock: db.stock > 0 && db.stock <= db.low_stock_threshold }
	};
}
var $$splitNotFoundComponentImporter = () => import("./product._slug-CUWNnm3u.mjs");
var $$splitComponentImporter = () => import("./product._slug-zuU8irG6.mjs");
var Route = createFileRoute("/product/$slug")({
	loader: async ({ params }) => {
		const dbResult = await getProductBySlug(params.slug);
		if (!dbResult || !dbResult.product) throw notFound();
		const parentSlug = dbResult.parent_category?.slug ?? "clothing";
		const subName = dbResult.category?.name ?? "";
		const product = mapDbProductToStatic(dbResult.product, dbResult.images, parentSlug, subName);
		return {
			product,
			related: getRelatedProducts(product)
		};
	},
	head: ({ loaderData }) => {
		const p = loaderData?.product;
		return { meta: [
			{ title: p ? `${p.name} — ANORA` : "ANORA" },
			{
				name: "description",
				content: p?.description ?? ""
			},
			{
				property: "og:title",
				content: p ? `${p.name} — ANORA` : "ANORA"
			},
			{
				property: "og:description",
				content: p?.description ?? ""
			},
			{
				property: "og:image",
				content: p?.images[0] ?? ""
			}
		] };
	},
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
function getRelatedProducts(product) {
	return products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 3);
}
//#endregion
export { Route as t };
