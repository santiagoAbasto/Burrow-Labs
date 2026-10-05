import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const SIZES = { display: "type-display", h1: "type-h1", h2: "type-h2" } as const;

type SectionHeadingProps = {
  /** Rótulo mono sobre el título. */
  eyebrow?: ReactNode;
  title: ReactNode;
  /** Bajada. */
  children?: ReactNode;
  as?: "h1" | "h2" | "h3";
  size?: keyof typeof SIZES;
  align?: "start" | "center";
  /** id del titular (para aria-labelledby de la sección). */
  id?: string;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  children,
  as: Tag = "h2",
  size = "h2",
  align = "start",
  id,
  className,
}: SectionHeadingProps) {
  return (
    <header className={cn("section-heading", className)} data-align={align} data-reveal="">
      {eyebrow && (
        <p className="eyebrow type-mono">
          <span className="veta-dot" aria-hidden="true" />
          {eyebrow}
        </p>
      )}
      <Tag id={id} className={SIZES[size]}>
        {title}
      </Tag>
      {children && <p className="type-lead">{children}</p>}
    </header>
  );
}

type BrandPhraseProps = {
  /** La frase de marca. Una por transición, nunca juntas. */
  children: ReactNode;
  /** Marca de sondeo opcional, p. ej. «−12 m». */
  mark?: string;
  className?: string;
};

/** Rótulo mono entre estratos: una frase de marca sobre la línea del terreno. */
export function BrandPhrase({ children, mark, className }: BrandPhraseProps) {
  return (
    <p className={cn("brand-phrase type-mono", className)}>
      <span className="brand-phrase-text">
        <span className="veta-dot" aria-hidden="true" />
        <span>{children}</span>
        {mark && <span className="brand-phrase-mark">{mark}</span>}
      </span>
    </p>
  );
}
