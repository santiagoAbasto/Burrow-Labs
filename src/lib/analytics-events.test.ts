import { randomUUID } from "node:crypto";
import { eq, like } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";
import { POST } from "@/app/api/events/route";
import { client, db } from "@/db";
import { analyticsEvents, rateLimits } from "@/db/schema";
import { analyticsEventSchema, isInternalPath } from "./analytics-events";

describe("analyticsEventSchema", () => {
  it("acepta solo eventos de la lista cerrada", () => {
    expect(analyticsEventSchema.safeParse({ name: "cta_hero", path: "/" }).success).toBe(true);
    expect(analyticsEventSchema.safeParse({ name: "evento_inventado", path: "/" }).success).toBe(false);
  });

  it("rechaza rutas con query o hash y meta desmedida", () => {
    expect(analyticsEventSchema.safeParse({ name: "cta_hero", path: "/contacto?email=a@b.c" }).success).toBe(false);
    // El token del enlace de baja identifica a un suscriptor: no llega a la base ni por la ruta ni por la meta.
    expect(analyticsEventSchema.parse({ name: "page_view", path: "/newsletter/baja/tok_SECRETO-123", meta: { path: "/newsletter/baja/tok_SECRETO-123", plan: "turbo" } })).toMatchObject({
      path: "/newsletter/baja",
      meta: { path: "/newsletter/baja", plan: "turbo" },
    });
    expect(analyticsEventSchema.safeParse({ name: "cta_hero", path: "https://otro.sitio/" }).success).toBe(false);
    expect(analyticsEventSchema.safeParse({ name: "cta_hero", path: "/", meta: { a: { anidado: true } } }).success).toBe(false);
    const many = Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`k${i}`, i]));
    expect(analyticsEventSchema.safeParse({ name: "cta_hero", path: "/", meta: many }).success).toBe(false);
  });

  it("solo acepta rutas internas: nada que un navegador resuelva como otro dominio", () => {
    for (const path of ["/", "/proyectos/apple-boss", "/lab/ia-en-procesos-reales", "/a//b", "/caf%C3%A9"]) expect(isInternalPath(path), path).toBe(true);
    // «//host» y «/\host» son URL de otro dominio; tab y salto de línea se eliminan al resolver la URL («/\t/host» → «//host»)
    for (const path of ["//example.invalid/admin", "/\\example.invalid/admin", "/\t/example.invalid", "/\n/example.invalid", "/a\\b", "/con espacio", "", "relativa", "javascript:alert(1)", `/${"x".repeat(300)}`])
      expect(isInternalPath(path), JSON.stringify(path)).toBe(false);
    expect(analyticsEventSchema.safeParse({ name: "page_view", path: "//example.invalid/admin" }).success).toBe(false);
    expect(analyticsEventSchema.safeParse({ name: "page_view", path: "/\\example.invalid/admin" }).success).toBe(false);
  });
});

describe("POST /api/events", () => {
  const path = `/test-${randomUUID()}`;
  const visits = `/test-${randomUUID()}`;
  const post = (body: string, headers: Record<string, string> = {}) =>
    POST(new Request("http://localhost/api/events", { method: "POST", body, headers: { host: "localhost", ...headers } }));

  afterAll(async () => {
    await db.delete(analyticsEvents).where(eq(analyticsEvents.path, path));
    await db.delete(analyticsEvents).where(eq(analyticsEvents.path, visits));
    await db.delete(rateLimits).where(like(rateLimits.key, "events:%"));
    await client.end();
  });

  it("guarda un evento válido y responde 204, sin datos del cliente", async () => {
    const res = await post(JSON.stringify({ name: "plan_cta", path, meta: { plan: "turbo" } }), { "x-forwarded-for": "203.0.113.9" });
    expect(res.status).toBe(204);
    const rows = await db.select().from(analyticsEvents).where(eq(analyticsEvents.path, path));
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ name: "plan_cta", meta: { plan: "turbo" } });
    expect(JSON.stringify(rows[0])).not.toContain("203.0.113.9");
  });

  it("rechaza cuerpo inválido, evento desconocido, exceso de tamaño y otro origen", async () => {
    expect((await post("no es json")).status).toBe(400);
    expect((await post(JSON.stringify({ name: "otro", path }))).status).toBe(400);
    expect((await post(JSON.stringify({ name: "cta_hero", path, meta: { x: "y".repeat(3000) } }))).status).toBe(413);
    expect((await post(JSON.stringify({ name: "cta_hero", path }), { origin: "https://otro.sitio" })).status).toBe(403);
    expect(await db.select().from(analyticsEvents).where(eq(analyticsEvents.path, path))).toHaveLength(1);
  });

  const ip = "203.0.113.9";
  const chromeMobile = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
  const visit = (ref: string | undefined, headers: Record<string, string>) => post(JSON.stringify({ name: "page_view", path: visits, ref }), headers);
  const stored = async () => db.select().from(analyticsEvents).where(eq(analyticsEvents.path, visits)).orderBy(analyticsEvents.id);

  it("deriva país, dispositivo, navegador, idioma, referrer y hash diario sin guardar IP ni user agent", async () => {
    const res = await visit("https://www.google.com/search?q=x", { "x-forwarded-for": ip, "user-agent": chromeMobile, "accept-language": "es-BO,es;q=0.9", "x-vercel-ip-country": "BO" });
    expect(res.status).toBe(204);
    const [row] = await stored();
    expect(row).toMatchObject({ country: "BO", device: "mobile", browser: "chrome", lang: "es", referrer: "www.google.com", bot: false });
    expect(row.visitor).toMatch(/^[0-9a-f]{16}$/);
    const serialized = JSON.stringify(row);
    expect(serialized).not.toContain(ip);
    expect(serialized).not.toContain("Pixel 7");
  });

  it("descarta el referrer del propio sitio y marca los bots", async () => {
    await visit("http://localhost/planes", { "x-forwarded-for": ip, "user-agent": chromeMobile });
    await visit(undefined, { "x-forwarded-for": ip, "user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" });
    const rows = await stored();
    expect(rows).toHaveLength(3);
    expect(rows[1]).toMatchObject({ referrer: null, bot: false });
    expect(rows[2]).toMatchObject({ bot: true, referrer: null });
    expect(rows[1].visitor).toBe(rows[0].visitor); // misma IP y UA el mismo día → mismo visitante
  });
});
