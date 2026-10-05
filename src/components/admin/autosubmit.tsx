"use client";

import { useEffect } from "react";

/** Los <select data-autosubmit> envían su formulario al cambiar (sin JS queda el botón «Aplicar» del <noscript>). */
export function AutoSubmit() {
  useEffect(() => {
    const onChange = (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLSelectElement && target.hasAttribute("data-autosubmit")) target.form?.requestSubmit();
    };
    document.addEventListener("change", onChange);
    return () => document.removeEventListener("change", onChange);
  }, []);
  return null;
}
