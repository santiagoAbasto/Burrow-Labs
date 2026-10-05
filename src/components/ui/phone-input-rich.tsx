"use client";

import { useState } from "react";
import PhoneInputWithCountry, { type Value } from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import es from "react-phone-number-input/locale/es.json";
import type { PhoneInputProps } from "./phone-input";

/**
 * La versión completa del teléfono: selector de país y bandera. Las banderas son SVG incluidos
 * en el bundle (nada se pide a un CDN). Pesa ~100 KB gzip, por eso <PhoneInput> la pide aparte.
 */
export default function PhoneInputRich({ name, defaultValue, id, required, autoFocus, ...aria }: PhoneInputProps & { autoFocus?: boolean }) {
  const [value, setValue] = useState<Value | undefined>(defaultValue as Value | undefined);
  return (
    <>
      <PhoneInputWithCountry
        className="phone"
        data-invalid={aria["aria-invalid"] ? "true" : undefined}
        flags={flags}
        labels={es}
        defaultCountry="BO"
        international
        countryCallingCodeEditable={false}
        value={value}
        onChange={setValue}
        countrySelectProps={{ "aria-label": "País" }}
        numberInputProps={{ id, required, autoComplete: "tel", autoFocus, ...aria }}
      />
      <input type="hidden" name={name} value={value ?? ""} />
    </>
  );
}
