import { requestSeason } from "@/lib/season-server";

// El estado de la campaña con el reloj del servidor y, para quien administra, su vista previa. El script del sitio
// solo lo pide en modo programado o con vista previa abierta (src/components/season/provider.tsx).
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await requestSeason(), { headers: { "Cache-Control": "no-store" } });
}
