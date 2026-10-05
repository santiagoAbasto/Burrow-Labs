// Compuerta de salida a producción. Revisa el entorno y la base que se le pasen y falla si algo impide publicar:
//   pnpm exec tsx scripts/go-live-check.mts            (usa .env.local si existe)
//   DATABASE_URL=… NEXT_PUBLIC_SITE_URL=… pnpm exec tsx scripts/go-live-check.mts   (contra producción)
// Nunca imprime valores de secretos ni datos personales: solo si están, cuántos hay y qué falta.
// Sale con código 1 si hay algún BLOQUEO.
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";

if (existsSync(".env.local") && !process.env.DATABASE_URL) process.loadEnvFile(".env.local");
registerHooks({
  resolve: (specifier, context, nextResolve) =>
    nextResolve(specifier, specifier === "server-only" ? { ...context, conditions: [...context.conditions, "react-server"] } : context),
});

const DOMAIN = "https://burrowlabs.com.bo";
const PENDING = /\[(PENDIENTE DEL PROPIETARIO|DATO POR CONFIRMAR)|Pendiente de revisión legal|\[CONTENIDO DEMO/i;
const QA = /(e2e|test|qa|demo|example\.(com|org|net)|mailinator)/i;

type Level = "BLOQUEO" | "AVISO" | "OK";
const rows: { level: Level; area: string; detail: string }[] = [];
const check = (area: string, ok: boolean, detail: string, level: Exclude<Level, "OK"> = "BLOQUEO") => rows.push({ level: ok ? "OK" : level, area, detail });

async function main() {
  const env = process.env;

  // Entorno
  check("Dominio", env.NEXT_PUBLIC_SITE_URL === DOMAIN, `NEXT_PUBLIC_SITE_URL debe ser ${DOMAIN} (canonical, sitemap y Open Graph salen de ahí)`);
  check("Secreto de sesión", (env.AUTH_SECRET?.length ?? 0) >= 32, "AUTH_SECRET con 32+ caracteres (openssl rand -hex 32)");
  check("Contenido demo", env.SHOW_DEMO_CONTENT !== "true", "SHOW_DEMO_CONTENT no puede ser true");
  const driver = env.EMAIL_DRIVER ?? "log";
  check("Correo", driver !== "log", "EMAIL_DRIVER=log: los correos (bienvenida, campañas, respuestas) no salen", "AVISO");
  if (driver !== "log") {
    if (driver === "smtp") check("Correo: servidor SMTP", Boolean(env.SMTP_HOST), "SMTP_HOST obligatoria con EMAIL_DRIVER=smtp");
    else check("Correo: clave", Boolean(env.EMAIL_API_KEY), "EMAIL_API_KEY obligatoria con resend/brevo");
    check("Correo: remitente", Boolean(env.EMAIL_FROM), "EMAIL_FROM con una dirección del dominio verificado", "AVISO");
  }
  check("Admin inicial", !env.ADMIN_PASSWORD, "ADMIN_PASSWORD sigue en el entorno: quitarla después del primer arranque", "AVISO");
  check("Search Console", true, env.NEXT_PUBLIC_GSC_VERIFICATION ? "meta de verificación configurada" : "sin meta de verificación (alcanza con el TXT de DNS de la propiedad de dominio)");
  check("GA4", true, env.NEXT_PUBLIC_GA_ID ? "GA4 configurado: revisar banner y política de cookies" : "sin GA4: el sitio no instala cookies de visitantes");

  // Base
  const { sql } = await import("drizzle-orm");
  const { client, db } = await import("../src/db/index");
  const schema = await import("../src/db/schema");
  try {
    const settings = new Map((await db.select().from(schema.siteSettings)).map((row) => [row.key, row.value as Record<string, unknown>]));
    const legal = (settings.get("legal") ?? {}) as Record<string, string>;
    for (const [key, label] of [["privacy", "Privacidad"], ["terms", "Términos"], ["cookies", "Cookies"]] as const) {
      const text = legal[key] ?? "";
      check(`Legal: ${label}`, text.trim().length > 200 && !PENDING.test(text), "texto sin completar: quedan marcadores [PENDIENTE DEL PROPIETARIO] o el aviso de borrador (docs/LEGAL-STATUS.md)");
    }
    const contact = (settings.get("contact") ?? {}) as Record<string, unknown>;
    check("Contacto: email", Boolean(contact.email), "falta el email de contacto público (Configuración › Contacto): los textos legales lo necesitan para ejercer derechos");
    check("Contacto: WhatsApp", !contact.whatsappEnabled || Boolean(contact.whatsappPhone), "el botón de WhatsApp está activo sin número: lleva a /contacto", "AVISO");
    const social = Object.values((settings.get("social") ?? {}) as Record<string, string>).filter(Boolean);
    check("Redes", social.length > 0, "sin perfiles cargados: sameAs queda vacío", "AVISO");
    const seo = (settings.get("seo") ?? {}) as Record<string, string>;
    check("SEO: entidad", Boolean(seo.siteName && seo.description), "faltan nombre o descripción del sitio (Configuración › SEO)");

    const allSettings = JSON.stringify([...settings.entries()].filter(([key]) => key !== "legal"));
    check("Configuración sin pendientes", !PENDING.test(allSettings), "hay marcadores pendientes en la configuración");

    const projects = await db.select({ slug: schema.projects.slug, isDemo: schema.projects.isDemo, status: schema.projects.status, body: sql<string>`${schema.projects.summary} || ${schema.projects.problem} || ${schema.projects.result}` }).from(schema.projects);
    check("Casos", projects.some((project) => project.status === "published"), "no hay casos publicados");
    check("Casos demo", !projects.some((project) => project.isDemo || PENDING.test(project.body)), "hay casos demo o con placeholders");

    const count = (table: Parameters<typeof db.$count>[0]) => db.$count(table);

    const users = await db.select({ email: schema.users.email }).from(schema.users);
    check("Usuarios", users.length > 0, "no hay ningún administrador: definir ADMIN_EMAIL y ADMIN_PASSWORD y correr pnpm db:seed");
    check("Usuarios de prueba", !users.some((user) => QA.test(user.email)), `hay ${users.filter((user) => QA.test(user.email)).length} usuario(s) con email de prueba`);

    const leads = await db.select({ email: schema.leads.email, name: schema.leads.name }).from(schema.leads);
    check("Consultas de prueba", !leads.some((lead) => QA.test(lead.email) || QA.test(lead.name)), `hay ${leads.filter((lead) => QA.test(lead.email) || QA.test(lead.name)).length} consulta(s) de prueba`);
    check("Consultas", leads.length === 0, `${leads.length} consulta(s) en la base: en una base nueva de producción debe haber 0`, "AVISO");

    const subscribers = await db.select({ email: schema.subscribers.email }).from(schema.subscribers);
    check("Suscriptores de prueba", !subscribers.some((subscriber) => QA.test(subscriber.email)), `hay ${subscribers.filter((subscriber) => QA.test(subscriber.email)).length} suscriptor(es) de prueba`);
    check("Suscriptores", subscribers.length === 0, `${subscribers.length} suscriptor(es): en una base nueva debe haber 0`, "AVISO");

    check("Campañas", (await count(schema.campaigns)) === 0, "hay campañas cargadas: en una base nueva debe haber 0", "AVISO");
    check("Analítica previa", (await count(schema.analyticsEvents)) === 0, "hay eventos de analítica anteriores al lanzamiento: el dashboard no arranca limpio", "AVISO");
    check("Bitácora previa", (await count(schema.activityLog)) === 0, "hay entradas de bitácora anteriores al lanzamiento", "AVISO");
    check("Secciones del Home", (await count(schema.homeSections)) >= 14, "faltan secciones del Home: correr pnpm db:seed");
  } finally {
    await client.end();
  }

  const order: Level[] = ["BLOQUEO", "AVISO", "OK"];
  rows.sort((a, b) => order.indexOf(a.level) - order.indexOf(b.level));
  for (const row of rows) console.log(`${row.level.padEnd(8)} ${row.area.padEnd(30)} ${row.level === "OK" ? "" : row.detail}`);
  const blockers = rows.filter((row) => row.level === "BLOQUEO").length;
  const warnings = rows.filter((row) => row.level === "AVISO").length;
  console.log(`\n${blockers ? "NO LISTO PARA PRODUCCIÓN" : "SIN BLOQUEOS DE DATOS NI ENTORNO"}: ${blockers} bloqueo(s), ${warnings} aviso(s).`);
  if (blockers) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
