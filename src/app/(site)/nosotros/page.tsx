import type { Metadata } from "next";
import { Mascot } from "@/components/brand/mascot";
import { JsonLd } from "@/components/site/json-ld";
import { PageHeader } from "@/components/site/page-header";
import { CTA } from "@/components/ui/cta";
import { Markdown } from "@/components/ui/markdown";
import { BrandPhrase } from "@/components/ui/section-heading";
import { Container, Stratum } from "@/components/ui/stratum";
import { TerrainCut } from "@/components/ui/terrain-cut";
import { getSettings } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const generateMetadata = (): Promise<Metadata> => buildMetadata({ path: "/nosotros", title: "Sobre Burrow Labs, software studio boliviano" });

export default async function AboutPage() {
  const { about } = await getSettings();
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
          </aside>
        </Container>
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
