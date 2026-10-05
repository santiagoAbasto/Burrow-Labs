import { ArrowRight } from "lucide-react";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { SectionHeading } from "@/components/ui/section-heading";
import { Container, Stratum } from "@/components/ui/stratum";
import { getFaqs } from "@/lib/content";
import type { HomeContent } from "../sections";

export default async function Faq({ content }: { content: HomeContent<"faq"> }) {
  const faqs = await getFaqs({ homeOnly: true });
  if (faqs.length === 0) return null;
  return (
    <Stratum tone="lab" id="faq" label="Preguntas" depth={88} aria-labelledby="faq-title">
      <Container className="grid gap-12 lg:grid-cols-[5fr_7fr] lg:gap-20">
        <div>
          <SectionHeading id="faq-title" eyebrow={content.eyebrow} title={content.title} />
          <Button href="/faq" variant="secondary" icon={<ArrowRight />} className="mt-8">
            {content.cta}
          </Button>
        </div>
        <Accordion>
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} title={faq.question} name="home-faq">
              <Markdown>{faq.answer}</Markdown>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </Stratum>
  );
}
