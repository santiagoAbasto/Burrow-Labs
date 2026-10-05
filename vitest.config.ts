import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

// Los tests SIEMPRE corren contra la base de tests, nunca contra la de desarrollo.
// TEST_DB_SUFFIX permite que cada agente use su propia base (ver AGENTS.md).
const testDatabaseUrl = process.env.TEST_DATABASE_URL
  ? `${process.env.TEST_DATABASE_URL}${process.env.TEST_DB_SUFFIX ?? ""}`
  : "postgres://falta-TEST_DATABASE_URL";

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": fromRoot("./src"),
      // `server-only` lanza fuera de un bundle de servidor de Next: en tests se usa su variante vacía.
      "server-only": fromRoot("./node_modules/server-only/empty.js"),
    },
  },
  test: {
    environment: "node",
    exclude: ["e2e/**", "node_modules/**", ".next*/**"],
    // Con un proveedor real en .env.local, los tests de newsletter mandarían bienvenidas de verdad.
    env: { DATABASE_URL: testDatabaseUrl, EMAIL_DRIVER: "log" },
  },
});
