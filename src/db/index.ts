import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env";
import * as schema from "./schema";

// En desarrollo el HMR re-evalúa este módulo: se reutiliza el pool para no agotar conexiones.
const globalForDb = globalThis as unknown as { __burrowPg?: ReturnType<typeof postgres> };

export const client = globalForDb.__burrowPg ?? postgres(env.DATABASE_URL, { max: 10, onnotice: () => {} });
if (env.NODE_ENV !== "production") globalForDb.__burrowPg = client;

export const db = drizzle(client, { schema, casing: "snake_case" });
export type Db = typeof db;
export { schema };
