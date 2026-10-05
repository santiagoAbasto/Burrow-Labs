import { Check } from "lucide-react";
import { AnimatedCode } from "@/components/ui/animated-code";
import { BrandPhrase, SectionHeading } from "@/components/ui/section-heading";
import { Container, Stratum } from "@/components/ui/stratum";
import type { HomeContent } from "../sections";

export default function Trust({ content }: { content: HomeContent<"trust"> }) {
  return (
    <Stratum tone="lab" id="confianza" label="Confianza" depth={64} aria-labelledby="confianza-title">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[5fr_7fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading id="confianza-title" eyebrow={content.eyebrow} title={content.title}>
              {content.body}
            </SectionHeading>
            <AnimatedCode
              className="mt-10 max-lg:hidden"
              title="pre-deploy"
              lines={[
                { text: "burrow check --antes-de-lanzar", kind: "cmd" },
                { text: "tests ............ ok", kind: "ok" },
                { text: "seguridad ........ ok", kind: "ok" },
                { text: "backups .......... ok", kind: "ok" },
                { text: "listo para producción", kind: "out" },
              ]}
            />
          </div>
          <ul className="border-t border-line">
            {content.pillars.map((pillar, i) => (
              <li key={pillar.name} className="grid grid-cols-[auto_1fr] gap-x-4 border-b border-line py-5 sm:grid-cols-[auto_minmax(0,14rem)_1fr] sm:items-baseline">
                <span className="flex items-center gap-3 type-mono text-muted">
                  <Check aria-hidden="true" className="size-4 text-accent" strokeWidth={3} />
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-semibold">{pillar.name}</h3>
                <p className="col-start-2 text-muted sm:col-start-3">{pillar.text}</p>
              </li>
            ))}
          </ul>
        </div>
        <BrandPhrase className="mt-section" mark="−64 m">
          {content.phrase}
        </BrandPhrase>
      </Container>
    </Stratum>
  );
}
