"use client";

import { cloneElement, useId, useRef, useState, type ReactElement, type ReactNode } from "react";

type TooltipProps = {
  /** Texto corto. Es descripción accesible del disparador (aria-describedby). */
  label: ReactNode;
  /** Un solo elemento enfocable (botón, enlace). */
  children: ReactElement<{ "aria-describedby"?: string }>;
  side?: "top" | "bottom";
  align?: "center" | "start" | "end";
  /** Sin burbuja ni descripción, pero con el mismo árbol: el disparador no se vuelve a montar (conserva el foco). */
  disabled?: boolean;
};

const EDGE = 8; // px de aire contra el borde de la pantalla

/**
 * Aparece con hover y con foco de teclado; Esc lo cierra sin mover el foco (WCAG 1.4.13).
 * ponytail: se corrige solo en horizontal para no salir de la pantalla; no cambia de
 * lado si no hay sitio arriba/abajo — elegir `side` según el contexto.
 */
export function Tooltip({ label, children, side = "top", align = "center", disabled = false }: TooltipProps) {
  const id = useId();
  const bubble = useRef<HTMLSpanElement>(null);
  const [dismissed, setDismissed] = useState(false);

  const show = () => {
    setDismissed(false);
    const el = bubble.current;
    if (!el) return;
    el.style.setProperty("--tooltip-shift", "0px");
    const { left, right } = el.getBoundingClientRect();
    const max = document.documentElement.clientWidth - EDGE;
    const shift = left < EDGE ? EDGE - left : right > max ? max - right : 0;
    el.style.setProperty("--tooltip-shift", `${shift}px`);
  };

  return (
    <span
      className="tooltip"
      data-side={side}
      data-align={align}
      data-dismissed={dismissed || undefined}
      onKeyDown={(event) => {
        if (event.key === "Escape") setDismissed(true);
      }}
      onPointerEnter={show}
      onFocus={show}
    >
      {cloneElement(children, { "aria-describedby": disabled ? undefined : id })}
      {!disabled && (
        <span ref={bubble} id={id} role="tooltip" className="tooltip-bubble">
          <span className="tooltip-text">{label}</span>
        </span>
      )}
    </span>
  );
}
