"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Level = { id: string; label: string; depth: string; tone: string };

/** Profundímetro: estrato actual y profundidad. Es navegación real (anclas). Solo desktop ancho. */
export function DepthGauge() {
  const pathname = usePathname();
  const [levels, setLevels] = useState<Level[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let els: HTMLElement[] = [];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(els.indexOf(entry.target as HTMLElement));
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    // El hero cambia de estrato mientras desciende: el profundímetro toma ese tono para no quedar oscuro sobre oscuro.
    const tones = new MutationObserver((records) => {
      for (const { target } of records) {
        const { id, dataset } = target as HTMLElement;
        setLevels((list) => (list.some((level) => level.id === id && level.tone !== dataset.stratum) ? list.map((level) => (level.id === id ? { ...level, tone: dataset.stratum ?? "surface" } : level)) : list));
      }
    });
    // Se leen los estratos de la página ya pintada (un frame después de navegar).
    const frame = requestAnimationFrame(() => {
      els = [...document.querySelectorAll<HTMLElement>("main [data-stratum-label][id]")];
      setLevels(els.map((el) => ({ id: el.id, label: el.dataset.stratumLabel ?? "", depth: el.dataset.depth ?? "0", tone: el.dataset.stratum ?? "surface" })));
      setActive(0);
      els.forEach((el) => {
        observer.observe(el);
        tones.observe(el, { attributeFilter: ["data-stratum"] });
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      tones.disconnect();
    };
  }, [pathname]);

  if (levels.length < 3) return null;
  const current = levels[active] ?? levels[0];

  return (
    <nav
      aria-label="Profundidad de la página"
      data-stratum={current.tone}
      className="fixed top-1/2 right-5 z-30 hidden -translate-y-1/2 bg-transparent transition-colors duration-normal min-[1400px]:block"
    >
      <p className="mb-3 text-right type-mono" aria-hidden="true">
        {current.depth === "0" ? "0 m" : `−${current.depth} m`}
      </p>
      <ol className="grid justify-items-end">
        {levels.map((level, i) => (
          <li key={level.id}>
            <a
              href={`#${level.id}`}
              aria-current={i === active ? "location" : undefined}
              className="group flex h-6 items-center justify-end gap-2 type-mono"
            >
              <span className={cn("opacity-0 transition-opacity duration-fast group-hover:opacity-100 group-focus-visible:opacity-100", i === active && "opacity-100")}>
                {level.label}
              </span>
              <span aria-hidden="true" className={cn("h-0.5 bg-fg transition-all duration-normal", i === active ? "w-6 bg-accent" : "w-3 opacity-50")} />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
