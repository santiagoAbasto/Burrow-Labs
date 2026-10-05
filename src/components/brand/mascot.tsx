"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import manifest from "@/../public/brand/manifest.json";
import { cn } from "@/lib/cn";
import { REDUCED_MOTION_QUERY } from "@/lib/motion";

type Props = {
  /** `badge`: el burro dentro de su insignia. `mascot`: el burro recortado. */
  variant?: "badge" | "mascot";
  /** Atributo sizes de las imágenes (ancho real en pantalla). */
  sizes: string;
  alt?: string;
  className?: string;
  priority?: boolean;
  /** La pupila sigue al cursor (solo puntero fino y sin reduced motion). */
  track?: boolean;
  /** Animación propia continua: aletea las orejas y mira a los lados sola (no sigue al cursor). */
  lively?: boolean;
};

/**
 * La mascota oficial, apilando capas del vector original (orejas detrás, cuerpo delante, pupila en CSS).
 * En reposo es idéntica al logo; nada está redibujado y, al ser SVG, no se pixela a ningún tamaño. Ver docs/BRAND-ASSETS.md.
 */
export function Mascot({ variant = "mascot", sizes, alt = "", className, priority = false, track = true, lively = false }: Props) {
  const geo = manifest[variant];
  const size = manifest.sizes[variant];
  const root = useRef<HTMLSpanElement>(null);
  const pupil = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    const dot = pupil.current;
    if (!track || lively || !el || !dot) return;
    if (!matchMedia("(pointer: fine)").matches || matchMedia(REDUCED_MOTION_QUERY).matches) return;

    let frame = 0;
    let visible = false;
    let x = 0;
    let y = 0;
    const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    observer.observe(el);

    const update = () => {
      frame = 0;
      const box = el.getBoundingClientRect();
      const eyeX = box.left + geo.eye.center[0] * box.width;
      const eyeY = box.top + geo.eye.center[1] * box.height;
      const dx = x - eyeX;
      const dy = y - eyeY;
      const dist = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, dist / (box.width * 1.5)) * geo.pupilMaxTravel * box.width;
      const tx = eyeX + (dx / dist) * reach - (box.left + geo.pupil.center[0] * box.width);
      const ty = eyeY + (dy / dist) * reach - (box.top + geo.pupil.center[1] * box.height);
      dot.style.transform = `translate(-50%, -50%) translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px)`;
    };
    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (visible && !frame) frame = requestAnimationFrame(update);
    };
    const reset = () => (dot.style.transform = "");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", reset);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", reset);
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [track, lively, geo]);

  const layer = (name: string, extra?: { className: string; origin: string }) => (
    <Image
      src={`/brand/${name}.svg`}
      alt=""
      fill
      sizes={sizes}
      preload={priority} // `priority` de next/image quedó obsoleto en Next 16
      draggable={false}
      className={extra?.className}
      style={extra && { transformOrigin: extra.origin }}
    />
  );

  return (
    <span
      ref={root}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      className={cn("mascot", lively && "mascot-lively", className)}
      style={{ aspectRatio: `${size.width} / ${size.height}` }}
    >
      {variant === "badge" && layer("badge-bg")}
      {layer(`${variant}-ears`, {
        className: "mascot-ears",
        origin: `${geo.earPivot[0] * 100}% ${geo.earPivot[1] * 100}%`,
      })}
      {layer(`${variant}-body`)}
      <span
        ref={pupil}
        className="mascot-pupil"
        style={{
          left: `${geo.pupil.center[0] * 100}%`,
          top: `${geo.pupil.center[1] * 100}%`,
          width: `${geo.pupil.radius * 200}%`,
        }}
      />
    </span>
  );
}
