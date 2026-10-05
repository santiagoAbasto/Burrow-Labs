// Formularios generados a partir de la FORMA de un objeto JSON (secciones del Home y settings).
// La forma la dan los defaults: string, boolean, string[], objeto[], u objeto anidado.

export type JsonShape = string | boolean | readonly string[] | readonly Record<string, string>[] | { readonly [key: string]: JsonShape };

const LABELS: Record<string, string> = {
  eyebrow: "Rótulo superior",
  title: "Título",
  body: "Texto",
  cta: "Texto del botón",
  ctaPrimary: "Botón principal",
  ctaSecondary: "Botón secundario",
  secondary: "Enlace secundario",
  badge: "Sello",
  bridge: "Frase puente",
  phrase: "Frase de marca",
  surfaceItems: "Piezas de la superficie",
  depthItems: "Piezas del laboratorio",
  closingTitle: "Cierre: título",
  closingTagline: "Cierre: slogan",
  steps: "Pasos",
  pillars: "Pilares",
  before: "Antes",
  after: "Después",
  email: "Email de contacto",
  whatsappPhone: "Teléfono de WhatsApp (con código de país, ej. +591…)",
  whatsappEnabled: "Mostrar el botón flotante de WhatsApp",
  whatsappTooltip: "Tooltip del botón",
  whatsappGreeting: "Saludo al abrir",
  whatsappDefaultMessage: "Mensaje precargado por defecto",
  siteName: "Nombre del sitio",
  titleTemplate: "Plantilla de título (%s = título de la página)",
  description: "Descripción por defecto",
  ogImage: "Imagen para compartir (ruta o URL)",
  locale: "Locale",
  city: "Ciudad (SEO local)",
  region: "Región (SEO local)",
  country: "País (código ISO)",
  headline: "Titular",
  vision: "Visión",
  values: "Valores",
  privacy: "Política de privacidad",
  terms: "Términos y condiciones",
  cookies: "Política de cookies",
};
const MARKDOWN = new Set(["vision", "privacy", "terms", "cookies"]);

export function labelFor(key: string): string {
  return LABELS[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

export type JsonField =
  | { kind: "boolean"; name: string; label: string; value: boolean }
  | { kind: "text" | "long" | "markdown"; name: string; label: string; value: string }
  | { kind: "list"; name: string; label: string; value: string }
  | { kind: "rows"; name: string; label: string; value: string; columns: string[] }
  | { kind: "group"; name: string; label: string; fields: JsonField[] };

/** Describe los campos a pintar para `value`, que tiene la misma forma que `shape`. */
export function describeJson(shape: JsonShape, value: unknown, name: string, key = name): JsonField {
  const label = labelFor(key);
  if (typeof shape === "boolean") return { kind: "boolean", name, label, value: value === true };
  if (typeof shape === "string") {
    const text = typeof value === "string" ? value : shape;
    const kind = MARKDOWN.has(key) || (key === "body" && text.includes("\n")) ? "markdown" : text.length > 90 || text.includes("\n") ? "long" : "text";
    return { kind, name, label, value: text };
  }
  if (Array.isArray(shape)) {
    const items = Array.isArray(value) ? value : shape;
    const sample = shape[0];
    if (typeof sample === "object" && sample !== null) {
      const columns = Object.keys(sample);
      return { kind: "rows", name, label, columns, value: items.map((item) => columns.map((c) => String((item as Record<string, unknown>)?.[c] ?? "")).join(" | ")).join("\n") };
    }
    return { kind: "list", name, label, value: items.join("\n") };
  }
  const source = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  return { kind: "group", name, label, fields: Object.entries(shape as Record<string, JsonShape>).map(([k, v]) => describeJson(v, source[k], `${name}.${k}`, k)) };
}

const lines = (raw: FormDataEntryValue | null) =>
  String(raw ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

/** Reconstruye el objeto desde el formulario, respetando la forma. Lo que no encaja en la forma se ignora. */
export function parseJsonForm(shape: JsonShape, form: FormData, name: string): unknown {
  if (typeof shape === "boolean") return form.get(name) === "on";
  if (typeof shape === "string") return String(form.get(name) ?? "").replace(/\r\n/g, "\n").trim().slice(0, 20000);
  if (Array.isArray(shape)) {
    const sample = shape[0];
    if (typeof sample === "object" && sample !== null) {
      const columns = Object.keys(sample);
      return lines(form.get(name)).map((line) => {
        const cells = line.split("|").map((cell) => cell.trim());
        return Object.fromEntries(columns.map((c, i) => [c, i === columns.length - 1 ? cells.slice(i).join(" | ") : (cells[i] ?? "")]));
      });
    }
    return lines(form.get(name));
  }
  return Object.fromEntries(Object.entries(shape as Record<string, JsonShape>).map(([k, v]) => [k, parseJsonForm(v, form, `${name}.${k}`)]));
}
