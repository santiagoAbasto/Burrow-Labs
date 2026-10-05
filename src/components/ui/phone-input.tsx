"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";

export type PhoneInputProps = {
  /** Nombre del campo que se envía (en formato internacional: +59170000000). */
  name: string;
  defaultValue?: string;
  // Los pone <Field>:
  id?: string;
  required?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
};

type Rich = { Component: ComponentType<PhoneInputProps & { autoFocus?: boolean }>; value?: string; focus: boolean };

/** Lo tecleado en el campo simple, en el formato que espera el selector: sin prefijo se asume Bolivia. */
export function toInternational(typed: string): string | undefined {
  const digits = typed.replace(/\D/g, "");
  if (!digits) return undefined;
  return typed.trim().startsWith("+") ? `+${digits}` : `+591${digits}`;
}

/**
 * Teléfono con selector de país y bandera (por defecto, Bolivia). Va dentro de <Field>.
 * El selector (react-phone-number-input + banderas + metadatos) pesa ~100 KB gzip: no viaja con la página,
 * se pide cuando el campo está por entrar en pantalla. Hasta entonces hay un <input type="tel"> real con
 * la misma caja, que también es lo que funciona sin JavaScript; lo ya escrito y el foco pasan al selector.
 */
export function PhoneInput(props: PhoneInputProps) {
  const { name, defaultValue, id, required, ...aria } = props;
  const plain = useRef<HTMLInputElement>(null);
  const [rich, setRich] = useState<Rich | null>(null);

  useEffect(() => {
    const el = plain.current;
    if (!el) return;
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        void import("./phone-input-rich").then((mod) => {
          if (!el.isConnected) return;
          setRich({ Component: mod.default, value: toInternational(el.value), focus: document.activeElement === el });
        });
      },
      { rootMargin: "600px 0px" },
    );
    near.observe(el);
    return () => near.disconnect();
  }, []);

  if (rich) return <rich.Component {...props} defaultValue={rich.value ?? defaultValue} autoFocus={rich.focus} />;
  return (
    <div className="phone PhoneInput" data-invalid={aria["aria-invalid"] ? "true" : undefined}>
      {/* el hueco del selector de país: misma caja, así el número no se corre cuando llega */}
      <div className="PhoneInputCountry" aria-hidden="true">
        <div className="PhoneInputCountryIcon" />
        <div className="PhoneInputCountrySelectArrow" />
      </div>
      <input ref={plain} type="tel" name={name} defaultValue={defaultValue} placeholder="+591" autoComplete="tel" className="PhoneInputInput" id={id} required={required} {...aria} />
    </div>
  );
}
