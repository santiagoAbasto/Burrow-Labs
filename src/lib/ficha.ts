// Ficha de proyecto: forma de los datos, constantes y validación. Sin dependencias de React ni del
// servidor para poder importarse desde el editor (cliente) y la vista pública (servidor) por igual.
import { z } from "zod";

export type ContactEntry = { label: string; v: string };
export type FichaItem = { t: string; nota?: string; st?: string; tag?: string; who?: string; when?: string; v?: string };

export type FichaData = {
  code: string;
  date: string;
  empresa: string;
  cliente: string;
  rubro: string;
  web: string;
  responsable: string;
  equipo: string;
  contacto: string;
  telefonos: ContactEntry[];
  emails: ContactEntry[];
  inicio: string;
  entrega: string;
  prioridad: string;
  estado: string;
  tipos: string[];
  objetivo: string;
  publico: string;
  referencias: string;
  esSistemaWeb: string;
  responsive: string;
  hosting: string;
  hostingCual: string;
  dominio: string;
  dominioCual: string;
  cms: string;
  idiomas: string;
  seo: string;
  correo: string;
  stack: string;
  integracionesTec: string;
  marcaLogo: string;
  estilo: string;
  contTextos: string;
  contFotos: string;
  secciones: FichaItem[];
  requerimientos: FichaItem[];
  peticiones: FichaItem[];
  integraciones: FichaItem[];
  observaciones: FichaItem[];
  descuentos: FichaItem[];
  presupuesto: string;
  pago: string;
  validez: string;
  mantenimiento: string;
  mantenimientoDet: string;
  proxima: string;
  fechaProxima: string;
  notas: string;
};

export const PRIOS = ["Alta", "Media", "Baja"] as const;
export const ESTADOS = ["Nuevo", "En curso", "En pausa", "Entregado"] as const;
export const TAGS = ["Requisito", "Petición (P)", "Observación", "Importante", "A confirmar", "Extra"] as const;
// [etiqueta, nombre de ícono]
export const TIPOS: ReadonlyArray<readonly [string, string]> = [
  ["Sitio web", "globe"],
  ["Landing", "monitor"],
  ["Tienda online", "tag"],
  ["Sistema web a medida", "cpu"],
  ["App móvil", "phone"],
  ["Rediseño", "palette"],
  ["Automatización", "wrench"],
  ["Integración / API", "plug"],
  ["Branding", "palette"],
];

export type SheetStatus = "new" | "in_progress" | "paused" | "delivered";
const ESTADO_TO_DB: Record<string, SheetStatus> = { Nuevo: "new", "En curso": "in_progress", "En pausa": "paused", Entregado: "delivered" };
export const DB_TO_ESTADO: Record<SheetStatus, string> = { new: "Nuevo", in_progress: "En curso", paused: "En pausa", delivered: "Entregado" };
export const STATUS_LABEL = DB_TO_ESTADO;

export function estadoToDb(estado: string): SheetStatus {
  return ESTADO_TO_DB[estado] ?? "new";
}

export function blankFicha(): FichaData {
  return {
    code: "",
    date: "",
    empresa: "",
    cliente: "si",
    rubro: "",
    web: "",
    responsable: "",
    equipo: "",
    contacto: "",
    telefonos: [{ label: "", v: "" }],
    emails: [{ label: "", v: "" }],
    inicio: "",
    entrega: "",
    prioridad: "Media",
    estado: "Nuevo",
    tipos: [],
    objetivo: "",
    publico: "",
    referencias: "",
    esSistemaWeb: "",
    responsive: "Sí",
    hosting: "",
    hostingCual: "",
    dominio: "",
    dominioCual: "",
    cms: "",
    idiomas: "",
    seo: "",
    correo: "",
    stack: "",
    integracionesTec: "",
    marcaLogo: "",
    estilo: "",
    contTextos: "",
    contFotos: "",
    secciones: [],
    requerimientos: [],
    peticiones: [],
    integraciones: [],
    observaciones: [],
    descuentos: [],
    presupuesto: "",
    pago: "",
    validez: "",
    mantenimiento: "",
    mantenimientoDet: "",
    proxima: "",
    fechaProxima: "",
    notas: "",
  };
}

/** Código legible a partir de la empresa (BL-AAAA-XXXX). Estable una vez asignado. */
export function fichaCode(empresa: string, year: number): string {
  const slug =
    (empresa || "BL")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 4) || "BL";
  return `BL-${year}-${slug}`;
}

/** Rellena cualquier dato parcial a una ficha completa (migración suave entre versiones). */
export function normalizeFicha(input: unknown): FichaData {
  const base = blankFicha();
  if (!input || typeof input !== "object") return base;
  return { ...base, ...(input as Partial<FichaData>) };
}

// Validación de escritura (solo el admin escribe, pero igual se acotan tamaños para no guardar basura).
const s = (max = 2000) => z.string().max(max).default("");
const entry = z.object({ label: s(120), v: s(400) });
const item = z
  .object({ t: s(1200), nota: s(600).optional(), st: s(60).optional(), tag: s(60).optional(), who: s(120).optional(), when: s(60).optional(), v: s(120).optional() })
  .strip();
const list = z.array(item).max(60).default([]);

export const fichaDataSchema: z.ZodType<FichaData> = z
  .object({
    code: s(40),
    date: s(40),
    empresa: s(160),
    cliente: s(10),
    rubro: s(240),
    web: s(400),
    responsable: s(160),
    equipo: s(240),
    contacto: s(400),
    telefonos: z.array(entry).max(20).default([]),
    emails: z.array(entry).max(20).default([]),
    inicio: s(40),
    entrega: s(40),
    prioridad: s(20),
    estado: s(20),
    tipos: z.array(s(60)).max(12).default([]),
    objetivo: s(2000),
    publico: s(600),
    referencias: s(600),
    esSistemaWeb: s(10),
    responsive: s(10),
    hosting: s(40),
    hostingCual: s(240),
    dominio: s(40),
    dominioCual: s(240),
    cms: s(10),
    idiomas: s(160),
    seo: s(10),
    correo: s(10),
    stack: s(400),
    integracionesTec: s(1200),
    marcaLogo: s(20),
    estilo: s(240),
    contTextos: s(20),
    contFotos: s(20),
    secciones: list,
    requerimientos: list,
    peticiones: list,
    integraciones: list,
    observaciones: list,
    descuentos: list,
    presupuesto: s(80),
    pago: s(120),
    validez: s(80),
    mantenimiento: s(10),
    mantenimientoDet: s(240),
    proxima: s(400),
    fechaProxima: s(40),
    notas: s(2000),
  })
  .strip() as z.ZodType<FichaData>;

/** Completitud 0–100 para la barra de progreso (mismos campos clave en editor y lista). */
export function fichaProgress(f: FichaData): number {
  const checks: Array<unknown> = [f.empresa, f.rubro, f.contacto, f.tipos.length, f.objetivo, f.esSistemaWeb, f.responsive, f.hosting, f.dominio, f.secciones.length, f.requerimientos.length, f.presupuesto, f.pago];
  const done = checks.filter((x) => (typeof x === "number" ? x > 0 : Boolean(x))).length;
  return Math.round((done / checks.length) * 100);
}
