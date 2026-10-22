import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Mascot } from "@/components/brand/mascot";
import { Stratum } from "@/components/ui/stratum";
import { getPost } from "@/lib/content";

export const metadata: Metadata = {
  title: "Portada",
  robots: { index: false, follow: false },
};

/**
 * Portada de un artículo del Lab, 1200×630 (la proporción de Open Graph). Solo en desarrollo: se captura a PNG con
 *   node scripts/shot.mjs /dev/cover/<slug> public/lab/covers/<slug>.png 1200 630 --dpr=2
 * y esa ruta va en «SEO: imagen para compartir» del artículo (Open Graph e imagen del Article; en la página no se muestra).
 * Insignia y wordmark son los oficiales, sin redibujar (docs/BRAND-ASSETS.md).
 */
export default async function CoverPage({ params }: { params: Promise<{ slug: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const post = await getPost((await params).slug);
  if (!post) notFound();
  // Títulos largos bajan un tamaño para entrar en cuatro líneas.
  const size = post.title.length > 60 ? "text-[52px]" : "text-[64px]";

  return (
    <Stratum as="div" tone="lab" flush className="grid h-[630px] w-[1200px] grid-cols-[1fr_auto] gap-12 overflow-hidden px-[72px] py-[64px]">
      <div className="flex min-w-0 flex-col">
        <p className="flex items-center gap-3 type-mono text-muted">
          <span className="size-3 rounded-full bg-accent" aria-hidden="true" />
          Lab{post.category ? ` · ${post.category.name}` : ""} · {post.readingMinutes} min
        </p>
        <h1 className={`mt-auto mb-auto py-6 font-black leading-[1.02] tracking-[-0.02em] text-balance ${size}`} style={{ fontStretch: "var(--wdth-display)" }}>
          {post.title}
        </h1>
        <div className="flex items-center gap-5">
          <Image src="/brand/wordmark.svg" alt="" width={654} height={119} className="h-8 w-auto" />
          <span className="type-mono text-muted">burrowlabs.com.bo</span>
        </div>
      </div>
      <div className="flex items-center">
        <div className="rounded-full border border-dashed border-line-strong p-5">
          <Mascot variant="badge" sizes="320px" track={false} className="block w-80" />
        </div>
      </div>
    </Stratum>
  );
}
