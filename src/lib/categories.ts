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

async function augmentProducts(products: PublicProduct[]): Promise<void> {
  if (products.length === 0) return;
  const ids = products.map((p) => p.id);

  const { data: stockRows } = await supabase
    .from("products")
    .select("id, stock, size_stock, sizes, sku, color")
    .in("id", ids);

  const { data: imageRows } = await supabase
    .from("product_images")
    .select("product_id, image_url, sort_order")
    .in("product_id", ids)
    .order("sort_order");

  if (stockRows) {
    const stockMap = new Map(stockRows.map((r) => [r.id, r]));
    for (const p of products) {
      const s = stockMap.get(p.id);
      if (s) {
        p.stock = s.stock;
        p.size_stock = s.size_stock as Record<string, number>;
        p.sizes = s.sizes as string[];
        p.sku = s.sku;
        p.color = s.color;
      }
    }
  }

  if (imageRows) {
    const imageMap = new Map<string, string[]>();
    for (const row of imageRows) {
      const list = imageMap.get(row.product_id);
      if (list) {
        list.push(row.image_url);
      } else {
        imageMap.set(row.product_id, [row.image_url]);
      }
    }
    for (const p of products) {
      p.images = imageMap.get(p.id) ?? [];
    }
  }
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
  const products = (data ?? []) as PublicProduct[];
  await augmentProducts(products);
  return products;
}

export async function getProductsByCategoryAndSubcategory(
  categorySlug: string,
  subcategorySlug: string,
): Promise<PublicProduct[]> {
  const { data, error } = await supabase.rpc("get_products_by_category_and_subcategory", {
    p_category_slug: categorySlug,
    p_subcategory_slug: subcategorySlug,
  });
  if (error) throw error;
  const products = (data ?? []) as PublicProduct[];
  await augmentProducts(products);
  return products;
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
  };
  registerProduct(product);
  return product;
}
