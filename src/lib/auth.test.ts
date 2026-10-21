import { createHash, randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// Cookie jar en memoria en lugar de la request de Next.
const jar = vi.hoisted(() => new Map<string, { value: string; options?: Record<string, unknown> }>());
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)!.value } : undefined),
    set: (name: string, value: string, options?: Record<string, unknown>) => void jar.set(name, { value, options }),
    delete: (name: string) => void jar.delete(name),
  }),
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));

import { client, db } from "@/db";
import { passwordResets, sessions, users } from "@/db/schema";
import {
  claimPasswordReset,
  createPasswordReset,
  createSession,
  destroySession,
  getSession,
  hashPassword,
  findPasswordReset,
  requireUser,
  RESET_MS,
  SESSION_COOKIE,
  SESSION_MAX_MS,
  verifyCredentials,
  verifyPassword,
} from "./auth";

const DAY = 24 * 60 * 60 * 1000;
const email = `test-${randomUUID()}@example.test`;
const password = "correct horse battery staple";
let userId: string;

beforeAll(async () => {
  const [user] = await db
    .insert(users)
    .values({ email, passwordHash: await hashPassword(password), name: "Test" })
    .returning();
  userId = user.id;
});

afterAll(async () => {
  await db.delete(users).where(eq(users.id, userId)); // las sesiones caen en cascada
  await client.end();
});

describe("contraseñas", () => {
  it("verifica la correcta y rechaza la incorrecta", async () => {
    const hash = await hashPassword(password);
    expect(hash).toMatch(/^scrypt\$15\$8\$3\$/);
    expect(hash).not.toContain(password);
    expect(await verifyPassword(password, hash)).toBe(true);
    expect(await verifyPassword("otra clave cualquiera", hash)).toBe(false);
  });

  it("usa un salt distinto cada vez", async () => {
    expect(await hashPassword(password)).not.toBe(await hashPassword(password));
  });

  it("rechaza hashes corruptos sin lanzar", async () => {
    for (const bad of ["", "texto-plano", "scrypt$15$8$3$c2FsdA$corto", "scrypt$99$8$3$c2FsdA$aGFzaA", "md5$1$1$1$a$b"])
      expect(await verifyPassword(password, bad)).toBe(false);
  });

  it("verifyCredentials no distingue email inexistente de clave incorrecta", async () => {
    expect(await verifyCredentials(email.toUpperCase(), password)).toMatchObject({ id: userId, email });
    expect(await verifyCredentials(email, "clave incorrecta")).toBeNull();
    expect(await verifyCredentials(`nadie-${randomUUID()}@example.test`, password)).toBeNull();
  });
});

describe("ciclo de sesión", () => {
  it("sin cookie no hay sesión y requireUser redirige al ingreso (/admin)", async () => {
    jar.clear();
    expect(await getSession()).toBeNull();
    await expect(requireUser()).rejects.toThrow("REDIRECT /admin");
  });

  it("crea, lee, renueva, vence y destruye", async () => {
    await createSession(userId);
    const cookie = jar.get(SESSION_COOKIE)!;
    expect(cookie.options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
    expect((cookie.options!.expires as Date).getTime()).toBeGreaterThan(Date.now() + 6.9 * DAY);

    // En la base solo está el sha256 del token, nunca el token.
    const tokenHash = createHash("sha256").update(cookie.value).digest("hex");
    const [row] = await db.select().from(sessions).where(eq(sessions.userId, userId));
    expect(row.tokenHash).toBe(tokenHash);
    expect(row.tokenHash).not.toBe(cookie.value);

    expect(await getSession()).toMatchObject({ user: { id: userId, email, name: "Test" } });
    expect(await requireUser()).toMatchObject({ id: userId });

    // Un token que no existe no abre sesión.
    jar.set(SESSION_COOKIE, { value: "token-inventado" });
    expect(await getSession()).toBeNull();
    jar.set(SESSION_COOKIE, cookie);

    // Renovación deslizante: con menos de media vida restante, se extiende a 7 días.
    await db
      .update(sessions)
      .set({ expiresAt: new Date(Date.now() + DAY) })
      .where(eq(sessions.id, row.id));
    const renewed = await getSession();
    expect(renewed!.expiresAt.getTime()).toBeGreaterThan(Date.now() + 6.9 * DAY);

    // Vencida: deja de ser válida.
    await db
      .update(sessions)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(sessions.id, row.id));
    expect(await getSession()).toBeNull();

    // Destruir: borra la fila y la cookie.
    await createSession(userId);
    expect(await getSession()).not.toBeNull();
    await destroySession();
    expect(jar.has(SESSION_COOKIE)).toBe(false);
    expect(await getSession()).toBeNull();
    expect(await db.select().from(sessions).where(eq(sessions.userId, userId))).toHaveLength(0);
  });

  it("tope absoluto: a los 30 días de creada la sesión deja de valer aunque se haya renovado por uso", async () => {
    jar.clear();
    await createSession(userId);
    const [row] = await db.select().from(sessions).where(eq(sessions.userId, userId));

    // Creada hace 29 días y por vencer: se renueva, pero solo hasta el día 30 (no otros 7 días).
    const createdAt = new Date(Date.now() - 29 * DAY);
    await db.update(sessions).set({ createdAt, expiresAt: new Date(Date.now() + 3600_000) }).where(eq(sessions.id, row.id));
    const renewed = await getSession();
    expect(renewed).not.toBeNull();
    expect(renewed!.expiresAt.getTime()).toBe(createdAt.getTime() + SESSION_MAX_MS);

    // Creada hace más de 30 días: no vale aunque expires_at siga en el futuro.
    await db.update(sessions).set({ createdAt: new Date(Date.now() - 31 * DAY), expiresAt: new Date(Date.now() + DAY) }).where(eq(sessions.id, row.id));
    expect(await getSession()).toBeNull();
    await destroySession();
  });
});

describe("cookie de sesión", () => {
  it("en desarrollo va sin prefijo (HTTP); en producción lleva __Host- y Secure", async () => {
    expect(SESSION_COOKIE).toBe("bl_session");
    jar.clear();
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("AUTH_SECRET", "s".repeat(32));
    try {
      const prod = await import("./auth");
      expect(prod.SESSION_COOKIE).toBe("__Host-bl_session");
      // crear, leer y cerrar usan el mismo nombre
      await prod.createSession(userId);
      expect([...jar.keys()]).toEqual(["__Host-bl_session"]);
      expect(jar.get("__Host-bl_session")!.options).toMatchObject({ httpOnly: true, secure: true, sameSite: "lax", path: "/" });
      expect(jar.get("__Host-bl_session")!.options).not.toHaveProperty("domain");
      expect(await prod.getSession()).toMatchObject({ user: { id: userId } });
      await prod.destroySession();
      expect(jar.size).toBe(0);
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });
});

describe("recuperación de contraseña", () => {
  it("el token sirve una sola vez", async () => {
    const token = await createPasswordReset(userId);
    expect(await findPasswordReset(token)).toBe(userId); // leer no lo consume
    expect(await findPasswordReset(token)).toBe(userId);
    expect(await claimPasswordReset(token)).toBe(userId); // el primer uso sí
    expect(await claimPasswordReset(token)).toBeNull();
    expect(await findPasswordReset(token)).toBeNull();
  });

  it("pedir otro enlace deja muerto al anterior", async () => {
    const viejo = await createPasswordReset(userId);
    const nuevo = await createPasswordReset(userId);
    expect(await findPasswordReset(viejo)).toBeNull();
    expect(await claimPasswordReset(viejo)).toBeNull();
    expect(await claimPasswordReset(nuevo)).toBe(userId);
  });

  it("vencido no se encuentra ni se consume", async () => {
    const token = await createPasswordReset(userId);
    await db
      .update(passwordResets)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(eq(passwordResets.userId, userId));
    expect(await findPasswordReset(token)).toBeNull();
    expect(await claimPasswordReset(token)).toBeNull();
  });

  it("un token inventado no abre nada y el enlace vale una hora", async () => {
    expect(await findPasswordReset("no-existe")).toBeNull();
    expect(await claimPasswordReset("no-existe")).toBeNull();
    expect(RESET_MS).toBe(60 * 60 * 1000);
  });

  it("solo guarda el hash: el token en claro no queda en la base", async () => {
    const token = await createPasswordReset(userId);
    const [row] = await db.select({ tokenHash: passwordResets.tokenHash }).from(passwordResets).where(eq(passwordResets.userId, userId)).limit(1);
    expect(row.tokenHash).not.toBe(token);
    expect(row.tokenHash).toBe(createHash("sha256").update(token).digest("hex"));
  });
});
