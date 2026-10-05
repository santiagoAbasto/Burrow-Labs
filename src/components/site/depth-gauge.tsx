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
    // Los estratos no están en el primer frame: el hero 3D y el streaming del contenido los agregan después, y
    // cuánto tardan depende de la máquina. Una sola lectura (o un reintento con plazo) hacía que el profundímetro
    // apareciera o no al azar. Se espera a que existan y recién ahí se arma, sin plazo que se pueda quedar corto.
    const collect = () => {
      els = [...document.querySelectorAll<HTMLElement>("main [data-stratum-label][id]")];
      if (els.length < 3) return false;
      setLevels(els.map((el) => ({ id: el.id, label: el.dataset.stratumLabel ?? "", depth: el.dataset.depth ?? "0", tone: el.dataset.stratum ?? "surface" })));
      setActive(0);
      els.forEach((el) => {
        observer.observe(el);
        tones.observe(el, { attributeFilter: ["data-stratum"] });
      });
      return true;
    };
    const waiting = new MutationObserver(() => {
      if (collect()) waiting.disconnect();
    });
    if (!collect()) waiting.observe(document.body, { childList: true, subtree: true });
    return () => {
      waiting.disconnect();
      observer.disconnect();
      tones.disconnect();
    };
  }, [pathname]);

  if (levels.length < 3) return null;
  const current = levels[active] ?? levels[0];

  return (
    // Se muestra desde 1500px: el hueco libre a cada lado mide (ancho − 1280)/2, y recién ahí entran los ~50px del
    // indicador más los 20px del borde con aire. Con el corte anterior (1400px) el hueco era de 60px y se montaba
    // sobre la columna de contenido. El nombre del estrato sale del flujo (ver abajo) para que esto siga siendo cierto.
    <nav
      aria-label="Profundidad de la página"
      data-stratum={current.tone}
      className="fixed top-1/2 right-5 z-30 hidden -translate-y-1/2 bg-transparent transition-colors duration-normal min-[1500px]:block"
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
              className="group relative flex h-6 items-center justify-end gap-2 type-mono"
            >
              {/* Fuera del flujo: el ancho del profundímetro lo fijan las marcas, no la palabra más larga.
                  Desde 1760px el hueco alcanza para el nombre del estrato activo, y vuelve al flujo. */}
              <span
                className={cn(
                  "pointer-events-none absolute right-full mr-2 whitespace-nowrap opacity-0 transition-opacity duration-fast group-hover:opacity-100 group-focus-visible:opacity-100",
                  i === active && "min-[1760px]:static min-[1760px]:opacity-100",
                )}
              >
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
