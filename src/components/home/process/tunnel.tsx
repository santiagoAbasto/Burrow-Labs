"use client";

import { useEffect, useRef, useState } from "react";
import { Cart } from "@/components/brand/cart";
import { ProcessNode } from "@/components/ui/process-node";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

type Step = { number: string; name: string; text: string };

/** Recorrido con estaciones. La vagoneta avanza con el scroll (horizontal en desktop, vertical en mobile) y va dejando el riel encendido. */
export function ProcessTunnel({ steps }: { steps: Step[] }) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [reached, setReached] = useState(0);
  const active = reduced ? steps.length - 1 : reached;

  useEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    let revert = () => {};
    let cancelled = false;
    const start = () =>
      // GSAP se descarga recién cuando la sección está por entrar en pantalla.
      void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        const track = el.querySelector<HTMLElement>("[data-track]")!;
        const cart = el.querySelector<HTMLElement>("[data-cart]")!;
        const fill = el.querySelector<HTMLElement>("[data-fill]")!;
        const wagon = cart.querySelector<HTMLElement>(".cart");
        let resting = 0;
        const mm = gsap.matchMedia();
        const ride = (axis: "x" | "y") => {
          const length = () => (axis === "x" ? track.offsetWidth : track.offsetHeight);
          const body = () => (axis === "x" ? cart.offsetWidth : cart.offsetHeight);
          const trigger = { trigger: track, start: axis === "x" ? "top 80%" : "top 55%", end: axis === "x" ? "bottom 25%" : "bottom 70%", scrub: 0.6, invalidateOnRefresh: true };
          gsap.fromTo(
            cart,
            { [axis]: 0 },
            {
              [axis]: () => length() - body(),
              ease: "none",
              scrollTrigger: {
                ...trigger,
                onUpdate: (self) => {
                  setReached(Math.round(self.progress * (steps.length - 1)));
                  // las ruedas giran mientras hay scroll y se frenan cuando para
                  if (wagon) wagon.dataset.rolling = "true";
                  window.clearTimeout(resting);
                  resting = window.setTimeout(() => wagon && delete wagon.dataset.rolling, 220);
                },
              },
            },
          );
          // el riel se enciende hasta donde va la vagoneta
          const scale = axis === "x" ? "scaleX" : "scaleY";
          gsap.fromTo(fill, { [scale]: () => body() / 2 / length() }, { [scale]: () => 1 - body() / 2 / length(), ease: "none", scrollTrigger: trigger });
          return () => window.clearTimeout(resting);
        };
        mm.add("(min-width: 1024px)", () => ride("x"));
        mm.add("(max-width: 1023.98px)", () => ride("y"));
        revert = () => mm.revert();
      });
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        start();
      },
      { rootMargin: "600px 0px" },
    );
    near.observe(el);
    return () => {
      cancelled = true;
      near.disconnect();
      revert();
    };
  }, [reduced, steps.length]);

  return (
    <div ref={root} className="mt-14 grid grid-cols-[4.5rem_1fr] gap-x-4 lg:block">
      <div data-track className="relative lg:h-40">
        {/* riel: apagado por delante, encendido por donde ya pasó */}
        <div aria-hidden="true" className="absolute inset-y-0 right-0 w-[3px] rounded-full bg-line-strong lg:inset-x-0 lg:top-auto lg:bottom-0 lg:h-[3px] lg:w-auto" />
        <div
          data-fill
          aria-hidden="true"
          className={`absolute inset-y-0 right-0 w-[3px] origin-top rounded-full bg-yellow-400 lg:inset-x-0 lg:top-auto lg:bottom-0 lg:h-[3px] lg:w-auto lg:origin-left ${reduced ? "" : "scale-y-0 lg:scale-x-0 lg:scale-y-100"}`}
        />
        <div data-cart className="absolute top-0 right-1 w-14 will-change-transform lg:top-auto lg:right-auto lg:bottom-0 lg:left-0 lg:w-28">
          <Cart />
        </div>
      </div>
      <ol className="process-rail grid gap-10 py-2 lg:grid-cols-6 lg:gap-x-4 lg:py-0 lg:pt-10">
        {steps.map((step, i) => (
          <ProcessNode key={step.number} step={i + 1} title={step.name} state={i < active ? "done" : i === active ? "active" : "idle"}>
            {step.text}
          </ProcessNode>
        ))}
      </ol>
    </div>
  );
}
