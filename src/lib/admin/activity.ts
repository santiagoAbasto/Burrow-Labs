import "server-only";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { activityLog } from "@/db/schema";
import type { SessionUser } from "@/lib/auth";

export type ActivityAction = "create" | "update" | "delete" | "login" | "upload" | "settings" | "send" | "export";

/**
 * Anota en la bitácora. Nunca corta la acción principal: si falla, se registra en consola y se sigue.
 * `title` describe contenido del sitio o la acción, nunca datos de visitantes: para leads y
 * suscriptores va solo el id (en `entityId`) y qué se hizo, sin nombre ni email.
 */
export async function logActivity(user: SessionUser, action: ActivityAction, entity: string, entityId: string | null, title = ""): Promise<void> {
  try {
    await db.insert(activityLog).values({ userId: user.id, userName: user.name || user.email, action, entity, entityId, title: title.slice(0, 200) });
  } catch {
    console.error("[admin] no se pudo anotar la actividad");
  }
}

export async function recentActivity(limit = 12) {
  return db.select().from(activityLog).orderBy(desc(activityLog.createdAt)).limit(limit);
}

export const ACTION_LABEL: Record<ActivityAction, string> = {
  create: "creó",
  update: "editó",
  delete: "eliminó",
  login: "ingresó",
  upload: "subió",
  settings: "configuró",
  send: "envió",
  export: "exportó",
};
