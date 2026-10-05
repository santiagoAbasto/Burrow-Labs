import { ArrowRight } from "lucide-react";
import { Calculator } from "@/components/tools/calculator";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Container, Stratum } from "@/components/ui/stratum";
import type { HomeContent } from "../sections";

export default function CalculatorSection({ content }: { content: HomeContent<"calculator"> }) {
  return (
    <Stratum tone="chalk" id="calculadora" label="Calculadora" depth={70} aria-labelledby="calculadora-title">
      <Container>
        <SectionHeading id="calculadora-title" eyebrow={content.eyebrow} title={content.title}>
          {content.body}
        </SectionHeading>
        <div className="mt-14">
          <Calculator labels={content} />
        </div>
        <Button href="/diagnostico" variant="link" icon={<ArrowRight />} className="mt-10">
          {content.diagnosticCta}
        </Button>
      </Container>
    </Stratum>
  );
}
