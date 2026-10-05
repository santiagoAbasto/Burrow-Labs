import { sql } from "drizzle-orm";
import { db } from "@/db";
import { version } from "../../../../package.json";

export const dynamic = "force-dynamic";

const DB_TIMEOUT_MS = 2000;

/** true si la base responde un `SELECT 1` dentro del plazo. Nunca lanza. */
async function databaseUp(): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      db.execute(sql`SELECT 1`).then(() => true),
      new Promise<boolean>((resolve) => (timer = setTimeout(() => resolve(false), DB_TIMEOUT_MS))),
    ]);
  } catch {
    return false; // el motivo no sale ni en la respuesta ni en el log: puede traer host, usuario o ruta
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Salud del servicio para el monitoreo y el healthcheck de Docker: 200 `ok` si la base responde, 503
 * `degraded` si no. La respuesta lleva solo estado, hora y versión: nada de secretos, hostname, rutas,
 * variables de entorno ni trazas. `X-Robots-Tag: noindex` lo pone next.config.ts para todo /api.
 */
export async function GET() {
  const ok = await databaseUp();
  return Response.json(
    { status: ok ? "ok" : "degraded", timestamp: new Date().toISOString(), version },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
