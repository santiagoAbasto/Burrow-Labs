import "server-only";
import { env } from "./env";

// IndexNow: aviso a los buscadores que lo soportan (Bing, Yandex, Naver, Seznam; Google no participa) de que
// una URL se creó, cambió o se eliminó. Protocolo: https://www.indexnow.org/documentation
const ENDPOINT = "https://api.indexnow.org/indexnow";

/** Cuerpo del aviso: solo rutas internas, sin repetir. La clave se sirve en `/indexnow-key.txt` (raíz: cubre todo el sitio). */
export function indexNowBody(siteUrl: string, key: string, paths: (string | null | undefined)[]) {
  const internal = paths.filter((path): path is string => typeof path === "string" && /^\/(?![/\\])[^\s?#]*$/.test(path) && !path.includes("undefined"));
  return {
    host: new URL(siteUrl).host,
    key,
    keyLocation: `${siteUrl}/indexnow-key.txt`,
    urlList: [...new Set(internal)].map((path) => `${siteUrl}${path}`),
  };
}

/** Avisa que cambiaron estas rutas. Sin `INDEXNOW_KEY` o fuera de producción no hace nada; nunca lanza. */
export function notifyIndexNow(...paths: (string | null | undefined)[]): void {
  if (!env.INDEXNOW_KEY || env.NODE_ENV !== "production") return;
  const body = indexNowBody(env.NEXT_PUBLIC_SITE_URL, env.INDEXNOW_KEY, paths);
  if (!body.urlList.length) return;
  // ponytail: un intento, sin cola ni reintentos — si importara no perder ningún aviso, encolar y reintentar con backoff.
  void fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(5000),
  }).catch(() => {});
}
