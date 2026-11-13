// La campaña de Navidad: una capa de temporada que se enciende y se apaga sin tocar las páginas.
//
// Este es el único lugar que decide si la campaña está activa y en qué superficie (el sitio público o el panel).
// El resultado llega a `<html>` como `data-season="christmas"` (lo escribe el layout raíz) y a los componentes como
// la vista `SeasonView`; apagada vale null, el atributo no se escribe y nada de src/components/season/ se descarga.
//
// El modo programado compara el reloj del servidor contra un intervalo [inicio, fin) escrito en hora de Bolivia:
// no depende de un cron ni de la hora del navegador. Sin "server-only": lo usan también el script del cliente
// (solo los tipos y `surfaceOf`) y las pruebas.
import { z } from "zod";

export const SEASON_ZONE = "America/La_Paz";
/** Bolivia no cambia la hora: siempre UTC−4. */
const ZONE_OFFSET = "-04:00";
const LOCAL_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export const SEASON_MODES = ["off", "manual", "scheduled"] as const;
export const SEASON_INTENSITIES = ["festive", "subtle"] as const;
export type SeasonSurface = "site" | "admin";

/** Un enlace interno de verdad: empieza con una sola barra y no lleva esquema, comillas ni espacios. */
export function isInternalLink(link: unknown): link is string {
  return typeof link === "string" && /^\/(?!\/)[A-Za-z0-9\-._~/?=&%#]*$/.test(link);
}

/** Convierte «2026-12-01T00:00» (hora de Bolivia) en un instante preciso. Null si no se puede leer. */
export function seasonInstant(local: unknown): Date | null {
  if (typeof local !== "string" || !LOCAL_DATETIME.test(local)) return null;
  const date = new Date(`${local}:00${ZONE_OFFSET}`);
  // «2026-02-31T00:00» pasa la forma pero no existe: Date lo corre a marzo. Se exige que vuelva al mismo texto.
  return Number.isNaN(date.getTime()) || toLocalInput(date) !== local ? null : date;
}

/** El instante → el texto que entiende `<input type="datetime-local">`, en hora de Bolivia. */
export function toLocalInput(date: Date): string {
  return new Date(date.getTime() - 4 * 3_600_000).toISOString().slice(0, 16);
}

const flag = (fallback: boolean) => z.boolean().default(fallback);
const localDateTime = z
  .string()
  .trim()
  .refine((value) => value === "" || seasonInstant(value) !== null, "Escribí una fecha y hora válidas.")
  .default("");

/** Lo que se edita en Sitio → Campaña de Navidad. Cada campo con su valor inicial: la campaña nace apagada. */
export const seasonFields = {
  mode: z.enum(SEASON_MODES).default("off"),
  site: flag(true),
  admin: flag(true),
  start: localDateTime,
  end: localDateTime,
  siteIntensity: z.enum(SEASON_INTENSITIES).default("festive"),
  adminIntensity: z.enum(SEASON_INTENSITIES).default("subtle"),
  characters: flag(true),
  lights: flag(true),
  animations: flag(true),
  snow: flag(false),
  music: flag(true),
  greeting: z.string().trim().max(90, "El saludo va en una línea: hasta 90 caracteres.").default(""),
  link: z
    .string()
    .trim()
    .refine((value) => value === "" || isInternalLink(value), "El enlace tiene que ser una página de este sitio: empieza con «/» (por ejemplo /contacto).")
    .default(""),
};
/** Lo guardado: tolerante (un intervalo incompleto simplemente no enciende la campaña). */
export const seasonSchema = z.object(seasonFields).prefault({} as never);
export type SeasonSettings = z.infer<typeof seasonSchema>;

/** Lo que llega del formulario del panel: además exige que un intervalo programado esté completo y en orden. */
export const seasonFormSchema = z.object(seasonFields).superRefine((value, ctx) => {
  if (value.mode !== "scheduled") return;
  const start = seasonInstant(value.start);
  const end = seasonInstant(value.end);
  if (!start) ctx.addIssue({ code: "custom", path: ["start"], message: "Para programarla hace falta la fecha de inicio." });
  if (!end) ctx.addIssue({ code: "custom", path: ["end"], message: "Para programarla hace falta la fecha de fin." });
  if (start && end && end <= start) ctx.addIssue({ code: "custom", path: ["end"], message: "El fin tiene que ser posterior al inicio." });
});

/** ¿Está encendida la campaña en este instante? El fin es exclusivo: a esa hora exacta ya no se ve. */
export function isSeasonActive(settings: Pick<SeasonSettings, "mode" | "start" | "end">, now: Date = new Date()): boolean {
  if (settings.mode === "manual") return true;
  if (settings.mode !== "scheduled") return false;
  const start = seasonInstant(settings.start);
  const end = seasonInstant(settings.end);
  // un intervalo incompleto o al revés nunca enciende la campaña
  if (!start || !end || end <= start) return false;
  return now >= start && now < end;
}

/** El panel usa su propia intensidad; la ficha de proyecto, la API y las rutas de desarrollo no se visten. */
export function surfaceOf(pathname: string): SeasonSurface | null {
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return "admin";
  if (/^\/(api|dev|ficha|media)(\/|$)/.test(pathname)) return null;
  return "site";
}

/** Lo que una superficie necesita para vestirse de Navidad. */
export type SeasonView = {
  name: "christmas";
  surface: SeasonSurface;
  intensity: (typeof SEASON_INTENSITIES)[number];
  characters: boolean;
  lights: boolean;
  animations: boolean;
  snow: boolean;
  music: boolean;
  greeting: string;
  link: string;
  preview: boolean;
};

/** La vista de una superficie con esos ajustes, sin mirar el reloj. Null si esa superficie está apagada. */
export function seasonView(settings: SeasonSettings, surface: SeasonSurface, extra: { musicReady: boolean; preview?: boolean }): SeasonView | null {
  if (!settings[surface]) return null;
  const site = surface === "site";
  return {
    name: "christmas",
    surface,
    intensity: site ? settings.siteIntensity : settings.adminIntensity,
    characters: settings.characters,
    lights: settings.lights,
    animations: settings.animations,
    // La nieve y la música nunca llegan al panel: es una pantalla de trabajo
    snow: site && settings.snow,
    // La música suena solo en el sitio, solo si hay una pista propia cargada, y cada visitante puede apagarla
    music: site && settings.music && extra.musicReady,
    greeting: site ? settings.greeting : "",
    link: site && isInternalLink(settings.link) ? settings.link : "",
    preview: extra.preview ?? false,
  };
}

/** El estado completo, por superficie: lo que viaja en el HTML y lo que devuelve /api/season. */
export type SeasonState = { site: SeasonView | null; admin: SeasonView | null };

export const SEASON_OFF: SeasonState = { site: null, admin: null };

/**
 * El estado de la campaña para quien pide la página.
 *
 * La vista previa solo se respeta si `isAdmin` es verdadero (hay una sesión del panel válida): no hay parámetro de
 * URL que la active y nunca llega a otro visitante. Con vista previa se ignoran el modo y el reloj.
 */
export function resolveSeason(input: { settings: SeasonSettings; now?: Date; musicReady: boolean; preview?: SeasonSettings | null; isAdmin?: boolean }): SeasonState {
  const preview = input.isAdmin && input.preview ? input.preview : null;
  const settings = preview ?? input.settings;
  if (!preview && !isSeasonActive(settings, input.now)) return SEASON_OFF;
  const extra = { musicReady: input.musicReady, preview: preview !== null };
  return { site: seasonView(settings, "site", extra), admin: seasonView(settings, "admin", extra) };
}

/** Lee la cookie de vista previa. Cualquier cosa que no sea un juego de ajustes válido se descarta. */
export function parseSeasonPreview(raw: string | undefined): SeasonSettings | null {
  if (!raw) return null;
  try {
    const parsed = z.object(seasonFields).safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Cookie con los ajustes de la vista previa (httpOnly) y su aviso legible por el script (sin datos). */
export const SEASON_PREVIEW_COOKIE = "bl_season_preview";
export const SEASON_HINT_COOKIE = "bl_season_hint";

/** Atributos de `<html>` para una vista (o ninguno si está apagada). `still` = animaciones apagadas desde el panel. */
export function seasonAttributes(view: SeasonView | null): Record<string, string> {
  if (!view) return {};
  return {
    "data-season": view.name,
    "data-season-surface": view.surface,
    "data-season-intensity": view.intensity,
    ...(view.animations ? {} : { "data-season-still": "" }),
  };
}
