import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { ListToolbar, Pagination } from "@/components/admin/list-toolbar";
import { RowLink } from "@/components/admin/row-link";
import { AdminHeading, EmptyState, Flash } from "@/components/admin/shell";
import { db } from "@/db";
import { projectSheets } from "@/db/schema";
import { createFicha } from "@/lib/admin/ficha-actions";
import { PAGE_SIZE } from "@/lib/admin/data";
import { STATUS_LABEL, type SheetStatus } from "@/lib/ficha";
import { requireUser } from "@/lib/auth";

export default async function FichasAdmin({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireUser();
  const search = await searchParams;
  const status = search.estado && search.estado in STATUS_LABEL ? (search.estado as SheetStatus) : undefined;
  const q = search.q?.trim();
  const clauses: SQL[] = [];
  if (status) clauses.push(eq(projectSheets.status, status));
  if (q) {
    const pattern = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
    clauses.push(or(ilike(projectSheets.empresa, pattern), ilike(projectSheets.code, pattern))!);
  }
  const where = clauses.length ? and(...clauses) : undefined;

  const [[{ total }], byStatus] = await Promise.all([
    db.select({ total: count() }).from(projectSheets).where(where),
    db.select({ status: projectSheets.status, n: count() }).from(projectSheets).groupBy(projectSheets.status),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(search.pagina) || 1), pages);
  const rows = await db
    .select({ id: projectSheets.id, code: projectSheets.code, empresa: projectSheets.empresa, status: projectSheets.status, priority: projectSheets.priority, updatedAt: projectSheets.updatedAt })
    .from(projectSheets)
    .where(where)
    .orderBy(desc(projectSheets.updatedAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);
  const counts = Object.fromEntries(byStatus.map((row) => [row.status, row.n]));

  return (
    <>
      <AdminHeading
        eyebrow="Captación"
        title="Fichas de proyecto"
        note="El relevamiento de cada proyecto: datos, alcance técnico, requerimientos y peticiones del cliente. Se completa acá y se comparte por enlace o PDF para confirmar."
        actions={
          <form action={createFicha}>
            <button type="submit" className="btn" data-variant="primary" data-size="md">
              Nueva ficha
            </button>
          </form>
        }
      />
      <Flash params={search} />
      <ListToolbar base="/admin/fichas" q={q} status={status} counts={counts} statuses={STATUS_LABEL} total={total} />
      {rows.length === 0 ? (
        <EmptyState title={q || status ? "Ninguna ficha coincide." : "Todavía no hay fichas."}>{q || status ? "" : "Creá la primera con «Nueva ficha»: se abre el editor y podés compartirla cuando quieras."}</EmptyState>
      ) : (
        <>
          <div className="admin-sheet">
            <table className="admin-table min-w-[40rem]">
              <thead>
                <tr>
                  {["Empresa", "Código", "Estado", "Prioridad", "Actualizada"].map((heading) => (
                    <th key={heading} scope="col">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <RowLink href={`/admin/fichas/${row.id}`}>{row.empresa || "(sin nombre)"}</RowLink>
                    </td>
                    <td className="type-small text-muted">{row.code || "—"}</td>
                    <td>{STATUS_LABEL[row.status]}</td>
                    <td>{row.priority}</td>
                    <td className="type-small text-muted">{row.updatedAt.toLocaleDateString("es-BO", { timeZone: "America/La_Paz" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination base="/admin/fichas" page={page} pages={pages} params={{ q, estado: status }} />
        </>
      )}
    </>
  );
}
