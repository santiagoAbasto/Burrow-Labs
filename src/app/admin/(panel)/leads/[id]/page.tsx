import { eq } from "drizzle-orm";
import { ArrowLeft, Mail, MessageCircle } from "lucide-react";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { LeadReply } from "@/components/admin/lead-reply";
import { AdminHeading, Alert, Flash, Panel } from "@/components/admin/shell";
import { SubmitButton } from "@/components/admin/state-form";
import { Button } from "@/components/ui/button";
import { Field, Select, Textarea } from "@/components/ui/form";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { deleteLead, replyLead, updateLead } from "@/lib/admin/actions";
import { requireUser } from "@/lib/auth";
import { emailConfigured } from "@/lib/email";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { LEAD_STATUS } from "../page";

export default async function LeadDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  const user = await requireUser();
  const [{ id }, search] = await Promise.all([params, searchParams]);
  if (!z.uuid().safeParse(id).success) notFound();
  const [lead] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  if (!lead) notFound();

  const payload = lead.payload as { goal?: string; context?: string; answers?: Record<string, unknown> };
  const facts: [string, string | null | undefined][] = [
    ["Email", lead.email],
    ["WhatsApp", lead.whatsapp],
    ["Empresa", lead.company],
    ["Tipo de proyecto", lead.projectType],
    ["Qué quiere construir", payload.goal],
    ["Presupuesto", lead.budget],
    ["Plazo", lead.timeline],
    ["Vino desde", [lead.sourcePath, payload.context].filter(Boolean).join(" · ")],
    ["Consentimiento", `Sí, el ${lead.consentAt.toLocaleString("es-BO", { timeZone: "America/La_Paz" })}`],
  ];

  // Lo que pidió, resumido: sirve para que el correo y el WhatsApp no salgan en blanco.
  const firstName = lead.name.trim().split(/\s+/)[0] || lead.name;
  const topic = payload.goal || lead.projectType || (lead.type === "diagnostic" ? "el diagnóstico express" : "tu consulta");
  const quoted = (lead.message || "").trim();
  const signer = user.name || "El equipo";
  const subject = `Re: tu consulta a Burrow Labs`;
  const replyBody = [`Hola ${firstName}:`, "", `Gracias por escribirnos por **${topic}**. Lo leímos con atención y queremos proponerte el siguiente paso.`, "", "- …", "", "¿Te parece si coordinamos una llamada corta esta semana para afinar el alcance?", "", "Un abrazo,", signer].join("\n");
  const mailBody = [`Hola ${firstName}:`, "", `Gracias por escribirnos por ${topic}.`, "", "", `${signer} · Burrow Labs`, "", "— Tu consulta —", ...(quoted ? quoted.split("\n").map((line) => `> ${line}`) : [`> ${topic}`])].join("\n");
  const mailto = `mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailBody)}`;
  const whatsapp = buildWhatsAppUrl(lead.whatsapp, `Hola ${firstName}, soy ${signer} de Burrow Labs. Vimos tu consulta sobre ${topic}${quoted ? ` («${quoted.slice(0, 120)}${quoted.length > 120 ? "…" : ""}»)` : ""}. ¿Te parece si lo charlamos por acá?`);

  return (
    <>
      <AdminHeading
        title={lead.name}
        note={`${lead.type === "contact" ? "Formulario de contacto" : "Diagnóstico express"} · ${lead.createdAt.toLocaleString("es-BO", { timeZone: "America/La_Paz" })}`}
        crumbs={[{ href: "/admin/leads", label: "Consultas" }]}
        actions={
          <>
            <Button href="/admin/leads" variant="secondary">
              <ArrowLeft aria-hidden="true" className="size-4" />
              Volver
            </Button>
            <Button href={mailto} variant="secondary" icon={<Mail />}>
              Abrir en tu correo
            </Button>
            {whatsapp && (
              <Button href={whatsapp} variant="primary" icon={<MessageCircle />}>
                Escribir por WhatsApp
              </Button>
            )}
            <ConfirmDelete what="esta consulta" action={deleteLead.bind(null, lead.id)} />
          </>
        }
      />
      <Flash params={search} />
      <div className="grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid content-start gap-6">
          <div className="admin-panel">
            <h2 className="admin-panel-title">Lo que dejó</h2>
            <dl>
              {facts
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label} className="grid gap-1 border-b border-line py-3 last:border-0 sm:grid-cols-[12rem_1fr]">
                    <dt className="type-mono text-muted">{label}</dt>
                    <dd className="break-words">{value}</dd>
                  </div>
                ))}
            </dl>
            {lead.message && (
              <section className="mt-6">
                <h3 className="type-mono text-muted">{lead.type === "contact" ? "Descripción" : "Qué hacen a mano"}</h3>
                <p className="mt-2 whitespace-pre-wrap">{lead.message}</p>
              </section>
            )}
            {payload.answers && (
              <section className="mt-6">
                <h3 className="type-mono text-muted">Respuestas del diagnóstico</h3>
                <dl className="mt-2 grid gap-2">
                  {Object.entries(payload.answers).map(([key, value]) => (
                    <div key={key} className="grid gap-1 sm:grid-cols-[12rem_1fr]">
                      <dt className="font-medium">{key}</dt>
                      <dd>{Array.isArray(value) ? value.join(", ") : typeof value === "boolean" ? (value ? "Sí" : "No") : String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
          </div>

          <Panel title="Responder desde el panel">
            <p className="mb-4 type-small text-muted">
              Sale a <strong>{lead.email}</strong> como un correo simple, sin imágenes ni botones, para que llegue a la bandeja principal y no a Promociones. La firma usa tu nombre de «Mi cuenta». El texto ya viene armado con lo que pidió; ajustalo y enviá. Queda anotado acá y la consulta pasa a «Contactado».
            </p>
            {!emailConfigured && (
              <Alert kind="info" className="mb-4">
                Sin proveedor de correo (EMAIL_DRIVER=log): el envío solo queda en la consola del servidor. Mientras tanto, usá «Abrir en tu correo» o WhatsApp.
              </Alert>
            )}
            <LeadReply action={replyLead.bind(null, lead.id)} subject={subject} message={replyBody} />
          </Panel>
        </div>

        <form action={updateLead.bind(null, lead.id)} className="admin-panel grid content-start gap-5 lg:sticky lg:top-6">
          <h2 className="admin-panel-title">Seguimiento</h2>
          <Field label="Estado">
            <Select name="status" defaultValue={lead.status}>
              {Object.entries(LEAD_STATUS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Notas internas" hint="Solo las ve el equipo. Qué se habló, qué se cotizó, próximos pasos.">
            <Textarea name="notes" defaultValue={lead.notes} rows={8} />
          </Field>
          <div>
            <SubmitButton />
          </div>
        </form>
      </div>
    </>
  );
}
