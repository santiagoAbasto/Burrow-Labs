import "server-only";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { leads } from "@/db/schema";

/** Contadores que muestra el menú del panel. */
export async function shellCounts(): Promise<Record<string, number>> {
  const [{ n }] = await db.select({ n: count() }).from(leads).where(eq(leads.status, "new"));
  return { "/admin/leads": n };
}
