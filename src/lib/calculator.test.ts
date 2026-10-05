import { describe, expect, it } from "vitest";
import { calcQuery, calculate, CALC_DEFAULTS, clampCalc, parseCalcParams } from "./calculator";

describe("calculadora de procesos manuales", () => {
  it("calcula horas, costo y tiempo recuperable", () => {
    expect(calculate({ people: 3, hours: 6, cost: 5, weeks: 48, repetitive: 50 })).toEqual({
      annualHours: 864,
      annualCost: 4320,
      recoverableHours: 432,
    });
  });

  it("limita cada valor a su rango y usa el default si no es un número", () => {
    expect(clampCalc("people", 999)).toBe(50);
    expect(clampCalc("hours", -4)).toBe(1);
    expect(clampCalc("weeks", Number.NaN)).toBe(48);
  });

  it("la URL compartible va y vuelve sin perder datos", () => {
    const input = { people: 7, hours: 12, cost: 9, weeks: 50, repetitive: 70 };
    const params = Object.fromEntries(new URLSearchParams(calcQuery(input)));
    expect(parseCalcParams(params)).toEqual(input);
  });

  it("ignora parámetros basura", () => {
    expect(parseCalcParams({ p: "<script>", h: ["x"], zzz: "1" })).toEqual(CALC_DEFAULTS);
  });
});
