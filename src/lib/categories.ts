import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabase";
import type { Product } from "./products";
import type { Category } from "./products";
import { registerProduct } from "./customer-services";

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  parent_id: string | null;
  product_count: number;
  children: CategoryNode[];
}

export interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
  parent_name: string | null;
}

export interface PublicProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_price: number | null;
  description: string | null;
  badge: string | null;
  is_active: boolean;
  created_at: string;
  category_slug: string;
  category_name: string;
  category_id: string;
  sizes?: string[];
  images?: string[];
  sku?: string;
  stock?: number;
  size_stock?: Record<string, number>;
  color?: string;
  sale_active?: boolean;
  discount_percent?: number;
}

export async function getActiveCategories(): Promise<CategoryNode[]> {
  const { data, error } = await supabase.rpc("get_active_categories");
  if (error) throw error;
  return (data ?? []) as CategoryNode[];
}

export async function getCategoryBySlug(slug: string): Promise<CategoryInfo | null> {
  const { data, error } = await supabase.rpc("get_category_by_slug", { p_slug: slug });
  if (error) throw error;
  return data as CategoryInfo | null;
}



export async function getProductsByCategorySlug(
  slug: string,
  page = 1,
  pageSize = 50,
): Promise<PublicProduct[]> {
  const { data, error } = await supabase.rpc("get_products_by_category_slug", {
    p_slug: slug,
    p_page: page,
    p_page_size: pageSize,
  });
  if (error) throw error;
  return (data ?? []) as PublicProduct[];
}

export async function getProductsByCategoryAndSubcategory(
  categorySlug: string,
  subcategorySlug: string,
  page = 1,
  pageSize = 50,
): Promise<PublicProduct[]> {
  const { data, error } = await supabase.rpc("get_products_by_category_and_subcategory", {
    p_category_slug: categorySlug,
    p_subcategory_slug: subcategorySlug,
    p_page: page,
    p_page_size: pageSize,
  });
  if (error) throw error;
  return (data ?? []) as PublicProduct[];
}

// ─── TanStack Query hooks ──────────────────────────────────────────────

export function useActiveCategories() {
  return useQuery({
    queryKey: ["active-categories"],
    queryFn: getActiveCategories,
  });
}

export function useCategoryProducts(slug: string) {
  return useQuery({
    queryKey: ["category-products", slug],
    queryFn: () => getProductsByCategorySlug(slug),
    enabled: !!slug,
  });
}

export function useSubcategoryProducts(categorySlug: string, subcategorySlug: string) {
  return useQuery({
    queryKey: ["subcategory-products", categorySlug, subcategorySlug],
    queryFn: () => getProductsByCategoryAndSubcategory(categorySlug, subcategorySlug),
    enabled: !!categorySlug && !!subcategorySlug,
  });
}

export function toProductProps(p: PublicProduct): Product {
  const product: Product = {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: Number(p.price),
    compare_price: p.compare_price,
    category: p.category_slug as Category,
    subcategory: p.category_name,
    description: p.description ?? "",
    color: p.color ?? "Ivory",
    sizes: p.sizes ?? [],
    sku: p.sku ?? "",
    stock: p.stock ?? 0,
    sizeStock: p.size_stock ?? {},
    images: p.images ?? [],
    badge: p.badge ?? undefined,
    sale_active: p.sale_active,
    discount_percent: p.discount_percent,
  };
  registerProduct(product);
  return product;
}
