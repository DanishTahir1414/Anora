import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ProductManagementRow {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  stock: number;
  status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category_name: string;
  category_id: string;
}

export interface ProductsManagementResponse {
  products: ProductManagementRow[];
  total: number;
}

export interface CategoryOption {
  id: string;
  name: string;
}

export interface RpcResult {
  success: boolean;
  error?: string;
  id?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function rpc<T>(name: string, params?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(name, params);
  if (error) throw error;
  return data as T;
}

// ─── Hooks ──────────────────────────────────────────────────────────────────

export function useProductsManagement(
  page: number,
  pageSize: number,
  search = "",
  sortBy = "created_at",
  sortDir: "asc" | "desc" = "desc",
  status = "",
  categoryId = "",
  stockStatus = "",
) {
  const [result, setResult] = useState<ProductsManagementResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, unknown> = {
        p_page: page,
        p_page_size: pageSize,
        p_sort_by: sortBy,
        p_sort_dir: sortDir,
      };
      if (search) params.p_search = search;
      if (status) params.p_status = status;
      if (categoryId) params.p_category_id = categoryId;
      if (stockStatus) params.p_stock_status = stockStatus;

      const data = await rpc<ProductsManagementResponse>("get_products_management", params);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, sortBy, sortDir, status, categoryId, stockStatus]);

  useEffect(() => { load(); }, [load]);

  return { result, loading, error, refetch: load };
}

export function useProductCategories() {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("categories")
      .select("id, name")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        setCategories(data ?? []);
        setLoading(false);
      });
  }, []);

  return { categories, loading };
}

// ─── Mutations ──────────────────────────────────────────────────────────────

export async function createProduct(data: {
  name: string;
  slug: string;
  sku: string;
  price: number;
  stock: number;
  category_id: string;
  description?: string;
  status?: string;
}) {
  const { error } = await supabase.from("products").insert({
    name: data.name,
    slug: data.slug,
    sku: data.sku,
    price: data.price,
    stock: data.stock,
    category_id: data.category_id,
    description: data.description ?? null,
    status: data.status ?? "draft",
    is_active: (data.status ?? "draft") === "active" || (data.status ?? "draft") === "out_of_stock",
  });
  if (error) throw error;
}

export async function updateProduct(
  id: string,
  data: {
    name: string;
    sku: string;
    price: number;
    stock: number;
    description?: string;
    status?: string;
    is_active?: boolean;
  },
) {
  const updateData: Record<string, unknown> = {
    name: data.name,
    sku: data.sku,
    price: data.price,
    stock: data.stock,
  };
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) {
    updateData.status = data.status;
    updateData.is_active = data.status === "active" || data.status === "out_of_stock";
  }
  if (data.is_active !== undefined && data.status === undefined) {
    updateData.is_active = data.is_active;
  }

  const { error } = await supabase.from("products").update(updateData).eq("id", id);
  if (error) throw error;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function duplicateProduct(productId: string): Promise<RpcResult> {
  return rpc<RpcResult>("duplicate_product", { p_product_id: productId });
}

export async function bulkUpdateProducts(
  ids: string[],
  data: { status?: string; is_active?: boolean },
): Promise<RpcResult> {
  const params: Record<string, unknown> = { p_ids: ids };
  if (data.status) params.p_status = data.status;
  if (data.is_active !== undefined) params.p_is_active = data.is_active;
  return rpc<RpcResult>("bulk_update_products", params);
}

export async function bulkDeleteProducts(ids: string[]): Promise<RpcResult> {
  return rpc<RpcResult>("bulk_delete_products", { p_ids: ids });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
