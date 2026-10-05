import { createHmac } from "node:crypto";
import { db } from "@/db";
import { analyticsEvents } from "@/db/schema";
import { analyticsEventSchema, MAX_EVENT_BODY_BYTES } from "@/lib/analytics-events";
import { env } from "@/lib/env";
import { clientIp, limitClient } from "@/lib/rate-limit";

const TZ = "America/La_Paz";
const COUNTRY_HEADERS = ["x-vercel-ip-country", "cf-ipcountry", "cloudfront-viewer-country", "x-country-code"];
const BOT_RE = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|python|curl|wget|java\/|go-http|okhttp|libwww|scrapy|phantom|puppeteer|playwright/i;

type Device = "desktop" | "mobile" | "tablet";
type Browser = "chrome" | "safari" | "firefox" | "edge" | "opera" | "samsung" | "other";

const status = (code: number, headers?: HeadersInit) => new Response(null, { status: code, headers });

/**
 * País que informa el proxy (Vercel, Cloudflare, CloudFront…): solo dos letras válidas. Sin un CDN
 * delante estas cabeceras las puede inventar el visitante: el proxy propio tiene que vaciarlas
 * (docs/SECURITY.md, «Detrás de un proxy»). Solo alimenta un gráfico del panel.
 */
function country(headers: Headers): string | null {
  for (const name of COUNTRY_HEADERS) {
    const value = headers.get(name)?.trim().toUpperCase();
    if (value && /^[A-Z]{2}$/.test(value)) return value;
  }
  return null;
}

// ponytail: heurística por regex (iPadOS se presenta como Mac y cuenta como escritorio) — alcanza para
// un gráfico de torta; si hiciera falta precisión, Client Hints (Sec-CH-UA-*).
function device(ua: string): Device | null {
  if (!ua) return null;
  if (/ipad|tablet|kindle|silk|playbook/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua))) return "tablet";
  if (/mobi|iphone|ipod|android|windows phone|blackberry|opera mini/i.test(ua)) return "mobile";
  return "desktop";
}

// El orden importa: Edge, Opera y Samsung también dicen "Chrome", y Chrome también dice "Safari".
function browser(ua: string): Browser | null {
  if (!ua) return null;
  if (/edg(e|a|ios)?\//i.test(ua)) return "edge";
  if (/opr\/|opera/i.test(ua)) return "opera";
  if (/samsungbrowser/i.test(ua)) return "samsung";
  if (/firefox|fxios/i.test(ua)) return "firefox";
  if (/chrome|crios|chromium/i.test(ua)) return "chrome";
  if (/safari/i.test(ua)) return "safari";
  return "other";
}

/** Dos letras del primer idioma de Accept-Language (`es-BO,es;q=0.9` → `es`). */
function lang(headers: Headers): string | null {
  const first = headers.get("accept-language")?.split(",")[0]?.trim().slice(0, 2).toLowerCase() ?? "";
  return /^[a-z]{2}$/.test(first) ? first : null;
}

/** Host del referrer en minúsculas; se descarta si es el propio sitio o no es una URL. */
function referrer(ref: string | undefined, siteHost: string | null): string | null {
  const host = ref ? URL.parse(ref)?.hostname.toLowerCase() : undefined;
  if (!host || host === siteHost?.split(":")[0]?.toLowerCase()) return null;
  return host;
}

/**
 * Identificador de visitante que rota cada día: hmac(fecha en La Paz | ip | user agent), 16 hex.
 * Sirve para contar visitantes únicos del día; no permite seguir a nadie entre días ni recuperar la IP.
 * La IP es la misma que usa el rate limit (clientIp: la que fija el proxy propio).
 */
function visitor(headers: Headers, ua: string): string {
  const ip = clientIp(headers) ?? "unknown";
  const day = new Date().toLocaleDateString("en-CA", { timeZone: TZ });
  return createHmac("sha256", env.AUTH_SECRET).update(`${day}|${ip}|${ua}`).digest("hex").slice(0, 16);
}

export async function POST(request: Request) {
  // Solo se aceptan eventos enviados desde el propio sitio.
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (origin && URL.parse(origin)?.host !== host) return status(403);
  if (Number(request.headers.get("content-length")) > MAX_EVENT_BODY_BYTES) return status(413);

  const limit = await limitClient(request.headers, "events", { limit: 60, windowSec: 60 });
  if (!limit.ok) return status(429, { "Retry-After": String(limit.retryAfterSec) });

  const text = await request.text();
  if (Buffer.byteLength(text) > MAX_EVENT_BODY_BYTES) return status(413);

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return status(400);
  }
  const parsed = analyticsEventSchema.safeParse(json);
  if (!parsed.success) return status(400);

  // Sin IP ni user agent en claro, sin cookies: nombre, ruta, meta acotada, atributos coarse derivados
  // de las cabeceras (país, dispositivo, navegador, idioma, host del referrer) y un hash diario de visitante.
  const ua = request.headers.get("user-agent")?.trim() ?? "";
  const { name, path, meta, ref } = parsed.data;
  await db.insert(analyticsEvents).values({
    name,
    path,
    meta: meta ?? {},
    visitor: visitor(request.headers, ua),
    country: country(request.headers),
    device: device(ua),
    browser: browser(ua),
    referrer: referrer(ref, host),
    lang: lang(request.headers),
    bot: !ua || BOT_RE.test(ua),
  });
  return status(204);
}
