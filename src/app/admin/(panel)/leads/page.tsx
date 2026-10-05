import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { ChevronDown, Download } from "lucide-react";
import { ListToolbar, Pagination } from "@/components/admin/list-toolbar";
import { RowLink } from "@/components/admin/row-link";
import { HelpBox } from "@/components/admin/help-box";
import { AdminHeading, EmptyState, Flash } from "@/components/admin/shell";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { setLeadStatus } from "@/lib/admin/actions";
import { PAGE_SIZE } from "@/lib/admin/data";
import { requireUser } from "@/lib/auth";

export const LEAD_STATUS: Record<string, string> = { new: "Nuevo", contacted: "Contactado", won: "Ganado", lost: "Perdido", spam: "Spam" };

export default async function LeadsAdmin({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireUser();
  const search = await searchParams;
  const status = search.estado && search.estado in LEAD_STATUS ? (search.estado as "new") : undefined;
  const q = search.q?.trim();
  const clauses: SQL[] = [];
  if (status) clauses.push(eq(leads.status, status));
  if (q) {
    const pattern = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
    clauses.push(or(ilike(leads.name, pattern), ilike(leads.company, pattern), ilike(leads.email, pattern), ilike(leads.projectType, pattern))!);
  }
  const where = clauses.length ? and(...clauses) : undefined;
  const [[{ total }], byStatus] = await Promise.all([
    db.select({ total: count() }).from(leads).where(where),
    db.select({ status: leads.status, n: count() }).from(leads).groupBy(leads.status),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(search.pagina) || 1), pages);
  const rows = await db
    .select()
    .from(leads)
    .where(where)
    .orderBy(desc(leads.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);
  const counts = Object.fromEntries(byStatus.map((row) => [row.status, row.n]));
  const back = `/admin/leads${Object.keys(search).length ? `?${new URLSearchParams(search)}` : ""}`;

  return (
    <>
      <AdminHeading eyebrow="Captación"
        title="Consultas"
        note="Todo lo que llega desde el sitio: el formulario de contacto y el diagnóstico express. Entrá a una para responder por correo o WhatsApp con el texto ya armado. Solo se guardan con consentimiento; se borran a pedido."
        actions={
          <Button href="/admin/leads/export" variant="secondary" icon={<Download />}>
            Exportar CSV
          </Button>
        }
      />
      <Flash params={search} />
      <div className="mb-6">
        <HelpBox topic="leads" />
      </div>
      <ListToolbar base="/admin/leads" q={q} status={status} counts={counts} statuses={LEAD_STATUS} total={total} />
      {rows.length === 0 ? (
        <EmptyState title={q || status ? "Ningún lead coincide." : "Todavía no llegó ninguna consulta."}>{q || status ? "" : "Cuando alguien complete el formulario de contacto o el diagnóstico, aparece acá con todo lo que escribió."}</EmptyState>
      ) : (
        <div className="admin-sheet">
          <table className="admin-table min-w-[48rem]">
            <thead>
              <tr>
                {["Nombre", "Tipo", "Proyecto", "Contacto", "Estado", "Fecha"].map((heading) => (
                  <th key={heading} scope="col">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((lead) => (
                <tr key={lead.id} className={lead.status === "new" ? "font-medium" : undefined}>
                  <td>
                    <RowLink href={`/admin/leads/${lead.id}`}>{lead.name}</RowLink>
                    {lead.company && <span className="block type-small text-muted">{lead.company}</span>}
                  </td>
                  <td>{lead.type === "contact" ? "Contacto" : "Diagnóstico"}</td>
                  <td>{lead.projectType ?? <span className="text-muted">—</span>}</td>
                  <td className="type-small">
                    <a href={`mailto:${lead.email}`} className="hover:text-link">
                      {lead.email}
                    </a>
                    {lead.whatsapp && <span className="block text-muted">{lead.whatsapp}</span>}
                  </td>
                  <td>
                    <form action={setLeadStatus.bind(null, lead.id)} className="inline-flex">
                      <input type="hidden" name="back" value={back} />
                      <label className="sr-only" htmlFor={`lead-status-${lead.id}`}>
                        Estado de {lead.name}
                      </label>
                      <span className="select">
                        <select id={`lead-status-${lead.id}`} name="status" defaultValue={lead.status} className="status-select" data-status={lead.status} data-autosubmit>
                          {Object.entries(LEAD_STATUS).map(([value, label]) => (
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
                  <td className="type-small whitespace-nowrap text-muted">{lead.createdAt.toLocaleString("es-BO", { timeZone: "America/La_Paz", dateStyle: "short", timeStyle: "short" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination base="/admin/leads" page={page} pages={pages} params={{ q, estado: status }} />
    </>
  );
}
