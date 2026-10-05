// Módulo de cliente: se importa desde componentes "use client".
import type { AnalyticsEvent, AnalyticsMeta } from "./analytics-events";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Registra un evento first-party anónimo en /api/events y, si GA4 está cargado (hay ID y hubo
 * consentimiento), también lo envía a GA4. `meta` nunca debe llevar PII.
 */
export function track(name: AnalyticsEvent, meta?: AnalyticsMeta): void {
  if (typeof window === "undefined") return;
  // De dónde llegó la visita (solo en page_view). Recortado al tope del esquema: el host va al principio.
  const ref = name === "page_view" && document.referrer ? document.referrer.slice(0, 300) : undefined;
  const body = JSON.stringify({ name, path: window.location.pathname, meta, ref });
  try {
    // sendBeacon sobrevive a la navegación (clic en un CTA que cambia de página).
    if (!navigator.sendBeacon?.("/api/events", body))
      void fetch("/api/events", { method: "POST", body, keepalive: true }).catch(() => {});
  } catch {
    // La analítica nunca debe romper la interfaz.
  }
  if (name !== "page_view") window.gtag?.("event", name, meta);
}
