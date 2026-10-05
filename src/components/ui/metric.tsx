import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type MetricProps = {
  /** El dato. Debe venir de contenido real (base de datos): no inventar métricas. */
  value: ReactNode;
  unit?: string;
  label: ReactNode;
  note?: ReactNode;
  className?: string;
};

export function Metric({ value, unit, label, note, className }: MetricProps) {
  return (
    <div className={cn("metric", className)}>
      <p className="metric-value">
        {value}
        {unit && <span className="metric-unit">{unit}</span>}
      </p>
      <p className="metric-label type-mono">{label}</p>
      {note && <p className="metric-note">{note}</p>}
    </div>
  );
}
