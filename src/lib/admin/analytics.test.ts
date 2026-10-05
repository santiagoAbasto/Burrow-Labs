import { randomUUID } from "node:crypto";
import { like } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { client, db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import { botShare, browsers, devices, eventCounts, hourlyProfile, languages, topCountries, topMeta, topPaths, topReferrers, trafficSeries, trafficSummary } from "./analytics";

// La tabla es compartida con otros tests: todo lo que se afirma con exactitud va atado a un path,
// un referrer o un valor de meta únicos; el resto se afirma con `>=`.
const id = randomUUID();
const path = `/test-${id}`;
const ref = `${id}.example`;
const refBot = `${id}.bot`;

beforeAll(async () => {
  const base = { name: "page_view", path, visitor: `v-${id}`.slice(0, 16), country: "BO", device: "mobile", browser: "chrome", lang: "es", referrer: ref } as const;
  await db.insert(analyticsEvents).values([
    base,
    { ...base, visitor: `w-${id}`.slice(0, 16), referrer: null, country: null, device: null, browser: null, lang: null },
    { ...base, bot: true, referrer: refBot },
    { name: "plan_cta", path, meta: { plan: id } },
    { name: "plan_cta", path, meta: { plan: id }, bot: true },
  ]);
});

afterAll(async () => {
  await db.delete(analyticsEvents).where(like(analyticsEvents.path, `${path}%`));
  await client.end();
});

const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/La_Paz" });

describe("trafficSummary y botShare", () => {
  it("cuentan visitas, visitantes y bots como números", async () => {
    const summary = await trafficSummary(7);
    expect(summary.views).toBeGreaterThanOrEqual(2);
    expect(summary.visitors).toBeGreaterThanOrEqual(2);
    expect(summary.bots).toBeGreaterThanOrEqual(1);
    expect(typeof summary.prevViews).toBe("number");
    expect(typeof summary.prevVisitors).toBe("number");
    const share = await botShare(7);
    expect(share.humans).toBeGreaterThanOrEqual(2);
    expect(share.bots).toBeGreaterThanOrEqual(1);
  });
});

describe("trafficSeries", () => {
  it("devuelve exactamente N días en orden, termina hoy y rellena con ceros", async () => {
    const series = await trafficSeries(400);
    expect(series).toHaveLength(400);
    expect(series.at(-1)?.day).toBe(today);
    expect(series.map((s) => s.day)).toEqual([...series.map((s) => s.day)].sort());
    expect(series[0]).toEqual({ day: series[0].day, views: 0, visitors: 0 }); // hace 400 días no hay datos
    expect(series.at(-1)?.views).toBeGreaterThanOrEqual(2);
    expect(series.at(-1)?.visitors).toBeGreaterThanOrEqual(2);
  });
});

describe("agrupaciones", () => {
  it("topPaths cuenta solo humanos", async () => {
    expect(await topPaths(7, 1000)).toContainEqual({ label: path, value: 2 });
  });

  it("topReferrers etiqueta el tráfico directo y excluye bots", async () => {
    const rows = await topReferrers(7, 1000);
    expect(rows).toContainEqual({ label: ref, value: 1 });
    expect(rows.find((r) => r.label === "Directo / escrito a mano")?.value).toBeGreaterThanOrEqual(1);
    expect(rows.some((r) => r.label === refBot)).toBe(false);
  });

  it("topCountries traduce con Intl y marca lo desconocido", async () => {
    const rows = await topCountries(7, 1000);
    expect(rows.find((r) => r.code === "BO")).toMatchObject({ label: "Bolivia" });
    expect(rows.find((r) => r.code === null)).toMatchObject({ label: "Sin dato" });
  });

  it("devices, browsers y languages usan etiquetas en español", async () => {
    expect((await devices(7)).map((r) => r.label)).toEqual(expect.arrayContaining(["Móvil", "Sin dato"]));
    expect((await browsers(7)).map((r) => r.label)).toEqual(expect.arrayContaining(["Chrome", "Sin dato"]));
    expect((await languages(7)).map((r) => r.label)).toEqual(expect.arrayContaining(["Español", "Sin dato"]));
  });

  it("topMeta agrupa por clave de meta y excluye bots", async () => {
    expect(await topMeta(7, "plan_cta", "plan", 1000)).toContainEqual({ label: id, value: 1 });
  });

  it("eventCounts trae todos los nombres y hourlyProfile 24 horas", async () => {
    const counts = await eventCounts(7);
    expect(Object.keys(counts)).toHaveLength(12);
    expect(counts.plan_cta).toBeGreaterThanOrEqual(1);
    const profile = await hourlyProfile(7);
    expect(profile).toHaveLength(24);
    expect(profile.reduce((a, b) => a + b, 0)).toBeGreaterThanOrEqual(2);
  });
});
