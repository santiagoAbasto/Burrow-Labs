import { describe, expect, it } from "vitest";
import { lines } from "./project-visual";

describe("rótulos del esquema", () => {
  it("entra entero cuando cabe", () => {
    expect(lines("Roles y permisos", 17, 3)).toEqual(["ROLES Y PERMISOS"]);
  });

  it("corta en la última pausa que entra, sin «…»", () => {
    expect(lines("Ficha con auditoría web, datos de Maps y lectura de IA", 17, 3)).toEqual(["FICHA CON", "AUDITORÍA WEB"]);
    expect(lines("Modo llamadas: guion con los hechos del negocio y permiso registrado", 17, 3)).toEqual(["MODO LLAMADAS"]);
  });

  it("sin pausa, no termina en una palabra que deja la frase colgada", () => {
    expect(lines("Interpretación de consultas en texto libre y códigos de producto", 17, 3)).toEqual(["INTERPRETACIÓN DE", "CONSULTAS EN", "TEXTO LIBRE"]);
  });

  it("nunca pasa del ancho ni de las líneas pedidas", () => {
    for (const label of ["Búsqueda en Google Places por rubro y ciudad, con barridos y tope mensual", "Score de 0 a 100 solo con hechos observados en la ficha de Google"]) {
      const rows = lines(label, 17, 3);
      expect(rows.length).toBeLessThanOrEqual(3);
      for (const row of rows) expect(row.length).toBeLessThanOrEqual(17);
      expect(rows.join(" ")).not.toContain("…");
    }
  });
});
