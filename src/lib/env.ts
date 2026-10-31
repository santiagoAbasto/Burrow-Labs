import "server-only";
import { z } from "zod";

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    DATABASE_URL: z.string().min(1),
    NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
    AUTH_SECRET: z.string().optional(),
    ADMIN_EMAIL: z.string().optional(),
    ADMIN_PASSWORD: z.string().optional(),
    STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
    S3_ENDPOINT: z.url().optional(),
    S3_REGION: z.string().default("auto"),
    S3_BUCKET: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_PUBLIC_URL: z.url().optional(),
    // Los dos IDs se interpolan en scripts del navegador (consent-analytics.tsx): formato estricto, nada más.
    NEXT_PUBLIC_GA_ID: z.string().regex(/^G-[A-Z0-9]{4,20}$/, "ID de medición de GA4: G- y letras mayúsculas o números").optional(),
    NEXT_PUBLIC_CLARITY_ID: z.string().regex(/^[a-z0-9]{6,20}$/, "ID del proyecto de Clarity: letras minúsculas y números").optional(),
    NEXT_PUBLIC_GSC_VERIFICATION: z.string().optional(),
    SHOW_DEMO_CONTENT: z.enum(["true", "false"]).default("false"),
    // Correo (newsletter y respuestas): `log` solo registra en consola; `smtp` envía por un servidor SMTP
    // (Google Workspace en producción); `resend` y `brevo` envían por su API con su clave.
    EMAIL_DRIVER: z.enum(["log", "smtp", "resend", "brevo"]).default("log"),
    EMAIL_API_KEY: z.string().optional(),
    // Remitente, «Nombre <email>». Sin valor por defecto: no se envía desde una dirección que nadie confirmó.
    EMAIL_FROM: z.string().optional(),
    // Remitente de la newsletter (bienvenida y campañas). Sin valor, salen de EMAIL_FROM.
    EMAIL_FROM_NEWSLETTER: z.string().optional(),
    // SMTP: 465 es TLS implícito; cualquier otro puerto exige STARTTLS. Usuario y contraseña van juntos o no van
    // (un relay que autoriza por IP no los pide).
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(465),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    // IndexNow (Bing y otros): 8–128 caracteres hexadecimales o guiones. Sin clave no se avisa nada.
    INDEXNOW_KEY: z
      .string()
      .regex(/^[a-zA-Z0-9-]{8,128}$/, "8 a 128 caracteres: letras, números o guiones")
      .optional(),
    // Token que comparte con Burrow Prospect para leer consultas y fichas (/api/prospect/sync). Sin token, la ruta no existe.
    PROSPECT_API_TOKEN: z.string().min(32, "mínimo 32 caracteres (openssl rand -hex 32)").optional(),
  })
  .superRefine((v, ctx) => {
    const missing = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });
    if (v.NODE_ENV === "production" && (v.AUTH_SECRET?.length ?? 0) < 32)
      missing("AUTH_SECRET", "obligatoria en producción, mínimo 32 caracteres (openssl rand -hex 32)");
    if (v.STORAGE_DRIVER === "s3")
      for (const k of ["S3_ENDPOINT", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_PUBLIC_URL"] as const)
        if (!v[k]) missing(k, "obligatoria con STORAGE_DRIVER=s3");
    const emailKeys = { log: [], smtp: ["SMTP_HOST", "EMAIL_FROM"], resend: ["EMAIL_API_KEY", "EMAIL_FROM"], brevo: ["EMAIL_API_KEY", "EMAIL_FROM"] } as const;
    for (const k of emailKeys[v.EMAIL_DRIVER]) if (!v[k]) missing(k, `obligatoria con EMAIL_DRIVER=${v.EMAIL_DRIVER}`);
    if (Boolean(v.SMTP_USER) !== Boolean(v.SMTP_PASSWORD)) missing(v.SMTP_USER ? "SMTP_PASSWORD" : "SMTP_USER", "SMTP_USER y SMTP_PASSWORD van juntas");
  });

export function parseEnv(source: Record<string, string | undefined>) {
  // Las variables vacías de .env (`CLAVE=`) cuentan como no definidas.
  const clean = Object.fromEntries(Object.entries(source).filter(([, v]) => v !== ""));
  const parsed = schema.safeParse(clean);
  if (!parsed.success) {
    // Solo nombres y motivos: nunca valores.
    const detail = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Variables de entorno inválidas:\n${detail}`);
  }
  const v = parsed.data;
  return {
    ...v,
    NEXT_PUBLIC_SITE_URL: v.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, ""),
    S3_PUBLIC_URL: v.S3_PUBLIC_URL?.replace(/\/+$/, ""),
    // Fuera de producción se tolera un secreto de desarrollo para no bloquear el arranque.
    AUTH_SECRET: v.AUTH_SECRET ?? "dev-only-insecure-secret",
    // Los borradores demo nunca se muestran en producción, diga lo que diga la variable.
    SHOW_DEMO_CONTENT: v.SHOW_DEMO_CONTENT === "true" && v.NODE_ENV !== "production",
  };
}

export type Env = ReturnType<typeof parseEnv>;
export const env: Env = parseEnv(process.env);
