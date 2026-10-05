import "server-only";
import { and, count, desc, eq, gte, isNotNull, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import { ANALYTICS_EVENTS, type AnalyticsEvent } from "@/lib/analytics-events";

/**
 * Consultas del dashboard sobre `analytics_events`. Todas acotadas a los últimos N días y, salvo
 * `botShare` y el conteo de bots de `trafficSummary`, solo tráfico humano. Una consulta por función.
 */

// Literal (no parámetro): así la misma expresión sirve en SELECT y en GROUP BY sin desdoblarse en $1/$2.
const TZ = sql.raw("'America/La_Paz'");
export type Slice = { label: string; value: number };

const since = (days: number) => sql`now() - make_interval(days => ${days})`;
const human = (days: number) => and(eq(analyticsEvents.bot, false), gte(analyticsEvents.createdAt, since(days)));
const humanViews = (days: number) => and(eq(analyticsEvents.name, "page_view"), human(days));
const n = (expr: SQL) => sql<number>`${expr}`.mapWith(Number);

const regionNames = new Intl.DisplayNames(["es"], { type: "region", fallback: "none" });
const languageNames = new Intl.DisplayNames(["es"], { type: "language", fallback: "none" });
const displayName = (names: Intl.DisplayNames, code: string | null): string | null => {
  if (!code) return null;
  try {
    const label = names.of(code);
    return label ? label[0].toUpperCase() + label.slice(1) : null;
  } catch {
    return null; // código con formato inválido en la base
  }
};

export async function trafficSummary(days: number): Promise<{ views: number; visitors: number; prevViews: number; prevVisitors: number; bots: number }> {
  const current = sql`${analyticsEvents.createdAt} >= ${since(days)}`;
  const previous = sql`${analyticsEvents.createdAt} < ${since(days)}`;
  const [row] = await db
    .select({
      views: n(sql`count(*) filter (where not ${analyticsEvents.bot} and ${current})`),
      visitors: n(sql`count(distinct ${analyticsEvents.visitor}) filter (where not ${analyticsEvents.bot} and ${current})`),
      prevViews: n(sql`count(*) filter (where not ${analyticsEvents.bot} and ${previous})`),
      prevVisitors: n(sql`count(distinct ${analyticsEvents.visitor}) filter (where not ${analyticsEvents.bot} and ${previous})`),
      bots: n(sql`count(*) filter (where ${analyticsEvents.bot} and ${current})`),
    })
    .from(analyticsEvents)
    .where(and(eq(analyticsEvents.name, "page_view"), gte(analyticsEvents.createdAt, since(days * 2))));
  return row;
}

/** Un punto por día (fecha en La Paz), con ceros donde no hubo tráfico, terminando hoy. */
export async function trafficSeries(days: number): Promise<{ day: string; views: number; visitors: number }[]> {
  const today = sql`(now() at time zone ${TZ})::date`;
  const rows = await db.execute<{ day: string; views: string; visitors: string }>(sql`
    select to_char(d, 'YYYY-MM-DD') as day, count(e.id) as views, count(distinct e.visitor) as visitors
    from generate_series(${today} - (${days}::int - 1), ${today}, interval '1 day') as d
    left join analytics_events e
      on (e.created_at at time zone ${TZ})::date = d::date
      and e.name = 'page_view' and not e.bot and e.created_at >= ${since(days)}
    group by d order by d
  `);
  return rows.map((r) => ({ day: r.day, views: Number(r.views), visitors: Number(r.visitors) }));
}

export async function topPaths(days: number, limit = 10): Promise<Slice[]> {
  return db
    .select({ label: analyticsEvents.path, value: count() })
    .from(analyticsEvents)
    .where(humanViews(days))
    .groupBy(analyticsEvents.path)
    .orderBy(desc(count()))
    .limit(limit);
}

export async function topReferrers(days: number, limit = 10): Promise<Slice[]> {
  const rows = await db
    .select({ host: analyticsEvents.referrer, value: count() })
    .from(analyticsEvents)
    .where(humanViews(days))
    .groupBy(analyticsEvents.referrer)
    .orderBy(desc(count()))
    .limit(limit);
  return rows.map((r) => ({ label: r.host ?? "Directo / escrito a mano", value: r.value }));
}

export async function topCountries(days: number, limit = 10): Promise<{ code: string | null; label: string; value: number }[]> {
  const rows = await db
    .select({ code: analyticsEvents.country, value: count() })
    .from(analyticsEvents)
    .where(humanViews(days))
    .groupBy(analyticsEvents.country)
    .orderBy(desc(count()))
    .limit(limit);
  return rows.map((r) => ({ code: r.code, label: displayName(regionNames, r.code) ?? "Sin dato", value: r.value }));
}

const DEVICE_LABEL = { desktop: "Escritorio", mobile: "Móvil", tablet: "Tablet" } as const;
export async function devices(days: number): Promise<Slice[]> {
  const rows = await db
    .select({ device: analyticsEvents.device, value: count() })
    .from(analyticsEvents)
    .where(humanViews(days))
    .groupBy(analyticsEvents.device)
    .orderBy(desc(count()));
  return rows.map((r) => ({ label: r.device ? DEVICE_LABEL[r.device] : "Sin dato", value: r.value }));
}

const BROWSER_LABEL = { chrome: "Chrome", safari: "Safari", firefox: "Firefox", edge: "Edge", opera: "Opera", samsung: "Samsung", other: "Otro" } as const;
export async function browsers(days: number): Promise<Slice[]> {
  const rows = await db
    .select({ browser: analyticsEvents.browser, value: count() })
    .from(analyticsEvents)
    .where(humanViews(days))
    .groupBy(analyticsEvents.browser)
    .orderBy(desc(count()));
  return rows.map((r) => ({ label: r.browser ? BROWSER_LABEL[r.browser] : "Sin dato", value: r.value }));
}

export async function languages(days: number, limit = 10): Promise<Slice[]> {
  const rows = await db
    .select({ lang: analyticsEvents.lang, value: count() })
    .from(analyticsEvents)
    .where(humanViews(days))
    .groupBy(analyticsEvents.lang)
    .orderBy(desc(count()))
    .limit(limit);
  return rows.map((r) => ({ label: displayName(languageNames, r.lang) ?? "Sin dato", value: r.value }));
}

export async function botShare(days: number): Promise<{ humans: number; bots: number }> {
  const [row] = await db
    .select({
      humans: n(sql`count(*) filter (where not ${analyticsEvents.bot})`),
      bots: n(sql`count(*) filter (where ${analyticsEvents.bot})`),
    })
    .from(analyticsEvents)
    .where(and(eq(analyticsEvents.name, "page_view"), gte(analyticsEvents.createdAt, since(days))));
  return row;
}

/** Agrupa un evento por una clave de `meta` (plan_cta/plan, plan_view/plan, project_view/project…). */
export async function topMeta(days: number, event: AnalyticsEvent, key: string, limit = 10): Promise<Slice[]> {
  const value = sql<string>`${analyticsEvents.meta}->>${key}::text`;
  // `key` va parametrizada; GROUP BY por alias para no repetir el parámetro con otro número.
  return db
    .select({ label: value.as("label"), value: count() })
    .from(analyticsEvents)
    .where(and(eq(analyticsEvents.name, event), human(days), isNotNull(value)))
    .groupBy(sql`"label"`)
    .orderBy(desc(count()))
    .limit(limit);
}

export async function eventCounts(days: number): Promise<Record<AnalyticsEvent, number>> {
  const rows = await db.select({ name: analyticsEvents.name, value: count() }).from(analyticsEvents).where(human(days)).groupBy(analyticsEvents.name);
  const counts = Object.fromEntries(ANALYTICS_EVENTS.map((name) => [name, 0])) as Record<AnalyticsEvent, number>;
  for (const r of rows) if (r.name in counts) counts[r.name as AnalyticsEvent] = r.value;
  return counts;
}

/** 24 valores: visitas humanas por hora del día en La Paz. */
export async function hourlyProfile(days: number): Promise<number[]> {
  const hour = sql<number>`extract(hour from ${analyticsEvents.createdAt} at time zone ${TZ})::int`;
  const rows = await db.select({ hour, value: count() }).from(analyticsEvents).where(humanViews(days)).groupBy(hour);
  const profile = Array.from({ length: 24 }, () => 0);
  for (const r of rows) profile[r.hour] = r.value;
  return profile;
}
