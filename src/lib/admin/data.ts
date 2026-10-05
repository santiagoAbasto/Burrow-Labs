import "server-only";
import { and, asc, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { storage } from "@/lib/storage";
import { column, RELATIONS, type AdminResource, type RelationKey } from "./resources";

export type Row = Record<string, unknown>;

export const PAGE_SIZE = 40;

export type ListQuery = { q?: string; status?: string; page?: number };

/** Listado con búsqueda por los campos de texto de las columnas, filtro por estado y paginación. */
export async function listRows(resource: AdminResource, query: ListQuery = {}): Promise<{ rows: Row[]; total: number; page: number; pages: number }> {
  const has = (name: string) => name in resource.table;
  const order = has("sort") ? asc(column(resource.table, "sort")) : has("createdAt") ? desc(column(resource.table, "createdAt")) : asc(column(resource.table, resource.pk ?? "id"));
  const clauses: SQL[] = [];
  const q = query.q?.trim();
  if (q) {
    const pattern = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
    const searchable = [resource.titleField, ...resource.columns.map((col) => col.name), "slug"].filter((name, i, all) => all.indexOf(name) === i && has(name) && column(resource.table, name).columnType === "PgText");
    clauses.push(or(...searchable.map((name) => ilike(column(resource.table, name), pattern)))!);
  }
  if (query.status && has("status")) clauses.push(eq(column(resource.table, "status"), query.status));
  const where = clauses.length ? and(...clauses) : undefined;
  const [{ total }] = await db.select({ total: count() }).from(resource.table).where(where);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, query.page ?? 1), pages);
  const rows = await db
    .select()
    .from(resource.table)
    .where(where)
    .orderBy(order)
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);
  return { rows, total, page, pages };
}

/** Cuántos registros hay por estado (para los filtros del listado). */
export async function countByStatus(resource: AdminResource): Promise<Record<string, number>> {
  if (!("status" in resource.table)) return {};
  const rows = await db.select({ status: column(resource.table, "status"), n: count() }).from(resource.table).groupBy(column(resource.table, "status"));
  return Object.fromEntries(rows.map((row) => [String(row.status), row.n]));
}

export async function getRow(resource: AdminResource, id: string): Promise<Row | null> {
  // Una clave uuid con otro formato (p. ej. un slug pegado en la URL) es un 404, no un error de Postgres.
  if (!resource.pk && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
  const [row] = await db
    .select()
    .from(resource.table)
    .where(eq(column(resource.table, resource.pk ?? "id"), id))
    .limit(1);
  return row ?? null;
}

export async function relationOptions(to: RelationKey): Promise<{ value: string; label: string }[]> {
  const { table, label } = RELATIONS[to];
  const rows = await db
    .select({ value: column(table, "id"), label: column(table, label) })
    .from(table)
    .orderBy(asc(column(table, label)))
    .limit(500);
  return rows.map((row) => ({ value: String(row.value), label: String(row.label) }));
}

/** Valores de los campos que viven en otra tabla: relaciones múltiples y listas hijas. */
export async function loadVirtual(resource: AdminResource, id: string): Promise<Record<string, string[]>> {
  const out: Record<string, string[]> = {};
  for (const field of resource.fields) {
    if (!field.through || (field.type !== "multi" && field.type !== "children")) continue;
    const { table, own, other } = field.through;
    const rows = await db
      .select({ value: column(table, other) })
      .from(table)
      .where(eq(column(table, own), id))
      .orderBy(..."sort" in table ? [asc(column(table, "sort"))] : []);
    out[field.name] = rows.map((row) => String(row.value));
  }
  return out;
}

/** Imágenes de la biblioteca con su miniatura, para los selectores. */
export async function mediaOptions(): Promise<{ value: string; label: string; image: string; width: number | null; height: number | null }[]> {
  const rows = await db.select({ id: media.id, key: media.key, filename: media.filename, width: media.width, height: media.height }).from(media).orderBy(desc(media.createdAt)).limit(500);
  return rows.map((row) => ({ value: row.id, label: row.filename, image: storage.publicUrl(row.key), width: row.width, height: row.height }));
}
