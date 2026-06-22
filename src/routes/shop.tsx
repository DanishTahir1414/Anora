import { createFileRoute, Link } from "@tanstack/react-router";
import { products, subcategories } from "@/lib/products";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop — ANORA" },
      { name: "description", content: "Browse the full ANORA atelier — clothing and jewellery." },
    ],
  }),
  component: ShopAll,
});

function ShopAll() {
  return (
    <div className="px-5 lg:px-10 pt-16 pb-24">
      <div className="text-center mb-14 max-w-2xl mx-auto">
        <span className="eyebrow">The Atelier</span>
        <h1 className="mt-4 font-serif text-5xl md:text-6xl">All Pieces</h1>
        <p className="mt-5 text-muted-foreground">
          A complete edit of our current collection, across both houses.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-14">
        <Link
          to="/shop"
          activeOptions={{ exact: true }}
          activeProps={{ className: "border-foreground text-foreground" }}
          className="text-[11px] tracking-[0.32em] uppercase px-5 py-2.5 border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
        >
          All
        </Link>
        <Link
          to="/shop/$category"
          params={{ category: "clothing" }}
          className="text-[11px] tracking-[0.32em] uppercase px-5 py-2.5 border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
        >
          Clothing
        </Link>
        <Link
          to="/shop/$category"
          params={{ category: "jewellery" }}
          className="text-[11px] tracking-[0.32em] uppercase px-5 py-2.5 border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
        >
          Jewellery
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-14 max-w-7xl mx-auto">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-16">
        {Object.values(subcategories).flat().length} categories · {products.length} pieces
      </p>
    </div>
  );
}
