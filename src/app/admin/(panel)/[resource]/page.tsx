import { ChevronDown, ExternalLink, Plus } from "lucide-react";
import { notFound } from "next/navigation";
import { HelpBox } from "@/components/admin/help-box";
import { ListToolbar, Pagination, STATUS_LABEL } from "@/components/admin/list-toolbar";
import { RowLink } from "@/components/admin/row-link";
import { navGroupFor } from "@/lib/admin/nav";
import { AdminHeading, EmptyState, Flash } from "@/components/admin/shell";
import { Button } from "@/components/ui/button";
import { setResourceStatus } from "@/lib/admin/actions";
import { countByStatus, listRows } from "@/lib/admin/data";
import { getResource } from "@/lib/admin/resources";
import { requireUser } from "@/lib/auth";

const EXTRA: Record<string, { href: string; label: string }> = {
  proyectos: { href: "/admin/categorias-de-proyectos", label: "Categorías" },
  blog: { href: "/admin/categorias-del-blog", label: "Categorías" },
};
const EMPTY: Record<string, string> = {
  proyectos: "Cargá el primer caso con el problema, la solución y el resultado. Los demo nunca se publican.",
  clientes: "Solo los clientes que autorizaron aparecer se muestran en el sitio.",
  testimonios: "Un testimonio sale al público únicamente con autorización del autor.",
  blog: "El Lab arranca con el primer artículo publicado.",
};

function cell(value: unknown, name: string) {
  if (name === "status")
    return (
      <span className="status-pill" data-status={String(value)}>
        {STATUS_LABEL[String(value)] ?? String(value)}
      </span>
    );
  if (typeof value === "boolean") return value ? <span className="font-semibold">Sí</span> : <span className="text-muted">—</span>;
  if (value instanceof Date) return value.toLocaleDateString("es-BO", { timeZone: "America/La_Paz" });
  if (name === "priceAmount" && value !== null && value !== undefined) return <span className="tabular-nums">{Number(value).toLocaleString("es-BO")}</span>;
  return value === null || value === undefined || value === "" ? <span className="text-muted">—</span> : String(value);
}

export default async function ResourceList({ params, searchParams }: { params: Promise<{ resource: string }>; searchParams: Promise<Record<string, string>> }) {
  await requireUser();
  const [{ resource: key }, search] = await Promise.all([params, searchParams]);
  const resource = getResource(key);
  if (!resource) notFound();
  const status = search.estado && search.estado in STATUS_LABEL ? search.estado : undefined;
  const [{ rows, total, page, pages }, counts] = await Promise.all([listRows(resource, { q: search.q, status, page: Number(search.pagina) || 1 }), countByStatus(resource)]);
  const pk = resource.pk ?? "id";
  const base = `/admin/${key}`;
  const hasStatus = resource.fields.some((field) => field.name === "status");
  const filtering = Boolean(search.q || status);

  return (
    <>
      <AdminHeading
        eyebrow={navGroupFor(`/admin/${key}`)}
        title={resource.label}
        note={resource.note}
        actions={
          <>
            {EXTRA[key] && (
              <Button href={EXTRA[key].href} variant="secondary">
                {EXTRA[key].label}
              </Button>
            )}
            <Button href={`${base}/nuevo`} icon={<Plus />}>
              Nuevo {resource.singular}
            </Button>
          </>
        }
      />
      <Flash params={search} />
      <div className="mb-6">
        <HelpBox topic={key} />
      </div>
      <ListToolbar base={base} q={search.q} status={status} counts={counts} total={total} />
      {rows.length === 0 ? (
        filtering ? (
          <EmptyState title="Nada coincide con esa búsqueda." action={<Button href={base} variant="secondary">Ver todo</Button>} />
        ) : (
          <EmptyState title={`Todavía no hay ${resource.label.toLowerCase()}.`} action={<Button href={`${base}/nuevo`} icon={<Plus />}>Crear el primero</Button>}>
            {EMPTY[key]}
          </EmptyState>
        )
      ) : (
        <div className="admin-sheet">
          <table className="admin-table min-w-[40rem]">
            <thead>
              <tr>
                {resource.columns.map((col) => (
                  <th key={col.name} scope="col">
                    {col.label}
                  </th>
                ))}
                <th scope="col">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const id = encodeURIComponent(String(row[pk]));
                const href = resource.href?.(row);
                return (
                  <tr key={id}>
                    {resource.columns.map((col, i) => (
                      <td key={col.name}>
                        {i === 0 ? (
                          <RowLink href={`${base}/${id}`}>{cell(row[col.name], col.name)}</RowLink>
                        ) : col.name === "status" && hasStatus ? (
                          <form action={setResourceStatus.bind(null, key, String(row[pk]))} className="inline-flex">
                            <label className="sr-only" htmlFor={`status-${id}`}>
                              Estado
                            </label>
                            <span className="select">
                              <select id={`status-${id}`} name="status" defaultValue={String(row.status)} className="status-select" data-status={String(row.status)} data-autosubmit>
                                {Object.entries(STATUS_LABEL).map(([value, label]) => (
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
                        ) : (
                          cell(row[col.name], col.name)
                        )}
                      </td>
                    ))}
                    <td className="text-right whitespace-nowrap">
                      {href && (
                        <a href={href} target="_blank" rel="noreferrer" className="inline-flex min-h-8 items-center gap-1 type-small text-muted hover:text-link">
                          <ExternalLink aria-hidden="true" className="size-3.5" />
                          Ver
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <Pagination base={base} page={page} pages={pages} params={{ q: search.q, estado: status }} />
    </>
  );
}
