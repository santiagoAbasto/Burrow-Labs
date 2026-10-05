import type { Metadata } from "next";
import { JsonLd } from "@/components/site/json-ld";
import { PageHeader } from "@/components/site/page-header";
import { SmartLink } from "@/components/ui/smart-link";
import { Container, Stratum } from "@/components/ui/stratum";
import { TerrainCut } from "@/components/ui/terrain-cut";
import { calculate, parseCalcParams } from "@/lib/calculator";
import { getPlans, getProjects, getServices, getSettings } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata, findBySlug } from "@/lib/seo";
import { PROJECT_TYPES } from "@/lib/validation";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { ContactForm, type ContactPrefill } from "./form";

export const generateMetadata = (): Promise<Metadata> => buildMetadata({
    path: "/contacto",
    title: "Contacto: contanos qué querés resolver",
    description: "Cuanto más concreto, mejor: qué hacen hoy a mano, cuántas personas participan y qué herramientas usan.",
  });

type Search = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/**
 * El formulario llega precargado según desde dónde vino la persona (plan, servicio, proyecto, calculadora).
 * Los parámetros son texto libre de la URL: se validan como slug y se buscan en las listas ya cacheadas; lo desconocido se ignora.
 */
async function prefillFrom(search: Search): Promise<ContactPrefill> {
  const plan = one(search.plan);
  const service = one(search.servicio);
  const project = one(search.proyecto);
  if (plan) {
    const found = findBySlug(await getPlans(), plan);
    if (found) return { goal: `Plan ${found.name}`, projectType: found.category === "web" ? "Web" : "Sistema", context: `plan:${found.slug}` };
  }
  if (service) {
    const found = findBySlug(await getServices(), service);
    if (found) {
      const type = PROJECT_TYPES.find((t) => found.name.toLowerCase().includes(t.toLowerCase().slice(0, 5)));
      return { goal: found.name, projectType: type, context: `servicio:${found.slug}` };
    }
  }
  if (project) {
    const found = findBySlug(await getProjects(), project);
    if (found) return { goal: `Algo similar a «${found.title}»`, context: `proyecto:${found.slug}` };
  }
  if (one(search.origen) === "calculadora") {
    const input = parseCalcParams(search);
    const result = calculate(input);
    return {
      projectType: "Automatización",
      context: "calculadora",
      message: `Hoy ${input.people} persona(s) dedican ${input.hours} h por semana a una tarea manual: unas ${result.annualHours} horas al año.\n\nLa tarea es: `,
    };
  }
  return {};
}

export default async function ContactPage({ searchParams }: { searchParams: Promise<Search> }) {
  const [search, settings] = await Promise.all([searchParams, getSettings()]);
  const prefill = await prefillFrom(search);
  const { contact, social } = settings;
  const whatsapp = contact.whatsappEnabled ? buildWhatsAppUrl(contact.whatsappPhone, contact.whatsappDefaultMessage) : null;

  return (
    <>
      <PageHeader eyebrow="Contacto" title="Contanos qué querés resolver.">
        Cuanto más concreto, mejor: qué hacen hoy a mano, cuántas personas participan y qué herramientas usan.
      </PageHeader>
      <TerrainCut from="deep" to="chalk" variant="shelf" />
      <Stratum tone="chalk">
        <Container className="grid gap-14 lg:grid-cols-[1fr_20rem] lg:gap-20">
          <ContactForm prefill={prefill} />
          <aside className="grid content-start gap-8">
            <div>
              <h2 className="type-mono text-muted">Qué pasa después</h2>
              <ol className="mt-4 grid gap-4">
                {["Leemos tu mensaje y, si falta algo, te hacemos preguntas.", "Te enviamos una propuesta con alcance, plazo y precio.", "Si te sirve, empezamos por una primera entrega que puedas probar."].map((step, i) => (
                  <li key={step} className="flex gap-4">
                    <span className="type-mono text-muted">{String(i + 1).padStart(2, "0")}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            {(whatsapp || contact.email || social.instagram) && (
              <div>
                <h2 className="type-mono text-muted">Otras vías</h2>
                <ul className="mt-3 grid gap-1">
                  {whatsapp && (
                    <li>
                      <SmartLink href={whatsapp} className="inline-flex min-h-11 items-center text-link underline underline-offset-4">
                        Escribirnos por WhatsApp
                      </SmartLink>
                    </li>
                  )}
                  {contact.email && (
                    <li>
                      <SmartLink href={`mailto:${contact.email}`} className="inline-flex min-h-11 items-center text-link underline underline-offset-4">
                        {contact.email}
                      </SmartLink>
                    </li>
                  )}
                  {social.instagram && (
                    <li>
                      <SmartLink href={social.instagram} className="inline-flex min-h-11 items-center text-link underline underline-offset-4">
                        Instagram
                      </SmartLink>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </aside>
        </Container>
      </Stratum>
      <JsonLd data={breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: "Contacto", path: "/contacto" }])} />
    </>
  );
}
