import type { ReactNode } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Container, Stratum, type Tone } from "@/components/ui/stratum";
import { ScrollCue } from "./scroll-cue";

/** Cabecera de página interior. Deja el espacio del header fijo. */
export function PageHeader({
  eyebrow,
  title,
  children,
  tone = "deep",
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  tone?: Tone;
  actions?: ReactNode;
}) {
  return (
    <Stratum as="header" tone={tone} flush className="page-header pt-32 pb-16 lg:pt-44 lg:pb-24">
      <Container>
        <SectionHeading as="h1" size="h1" eyebrow={eyebrow} title={title}>
          {children}
        </SectionHeading>
        {actions && <div className="page-actions mt-8 flex flex-wrap gap-3">{actions}</div>}
        <ScrollCue />
      </Container>
    </Stratum>
  );
}
