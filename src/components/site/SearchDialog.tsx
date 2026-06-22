import { Link } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { searchProducts } from "@/lib/store";
import { blogPosts } from "@/lib/products";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SearchDialog({ open, onClose }: Props) {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => {
    if (!open) setQ("");
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(q.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [q]);

  const productResults = useMemo(() => {
    if (!debounced) return [];
    return searchProducts(debounced);
  }, [debounced]);

  const blogResults = useMemo(() => {
    const query = debounced.toLowerCase();
    if (!query) return [];
    return blogPosts.filter(
      (blog) =>
        blog.title.toLowerCase().includes(query) || blog.excerpt.toLowerCase().includes(query),
    );
  }, [debounced]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-background animate-fade">
      <div className="max-w-3xl mx-auto px-6 pt-10">
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search collections, pieces, journal…"
            className="flex-1 bg-transparent outline-none text-lg placeholder:text-muted-foreground"
          />
          <button onClick={onClose} aria-label="Close" className="hover:text-gold">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!q && (
          <div className="mt-10">
            <p className="eyebrow mb-4">Popular searches</p>
            <div className="flex flex-wrap gap-2">
              {["Luxury Pret", "Solitaire", "Cashmere Coat", "Pearl", "Necklaces"].map((t) => (
                <button
                  key={t}
                  onClick={() => setQ(t)}
                  className="text-sm px-4 py-2 border border-border hover:border-foreground transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {q && (
          <div className="mt-8 space-y-10 max-h-[70vh] overflow-y-auto pb-10">
            {productResults.length > 0 && (
              <div>
                <p className="eyebrow mb-4">Pieces</p>
                <div className="grid sm:grid-cols-2 gap-5">
                  {productResults.slice(0, 12).map((p) => (
                    <Link
                      key={p.id}
                      to="/product/$slug"
                      params={{ slug: p.slug }}
                      onClick={onClose}
                      className="flex gap-4 group"
                    >
                      <img src={p.images[0]} alt={p.name} className="w-20 h-24 object-cover" />
                      <div>
                        <p className="font-serif text-lg group-hover:text-gold transition-colors">
                          {p.name}
                        </p>
                        <p className="text-xs text-muted-foreground tracking-wide uppercase mt-1">
                          {p.subcategory}
                        </p>
                        <p className="text-sm mt-2">${p.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {blogResults.length > 0 && (
              <div>
                <p className="eyebrow mb-4">Journal</p>
                <div className="space-y-3">
                  {blogResults.map((b) => (
                    <Link
                      key={b.slug}
                      to="/blogs/$slug"
                      params={{ slug: b.slug }}
                      onClick={onClose}
                      className="block group"
                    >
                      <p className="font-serif text-lg group-hover:text-gold transition-colors">
                        {b.title}
                      </p>
                      <p className="text-sm text-muted-foreground">{b.excerpt}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {productResults.length === 0 && blogResults.length === 0 && (
              <p className="text-muted-foreground text-sm">No results for "{q}".</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
