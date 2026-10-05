import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { HelpBox } from "@/components/admin/help-box";
import { AdminHeading, Panel } from "@/components/admin/shell";
import { SERVER_ICON, SERVER_SLUG, SETTINGS_GUIDE, settingsHref } from "@/lib/admin/settings-guide";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/content";

/** Resumen de Configuración: qué es cada bloque, dónde se ve y qué falta. Cada bloque se edita en su propia pantalla. */
export default async function SettingsOverview() {
  await requireUser();
  const settings = await getSettings();
  const blocks = SETTINGS_GUIDE.map((guide) => ({ guide, status: guide.status(settings) }));
  const ready = blocks.filter((block) => block.status.ok).length;

  return (
    <>
      <AdminHeading eyebrow="Sitio" title="Configuración" note="Todos los bloques de datos del sitio y su estado. Los que son contenido (Nosotros, Textos legales, Sectores, Aviso de precios) viven en «Contenido», en el mismo orden que la navegación pública; acá están todos juntos para ver qué falta." />
      <div className="mb-6">
        <HelpBox topic="configuracion" />
      </div>
      <Panel title="Estado" className="mb-6 max-w-4xl">
        <p className="mb-2 type-small text-muted">
          {ready} de {blocks.length} bloques listos. Empezá por los que faltan; el orden de la lista es el orden sugerido.
        </p>
        <div className="admin-progress" role="progressbar" aria-valuemin={0} aria-valuemax={blocks.length} aria-valuenow={ready} aria-label="Bloques de configuración listos">
          <span style={{ width: `${(ready / blocks.length) * 100}%` }} />
        </div>
      </Panel>
      <ol className="grid max-w-4xl gap-3">
        {blocks.map(({ guide, status }, i) => (
          <li key={guide.slug}>
            <Link href={settingsHref(guide.slug)} className="admin-panel admin-block flex items-start gap-4">
              <span className="admin-block-icon" aria-hidden="true">
                <guide.icon strokeWidth={2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="type-mono text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-bold">{guide.title}</span>
                  <span className={status.ok ? "admin-tag" : "admin-tag is-pending"}>{status.text}</span>
                </span>
                <span className="mt-1 block text-muted">{guide.what}</span>
                <span className="mt-1.5 block type-small text-muted">
                  {guide.where.length ? `Se ve en: ${guide.where.map((place) => place.label).join(" · ")}` : "Todavía no se muestra en el sitio."}
                  {" · "}En el menú: {guide.menu.label}
                </span>
              </span>
              <ArrowRight aria-hidden="true" className="admin-block-arrow size-5 shrink-0" />
            </Link>
          </li>
        ))}
        <li>
          <Link href={settingsHref(SERVER_SLUG)} className="admin-panel admin-block flex items-start gap-4">
            <span className="admin-block-icon" aria-hidden="true">
              <SERVER_ICON strokeWidth={2} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="type-mono text-muted">{String(blocks.length + 1).padStart(2, "0")}</span>
                <span className="font-bold">Servidor</span>
                <span className="admin-tag">Solo lectura</span>
              </span>
              <span className="mt-1 block text-muted">Dominio, Google Analytics, Search Console y dónde se guardan las imágenes. Viven en el servidor, no en el panel.</span>
            </span>
            <ArrowRight aria-hidden="true" className="admin-block-arrow size-5 shrink-0" />
          </Link>
        </li>
      </ol>
    </>
  );
}
