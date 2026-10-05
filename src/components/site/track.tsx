"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { track } from "@/lib/analytics";
import type { AnalyticsEvent, AnalyticsMeta } from "@/lib/analytics-events";

/** Registra un evento cuando se hace clic en cualquier cosa de adentro. No agrega caja (display: contents). */
export function TrackClick({ event, meta, children }: { event: AnalyticsEvent; meta?: AnalyticsMeta; children: ReactNode }) {
  return (
    <span className="contents" onClick={() => track(event, meta)}>
      {children}
    </span>
  );
}

/** Registra un evento una sola vez, cuando el marcador entra en pantalla. */
export function TrackView({ event, meta }: { event: AnalyticsEvent; meta?: AnalyticsMeta }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      track(event, meta);
      observer.disconnect();
    });
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- una sola vez por montaje
  }, []);
  return <span ref={ref} aria-hidden="true" />;
}

/** Cuenta una visita anónima por cada página vista (sin cookies ni identificadores). */
export function PageView() {
  const pathname = usePathname();
  useEffect(() => track("page_view"), [pathname]);
  return null;
}
