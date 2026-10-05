import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import type { Tone } from "./stratum";

type StickerProps = ComponentProps<"div"> & {
  as?: "div" | "span" | "article" | "li" | "figure";
  /** Estrato del interior del sticker (por defecto, el del contexto). */
  tone?: Tone;
  /** Inclinación de 2°, como un sticker pegado a mano. */
  tilt?: "left" | "right";
};

/**
 * Contorno del logo: trazo negro 3px + anillo amarillo 5px.
 * Reservado (DESIGN.md §4): mascota, sello «Built in Bolivia», insignias del
 * juego y tarjeta destacada de planes. No usarlo como tarjeta genérica.
 */
export function Sticker({ as: Tag = "div", tone, tilt, className, ...rest }: StickerProps) {
  const Element = Tag as "div";
  return (
    <Element
      data-stratum={tone}
      data-tilt={tilt}
      className={cn("sticker", className)}
      {...rest}
    />
  );
}
