import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Mascot } from "@/components/brand/mascot";
import { Stratum, type Tone } from "@/components/ui/stratum";
import { getPost, getProject, getService } from "@/lib/content";

export const metadata: Metadata = {
  title: "Portada",
  robots: { index: false, follow: false },
};

type Cover = { tone: Tone; eyebrow: string; title: string };

/** Artículo (por defecto), servicio o caso: el mismo tono que la cabecera de su página y todo el texto desde la base. */
async function findCover(slug: string, kind: string | undefined): Promise<Cover | null> {
  if (kind === "servicio") {
    const service = await getService(slug);
    return service && { tone: "deep", eyebrow: "Servicio", title: service.seoTitle || service.name };
  }
  if (kind === "proyecto") {
    const project = await getProject(slug);
    if (!project) return null;
    const detail = project.category?.name || project.sector;
    return { tone: "lab", eyebrow: `Caso de estudio${detail ? ` · ${detail}` : ""}`, title: project.title };
  }
  const post = await getPost(slug);
  return post && { tone: "lab", eyebrow: `Lab${post.category ? ` · ${post.category.name}` : ""} · ${post.readingMinutes} min`, title: post.title };
}

/**
 * Portada para compartir, 1200×630 (la proporción de Open Graph). Solo en desarrollo: se captura a PNG con
 *   node scripts/shot.mjs /dev/cover/<slug> public/lab/covers/<slug>.png 1200 630 --dpr=2                       (artículo)
 *   node scripts/shot.mjs "/dev/cover/<slug>?tipo=servicio" public/og/servicios/<slug>.png 1200 630 --dpr=2      (servicio)
 *   node scripts/shot.mjs "/dev/cover/<slug>?tipo=proyecto" public/og/proyectos/<slug>.png 1200 630 --dpr=2      (caso)
 * y esa ruta va en «SEO: imagen para compartir» de la entidad: es su Open Graph y, sin portada subida, la imagen de su Article.
 * Insignia y wordmark son los oficiales, sin redibujar (docs/BRAND-ASSETS.md).
 */
export default async function CoverPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ tipo?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const cover = await findCover((await params).slug, (await searchParams).tipo);
  if (!cover) notFound();
  // Títulos largos bajan un tamaño para entrar en cuatro líneas.
  const size = cover.title.length > 60 ? "text-[52px]" : "text-[64px]";

  return (
    <Stratum as="div" tone={cover.tone} flush className="grid h-[630px] w-[1200px] grid-cols-[1fr_auto] gap-12 overflow-hidden px-[72px] py-[64px]">
      <div className="flex min-w-0 flex-col">
        <p className="flex items-center gap-3 type-mono text-muted">
          <span className="size-3 rounded-full bg-accent" aria-hidden="true" />
          {cover.eyebrow}
        </p>
        <h1 className={`mt-auto mb-auto py-6 font-black leading-[1.02] tracking-[-0.02em] text-balance ${size}`} style={{ fontStretch: "var(--wdth-display)" }}>
          {cover.title}
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
