import "server-only";
import { and, eq, lt } from "drizzle-orm";
import { db } from "@/db";
import { activityLog, analyticsEvents, leads, subscribers } from "@/db/schema";

/**
 * Plazos de conservación, en meses. Son los que publica /privacidad («Cuánto tiempo los conservamos»,
 * src/db/seed/legal.ts): si cambia uno, cambia el otro. Las copias de seguridad rotan aparte
 * (deploy/burrowlabs/backup.sh) y el límite de abusos se depura solo (src/lib/rate-limit.ts).
 */
export const RETENTION_MONTHS = {
  /** Consultas, desde su último movimiento (respuesta, cambio de estado o nota). */
  leads: 24,
  /** Consultas marcadas como spam. */
  spamLeads: 1,
  /** Emails dados de baja de la newsletter, desde la baja. */
  unsubscribed: 12,
  /** Estadísticas de uso (identificador seudónimo diario). */
  analytics: 14,
  /** Registro interno del panel. */
  activityLog: 12,
} as const;

/** La misma fecha `months` meses antes. Si ese mes es más corto, su último día: nunca se borra antes del plazo. */
export const monthsBefore = (now: Date, months: number): Date => {
  const date = new Date(now);
  date.setDate(1);
  date.setMonth(date.getMonth() - months);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(now.getDate(), lastDay));
  return date;
};

/** Borra lo que superó su plazo. Devuelve solo cantidades: lo borrado no queda registrado en ningún lado. */
export async function purgeExpired(now = new Date()) {
  const cut = (key: keyof typeof RETENTION_MONTHS) => monthsBefore(now, RETENTION_MONTHS[key]);
  const [oldLeads, spam, unsubscribed, analytics, activity] = await Promise.all([
    db.delete(leads).where(lt(leads.updatedAt, cut("leads"))),
    db.delete(leads).where(and(eq(leads.status, "spam"), lt(leads.updatedAt, cut("spamLeads")))),
    db.delete(subscribers).where(and(eq(subscribers.status, "unsubscribed"), lt(subscribers.updatedAt, cut("unsubscribed")))),
    db.delete(analyticsEvents).where(lt(analyticsEvents.createdAt, cut("analytics"))),
    db.delete(activityLog).where(lt(activityLog.createdAt, cut("activityLog"))),
  ]);
  return { leads: oldLeads.count + spam.count, subscribers: unsubscribed.count, analytics: analytics.count, activityLog: activity.count };
}

const DAY_MS = 86_400_000;

/** Depura al arrancar el servidor y después una vez por día. La llama src/instrumentation.ts, solo en producción. */
export function scheduleRetention(): void {
  const run = () =>
    purgeExpired().then(
      (counts) => console.info(`[retención] depuración por plazos: ${JSON.stringify(counts)}`),
      (error: unknown) => console.error(`[retención] la depuración falló: ${error instanceof Error ? error.name : "error"}`),
    );
  void run();
  setInterval(run, DAY_MS).unref();
}
