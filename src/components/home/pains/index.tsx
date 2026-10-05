import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Container, Stratum } from "@/components/ui/stratum";
import type { HomeContent } from "../sections";

/** Lista corta de síntomas que el visitante reconoce; cierra con la idea de que el problema está en el proceso. */
export default function Pains({ content }: { content: HomeContent<"pains"> }) {
  return (
    <Stratum tone="lab" id="te-suena" label="Problemas frecuentes" depth={52} aria-labelledby="te-suena-title">
      <Container>
        <SectionHeading id="te-suena-title" eyebrow={content.eyebrow} title={content.title} />
        <ol className="mt-10 grid border-t border-line sm:grid-cols-2 sm:gap-x-10">
          {content.items.map((item, i) => (
            <li key={item} className="flex gap-4 border-b border-line py-4" data-reveal="">
              <span className="type-mono text-muted" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="type-h3">{item}</span>
            </li>
          ))}
        </ol>
        <div className="mt-10 grid gap-6 lg:grid-cols-12 lg:items-end">
          <p className="type-lead lg:col-span-8">{content.closing}</p>
          <div className="lg:col-span-4 lg:justify-self-end">
            <Button href="/contacto" icon={<ArrowRight />}>
              {content.cta}
            </Button>
          </div>
        </div>
      </Container>
    </Stratum>
  );
}
