import { randomInt, randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { afterAll, describe, expect, it, vi } from "vitest";

// La IP de la petición, por test: cada escenario de rate limit usa la suya.
const request = vi.hoisted(() => ({ ip: "203.0.0.1" }));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-forwarded-for": request.ip }) }));

import { client, db } from "@/db";
import { rateLimits, subscribers } from "@/db/schema";
import { subscribeNewsletter, unsubscribe } from "./newsletter-actions";
import { clientKey } from "./rate-limit";

const emails: string[] = [];
const ips: string[] = [];
const newEmail = () => {
  const email = `qa-${randomUUID()}@example.com`;
  emails.push(email);
  return email;
};
const newIp = () => {
  request.ip = `203.${randomInt(256)}.${randomInt(256)}.${randomInt(256)}`; // pública: una 10.x sería la del proxy, no la de un visitante
  ips.push(request.ip);
};
const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
};
const valid = (email: string, extra: Record<string, string> = {}) => form({ email, consent: "on", t: String(Date.now() - 2000), fax: "", source: "/lab", ...extra });
const prev = { ok: false };
const find = (email: string) => db.select().from(subscribers).where(eq(subscribers.email, email));

afterAll(async () => {
  if (emails.length) await db.delete(subscribers).where(inArray(subscribers.email, emails));
  if (ips.length) await db.delete(rateLimits).where(inArray(rateLimits.key, ips.map((ip) => clientKey(new Headers({ "x-forwarded-for": ip }), "newsletter"))));
  await client.end();
});

const SUCCESS = { ok: true, message: "¡Listo! Cuando el burro desentierre algo bueno, te lo mandamos." };

describe("subscribeNewsletter", () => {
  it("acepta y guarda el email en minúsculas con token de baja; si ya estaba, responde lo mismo sin duplicar", async () => {
    newIp();
    const email = newEmail();
    expect(await subscribeNewsletter(prev, valid(`  ${email.toUpperCase()} `))).toEqual(SUCCESS);
    const [row] = await find(email);
    expect(row).toMatchObject({ email, status: "active", sourcePath: "/lab" });
    expect(row.token).toMatch(/^[A-Za-z0-9_-]{32}$/);

    // La respuesta no revela que la dirección ya estaba en la lista.
    expect(await subscribeNewsletter(prev, valid(email, { source: "/planes" }))).toEqual(SUCCESS);
    expect(await find(email)).toEqual([row]);
  });

  it("rechaza sin consentimiento y con email inválido, con el error en su campo", async () => {
    newIp();
    const email = newEmail();
    const noConsent = await subscribeNewsletter(prev, valid(email, { consent: "" }));
    expect(noConsent.ok).toBe(false);
    expect(noConsent.errors).toEqual({ consent: "Necesitamos tu OK para escribirte." });
    expect(await find(email)).toHaveLength(0);

    const badEmail = await subscribeNewsletter(prev, valid("no-es-un-email"));
    expect(badEmail.ok).toBe(false);
    expect(badEmail.errors?.email).toBeTruthy();
  });

  it("el honeypot y la trampa de tiempo devuelven el mensaje genérico sin guardar", async () => {
    newIp();
    const email = newEmail();
    const bot = await subscribeNewsletter(prev, valid(email, { fax: "555" }));
    expect(bot).toEqual({ ok: false, message: "No pudimos anotarte. Probá de nuevo en un momento." });
    expect(await subscribeNewsletter(prev, valid(email, { t: String(Date.now()) }))).toEqual(bot);
    expect(await subscribeNewsletter(prev, valid(email, { t: "" }))).toEqual(bot);
    expect(await find(email)).toHaveLength(0);
  });

  it("no reactiva a quien se dio de baja, y responde igual que a un alta nueva", async () => {
    newIp();
    const email = newEmail();
    await subscribeNewsletter(prev, valid(email));
    const [before] = await find(email);
    expect(await unsubscribe(before.token)).toBe("ok");
    expect((await find(email))[0].status).toBe("unsubscribed");
    expect(await unsubscribe(before.token)).toBe("ok"); // idempotente

    // Un tercero (o un bot) vuelve a cargar el email: mismo mensaje, pero la baja se respeta.
    expect(await subscribeNewsletter(prev, valid(email, { source: "/planes" }))).toEqual(SUCCESS);
    const [after] = await find(email);
    expect(after).toMatchObject({ status: "unsubscribed", sourcePath: "/lab", token: before.token });
    expect(after.consentAt.getTime()).toBe(before.consentAt.getTime());
  });

  it("limita a 5 suscripciones válidas por hora por cliente; los envíos inválidos no gastan cupo", async () => {
    newIp();
    const invalid = valid("no-es-un-email");
    for (let i = 0; i < 8; i++) expect((await subscribeNewsletter(prev, invalid)).message).toBe("Revisá los campos marcados.");
    for (let i = 0; i < 5; i++) expect(await subscribeNewsletter(prev, valid(newEmail()))).toEqual(SUCCESS);
    const blocked = newEmail();
    expect((await subscribeNewsletter(prev, valid(blocked))).message).toMatch(/varios intentos/);
    expect(await find(blocked)).toHaveLength(0);
  });
});

describe("unsubscribe", () => {
  it("un token desconocido, vacío o desmedido es inválido", async () => {
    expect(await unsubscribe(`no-existe-${randomUUID()}`)).toBe("invalid");
    expect(await unsubscribe("")).toBe("invalid");
    expect(await unsubscribe("x".repeat(65))).toBe("invalid");
    // llega de la URL o de un argumento ligado: cualquier cosa que no sea un token se descarta sin consultar
    for (const bad of [undefined, null, 42, { token: "x" }, ["x"], "con espacio y ' comilla", "\u0000"]) expect(await unsubscribe(bad as never)).toBe("invalid");
  });
});
