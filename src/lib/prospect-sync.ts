// API de solo lectura para Burrow Prospect (la herramienta interna de prospección): las consultas del sitio y las fichas
// de proyecto llegan a su ficha del cliente, para que la IA y el equipo respondan con lo que el cliente ya nos contó.
// Solo viajan los campos que hacen falta: nunca presupuestos acordados, descuentos, pagos, hosting ni notas internas.
import { createHash, timingSafeEqual } from "node:crypto";
import { DB_TO_ESTADO, normalizeFicha, type FichaItem, type SheetStatus } from "./ficha";

/** `Authorization: Bearer <token>` comparado en tiempo constante. Sin token configurado, nadie entra. */
export function prospectTokenOk(header: string | null, token: string | undefined): boolean {
  if (!token || !header?.startsWith("Bearer ")) return false;
  const digest = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(digest(header.slice(7)), digest(token));
}

/** `since` en ISO 8601; cualquier otra cosa cuenta como «desde el principio». */
export function parseSince(value: string | null): Date {
  const d = value ? new Date(value) : null;
  return d && !Number.isNaN(d.getTime()) ? d : new Date(0);
}

export type LeadRow = {
  id: string;
  type: string;
  name: string;
  company: string | null;
  email: string;
  whatsapp: string | null;
  projectType: string | null;
  budget: string | null;
  timeline: string | null;
  message: string | null;
  payload: unknown;
  consentAt: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SheetRow = { id: string; code: string; empresa: string; status: SheetStatus; priority: string; data: unknown; updatedAt: Date };

export function leadForProspect(l: LeadRow, siteUrl: string) {
  return {
    id: l.id,
    kind: l.type === "diagnostic" ? "diagnostico" : "contacto",
    name: l.name,
    company: l.company,
    email: l.email,
    whatsapp: l.whatsapp,
    projectType: l.projectType,
    budget: l.budget,
    timeline: l.timeline,
    message: l.message,
    answers: l.payload && typeof l.payload === "object" ? l.payload : {},
    consentAt: l.consentAt.toISOString(),
    status: l.status,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
    adminUrl: `${siteUrl}/admin/leads/${l.id}`,
  };
}

// Una ficha vieja o a medio cargar puede traer null donde se espera una lista.
const arr = <T>(v: T[] | null | undefined): T[] => (Array.isArray(v) ? v : []);
const items = (list: FichaItem[] | null | undefined) =>
  arr(list)
    .filter((i) => i?.t?.trim())
    .map((i) => ({ t: i.t, st: i.st ?? null, tag: i.tag ?? null }));

export function sheetForProspect(s: SheetRow, siteUrl: string) {
  const f = normalizeFicha(s.data);
  return {
    id: s.id,
    code: s.code,
    empresa: s.empresa || f.empresa,
    estado: DB_TO_ESTADO[s.status],
    prioridad: s.priority,
    cliente: f.cliente,
    rubro: f.rubro,
    web: f.web,
    contacto: f.contacto,
    telefonos: arr(f.telefonos).map((t) => t?.v).filter(Boolean),
    emails: arr(f.emails).map((e) => e?.v).filter(Boolean),
    tipos: arr(f.tipos),
    objetivo: f.objetivo,
    publico: f.publico,
    requerimientos: items(f.requerimientos),
    peticiones: items(f.peticiones),
    integraciones: items(f.integraciones),
    inicio: f.inicio,
    entrega: f.entrega,
    proxima: f.proxima,
    fechaProxima: f.fechaProxima,
    updatedAt: s.updatedAt.toISOString(),
    adminUrl: `${siteUrl}/admin/fichas/${s.id}`,
  };
}
