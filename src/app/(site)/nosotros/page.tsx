import type { Metadata } from "next";
import { Mascot } from "@/components/brand/mascot";
import { JsonLd } from "@/components/site/json-ld";
import { PageHeader } from "@/components/site/page-header";
import { CTA } from "@/components/ui/cta";
import { Markdown } from "@/components/ui/markdown";
import { SmartLink } from "@/components/ui/smart-link";
import { BrandPhrase } from "@/components/ui/section-heading";
import { Container, Stratum } from "@/components/ui/stratum";
import { TerrainCut } from "@/components/ui/terrain-cut";
import { getProjects, getServices, getSettings } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const generateMetadata = (): Promise<Metadata> => buildMetadata({ path: "/nosotros", title: "Burrow Labs: empresa de software en Cochabamba, Bolivia" });

export default async function AboutPage() {
  const [{ about }, services, projects] = await Promise.all([getSettings(), getServices(), getProjects()]);
  // Todos los casos publicados (los demo nunca salen en produccion) y los servicios, enlazados desde la base.
  const cases = projects.filter((project) => !project.isDemo);
  return (
    <>
      <PageHeader eyebrow="Nosotros" title={about.headline} />
      <TerrainCut from="deep" to="chalk" variant="ridge" />
      <Stratum tone="chalk">
        <Container className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-20">
          <Markdown>{about.body}</Markdown>
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <Mascot variant="badge" sizes="320px" alt="La mascota de Burrow Labs: un burro con capucha azul programando en su laptop" className="w-full max-w-xs" />
            <p className="mt-6 type-mono text-muted">Built in Bolivia · Working everywhere</p>
            <p className="mt-3 type-small text-muted">
              Software studio con base en{" "}
              <SmartLink href="/desarrollo-de-software-cochabamba" className="text-link underline-offset-4 hover:underline">
                Cochabamba, Bolivia
              </SmartLink>
              . Trabajamos presencialmente en el valle y en remoto con el resto del país y del exterior.
            </p>
            {/* Verificación de TechBehemoths: enlace de texto, sin su imagen (no carga nada de terceros). Su robot busca
                este atributo y exige que el enlace no sea nofollow. */}
            <p className="mt-3 type-small">
              <a
                href="https://techbehemoths.com/company/burrow-labs"
                target="_blank"
                rel="noopener"
                data-techbehemoths-verification=""
                className="text-link underline-offset-4 hover:underline"
              >
                Verified on TechBehemoths
              </a>
            </p>
          </aside>
        </Container>
        {(services.length > 0 || cases.length > 0) && (
          <Container className="mt-section border-t border-line pt-section">
            <h2 className="type-h2">Lo que ya construimos</h2>
            {services.length > 0 && (
              <section className="mt-10" aria-labelledby="nosotros-servicios">
                <h3 id="nosotros-servicios" className="type-mono text-muted">
                  Servicios
                </h3>
                <ul className="mt-6 grid gap-8 border-t border-line pt-8 sm:grid-cols-2">
                  {services.map((service) => (
                    <li key={service.slug}>
                      <SmartLink href={`/servicios/${service.slug}`} className="group block">
                        <span className="type-h3 group-hover:text-accent">{service.name}</span>
                        <span className="mt-2 block text-muted">{service.tagline}</span>
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {cases.length > 0 && (
              <section className="mt-section" aria-labelledby="nosotros-casos">
                <h3 id="nosotros-casos" className="type-mono text-muted">
                  Casos de estudio
                </h3>
                <ul className="mt-6 border-t border-line">
                  {cases.map((project) => (
                    <li key={project.slug} className="border-b border-line">
                      <SmartLink href={`/proyectos/${project.slug}`} className="group grid gap-1 py-6 sm:grid-cols-[1fr_1.6fr] sm:gap-8">
                        <span className="type-h3 group-hover:text-accent">{project.title}</span>
                        <span className="text-muted">
                          {project.summary}
                          {project.category && <span className="mt-1 block type-mono">{project.category.name}</span>}
                        </span>
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </Container>
        )}
      </Stratum>
      {about.values.length > 0 && (
        <Stratum tone="lab" aria-labelledby="valores-title">
          <Container>
            <h2 id="valores-title" className="type-h2">
              Principios
            </h2>
            <dl className="mt-10 border-t border-line">
              {about.values.map((value, i) => (
                <div key={value.name} className="grid gap-2 border-b border-line py-6 sm:grid-cols-[4rem_14rem_1fr] sm:items-baseline">
                  <span className="type-mono text-muted" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <dt className="type-h3 text-accent">{value.name}</dt>
                  <dd className="text-muted">{value.description}</dd>
                </div>
              ))}
            </dl>
            {about.vision && (
              <section className="mt-section max-w-3xl" aria-labelledby="vision-title">
                <h2 id="vision-title" className="type-mono text-muted">
                  Hacia dónde vamos
                </h2>
                <div className="mt-5 type-h3">
                  <Markdown>{about.vision}</Markdown>
                </div>
              </section>
            )}
            <BrandPhrase className="mt-section">Antes de automatizar algo, entendemos por qué existe.</BrandPhrase>
          </Container>
        </Stratum>
      )}
      <TerrainCut from="lab" to="topsoil" variant="fault" />
      <CTA title="¿Tenés un proceso que te está haciendo perder tiempo?" action={{ label: "Contanos qué querés resolver", href: "/contacto" }} secondary={{ label: "Ver proyectos", href: "/proyectos" }} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: "Nosotros", path: "/nosotros" }])} />
    </>
  );
}
