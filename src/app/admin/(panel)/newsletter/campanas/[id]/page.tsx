import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { z } from "zod";
import { CampaignAside } from "@/components/admin/campaign-aside";
import { CampaignForm } from "@/components/admin/campaign-form";
import { SendCampaignButton, SendTestForm } from "@/components/admin/campaign-send";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { AdminHeading, Alert, Flash, Panel } from "@/components/admin/shell";
import { Button } from "@/components/ui/button";
import { CAMPAIGN_STATUS, countSubscribersByStatus, getCampaign } from "@/lib/admin/newsletter";
import { deleteCampaign, sendCampaign, sendTest, updateCampaign } from "@/lib/admin/newsletter-actions";
import { requireUser } from "@/lib/auth";
import { emailConfigured, renderCampaignEmail } from "@/lib/email";
import { env } from "@/lib/env";

const CRUMBS = [{ href: "/admin/newsletter/campanas", label: "Campañas" }];
const when = (date: Date) => date.toLocaleString("es-BO", { timeZone: "America/La_Paz", dateStyle: "long", timeStyle: "short" });

export default async function CampaignDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  const user = await requireUser();
  const [{ id }, search] = await Promise.all([params, searchParams]);
  if (!z.uuid().safeParse(id).success) notFound();
  const campaign = await getCampaign(id);
  if (!campaign) notFound();
  const draft = campaign.status === "draft";
  const active = draft ? ((await countSubscribersByStatus()).active ?? 0) : 0;

  const heading = (
    <AdminHeading
      title={campaign.subject}
      note={draft ? `Borrador · creado por ${campaign.createdBy || "—"} el ${when(campaign.createdAt)}.` : `${CAMPAIGN_STATUS[campaign.status]}${campaign.sentAt ? ` el ${when(campaign.sentAt)}` : ""} · por ${campaign.createdBy || "—"}.`}
      crumbs={CRUMBS}
      actions={
        <>
          <Button href="/admin/newsletter/campanas" variant="secondary">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Volver
          </Button>
          <ConfirmDelete what="esta campaña" action={deleteCampaign.bind(null, campaign.id)} />
        </>
      }
    />
  );
  const flash = <Flash params={search} saved={draft ? "Guardado." : "Campaña enviada."} />;

  if (draft) {
    return (
      <>
        {heading}
        {flash}
        <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="grid gap-6 xl:order-1">
            <Panel title="Campaña">
              <CampaignForm action={updateCampaign.bind(null, campaign.id)} campaign={campaign} />
            </Panel>
            <Panel title="Enviar">
              <div className="grid gap-6">
                <SendTestForm action={sendTest.bind(null, campaign.id)} email={user.email} configured={emailConfigured} />
                <div className="grid gap-3 border-t border-line pt-6">
                  <p className="type-small text-muted">Guardá antes de enviar: se manda lo que está guardado, a todos los suscriptores activos, cada uno con su enlace de baja.</p>
                  <div>
                    <SendCampaignButton action={sendCampaign.bind(null, campaign.id)} recipients={active} />
                  </div>
                </div>
              </div>
            </Panel>
          </div>
          <CampaignAside />
        </div>
      </>
    );
  }

  const { html } = renderCampaignEmail({ subject: campaign.subject, bodyMarkdown: campaign.body, unsubscribeUrl: `${env.NEXT_PUBLIC_SITE_URL}/newsletter/baja/…` });
  const figures: [string, string][] = [
    ["Destinatarios", String(campaign.recipients)],
    ["Enviados", String(campaign.sent)],
    ["Fallidos", String(campaign.failed)],
    ["Fecha de envío", campaign.sentAt ? when(campaign.sentAt) : "—"],
  ];
  return (
    <>
      {heading}
      {flash}
      {campaign.status === "sending" && <Alert kind="info" className="mb-6">Se está enviando. Las cifras aparecen cuando termina.</Alert>}
      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid gap-6 xl:order-1">
          <Panel title="Vista previa">
            <iframe srcDoc={html} sandbox="" title="Vista previa del correo tal como se envió" className="min-h-[36rem] w-full rounded-md border border-line bg-white" />
          </Panel>
        </div>
        <div className="grid content-start gap-5 max-xl:order-first xl:order-2 xl:sticky xl:top-6">
          <Panel title="Cifras">
            <dl className="grid gap-3">
              {figures.map(([label, value]) => (
                <div key={label} className="admin-tile grid gap-0.5 px-4 py-3">
                  <dt className="type-mono text-muted">{label}</dt>
                  <dd className="font-bold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
            {campaign.failed > 0 && <p className="mt-4 type-small text-muted">Los fallidos son correos que el proveedor rechazó; el detalle queda en los registros del servidor.</p>}
          </Panel>
        </div>
      </div>
    </>
  );
}
