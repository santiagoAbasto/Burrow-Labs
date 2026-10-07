"use server";

import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { projectSheets } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { blankFicha, estadoToDb, fichaCode, fichaDataSchema } from "@/lib/ficha";
import { logActivity } from "./activity";

const isUuid = (value: unknown): value is string => z.uuid().safeParse(value).success;

export type SaveFichaState = { ok: boolean; error?: string; savedAt?: number };

/** Crea una ficha en blanco con su token público y abre el editor. */
export async function createFicha(): Promise<void> {
  const user = await requireUser();
  const token = randomBytes(18).toString("base64url");
  const [row] = await db
    .insert(projectSheets)
    .values({ token, data: blankFicha(), createdBy: user.name || user.email })
    .returning({ id: projectSheets.id });
  await logActivity(user, "create", "fichas", row.id);
  revalidatePath("/admin/fichas");
  redirect(`/admin/fichas/${row.id}`);
}

/** Guarda el contenido de una ficha (autoguardado del editor). Deriva las columnas de lista. */
export async function saveFicha(id: string, raw: unknown): Promise<SaveFichaState> {
  await requireUser();
  if (!isUuid(id)) return { ok: false, error: "Ficha no válida." };
  const parsed = fichaDataSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "No pudimos guardar: hay datos fuera de rango." };
  const data = parsed.data;
  if (!data.code && data.empresa) data.code = fichaCode(data.empresa, new Date().getFullYear());
  const updated = await db
    .update(projectSheets)
    .set({ data, code: data.code, empresa: data.empresa, status: estadoToDb(data.estado), priority: data.prioridad })
    .where(eq(projectSheets.id, id))
    .returning({ id: projectSheets.id });
  if (!updated.length) return { ok: false, error: "La ficha ya no existe." };
  revalidatePath("/admin/fichas");
  revalidatePath(`/admin/fichas/${id}`);
  return { ok: true, savedAt: Date.now() };
}

/** Elimina una ficha y vuelve a la lista. */
export async function deleteFicha(id: string): Promise<void> {
  const user = await requireUser();
  if (isUuid(id)) {
    await db.delete(projectSheets).where(eq(projectSheets.id, id));
    await logActivity(user, "delete", "fichas", id);
  }
  revalidatePath("/admin/fichas");
  redirect("/admin/fichas");
}

/** Reemite el token del enlace público (invalida el anterior). */
export async function regenerateFichaToken(id: string): Promise<SaveFichaState> {
  const user = await requireUser();
  if (!isUuid(id)) return { ok: false, error: "Ficha no válida." };
  const token = randomBytes(18).toString("base64url");
  const updated = await db.update(projectSheets).set({ token }).where(eq(projectSheets.id, id)).returning({ id: projectSheets.id });
  if (!updated.length) return { ok: false, error: "La ficha ya no existe." };
  await logActivity(user, "update", "fichas", id, "nuevo enlace público");
  revalidatePath(`/admin/fichas/${id}`);
  return { ok: true };
}
