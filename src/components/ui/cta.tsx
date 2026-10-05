import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "./button";
import { Container, Stratum, type Tone } from "./stratum";

type Action = { label: string; href: string };

type CTAProps = {
  /** Frase grande. Máximo 3 líneas. */
  title: ReactNode;
  lead?: ReactNode;
  /** Un solo botón primario. */
  action: Action;
  /** Salida secundaria discreta (enlace). */
  secondary?: Action;
  tone?: Tone;
  id?: string;
  /** id del titular; por defecto se deriva de `id`. */
  headingId?: string;
  className?: string;
};

/** Banda de llamada a la acción: frase grande + un botón. */
export function CTA({ title, lead, action, secondary, tone = "topsoil", id, headingId, className }: CTAProps) {
  const titleId = headingId ?? (id ? `${id}-title` : undefined);
  return (
    <Stratum tone={tone} id={id} aria-labelledby={titleId} className={className}>
      <Container>
        <div className="cta-grid">
          <h2 id={titleId} className="type-h1">
            {title}
          </h2>
          <div className="cta-foot">
            {lead ? <p className="type-lead">{lead}</p> : <span />}
            <div className="cta-actions">
              <Button href={action.href} size="lg" icon={<ArrowRight />}>
                {action.label}
              </Button>
              {secondary && (
                <Button href={secondary.href} variant="link">
                  {secondary.label}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Container>
    </Stratum>
  );
}
