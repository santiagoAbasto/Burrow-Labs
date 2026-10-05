"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/** Las animaciones de la escena solo corren mientras está en pantalla (data-live). */
export function SceneStage({ className, style, children }: { className: string; style?: CSSProperties; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => (el.dataset.live = String(entry.isIntersecting)), { rootMargin: "80px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
