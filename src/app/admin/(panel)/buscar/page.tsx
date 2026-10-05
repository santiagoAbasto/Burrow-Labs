import { ilike, or } from "drizzle-orm";
import Link from "next/link";
import { STATUS_LABEL } from "@/components/admin/list-toolbar";
import { RowLink } from "@/components/admin/row-link";
import { AdminHeading, EmptyState, Panel } from "@/components/admin/shell";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { listRows } from "@/lib/admin/data";
import { getResource } from "@/lib/admin/resources";
import { requireUser } from "@/lib/auth";

const SEARCHABLE = ["servicios", "proyectos", "clientes", "testimonios", "planes", "faq", "blog", "seo"];

/** Búsqueda global: cada recurso por su campo de título y columnas de texto; los leads por nombre, empresa y email. */
export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireUser();
  const q = ((await searchParams).q ?? "").trim();
  const groups = q
    ? await Promise.all(
        SEARCHABLE.map(async (key) => {
          const resource = getResource(key)!;
          const { rows, total } = await listRows(resource, { q });
          return { key, resource, rows: rows.slice(0, 8), total };
        }),
      )
    : [];
  const pattern = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
  const leadRows = q ? await db.select({ id: leads.id, name: leads.name, company: leads.company, email: leads.email, status: leads.status }).from(leads).where(or(ilike(leads.name, pattern), ilike(leads.company, pattern), ilike(leads.email, pattern))).limit(8) : [];
  const total = groups.reduce((sum, group) => sum + group.total, 0) + leadRows.length;

  return (
    <>
      <AdminHeading title={q ? `Resultados para «${q}»` : "Buscar"} note={q ? `${total} ${total === 1 ? "coincidencia" : "coincidencias"} en todo el panel.` : "Escribí algo en el buscador de la izquierda."} />
      {q && total === 0 && <EmptyState title="No encontré nada con ese texto.">Probá con otra palabra o revisá el listado de cada sección.</EmptyState>}
      <div className="grid gap-8">
        {groups
          .filter((group) => group.rows.length > 0)
          .map((group) => (
            <Panel key={group.key} title={`${group.resource.label} · ${group.total}`}>
              <ul>
                {group.rows.map((row) => {
                  const id = String(row[group.resource.pk ?? "id"]);
                  return (
                    <li key={id} className="border-b border-line last:border-0">
                      <div className="flex min-h-11 flex-wrap items-center gap-3 py-1.5">
                        <RowLink href={`/admin/${group.key}/${encodeURIComponent(id)}`}>{String(row[group.resource.titleField] ?? id)}</RowLink>
                        {"status" in row && (
                          <span className="status-pill" data-status={String(row.status)}>
                            {STATUS_LABEL[String(row.status)] ?? String(row.status)}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              {group.total > group.rows.length && (
                <Link href={`/admin/${group.key}?q=${encodeURIComponent(q)}`} className="mt-2 inline-block type-small font-semibold hover:text-link">
                  Ver los {group.total} en {group.resource.label} →
                </Link>
              )}
            </Panel>
          ))}
        {leadRows.length > 0 && (
          <Panel title={`Leads · ${leadRows.length}`}>
            <ul>
              {leadRows.map((lead) => (
                <li key={lead.id} className="border-b border-line last:border-0">
                  <div className="flex min-h-11 flex-wrap items-center gap-x-3 py-1.5">
                    <RowLink href={`/admin/leads/${lead.id}`}>{lead.name}</RowLink>
                    {lead.company && <span className="text-muted">{lead.company}</span>}
                    <span className="type-small text-muted">{lead.email}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>
    </>
  );
}
