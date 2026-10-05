import { randomInt, randomUUID } from "node:crypto";
import { eq, inArray, like } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// La petición de Next, en memoria: cabeceras por test y un frasco de cookies.
const request = vi.hoisted(() => ({ headers: {} as Record<string, string>, jar: new Map<string, string>() }));
vi.mock("next/headers", () => ({
  headers: async () => new Headers(request.headers),
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
const cache = vi.hoisted(() => ({ revalidatePath: vi.fn() }));
vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn, revalidateTag: vi.fn(), revalidatePath: cache.revalidatePath }));

import { client, db } from "@/db";
import { activityLog, leads, rateLimits, sessions, users } from "@/db/schema";
import { createSession, hashPassword, verifyPassword } from "@/lib/auth";
import { accountKey, clientKey } from "@/lib/rate-limit";
import { login, resetUserPassword, setLeadStatus, updateAccount } from "./actions";

const tag = randomUUID().slice(0, 8);
const name = `Test ${tag}`;
const email = `login-${tag}@example.test`;
const password = "correct horse battery staple";
const emails = [email];
const ips: string[] = [];
let userId: string;
let otherId: string;

const newIp = () => {
  const ip = `198.${randomInt(256)}.${randomInt(256)}.${randomInt(256)}`;
  ips.push(ip);
  request.headers = { "x-forwarded-for": ip };
};
const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
};
const attempt = (as: string, pass: string) => login({}, form({ email: as, password: pass }));
const BAD = { error: "Email o contraseña incorrectos." };

beforeAll(async () => {
  const passwordHash = await hashPassword(password);
  const rows = await db
    .insert(users)
    .values([
      { email, passwordHash, name },
      { email: `otro-${tag}@example.test`, passwordHash, name: `${name} otro` },
    ])
    .returning();
  [userId, otherId] = rows.map((row) => row.id);
});

beforeEach(async () => {
  request.jar.clear();
  newIp();
  await db.delete(rateLimits).where(eq(rateLimits.key, accountKey("login-user", email))); // cada test parte sin intentos sobre la cuenta
});

afterAll(async () => {
  await db.delete(rateLimits).where(inArray(rateLimits.key, [...emails.map((e) => accountKey("login-user", e)), ...ips.map((ip) => clientKey(new Headers({ "x-forwarded-for": ip }), "login"))]));
  await db.delete(activityLog).where(like(activityLog.userName, `${name}%`));
  await db.delete(leads).where(eq(leads.email, email));
  await db.delete(users).where(inArray(users.id, [userId, otherId])); // las sesiones caen en cascada
  await client.end();
});

describe("login", () => {
  it("límite por IP: 5 intentos fallidos cada 15 minutos, aunque cambie la cuenta", async () => {
    for (let i = 0; i < 5; i++) {
      emails.push(`nadie-${i}-${tag}@example.test`);
      expect(await attempt(emails.at(-1)!, "x")).toEqual(BAD);
    }
    expect((await attempt(email, password)).error).toMatch(/^Demasiados intentos\. Probá de nuevo en \d+ minutos\.$/);
    // el intento frenado por IP no gastó el cupo de la cuenta: desde una sola IP no se bloquea la cuenta de otro
    expect(await db.select().from(rateLimits).where(eq(rateLimits.key, accountKey("login-user", email)))).toHaveLength(0);
  });

  it("límite por cuenta: 10 intentos cada 15 minutos aunque cada uno llegue de otra IP, exista o no la cuenta", async () => {
    const ghost = `fantasma-${tag}@example.test`;
    emails.push(ghost);
    for (const target of [email, ghost]) {
      for (let i = 0; i < 10; i++) {
        newIp();
        expect(await attempt(target, "clave incorrecta")).toEqual(BAD);
      }
      newIp();
      // mismo mensaje para la cuenta real (incluso con la clave correcta) y para la que no existe: no se puede enumerar
      expect((await attempt(target, password)).error).toMatch(/^Demasiados intentos/);
    }
    await db.delete(rateLimits).where(eq(rateLimits.key, accountKey("login-user", email)));
  });

  it("sin IP fiable no hay clave compartida por IP: los fallos de otros no bloquean el ingreso", async () => {
    request.headers = {}; // proxy que no reenvía la IP
    for (let i = 0; i < 8; i++) {
      emails.push(`ruido-${i}-${tag}@example.test`);
      expect(await attempt(emails.at(-1)!, "x")).toEqual(BAD);
    }
    await expect(attempt(email, password)).rejects.toThrow("REDIRECT /admin");
  });

  it("un ingreso correcto abre sesión, limpia los contadores y queda en la bitácora sin datos de más", async () => {
    expect(await attempt(email, "clave incorrecta")).toEqual(BAD);
    const withFile = form({ email });
    withFile.set("password", new File([password], "clave.txt")); // la contraseña tiene que ser texto
    expect(await login({}, withFile)).toEqual(BAD);
    await expect(attempt(` ${email.toUpperCase()} `, password)).rejects.toThrow("REDIRECT /admin");
    expect(request.jar.size).toBe(1);
    const keys = [accountKey("login-user", email), clientKey(new Headers(request.headers), "login")];
    expect(await db.select().from(rateLimits).where(inArray(rateLimits.key, keys))).toHaveLength(0);
    const [entry] = await db.select().from(activityLog).where(eq(activityLog.userId, userId));
    expect(entry).toMatchObject({ action: "login", entity: "sesión", title: "" });
  });
});

describe("resetUserPassword", () => {
  it("no se puede usar sobre la propia cuenta (va por Mi cuenta, con la contraseña actual)", async () => {
    await createSession(userId);
    const data = form({ password: "otra clave bien larga", confirm: "otra clave bien larga" });
    expect((await resetUserPassword(userId, {}, data)).error).toMatch(/Mi cuenta/);
    const [me] = await db.select().from(users).where(eq(users.id, userId));
    expect(await verifyPassword(password, me.passwordHash)).toBe(true);
  });

  it("sobre otra cuenta cambia la contraseña y cierra sus sesiones; un id que no es uuid no llega a la base", async () => {
    await createSession(userId);
    await db.insert(sessions).values({ tokenHash: `test-${tag}`, userId: otherId, expiresAt: new Date(Date.now() + 60_000) });
    const data = form({ password: "otra clave bien larga", confirm: "otra clave bien larga" });
    expect((await resetUserPassword({ id: otherId } as never, {}, data)).error).toBeTruthy();
    expect((await resetUserPassword("constructor", {}, data)).error).toBeTruthy();
    expect(await resetUserPassword(otherId, {}, data)).toEqual({ ok: true });
    const [other] = await db.select().from(users).where(eq(users.id, otherId));
    expect(await verifyPassword("otra clave bien larga", other.passwordHash)).toBe(true);
    expect(await db.select().from(sessions).where(eq(sessions.userId, otherId))).toHaveLength(0);
  });
});

describe("updateAccount", () => {
  it("guarda el nombre y refresca el panel, para que el formulario y el menú muestren el nombre nuevo", async () => {
    await createSession(userId);
    expect(await updateAccount({}, form({ name: `${name} firma` }))).toEqual({ ok: true });
    const [row] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId));
    expect(row.name).toBe(`${name} firma`);
    expect(cache.revalidatePath).toHaveBeenCalledWith("/admin", "layout");
    await db.update(users).set({ name }).where(eq(users.id, userId));
  });
});

describe("bitácora", () => {
  it("un cambio en un lead anota el id y la acción, nunca el nombre ni el email de la persona", async () => {
    await createSession(userId);
    const [lead] = await db.insert(leads).values({ type: "contact", name: `Persona ${tag}`, email, consent: true }).returning();
    await expect(setLeadStatus(lead.id, form({ status: "contacted", back: "/admin/leads" }))).rejects.toThrow("REDIRECT /admin/leads");
    const [entry] = await db.select().from(activityLog).where(eq(activityLog.entityId, lead.id));
    expect(entry).toMatchObject({ entity: "leads", action: "update", title: "estado → contacted" });
    expect(JSON.stringify(entry)).not.toContain(`Persona ${tag}`);
    expect(JSON.stringify(entry)).not.toContain(email);
  });
});
