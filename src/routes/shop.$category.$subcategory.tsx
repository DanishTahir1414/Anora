import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/site/ProductCard";
import { useActiveCategories, useSubcategoryProducts, toProductProps } from "@/lib/categories";

const VALID_PARENT_SLUGS = ["clothing", "jewellery"];

export const Route = createFileRoute("/shop/$category/$subcategory")({
  head: ({ params }) => {
    const name = params.subcategory.charAt(0).toUpperCase() + params.subcategory.slice(1);
    return {
      meta: [
        { title: `${name} — ANORA` },
        { name: "description", content: `Explore ANORA ${params.subcategory}.` },
      ],
    };
  },
  component: ShopSubcategory,
});

function ShopSubcategory() {
  const { category, subcategory } = Route.useParams();
  const { data: allCats = [], isLoading: isCatLoading } = useActiveCategories();
  const { data: dbProducts = [] } = useSubcategoryProducts(category, subcategory);

  const parent = allCats.find((c) => c.slug === category);
  const child = parent?.children.find((c) => c.slug === subcategory);

  // If loading is complete but subcategory is invalid, show not found view
  if (!isCatLoading && (!VALID_PARENT_SLUGS.includes(category) || !child)) {
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

  const childName = child?.name ?? "";

  return (
    <div className="pt-16 pb-24">
      <div className="text-center px-6 mb-14 max-w-2xl mx-auto">
        <span className="eyebrow">The House of</span>
        <h1 className="mt-4 font-serif text-5xl md:text-6xl">{childName}</h1>
      </div>

      <div className="px-5 lg:px-10">
        {dbProducts.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">
            New pieces in this collection are arriving soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-3.5 gap-y-10 sm:gap-x-5 sm:gap-y-14 max-w-7xl mx-auto">
            {dbProducts.map((p) => (
              <ProductCard key={p.id} product={toProductProps(p)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

