import type { Metadata } from "next";
import { JsonLd } from "@/components/site/json-ld";
import { PageHeader } from "@/components/site/page-header";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { CTA } from "@/components/ui/cta";
import { Markdown } from "@/components/ui/markdown";
import { Container, Stratum } from "@/components/ui/stratum";
import { TerrainCut } from "@/components/ui/terrain-cut";
import { getFaqs } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const generateMetadata = (): Promise<Metadata> => buildMetadata({ path: "/faq", title: "Preguntas frecuentes sobre proyectos de software" });

// Sin schema FAQPage: Google ya no muestra ese resultado enriquecido (docs/SEO.md). Las respuestas van como texto visible.
export default async function FaqPage() {
  const faqs = await getFaqs();
  const categories = [...new Set(faqs.map((faq) => faq.category || "General"))];
  return (
    <>
      <PageHeader eyebrow="Preguntas frecuentes" title="Lo que nos preguntan antes de empezar." tone="lab" />
      <Stratum tone="lab" flush className="pb-section">
        <Container className="grid gap-16">
          {categories.map((category) => (
            <section key={category} className="grid gap-6 lg:grid-cols-[14rem_1fr] lg:gap-16" aria-labelledby={`faq-${category}`}>
              <h2 id={`faq-${category}`} className="type-mono text-muted lg:pt-5">
                {category}
              </h2>
              <Accordion>
                {faqs
                  .filter((faq) => (faq.category || "General") === category)
                  .map((faq) => (
                    <AccordionItem key={faq.id} title={faq.question}>
                      <Markdown>{faq.answer}</Markdown>
                    </AccordionItem>
                  ))}
              </Accordion>
            </section>
          ))}
        </Container>
      </Stratum>
      <TerrainCut from="lab" to="topsoil" variant="ridge" />
      <CTA title="¿Tu pregunta no está acá?" action={{ label: "Hablemos del proceso", href: "/contacto" }} secondary={{ label: "Ver servicios", href: "/servicios" }} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: "Preguntas frecuentes", path: "/faq" }])} />
    </>
  );
}
