import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

const VALID_PARENT_SLUGS = ["clothing", "jewellery"];

export const Route = createFileRoute("/shop/$category")({
  component: ShopCategoryLayout,
  notFoundComponent: () => (
    <div className="py-32 text-center">
      <p className="eyebrow">Not found</p>
      <h1 className="font-serif text-4xl mt-4">This category doesn't exist</h1>
    </div>
  ),
});

function ShopCategoryLayout() {
  const { category } = Route.useParams();
  if (!VALID_PARENT_SLUGS.includes(category)) {
    throw notFound();
  }
  return <Outlet />;
}
