import { BrandPhrase, SectionHeading } from "@/components/ui/section-heading";
import { Container, Stratum } from "@/components/ui/stratum";
import type { HomeContent } from "../sections";
import { ProcessTunnel } from "./tunnel";

export default function Process({ content }: { content: HomeContent<"process"> }) {
  return (
    <Stratum tone="deep" id="proceso" label="Proceso" depth={54} aria-labelledby="proceso-title" className="overflow-x-clip">
      <Container>
        <SectionHeading id="proceso-title" eyebrow={content.eyebrow} title={content.title}>
          {content.body}
        </SectionHeading>
        <ProcessTunnel steps={content.steps} />
        <BrandPhrase className="mt-section" mark="−54 m">
          {content.phrase}
        </BrandPhrase>
      </Container>
    </Stratum>
  );
}
