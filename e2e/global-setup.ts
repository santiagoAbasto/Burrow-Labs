import postgres from "postgres";

/** Antes de cada corrida: sin leads, sesiones ni límites de envío de corridas anteriores. */
export default async function globalSetup() {
  const sql = postgres(process.env.TEST_DATABASE_URL!);
  await sql`TRUNCATE rate_limits, leads, analytics_events, sessions, activity_log, subscribers, campaigns`;
  await sql.end();
}
