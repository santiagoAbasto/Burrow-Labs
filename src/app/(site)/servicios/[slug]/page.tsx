import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectRow } from "@/components/projects/project-row";
import { JsonLd } from "@/components/site/json-ld";
import { PageHeader } from "@/components/site/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CTA } from "@/components/ui/cta";
import { Markdown } from "@/components/ui/markdown";
import { Container, Stratum } from "@/components/ui/stratum";
import { TerrainCut } from "@/components/ui/terrain-cut";
import { getProjectsByService, getServices, getSettings } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata, findBySlug, serviceJsonLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getServices()).map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = findBySlug(await getServices(), (await params).slug);
  if (!service) return {};
  return buildMetadata({
    path: `/servicios/${service.slug}`,
    title: service.seoTitle || service.name,
    description: service.seoDescription || service.tagline,
    image: service.ogImage || undefined,
  });
}

export default async function ServicePage({ params }: Props) {
  // El slug se valida contra la lista cacheada antes de cualquier consulta por slug: uno inventado es 404 sin tocar la caché.
  const all = await getServices();
  const service = findBySlug(all, (await params).slug);
  if (!service) notFound();
  const [settings, projects] = await Promise.all([getSettings(), getProjectsByService(service.slug)]);
  const others = all.filter((other) => other.slug !== service.slug);

  return (
    <>
      <PageHeader
        eyebrow="Servicio"
        title={service.name}
        actions={
          <Button href={`/contacto?servicio=${service.slug}`} size="lg" icon={<ArrowRight />}>
            {service.ctaLabel || "Contanos qué querés resolver"}
          </Button>
        }
      >
        {service.tagline}
      </PageHeader>

      <Stratum tone="chalk">
        <Container className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <section aria-labelledby="problema">
            <h2 id="problema" className="type-mono text-muted">
              El problema
            </h2>
            <div className="mt-5">
              <Markdown>{service.problem}</Markdown>
            </div>
          </section>
          <section aria-labelledby="solucion">
            <h2 id="solucion" className="type-mono text-muted">
              Cómo lo resolvemos
            </h2>
            <div className="mt-5">
              <Markdown>{service.solution}</Markdown>
            </div>
          </section>
        </Container>
      </Stratum>

      <Stratum tone="lab">
        <Container className="grid gap-14 lg:grid-cols-12">
          {service.examples.length > 0 && (
            <section className="lg:col-span-7" aria-labelledby="ejemplos">
              <h2 id="ejemplos" className="type-h2">
                Qué construimos
              </h2>
              <ul className="mt-8 border-t border-line">
                {service.examples.map((example, i) => (
                  <li key={example} className="flex gap-5 border-b border-line py-4">
                    <span className="type-mono text-muted">{String(i + 1).padStart(2, "0")}</span>
                    <span className="type-h3">{example}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {service.technologies.length > 0 && (
            <section className="lg:col-span-4 lg:col-start-9" aria-labelledby="tecnologias">
              <h2 id="tecnologias" className="type-mono text-muted">
                Tecnologías habituales
              </h2>
              <ul className="mt-5 flex flex-wrap gap-2">
                {service.technologies.map((tech) => (
                  <li key={tech}>
                    <Badge>{tech}</Badge>
                  </li>
                ))}
              </ul>
              <p className="mt-6 type-small text-muted">Elegimos la tecnología según el proyecto, no al revés.</p>
            </section>
          )}
        </Container>

        {projects.length > 0 && (
          <Container className="mt-section">
            <h2 className="type-h2">Proyectos relacionados</h2>
            <ol className="mt-8 border-t border-line">
              {projects.map((project, i) => (
                <ProjectRow key={project.id} project={project} index={i} />
              ))}
            </ol>
          </Container>
        )}

        <Container className="mt-section">
          <h2 className="type-mono text-muted">Otros servicios</h2>
          <ul className="mt-5 flex flex-wrap gap-3">
            {others.map((other) => (
              <li key={other.slug}>
                <Button href={`/servicios/${other.slug}`} variant="secondary">
                  {other.name}
                </Button>
              </li>
            ))}
          </ul>
        </Container>
      </Stratum>

      <TerrainCut from="lab" to="topsoil" variant="fault" />
      <CTA title="Tu problema entra. La solución sale." action={{ label: service.ctaLabel || "Contanos qué querés resolver", href: `/contacto?servicio=${service.slug}` }} secondary={{ label: "Ver planes", href: "/planes" }} />
      <JsonLd
        data={[
          serviceJsonLd(service, settings),
          breadcrumbJsonLd([
            { name: "Inicio", path: "/" },
            { name: "Servicios", path: "/servicios" },
            { name: service.name, path: `/servicios/${service.slug}` },
          ]),
        ]}
      />
    </>
  );
}
