import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectVisual } from "@/components/projects/project-visual";
import { JsonLd } from "@/components/site/json-ld";
import { PageHeader } from "@/components/site/page-header";
import { TrackView } from "@/components/site/track";
import { Badge } from "@/components/ui/badge";
import { CTA } from "@/components/ui/cta";
import { Markdown } from "@/components/ui/markdown";
import { Container, Stratum } from "@/components/ui/stratum";
import { TerrainCut } from "@/components/ui/terrain-cut";
import { getProject, getProjects, getSettings } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata, caseStudyJsonLd, findBySlug } from "@/lib/seo";
import { slugify } from "@/lib/validation";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProjects()).map((project) => ({ slug: project.slug }));
}

/** El slug se valida contra la lista cacheada antes del getter por slug: uno inventado es 404 sin tocar la caché. */
async function findProject(raw: string) {
  const all = await getProjects();
  const known = findBySlug(all, raw);
  return { all, project: known ? await getProject(known.slug) : null };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { project } = await findProject((await params).slug);
  if (!project) return {};
  return buildMetadata({
    path: `/proyectos/${project.slug}`,
    title: project.seoTitle || project.title,
    description: project.seoDescription || project.summary,
    image: project.ogImage || project.cover?.url,
    noindex: project.isDemo,
    type: "article",
  });
}

/** Secciones propias del caso: cada `## Título` del Markdown abre una. */
function splitSections(markdown: string): { id: string; label: string; body: string }[] {
  return markdown
    .split(/^## +/m)
    .slice(1)
    .map((chunk) => {
      const [label, ...rest] = chunk.split("\n");
      return { id: `s-${slugify(label.trim())}`, label: label.trim(), body: rest.join("\n").trim() };
    })
    .filter((section) => section.label && section.body);
}

export default async function ProjectPage({ params }: Props) {
  const [{ project, all }, settings] = await Promise.all([findProject((await params).slug), getSettings()]);
  if (!project) notFound();
  const index = all.findIndex((other) => other.slug === project.slug);
  const next = all.length > 1 ? all[(index + 1) % all.length] : null;

  // Estructura del caso: problema → trabajo → resultado, más las secciones propias del caso.
  const chapters = [
    { id: "problema", label: "Problema", body: project.problem },
    { id: "contexto", label: "Contexto", body: project.context },
    { id: "solucion", label: "Solución", body: project.solution },
    { id: "desafio", label: "Desafío", body: project.challenge },
    { id: "arquitectura", label: "Arquitectura", body: project.architecture },
    ...splitSections(project.sections),
  ].filter((chapter) => chapter.body.trim());
  const index_ = [
    ...chapters,
    ...(project.features.length ? [{ id: "funcionalidades", label: "Funcionalidades" }] : []),
    ...(project.result.trim() ? [{ id: "resultado", label: "Resultado" }] : []),
  ];

  const confidential = !project.clientName && project.badge === "Caso confidencial";
  const facts = [
    project.category && { label: "Categoría", value: project.category.name },
    project.sector && { label: "Sector", value: project.sector },
    project.clientName && { label: "Cliente", value: project.clientName },
    confidential && { label: "Cliente", value: "No se divulga por confidencialidad" },
    project.year && { label: "Año", value: String(project.year) },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact));

  const eyebrow = project.isDemo ? "Caso de estudio · demo, no público" : project.badge ? `Caso de estudio · ${project.badge}` : "Caso de estudio";

  return (
    <>
      <TrackView event="project_view" meta={{ project: project.slug }} />
      <PageHeader eyebrow={eyebrow} title={project.title} tone="lab">
        {project.summary}
      </PageHeader>

      <Stratum tone="lab" flush className="pb-section">
        <Container>
          {(facts.length > 0 || project.services.length > 0) && (
            <dl className="grid gap-6 border-y border-line py-8 sm:grid-cols-2 lg:grid-cols-4">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="type-mono text-muted">{fact.label}</dt>
                  <dd className="mt-1 font-semibold">{fact.value}</dd>
                </div>
              ))}
              {project.services.length > 0 && (
                <div>
                  <dt className="type-mono text-muted">Servicios</dt>
                  <dd className="mt-1 flex flex-wrap gap-x-3 font-semibold">
                    {project.services.map((service) => (
                      <Link key={service.slug} href={`/servicios/${service.slug}`} className="-my-2.5 inline-block py-2.5 text-link underline underline-offset-4">
                        {service.name}
                      </Link>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          )}
          {project.cover ? (
            <div className="relative mt-12 aspect-[16/9] overflow-hidden rounded-lg border border-line">
              <Image src={project.cover.url} alt={project.cover.alt} fill preload fetchPriority="high" sizes="(min-width: 1280px) 1232px, 100vw" className="object-cover" />
            </div>
          ) : (
            project.visual && <ProjectVisual kind={project.visual} labels={project.features} title={project.title} className="mt-12 aspect-[4/3] sm:aspect-[16/9]" />
          )}
        </Container>
      </Stratum>

      <Stratum tone="chalk">
        <Container className="grid gap-12 lg:grid-cols-[14rem_1fr] lg:gap-20">
          <nav aria-label="Secciones del caso" className="max-lg:hidden">
            <ol className="sticky top-28 grid gap-1 border-l border-line">
              {index_.map((chapter, i) => (
                <li key={chapter.id}>
                  <a href={`#${chapter.id}`} className="flex min-h-11 items-center gap-3 pl-4 type-mono text-muted hover:text-fg">
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {chapter.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="grid gap-16">
            {chapters.map((chapter) => (
              <section key={chapter.id} id={chapter.id} aria-labelledby={`${chapter.id}-title`}>
                <h2 id={`${chapter.id}-title`} className="type-h2">
                  {chapter.label}
                </h2>
                <div className="mt-6">
                  <Markdown>{chapter.body}</Markdown>
                </div>
              </section>
            ))}
            {project.features.length > 0 && (
              <section id="funcionalidades" aria-labelledby="funcionalidades-title">
                <h2 id="funcionalidades-title" className="type-h2">
                  Funcionalidades
                </h2>
                <ul className="mt-6 grid gap-x-10 border-t border-line sm:grid-cols-2">
                  {project.features.map((feature) => (
                    <li key={feature} className="flex gap-3 border-b border-line py-3">
                      <span className="veta-dot mt-2 shrink-0" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {(project.stack.length > 0 || project.resultsMetrics.length > 0) && (
              <section aria-labelledby="ficha-title">
                <h2 id="ficha-title" className="type-mono text-muted">
                  Ficha técnica
                </h2>
                {project.stack.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2" aria-label="Stack">
                    {project.stack.map((tech) => (
                      <li key={tech}>
                        <Badge>{tech}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
                {/* Las cifras exactas de QA van acá, en segundo plano: la narrativa comercial no gira alrededor de números. */}
                {project.resultsMetrics.length > 0 && (
                  <p className="mt-4 type-small text-muted">
                    Suite de pruebas: {project.resultsMetrics.map((metric) => `${metric.value} ${metric.label.toLowerCase()}`).join(" · ")}.
                  </p>
                )}
              </section>
            )}
          </div>
        </Container>
      </Stratum>

      {(project.result.trim() || project.resultsMetrics.length > 0) && (
        <Stratum tone="deep" id="resultado" aria-labelledby="resultado-title">
          <Container className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <h2 id="resultado-title" className="type-h2">
                Resultado
              </h2>
              <div className="mt-6">
                <Markdown>{project.result}</Markdown>
              </div>
            </div>
            {project.resultsMetrics.length > 0 && (
              <div className="grid content-start gap-4 rounded-lg border border-line bg-panel p-6 lg:mt-14">
                <p className="type-mono text-muted">QA automatizado</p>
                <p className="type-h3">Suite de pruebas para proteger los flujos críticos.</p>
                <p className="text-muted">Permisos, cálculos e integraciones se verifican solos antes de cada cambio. Las cifras están en la ficha técnica.</p>
              </div>
            )}
          </Container>
        </Stratum>
      )}

      {project.gallery.length > 0 && (
        <Stratum tone="lab" aria-labelledby="galeria-title">
          <Container>
            <h2 id="galeria-title" className="type-h2">
              Galería
            </h2>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2">
              {project.gallery.map((image) => (
                <li key={image.url}>
                  <figure>
                    <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-line">
                      <Image src={image.url} alt={image.alt} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
                    </div>
                    {image.caption && <figcaption className="mt-3 type-small text-muted">{image.caption}</figcaption>}
                  </figure>
                </li>
              ))}
            </ul>
          </Container>
        </Stratum>
      )}

      {next && (
        <Stratum tone="bedrock" flush>
          <Container>
            <Link href={`/proyectos/${next.slug}`} className="group flex flex-wrap items-center justify-between gap-6 py-14">
              <span>
                <span className="type-mono text-muted">Siguiente proyecto</span>
                <span className="mt-2 block type-h2 group-hover:text-accent">{next.title}</span>
              </span>
              <ArrowRight aria-hidden="true" className="size-10 transition-transform duration-normal group-hover:translate-x-2" />
            </Link>
          </Container>
        </Stratum>
      )}
      <TerrainCut from={next ? "bedrock" : "lab"} to="topsoil" variant="shelf" />
      <CTA
        title={project.ctaTitle || "¿Tenés un proceso que te está haciendo perder tiempo?"}
        lead={project.ctaLead || "Contanos cómo funciona hoy. Nosotros vemos qué vale la pena automatizar, integrar o convertir en sistema."}
        action={{ label: "Contanos qué querés resolver", href: `/contacto?proyecto=${project.slug}` }}
      />
      <JsonLd
        data={[
          caseStudyJsonLd(project, settings),
          breadcrumbJsonLd([
            { name: "Inicio", path: "/" },
            { name: "Proyectos", path: "/proyectos" },
            { name: project.title, path: `/proyectos/${project.slug}` },
          ]),
        ]}
      />
    </>
  );
}
