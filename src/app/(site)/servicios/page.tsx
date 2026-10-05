import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ServiceIcon } from "@/components/services/service-icon";
import { JsonLd } from "@/components/site/json-ld";
import { PageHeader } from "@/components/site/page-header";
import { Badge } from "@/components/ui/badge";
import { CTA } from "@/components/ui/cta";
import { Container, Stratum } from "@/components/ui/stratum";
import { TerrainCut } from "@/components/ui/terrain-cut";
import { getServices } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const generateMetadata = (): Promise<Metadata> => buildMetadata({
    path: "/servicios",
    title: "Servicios de software a medida, automatización e IA",
    description: "Conectamos sistemas, eliminamos tareas repetitivas y construimos herramientas para operar con menos trabajo manual.",
  });

/** «E-commerce» no se parte en el guion al cambiar de línea. */
const noBreak = (text: string) => text.replace(/-/g, "\u2011");

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <PageHeader eyebrow="Servicios" title="No vendemos código. Resolvemos procesos.">
        Conectamos sistemas, eliminamos tareas repetitivas y construimos herramientas para operar con menos trabajo manual. Cuatro servicios; la herramienta se elige después de entender el problema.
      </PageHeader>
      <TerrainCut from="deep" to="lab" variant="ridge" />
      <Stratum tone="lab">
        <Container>
          <ol className="border-t border-line">
            {services.map((service, i) => (
              <li key={service.slug} className="border-b border-line" data-reveal="">
                {/* El nombre ocupa todo el ancho: ningún título largo invade la columna de al lado. */}
                <Link href={`/servicios/${service.slug}`} className="group block py-10 lg:py-14">
                  <p className="flex items-center gap-4 type-mono text-muted">
                    {String(i + 1).padStart(2, "0")}
                    <ServiceIcon name={service.icon} className="size-7 text-accent" />
                  </p>
                  <h2 className="mt-4 type-h2 group-hover:text-accent">{noBreak(service.name)}</h2>
                  <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:gap-10">
                    <p className="type-h3 lg:col-span-5">{service.tagline}</p>
                    <div className="lg:col-span-7">
                      <ul className="flex flex-wrap gap-2">
                        {service.examples.slice(0, 4).map((example) => (
                          <li key={example}>
                            <Badge>{example}</Badge>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-6 inline-flex items-center gap-2 font-semibold">
                        Ver el servicio
                        <ArrowUpRight aria-hidden="true" className="size-5 transition-transform duration-fast group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </Container>
      </Stratum>
      <TerrainCut from="lab" to="topsoil" variant="shelf" />
      <CTA
        title="¿Tenés un proceso que te está haciendo perder tiempo?"
        lead="Contanos cómo funciona hoy. Nosotros vemos qué vale la pena automatizar, integrar o convertir en sistema."
        action={{ label: "Contanos qué querés resolver", href: "/contacto" }}
        secondary={{ label: "Hacer el diagnóstico express", href: "/diagnostico" }}
      />
      <JsonLd data={breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: "Servicios", path: "/servicios" }])} />
    </>
  );
}
