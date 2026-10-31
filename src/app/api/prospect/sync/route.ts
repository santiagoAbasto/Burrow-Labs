import { asc, gt } from "drizzle-orm";
import { db } from "@/db";
import { leads, projectSheets } from "@/db/schema";
import { env } from "@/lib/env";
import { leadForProspect, parseSince, prospectTokenOk, sheetForProspect } from "@/lib/prospect-sync";

// ponytail: tope de 500 filas por tipo y llamada — Prospect avanza con `since` (el updatedAt más nuevo que recibió)
// y vuelve a pedir; si algún día hubiera más cambios por minuto, paginar con un cursor compuesto (updatedAt, id).
const LIMIT = 500;

/**
 * GET /api/prospect/sync?since=<ISO> — consultas del sitio (sin las marcadas como spam) y fichas de proyecto cambiadas
 * después de `since`. Solo para Burrow Prospect, con `Authorization: Bearer <PROSPECT_API_TOKEN>`. Sin token configurado
 * la ruta no existe (404).
 */
export async function GET(request: Request) {
  if (!env.PROSPECT_API_TOKEN) return new Response(null, { status: 404 });
  if (!prospectTokenOk(request.headers.get("authorization"), env.PROSPECT_API_TOKEN)) return new Response(null, { status: 401 });

  const since = parseSince(new URL(request.url).searchParams.get("since"));
  const [leadRows, sheetRows] = await Promise.all([
    db.select().from(leads).where(gt(leads.updatedAt, since)).orderBy(asc(leads.updatedAt)).limit(LIMIT),
    db.select().from(projectSheets).where(gt(projectSheets.updatedAt, since)).orderBy(asc(projectSheets.updatedAt)).limit(LIMIT),
  ]);

  return Response.json(
    {
      leads: leadRows.filter((l) => l.status !== "spam").map((l) => leadForProspect(l, env.NEXT_PUBLIC_SITE_URL)),
      sheets: sheetRows.map((s) => sheetForProspect(s, env.NEXT_PUBLIC_SITE_URL)),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
