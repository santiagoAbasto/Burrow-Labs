import type { Metadata } from "next";
import Image from "next/image";
import { JsonLd } from "@/components/site/json-ld";
import { PageHeader } from "@/components/site/page-header";
import { CTA } from "@/components/ui/cta";
import { LogoCloud } from "@/components/ui/logo-cloud";
import { SmartLink } from "@/components/ui/smart-link";
import { Container, Stratum } from "@/components/ui/stratum";
import { TerrainCut } from "@/components/ui/terrain-cut";
import { getClients, getSettings, getTestimonials } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const generateMetadata = (): Promise<Metadata> => buildMetadata({ path: "/clientes", title: "Clientes y sectores con los que trabajamos" });

/** Solo clientes y testimonios autorizados. Sin ellos se muestran sectores: nunca nombres inventados. */
export default async function ClientsPage() {
  const [clients, testimonials, settings] = await Promise.all([getClients(), getTestimonials(), getSettings()]);
  return (
    <>
      <PageHeader eyebrow="Clientes" title="Tecnología construida para negocios reales." tone="lab">
        Publicamos únicamente a los clientes que nos autorizaron a mencionarlos.
      </PageHeader>
      <Stratum tone="lab" flush className="pb-section">
        <Container>
          {clients.length > 0 ? (
            <ul className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-3">
              {clients.map((client) => (
                <li key={client.id} className="border-b border-line py-8 sm:px-6 sm:[&:nth-child(2n+1)]:pl-0 lg:[&:nth-child(2n+1)]:pl-6 lg:[&:nth-child(3n+1)]:pl-0">
                  {client.logo?.width && client.logo.height ? (
                    <Image src={client.logo.url} alt={client.name} width={client.logo.width} height={client.logo.height} className="h-12 w-auto object-contain" />
                  ) : (
                    <p className="type-h3">{client.name}</p>
                  )}
                  {client.logo && <p className="mt-4 font-semibold">{client.name}</p>}
                  {client.sector && <p className="type-mono text-muted">{client.sector}</p>}
                  {client.website && (
                    <SmartLink href={client.website} className="mt-2 inline-flex min-h-9 items-center text-link underline underline-offset-4">
                      Visitar sitio
                    </SmartLink>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div>
              <p className="max-w-2xl type-lead">
                Todavía no publicamos nombres. Trabajamos con negocios de estos sectores:
              </p>
              <LogoCloud className="mt-8" label="Sectores para los que construimos" items={settings.sectors.map((name) => ({ name }))} />
            </div>
          )}

          {testimonials.length > 0 && (
            <ul className="mt-section grid gap-10 lg:grid-cols-2">
              {testimonials.map((testimonial) => (
                <li key={testimonial.id}>
                  <figure className="border-l-2 border-accent pl-6">
                    <blockquote className="type-h3">«{testimonial.quote}»</blockquote>
                    <figcaption className="mt-4 text-muted">
                      {testimonial.authorName}
                      {testimonial.authorRole && `, ${testimonial.authorRole}`}
                      {testimonial.clientName && ` · ${testimonial.clientName}`}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Stratum>
      <TerrainCut from="lab" to="topsoil" variant="shelf" />
      <CTA title="¿Tu operación tiene un proceso que todavía se hace a mano?" action={{ label: "Contanos qué querés resolver", href: "/contacto" }} secondary={{ label: "Ver proyectos", href: "/proyectos" }} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: "Clientes", path: "/clientes" }])} />
    </>
  );
}
