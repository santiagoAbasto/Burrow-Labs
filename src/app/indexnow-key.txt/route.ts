import { env } from "@/lib/env";

// Archivo de verificación de IndexNow: el buscador lo lee para comprobar que la clave es del sitio.
// La clave no es un secreto (viaja en cada aviso); sin `INDEXNOW_KEY` la ruta no existe.
export const dynamic = "force-static";

export function GET() {
  if (!env.INDEXNOW_KEY) return new Response("Not found", { status: 404 });
  return new Response(env.INDEXNOW_KEY, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
