"use client";

import { useSyncExternalStore } from "react";
import { REDUCED_MOTION_QUERY } from "./motion";

const subscribe = (onChange: () => void) => {
  const query = matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/** prefers-reduced-motion sin desajuste de hidratación: el servidor (y la hidratación) asumen `false`. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}
