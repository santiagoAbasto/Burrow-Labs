// Esquemas Zod compartidos por cliente y servidor. El servidor SIEMPRE vuelve a validar.
import { z } from "zod";
import { DIAGNOSTIC_NEEDS, DIAGNOSTIC_RESULTS, PROJECT_TYPES } from "./form-options";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const slugSchema = z.string().max(80).regex(SLUG_RE, "Solo minúsculas, números y guiones.");

/** Dirección https:// completa, sin espacios ni caracteres que rompan un atributo HTML. */
export const isHttpsUrl = (url: string) => url.length <= 300 && /^https:\/\/[^\s"'<>\\]+$/i.test(url) && URL.canParse(url);

/** «Automatización & IA» → `automatizacion-ia`. */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

// Las opciones viven en form-options.ts (sin Zod) para que los formularios del cliente no carguen el validador.
export { DIAGNOSTIC_NEEDS, DIAGNOSTIC_RESULTS, PROJECT_TYPES, type DiagnosticResult, type ProjectType } from "./form-options";

// Un campo opcional de formulario llega como "" cuando se deja vacío.
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres.`)
    .optional()
    .transform((v) => v || undefined);

const person = {
  name: z.string().trim().min(2, "Decinos tu nombre.").max(100, "Máximo 100 caracteres."),
  company: optionalText(120),
  email: z.string().trim().toLowerCase().pipe(z.email("Revisá el email.").max(254)),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{7,20}$/, "Revisá el número de WhatsApp.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  consent: z.literal(true, "Necesitamos tu consentimiento para guardar tus datos."),
  // Honeypot: campo oculto que una persona nunca completa. Debe llegar vacío (o no llegar).
  fax: z.string().max(0, "Envío rechazado.").optional(),
};

/** Formulario de /contacto (brief §20). `goal` es «¿Qué querés construir?»; `message`, la descripción. */
export const contactLeadSchema = z.object({
  ...person,
  goal: z.string().trim().min(3, "Contanos qué querés construir.").max(200, "Máximo 200 caracteres."),
  projectType: z.enum(PROJECT_TYPES, "Elegí un tipo de proyecto."),
  budget: optionalText(60),
  timeline: optionalText(60),
  message: z.string().trim().min(10, "Contanos un poco más (mínimo 10 caracteres).").max(4000, "Máximo 4000 caracteres."),
});
export type ContactLead = z.infer<typeof contactLeadSchema>;


/** Diagnóstico express (brief §18): respuestas del wizard + datos de contacto. Solo se guarda con consentimiento. */
export const diagnosticLeadSchema = z.object({
  ...person,
  answers: z.object({
    manualWork: z.string().trim().min(3, "Contanos qué hacés a mano.").max(1000, "Máximo 1000 caracteres."),
    people: z.string().trim().min(1, "Elegí una opción.").max(40),
    tools: z.string().trim().max(500, "Máximo 500 caracteres."),
    needs: z.array(z.enum(DIAGNOSTIC_NEEDS)).min(1, "Elegí al menos una opción.").max(DIAGNOSTIC_NEEDS.length),
    hasSystem: z.boolean(),
  }),
  recommendation: z.enum(DIAGNOSTIC_RESULTS),
});
export type DiagnosticLead = z.infer<typeof diagnosticLeadSchema>;
