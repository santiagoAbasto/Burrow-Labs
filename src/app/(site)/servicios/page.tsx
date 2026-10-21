import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ServiceIcon } from "@/components/services/service-icon";
import { JsonLd } from "@/components/site/json-ld";
import { LabReading } from "@/components/site/lab-reading";
import { PageHeader } from "@/components/site/page-header";
import { Badge } from "@/components/ui/badge";
import { CTA } from "@/components/ui/cta";
import { Container, Stratum } from "@/components/ui/stratum";
import { TerrainCut } from "@/components/ui/terrain-cut";
import { getPosts, getServices } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const generateMetadata = (): Promise<Metadata> => buildMetadata({
    path: "/servicios",
    title: "Servicios de software a medida en Bolivia",
    description:
      "Sistemas empresariales, automatización, IA aplicada, plataformas web y apps móviles para empresas de Bolivia y del exterior. Primero entendemos el proceso.",
  });

/** «E-commerce» no se parte en el guion al cambiar de línea. */
const noBreak = (text: string) => text.replace(/-/g, "\u2011");

export default async function ServicesPage() {
  const [services, posts] = await Promise.all([getServices(), getPosts()]);
  return (
    <>
      <PageHeader eyebrow="Servicios" title="Software a medida para empresas de Bolivia y del exterior">
        No vendemos código: resolvemos procesos. Conectamos sistemas, eliminamos tareas repetitivas y construimos herramientas para
        operar con menos trabajo manual. La herramienta se elige después de entender el problema.
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

        <Container className="mt-section">
          <h2 className="type-h2 max-w-3xl">Desde Bolivia, para empresas de cualquier lugar.</h2>
          <dl className="mt-10 grid gap-x-16 gap-y-10 border-t border-line pt-10 lg:grid-cols-3">
            <div>
              <dt className="type-h3">¿Trabajan con empresas de otras ciudades y de otros países?</dt>
              <dd className="mt-3 text-muted">
                Sí. Tenemos base en{" "}
                <Link href="/desarrollo-de-software-cochabamba" className="text-link underline-offset-4 hover:underline">
                  Cochabamba
                </Link>{" "}
                y trabajamos en remoto con empresas de toda Bolivia y del exterior. El proceso es el mismo: entender, modelar, construir por
                bloques y medir qué cambió.
              </dd>
            </div>
            <div>
              <dt className="type-h3">¿Cómo se paga desde otro país?</dt>
              <dd className="mt-3 text-muted">
                Recibimos pagos desde cualquier país. Los precios base están publicados en dólares en{" "}
                <Link href="/planes" className="text-link underline-offset-4 hover:underline">
                  planes
                </Link>
                , y el alcance se confirma por escrito antes de empezar.
              </dd>
            </div>
            <div>
              <dt className="type-h3">¿Cómo se sigue un proyecto a distancia?</dt>
              <dd className="mt-3 text-muted">
                Con reuniones de avance cortas por videollamada y entregas por bloques funcionales que podés usar y revisar desde el
                principio.{" "}
                <Link href="/nosotros" className="text-link underline-offset-4 hover:underline">
                  Cómo trabajamos, en seis pasos
                </Link>
                .
              </dd>
            </div>
          </dl>
        </Container>

        {posts.length > 0 && (
          <Container className="mt-section">
            <LabReading posts={posts.slice(0, 4)} />
          </Container>
        )}
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
