"use client";

import { useEffect, useState } from "react";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

/** Detalles para curiosos: saludo en la consola y «Modo Burro Developer» con el código Konami. */
export function EasterEggs() {
  const [dev, setDev] = useState(false);

  useEffect(() => {
    console.log("%c👋 Encontraste la madriguera.", "font: 700 16px monospace; color: #fcea10; background: #080a09; padding: 6px 10px; border-radius: 6px");
    console.log("%c¿También revisás el código? Nos caés bien.\n→ /contacto", "font: 13px monospace; color: #1671b1");

    let position = 0;
    const onKey = (event: KeyboardEvent) => {
      position = event.key === KONAMI[position] ? position + 1 : event.key === KONAMI[0] ? 1 : 0;
      if (position === KONAMI.length) {
        position = 0;
        setDev((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-burro-dev", dev);
  }, [dev]);

  if (!dev) return null;
  return (
    <p role="status" className="sticker fixed top-20 left-1/2 z-50 -translate-x-1/2 bg-white px-4 py-2 type-mono font-bold text-ink">
      {"<BurroDeveloper mode=\"on\" />"} · repetí el código para salir
    </p>
  );
}
