"use client";

import { ArrowDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Mascot } from "@/components/brand/mascot";

/** Señal de que hay más abajo: el burro mira alrededor y la flecha rebota. Se va sola al primer scroll; al tocarla baja a la siguiente sección. */
export function ScrollCue({ label = "Seguí bajando" }: { label?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const onScroll = () => setGone(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = () => {
    const next = ref.current?.closest("header")?.nextElementSibling;
    next?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  };

  return (
    <button ref={ref} type="button" onClick={go} className="scroll-cue" data-gone={gone || undefined} aria-label={`${label}: ir a la próxima sección`}>
      <Mascot variant="mascot" sizes="48px" lively className="w-10" />
      <span className="scroll-cue-arrow" aria-hidden="true">
        <ArrowDown strokeWidth={2.5} />
      </span>
      <span className="type-mono">{label}</span>
    </button>
  );
}
