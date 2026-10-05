// Calculadora de procesos manuales: lógica pura (compartida por el componente, la URL y los tests).

export type CalcInput = { people: number; hours: number; cost: number; weeks: number; repetitive: number };

export const CALC_LIMITS = {
  people: { min: 1, max: 50, default: 3, param: "p" },
  hours: { min: 1, max: 40, default: 6, param: "h" },
  cost: { min: 1, max: 100, default: 5, param: "c" },
  weeks: { min: 1, max: 52, default: 48, param: "s" },
  repetitive: { min: 10, max: 90, default: 50, param: "r" },
} as const;

const KEYS = Object.keys(CALC_LIMITS) as (keyof CalcInput)[];

export const CALC_DEFAULTS = Object.fromEntries(KEYS.map((key) => [key, CALC_LIMITS[key].default])) as CalcInput;

export function clampCalc(key: keyof CalcInput, value: number): number {
  const { min, max, default: fallback } = CALC_LIMITS[key];
  return Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback;
}

/** Lee ?p=&h=&c=&s=&r= (solo números; nada personal viaja en la URL). */
export function parseCalcParams(params: Record<string, string | string[] | undefined>): CalcInput {
  return Object.fromEntries(
    KEYS.map((key) => {
      const raw = params[CALC_LIMITS[key].param];
      return [key, clampCalc(key, Number(Array.isArray(raw) ? raw[0] : (raw ?? NaN)))];
    }),
  ) as CalcInput;
}

export function calcQuery(input: CalcInput): string {
  return KEYS.map((key) => `${CALC_LIMITS[key].param}=${input[key]}`).join("&");
}

export function calculate({ people, hours, cost, weeks, repetitive }: CalcInput) {
  const annualHours = people * hours * weeks;
  return {
    annualHours,
    annualCost: annualHours * cost,
    /** Horas de la parte que el propio usuario marcó como repetitiva. No es una promesa de ahorro. */
    recoverableHours: Math.round((annualHours * repetitive) / 100),
  };
}
