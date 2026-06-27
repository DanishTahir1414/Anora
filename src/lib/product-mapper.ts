import type { Product, ColorVariant } from "./products";
import type { DbProduct, DbProductImage } from "./products-db";

interface MappedProductImages {
  images: string[];
  colorVariants?: ColorVariant[];
}

function mapImages(images: DbProductImage[]): string[] {
  return images
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => img.image_url)
    .filter(Boolean);
}

function mapColorsToVariants(db: DbProduct, imageUrls: string[]): ColorVariant[] | undefined {
  if (!db.colors || db.colors.length === 0) return undefined;
  return db.colors.map((c) => ({
    color: c.name,
    images: imageUrls,
    sizes: db.sizes,
    sizeStock: db.size_stock ?? {},
    stock: db.stock,
    sku: db.sku ?? "",
  }));
}

export function mapDbProductToStatic(
  db: DbProduct,
  dbImages: DbProductImage[],
  parentCategorySlug: string,
  subcategoryName: string,
): Product {
  const imageUrls = mapImages(dbImages);
  const variants = mapColorsToVariants(db, imageUrls);

  return {
    id: db.id,
    slug: db.slug,
    name: db.name,
    price: db.price,
    category: parentCategorySlug as "clothing" | "jewellery",
    subcategory: subcategoryName,
    description: db.description ?? "",
    fabric: db.fabric ?? undefined,
    material: db.material ?? undefined,
    color: db.colors?.[0]?.name ?? "Ivory",
    sizes: db.sizes,
    sku: db.sku ?? "",
    stock: db.stock,
    sizeStock: db.size_stock ?? {},
    images: imageUrls,
    badge: db.is_new ? "New" : db.is_best_seller ? "Best Seller" : undefined,
    colorVariants: variants,
    metadata: {
      low_stock: db.stock > 0 && db.stock <= db.low_stock_threshold,
    },
  };
}
