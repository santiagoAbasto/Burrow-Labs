import type { ReactNode } from "react";
import { Mascot } from "@/components/brand/mascot";
import { HELP } from "@/lib/admin/help";

/** Guía plegada de una pantalla: qué es, pasos y consejos. Pensada para quien administra, no para quien programa. */
export function HelpBox({ topic, open = false, compact = false }: { topic: string; open?: boolean; compact?: boolean }) {
  const help = HELP[topic];
  if (!help) return null;
  return (
    <details className="admin-help" open={open || undefined}>
      <summary>
        <Mascot variant="badge" sizes="28px" className="w-7 shrink-0" />
        <span>¿Cómo funciona esta sección?</span>
        <span className="admin-tag ml-auto">Guía</span>
      </summary>
      <div className="admin-help-body">
        <p>{help.intro}</p>
        {help.steps && !compact && (
          <ol>
            {help.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        )}
        {help.tips && (
          <ul className="type-small text-muted">
            {help.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}

/** Versión para el panel lateral de los formularios: pasos siempre visibles. */
export function HelpAside({ topic, extra }: { topic: string; extra?: ReactNode }) {
  const help = HELP[topic];
  if (!help) return null;
  return (
    <section className="admin-panel grid gap-3" aria-label="Guía">
      <h2 className="admin-panel-title">Guía</h2>
      <p className="type-small">{help.intro}</p>
      {help.steps && (
        <ol className="grid list-decimal gap-1.5 pl-5 type-small">
          {help.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      )}
      {help.tips && (
        <ul className="grid list-disc gap-1.5 pl-5 type-small text-muted">
          {help.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      )}
      {extra}
    </section>
  );
}
