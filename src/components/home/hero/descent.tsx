"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { REDUCED_MOTION_QUERY } from "@/lib/motion";

// three.js viaja en un chunk aparte y solo se pide si el dispositivo lo aguanta.
const Scene = dynamic(() => import("./scene"), { ssr: false });

const TONES = [
  [0.22, "surface"],
  [0.5, "topsoil"],
  [0.78, "deep"],
  [2, "lab"],
] as const;

/** Rampa 0→1→0: aparece entre a y b, se va entre c y d. */
const window_ = (p: number, a: number, b: number, c: number, d: number) =>
  Math.min(Math.max((p - a) / (b - a), 0), 1) * (1 - Math.min(Math.max((p - c) / (d - c), 0), 1));

function canRun3d(): boolean {
  if (matchMedia(REDUCED_MOTION_QUERY).matches) return false;
  // En teléfonos se usa la composición estática: sin descargar three.js y sin texto sobre la escena.
  if (window.innerWidth < 768) return false;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return false;
  if ((nav.deviceMemory ?? 8) < 4 || (nav.hardwareConcurrency ?? 8) < 4) return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Envuelve los paneles del hero. Si se puede, monta la madriguera 3D y dirige el descenso con el scroll. */
export function HeroDescent({ surfaceItems, depthItems, children }: { surfaceItems: string[]; depthItems: string[]; children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const progress = useRef({ target: 0 });
  const [capable, setCapable] = useState(false);
  const [live, setLive] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = root.current;
    if (!el || !canRun3d()) return;
    // Si el contenido del primer panel no entra en la pantalla, no se fija la escena.
    const intro = el.querySelector<HTMLElement>(".hero-intro");
    if (intro && intro.scrollHeight > window.innerHeight + 4) return;

    // three.js pesa ~240 KiB y armar la escena ocupa el hilo principal unos segundos: montarla junto con la carga
    // trababa el primer clic (TBT de 360 ms en PageSpeed, escritorio). Se monta con la primera interacción
    // (mouse, scroll, toque o teclado) o, si no hay ninguna, cuando el navegador queda libre pasados 8 s.
    // Mientras tanto se ve la composición estática, la misma de los teléfonos.
    // ponytail: el disparo es fijo — si hiciera falta, precargar el chunk en reposo antes de la interacción.
    const WAKE = ["pointermove", "pointerdown", "wheel", "touchstart", "keydown", "scroll"] as const;
    let woken = false;
    const idle = (cb: () => void) => (window.requestIdleCallback ? window.requestIdleCallback(cb, { timeout: 2000 }) : window.setTimeout(cb, 0));
    function sleep() {
      window.clearTimeout(fallback);
      WAKE.forEach((type) => window.removeEventListener(type, wake));
    }
    function wake() {
      if (woken) return;
      woken = true;
      sleep();
      setCapable(true);
    }
    const fallback = window.setTimeout(() => idle(wake), 8000);
    WAKE.forEach((type) => window.addEventListener(type, wake, { passive: true }));

    const onScroll = () => {
      const range = el.offsetHeight - window.innerHeight;
      progress.current.target = range > 0 ? Math.min(Math.max((window.scrollY - el.offsetTop) / range, 0), 1) : 0;
    };
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      sleep();
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Dónde está la insignia del burro dentro del lienzo: la escena acomoda las tarjetas a su alrededor.
  const anchor = useCallback(() => {
    const stage = root.current?.querySelector<HTMLElement>(".hero-stage");
    const badge = root.current?.querySelector<HTMLElement>(".hero-intro .mascot");
    if (!stage || !badge?.offsetWidth) return null;
    const s = stage.getBoundingClientRect();
    const b = badge.getBoundingClientRect();
    return { x: b.left - s.left + b.width / 2, y: b.top - s.top + b.height / 2, r: b.width / 2 };
  }, []);

  // La escena avisa en cada frame: aquí se cruzan los paneles HTML (texto siempre en HTML).
  const onProgress = (p: number) => {
    const el = root.current;
    if (!el) return;
    const [intro, bridge, closing] = el.querySelectorAll<HTMLElement>(".hero-panel");
    const opacities = [1 - Math.min(Math.max((p - 0.05) / 0.1, 0), 1), window_(p, 0.28, 0.36, 0.56, 0.64), window_(p, 0.84, 0.94, 2, 3)];
    [intro, bridge, closing].forEach((panel, i) => {
      if (!panel) return;
      panel.style.opacity = opacities[i].toFixed(3);
      panel.style.pointerEvents = opacities[i] > 0.5 ? "auto" : "none";
      panel.inert = opacities[i] < 0.05;
    });
    const tone = TONES.find(([limit]) => p < limit)?.[1] ?? "lab";
    if (el.dataset.stratum !== tone) el.dataset.stratum = tone;
  };

  return (
    <section ref={root} id="inicio" className="hero relative" data-live={live} data-stratum="surface" data-stratum-label="Superficie" data-depth={0} aria-label="Burrow Labs: codificando soluciones">
      <div className="hero-stage">
        <div className="hero-canvas" aria-hidden="true">
          {capable && (
            <Scene
              progress={progress}
              surfaceItems={surfaceItems}
              depthItems={depthItems}
              active={visible}
              onReady={() => {
                setLive(true);
                requestAnimationFrame(() => window.dispatchEvent(new Event("scroll")));
              }}
              onProgress={onProgress}
              anchor={anchor}
            />
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
