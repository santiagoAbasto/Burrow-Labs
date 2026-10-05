import type { Metadata } from "next";
import Link from "next/link";
import { ProjectRow } from "@/components/projects/project-row";
import { JsonLd } from "@/components/site/json-ld";
import { PageHeader } from "@/components/site/page-header";
import { Button } from "@/components/ui/button";
import { CTA } from "@/components/ui/cta";
import { Container, Stratum } from "@/components/ui/stratum";
import { TerrainCut } from "@/components/ui/terrain-cut";
import { cn } from "@/lib/cn";
import { getProjectCategories, getProjects } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const generateMetadata = (): Promise<Metadata> => buildMetadata({
    path: "/proyectos",
    title: "Proyectos y casos de estudio de software",
    description: "Cada caso cuenta qué problema existía, qué proceso diseñamos, qué arquitectura usamos y qué mejoró.",
  });

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;
  const [all, categories] = await Promise.all([getProjects(), getProjectCategories()]);
  const used = categories.filter((category) => all.some((project) => project.category?.slug === category.slug));
  const active = used.find((category) => category.slug === categoria)?.slug;
  const projects = active ? all.filter((project) => project.category?.slug === active) : all;

  return (
    <>
      <PageHeader eyebrow="Proyectos" title="Problema, trabajo, resultado." tone="lab">
        Cada caso cuenta qué problema existía, qué proceso diseñamos, qué arquitectura usamos y qué mejoró.
      </PageHeader>
      <Stratum tone="lab" flush className="pb-section">
        <Container>
          {all.length === 0 ? (
            <div className="max-w-2xl rounded-lg border border-line bg-panel p-8 sm:p-12">
              <p className="type-mono text-muted">En preparación</p>
              <h2 className="mt-4 type-h2">Estamos documentando nuestros casos.</h2>
              <p className="mt-4 type-lead">
                Publicamos un proyecto solo cuando podemos contarlo bien y con autorización del cliente. Mientras tanto, contanos el tuyo.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/contacto">Contanos qué querés resolver</Button>
                <Button href="/servicios" variant="secondary">
                  Ver servicios
                </Button>
              </div>
            </div>
          ) : (
            <>
              {used.length > 1 && (
                <nav aria-label="Filtrar por categoría">
                  <ul className="flex flex-wrap gap-2">
                    {[{ slug: undefined, name: "Todos" }, ...used].map((category) => (
                      <li key={category.slug ?? "todos"}>
                        <Link
                          href={category.slug ? `/proyectos?categoria=${category.slug}` : "/proyectos"}
                          aria-current={active === category.slug ? "page" : undefined}
                          className={cn("badge type-mono min-h-11 px-4", active === category.slug && "bg-accent text-accent-fg")}
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
              <ol className="mt-10 border-t border-line">
                {projects.map((project, i) => (
                  <ProjectRow key={project.id} project={project} index={i} heading="h2" />
                ))}
              </ol>
            </>
          )}
        </Container>
      </Stratum>
      <TerrainCut from="lab" to="topsoil" variant="ridge" />
      <CTA
        title="¿Tenés un proceso que te está haciendo perder tiempo?"
        lead="Contanos cómo funciona hoy. Nosotros vemos qué vale la pena automatizar, integrar o convertir en sistema."
        action={{ label: "Contanos qué querés resolver", href: "/contacto" }}
      />
      <JsonLd data={breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: "Proyectos", path: "/proyectos" }])} />
    </>
  );
}
