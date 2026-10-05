import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

type ProcessNodeProps = {
  /** Número de estación (aquí la secuencia sí es información). */
  step: number;
  title: string;
  children?: ReactNode;
  state?: "idle" | "active" | "done";
  className?: string;
};

/** Estación del proceso. Va dentro de un <ol>; la línea une cada nodo con el siguiente. */
export function ProcessNode({ step, title, children, state = "idle", className }: ProcessNodeProps) {
  return (
    <li
      className={cn("process-node", className)}
      data-state={state}
      aria-current={state === "active" ? "step" : undefined}
    >
      <span className="process-marker">
        {state === "done" ? (
          <>
            <Check aria-hidden="true" strokeWidth={2.5} />
            <span className="sr-only">Paso {step}, completado:</span>
          </>
        ) : (
          <span aria-hidden="true">{String(step).padStart(2, "0")}</span>
        )}
      </span>
      <div className="process-body">
        <h3 className="process-title">
          {state !== "done" && <span className="sr-only">Paso {step}: </span>}
          {title}
        </h3>
        {children && <div>{children}</div>}
      </div>
    </li>
  );
}
