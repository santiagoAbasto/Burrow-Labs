import { ChevronDown, Download, Plus } from "lucide-react";
import Image from "next/image";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { HelpBox } from "@/components/admin/help-box";
import { ListToolbar, Pagination } from "@/components/admin/list-toolbar";
import { AdminHeading, EmptyState, Flash } from "@/components/admin/shell";
import { Button } from "@/components/ui/button";
import { countSubscribersByStatus, listSubscribers, SUBSCRIBER_STATUS, subscriberStats, type SubscriberStatus } from "@/lib/admin/newsletter";
import { deleteSubscriber, setSubscriberStatus } from "@/lib/admin/newsletter-actions";
import { requireUser } from "@/lib/auth";

export default async function SubscribersAdmin({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireUser();
  const search = await searchParams;
  const status = search.estado && search.estado in SUBSCRIBER_STATUS ? (search.estado as SubscriberStatus) : undefined;
  const q = search.q?.trim();
  const [{ rows, total, page, pages }, counts, stats] = await Promise.all([listSubscribers({ q, status, page: Number(search.pagina) || 1 }), countSubscribersByStatus(), subscriberStats()]);
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("estado", status);
  if (page > 1) params.set("pagina", String(page));
  const back = `/admin/newsletter${params.toString() ? `?${params}` : ""}`;

  return (
    <>
      <AdminHeading
        eyebrow="Captación"
        title="Suscriptores"
        note={`Quienes dejaron su email para recibir novedades. ${stats.active} ${stats.active === 1 ? "activo" : "activos"} · ${stats.last30} ${stats.last30 === 1 ? "alta" : "altas"} en los últimos 30 días. Solo con su OK; se dan de baja desde cada correo o desde acá.`}
        actions={
          <>
            <Button href="/admin/newsletter/export" variant="secondary" icon={<Download />}>
              Exportar CSV
            </Button>
            <Button href="/admin/newsletter/campanas/nueva" icon={<Plus />}>
              Nueva campaña
            </Button>
          </>
        }
      />
      <Flash params={search} saved="Guardado." deleted="Suscriptor eliminado." />
      <div className="mb-6">
        <HelpBox topic="newsletter" />
      </div>
      <ListToolbar base="/admin/newsletter" q={q} status={status} counts={counts} statuses={SUBSCRIBER_STATUS} total={total} />
      {rows.length === 0 ? (
        <EmptyState title={q || status ? "Ningún suscriptor coincide." : "Todavía nadie se suscribió."}>{q || status ? "" : "Cuando alguien deje su email en el formulario de la newsletter del sitio, aparece acá."}</EmptyState>
      ) : (
        <div className="admin-sheet">
          <table className="admin-table min-w-[44rem]">
            <thead>
              <tr>
                {["Email", "Estado", "Origen", "Alta"].map((heading) => (
                  <th key={heading} scope="col">
                    {heading}
                  </th>
                ))}
                <th scope="col">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <a href={`mailto:${row.email}`} className="row-link">
                      <Image src="/brand/badge.svg" alt="" width={20} height={20} className="row-link-badge" aria-hidden="true" />
                      <span className="min-w-0 truncate">{row.email}</span>
                    </a>
                  </td>
                  <td>
                    <form action={setSubscriberStatus.bind(null, row.id)} className="inline-flex">
                      <input type="hidden" name="back" value={back} />
                      <label className="sr-only" htmlFor={`subscriber-status-${row.id}`}>
                        Estado de {row.email}
                      </label>
                      <span className="select">
                        <select id={`subscriber-status-${row.id}`} name="status" defaultValue={row.status} className="status-select" data-status={row.status} data-autosubmit>
                          {Object.entries(SUBSCRIBER_STATUS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="select-chevron" aria-hidden="true" />
                      </span>
                      <noscript>
                        <button type="submit" className="btn ml-1" data-variant="secondary" data-size="sm">
                          Aplicar
                        </button>
                      </noscript>
                    </form>
                  </td>
                  <td className="type-small text-muted">{row.sourcePath ?? "—"}</td>
                  <td className="type-small whitespace-nowrap text-muted">{row.createdAt.toLocaleString("es-BO", { timeZone: "America/La_Paz", dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="text-right">
                    <ConfirmDelete what={row.email} action={deleteSubscriber.bind(null, row.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination base="/admin/newsletter" page={page} pages={pages} params={{ q, estado: status }} />
    </>
  );
}
