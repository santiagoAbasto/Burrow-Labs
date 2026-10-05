// Diagnóstico express: recomendación por reglas. Sin IA: no hace falta (brief §18).
import { DIAGNOSTIC_RESULTS, type DiagnosticResult } from "./form-options";
import type { DiagnosticLead } from "./validation";

export type DiagnosticAnswers = DiagnosticLead["answers"];

export const PEOPLE_OPTIONS = ["Solo yo", "2 a 5", "6 a 20", "Más de 20"] as const;

export const NEED_LABELS: Record<DiagnosticAnswers["needs"][number], string> = {
  clientes: "Clientes",
  operaciones: "Operaciones",
  ventas: "Ventas",
  ia: "IA",
  automatizacion: "Automatización",
  integracion: "Integración",
};

export const RESULT_INFO: Record<DiagnosticResult, { title: string; body: string; href: string; linkLabel: string }> = {
  Web: {
    title: "Una web que trabaje por vos",
    body: "Lo primero es que tus clientes te encuentren, entiendan qué hacés y puedan escribirte o pedirte sin dar vueltas.",
    href: "/planes#web",
    linkLabel: "Ver planes web",
  },
  Automatización: {
    title: "Automatizar lo que se repite",
    body: "Tenés tareas con reglas claras que hoy hace una persona. Conviene empezar por un flujo, medirlo y seguir con el siguiente.",
    href: "/servicios/automatizacion",
    linkLabel: "Ver automatización",
  },
  Sistema: {
    title: "Un sistema a medida",
    body: "Tu operación ya no entra en planillas: necesitás una sola fuente de verdad, con permisos, historial y reportes.",
    href: "/servicios/sistemas-empresariales",
    linkLabel: "Ver sistemas empresariales",
  },
  Integración: {
    title: "Conectar lo que ya tenés",
    body: "Ya tenés herramientas que funcionan, pero trabajan separadas. El mayor salto está en que los datos viajen solos entre ellas.",
    href: "/servicios/automatizacion",
    linkLabel: "Ver integraciones",
  },
  IA: {
    title: "IA aplicada a un proceso concreto",
    body: "Hay volumen de consultas, documentos o texto donde la IA puede ayudar de verdad, conectada a los datos de tu negocio.",
    href: "/servicios/inteligencia-artificial",
    linkLabel: "Ver IA aplicada",
  },
};

// En caso de empate gana el que resuelve el problema de fondo.
const TIE_ORDER: DiagnosticResult[] = ["Sistema", "Automatización", "Integración", "IA", "Web"];

export function recommend(answers: DiagnosticAnswers): { result: DiagnosticResult; also: DiagnosticResult | null } {
  const needs = new Set(answers.needs);
  const team = PEOPLE_OPTIONS.indexOf(answers.people as (typeof PEOPLE_OPTIONS)[number]); // -1 si no coincide
  const score: Record<DiagnosticResult, number> = { Web: 0, Automatización: 0, Sistema: 0, Integración: 0, IA: 0 };

  if (needs.has("automatizacion")) score["Automatización"] += 3;
  if (needs.has("integracion")) score["Integración"] += 3;
  if (needs.has("ia")) score.IA += 3;
  if (needs.has("operaciones")) score.Sistema += 3;
  for (const need of ["ventas", "clientes"] as const) {
    if (!needs.has(need)) continue;
    score.Sistema += 1;
    score.Web += 1;
  }

  if (answers.hasSystem) {
    score["Integración"] += 2;
    score["Automatización"] += 1;
  } else if (needs.has("clientes") || needs.has("ventas")) score.Web += team <= 1 ? 2 : 0;

  if (team >= 2) score.Sistema += 2; // 6 personas o más copiando datos: ya es un sistema esperando
  if (team === 1) score["Automatización"] += 1;
  if (answers.manualWork.trim().length > 0) score["Automatización"] += 1;

  const ranked = [...DIAGNOSTIC_RESULTS].sort((a, b) => score[b] - score[a] || TIE_ORDER.indexOf(a) - TIE_ORDER.indexOf(b));
  return { result: ranked[0], also: score[ranked[1]] > 0 && score[ranked[1]] >= score[ranked[0]] - 1 ? ranked[1] : null };
}
