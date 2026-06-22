import { createFileRoute, notFound } from "@tanstack/react-router";
import { products, subcategories, type Category } from "@/lib/products";
import { ProductCard } from "@/components/site/ProductCard";
import { useState } from "react";

export const Route = createFileRoute("/shop/$category")({
  loader: ({ params }) => {
    if (params.category !== "clothing" && params.category !== "jewellery") throw notFound();
    return { category: params.category as Category };
  },
  head: ({ params }) => {
    const cat = params.category;
    const title =
      cat === "clothing"
        ? "Clothing — ANORA"
        : cat === "jewellery"
          ? "Jewellery — ANORA"
          : "Shop — ANORA";
    return {
      meta: [
        { title },
        { name: "description", content: `Explore the ANORA ${cat} collection.` },
        { property: "og:title", content: title },
      ],
    };
  },
  component: ShopCategory,
  notFoundComponent: () => (
    <div className="py-32 text-center">
      <p className="eyebrow">Not found</p>
      <h1 className="font-serif text-4xl mt-4">This category doesn't exist</h1>
    </div>
  ),
});

function ShopCategory() {
  const { category } = Route.useLoaderData() as { category: Category };
  const list = products.filter((p) => p.category === category);
  const subs = ["All", ...subcategories[category]];
  const [sub, setSub] = useState("All");
  const filtered = sub === "All" ? list : list.filter((p) => p.subcategory === sub);

  const heading =
    category === "clothing" ? "Clothing" : "Jewellery";
  const tagline =
    category === "clothing"
      ? "Silks, cashmere and ceremonial dress — slow tailored in our atelier."
      : "Recycled 18k gold and considered stones, finished entirely by hand.";

  return (
    <div className="pt-16 pb-24">
      <div className="text-center px-6 mb-14 max-w-2xl mx-auto">
        <span className="eyebrow">The House of</span>
        <h1 className="mt-4 font-serif text-5xl md:text-6xl">{heading}</h1>
        <p className="mt-5 text-muted-foreground">{tagline}</p>
      </div>

      <div className="px-5 lg:px-10">
        <div className="flex flex-wrap justify-center gap-2 mb-14">
          {subs.map((s) => (
            <button
              key={s}
              onClick={() => setSub(s)}
              className={`text-[11px] tracking-[0.28em] uppercase px-4 py-2 border transition-colors ${
                sub === s
                  ? "border-foreground text-foreground"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">
            New pieces in this collection are arriving soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-14 max-w-7xl mx-auto">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
