// Lista cerrada de eventos (brief §27). Compartida por el cliente (track) y el servidor (/api/events).
import { z } from "zod";

export const ANALYTICS_EVENTS = [
  "page_view", // solo first-party (visitas del dashboard); GA4 cuenta las suyas
  "cta_hero",
  "contact_submit",
  "whatsapp_click",
  "project_view",
  "plan_view",
  "plan_cta",
  "diagnostic_start",
  "diagnostic_complete",
  "calculator_complete",
  "game_start",
  "game_complete",
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

/** Datos de contexto del evento (slug, plan, puntaje…). Nunca PII: ni nombres, ni emails, ni teléfonos. */
export type AnalyticsMeta = Record<string, string | number | boolean>;

export const MAX_EVENT_BODY_BYTES = 2048;

/**
 * Ruta interna del sitio: empieza con una sola «/», sin query ni hash (podrían arrastrar datos
 * personales) y sin «//», «\» ni espacios o caracteres de control, con los que un navegador la
 * resolvería como otro dominio («//otro.sitio», «/\otro.sitio», «/<tab>/otro.sitio»).
 */
const INTERNAL_PATH_RE = /^\/(?![/\\])[^?#\\\s\p{Cc}]*$/u;
export const isInternalPath = (path: string) => path.length <= 300 && INTERNAL_PATH_RE.test(path);

/** El enlace de baja lleva el token del suscriptor: en las estadísticas queda solo la ruta base, nunca el token. */
const redactToken = (path: string) => path.replace(/^\/newsletter\/baja\/.*/, "/newsletter/baja");

export const analyticsEventSchema = z.object({
  name: z.enum(ANALYTICS_EVENTS),
  path: z.string().refine(isInternalPath).transform(redactToken),
  meta: z
    .record(z.string().min(1).max(40), z.union([z.string().max(120).transform(redactToken), z.number(), z.boolean()]))
    .refine((m) => Object.keys(m).length <= 8)
    .optional(),
  // document.referrer (solo page_view). El servidor se queda únicamente con el host.
  ref: z.string().max(300).optional(),
});
