import { Check, ExternalLink, Info, LogOut, Menu, TriangleAlert } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { Mascot } from "@/components/brand/mascot";
import { logout } from "@/lib/admin/actions";
import { cn } from "@/lib/cn";
import { AutoSubmit } from "./autosubmit";
import { AdminNav, AdminSearch } from "./nav";

/** Admin: rápido, limpio y sin animaciones decorativas. El burro aparece solo como guía en los estados vacíos. */
export function AdminShell({ user, counts, children }: { user: { name: string; email: string }; counts?: Record<string, number>; children: ReactNode }) {
  const who = user.name || user.email;
  return (
    <div data-stratum="surface" className="admin min-h-svh lg:grid lg:grid-cols-[16rem_1fr]">
      <aside data-stratum="lab" className="flex flex-col lg:sticky lg:top-0 lg:h-svh lg:overflow-y-auto">
        <div className="px-4 py-4">
          <Logo />
        </div>
        <details className="group border-t border-line lg:hidden">
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 font-semibold">
            <Menu aria-hidden="true" className="size-5" />
            Menú
          </summary>
          <div className="grid gap-4 px-3 pb-4">
            <AdminSearch />
            <AdminNav counts={counts} />
          </div>
        </details>
        <div className="grid gap-4 px-3 pb-4 max-lg:hidden">
          <AdminSearch />
          <AdminNav counts={counts} />
        </div>
        <div className="mt-auto grid gap-1 border-t border-line p-4 max-lg:hidden">
          <Link href="/admin/cuenta" className="flex items-center gap-3 rounded-md hover:text-accent">
            <Mascot variant="badge" sizes="40px" className="w-10 shrink-0" />
            <span className="min-w-0">
              <span className="block truncate font-semibold">{who}</span>
              <span className="block truncate type-small text-muted">{user.email}</span>
            </span>
          </Link>
          <Link href="/" target="_blank" className="mt-2 flex min-h-9 items-center gap-2 type-small hover:text-accent">
            <ExternalLink aria-hidden="true" className="size-4" />
            Ver el sitio
          </Link>
          <form action={logout}>
            <button type="submit" className="flex min-h-9 items-center gap-2 type-small hover:text-accent">
              <LogOut aria-hidden="true" className="size-4" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
      <main id="contenido" className="admin-canvas min-w-0 px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
        <AutoSubmit />
        {children}
        <form action={logout} className="mt-12 border-t border-line pt-6 lg:hidden">
          <button type="submit" className="flex min-h-11 items-center gap-2 font-medium">
            <LogOut aria-hidden="true" className="size-4" />
            Cerrar sesión ({who})
          </button>
        </form>
      </main>
    </div>
  );
}

export function AdminHeading({ title, note, actions, crumbs, aside, eyebrow }: { title: string; note?: ReactNode; actions?: ReactNode; crumbs?: { href: string; label: string }[]; aside?: ReactNode; eyebrow?: string }) {
  return (
    <header className="admin-heading flex flex-wrap items-end justify-between gap-4">
      {aside && <div className="order-last w-full sm:absolute sm:top-0 sm:right-0 sm:order-none sm:w-auto">{aside}</div>}
      <div className={cn("min-w-0", Boolean(aside) && "sm:pr-60")}>
        {eyebrow && !crumbs?.length && (
          <p className="admin-eyebrow">
            <span className="veta-dot" aria-hidden="true" />
            {eyebrow}
          </p>
        )}
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Estás en" className="mb-2 flex flex-wrap items-center gap-1.5 type-mono text-muted">
            {crumbs.map((crumb) => (
              <span key={crumb.href} className="flex items-center gap-1.5">
                <Link href={crumb.href} className="hover:text-link">
                  {crumb.label}
                </Link>
                <span aria-hidden="true">/</span>
              </span>
            ))}
          </nav>
        )}
        <h1 className="admin-title">{title}</h1>
        {note && <p className="mt-3 max-w-2xl text-muted">{note}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

/** Aviso de guardado/eliminado: entra como sticker arriba a la derecha y se va solo. */
export function Flash({ params, saved = "Guardado. Ya está en el sitio.", deleted = "Eliminado." }: { params: Record<string, string | string[] | undefined>; saved?: string; deleted?: string }) {
  const text = params.guardado ? saved : params.eliminado ? deleted : null;
  return text ? (
    <p role="status" className="admin-toast">
      <Mascot variant="badge" sizes="36px" className="w-9 shrink-0" />
      <span>{text}</span>
    </p>
  ) : null;
}

/** Aviso en línea: error (placa de mina), listo (sello) o información (nota). */
export function Alert({ kind = "info", children, className }: { kind?: "error" | "success" | "info"; children: ReactNode; className?: string }) {
  const Icon = kind === "error" ? TriangleAlert : kind === "success" ? Check : Info;
  return (
    <div role={kind === "error" ? "alert" : "status"} data-kind={kind} className={cn("admin-alert", className)}>
      <span className="admin-alert-icon" aria-hidden="true">
        <Icon strokeWidth={2.75} />
      </span>
      <div className="min-w-0 font-medium">{children}</div>
    </div>
  );
}

/** Estado vacío con el burro: dice qué hacer, no solo que no hay nada. */
export function EmptyState({ title, children, action, className }: { title: string; children?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cn("admin-empty", className)}>
      <Mascot variant="mascot" sizes="72px" className="w-16" />
      <p className="font-bold">{title}</p>
      {children && <p className="max-w-md text-muted">{children}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** Ficha: tarjeta blanca con la pestaña del título (y sus acciones) apoyada en el borde. */
export function Panel({ title, children, className, actions, id }: { title?: ReactNode; children: ReactNode; className?: string; actions?: ReactNode; id?: string }) {
  return (
    <section id={id} className={cn("admin-panel", className)}>
      {(title || actions) && (
        <div className="admin-panel-head">
          {title && <h2 className="admin-panel-title">{title}</h2>}
          {actions && <div className="admin-panel-actions">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
