"use client";

import dynamic from "next/dynamic";
import { usePathname, useServerInsertedHTML } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { SEASON_HINT_COOKIE, surfaceOf, type SeasonState, type SeasonSurface, type SeasonView } from "@/lib/season";

// Campaña de temporada (Navidad), lado del navegador. El servidor decide (src/lib/season.ts) y escribe los atributos
// en <html>; acá solo se mantienen al navegar (el sitio y el panel pueden tener la campaña distinta) y se pregunta a
// /api/season cuando hace falta la hora exacta (modo programado) o hay una vista previa abierta.
// Con la campaña apagada este archivo es lo único que se descarga: ni estilos ni adornos.

const ATTRS = ["data-season", "data-season-surface", "data-season-intensity", "data-season-still", "data-season-scrolled"] as const;
const EFFECTS_KEY = "burrowlabs:season-effects";
const EFFECTS_EVENT = "burrowlabs:season-effects";

const SeasonContext = createContext<SeasonView | null>(null);

/** La campaña de esta página, o null si está apagada. */
export const useSeason = () => useContext(SeasonContext);

/* ── «Reducir efectos»: la elección de cada visitante, recordada en su navegador ── */
const readReduced = () => {
  try {
    return window.localStorage.getItem(EFFECTS_KEY) === "reduced";
  } catch {
    return false;
  }
};
const subscribeReduced = (notify: () => void) => {
  window.addEventListener(EFFECTS_EVENT, notify);
  return () => window.removeEventListener(EFFECTS_EVENT, notify);
};
export const useReducedEffects = () => useSyncExternalStore(subscribeReduced, readReduced, () => false);
export function setReducedEffects(reduced: boolean) {
  try {
    if (reduced) window.localStorage.setItem(EFFECTS_KEY, "reduced");
    else window.localStorage.removeItem(EFFECTS_KEY);
  } catch {
    /* sin almacenamiento, la preferencia dura lo que dure la página */
  }
  window.dispatchEvent(new Event(EFFECTS_EVENT));
}

function applyToHtml(view: SeasonView | null, reduced: boolean) {
  const html = document.documentElement;
  if (!view) {
    for (const attr of ATTRS) html.removeAttribute(attr);
    return;
  }
  html.setAttribute("data-season", view.name);
  html.setAttribute("data-season-surface", view.surface);
  html.setAttribute("data-season-intensity", view.intensity);
  html.toggleAttribute("data-season-still", !view.animations || reduced);
}

export function SeasonProvider({ initial, check, boot, children }: { initial: SeasonState; check: boolean; /** Script de arranque (layout raíz); solo con la campaña encendida. */ boot?: string; children: ReactNode }) {
  // Solo existe en el HTML que manda el servidor (corre antes del primer pintado); en el navegador React nunca lo crea.
  // El aviso de inserción llega una vez por cada tanda del HTML: se emite solo en la primera.
  const inserted = useRef(false);
  useServerInsertedHTML(() => {
    if (!boot || inserted.current) return null;
    inserted.current = true;
    return <script id="season-boot" dangerouslySetInnerHTML={{ __html: boot }} />;
  });
  const pathname = usePathname();
  const [state, setState] = useState(initial);
  const reduced = useReducedEffects();
  const surface = surfaceOf(pathname);
  const view = surface ? state[surface] : null;

  // La hora exacta del modo programado y la vista previa de quien administra: solo entonces se consulta al servidor.
  useEffect(() => {
    if (!check && !document.cookie.includes(`${SEASON_HINT_COOKIE}=`)) return;
    let alive = true;
    fetch("/api/season", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((next: SeasonState | null) => alive && next && setState(next))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [check, pathname]);

  useEffect(() => applyToHtml(view, reduced), [view, reduced]);

  // Al bajar, las luces del encabezado dejan libre la columna del contenido. Un solo listener pasivo, solo con la campaña.
  useEffect(() => {
    if (!view?.lights) return;
    const html = document.documentElement;
    const onScroll = () => html.toggleAttribute("data-season-scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      html.removeAttribute("data-season-scrolled");
    };
  }, [view?.lights, pathname]);

  // La música vive fuera de React y se carga aparte: sin campaña con música, ese archivo ni se descarga.
  const music = Boolean(view?.music);
  useEffect(() => {
    if (!music) return;
    let stop = () => {};
    let cancelled = false;
    import("./music").then((m) => {
      if (cancelled) return;
      m.prepareMusic(true);
      stop = () => m.prepareMusic(false);
    });
    return () => {
      cancelled = true;
      stop();
    };
  }, [music]);

  return <SeasonContext.Provider value={view}>{children}</SeasonContext.Provider>;
}

/* ── Piezas: un solo archivo aparte (con su hoja de estilos) que se descarga únicamente con la campaña encendida ── */
const load = <K extends keyof typeof import("./pieces")>(name: K) => dynamic(() => import("./pieces").then((m) => m[name] as never)) as React.ComponentType<{ view: SeasonView }>;
const PIECES = {
  hat: load("Hat"),
  headerLights: load("HeaderLights"),
  siteExtras: load("SiteExtras"),
  landscape: load("Landscape"),
  notFound: load("NotFoundScene"),
  adminLights: load("AdminLights"),
  adminGreeting: load("AdminGreeting"),
  adminExtras: load("AdminExtras"),
  loginScene: load("LoginScene"),
};

/** Hueco de temporada: no dibuja nada (ni descarga nada) con la campaña apagada o en otra superficie. */
export function SeasonSlot({ name, surface }: { name: keyof typeof PIECES; surface?: SeasonSurface }) {
  const view = useSeason();
  if (!view || (surface && view.surface !== surface)) return null;
  const Piece = PIECES[name];
  return <Piece view={view} />;
}
