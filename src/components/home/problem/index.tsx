import { BrandPhrase, SectionHeading } from "@/components/ui/section-heading";
import { Container, Stratum } from "@/components/ui/stratum";
import type { HomeContent } from "../sections";
import { ProblemFlow } from "./flow";

export default function Problem({ content }: { content: HomeContent<"problem"> }) {
  return (
    <Stratum tone="lab" id="problema" label="Problema" depth={46} aria-labelledby="problema-title">
      <Container>
        <SectionHeading id="problema-title" eyebrow={content.eyebrow} title={content.title}>
          {content.body}
        </SectionHeading>
        <ProblemFlow content={content} />
        <BrandPhrase className="mt-section" mark="−46 m">
          {content.phrase}
        </BrandPhrase>
      </Container>
    </Stratum>
  );
}
