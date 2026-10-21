import Link from "next/link";
import type { PostSummary } from "@/lib/content";

/**
 * Artículos del Lab enlazados desde otras páginas. Además de servirle al lector, es el camino por el que
 * Google llega a cada artículo: con enlaces solo desde /lab, los dejaba «rastreados, sin indexar».
 */
export function LabReading({ posts, title = "Del Lab" }: { posts: PostSummary[]; title?: string }) {
  return (
    <>
      <h2 className="type-mono text-muted">{title}</h2>
      <ul className="mt-6 grid gap-8 border-t border-line pt-8 md:grid-cols-2">
        {posts.map((post) => (
          <li key={post.id}>
            <Link href={`/lab/${post.slug}`} className="group block">
              <h3 className="type-h3 group-hover:text-accent">{post.title}</h3>
              <p className="mt-2 text-muted">{post.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
