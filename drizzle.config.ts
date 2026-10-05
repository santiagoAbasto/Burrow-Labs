import { existsSync } from "node:fs";
import { defineConfig } from "drizzle-kit";

// No pisa variables ya definidas: en CI/producción manda el entorno real.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

// DB_TARGET=test apunta a la base de tests (con el sufijo del agente, si tiene uno).
const url =
  process.env.DB_TARGET === "test"
    ? `${process.env.TEST_DATABASE_URL ?? ""}${process.env.TEST_DB_SUFFIX ?? ""}`
    : process.env.DATABASE_URL;

if (!url) throw new Error("Falta DATABASE_URL (o TEST_DATABASE_URL con DB_TARGET=test).");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  casing: "snake_case",
  dbCredentials: { url },
});
