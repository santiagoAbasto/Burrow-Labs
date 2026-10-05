"use client";

import {
  Braces,
  ClipboardList,
  Database,
  FileText,
  LayoutDashboard,
  Mail,
  MessageCircle,
  Sparkles,
  Table2,
  Unplug,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { LazyMotion } from "motion/react";
import * as m from "motion/react-m";
import { Mascot } from "@/components/brand/mascot";
import { ease } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import type { HomeContent } from "../sections";

const BEFORE_ICONS: LucideIcon[] = [Table2, MessageCircle, ClipboardList, Mail, FileText, Unplug];
const AFTER_ICONS: LucideIcon[] = [Workflow, Zap, Database, LayoutDashboard, Braces, Sparkles];
const TILT = [-3, 2, -1.5, 3, -2.5, 1.5]; // el desorden de la superficie
// Motion va en dos partes: acá solo el componente `m` (~6 KB); el motor de animación llega aparte, después de hidratar.
const features = () => import("./motion-features").then((mod) => mod.default);

/** Curvas entre una fila de `count` columnas (arriba o abajo) y el centro. */
function Wires({ count, direction, dashed, play }: { count: number; direction: "in" | "out"; dashed?: boolean; play: boolean }) {
  return (
    <svg viewBox="0 0 600 100" preserveAspectRatio="none" aria-hidden="true" className="block h-16 w-full lg:h-24">
      {Array.from({ length: count }, (_, i) => {
        const x = ((i + 0.5) / count) * 600;
        const d = direction === "in" ? `M${x} 0 C${x} 60 300 40 300 100` : `M300 0 C300 60 ${x} 40 ${x} 100`;
        return (
          <m.path
            key={i}
            d={d}
            fill="none"
            vectorEffect="non-scaling-stroke"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={dashed ? "2 7" : undefined}
            className={dashed ? "stroke-fg/50" : "stroke-yellow-400"}
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={play ? { duration: 0.7, ease: ease.out, delay: (direction === "out" ? 0.5 : 0) + i * 0.06 } : { duration: 0 }}
          />
        );
      })}
    </svg>
  );
}

/** Antes (superficie, piezas sueltas) → Burrow Labs → Después (bajo tierra, un solo flujo). */
export function ProblemFlow({ content }: { content: HomeContent<"problem"> }) {
  const play = !usePrefersReducedMotion(); // con reduced motion: mismos estados, sin transición
  const wires = (direction: "in" | "out", dashed?: boolean) => (
    <>
      <div className="lg:hidden">
        <Wires count={3} direction={direction} dashed={dashed} play={play} />
      </div>
      <div className="max-lg:hidden">
        <Wires count={6} direction={direction} dashed={dashed} play={play} />
      </div>
    </>
  );

  return (
    <LazyMotion features={features}>
    <figure className="mt-14 overflow-hidden rounded-lg border border-line-strong">
      <figcaption className="sr-only">
        Antes: {content.before.join(", ")}, cada uno por su lado. Después de pasar por Burrow Labs: {content.after.join(", ")}, conectados en un solo sistema.
      </figcaption>

      <div data-stratum="surface" className="px-4 pt-8 sm:px-8 lg:px-12 lg:pt-12">
        <p className="type-mono text-muted">{content.beforeLabel}</p>
        <ul className="mt-6 grid grid-cols-3 gap-x-3 gap-y-4 lg:grid-cols-6 lg:gap-x-5">
          {content.before.map((label, i) => {
            const Icon = BEFORE_ICONS[i % BEFORE_ICONS.length];
            return (
              <li key={label} style={{ transform: `rotate(${TILT[i % TILT.length]}deg)` }}>
                <div className="grid justify-items-center gap-2 rounded-md border border-dashed border-line-strong bg-panel px-2 py-4 text-center">
                  <Icon aria-hidden="true" className="size-6" strokeWidth={1.75} />
                  <span className="text-[0.8125rem] leading-tight font-medium sm:text-sm">{label}</span>
                </div>
              </li>
            );
          })}
        </ul>
        {wires("in", true)}
      </div>

      <div data-stratum="deep" className="relative px-4 pb-8 sm:px-8 lg:px-12 lg:pb-12">
        <m.div
          className="mx-auto flex w-fit -translate-y-1/2 items-center gap-3 rounded-pill border-2 border-ink bg-yellow-400 py-1.5 pr-5 pl-1.5 text-ink"
          initial={{ scale: 0.85 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, amount: 1 }}
          transition={play ? { type: "spring", stiffness: 420, damping: 24, delay: 0.35 } : { duration: 0 }}
        >
          <Mascot variant="badge" sizes="48px" className="w-11" track={false} />
          <span className="type-mono font-bold">{content.hubLabel}</span>
        </m.div>
        <div className="-mt-6">{wires("out")}</div>
        <ul className="grid grid-cols-3 gap-x-3 gap-y-4 lg:grid-cols-6 lg:gap-x-5">
          {content.after.map((label, i) => {
            const Icon = AFTER_ICONS[i % AFTER_ICONS.length];
            return (
              <m.li
                key={label}
                // el texto nunca se atenúa: solo «despierta» con una pequeña escala
                initial={{ scale: 0.9 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={play ? { duration: 0.4, delay: 0.9 + i * 0.08 } : { duration: 0 }}
              >
                <div className="grid justify-items-center gap-2 rounded-md border border-yellow-400 bg-panel px-2 py-4 text-center">
                  <Icon aria-hidden="true" className="size-6 text-accent" strokeWidth={1.75} />
                  <span className="text-[0.8125rem] leading-tight font-medium sm:text-sm">{label}</span>
                </div>
              </m.li>
            );
          })}
        </ul>
        {/* el flujo único: una sola línea une todo lo de abajo */}
        <div aria-hidden="true" className="mt-5 h-0.5 bg-yellow-400" />
        <p className="mt-4 type-mono text-muted">{content.afterLabel}</p>
      </div>
    </figure>
    </LazyMotion>
  );
}
