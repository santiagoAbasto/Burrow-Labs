import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ServiceIcon } from "@/components/services/service-icon";
import { JsonLd } from "@/components/site/json-ld";
import { PageHeader } from "@/components/site/page-header";
import { CTA } from "@/components/ui/cta";
import { BrandPhrase } from "@/components/ui/section-heading";
import { Container, Stratum } from "@/components/ui/stratum";
import { TerrainCut } from "@/components/ui/terrain-cut";
import { getPlans, getProjects, getServices, getSettings } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata, localServiceJsonLd } from "@/lib/seo";

/**
 * Página local. Existe por una razón concreta: hasta el 12/10/2026 la palabra «Cochabamba» no aparecía
 * en el texto visible de ninguna página, así que el sitio no podía competir por «software Cochabamba»
 * ni por ninguna búsqueda que combine servicio y ciudad (ver docs/SEO-AUDIT-2026-10-12.md).
 * Todo lo que afirma sale de la base: servicios, proyectos y precios reales. Nada inventado.
 */
export const generateMetadata = (): Promise<Metadata> =>
  buildMetadata({
    path: "/desarrollo-de-software-cochabamba",
    title: "Desarrollo de software a medida en Cochabamba",
    description:
      "Somos un software studio en Cochabamba, Bolivia. Sistemas a medida, automatización de procesos, integraciones e IA aplicada para empresas de Cochabamba y de todo el país.",
  });

/** El precio base más bajo de cada categoría, tomado de los planes publicados. Si no hay, no se afirma nada. */
function lowestPrice(plans: { category: "web" | "systems"; priceAmount: number | null; currency: string }[], category: "web" | "systems") {
  const prices = plans.filter((plan) => plan.category === category && plan.priceAmount !== null);
  if (!prices.length) return null;
  const min = prices.reduce((a, b) => (a.priceAmount! <= b.priceAmount! ? a : b));
  return `${min.currency} ${min.priceAmount!.toLocaleString("es-BO")}`;
}

export default async function CochabambaPage() {
  const [services, projects, plans, settings] = await Promise.all([getServices(), getProjects(), getPlans(), getSettings()]);
  const cases = projects.filter((project) => !project.isDemo).slice(0, 3);
  const webFrom = lowestPrice(plans, "web");
  const systemsFrom = lowestPrice(plans, "systems");

  return (
    <>
      <PageHeader eyebrow="Cochabamba, Bolivia" title="Desarrollo de software a medida en Cochabamba">
        Burrow Labs es un software studio con base en Cochabamba. Construimos sistemas a medida, automatizaciones, integraciones e
        inteligencia artificial aplicada para empresas que ya funcionan y necesitan ordenar su operación.
      </PageHeader>
      <TerrainCut from="deep" to="chalk" variant="ridge" />

      <Stratum tone="chalk" aria-labelledby="local-title">
        <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <h2 id="local-title" className="type-h2">
              Trabajamos desde Cochabamba, con empresas de todo el país.
            </h2>
            <div className="mt-8 grid gap-6 text-muted">
              <p>
                Estamos en Cochabamba y trabajamos presencialmente con empresas del valle cuando el proyecto lo pide: entender cómo funciona
                una operación es más rápido viéndola. Para el resto de Bolivia y del exterior trabajamos en remoto, con el mismo proceso y
                las mismas entregas verificables.
              </p>
              <p>
                No empezamos por el código. Empezamos por entender cómo trabaja tu negocio: quién hace qué, dónde se pierde tiempo y qué
                reglas existen aunque nadie las haya escrito. Recién después programamos.
              </p>
              <p>
                <Link href="/nosotros" className="text-link underline-offset-4 hover:underline">
                  Cómo trabajamos, en seis pasos
                </Link>
              </p>
            </div>
          </div>
          <aside className="lg:col-span-5">
            <h2 className="type-mono text-muted">Qué construimos</h2>
            <ul className="mt-5 border-t border-line">
              {services.map((service) => (
                <li key={service.slug} className="border-b border-line">
                  <Link href={`/servicios/${service.slug}`} className="group flex items-start gap-4 py-5">
                    <ServiceIcon name={service.icon} className="mt-1 size-6 shrink-0 text-accent" />
                    <span>
                      <span className="block type-h3 group-hover:text-accent">{service.name}</span>
                      <span className="mt-1 block type-small text-muted">{service.tagline}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </Container>
      </Stratum>

      <Stratum tone="lab" aria-labelledby="preguntas-title">
        <Container>
          <h2 id="preguntas-title" className="type-h2 max-w-3xl">
            Lo que nos preguntan las empresas de Cochabamba
          </h2>
          <dl className="mt-10 grid gap-x-16 gap-y-10 border-t border-line pt-10 lg:grid-cols-2">
            <div>
              <dt className="type-h3">¿Atienden presencialmente en Cochabamba?</dt>
              <dd className="mt-3 text-muted">
                Sí. Para relevar un proceso preferimos ir a verlo. Las reuniones de avance suelen ser remotas, porque son más cortas y más
                frecuentes.
              </dd>
            </div>
            <div>
              <dt className="type-h3">¿Trabajan con empresas fuera de Cochabamba?</dt>
              <dd className="mt-3 text-muted">
                Sí, en todo el país y también fuera de Bolivia. El proceso es el mismo: entender, modelar, construir por bloques y medir qué
                cambió en la operación.
              </dd>
            </div>
            <div>
              <dt className="type-h3">¿Cuánto cuesta un sistema a medida?</dt>
              <dd className="mt-3 text-muted">
                Depende del alcance: cuántos módulos, usuarios, integraciones y reglas tiene el proceso.
                {webFrom && systemsFrom ? ` Publicamos precios base: los planes web empiezan desde ${webFrom} y los de automatización y sistemas desde ${systemsFrom}.` : " Publicamos precios base en la página de planes."}{" "}
                <Link href="/planes" className="text-link underline-offset-4 hover:underline">
                  Ver planes y precios
                </Link>
                .
              </dd>
            </div>
            <div>
              <dt className="type-h3">¿Por dónde conviene empezar?</dt>
              <dd className="mt-3 text-muted">
                Por el proceso que se repite todas las semanas y que hoy se sostiene con planillas y mensajes. Si querés una orientación
                rápida, el{" "}
                <Link href="/diagnostico" className="text-link underline-offset-4 hover:underline">
                  diagnóstico express
                </Link>{" "}
                son cinco preguntas.
              </dd>
            </div>
          </dl>
          <BrandPhrase className="mt-section">No empezamos por el código. Empezamos por entender cómo trabaja tu negocio.</BrandPhrase>
        </Container>
      </Stratum>

      {cases.length > 0 && (
        <Stratum tone="deep" aria-labelledby="casos-title">
          <Container>
            <h2 id="casos-title" className="type-h2">
              Proyectos reales detrás de cada frase.
            </h2>
            <ul className="mt-10 border-t border-line">
              {cases.map((project) => (
                <li key={project.slug} className="border-b border-line">
                  <Link href={`/proyectos/${project.slug}`} className="group flex items-baseline justify-between gap-6 py-8">
                    <span>
                      <span className="block type-h3 group-hover:text-accent">{project.title}</span>
                      <span className="mt-2 block text-muted">{project.summary}</span>
                    </span>
                    <ArrowUpRight className="size-6 shrink-0 text-accent" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </Stratum>
      )}

      <TerrainCut from="deep" to="topsoil" variant="fault" />
      <CTA
        title="¿Tenés un proceso que te está haciendo perder tiempo?"
        action={{ label: "Contanos qué querés resolver", href: "/contacto" }}
        secondary={{ label: "Ver planes y precios", href: "/planes" }}
      />
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Inicio", path: "/" },
            { name: "Desarrollo de software en Cochabamba", path: "/desarrollo-de-software-cochabamba" },
          ]),
          localServiceJsonLd(services, settings),
        ]}
      />
    </>
  );
}
