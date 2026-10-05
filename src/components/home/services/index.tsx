import { ArrowRight } from "lucide-react";
import { ServiceIndex } from "@/components/services/service-index";
import { Button } from "@/components/ui/button";
import { BrandPhrase, SectionHeading } from "@/components/ui/section-heading";
import { Container, Stratum } from "@/components/ui/stratum";
import { getServices } from "@/lib/content";
import type { HomeContent } from "../sections";

export default async function Services({ content }: { content: HomeContent<"services"> }) {
  const services = await getServices();
  if (services.length === 0) return null;
  return (
    <Stratum tone="deep" id="servicios" label="Servicios" depth={50} aria-labelledby="servicios-title">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading id="servicios-title" eyebrow={content.eyebrow} title={content.title}>
            {content.body}
          </SectionHeading>
          <Button href="/servicios" variant="secondary" icon={<ArrowRight />}>
            {content.cta}
          </Button>
        </div>
        <ServiceIndex services={services} />
        <BrandPhrase className="mt-section" mark="−50 m">
          {content.phrase}
        </BrandPhrase>
      </Container>
    </Stratum>
  );
}
