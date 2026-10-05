import { randomUUID } from "node:crypto";
import { inArray, like } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";
import { client, db } from "@/db";
import { activityLog, analyticsEvents, leads, subscribers } from "@/db/schema";
import { LEGAL } from "@/db/seed/legal";
import { monthsBefore, purgeExpired, RETENTION_MONTHS } from "./retention";

const tag = randomUUID().slice(0, 8);
// «Hoy» de la prueba, muy anterior a cualquier fila real de la base de tests: la depuración solo puede
// alcanzar las filas que crea este archivo.
const NOW = new Date("2020-01-15T12:00:00Z");
const at = (iso: string) => new Date(`${iso}T12:00:00Z`);

afterAll(async () => {
  await db.delete(leads).where(like(leads.name, `Retención ${tag}%`));
  await db.delete(subscribers).where(like(subscribers.email, `%-${tag}@example.test`));
  await db.delete(analyticsEvents).where(like(analyticsEvents.path, `/retencion-${tag}%`));
  await db.delete(activityLog).where(like(activityLog.title, `Retención ${tag}%`));
  await client.end();
});

describe("purgeExpired", () => {
  it("los plazos son los que publica la política de privacidad", () => {
    const section = LEGAL.privacy.split("## Cuánto tiempo los conservamos")[1].split("## Tus derechos")[0];
    expect(section).toContain(`**Consultas (contacto y diagnóstico):** ${RETENTION_MONTHS.leads} meses`);
    expect(section).toContain("**Consultas que marcamos como spam:** un mes");
    expect(RETENTION_MONTHS.spamLeads).toBe(1);
    expect(section).toContain(`durante ${RETENTION_MONTHS.unsubscribed} meses`);
    expect(section).toContain(`**Estadísticas propias:** ${RETENTION_MONTHS.analytics} meses`);
    expect(section).toContain(`**Registro interno del panel:** ${RETENTION_MONTHS.activityLog} meses`);
  });

  it("borra lo vencido de cada tabla y deja lo que está dentro del plazo", async () => {
    const lead = (label: string, updatedAt: Date, status: "new" | "won" | "spam" = "new") => ({
      type: "contact" as const,
      name: `Retención ${tag} ${label}`,
      email: `lead-${label}-${tag}@example.test`,
      consent: true,
      status,
      updatedAt,
    });
    await db.insert(leads).values([
      lead("vencida", at("2018-01-10")), // más de 24 meses sin movimiento
      lead("ganada-vencida", at("2017-06-01"), "won"),
      lead("vigente", at("2018-02-01")),
      lead("spam-vencido", at("2019-12-10"), "spam"), // spam: 1 mes
      lead("spam-vigente", at("2019-12-20"), "spam"),
    ]);
    const subscriber = (label: string, status: "active" | "unsubscribed", updatedAt: Date) => ({
      email: `${label}-${tag}@example.test`,
      status,
      token: `${label}-${tag}`,
      updatedAt,
    });
    await db.insert(subscribers).values([
      subscriber("baja-vencida", "unsubscribed", at("2019-01-10")), // baja de hace más de 12 meses
      subscriber("baja-vigente", "unsubscribed", at("2019-02-01")),
      subscriber("activo-antiguo", "active", at("2015-01-01")), // un suscriptor activo no vence
    ]);
    await db.insert(analyticsEvents).values([
      { name: "page_view", path: `/retencion-${tag}/vencido`, createdAt: at("2018-11-10") }, // más de 14 meses
      { name: "page_view", path: `/retencion-${tag}/vigente`, createdAt: at("2018-12-01") },
    ]);
    await db.insert(activityLog).values([
      { action: "update", entity: "leads", title: `Retención ${tag} vencido`, createdAt: at("2019-01-10") }, // más de 12 meses
      { action: "update", entity: "leads", title: `Retención ${tag} vigente`, createdAt: at("2019-02-01") },
    ]);

    // La depuración recorre toda la base de tests (compartida): la verdad son las filas de este archivo;
    // de los conteos solo se exige que incluyan las propias.
    const counts = await purgeExpired(NOW);
    expect(counts.leads).toBeGreaterThanOrEqual(3);
    expect(counts.subscribers).toBeGreaterThanOrEqual(1);
    expect(counts.analytics).toBeGreaterThanOrEqual(1);
    expect(counts.activityLog).toBeGreaterThanOrEqual(1);

    const names = (await db.select({ name: leads.name }).from(leads).where(like(leads.name, `Retención ${tag}%`))).map((row) => row.name.split(" ").at(-1));
    expect(names.sort()).toEqual(["spam-vigente", "vigente"]);
    const emails = await db
      .select({ email: subscribers.email })
      .from(subscribers)
      .where(inArray(subscribers.email, ["baja-vencida", "baja-vigente", "activo-antiguo"].map((label) => `${label}-${tag}@example.test`)));
    expect(emails.map((row) => row.email.split("-" + tag)[0]).sort()).toEqual(["activo-antiguo", "baja-vigente"]);
    const paths = await db.select({ path: analyticsEvents.path }).from(analyticsEvents).where(like(analyticsEvents.path, `/retencion-${tag}%`));
    expect(paths.map((row) => row.path)).toEqual([`/retencion-${tag}/vigente`]);
    const titles = await db.select({ title: activityLog.title }).from(activityLog).where(like(activityLog.title, `Retención ${tag}%`));
    expect(titles.map((row) => row.title)).toEqual([`Retención ${tag} vigente`]);

  });

  it("el corte de «n meses antes» no se pasa al mes siguiente cuando el mes destino es más corto", () => {
    const day = (date: Date) => [date.getFullYear(), date.getMonth() + 1, date.getDate()];
    expect(day(monthsBefore(new Date(2026, 2, 31, 12), 1))).toEqual([2026, 2, 28]); // 31 de marzo − 1 mes
    expect(day(monthsBefore(new Date(2024, 2, 31, 12), 1))).toEqual([2024, 2, 29]); // bisiesto
    expect(day(monthsBefore(new Date(2026, 3, 30, 12), 14))).toEqual([2025, 2, 28]); // 30 de abril − 14 meses
    expect(day(monthsBefore(new Date(2026, 0, 15, 12), 24))).toEqual([2024, 1, 15]);
    expect(day(monthsBefore(new Date(2026, 0, 31, 12), 12))).toEqual([2025, 1, 31]);
  });
});
