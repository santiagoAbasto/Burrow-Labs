import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// La petición de Next, en memoria: un frasco de cookies por test.
const request = vi.hoisted(() => ({ jar: new Map<string, string>() }));
vi.mock("next/headers", () => ({
  headers: async () => new Headers(),
  cookies: async () => ({
    get: (name: string) => (request.jar.has(name) ? { name, value: request.jar.get(name)! } : undefined),
    set: (name: string, value: string) => void request.jar.set(name, value),
    delete: (name: string) => void request.jar.delete(name),
  }),
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));
const cache = vi.hoisted(() => ({ revalidateTag: vi.fn() }));
vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn, revalidateTag: cache.revalidateTag, revalidatePath: vi.fn() }));

import { client, db } from "@/db";
import { activityLog, sessions, siteSettings, users } from "@/db/schema";
import { createSession, hashPassword } from "@/lib/auth";
import { SEASON_HINT_COOKIE, SEASON_OFF, SEASON_PREVIEW_COOKIE } from "@/lib/season";
import { requestSeason } from "@/lib/season-server";
import { previewSeason, saveSeason, stopSeasonPreview } from "./season-actions";

const email = `season-${randomUUID().slice(0, 8)}@example.test`;
let userId: string;
let before: unknown;

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [name, value] of Object.entries({ mode: "off", siteIntensity: "festive", adminIntensity: "subtle", ...fields })) data.set(name, value);
  return data;
};
const stored = async () => (await db.select().from(siteSettings).where(eq(siteSettings.key, "season")).limit(1))[0]?.value as Record<string, unknown> | undefined;
const SESSION_COOKIES = () => [...request.jar.keys()].filter((name) => name !== SEASON_PREVIEW_COOKIE && name !== SEASON_HINT_COOKIE);

beforeAll(async () => {
  before = await stored();
  [{ id: userId }] = await db.insert(users).values({ email, name: "Season", passwordHash: await hashPassword("una clave larga de prueba") }).returning({ id: users.id });
});
afterAll(async () => {
  await db.delete(activityLog).where(eq(activityLog.userId, userId));
  await db.delete(sessions).where(eq(sessions.userId, userId));
  await db.delete(users).where(eq(users.id, userId));
  // La fila `season` de la base de tests queda como estaba
  if (before === undefined) await db.delete(siteSettings).where(eq(siteSettings.key, "season"));
  else await db.insert(siteSettings).values({ key: "season", value: before }).onConflictDoUpdate({ target: siteSettings.key, set: { value: before } });
  await client.end();
});
beforeEach(async () => {
  request.jar.clear();
  cache.revalidateTag.mockClear();
  await db.delete(siteSettings).where(eq(siteSettings.key, "season"));
});

describe("permisos", () => {
  it("sin sesión no se guarda, no se previsualiza y no se toca la base", async () => {
    await expect(saveSeason({}, form({ mode: "manual" }))).rejects.toThrow("REDIRECT /admin");
    await expect(previewSeason({}, form({ mode: "manual" }))).rejects.toThrow("REDIRECT /admin");
    await expect(stopSeasonPreview()).rejects.toThrow("REDIRECT /admin");
    expect(await stored()).toBeUndefined();
    expect(request.jar.size).toBe(0);
    expect(cache.revalidateTag).not.toHaveBeenCalled();
  });
});

describe("con sesión del panel", () => {
  beforeEach(async () => {
    await createSession(userId);
  });

  it("guardar escribe los ajustes, invalida la caché de settings y deja la campaña visible", async () => {
    expect(await saveSeason({}, form({ mode: "manual", site: "on", lights: "on" }))).toEqual({ ok: true });
    expect(await stored()).toMatchObject({ mode: "manual", site: true, admin: false, lights: true, snow: false });
    expect(cache.revalidateTag).toHaveBeenCalledWith("settings", { expire: 0 });
    expect((await requestSeason()).site).toMatchObject({ name: "christmas", preview: false });
  });

  it("un formulario inválido devuelve el error por campo y no guarda nada", async () => {
    const result = await saveSeason({}, form({ mode: "scheduled", start: "2026-12-10T00:00", end: "2026-12-01T00:00", link: "https://otro.sitio" }));
    expect(result.ok).toBeUndefined();
    expect(Object.keys(result.errors ?? {}).sort()).toEqual(["end", "link"]);
    expect(await stored()).toBeUndefined();
    expect(cache.revalidateTag).not.toHaveBeenCalled();
  });

  it("la vista previa vive en cookies: no toca la base ni la caché", async () => {
    expect(await previewSeason({}, form({ mode: "off", site: "on", snow: "on" }))).toEqual({ ok: true });
    expect(await stored()).toBeUndefined();
    expect(cache.revalidateTag).not.toHaveBeenCalled();
    expect(request.jar.get(SEASON_HINT_COOKIE)).toBe("1");
    expect(JSON.parse(request.jar.get(SEASON_PREVIEW_COOKIE)!)).toMatchObject({ snow: true });
    // quien administra la ve aunque la campaña esté apagada…
    expect((await requestSeason()).site).toMatchObject({ snow: true, preview: true });
  });

  it("…y la misma cookie sin sesión no muestra nada", async () => {
    await previewSeason({}, form({ mode: "off", site: "on" }));
    for (const name of SESSION_COOKIES()) request.jar.delete(name);
    expect(await requestSeason()).toEqual(SEASON_OFF);
  });

  it("guardar o «Salir» cierran la vista previa", async () => {
    await previewSeason({}, form({ mode: "off", site: "on" }));
    await stopSeasonPreview();
    expect(request.jar.has(SEASON_PREVIEW_COOKIE)).toBe(false);
    expect(request.jar.has(SEASON_HINT_COOKIE)).toBe(false);
    await previewSeason({}, form({ mode: "off", site: "on" }));
    await saveSeason({}, form({ mode: "off" }));
    expect(request.jar.has(SEASON_PREVIEW_COOKIE)).toBe(false);
    expect(await requestSeason()).toEqual(SEASON_OFF);
  });
});
