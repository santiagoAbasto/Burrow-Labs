// Corre ANTES del build de los E2E: el build prerenderiza páginas con lo que haya en la base de test.
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import postgres from "postgres";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const url = process.env.TEST_DATABASE_URL;
if (!url) throw new Error("Falta TEST_DATABASE_URL");
const env = { ...process.env, DATABASE_URL: url };

execSync("pnpm exec drizzle-kit migrate", { env: { ...env, DB_TARGET: "test" }, stdio: "inherit" });
execSync("pnpm db:seed", { env, stdio: "inherit" });

const sql = postgres(url);
// Estado conocido para las pruebas, sin tocar el contenido sembrado.
await sql`DELETE FROM faqs WHERE question LIKE 'E2E%'`;
await sql`UPDATE site_settings SET value = jsonb_set(value, '{whatsappPhone}', '""') WHERE key = 'contact'`;
await sql`UPDATE plans SET price_amount = 250 WHERE slug = 'turbo'`;
await sql.end();
