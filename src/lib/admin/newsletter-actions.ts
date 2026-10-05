"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { campaigns, subscribers } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/content";
import { newsletterFrom, renderBrandEmail, sendEmail } from "@/lib/email";
import { env } from "@/lib/env";
import type { FormState } from "./actions";
import { logActivity } from "./activity";
import { activeRecipients, SUBSCRIBER_STATUS } from "./newsletter";

const text = (form: FormData, name: string) => String(form.get(name) ?? "").replace(/\r\n/g, "\n").trim();
const detail = (id: string) => `/admin/newsletter/campanas/${id}`;
const unsubscribeUrl = (token: string) => `${env.NEXT_PUBLIC_SITE_URL}/newsletter/baja/${token}`;
// Los argumentos ligados con .bind() viajan en la petición: se comprueban como cualquier otra entrada.
const isUuid = (value: unknown): value is string => z.uuid().safeParse(value).success;

/* ───────────────────────────── suscriptores ───────────────────────────── */

/** Cambio de estado desde el listado. Vuelve a la misma página (filtros incluidos) con el aviso de guardado. */
export async function setSubscriberStatus(id: string, form: FormData): Promise<void> {
  const user = await requireUser();
  const status = z.enum(["active", "unsubscribed"]).safeParse(text(form, "status"));
  if (status.success && isUuid(id)) {
    // En la bitácora va el id, nunca el email: el borrado definitivo no debe dejar rastros del suscriptor.
    const [row] = await db.update(subscribers).set({ status: status.data }).where(eq(subscribers.id, id)).returning({ id: subscribers.id });
    if (row) await logActivity(user, "update", "newsletter", id, `suscriptor → ${SUBSCRIBER_STATUS[status.data]}`);
  }
  const back = new URL(text(form, "back") || "/admin/newsletter", "http://admin");
  back.searchParams.set("guardado", "1");
  redirect(back.pathname.startsWith("/admin/newsletter") ? `${back.pathname}${back.search}` : "/admin/newsletter?guardado=1");
}

/** Borrado definitivo (derecho de supresión). Para dejar de escribirle alcanza con la baja. */
export async function deleteSubscriber(id: string): Promise<void> {
  const user = await requireUser();
  if (!isUuid(id)) redirect("/admin/newsletter");
  const [row] = await db.delete(subscribers).where(eq(subscribers.id, id)).returning({ id: subscribers.id });
  if (row) await logActivity(user, "delete", "newsletter", id, "suscriptor");
  redirect("/admin/newsletter?eliminado=1");
}

/* ───────────────────────────── campañas ───────────────────────────── */

const campaignSchema = z.object({
  subject: z.string().trim().min(3, "Mínimo 3 caracteres.").max(150, "Máximo 150 caracteres."),
  body: z.string().trim().min(10, "Contá algo: mínimo 10 caracteres.").max(60000, "Máximo 60.000 caracteres."),
});

function parseCampaign(form: FormData): { data: z.infer<typeof campaignSchema> } | { state: FormState } {
  const parsed = campaignSchema.safeParse({ subject: text(form, "subject"), body: text(form, "body") });
  if (parsed.success) return { data: parsed.data };
  return { state: { error: "Revisá los campos marcados.", errors: Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message])) } };
}

export async function createCampaign(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = parseCampaign(form);
  if ("state" in parsed) return parsed.state;
  let id: string;
  try {
    [{ id }] = await db.insert(campaigns).values({ ...parsed.data, createdBy: user.name || user.email }).returning({ id: campaigns.id });
  } catch {
    console.error("[admin] no se pudo crear la campaña");
    return { error: "No se pudo guardar. Probá de nuevo." };
  }
  await logActivity(user, "create", "campaña", id, parsed.data.subject);
  redirect(`${detail(id)}?guardado=1`);
}

/** Solo los borradores se editan: una campaña enviada es historial. */
export async function updateCampaign(id: string, _prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = parseCampaign(form);
  if ("state" in parsed) return parsed.state;
  if (!isUuid(id)) return { error: "La campaña ya no existe." };
  const [row] = await db
    .update(campaigns)
    .set(parsed.data)
    .where(and(eq(campaigns.id, id), eq(campaigns.status, "draft")))
    .returning({ id: campaigns.id });
  if (!row) return { error: "Esta campaña ya se envió: no se puede editar." };
  await logActivity(user, "update", "campaña", id, parsed.data.subject);
  redirect(`${detail(id)}?guardado=1`);
}

export async function deleteCampaign(id: string): Promise<void> {
  const user = await requireUser();
  if (!isUuid(id)) redirect("/admin/newsletter/campanas");
  const [row] = await db.delete(campaigns).where(eq(campaigns.id, id)).returning({ subject: campaigns.subject });
  if (row) await logActivity(user, "delete", "campaña", id, row.subject);
  redirect("/admin/newsletter/campanas?eliminado=1");
}

/**
 * Manda la campaña al email del admin logueado, con «[Prueba]» en el asunto. Con el driver `log` solo queda en consola.
 * Se usa con useActionState(sendTest.bind(null, id), {}): el estado previo y el form llegan pero no hacen falta.
 */
export async function sendTest(id: string): Promise<FormState> {
  const user = await requireUser();
  const [campaign] = isUuid(id) ? await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1) : [];
  if (!campaign) return { error: "La campaña ya no existe." };
  const { social } = await getSettings();
  const { html, text: plain } = renderBrandEmail({ subject: campaign.subject, bodyMarkdown: campaign.body, unsubscribeUrl: unsubscribeUrl("prueba"), social });
  const result = await sendEmail({ to: user.email, subject: `[Prueba] ${campaign.subject}`, html, text: plain, from: newsletterFrom });
  return result.ok ? { ok: true } : { error: `No se pudo enviar la prueba: ${result.error}.` };
}

const BATCH = 20;
const PAUSE_MS = 300;

/**
 * Envía a todos los suscriptores activos, cada uno con su propio enlace de baja, y fija las cifras.
 * ponytail: el envío corre dentro de la propia server action, de a lotes de 20 con una pausa corta —
 * techo práctico ~2.000 destinatarios por el tiempo de la petición. A más volumen va una cola (tabla de
 * pendientes + cron o worker) que reanude y reintente; y una campaña que quede en «sending» por un corte
 * hay que resolverla a mano en la base.
 */
export async function sendCampaign(id: string): Promise<void> {
  const user = await requireUser();
  if (!isUuid(id)) redirect("/admin/newsletter/campanas");
  // draft → sending es atómico: dos clics seguidos no mandan dos veces.
  const [campaign] = await db
    .update(campaigns)
    .set({ status: "sending" })
    .where(and(eq(campaigns.id, id), eq(campaigns.status, "draft")))
    .returning();
  if (!campaign) redirect(detail(id));
  const recipients = await activeRecipients();
  if (recipients.length === 0) {
    await db.update(campaigns).set({ status: "draft" }).where(eq(campaigns.id, id));
    redirect(detail(id));
  }
  const { social } = await getSettings();
  let sent = 0;
  let failed = 0;
  for (let i = 0; i < recipients.length; i += BATCH) {
    const results = await Promise.all(
      recipients.slice(i, i + BATCH).map((recipient) => {
        const url = unsubscribeUrl(recipient.token);
        const { html, text: plain } = renderBrandEmail({ subject: campaign.subject, bodyMarkdown: campaign.body, unsubscribeUrl: url, social });
        return sendEmail({ to: recipient.email, subject: campaign.subject, html, text: plain, headers: { "List-Unsubscribe": `<${url}>` }, from: newsletterFrom });
      }),
    );
    for (const result of results) {
      if (result.ok) sent++;
      else {
        failed++;
        console.error(`[newsletter] fallo de envío en la campaña ${id}: ${result.error}`); // sin el destinatario
      }
    }
    if (i + BATCH < recipients.length) await new Promise((resolve) => setTimeout(resolve, PAUSE_MS));
  }
  await db.update(campaigns).set({ status: "sent", sentAt: new Date(), recipients: recipients.length, sent, failed }).where(eq(campaigns.id, id));
  await logActivity(user, "send", "campaña", id, `${campaign.subject} · ${sent} de ${recipients.length}`);
  redirect(`${detail(id)}?guardado=1`);
}
