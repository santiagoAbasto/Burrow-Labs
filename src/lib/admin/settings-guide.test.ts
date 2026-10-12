import { describe, expect, it } from "vitest";
import { SETTINGS_GUIDE } from "./settings-guide";
import { SETTINGS_SHAPE } from "./settings-shape";

/** Las claves que el formulario de un grupo dibuja: las del objeto, o el grupo mismo si es un texto o una lista. */
const formKeys = (group: keyof typeof SETTINGS_SHAPE): string[] => {
  const shape: unknown = SETTINGS_SHAPE[group];
  return shape && typeof shape === "object" && !Array.isArray(shape) ? Object.keys(shape) : [group];
};

describe("SETTINGS_GUIDE", () => {
  // Un campo nuevo en SETTINGS_SHAPE sin su entrada acá sale en el panel con el nombre crudo de la clave
  // («street» en vez de «Calle y número»): json-fields cae a field.label. TypeScript no lo ve, porque
  // `fields` es Record<string, FieldGuide>, así que no falla nada hasta mirar el panel ya desplegado.
  it("cada campo que dibuja el panel tiene su etiqueta", () => {
    for (const guide of SETTINGS_GUIDE) {
      for (const key of guide.only ?? formKeys(guide.group)) {
        expect(guide.fields[key]?.label, `${guide.group}.${key} no tiene etiqueta en la guía`).toBeTruthy();
      }
    }
  });

  // Al revés: una clave renombrada o borrada deja una entrada huérfana que no se ve en ningún lado.
  it("la guía no describe campos que el grupo ya no tiene", () => {
    for (const guide of SETTINGS_GUIDE) {
      const keys = formKeys(guide.group);
      for (const key of Object.keys(guide.fields)) {
        expect(keys, `${guide.group}.${key} sobra en la guía`).toContain(key);
      }
    }
  });
});
