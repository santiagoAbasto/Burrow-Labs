import { Plus } from "lucide-react";
import { HelpBox } from "@/components/admin/help-box";
import { RowLink } from "@/components/admin/row-link";
import { AdminHeading, EmptyState, Flash } from "@/components/admin/shell";
import { Button } from "@/components/ui/button";
import { CAMPAIGN_STATUS, listCampaigns } from "@/lib/admin/newsletter";
import { requireUser } from "@/lib/auth";

const when = (date: Date) => date.toLocaleString("es-BO", { timeZone: "America/La_Paz", dateStyle: "short", timeStyle: "short" });

export default async function CampaignsAdmin({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireUser();
  const [rows, search] = await Promise.all([listCampaigns(), searchParams]);
  const newButton = (
    <Button href="/admin/newsletter/campanas/nueva" icon={<Plus />}>
      Nueva campaña
    </Button>
  );

  return (
    <>
      <AdminHeading eyebrow="Captación" title="Campañas" note="Correos a todos los suscriptores activos. Un borrador se edita y se prueba; una vez enviada queda en solo lectura con sus cifras." actions={newButton} />
      <Flash params={search} saved="Guardado." deleted="Campaña eliminada." />
      <div className="mb-6">
        <HelpBox topic="campanas" />
      </div>
      {rows.length === 0 ? (
        <EmptyState title="Todavía no hay campañas." action={newButton}>
          Escribí la primera: asunto, cuerpo en Markdown, una prueba a tu email y a enviar.
        </EmptyState>
      ) : (
        <div className="admin-sheet">
          <table className="admin-table min-w-[44rem]">
            <thead>
              <tr>
                {["Asunto", "Estado", "Destinatarios", "Enviados / fallidos", "Fecha"].map((heading) => (
                  <th key={heading} scope="col">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((campaign) => (
                <tr key={campaign.id}>
                  <td>
                    <RowLink href={`/admin/newsletter/campanas/${campaign.id}`}>{campaign.subject}</RowLink>
                    {campaign.createdBy && <span className="block type-small text-muted">{campaign.createdBy}</span>}
                  </td>
                  <td>
                    <span className="status-pill" data-status={campaign.status}>
                      {CAMPAIGN_STATUS[campaign.status]}
                    </span>
                  </td>
                  <td className="tabular-nums">{campaign.status === "draft" ? <span className="text-muted">—</span> : campaign.recipients}</td>
                  <td className="tabular-nums">
                    {campaign.status === "draft" ? (
                      <span className="text-muted">—</span>
                    ) : (
                      <>
                        {campaign.sent} / <span className={campaign.failed ? "font-semibold" : "text-muted"}>{campaign.failed}</span>
                      </>
                    )}
                  </td>
                  <td className="type-small whitespace-nowrap text-muted">{when(campaign.sentAt ?? campaign.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
