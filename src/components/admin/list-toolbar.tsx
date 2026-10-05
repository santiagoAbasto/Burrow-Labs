import { Search } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

export const STATUS_LABEL: Record<string, string> = { draft: "Borrador", published: "Publicado", archived: "Archivado" };

/** Buscador + filtros por estado de un listado. Todo por URL: se puede compartir y volver atrás. */
export function ListToolbar({ base, q, status, counts, statuses = STATUS_LABEL, total }: { base: string; q?: string; status?: string; counts: Record<string, number>; statuses?: Record<string, string>; total: number }) {
  const all = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const link = (value: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (value) params.set("estado", value);
    const query = params.toString();
    return query ? `${base}?${query}` : base;
  };
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <form action={base} role="search" className="relative min-w-64 flex-1 sm:max-w-sm">
        {status && <input type="hidden" name="estado" value={status} />}
        <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
        <label htmlFor="list-q" className="sr-only">
          Buscar
        </label>
        <input id="list-q" name="q" type="search" defaultValue={q} placeholder="Buscar…" className="control min-h-10 w-full pl-9" />
      </form>
      {Object.keys(counts).length > 0 && (
        <nav aria-label="Filtrar por estado">
          <ul className="flex flex-wrap gap-1.5">
            {[["", "Todos", all], ...Object.entries(statuses).map(([value, label]) => [value, label, counts[value] ?? 0] as const)].map(([value, label, n]) => (
              <li key={String(value)}>
                <Link href={link(String(value))} aria-current={(status ?? "") === value ? "page" : undefined} className={cn("badge type-mono min-h-9 gap-1.5 px-3", (status ?? "") === value && "bg-accent text-accent-fg")}>
                  {label}
                  <span className="opacity-70">{n}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <p className="ml-auto type-small text-muted">
        {total} {total === 1 ? "resultado" : "resultados"}
      </p>
    </div>
  );
}

export function Pagination({ base, page, pages, params }: { base: string; page: number; pages: number; params: Record<string, string | undefined> }) {
  if (pages <= 1) return null;
  const link = (n: number) => {
    const search = new URLSearchParams(Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1])));
    search.set("pagina", String(n));
    return `${base}?${search}`;
  };
  return (
    <nav aria-label="Páginas" className="mt-6 flex items-center justify-between gap-4">
      <p className="type-small text-muted">
        Página {page} de {pages}
      </p>
      <div className="flex gap-2">
        {page > 1 && (
          <Link href={link(page - 1)} className="btn" data-variant="secondary" data-size="sm">
            ← Anterior
          </Link>
        )}
        {page < pages && (
          <Link href={link(page + 1)} className="btn" data-variant="secondary" data-size="sm">
            Siguiente →
          </Link>
        )}
      </div>
    </nav>
  );
}
