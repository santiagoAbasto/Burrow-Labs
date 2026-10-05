"use client";

import { ChevronDown, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV, type NavItem } from "@/lib/admin/nav";
import { cn } from "@/lib/cn";

/** Qué ítem/subpantalla está activo: el enlace más específico (href más largo) que sea prefijo de la ruta. */
function activeHref(path: string, hrefs: string[]): string | undefined {
  return hrefs.filter((href) => (href === "/admin" ? path === "/admin" : path === href || path.startsWith(`${href}/`))).sort((a, b) => b.length - a.length)[0];
}

export function AdminNav({ counts = {} }: { counts?: Record<string, number> }) {
  const path = usePathname();
  const everything = ADMIN_NAV.flatMap((group) => group.items.flatMap((item) => [item.href, ...(item.children?.map((child) => child.href) ?? [])]));
  const current = activeHref(path, everything);
  const owns = (item: NavItem) => current !== undefined && (current === item.href || Boolean(item.children?.some((child) => child.href === current)));

  const leaf = (item: NavItem) => {
    const active = owns(item);
    const count = counts[item.href];
    return (
      <>
        <Link href={item.href} aria-current={active ? "page" : undefined} className={cn("admin-nav-link", active && "is-active", Boolean(count) && "pr-12")}>
          <item.icon aria-hidden="true" className="size-4 shrink-0" />
          <span className="truncate">{item.label}</span>
        </Link>
        {/* el contador va fuera del enlace: su nombre accesible sigue siendo solo la etiqueta */}
        {count ? (
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-accent px-2 py-0.5 type-mono text-accent-fg" aria-label={`${count} sin atender`}>
            {count}
          </span>
        ) : null}
      </>
    );
  };

  // Ítem con subpantallas: se despliega solo al entrar en su sección; la subpantalla activa se marca en amarillo.
  const branch = (item: NavItem) => {
    const active = owns(item);
    return (
      <details key={String(active)} className="admin-nav-group" open={active || undefined}>
        <summary className={cn("admin-nav-link", active && "is-open")}>
          <item.icon aria-hidden="true" className="size-4 shrink-0" />
          <span className="truncate">{item.label}</span>
          <ChevronDown aria-hidden="true" className="admin-nav-chevron" />
        </summary>
        <ul className="admin-nav-sub">
          {item.children!.map((child) => {
            const here = current === child.href;
            return (
              <li key={child.href}>
                <Link href={child.href} aria-current={here ? "page" : undefined} className={cn("admin-nav-link", here && "is-active")}>
                  <span className="truncate">{child.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </details>
    );
  };

  return (
    <nav aria-label="Administración" className="grid gap-5">
      {ADMIN_NAV.map((group) => (
        <div key={group.title}>
          <p className="px-3 pb-1.5 type-mono text-muted">{group.title}</p>
          <ul className="grid gap-0.5">
            {group.items.map((item) => (
              <li key={item.href} className="relative">
                {item.children ? branch(item) : leaf(item)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Buscador global: va a /admin/buscar?q=… */
export function AdminSearch({ className }: { className?: string }) {
  return (
    <form action="/admin/buscar" role="search" className={cn("relative", className)}>
      <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
      <label htmlFor="admin-q" className="sr-only">
        Buscar en el panel
      </label>
      <input id="admin-q" name="q" type="search" placeholder="Buscar servicios, proyectos, leads…" className="control min-h-10 w-full pl-9" autoComplete="off" />
    </form>
  );
}
