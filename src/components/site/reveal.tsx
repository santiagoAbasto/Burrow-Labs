"use client";

import { useEffect } from "react";
import { REDUCED_MOTION_QUERY } from "@/lib/motion";

const PENDING = "[data-reveal]:not([data-revealed])";

/**
 * Revela lo marcado con `data-reveal` cuando entra en pantalla (sube y aparece). Se monta por página
 * (va en el template), así cada navegación vuelve a observar. Sin JavaScript nada queda oculto:
 * el CSS solo esconde cuando el body tiene `data-reveal-ready`.
 */
export function Reveal() {
  useEffect(() => {
    const reduced = matchMedia(REDUCED_MOTION_QUERY).matches;
    if (!reduced) document.body.dataset.revealReady = "true";
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
    const watch = (root: Element | Document) => {
      const found = root instanceof Element && root.matches(PENDING) ? [root as HTMLElement] : [];
      found.push(...root.querySelectorAll<HTMLElement>(PENDING));
      found.forEach((el) => (reduced ? (el.dataset.revealed = "true") : observer.observe(el)));
    };
    watch(document);
    // Al navegar, parte de la página puede llegar después de montar el template (streaming). Sin esto,
    // lo que llegaba tarde quedaba transparente para siempre y había que entrar dos veces.
    const late = new MutationObserver((records) =>
      records.forEach((record) => record.addedNodes.forEach((node) => node instanceof Element && watch(node))),
    );
    late.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      late.disconnect();
    };
  }, []);
  return null;
}
