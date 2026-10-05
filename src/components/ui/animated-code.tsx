"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import type { Tone } from "./stratum";

export type CodeLine = {
  text: string;
  /** cmd: se escribe carácter a carácter tras el prompt. out / ok: aparece de golpe. */
  kind?: "cmd" | "out" | "ok";
};

type AnimatedCodeProps = {
  /** Fragmentos cortos: 3–6 líneas. */
  lines: CodeLine[];
  title?: string;
  /** Milisegundos por carácter. */
  speed?: number;
  tone?: Tone;
  className?: string;
};

const PAUSE = 10; // ticks de espera antes de cada línea de salida

/**
 * Terminal que escribe una vez, al entrar en pantalla. El texto completo está
 * siempre en el DOM (ocupa su sitio: sin layout shift, legible por lectores de
 * pantalla); con reduced motion se muestra entero y quieto por CSS.
 */
export function AnimatedCode({
  lines,
  title = "burrow-labs",
  speed = 32,
  tone = "bedrock",
  className,
}: AnimatedCodeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  const [tick, setTick] = useState(0);

  // Tick en el que empieza cada línea; el último valor es el total.
  const starts = lines.reduce<number[]>(
    (acc, line) => [
      ...acc,
      acc[acc.length - 1]! + ((line.kind ?? "cmd") === "cmd" ? line.text.length + 4 : PAUSE),
    ],
    [0],
  );
  const total = starts[lines.length]!;

  useEffect(() => {
    if (!inView || reduce) return;
    const timer = setInterval(() => {
      setTick((current) => {
        if (current >= total) clearInterval(timer);
        return Math.min(current + 1, total);
      });
    }, speed);
    return () => clearInterval(timer);
  }, [inView, reduce, total, speed]);

  return (
    <div ref={ref} className={cn("code", className)} data-stratum={tone}>
      <div className="code-bar type-mono">
        <span>{title}</span>
        <span className="veta-dot" aria-hidden="true" />
      </div>
      <pre>
        {lines.map((line, index) => {
          const kind = line.kind ?? "cmd";
          const elapsed = tick - starts[index]!;
          const shown =
            kind === "cmd"
              ? Math.max(0, Math.min(line.text.length, elapsed))
              : elapsed >= PAUSE ? line.text.length : 0;
          const current = elapsed >= 0 && tick < starts[index + 1]!;
          const isLast = index === lines.length - 1;
          return (
            <span key={index} className="code-line" data-kind={kind}>
              {kind === "cmd" && <span className="code-prompt">$ </span>}
              {line.text.slice(0, shown)}
              {(current || (isLast && tick >= total)) && kind === "cmd" && (
                <span className="code-cursor" aria-hidden="true" />
              )}
              <span className="code-rest">{line.text.slice(shown)}</span>
              {"\n"}
            </span>
          );
        })}
      </pre>
    </div>
  );
}
