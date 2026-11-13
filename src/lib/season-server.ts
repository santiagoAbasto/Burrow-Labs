import "server-only";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { cookies } from "next/headers";
import { getSession } from "./auth";
import { getSettings } from "./content";
import { parseSeasonPreview, resolveSeason, SEASON_OFF, SEASON_PREVIEW_COOKIE, type SeasonState } from "./season";

/** La pista propia de la campaña. Sin el archivo no hay música ni botón: nunca se usan canciones con derechos. */
export const SEASON_TRACK = "/audio/navidad.mp3";
// ponytail: se mira una vez por proceso — subir la pista pide reiniciar el contenedor (un deploy lo hace).
let trackReady: boolean | undefined;
export const seasonMusicReady = () => (trackReady ??= existsSync(join(process.cwd(), "public", SEASON_TRACK)));

/**
 * El estado público de la campaña, para el layout raíz. No lee cookies (las páginas siguen siendo estáticas): la vista
 * previa y la hora exacta del modo programado las resuelve /api/season. Si la base o la caché fallan, apagada.
 */
export async function publicSeason(): Promise<{ state: SeasonState; scheduled: boolean }> {
  try {
    const { season } = await getSettings();
    return { state: resolveSeason({ settings: season, musicReady: seasonMusicReady() }), scheduled: season.mode === "scheduled" };
  } catch {
    return { state: SEASON_OFF, scheduled: false };
  }
}

/** El estado para quien hace la petición: suma la vista previa, solo si trae una sesión del panel válida. */
export async function requestSeason(): Promise<SeasonState> {
  try {
    const { season } = await getSettings();
    const raw = (await cookies()).get(SEASON_PREVIEW_COOKIE)?.value;
    // La sesión solo se consulta si hay cookie de vista previa: un visitante común no cuesta una consulta.
    const preview = raw ? parseSeasonPreview(raw) : null;
    const isAdmin = preview ? (await getSession()) !== null : false;
    return resolveSeason({ settings: season, musicReady: seasonMusicReady(), preview, isAdmin });
  } catch {
    return SEASON_OFF;
  }
}
