import type { ReactNode } from "react";
import { SectionHeading } from "@/components/ui/section-heading";
import { Container, Stratum, type Tone } from "@/components/ui/stratum";
import { ScrollCue } from "./scroll-cue";

/** Cabecera de página interior. Deja el espacio del header fijo. Con `media` (la captura de un caso) va en dos
 * columnas desde escritorio, para que la evidencia se vea al entrar; en el celular queda debajo del texto. */
export function PageHeader({
  eyebrow,
  title,
  children,
  tone = "deep",
  actions,
  media,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  tone?: Tone;
  actions?: ReactNode;
  media?: ReactNode;
}) {
  const text = (
    <>
      {/* Al lado de una imagen el titular va un cuerpo más chico (sigue siendo el h1): las palabras largas entran enteras. */}
      <SectionHeading as="h1" size={media ? "h2" : "h1"} eyebrow={eyebrow} title={title}>
        {children}
      </SectionHeading>
      {actions && <div className="page-actions mt-8 flex flex-wrap gap-3">{actions}</div>}
      <ScrollCue />
    </>
  );
  return (
    <Stratum as="header" tone={tone} flush className="page-header pt-32 pb-16 lg:pt-44 lg:pb-24">
      {media ? (
        <Container className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-14">
          <div>{text}</div>
          <div className="page-media">{media}</div>
        </Container>
      ) : (
        <Container>{text}</Container>
      )}
    </Stratum>
  );
}
