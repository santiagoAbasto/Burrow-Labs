import "server-only";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { and, eq, gt, isNull, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/db";
import { passwordResets, sessions, users } from "@/db/schema";

const IS_PROD = process.env.NODE_ENV === "production";
const DAY_MS = 24 * 60 * 60 * 1000;
// En producción la cookie lleva el prefijo __Host-: el navegador solo la acepta con Secure, Path=/ y
// sin Domain, así que un subdominio no puede plantar ni pisar la sesión. En desarrollo (HTTP, sin
// Secure) el prefijo no se puede usar. Crear, leer y cerrar sesión usan esta misma constante.
export const SESSION_COOKIE = IS_PROD ? "__Host-bl_session" : "bl_session";
const SESSION_MS = 7 * DAY_MS;
/** Tope absoluto: a los 30 días de creada la sesión deja de valer aunque se haya renovado por uso. */
export const SESSION_MAX_MS = 30 * DAY_MS;
/** Vida del enlace de recuperación. Corta a propósito: llega por correo y basta para usarlo enseguida. */
export const RESET_MS = 60 * 60 * 1000;

// scrypt con N=2^15, r=8, p=3 (equivalente recomendado por OWASP). Los parámetros viajan en el
// hash para poder subirlos sin invalidar las contraseñas existentes.
const SCRYPT = { logN: 15, r: 8, p: 3 };
const KEY_LEN = 64;

function derive(password: string, salt: Buffer, logN: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password.normalize("NFKC"), salt, KEY_LEN, { N: 2 ** logN, r, p, maxmem: 256 * 1024 * 1024 }, (err, key) =>
      err ? reject(err) : resolve(key),
    ),
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, SCRYPT.logN, SCRYPT.r, SCRYPT.p);
  return `scrypt$${SCRYPT.logN}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, logN, r, p, salt, key] = stored.split("$");
  const params = [logN, r, p].map(Number);
  // Topes para que un hash corrupto no dispare un cálculo desmedido.
  if (scheme !== "scrypt" || !salt || !key || params.some((n) => !Number.isInteger(n) || n < 1 || n > 20)) return false;
  const expected = Buffer.from(key, "base64url");
  if (expected.length !== KEY_LEN) return false;
  try {
    const actual = await derive(password, Buffer.from(salt, "base64url"), params[0], params[1], params[2]);
    return timingSafeEqual(actual, expected);
  } catch {
    return false; // parámetros fuera del tope de memoria
  }
}

export type SessionUser = { id: string; email: string; name: string };
export type Session = { id: string; user: SessionUser; expiresAt: Date };

// Hash de un valor cualquiera para comparar contra él cuando el email no existe:
// así el tiempo de respuesta no delata qué cuentas existen.
let dummyHash: Promise<string> | undefined;

/** Devuelve el usuario si email y contraseña coinciden; null en cualquier otro caso. */
export async function verifyCredentials(email: string, password: string): Promise<SessionUser | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1);
  const ok = await verifyPassword(password, user?.passwordHash ?? (await (dummyHash ??= hashPassword(randomBytes(16).toString("hex")))));
  return user && ok ? { id: user.id, email: user.email, name: user.name } : null;
}

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

const cookieOptions = (expires: Date) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: IS_PROD,
  path: "/",
  expires,
});

/** Crea la sesión en BD y deja la cookie. Solo desde un server action o route handler. */
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_MS);
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date())); // limpia las vencidas
  await db.insert(sessions).values({ tokenHash: hashToken(token), userId, expiresAt });
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions(expiresAt));
}

/** Sesión vigente o null. Cacheada por request (React `cache`). */
export const getSession = cache(async (): Promise<Session | null> => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [row] = await db
    .select({ id: sessions.id, expiresAt: sessions.expiresAt, createdAt: sessions.createdAt, userId: users.id, email: users.email, name: users.name })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  if (!row) return null;
  const hardLimit = row.createdAt.getTime() + SESSION_MAX_MS;
  if (Date.now() >= hardLimit) return null; // la fila la limpia el próximo ingreso (expires_at nunca pasa del tope)

  let expiresAt = row.expiresAt;
  // Renovación deslizante: pasada la mitad de la vida, se extiende otros 7 días, sin pasar del tope absoluto.
  if (expiresAt.getTime() - Date.now() < SESSION_MS / 2 && expiresAt.getTime() < hardLimit) {
    expiresAt = new Date(Math.min(Date.now() + SESSION_MS, hardLimit));
    await db.update(sessions).set({ expiresAt }).where(eq(sessions.id, row.id));
    try {
      store.set(SESSION_COOKIE, token, cookieOptions(expiresAt));
    } catch {
      // Durante el render de un server component no se pueden escribir cookies:
      // la cookie se renueva en la siguiente acción o route handler.
    }
  }
  return { id: row.id, user: { id: row.userId, email: row.email, name: row.name }, expiresAt };
});

/** Usuario autenticado o redirección a /admin (que sin sesión muestra el ingreso). Llamar en cada página y acción del admin. */
export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/admin"); // /admin sin sesión muestra el ingreso
  return session.user;
}

/** Cierra la sesión actual (BD + cookie). Solo desde un server action o route handler. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  store.delete(SESSION_COOKIE);
}

/* ──────────────────────── recuperación de contraseña ──────────────────────── */

/**
 * Crea un enlace de recuperación y devuelve el token en claro, que solo viaja en el correo.
 * Invalida los pedidos anteriores del mismo usuario: siempre hay un solo enlace vivo, así que
 * pedir otro deja muerto al que ya se había enviado.
 */
export async function createPasswordReset(userId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await db.delete(passwordResets).where(lt(passwordResets.expiresAt, new Date()));
  await db.delete(passwordResets).where(eq(passwordResets.userId, userId));
  await db.insert(passwordResets).values({ tokenHash: hashToken(token), userId, expiresAt: new Date(Date.now() + RESET_MS) });
  return token;
}

/** Lectura sin consumir: sirve para decidir si la página muestra el formulario o «el enlace venció». */
export async function findPasswordReset(token: string): Promise<string | null> {
  const [row] = await db
    .select({ userId: passwordResets.userId })
    .from(passwordResets)
    .where(and(eq(passwordResets.tokenHash, hashToken(token)), gt(passwordResets.expiresAt, new Date()), isNull(passwordResets.usedAt)))
    .limit(1);
  return row?.userId ?? null;
}

/**
 * Marca el enlace como usado y devuelve el usuario, en un solo UPDATE condicional: dos envíos
 * simultáneos del mismo formulario no pueden cambiar la contraseña dos veces.
 */
export async function claimPasswordReset(token: string): Promise<string | null> {
  const [row] = await db
    .update(passwordResets)
    .set({ usedAt: new Date() })
    .where(and(eq(passwordResets.tokenHash, hashToken(token)), gt(passwordResets.expiresAt, new Date()), isNull(passwordResets.usedAt)))
    .returning({ userId: passwordResets.userId });
  return row?.userId ?? null;
}
