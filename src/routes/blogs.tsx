import { createFileRoute } from "@tanstack/react-router";
import { BlogList } from "@/modules/blog";

export const Route = createFileRoute("/blogs")({
  head: () => ({
    meta: [
      { title: "Journal — ANORA" },
      {
        name: "description",
        content:
          "Stories from the ANORA atelier — craft, material, and the quiet pleasures of dress.",
      },
      { property: "og:title", content: "Journal — ANORA" },
      { property: "og:description", content: "Stories from the ANORA atelier — craft, material, and the quiet pleasures of dress." },
    ],
  }),
  component: BlogList,
});
