import { describe, expect, it } from "vitest";
import { hasPendingMarkers, LEGAL } from "./legal";

describe("textos legales", () => {
  it("un texto es borrador mientras tenga marcadores o el aviso de borrador", () => {
    expect(hasPendingMarkers("Titular: [PENDIENTE DEL PROPIETARIO: razón social]")).toBe(true);
    expect(hasPendingMarkers("> **Borrador pendiente de revisión legal.** Falta revisarlo.")).toBe(true);
    expect(hasPendingMarkers("  \n")).toBe(true); // vacío: nada que indexar
    expect(hasPendingMarkers("Texto aprobado, sin avisos ni datos pendientes.")).toBe(false);
  });

  it("los textos sembrados están aprobados: sin marcadores ni aviso de borrador, con titular, NIT y domicilio", () => {
    for (const text of Object.values(LEGAL)) expect(hasPendingMarkers(text)).toBe(false);
    for (const text of [LEGAL.privacy, LEGAL.terms]) {
      expect(text).toContain("Carlos Eduardo Rodriguez Vargas (empresa unipersonal)");
      expect(text).toContain("**NIT:** 3417705018");
      expect(text).toContain("Cochabamba, Bolivia");
    }
  });
});
