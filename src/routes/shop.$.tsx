import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/site/ProductCard";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  useActiveCategories,
  useCategoryProducts,
  toProductProps,
  type CategoryNode,
  type CategoryInfo,
} from "@/lib/categories";
import { SITE_URL } from "@/lib/config";

export const Route = createFileRoute("/shop/$")({
  head: ({ params }) => {
    const splat = params._splat || "";
    const segments = splat.split("/").filter(Boolean);
    const categorySlug = segments[segments.length - 1] ?? "clothing";
    const name = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace(/-/g, " ");
    const formattedTitle = `Luxury ${name} | ANORA New York`;
    const formattedDesc = `Explore the ANORA ${name} collection — meticulously crafted luxury and quiet elegance.`;
    return {
      meta: [
        { title: formattedTitle },
        { name: "description", content: formattedDesc },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: formattedTitle },
        { property: "og:description", content: formattedDesc },
        { property: "og:url", content: `${SITE_URL}/shop/${splat}` },
        { property: "og:type", content: "website" },
        { property: "og:image", content: `${SITE_URL}/logo.png` },
        { property: "og:site_name", content: "ANORA" },
        { property: "og:locale", content: "en_US" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: formattedTitle },
        { name: "twitter:description", content: formattedDesc },
        { name: "twitter:image", content: `${SITE_URL}/logo.png` },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/shop/${splat}` }],
    };
  },
  component: ShopNestedCategory,
});

function findNodeBySlug(nodes: CategoryNode[], slug: string): CategoryNode | null {
  for (const node of nodes) {
    if (node.slug === slug) return node;
    if (node.children && node.children.length > 0) {
      const found = findNodeBySlug(node.children, slug);
      if (found) return found;
    }
  }
  return null;
}

function collectDescendants(node: CategoryNode): CategoryNode[] {
  const list: CategoryNode[] = [];
  if (node.children) {
    for (const child of node.children) {
      list.push(child);
      list.push(...collectDescendants(child));
    }
  }
  return list;
}

function getCategoryPath(
  nodes: CategoryNode[],
  targetId: string,
  currentPath: string[] = [],
): string[] | null {
  for (const node of nodes) {
    if (node.id === targetId) {
      return [...currentPath, node.slug];
    }
    if (node.children && node.children.length > 0) {
      const path = getCategoryPath(node.children, targetId, [...currentPath, node.slug]);
      if (path) return path;
    }
  }
  return null;
}

async function fetchCategoryInfo(slug: string): Promise<CategoryInfo | null> {
  const { data, error } = await supabase.rpc("get_category_by_slug", { p_slug: slug });
  if (error) throw error;
  return data as CategoryInfo | null;
}

function ShopNestedCategory() {
  const params = Route.useParams();
  const splat = params._splat || "";
  const segments = useMemo(() => splat.split("/").filter(Boolean), [splat]);
  const categorySlug = useMemo(() => segments[segments.length - 1] ?? "clothing", [segments]);

  const [subFilter, setSubFilter] = useState("All");

  const { data: dbProducts = [], isLoading: isProductsLoading } = useCategoryProducts(categorySlug);
  const { data: allCats = [], isLoading: isCatsLoading } = useActiveCategories();

  const { data: categoryInfo, isLoading: isInfoLoading } = useQuery({
    queryKey: ["category-info", categorySlug],
    queryFn: () => fetchCategoryInfo(categorySlug),
    enabled: !!categorySlug,
  });

  const catNode = useMemo(() => findNodeBySlug(allCats, categorySlug), [allCats, categorySlug]);
  const children: CategoryNode[] = catNode?.children ?? [];
  const subs = useMemo(() => ["All", ...children.map((c) => c.name)], [children]);

  const getDescendantSlugs = (node: CategoryNode): string[] => {
    const slugs = [node.slug];
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        slugs.push(...getDescendantSlugs(child));
      }
    }
    return slugs;
  };

  const filtered = useMemo(() => {
    if (subFilter === "All") return dbProducts;
    const selectedChild = children.find((c) => c.name === subFilter);
    if (!selectedChild) return dbProducts;

    const descendantSlugs = getDescendantSlugs(selectedChild);
    return dbProducts.filter((p) => descendantSlugs.includes(p.category_slug));
  }, [subFilter, dbProducts, children]);

  const isLoading = isProductsLoading || isCatsLoading || isInfoLoading;

  const isRootCategory = categorySlug === "clothing" || categorySlug === "jewellery";

  if (isLoading) {
    return (
      <div className="py-32 text-center text-muted-foreground animate-fade">
        Loading collection...
      </div>
    );
  }

  if (!categoryInfo) {
    return (
      <div className="py-32 text-center">
        <p className="eyebrow">Not found</p>
        <h1 className="font-serif text-4xl mt-4">This category doesn't exist</h1>
        <Link
          to="/shop"
          className="inline-block mt-6 text-[11px] tracking-[0.32em] uppercase hover-underline"
        >
          Return to shop
        </Link>
      </div>
    );
  }

  const heading = categoryInfo.name;
  const tagline = categoryInfo.description;

  // Root Category configuration: behaves exactly like Shop layout
  if (isRootCategory) {
    const descendantCats = catNode ? collectDescendants(catNode) : [];
    const subCount = descendantCats.length;
    const totalProducts = dbProducts.length;

    return (
      <div className="px-5 lg:px-10 pt-16 pb-24">
        {/* Category Header */}
        <div className="text-center mb-14 max-w-2xl mx-auto animate-fade">
          <span className="eyebrow">The Atelier</span>
          <h1 className="mt-4 font-serif text-5xl md:text-6xl">{heading}</h1>
          <p className="mt-5 text-muted-foreground">
            {tagline ||
              (categorySlug === "clothing"
                ? "Silks, cashmere and ceremonial dress — slow tailored in our atelier."
                : "Recycled 18k gold and considered stones, finished entirely by hand.")}
          </p>
        </div>

        {/* Dynamic Category Tabs */}
        {descendantCats.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-14 animate-fade">
            <Link
              to={`/shop/${categorySlug}` as any}
              activeOptions={{ exact: true }}
              activeProps={{ className: "border-foreground text-foreground" }}
              className="text-[11px] tracking-[0.32em] uppercase px-5 py-2.5 border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
            >
              All {heading}
            </Link>
            {descendantCats.map((desc) => {
              const fullPath = getCategoryPath(allCats, desc.id);
              const linkUrl = fullPath ? `/shop/${fullPath.join("/")}` : `/shop/${desc.slug}`;
              return (
                <Link
                  key={desc.id}
                  to={linkUrl as any}
                  className="text-[11px] tracking-[0.32em] uppercase px-5 py-2.5 border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
                >
                  {desc.name}
                </Link>
              );
            })}
          </div>
        )}

        {/* Product listing grid or Coming Soon UI */}
        {dbProducts.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto px-6">
            <span className="eyebrow text-gold">{heading}</span>
            <h2 className="font-serif text-4xl mt-4">Coming Soon</h2>
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              We are preparing products for this category. Please check back soon.
            </p>
            <Link
              to="/shop"
              className="inline-block mt-8 text-[11px] tracking-[0.32em] uppercase hover-underline border border-border px-6 py-3"
            >
              Return to Shop
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14 max-w-7xl mx-auto animate-fade">
              {dbProducts.map((p) => (
                <ProductCard key={p.id} product={toProductProps(p)} />
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground mt-16">
              {subCount} subcategories · {totalProducts} pieces
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="pt-16 pb-24">
      <div className="text-center px-6 mb-14 max-w-2xl mx-auto">
        <span className="eyebrow">
          {categoryInfo.parent_name ? `${categoryInfo.parent_name} Edit` : "The House of"}
        </span>
        <h1 className="mt-4 font-serif text-5xl md:text-6xl">{heading}</h1>
        {tagline && <p className="mt-5 text-muted-foreground">{tagline}</p>}
      </div>

      <div className="px-5 lg:px-10">
        {subs.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-14">
            {subs.map((s) => (
              <button
                key={s}
                onClick={() => setSubFilter(s)}
                className={`text-[11px] tracking-[0.28em] uppercase px-4 py-2 border transition-colors ${
                  subFilter === s
                    ? "border-foreground text-foreground"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {dbProducts.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto px-6">
            <span className="eyebrow text-gold">{heading}</span>
            <h2 className="font-serif text-4xl mt-4">Coming Soon</h2>
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              We are preparing products for this category. Please check back soon.
            </p>
            <Link
              to="/shop"
              className="inline-block mt-8 text-[11px] tracking-[0.32em] uppercase hover-underline border border-border px-6 py-3"
            >
              Return to Shop
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">
            No pieces found matching this selection.
          </p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-14 max-w-7xl mx-auto animate-fade">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={toProductProps(p)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
