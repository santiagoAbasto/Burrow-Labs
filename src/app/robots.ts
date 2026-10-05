import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

// Un solo grupo para todos los rastreadores: buscadores (Googlebot, Bingbot) y búsqueda con IA (OAI-SearchBot…) entran
// al contenido público. Bloquear los de entrenamiento (GPTBot, Google-Extended…) es decisión del dueño: ver docs/SEO.md.
// Esto ordena el rastreo, no protege nada: el admin se protege con sesión y responde `X-Robots-Tag: noindex`.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/dev/", "/newsletter/baja/"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
