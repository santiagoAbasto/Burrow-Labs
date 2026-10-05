import Link from "next/link";
import type { activityLog } from "@/db/schema";
import { ACTION_LABEL, type ActivityAction } from "@/lib/admin/activity";
import { settingsHref, slugForGroup } from "@/lib/admin/settings-guide";

type Item = typeof activityLog.$inferSelect;

const RESOURCE_HREF: Record<string, (id: string | null) => string | null> = {
  home: (id) => (id ? `/admin/home/${id}` : "/admin/home"),
  leads: (id) => (id ? `/admin/leads/${id}` : "/admin/leads"),
  media: () => "/admin/media",
  configuración: (id) => (id && slugForGroup(id) ? settingsHref(slugForGroup(id)!) : "/admin/configuracion"),
  newsletter: () => "/admin/newsletter",
  campaña: (id) => (id ? `/admin/newsletter/campanas/${id}` : "/admin/newsletter/campanas"),
  usuarios: () => "/admin/usuarios",
  cuenta: () => "/admin/cuenta",
  sesión: () => null,
};

function when(date: Date) {
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "recién";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  return date.toLocaleString("es-BO", { timeZone: "America/La_Paz", dateStyle: "short", timeStyle: "short" });
}

/** Bitácora: «Ana editó Planes · Turbo · hace 5 min». */
export function ActivityList({ items }: { items: Item[] }) {
  if (items.length === 0) return <p className="text-muted">Todavía no hay actividad registrada.</p>;
  return (
    <ul className="-my-1">
      {items.map((item) => {
        const href = (RESOURCE_HREF[item.entity] ?? ((id) => (id && item.action !== "delete" ? `/admin/${item.entity}/${encodeURIComponent(id)}` : `/admin/${item.entity}`)))(item.entityId);
        const text = (
          <>
            <span className="font-semibold">{item.userName}</span> {ACTION_LABEL[item.action as ActivityAction] ?? item.action} <span className="font-semibold capitalize">{item.entity}</span>
            {item.title && <span className="text-muted"> · {item.title}</span>}
          </>
        );
        return (
          <li key={item.id} className="flex min-h-11 items-center gap-3 border-b border-line py-1.5 last:border-0">
            <p className="min-w-0 flex-1 truncate">{href && item.action !== "delete" ? <Link href={href} className="hover:text-link">{text}</Link> : text}</p>
            <time dateTime={item.createdAt.toISOString()} className="shrink-0 type-small text-muted">
              {when(item.createdAt)}
            </time>
          </li>
        );
      })}
    </ul>
  );
}
