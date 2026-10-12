import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const gaEnabled = !!process.env.NEXT_PUBLIC_GA_ID;
const clarityEnabled = !!process.env.NEXT_PUBLIC_CLARITY_ID;
const s3PublicUrl = process.env.S3_PUBLIC_URL ? new URL(process.env.S3_PUBLIC_URL) : null;

// CSP sin nonce: el porqué está en docs/SECURITY.md.
const csp = [
  "default-src 'self'",
  // 'unsafe-inline' lo necesitan los scripts inline de arranque de Next; 'unsafe-eval' solo el modo dev de React.
  // GA4 sin Google Ads ni Signals (guía de CSP de Google) y Clarity (su documentación): solo si tienen ID.
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}${gaEnabled ? " https://www.googletagmanager.com" : ""}${clarityEnabled ? " https://*.clarity.ms" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob:${s3PublicUrl ? ` ${s3PublicUrl.origin}` : ""}${gaEnabled ? " https://*.google-analytics.com https://www.googletagmanager.com" : ""}${clarityEnabled ? " https://*.clarity.ms https://c.bing.com" : ""}`,
  "font-src 'self' data:",
  // En desarrollo, el HMR de Next usa WebSocket (no todos los navegadores lo incluyen en 'self').
  `connect-src 'self'${isProd ? "" : " ws://localhost:* ws://127.0.0.1:*"}${gaEnabled ? " https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com" : ""}${clarityEnabled ? " https://*.clarity.ms https://c.bing.com" : ""}`,
  "worker-src 'self' blob:",
  "media-src 'self'",
  "object-src 'none'",
  "frame-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // Solo en producción: en localhost por HTTP no aplica. Sin includeSubDomains ni preload a propósito:
  // obligarían HTTPS en todos los subdominios (correo web, panel del hosting, staging) durante dos años,
  // sin vuelta atrás desde el servidor. Se revisa cuando el propietario confirme sus subdominios.
  ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=63072000" }] : []),
];

const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];

const nextConfig: NextConfig = {
  // Cada agente/proceso paralelo usa su propio directorio de build (ver AGENTS.md).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  // El botón «N» de Next en desarrollo confunde en el panel; los errores siguen apareciendo igual.
  devIndicators: false,
  experimental: {
    // Lo que se genera a pedido (un 404 por cada /proyectos/<slug inventado>, una entrada de datos por
    // cada valor distinto) queda solo en la caché en memoria, que tiene tope (cacheMaxMemorySize, 50 MB),
    // y no en disco, donde no lo tenía: cualquier visitante podía llenar el disco pidiendo slugs al azar.
    // Lo prerenderizado en el build se sigue sirviendo desde disco. Consecuencias en docs/SECURITY.md.
    isrFlushToDisk: false,
    // Tope del cuerpo de una server action (por defecto 1 MB): lo necesita la subida de imágenes del
    // panel. Coherente con MAX_UPLOAD_* en src/lib/storage.ts y con client_max_body_size del proxy.
    serverActions: { bodySizeLimit: "10mb" },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    localPatterns: [
      { pathname: "/media/**", search: "" },
      { pathname: "/brand/**", search: "" },
    ],
    remotePatterns: s3PublicUrl ? [new URL(`${s3PublicUrl.href.replace(/\/+$/, "")}/**`)] : [],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: noindex },
      { source: "/api/:path*", headers: noindex },
      // Prefetch de React Server Components: el proxy compartido convierte la cabecera RSC en un 307 a `?_rsc`,
      // así que Google termina rastreando esas URLs como páginas normales (22 en Search Console al 12/10/2026).
      // El canonical ya las descarta; el noindex evita que gasten rastreo.
      { source: "/:path*", has: [{ type: "query", key: "_rsc" }], headers: noindex },
      // Los assets de marca no llevan hash en el nombre: un día de caché y revalidación en segundo plano.
      { source: "/brand/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
    ];
  },
};

export default nextConfig;
