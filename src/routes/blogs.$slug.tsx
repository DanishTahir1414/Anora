import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { BlogService, BlogDetail } from "@/modules/blog";

export const Route = createFileRoute("/blogs/$slug")({
  loader: async ({ params }) => {
    const service = new BlogService(supabase);
    const post = await service.getPostBySlug(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.post;
    return {
      meta: [
        { title: p ? `${p.title} — ANORA` : "Journal — ANORA" },
        { name: "description", content: p?.excerpt || "" },
        // OpenGraph
        { property: "og:title", content: p ? `${p.title} — ANORA` : "Journal — ANORA" },
        { property: "og:description", content: p?.excerpt || "" },
        { property: "og:image", content: p?.cover_image || "" },
        // Twitter
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: p ? `${p.title} — ANORA` : "Journal — ANORA" },
        { name: "twitter:description", content: p?.excerpt || "" },
        { name: "twitter:image", content: p?.cover_image || "" },
      ],
    };
  },
  component: BlogPostWrapper,
  notFoundComponent: () => (
    <div className="py-32 text-center font-serif">
      <h1 className="text-3xl font-light">Dispatch not found</h1>
      <Link
        to="/blogs"
        className="mt-6 inline-block text-[10px] tracking-[0.25em] uppercase hover:text-gold transition-colors"
      >
        Back to Journal
      </Link>
    </div>
  ),
});

function BlogPostWrapper() {
  const { post } = Route.useLoaderData();
  return <BlogDetail post={post} />;
}
