import "server-only";
import { and, count, desc, eq, gte, ilike, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { campaigns, subscribers } from "@/db/schema";
import { PAGE_SIZE } from "./data";

export type Subscriber = typeof subscribers.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type SubscriberStatus = Subscriber["status"];

export const SUBSCRIBER_STATUS: Record<SubscriberStatus, string> = { active: "Activo", unsubscribed: "Baja" };
export const CAMPAIGN_STATUS: Record<Campaign["status"], string> = { draft: "Borrador", sending: "Enviando", sent: "Enviada" };

export async function listSubscribers(query: { q?: string; status?: SubscriberStatus; page?: number } = {}): Promise<{ rows: Subscriber[]; total: number; page: number; pages: number }> {
  const clauses: SQL[] = [];
  const q = query.q?.trim();
  if (q) clauses.push(ilike(subscribers.email, `%${q.replace(/[%_\\]/g, "\\$&")}%`));
  if (query.status) clauses.push(eq(subscribers.status, query.status));
  const where = clauses.length ? and(...clauses) : undefined;
  const [{ total }] = await db.select({ total: count() }).from(subscribers).where(where);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, query.page ?? 1), pages);
  const rows = await db
    .select()
    .from(subscribers)
    .where(where)
    .orderBy(desc(subscribers.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);
  return { rows, total, page, pages };
}

export async function countSubscribersByStatus(): Promise<Record<string, number>> {
  const rows = await db.select({ status: subscribers.status, n: count() }).from(subscribers).groupBy(subscribers.status);
  return Object.fromEntries(rows.map((row) => [row.status, row.n]));
}

/** Activos, bajas y altas de los últimos 30 días (para el dashboard y la cabecera del listado). */
export async function subscriberStats(): Promise<{ active: number; unsubscribed: number; last30: number }> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [byStatus, [{ last30 }]] = await Promise.all([countSubscribersByStatus(), db.select({ last30: count() }).from(subscribers).where(gte(subscribers.createdAt, since))]);
  return { active: byStatus.active ?? 0, unsubscribed: byStatus.unsubscribed ?? 0, last30 };
}

export async function listCampaigns(): Promise<Campaign[]> {
  return db.select().from(campaigns).orderBy(desc(campaigns.createdAt)).limit(500);
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const [row] = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
  return row ?? null;
}

/** A quién se le envía una campaña: cada activo con su token de baja. */
export async function activeRecipients(): Promise<{ email: string; token: string }[]> {
  return db.select({ email: subscribers.email, token: subscribers.token }).from(subscribers).where(eq(subscribers.status, "active")).orderBy(subscribers.createdAt);
}
