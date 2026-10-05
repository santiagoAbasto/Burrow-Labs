"use server";

import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { getSettings } from "./content";
import { newsletterFrom, renderBrandEmail, sendEmail } from "./email";
import { env } from "./env";
import { limitClient } from "./rate-limit";

// Contrato del formulario público de newsletter. Campos del form: email, consent ("on"), t (Date.now() al
// renderizar; trampa de tiempo), fax (honeypot, debe ir vacío) y source (ruta desde la que se suscribió).
export type NewsletterState = { ok: boolean; message?: string; errors?: Record<string, string> };

const GENERIC = "No pudimos anotarte. Probá de nuevo en un momento.";
// Un único mensaje de éxito, sea un alta nueva, un email que ya estaba o uno dado de baja: la
// respuesta no revela si una dirección está (o estuvo) en la lista.
const SUCCESS = "¡Listo! Cuando el burro desentierre algo bueno, te lo mandamos.";
const MIN_FILL_MS = 1500; // trampa de tiempo: una persona no escribe su email en menos
const emailSchema = z.string().trim().toLowerCase().pipe(z.email().max(254));

const text = (form: FormData, key: string) => {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
};

/**
 * Suscribe un email. Trampa de tiempo y honeypot como en los leads; el límite (5 por hora por
 * visitante) cuenta solo los envíos válidos, no las correcciones del formulario. Sin doble opt-in.
 * Un email dado de baja NO se reactiva desde acá: cualquiera podría volver a suscribir a quien pidió
 * no recibir más correos. Lo reactiva un administrador desde el panel, a pedido de la persona.
 */
export async function subscribeNewsletter(_prev: NewsletterState, form: FormData): Promise<NewsletterState> {
  const started = Number(text(form, "t") || NaN); // sin `t` (Number(null) sería 0) también cae
  if (!Number.isFinite(started) || Date.now() - started < MIN_FILL_MS) return { ok: false, message: GENERIC };
  if (text(form, "fax")) return { ok: false, message: GENERIC }; // el honeypot no se le explica al bot

  const errors: Record<string, string> = {};
  const email = emailSchema.safeParse(text(form, "email"));
  if (!email.success) errors.email = "Revisá el email.";
  if (form.get("consent") !== "on") errors.consent = "Necesitamos tu OK para escribirte.";
  if (!email.success || Object.keys(errors).length) return { ok: false, message: "Revisá los campos marcados.", errors };

  const limit = await limitClient(await headers(), "newsletter", { limit: 5, windowSec: 3600 });
  if (!limit.ok) return { ok: false, message: "Recibimos varios intentos seguidos. Probá de nuevo más tarde." };

  const sourcePath = text(form, "source").slice(0, 200) || null;
  const token = randomBytes(24).toString("base64url");
  let created: boolean;
  try {
    // Un solo INSERT: si el email ya existe (activo o dado de baja) no se toca la fila.
    const rows = await db.insert(subscribers).values({ email: email.data, sourcePath, token }).onConflictDoNothing({ target: subscribers.email }).returning({ id: subscribers.id });
    created = rows.length > 0;
  } catch {
    console.error("[newsletter] no se pudo guardar una suscripción"); // sin datos personales en logs
    return { ok: false, message: GENERIC };
  }
  // La bienvenida va solo a las altas nuevas; sin bloquear la respuesta (si falla, la suscripción ya quedó).
  if (created) void sendWelcome(email.data, token).catch(() => {});
  return { ok: true, message: SUCCESS };
}

const WELCOME_BODY = `Ya estás en la lista. Gracias por el OK.

**Qué vas a recibir:** lo que el burro desentierra en el Lab —artículos, herramientas y novedades de Burrow Labs— y, de vez en cuando, algo que construimos y queremos mostrarte.

**Cada cuánto:** solo cuando hay algo que vale la pena. Nada de un correo por día.

**Si te cansás:** en cada correo va un enlace para darte de baja, sin preguntas.`;

/** Correo de bienvenida con el enlace de baja del suscriptor. Con EMAIL_DRIVER=log solo queda en consola. */
async function sendWelcome(to: string, token: string): Promise<void> {
  const unsubscribeUrl = `${env.NEXT_PUBLIC_SITE_URL}/newsletter/baja/${token}`;
  let social: Awaited<ReturnType<typeof getSettings>>["social"] | undefined;
  try {
    social = (await getSettings()).social;
  } catch {
    // sin redes antes que sin bienvenida (fuera de Next, unstable_cache no tiene caché incremental)
  }
  const subject = "Bienvenido a la madriguera";
  const { html, text: plain } = renderBrandEmail({ subject, bodyMarkdown: WELCOME_BODY, preheader: "Ya estás en la lista: te contamos qué vas a recibir y cada cuánto.", cta: { label: "Pasar por el Lab", href: `${env.NEXT_PUBLIC_SITE_URL}/lab` }, social, unsubscribeUrl });
  const result = await sendEmail({ to, subject, html, text: plain, headers: { "List-Unsubscribe": `<${unsubscribeUrl}>` }, from: newsletterFrom });
  if (!result.ok) console.error(`[newsletter] no se pudo enviar la bienvenida: ${result.error}`); // sin el destinatario
}

/** Baja por el enlace del correo. Idempotente: un token ya dado de baja sigue siendo «ok». */
export async function unsubscribe(token: string): Promise<"ok" | "invalid"> {
  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{16,64}$/.test(token)) return "invalid";
  const [row] = await db.update(subscribers).set({ status: "unsubscribed" }).where(eq(subscribers.token, token)).returning({ id: subscribers.id });
  return row ? "ok" : "invalid";
}
