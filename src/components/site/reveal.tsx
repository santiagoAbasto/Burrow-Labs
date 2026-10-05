"use client";

import { useEffect } from "react";
import { REDUCED_MOTION_QUERY } from "@/lib/motion";

/**
 * Revela lo marcado con `data-reveal` cuando entra en pantalla (sube y aparece). Se monta por página
 * (va en el template), así cada navegación vuelve a observar. Sin JavaScript nada queda oculto:
 * el CSS solo esconde cuando el body tiene `data-reveal-ready`.
 */
export function Reveal() {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])"));
    if (matchMedia(REDUCED_MOTION_QUERY).matches) {
      targets.forEach((el) => (el.dataset.revealed = "true"));
      return;
    }
    document.body.dataset.revealReady = "true";
    const observer = new IntersectionObserver(
      (entries) => {
        // lo que entra junto se revela en cascada (120 ms entre uno y otro, hasta 6), no de golpe
        entries
          .filter((entry) => entry.isIntersecting)
          .forEach((entry, i) => {
            const el = entry.target as HTMLElement;
            el.style.setProperty("--reveal-delay", `${Math.min(i, 6) * 120}ms`);
            el.dataset.revealed = "true";
            observer.unobserve(el);
          });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return null;
}
