"use server";

import { cookies } from "next/headers";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { revalidateContent, TAGS } from "@/lib/content";
import { SEASON_HINT_COOKIE, SEASON_PREVIEW_COOKIE, seasonFormSchema, type SeasonSettings } from "@/lib/season";
import type { FormState } from "./actions";
import { logActivity } from "./activity";

const FLAGS = ["site", "admin", "characters", "lights", "animations", "snow", "music"] as const;
const TEXTS = ["mode", "start", "end", "siteIntensity", "adminIntensity", "greeting", "link"] as const;
/** La vista previa dura lo que una sesión de trabajo: después se apaga sola. */
const PREVIEW_SECONDS = 2 * 60 * 60;

/** El formulario → ajustes validados, o los errores por campo. Las casillas sin marcar no viajan: valen false. */
function readForm(form: FormData): { data: SeasonSettings } | { errors: Record<string, string> } {
  const raw = {
    ...Object.fromEntries(TEXTS.map((name) => [name, String(form.get(name) ?? "")])),
    ...Object.fromEntries(FLAGS.map((name) => [name, form.get(name) === "on"])),
  };
  const parsed = seasonFormSchema.safeParse(raw);
  if (parsed.success) return { data: parsed.data };
  return { errors: Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message])) };
}

const cookieBase = { sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/" };

async function clearPreview() {
  const store = await cookies();
  store.delete(SEASON_PREVIEW_COOKIE);
  store.delete(SEASON_HINT_COOKIE);
}

/** Guarda la campaña: desde ese momento vale para todos los visitantes. Cierra la vista previa, si había. */
export async function saveSeason(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const result = readForm(form);
  if ("errors" in result) return { error: "Revisá los campos marcados.", errors: result.errors };
  await db.insert(siteSettings).values({ key: "season", value: result.data }).onConflictDoUpdate({ target: siteSettings.key, set: { value: result.data } });
  revalidateContent(TAGS.settings);
  await clearPreview();
  await logActivity(user, "settings", "configuración", "season", `Campaña de Navidad: ${result.data.mode}`);
  return { ok: true };
}

/**
 * Vista previa: los ajustes del formulario se guardan en una cookie de quien administra, no en la base. Solo se
 * respetan si la petición trae una sesión del panel válida (src/lib/season-server.ts): nadie más la ve.
 */
export async function previewSeason(_prev: FormState, form: FormData): Promise<FormState> {
  await requireUser();
  const result = readForm(form);
  if ("errors" in result) return { error: "Revisá los campos marcados.", errors: result.errors };
  const store = await cookies();
  store.set(SEASON_PREVIEW_COOKIE, JSON.stringify(result.data), { ...cookieBase, httpOnly: true, maxAge: PREVIEW_SECONDS });
  // El aviso no lleva datos: solo le dice al script del sitio que pregunte a /api/season.
  store.set(SEASON_HINT_COOKIE, "1", { ...cookieBase, httpOnly: false, maxAge: PREVIEW_SECONDS });
  return { ok: true };
}

export async function stopSeasonPreview(): Promise<void> {
  await requireUser();
  await clearPreview();
}
