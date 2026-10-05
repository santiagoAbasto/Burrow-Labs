import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Estratos del descenso, de la superficie a la roca madre (DESIGN.md §2). */
export const TONES = ["surface", "chalk", "topsoil", "deep", "lab", "bedrock"] as const;
export type Tone = (typeof TONES)[number];

type ContainerProps = ComponentProps<"div"> & {
  /** 1440px en lugar de 1280px (secciones full-bleed). */
  wide?: boolean;
};

export function Container({ wide = false, className, ...rest }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-gutter", wide ? "max-w-wide" : "max-w-site", className)}
      {...rest}
    />
  );
}

type StratumProps = ComponentProps<"section"> & {
  tone: Tone;
  as?: "section" | "div" | "header" | "footer" | "main" | "article" | "aside";
  /** Profundidad en metros, para el profundímetro (data-depth). */
  depth?: number;
  /** Nombre visible del estrato en el profundímetro (data-stratum-label). */
  label?: string;
  /** Sin el ritmo vertical de sección (py-section). */
  flush?: boolean;
};

/** Envuelve una sección y fija su estrato: pinta --bg/--fg y redefine las variables semánticas. */
export function Stratum({
  tone,
  as: Tag = "section",
  depth,
  label,
  flush = false,
  className,
  ...rest
}: StratumProps) {
  const Element = Tag as "section";
  return (
    <Element
      data-stratum={tone}
      data-depth={depth}
      data-stratum-label={label}
      className={cn("relative", !flush && "py-section", className)}
      {...rest}
    />
  );
}
