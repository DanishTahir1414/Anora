import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { getCategoryBySlug } from "@/lib/categories";

const VALID_PARENT_SLUGS = ["clothing", "jewellery"];

export const Route = createFileRoute("/shop/$category")({
  loader: async ({ params }) => {
    const cat = await getCategoryBySlug(params.category);
    if (!cat || !VALID_PARENT_SLUGS.includes(params.category)) {
      throw notFound();
    }
    return { category: params.category, dbCategory: cat };
  },
  component: ShopCategoryLayout,
  notFoundComponent: () => (
    <div className="py-32 text-center">
      <p className="eyebrow">Not found</p>
      <h1 className="font-serif text-4xl mt-4">This category doesn't exist</h1>
    </div>
  ),
});

function ShopCategoryLayout() {
  return <Outlet />;
}
