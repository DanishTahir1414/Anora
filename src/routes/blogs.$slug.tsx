import { createFileRoute, Link } from "@tanstack/react-router";
import { BlogDetail } from "@/modules/blog";
import { useBlogPostQuery } from "@/lib/products-query";

export const Route = createFileRoute("/blogs/$slug")({
  head: () => ({
    meta: [
      { title: "Journal — ANORA" },
      { name: "description", content: "Stories from the ANORA atelier" },
    ],
  }),
  component: BlogPostWrapper,
});

function BlogPostWrapper() {
  const { slug } = Route.useParams();
  const { data: post, isLoading, error } = useBlogPostQuery(slug);

  if (isLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (error || !post) {
    return (
      <div className="py-32 text-center font-serif">
        <h1 className="text-3xl font-light">Dispatch not found</h1>
        <Link
          to="/blogs"
          className="mt-6 inline-block text-[10px] tracking-[0.25em] uppercase hover:text-gold transition-colors"
        >
          Back to Journal
        </Link>
      </div>
    );
  }

  return <BlogDetail post={post} />;
}

