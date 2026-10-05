import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// Los E2E corren contra un build de producción y la base de TEST (nunca la de desarrollo).
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const PORT = 3210;
const database = process.env.TEST_DATABASE_URL;
if (!database) throw new Error("Falta TEST_DATABASE_URL en .env.local");

export default defineConfig({
  testDir: "e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: false,
  workers: 1, // comparten una base: se ejecutan en serie
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  timeout: 45_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    // La base se prepara antes del build; el build siempre parte de cero para no arrastrar caché.
    command: `pnpm exec tsx e2e/prepare-db.mts && rm -rf .next-e2e && pnpm exec next build && pnpm exec next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 240_000,
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_DIST_DIR: ".next-e2e",
      DATABASE_URL: database,
      NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
      STORAGE_DRIVER: "local",
      NEXT_PUBLIC_GA_ID: "",
    },
  },
});
