import type { Metadata } from "next";
import { PlanGrid } from "@/components/plans/plan-card";
import { JsonLd } from "@/components/site/json-ld";
import { PageHeader } from "@/components/site/page-header";
import { TrackView } from "@/components/site/track";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { CTA } from "@/components/ui/cta";
import { Markdown } from "@/components/ui/markdown";
import { Container, Stratum } from "@/components/ui/stratum";
import { TerrainCut } from "@/components/ui/terrain-cut";
import { getFaqs, getPlans, getSettings } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata, plansJsonLd } from "@/lib/seo";

export const generateMetadata = (): Promise<Metadata> => buildMetadata({ path: "/planes", title: "Precios de páginas web y sistemas en Bolivia" });

const GROUPS = [
  { category: "web", id: "web", title: "Planes web", lead: "Desde una landing que recibe contactos hasta una web conectada con tu catálogo o tu CRM." },
  {
    category: "systems",
    id: "sistemas",
    title: "Automatización y sistemas",
    lead: "Para dejar de hacer a mano lo que un sistema puede hacer solo.",
  },
] as const;

export default async function PlansPage() {
  const [plans, settings, faqs] = await Promise.all([getPlans(), getSettings(), getFaqs()]);
  const pricing = faqs.filter((faq) => faq.category === "Precios" || faq.category === "Proceso");
  return (
    <>
      <TrackView event="plan_view" />
      <PageHeader eyebrow="Planes" title="De procesos manuales a sistemas que escalan.">
        Puntos de partida con precio base publicado.
      </PageHeader>
      <TerrainCut from="deep" to="chalk" variant="shelf" />
      <Stratum tone="chalk">
        <Container className="grid gap-section">
          {GROUPS.map((group) => {
            const items = plans.filter((plan) => plan.category === group.category);
            if (items.length === 0) return null;
            return (
              <section key={group.id} id={group.id} aria-labelledby={`${group.id}-title`}>
                <h2 id={`${group.id}-title`} className="type-h2">
                  {group.title}
                </h2>
                <p className="mt-3 mb-10 type-lead">{group.lead}</p>
                <PlanGrid plans={items} />
              </section>
            );
          })}
          <p className="type-small text-muted">{settings.plansDisclaimer}</p>
        </Container>
      </Stratum>
      {pricing.length > 0 && (
        <Stratum tone="lab">
          <Container className="grid gap-10 lg:grid-cols-[5fr_7fr] lg:gap-20">
            <h2 className="type-h2">Antes de elegir un plan</h2>
            <Accordion>
              {pricing.map((faq) => (
                <AccordionItem key={faq.id} title={faq.question} name="planes-faq">
                  <Markdown>{faq.answer}</Markdown>
                </AccordionItem>
              ))}
            </Accordion>
          </Container>
        </Stratum>
      )}
      <TerrainCut from={pricing.length ? "lab" : "chalk"} to="topsoil" variant="ridge" />
      <CTA title="¿No sabés cuál te conviene?" lead="El diagnóstico express te orienta en cinco preguntas." action={{ label: "Hacer el diagnóstico express", href: "/diagnostico" }} secondary={{ label: "Mostranos cómo trabajan hoy", href: "/contacto" }} />
      <JsonLd data={[breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: "Planes", path: "/planes" }]), plansJsonLd(plans, settings)]} />
    </>
  );
}
