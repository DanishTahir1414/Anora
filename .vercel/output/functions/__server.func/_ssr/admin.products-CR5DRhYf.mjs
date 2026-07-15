import { o as __toESM } from "../_runtime.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { r as supabase } from "./auth-context-oFJLTVEi.mjs";
import { rt as Check } from "../_libs/lucide-react.mjs";
import { n as cn, t as AdminLayout } from "./utils-Cy0gksMl.mjs";
import { t as Skeleton } from "./skeleton-9naKPw9_.mjs";
import { t as Input } from "./input-Ch8T9SMc.mjs";
import { t as Button } from "./button-Dfd9l4mi.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-CvsFPszi.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-3x9W9oz0.mjs";
import { t as Label } from "./label-DJfgubqt.mjs";
import { n as CheckboxIndicator, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { o as normalizeSizeStock, r as isSizeTracked } from "./inventory-engine-C_1gi1aY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.products-CR5DRhYf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Checkbox = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
	ref,
	className: cn("grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
		className: cn("grid place-content-center text-current"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
	})
}));
Checkbox.displayName = Checkbox$1.displayName;
async function rpc(name, params) {
	const { data, error } = await supabase.rpc(name, params);
	if (error) throw error;
	return data;
}
function useProductsManagement(page, pageSize, search = "", sortBy = "created_at", sortDir = "desc", status = "", categoryId = "", stockStatus = "") {
	const [result, setResult] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const load = (0, import_react.useCallback)(async () => {
		try {
			setLoading(true);
			setError(null);
			const params = {
				p_page: page,
				p_page_size: pageSize,
				p_sort_by: sortBy,
				p_sort_dir: sortDir
			};
			if (search) params.p_search = search;
			if (status) params.p_status = status;
			if (categoryId) params.p_category_id = categoryId;
			if (stockStatus) params.p_stock_status = stockStatus;
			setResult(await rpc("get_products_management", params));
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	}, [
		page,
		pageSize,
		search,
		sortBy,
		sortDir,
		status,
		categoryId,
		stockStatus
	]);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	return {
		result,
		loading,
		error,
		refetch: load
	};
}
function useProductCategories() {
	const [categories, setCategories] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		supabase.from("categories").select("id, name").eq("is_active", true).order("name").then(({ data }) => {
			setCategories(data ?? []);
			setLoading(false);
		});
	}, []);
	return {
		categories,
		loading
	};
}
async function createProduct(data) {
	const isActive = (data.status ?? "draft") === "active" || (data.status ?? "draft") === "out_of_stock";
	const { error } = await supabase.from("products").insert({
		name: data.name,
		slug: data.slug,
		sku: data.sku,
		price: data.price,
		stock: data.stock,
		category_id: data.category_id,
		description: data.description ?? null,
		short_description: data.short_description ?? null,
		compare_price: data.compare_price ?? null,
		low_stock_threshold: data.low_stock_threshold ?? 5,
		sizes: data.sizes ?? [],
		size_stock: data.size_stock ?? {},
		colors: data.colors ?? [],
		fabric: data.fabric ?? null,
		material: data.material ?? null,
		is_new: data.is_new ?? false,
		is_best_seller: data.is_best_seller ?? false,
		featured: data.featured ?? false,
		status: data.status ?? "draft",
		is_active: isActive
	});
	if (error) throw error;
}
async function updateProduct(id, data) {
	const updateData = {
		name: data.name,
		slug: data.slug,
		sku: data.sku,
		price: data.price,
		stock: data.stock,
		category_id: data.category_id,
		description: data.description ?? null,
		short_description: data.short_description ?? null,
		compare_price: data.compare_price ?? null,
		low_stock_threshold: data.low_stock_threshold ?? 5,
		sizes: data.sizes ?? [],
		size_stock: data.size_stock ?? {},
		colors: data.colors ?? [],
		fabric: data.fabric ?? null,
		material: data.material ?? null,
		is_new: data.is_new ?? false,
		is_best_seller: data.is_best_seller ?? false,
		featured: data.featured ?? false,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	};
	if (data.status !== void 0) {
		updateData.status = data.status;
		updateData.is_active = data.status === "active" || data.status === "out_of_stock";
	}
	const { error } = await supabase.from("products").update(updateData).eq("id", id);
	if (error) throw error;
}
async function deleteProduct(id) {
	if (!id) throw new Error("deleteProduct: id is required");
	const { error } = await supabase.from("products").delete().eq("id", id);
	if (error) throw error;
}
async function duplicateProduct(productId) {
	if (!productId) throw new Error("duplicateProduct: productId is required");
	return rpc("duplicate_product", { p_product_id: productId });
}
async function bulkUpdateProducts(ids, data) {
	const params = { p_ids: ids };
	if (data.status) params.p_status = data.status;
	if (data.is_active !== void 0) params.p_is_active = data.is_active;
	return rpc("bulk_update_products", params);
}
async function bulkDeleteProducts(ids) {
	return rpc("bulk_delete_products", { p_ids: ids });
}
async function getAdminProduct(productId) {
	return rpc("get_admin_product", { p_product_id: productId });
}
async function getAllActiveCategories() {
	const { data, error } = await supabase.from("categories").select("id, name, parent_id").eq("is_active", true).order("name");
	if (error) throw error;
	return data ?? [];
}
async function uploadProductImage(productId, file, onProgress) {
	const ext = file.name.split(".").pop() ?? "jpg";
	const filePath = `products/${productId}/${crypto.randomUUID()}.${ext}`;
	const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, file, {
		cacheControl: "3600",
		upsert: false
	});
	if (uploadError) throw uploadError;
	const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filePath);
	const imageUrl = urlData?.publicUrl ?? "";
	if (!imageUrl) throw new Error("Failed to get public URL");
	const { data, error: insertError } = await supabase.from("product_images").insert({
		product_id: productId,
		image_url: imageUrl,
		sort_order: 0
	}).select("id, image_url").single();
	if (insertError) throw insertError;
	return {
		image_url: data.image_url,
		id: data.id
	};
}
async function deleteProductImage(imageId) {
	const { error } = await supabase.from("product_images").delete().eq("id", imageId);
	if (error) throw error;
}
async function reorderProductImages(images) {
	for (const img of images) {
		const { error } = await supabase.from("product_images").update({ sort_order: img.sort_order }).eq("id", img.id);
		if (error) throw error;
	}
}
function slugify(text) {
	return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
var SIZE_OPTIONS = [
	"XS",
	"S",
	"M",
	"L",
	"XL",
	"XXL"
];
function buildSizeStock(sizes, existing) {
	const result = {};
	for (const s of sizes) result[s] = typeof existing?.[s] === "number" ? existing[s] : 0;
	return normalizeSizeStock(result);
}
function calculateProductStock(sizeStock) {
	const stockMap = normalizeSizeStock(sizeStock ?? {});
	if (!isSizeTracked(stockMap)) return 0;
	return Object.values(stockMap).reduce((sum, qty) => sum + qty, 0);
}
function isSizeInventoryEnabled(sizeStock) {
	return isSizeTracked(normalizeSizeStock(sizeStock ?? {}));
}
var STATUS_OPTIONS = [
	"active",
	"draft",
	"archived",
	"out_of_stock"
];
function ProductForm({ open, onClose, onSaved, productId }) {
	const isEdit = !!productId;
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [loadingData, setLoadingData] = (0, import_react.useState)(false);
	const [allCategories, setAllCategories] = (0, import_react.useState)([]);
	const [images, setImages] = (0, import_react.useState)([]);
	const [uploading, setUploading] = (0, import_react.useState)(false);
	const [colorName, setColorName] = (0, import_react.useState)("");
	const [colorHex, setColorHex] = (0, import_react.useState)("#000000");
	const fileRef = (0, import_react.useRef)(null);
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		slug: "",
		sku: "",
		description: "",
		short_description: "",
		price: "",
		compare_price: "",
		stock: "",
		low_stock_threshold: "5",
		status: "draft",
		category_id: "",
		subcategory_id: "",
		sizes: [],
		colors: [],
		fabric: "",
		material: "",
		is_new: false,
		is_best_seller: false,
		featured: false
	});
	const [errors, setErrors] = (0, import_react.useState)({});
	const parentCategories = allCategories.filter((c) => !c.parent_id);
	const subCategories = allCategories.filter((c) => c.parent_id === form.category_id);
	(0, import_react.useEffect)(() => {
		getAllActiveCategories().then(setAllCategories).catch(() => {});
	}, []);
	(0, import_react.useEffect)(() => {
		if (open && productId) {
			setLoadingData(true);
			getAdminProduct(productId).then((data) => {
				const p = data.product;
				setForm({
					name: p.name,
					slug: p.slug,
					sku: p.sku ?? "",
					description: p.description ?? "",
					short_description: p.short_description ?? "",
					price: String(p.price),
					compare_price: p.compare_price ? String(p.compare_price) : "",
					stock: String(p.stock),
					low_stock_threshold: String(p.low_stock_threshold),
					status: p.status,
					category_id: p.category_id,
					subcategory_id: p.category_id,
					sizes: p.sizes ?? [],
					colors: p.colors ?? [],
					fabric: p.fabric ?? "",
					material: p.material ?? "",
					is_new: p.is_new,
					is_best_seller: p.is_best_seller,
					featured: p.featured,
					size_stock: p.size_stock ?? {}
				});
				setImages(data.images ?? []);
				setLoadingData(false);
			}).catch(() => setLoadingData(false));
		} else if (open) {
			setForm({
				name: "",
				slug: "",
				sku: "",
				description: "",
				short_description: "",
				price: "",
				compare_price: "",
				stock: "",
				low_stock_threshold: "5",
				status: "draft",
				category_id: "",
				subcategory_id: "",
				sizes: [],
				colors: [],
				fabric: "",
				material: "",
				is_new: false,
				is_best_seller: false,
				featured: false,
				size_stock: {}
			});
			setImages([]);
			setErrors({});
		}
	}, [open, productId]);
	function handleNameChange(name) {
		setForm((prev) => ({
			...prev,
			name,
			slug: isEdit ? prev.slug : slugify(name)
		}));
	}
	function set(key, value) {
		setForm((prev) => ({
			...prev,
			[key]: value
		}));
	}
	function toggleSize(size) {
		setForm((prev) => ({
			...prev,
			sizes: prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size]
		}));
	}
	function addColor() {
		if (!colorName.trim()) return;
		setForm((prev) => ({
			...prev,
			colors: [...prev.colors, {
				name: colorName.trim(),
				hex: colorHex
			}]
		}));
		setColorName("");
		setColorHex("#000000");
	}
	function removeColor(index) {
		setForm((prev) => ({
			...prev,
			colors: prev.colors.filter((_, i) => i !== index)
		}));
	}
	const computedStock = (0, import_react.useMemo)(() => calculateProductStock(form.size_stock), [form.size_stock]);
	const sizeInventoryEnabled = (0, import_react.useMemo)(() => isSizeInventoryEnabled(form.size_stock), [form.size_stock]);
	function setSizeStock(size, value) {
		setForm((prev) => ({
			...prev,
			size_stock: {
				...prev.size_stock,
				[size]: value
			}
		}));
	}
	async function handleImageUpload(e) {
		const file = e.target.files?.[0];
		if (!file || !productId) return;
		setUploading(true);
		try {
			const result = await uploadProductImage(productId, file);
			setImages((prev) => [...prev, {
				id: result.id,
				image_url: result.image_url,
				alt_text: null,
				sort_order: prev.length
			}]);
		} catch (err) {
			setErrors({ images: err instanceof Error ? err.message : "Upload failed" });
		} finally {
			setUploading(false);
			if (fileRef.current) fileRef.current.value = "";
		}
	}
	async function handleDeleteImage(imageId) {
		try {
			await deleteProductImage(imageId);
			setImages((prev) => prev.filter((img) => img.id !== imageId));
		} catch {}
	}
	async function handleMoveImage(index, direction) {
		const newImages = [...images];
		const target = index + direction;
		if (target < 0 || target >= newImages.length) return;
		[newImages[index], newImages[target]] = [newImages[target], newImages[index]];
		const reordered = newImages.map((img, i) => ({
			...img,
			sort_order: i
		}));
		setImages(reordered);
		try {
			await reorderProductImages(reordered.map((img) => ({
				id: img.id,
				sort_order: img.sort_order
			})));
		} catch {}
	}
	function validate() {
		const e = {};
		if (!form.name.trim()) e.name = "Name is required";
		if (!form.slug.trim()) e.slug = "Slug is required";
		if (!form.sku.trim()) e.sku = "SKU is required";
		const price = parseFloat(form.price);
		if (!form.price || isNaN(price) || price <= 0) e.price = "Price must be greater than 0";
		if (sizeInventoryEnabled) {
			if (computedStock < 0) e.stock = "Stock must be 0 or greater";
		} else {
			const stock = parseInt(form.stock, 10);
			if (form.stock === "" || isNaN(stock) || stock < 0) e.stock = "Stock must be 0 or greater";
		}
		const threshold = parseInt(form.low_stock_threshold, 10);
		if (form.low_stock_threshold === "" || isNaN(threshold) || threshold < 0) e.low_stock_threshold = "Must be 0 or greater";
		if (!form.category_id) e.category_id = "Parent category is required";
		if (!form.subcategory_id) e.subcategory_id = "Subcategory is required";
		setErrors(e);
		return Object.keys(e).length === 0;
	}
	async function handleSubmit(e) {
		e.preventDefault();
		if (!validate()) return;
		setSaving(true);
		try {
			const sizeStock = buildSizeStock(form.sizes, form.size_stock);
			const productData = {
				name: form.name.trim(),
				slug: form.slug.trim(),
				sku: form.sku.trim(),
				description: form.description.trim() || void 0,
				short_description: form.short_description.trim() || void 0,
				price: parseFloat(form.price),
				compare_price: form.compare_price ? parseFloat(form.compare_price) : void 0,
				stock: sizeInventoryEnabled ? computedStock : parseInt(form.stock, 10),
				low_stock_threshold: parseInt(form.low_stock_threshold, 10),
				sizes: form.sizes,
				size_stock: sizeStock,
				colors: form.colors,
				fabric: form.fabric.trim() || void 0,
				material: form.material.trim() || void 0,
				is_new: form.is_new,
				is_best_seller: form.is_best_seller,
				featured: form.featured,
				category_id: form.subcategory_id,
				status: form.status
			};
			if (isEdit && productId) await updateProduct(productId, productData);
			else await createProduct(productData);
			onSaved();
			onClose();
		} catch (err) {
			setErrors({ submit: err instanceof Error ? err.message : "Failed to save product" });
		} finally {
			setSaving(false);
		}
	}
	const canUpload = isEdit;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (o) => {
			if (!o) onClose();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "sm:max-w-3xl max-h-[90vh] overflow-y-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: isEdit ? "Edit Product" : "Create Product" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: isEdit ? "Update product details, images, sizes, colors, and inventory." : "Fill in the details to add a new product." })] }), loadingData ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "py-12 text-center text-sm text-muted-foreground",
				children: "Loading product data..."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: handleSubmit,
				className: "space-y-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "space-y-4 border border-border/60 p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
								className: "text-xs tracking-[0.2em] uppercase px-2 font-medium",
								children: "Basic Information"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "name",
											children: "Product Name *"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "name",
											value: form.name,
											onChange: (e) => handleNameChange(e.target.value)
										}),
										errors.name && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-red",
											children: errors.name
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "slug",
											children: "Slug"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "slug",
											value: form.slug,
											onChange: (e) => set("slug", e.target.value)
										}),
										errors.slug && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-red",
											children: errors.slug
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "sku",
											children: "SKU *"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "sku",
											value: form.sku,
											onChange: (e) => set("sku", e.target.value)
										}),
										errors.sku && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-red",
											children: errors.sku
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "status",
										children: "Stock Status"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										id: "status",
										value: form.status,
										onChange: (e) => set("status", e.target.value),
										className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
										children: STATUS_OPTIONS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: s,
											children: s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
										}, s))
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "price",
											children: "Price *"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "price",
											type: "number",
											step: "0.01",
											min: "0",
											value: form.price,
											onChange: (e) => set("price", e.target.value)
										}),
										errors.price && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-red",
											children: errors.price
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "compare_price",
										children: "Compare At Price"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "compare_price",
										type: "number",
										step: "0.01",
										min: "0",
										value: form.compare_price,
										onChange: (e) => set("compare_price", e.target.value)
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "description",
									children: "Description"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									id: "description",
									rows: 3,
									value: form.description,
									onChange: (e) => set("description", e.target.value),
									className: "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm resize-none"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "short_description",
									children: "Short Description"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									id: "short_description",
									rows: 2,
									value: form.short_description,
									onChange: (e) => set("short_description", e.target.value),
									className: "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm resize-none"
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "space-y-4 border border-border/60 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "text-xs tracking-[0.2em] uppercase px-2 font-medium",
							children: "Category"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "category_id",
										children: "Parent Category *"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										id: "category_id",
										value: form.category_id,
										onChange: (e) => {
											set("category_id", e.target.value);
											set("subcategory_id", "");
										},
										className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Select parent"
										}), parentCategories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: c.id,
											children: c.name
										}, c.id))]
									}),
									errors.category_id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-red",
										children: errors.category_id
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "subcategory_id",
										children: "Subcategory *"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										id: "subcategory_id",
										value: form.subcategory_id,
										onChange: (e) => set("subcategory_id", e.target.value),
										className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
										disabled: !form.category_id,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Select subcategory"
										}), subCategories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: c.id,
											children: c.name
										}, c.id))]
									}),
									errors.subcategory_id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-red",
										children: errors.subcategory_id
									})
								]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "space-y-3 border border-border/60 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "text-xs tracking-[0.2em] uppercase px-2 font-medium",
							children: "Available Sizes"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: SIZE_OPTIONS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => toggleSize(s),
								className: `min-w-10 h-10 px-3 text-sm border transition-all duration-300 ${form.sizes.includes(s) ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`,
								children: s
							}, s))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "space-y-3 border border-border/60 p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
								className: "text-xs tracking-[0.2em] uppercase px-2 font-medium",
								children: "Colors"
							}),
							form.colors.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-3 mb-3",
								children: form.colors.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 border border-border/60 px-3 py-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "w-5 h-5 rounded-full border",
											style: { backgroundColor: c.hex }
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm",
											children: c.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => removeColor(i),
											className: "text-xs text-muted-foreground hover:text-red ml-1",
											children: "✕"
										})
									]
								}, i))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-end gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs",
											children: "Color Name"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: colorName,
											onChange: (e) => setColorName(e.target.value),
											placeholder: "e.g. Black",
											className: "h-8 text-sm"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs",
											children: "Hex"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "color",
												value: colorHex,
												onChange: (e) => setColorHex(e.target.value),
												className: "h-8 w-8 border border-border p-0.5 cursor-pointer"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: colorHex,
												onChange: (e) => setColorHex(e.target.value),
												className: "h-8 w-24 text-xs font-mono"
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "outline",
										size: "sm",
										onClick: addColor,
										children: "Add"
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "space-y-3 border border-border/60 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "text-xs tracking-[0.2em] uppercase px-2 font-medium",
							children: "Images"
						}), !canUpload ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Save the product first to enable image upload."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-3",
								children: images.map((img, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative w-28 aspect-[3/4] bg-neutral border group",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: img.image_url,
										alt: img.alt_text ?? "",
										className: "h-full w-full object-cover"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => handleMoveImage(i, -1),
												disabled: i === 0,
												className: "h-6 w-6 bg-background/80 grid place-items-center text-xs disabled:opacity-30",
												children: "‹"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => handleMoveImage(i, 1),
												disabled: i === images.length - 1,
												className: "h-6 w-6 bg-background/80 grid place-items-center text-xs disabled:opacity-30",
												children: "›"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: () => handleDeleteImage(img.id),
												className: "h-6 w-6 bg-red/80 text-white grid place-items-center text-xs",
												children: "✕"
											})
										]
									})]
								}, img.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										ref: fileRef,
										type: "file",
										accept: "image/*",
										onChange: handleImageUpload,
										className: "hidden"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "outline",
										size: "sm",
										onClick: () => fileRef.current?.click(),
										disabled: uploading,
										children: uploading ? "Uploading..." : "Upload Image"
									}),
									uploading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "Uploading..."
									})
								]
							}),
							errors.images && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-red",
								children: errors.images
							})
						] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "space-y-4 border border-border/60 p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
								className: "text-xs tracking-[0.2em] uppercase px-2 font-medium",
								children: "Inventory"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-3 gap-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
												htmlFor: "stock",
												children: ["Quantity *", sizeInventoryEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs text-muted-foreground ml-2",
													children: "(auto-calculated from sizes)"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "stock",
												type: "number",
												min: "0",
												value: sizeInventoryEnabled ? String(computedStock) : form.stock,
												onChange: (e) => set("stock", e.target.value),
												disabled: sizeInventoryEnabled,
												className: sizeInventoryEnabled ? "opacity-60" : ""
											}),
											errors.stock && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-red",
												children: errors.stock
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												htmlFor: "low_stock_threshold",
												children: "Low Stock Threshold"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "low_stock_threshold",
												type: "number",
												min: "0",
												value: form.low_stock_threshold,
												onChange: (e) => set("low_stock_threshold", e.target.value)
											}),
											errors.low_stock_threshold && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-red",
												children: errors.low_stock_threshold
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											htmlFor: "fabric",
											children: "Fabric / Material"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "fabric",
											value: form.fabric,
											onChange: (e) => set("fabric", e.target.value)
										})]
									})
								]
							}),
							form.sizes.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-t border-border/40 pt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs tracking-[0.2em] uppercase font-medium mb-3",
									children: "Per-Size Stock"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-3 sm:grid-cols-6 gap-3",
									children: form.sizes.map((size) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs text-center block",
											children: size
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											min: "0",
											value: form.size_stock[size] ?? 0,
											onChange: (e) => setSizeStock(size, Math.max(0, parseInt(e.target.value) || 0)),
											className: "h-8 text-center text-sm"
										})]
									}, size))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "material",
									children: "Material (for jewellery)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "material",
									value: form.material,
									onChange: (e) => set("material", e.target.value)
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "space-y-3 border border-border/60 p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "text-xs tracking-[0.2em] uppercase px-2 font-medium",
							children: "Labels"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-2 cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: form.is_new,
										onChange: (e) => set("is_new", e.target.checked),
										className: "h-4 w-4 rounded border-border accent-foreground"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm",
										children: "New Arrival"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-2 cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: form.is_best_seller,
										onChange: (e) => set("is_best_seller", e.target.checked),
										className: "h-4 w-4 rounded border-border accent-foreground"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm",
										children: "Best Seller"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex items-center gap-2 cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: form.featured,
										onChange: (e) => set("featured", e.target.checked),
										className: "h-4 w-4 rounded border-border accent-foreground"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm",
										children: "Featured Product"
									})]
								})
							]
						})]
					}),
					errors.submit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-red text-center",
						children: errors.submit
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-end gap-3 pt-2 border-t border-border/60",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: onClose,
							disabled: saving,
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: saving,
							children: saving ? "Saving…" : isEdit ? "Save Changes" : "Create Product"
						})]
					})
				]
			})]
		})
	});
}
var STATUS_BADGES = {
	active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
	draft: "bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-300",
	archived: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800/30 dark:text-neutral-400",
	out_of_stock: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
};
function StatusBadge({ status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `inline-block px-2.5 py-1 text-[10px] tracking-[0.2em] uppercase ${STATUS_BADGES[status] ?? "bg-neutral-100 text-muted-foreground"}`,
		children: status === "out_of_stock" ? "Out of Stock" : status
	});
}
function ProductsSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 w-full" }), Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-12 w-full" }, i))]
	});
}
function ProductsEmptyState({ hasFilters }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "border border-border/60 p-12 text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: hasFilters ? "No products match your filters" : "No products yet — create your first product to get started."
		})
	});
}
function ProductsErrorState({ message, onRetry }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border border-red/20 bg-red/5 p-6 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-red/80",
			children: message
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			size: "sm",
			onClick: onRetry,
			className: "mt-3",
			children: "Retry"
		})]
	});
}
function Pagination({ page, total, pageSize, onPage }) {
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between text-sm text-muted-foreground pt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
			total,
			" product",
			total !== 1 ? "s" : ""
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					disabled: page <= 1,
					onClick: () => onPage(page - 1),
					children: "Previous"
				}),
				Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
					const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
					if (p > totalPages) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => onPage(p),
						className: `w-8 h-8 text-xs rounded-md ${p === page ? "bg-foreground text-background" : "border border-border/60 text-muted-foreground hover:border-foreground/30"}`,
						children: p
					}, p);
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					disabled: page >= totalPages,
					onClick: () => onPage(page + 1),
					children: "Next"
				})
			]
		})]
	});
}
function DeleteConfirmDialog({ products, onConfirm, onCancel, deleting }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-center justify-center bg-black/80",
		onClick: onCancel,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm border bg-background p-6 shadow-lg",
			onClick: (e) => e.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-serif text-lg",
					children: ["Delete Product", products.length > 1 ? "s" : ""]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-2",
					children: products.length === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						"Are you sure you want to delete ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: products[0].name }),
						"? This cannot be undone."
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						"Are you sure you want to delete ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: products.length }),
						" products? This cannot be undone."
					] })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-end gap-3 mt-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						size: "sm",
						onClick: onCancel,
						disabled: deleting,
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "destructive",
						size: "sm",
						onClick: onConfirm,
						disabled: deleting,
						children: deleting ? "Deleting…" : "Delete"
					})]
				})
			]
		})
	});
}
function ProductsTable() {
	const [page, setPage] = (0, import_react.useState)(1);
	const [searchInput, setSearchInput] = (0, import_react.useState)("");
	const [search, setSearch] = (0, import_react.useState)("");
	const [sortBy, setSortBy] = (0, import_react.useState)("created_at");
	const [sortDir, setSortDir] = (0, import_react.useState)("desc");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("");
	const [categoryFilter, setCategoryFilter] = (0, import_react.useState)("");
	const [stockFilter, setStockFilter] = (0, import_react.useState)("");
	const [modalOpen, setModalOpen] = (0, import_react.useState)(false);
	const [editingProductId, setEditingProductId] = (0, import_react.useState)(null);
	const [duplicating, setDuplicating] = (0, import_react.useState)(null);
	const [selected, setSelected] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [deletingProducts, setDeletingProducts] = (0, import_react.useState)(null);
	const [deleting, setDeleting] = (0, import_react.useState)(false);
	const pageSize = 15;
	const { categories } = useProductCategories();
	const debouncedSearch = (0, import_react.useCallback)((() => {
		let timer;
		return (val) => {
			clearTimeout(timer);
			timer = setTimeout(() => {
				setSearch(val);
				setPage(1);
			}, 300);
		};
	})(), []);
	const { result, loading, error, refetch } = useProductsManagement(page, pageSize, search, sortBy, sortDir, statusFilter === "out_of_stock" ? "out_of_stock" : statusFilter, categoryFilter, stockFilter);
	const hasFilters = !!(search || statusFilter || categoryFilter || stockFilter);
	const products = result?.products ?? [];
	const allSelected = products.length > 0 && products.every((p) => selected.has(p.id));
	const someSelected = selected.size > 0;
	function toggleSort(column) {
		if (sortBy === column) setSortDir((d) => d === "asc" ? "desc" : "asc");
		else {
			setSortBy(column);
			setSortDir("desc");
		}
		setPage(1);
	}
	function SortIcon({ column }) {
		if (sortBy !== column) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground/40 ml-1",
			children: "↕"
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "ml-1",
			children: sortDir === "asc" ? "↑" : "↓"
		});
	}
	function toggleAll() {
		if (!result) return;
		if (allSelected) setSelected(/* @__PURE__ */ new Set());
		else setSelected(new Set(result.products.map((p) => p.id)));
	}
	function toggleOne(id) {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}
	function handleCreate() {
		setEditingProductId(null);
		setModalOpen(true);
	}
	function handleEdit(product) {
		setEditingProductId(product.id);
		setModalOpen(true);
	}
	async function handleDuplicate(productId) {
		setDuplicating(productId);
		try {
			await duplicateProduct(productId);
			refetch();
		} catch {} finally {
			setDuplicating(null);
		}
	}
	async function handleBulkAction(action) {
		const ids = Array.from(selected);
		if (ids.length === 0) return;
		if (action === "delete") {
			setDeletingProducts(result?.products.filter((p) => selected.has(p.id)) ?? []);
			return;
		}
		try {
			if (action === "activate") await bulkUpdateProducts(ids, { status: "active" });
			else if (action === "deactivate") await bulkUpdateProducts(ids, { status: "draft" });
			else if (action === "archive") await bulkUpdateProducts(ids, { status: "archived" });
			setSelected(/* @__PURE__ */ new Set());
			refetch();
		} catch {}
	}
	async function handleBulkDeleteConfirm() {
		if (!deletingProducts || deletingProducts.length === 0) return;
		setDeleting(true);
		try {
			await bulkDeleteProducts(deletingProducts.map((p) => p.id));
			setDeletingProducts(null);
			setSelected(/* @__PURE__ */ new Set());
			refetch();
		} catch {} finally {
			setDeleting(false);
		}
	}
	async function handleDeleteSingle(product) {
		setDeletingProducts([product]);
	}
	function handleSaved() {
		refetch();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Search by name or SKU…",
						value: searchInput,
						onChange: (e) => {
							setSearchInput(e.target.value);
							debouncedSearch(e.target.value);
						},
						className: "max-w-64 h-9 text-sm"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: statusFilter,
						onChange: (e) => {
							setStatusFilter(e.target.value);
							setPage(1);
						},
						className: "h-9 rounded-md border border-input bg-background px-3 text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "All Statuses"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "active",
								children: "Active"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "draft",
								children: "Draft"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "archived",
								children: "Archived"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "out_of_stock",
								children: "Out of Stock"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: categoryFilter,
						onChange: (e) => {
							setCategoryFilter(e.target.value);
							setPage(1);
						},
						className: "h-9 rounded-md border border-input bg-background px-3 text-xs text-muted-foreground max-w-40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "All Categories"
						}), categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: c.id,
							children: c.name
						}, c.id))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: stockFilter,
						onChange: (e) => {
							setStockFilter(e.target.value);
							setPage(1);
						},
						className: "h-9 rounded-md border border-input bg-background px-3 text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "All Stock"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "in_stock",
								children: "In Stock"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "low_stock",
								children: "Low Stock (≤10)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "out_of_stock",
								children: "Out of Stock"
							})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: handleCreate,
				size: "sm",
				children: "Create Product"
			})]
		}),
		someSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3 mb-4 p-3 border border-border/60 bg-muted/30",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-muted-foreground",
					children: [selected.size, " selected"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => handleBulkAction("activate"),
					children: "Activate"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => handleBulkAction("deactivate"),
					children: "Deactivate"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => handleBulkAction("archive"),
					children: "Archive"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "sm",
					onClick: () => handleBulkAction("delete"),
					className: "text-red/80 hover:text-red",
					children: "Delete"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: () => setSelected(/* @__PURE__ */ new Set()),
					children: "Clear"
				})
			]
		}),
		error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductsErrorState, {
			message: error,
			onRetry: refetch
		}),
		loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductsSkeleton, {}),
		!loading && !error && result && result.products.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductsEmptyState, { hasFilters }),
		!loading && !error && result && result.products.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border border-border/60 overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					className: "w-10",
					children: allSelected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
						checked: true,
						onCheckedChange: toggleAll
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
						checked: false,
						onCheckedChange: (v) => {
							if (v) toggleAll();
						}
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					className: "w-14",
					children: "Image"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
					className: "cursor-pointer min-w-[160px]",
					onClick: () => toggleSort("name"),
					children: ["Product Name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "name" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
					className: "cursor-pointer",
					onClick: () => toggleSort("sku"),
					children: ["SKU", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "sku" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
					className: "cursor-pointer",
					onClick: () => toggleSort("category_name"),
					children: ["Category", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "category_name" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
					className: "cursor-pointer text-right",
					onClick: () => toggleSort("price"),
					children: ["Price", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "price" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
					className: "cursor-pointer text-right",
					onClick: () => toggleSort("stock"),
					children: ["Stock", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "stock" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
					className: "cursor-pointer",
					onClick: () => toggleSort("status"),
					children: ["Status", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "status" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
					className: "cursor-pointer",
					onClick: () => toggleSort("created_at"),
					children: ["Created", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortIcon, { column: "created_at" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
					className: "text-right",
					children: "Actions"
				})
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: result.products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
				className: selected.has(p.id) ? "bg-muted/20" : "",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
						checked: selected.has(p.id),
						onCheckedChange: () => toggleOne(p.id)
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: p.thumbnail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: p.thumbnail,
						alt: "",
						className: "w-10 h-13 object-cover rounded"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-10 h-13 bg-neutral rounded" }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-medium",
						children: p.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs text-muted-foreground font-mono",
						children: p.sku ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs text-muted-foreground",
						children: p.category_name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
						className: "text-right font-serif tabular-nums",
						children: ["$", Number(p.price).toLocaleString()]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right font-mono tabular-nums",
						children: p.stock
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: p.status }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-xs text-muted-foreground whitespace-nowrap",
						children: new Date(p.created_at).toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
							year: "numeric"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-end gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => handleEdit(p),
									children: "Edit"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => handleDuplicate(p.id),
									disabled: duplicating === p.id,
									children: duplicating === p.id ? "…" : "Duplicate"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => handleDeleteSingle(p),
									className: "text-red/80 hover:text-red",
									children: "Delete"
								})
							]
						})
					})
				]
			}, p.id)) })] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
			page,
			total: result?.total ?? 0,
			pageSize,
			onPage: setPage
		})] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductForm, {
			open: modalOpen,
			onClose: () => setModalOpen(false),
			onSaved: handleSaved,
			productId: editingProductId
		}),
		deletingProducts && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeleteConfirmDialog, {
			products: deletingProducts,
			onConfirm: deletingProducts.length > 1 ? handleBulkDeleteConfirm : async () => {
				if (deletingProducts.length !== 1) return;
				setDeleting(true);
				try {
					await deleteProduct(deletingProducts[0].id);
					setDeletingProducts(null);
					setSelected(/* @__PURE__ */ new Set());
					refetch();
				} catch {} finally {
					setDeleting(false);
				}
			},
			onCancel: () => setDeletingProducts(null),
			deleting
		})
	] });
}
function AdminProductsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminLayout, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mb-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "eyebrow",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/admin",
						className: "hover:text-foreground transition-colors",
						children: "Admin"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-serif text-4xl mt-2",
					children: "Products"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-2 max-w-lg",
					children: "Manage your product catalog — create, edit, duplicate, and organize products."
				})
			] })
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductsTable, {})] });
}
//#endregion
export { AdminProductsPage as component };
