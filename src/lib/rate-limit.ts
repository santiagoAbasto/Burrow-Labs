import "server-only";
import { createHmac } from "node:crypto";
import { BlockList, isIP } from "node:net";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { env } from "./env";

export type RateLimitResult = { ok: boolean; remaining: number; retryAfterSec: number };

/**
 * Ventana fija por clave. Un único upsert atómico: no hay carrera entre leer y escribir.
 * ponytail: ventana fija (permite hasta 2×limit en el borde entre dos ventanas) — pasar a
 * ventana deslizante o a Redis si hiciera falta precisión o más de una región.
 */
export async function rateLimit(key: string, { limit, windowSec }: { limit: number; windowSec: number }): Promise<RateLimitResult> {
  const [row] = await db.execute<{ count: number; retry_after: number }>(sql`
    INSERT INTO rate_limits AS r (key, count, window_start)
    VALUES (${key}, 1, now())
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN r.window_start + make_interval(secs => ${windowSec}) <= now() THEN 1 ELSE r.count + 1 END,
      window_start = CASE WHEN r.window_start + make_interval(secs => ${windowSec}) <= now() THEN now() ELSE r.window_start END
    RETURNING count, ceil(extract(epoch FROM window_start + make_interval(secs => ${windowSec}) - now()))::int AS retry_after
  `);
  // Limpieza oportunista de claves viejas para que la tabla no crezca sin techo.
  if (Math.random() < 0.01) await db.execute(sql`DELETE FROM rate_limits WHERE window_start < now() - interval '1 day'`);

  const ok = row.count <= limit;
  return { ok, remaining: Math.max(0, limit - row.count), retryAfterSec: ok ? 0 : Math.max(1, row.retry_after) };
}

// Direcciones que nunca son un visitante: loopback, redes privadas y link-local. Si la «IP del
// cliente» cae acá, quien se conecta a Next es el proxy y no está reenviando la IP real.
const INTERNAL = new BlockList();
for (const [net, prefix] of [["127.0.0.0", 8], ["10.0.0.0", 8], ["172.16.0.0", 12], ["192.168.0.0", 16], ["169.254.0.0", 16]] as const) INTERNAL.addSubnet(net, prefix);
INTERNAL.addAddress("::1", "ipv6");
INTERNAL.addSubnet("fc00::", 7, "ipv6");
INTERNAL.addSubnet("fe80::", 10, "ipv6");

/**
 * IP real del visitante, o null si no se puede saber.
 *
 * Modelo: UN proxy de confianza delante de Next. Se toma la ÚLTIMA entrada de x-forwarded-for, que
 * es la que escribe ese proxy (las anteriores las puede inventar el cliente); x-real-ip solo como
 * respaldo. Next completa x-forwarded-for con la dirección del socket cuando no llega, así que con
 * un proxy que no la reenvía la «IP» es la del propio proxy (loopback o red privada de Docker): eso
 * también cuenta como desconocida. Lo mismo un valor que no es una IP.
 */
export function clientIp(headers: Headers): string | null {
  const raw = headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() || headers.get("x-real-ip")?.trim() || "";
  const ip = raw.startsWith("::ffff:") && isIP(raw.slice(7)) === 4 ? raw.slice(7) : raw; // IPv4 mapeada en IPv6
  const family = isIP(ip);
  if (!family || INTERNAL.check(ip, family === 6 ? "ipv6" : "ipv4")) return null;
  return ip;
}

const hmac = (value: string) => createHmac("sha256", env.AUTH_SECRET).update(value).digest("hex").slice(0, 32);

/**
 * Clave de rate limit para el cliente de la petición: `scope:hmac(ip)`. La IP nunca se guarda en claro.
 * Sin IP fiable (ver clientIp) todos comparten la clave `scope:hmac("shared")`.
 */
export function clientKey(headers: Headers, scope: string): string {
  return `${scope}:${hmac(clientIp(headers) ?? "shared")}`;
}

/** Clave de rate limit por cuenta: `scope:hmac(email)`. El email tampoco se guarda en claro. */
export function accountKey(scope: string, email: string): string {
  return `${scope}:${hmac(`account|${email.trim().toLowerCase().slice(0, 254)}`)}`;
}

// Cuántas veces más grande es el cupo de la clave compartida: tiene que alcanzar para todos los
// visitantes a la vez sin dejar de ser un techo.
const SHARED_FACTOR = 20;
let warned = false;

/**
 * Límite por visitante. Si la IP no es fiable, la clave es una sola para todo el sitio: se le da un
 * cupo SHARED_FACTOR veces mayor para que unos pocos envíos no bloqueen a todos (queda como
 * cortacircuitos global) y se avisa una vez en el log, porque es un error de despliegue
 * (docs/SECURITY.md, «Detrás de un proxy»).
 */
export async function limitClient(headers: Headers, scope: string, { limit, windowSec }: { limit: number; windowSec: number }): Promise<RateLimitResult> {
  const shared = clientIp(headers) === null;
  if (shared && !warned && env.NODE_ENV === "production") {
    warned = true;
    console.warn("[rate-limit] no llega la IP real del visitante (falta X-Forwarded-For en el proxy): los límites por IP se comparten entre todos. Ver docs/SECURITY.md.");
  }
  return rateLimit(clientKey(headers, scope), { limit: shared ? limit * SHARED_FACTOR : limit, windowSec });
}
