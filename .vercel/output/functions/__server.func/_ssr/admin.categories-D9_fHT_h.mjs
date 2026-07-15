import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { M as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { r as supabase } from "./auth-context-oFJLTVEi.mjs";
import { t as AdminLayout } from "./utils-Cy0gksMl.mjs";
import { t as Input } from "./input-Ch8T9SMc.mjs";
import { t as Button } from "./button-Dfd9l4mi.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-CvsFPszi.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-3x9W9oz0.mjs";
import { a as AlertDialogDescription, c as AlertDialogTitle, i as AlertDialogContent, n as AlertDialogAction, o as AlertDialogFooter, r as AlertDialogCancel, s as AlertDialogHeader, t as AlertDialog } from "./alert-dialog-Dm5O1Pb3.mjs";
import { t as Label } from "./label-DJfgubqt.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.categories-D9_fHT_h.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function rpc(name, params) {
	const { data, error } = await supabase.rpc(name, params);
	if (error) throw error;
	return data;
}
function useCategoriesManagement(page, pageSize, search = "", sortBy = "name", sortDir = "asc") {
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
			setResult(await rpc("get_categories_management", params));
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
		sortDir
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
function slugify(text) {
	return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
async function createCategory(name, slug, parentId, description, imageUrl, sortOrder, isActive) {
	return rpc("create_category", {
		p_name: name,
		p_slug: slug,
		p_parent_id: parentId ?? null,
		p_description: description ?? null,
		p_image_url: imageUrl ?? null,
		p_sort_order: sortOrder ?? 0,
		p_is_active: isActive ?? true
	});
}
async function updateCategory(id, name, slug, parentId, description, imageUrl, sortOrder, isActive) {
	return rpc("update_category", {
		p_id: id,
		p_name: name,
		p_slug: slug,
		p_parent_id: parentId ?? null,
		p_description: description ?? null,
		p_image_url: imageUrl ?? null,
		p_sort_order: sortOrder ?? 0,
		p_is_active: isActive ?? true
	});
}
async function deleteCategory(id) {
	return rpc("delete_category", { p_id: id });
}
async function getParentCategories() {
	return rpc("get_parent_categories");
}
function CategoriesTable() {
	const [page, setPage] = (0, import_react.useState)(1);
	const [search, setSearch] = (0, import_react.useState)("");
	const [sortBy, setSortBy] = (0, import_react.useState)("name");
	const [sortDir, setSortDir] = (0, import_react.useState)("asc");
	const pageSize = 20;
	const { result, loading, error, refetch } = useCategoriesManagement(page, pageSize, search, sortBy, sortDir);
	function handleSort(column) {
		if (sortBy === column) setSortDir((d) => d === "asc" ? "desc" : "asc");
		else {
			setSortBy(column);
			setSortDir("asc");
		}
		setPage(1);
	}
	const sortIndicator = (column) => {
		if (sortBy !== column) return " ↕";
		return sortDir === "asc" ? " ↑" : " ↓";
	};
	const totalPages = Math.max(1, Math.ceil((result?.total ?? 0) / pageSize));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-semibold",
					children: "Categories"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateCategoryDialog, { onSuccess: () => {
					setPage(1);
					refetch();
				} })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: "Search categories...",
				value: search,
				onChange: (e) => {
					setSearch(e.target.value);
					setPage(1);
				},
				className: "max-w-sm"
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-red-500 text-sm",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-md border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
						className: "cursor-pointer select-none",
						onClick: () => handleSort("name"),
						children: ["Name", sortIndicator("name")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Parent" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Slug" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
						className: "cursor-pointer select-none text-right",
						onClick: () => handleSort("product_count"),
						children: ["Products", sortIndicator("product_count")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableHead, {
						className: "cursor-pointer select-none",
						onClick: () => handleSort("created_at"),
						children: ["Created", sortIndicator("created_at")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
						className: "text-right",
						children: "Actions"
					})
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 6,
					className: "text-center text-muted-foreground py-8",
					children: "Loading..."
				}) }) : (result?.categories?.length ?? 0) === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
					colSpan: 6,
					className: "text-center text-muted-foreground py-8",
					children: "No categories found"
				}) }) : result?.categories.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-medium",
						children: cat.parent_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-4",
							children: cat.name
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: cat.name })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-sm text-muted-foreground",
						children: cat.parent_name ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-mono text-sm",
						children: cat.slug
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right",
						children: cat.product_count
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: new Date(cat.created_at).toLocaleDateString() }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "text-right",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditCategoryDialog, {
								category: cat,
								onSuccess: refetch
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeleteCategoryDialog, {
								category: cat,
								onSuccess: refetch
							})]
						})
					})
				] }, cat.id)) })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [result?.total ?? 0, " total"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							disabled: page <= 1,
							onClick: () => setPage((p) => Math.max(1, p - 1)),
							children: "Previous"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-sm text-muted-foreground",
							children: [
								"Page ",
								page,
								" of ",
								totalPages
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							disabled: page >= totalPages,
							onClick: () => setPage((p) => p + 1),
							children: "Next"
						})
					]
				})]
			})
		]
	});
}
function CreateCategoryDialog({ onSuccess }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [slug, setSlug] = (0, import_react.useState)("");
	const [parentId, setParentId] = (0, import_react.useState)("");
	const [parents, setParents] = (0, import_react.useState)([]);
	const [error, setError] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (open) getParentCategories().then(setParents).catch(() => {});
	}, [open]);
	function handleNameChange(val) {
		setName(val);
		setSlug(slugify(val));
	}
	async function handleSubmit(e) {
		e.preventDefault();
		setError("");
		if (!name.trim()) {
			setError("Name is required");
			return;
		}
		if (!slug.trim()) {
			setError("Slug is required");
			return;
		}
		if (!parentId) {
			setError("Parent category is required");
			return;
		}
		setLoading(true);
		const result = await createCategory(name.trim(), slug.trim(), parentId);
		setLoading(false);
		if (result.success) {
			setOpen(false);
			setName("");
			setSlug("");
			setParentId("");
			onSuccess();
		} else setError(result.error ?? "Failed to create category");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick: () => setOpen(true),
			children: "Add Subcategory"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Create Subcategory" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Add a new subcategory under Clothing or Jewellery." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "cat-parent",
						children: "Parent Category"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						id: "cat-parent",
						value: parentId,
						onChange: (e) => setParentId(e.target.value),
						className: "w-full bg-background border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Select parent..."
						}), parents.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p.id,
							children: p.name
						}, p.id))]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "cat-name",
						children: "Name"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "cat-name",
						value: name,
						onChange: (e) => handleNameChange(e.target.value),
						placeholder: "Subcategory name"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "cat-slug",
						children: "Slug"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "cat-slug",
						value: slug,
						onChange: (e) => setSlug(e.target.value),
						placeholder: "subcategory-slug"
					})]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-red-500 text-sm",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: loading,
					children: loading ? "Creating..." : "Create"
				}) })
			]
		})] })]
	});
}
function EditCategoryDialog({ category, onSuccess }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)(category.name);
	const [slug, setSlug] = (0, import_react.useState)(category.slug);
	const [parentId, setParentId] = (0, import_react.useState)(category.parent_id ?? "");
	const [parents, setParents] = (0, import_react.useState)([]);
	const [error, setError] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const isRoot = !category.parent_id;
	(0, import_react.useEffect)(() => {
		if (open) getParentCategories().then(setParents).catch(() => {});
	}, [open]);
	function handleNameChange(val) {
		setName(val);
		setSlug(slugify(val));
	}
	async function handleSubmit(e) {
		e.preventDefault();
		setError("");
		if (!name.trim()) {
			setError("Name is required");
			return;
		}
		if (!slug.trim()) {
			setError("Slug is required");
			return;
		}
		setLoading(true);
		const result = await updateCategory(category.id, name.trim(), slug.trim(), isRoot ? null : parentId || null);
		setLoading(false);
		if (result.success) {
			setOpen(false);
			onSuccess();
		} else setError(result.error ?? "Failed to update category");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "sm",
			onClick: () => {
				setName(category.name);
				setSlug(category.slug);
				setParentId(category.parent_id ?? "");
				setError("");
				setOpen(true);
			},
			children: "Edit"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Edit Category" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Update category details." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			className: "space-y-4",
			children: [
				!isRoot && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "edit-parent",
						children: "Parent Category"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						id: "edit-parent",
						value: parentId,
						onChange: (e) => setParentId(e.target.value),
						className: "w-full bg-background border border-border px-4 py-3 text-sm outline-none focus:border-foreground transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Select parent..."
						}), parents.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: p.id,
							children: p.name
						}, p.id))]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "edit-name",
						children: "Name"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "edit-name",
						value: name,
						onChange: (e) => handleNameChange(e.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "edit-slug",
						children: "Slug"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "edit-slug",
						value: slug,
						onChange: (e) => setSlug(e.target.value)
					})]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-red-500 text-sm",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: loading,
					children: loading ? "Saving..." : "Save"
				}) })
			]
		})] })]
	});
}
function DeleteCategoryDialog({ category, onSuccess }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	async function handleDelete() {
		setError("");
		setLoading(true);
		const result = await deleteCategory(category.id);
		setLoading(false);
		if (result.success) {
			setOpen(false);
			onSuccess();
		} else setError(result.error ?? "Failed to delete category");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "sm",
			onClick: () => setOpen(true),
			children: "Delete"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: "Delete Category" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
				"Are you sure you want to delete \"",
				category.name,
				"\"? This action cannot be undone."
			] })] }),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-red-500 text-sm",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: "Cancel" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
				onClick: handleDelete,
				disabled: loading,
				children: loading ? "Deleting..." : "Delete"
			})] })
		] })]
	});
}
function CategoriesPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: "Admin"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-serif text-4xl mt-2",
				children: "Categories"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-2 max-w-lg",
				children: "Manage product categories."
			})
		]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoriesTable, {})] }) });
}
//#endregion
export { CategoriesPage as component };
