"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { REDUCED_MOTION_QUERY } from "@/lib/motion";

const PERIOD_MS = 4500;

/** Las frases de marca (Configuración › Frases de marca) rotando de a una, sin ruido: entra una, se queda, entra la siguiente. */
export function BrandPhrases({ phrases, fallback, className }: { phrases: string[]; fallback: string; className?: string }) {
  const list = phrases.length ? phrases : [fallback];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (list.length < 2 || matchMedia(REDUCED_MOTION_QUERY).matches) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % list.length), PERIOD_MS);
    return () => window.clearInterval(timer);
  }, [list.length]);

  return (
    <p className={cn("brand-rotator", className)}>
      <span key={index} className="brand-rotator-item">
        {list[index]}
      </span>
    </p>
  );
}
