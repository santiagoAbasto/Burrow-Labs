import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonFields } from "@/components/admin/json-fields";
import { AdminHeading, Alert, Panel } from "@/components/admin/shell";
import { StateForm } from "@/components/admin/state-form";
import { Button } from "@/components/ui/button";
import { saveSettingsGroup } from "@/lib/admin/actions";
import { describeJson } from "@/lib/admin/json-form";
import { SERVER_SLUG, SETTINGS_GUIDE, guideBySlug, settingsHref } from "@/lib/admin/settings-guide";
import { SETTINGS_SHAPE } from "@/lib/admin/settings-shape";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/content";
import { env } from "@/lib/env";

const CRUMBS = [{ href: "/admin/configuracion", label: "Configuración" }];

/** Una pantalla por bloque de Configuración: el formulario a la izquierda y la guía (dónde se ve, cómo completarlo) a la derecha. */
export default async function SettingsGroupPage({ params }: { params: Promise<{ grupo: string }> }) {
  await requireUser();
  const { grupo } = await params;
  if (grupo === SERVER_SLUG) return <ServerPage />;
  const guide = guideBySlug(grupo);
  if (!guide) notFound();
  const settings = await getSettings();
  const status = guide.status(settings);
  const index = SETTINGS_GUIDE.indexOf(guide);
  const prev = SETTINGS_GUIDE[index - 1];
  const next = SETTINGS_GUIDE[index + 1];

  return (
    <>
      <AdminHeading
        title={guide.title}
        note={guide.what}
        eyebrow={guide.menu.group === "Contenido" ? "Contenido" : undefined}
        crumbs={guide.menu.group === "Contenido" ? undefined : CRUMBS}
        actions={
          guide.where[0] ? (
            <Button href={guide.where[0].href} target="_blank" variant="secondary" icon={<ExternalLink />}>
              Ver en el sitio
            </Button>
          ) : undefined
        }
      />
      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
        {/* en pantallas angostas la guía va primero: leer antes de completar */}
        <div className="grid gap-6 xl:order-1">
          {!status.ok && <Alert kind="info">{status.text}. Completalo y guardá: el sitio se actualiza al instante.</Alert>}
          <Panel title={`${String(index + 1).padStart(2, "0")} · ${guide.title}`}>
            <StateForm action={saveSettingsGroup.bind(null, guide.group)} className="grid gap-5">
              {guide.only?.map((key) => <input key={key} type="hidden" name="only" value={key} />)}
              <JsonFields field={describeJson(SETTINGS_SHAPE[guide.group], settings[guide.group], guide.group)} only={guide.only} guide={guide.fields} />
            </StateForm>
          </Panel>
          <nav aria-label="Otros bloques" className="flex flex-wrap items-center justify-between gap-3">
            {prev ? (
              <Link href={settingsHref(prev.slug)} className="flex min-h-11 items-center gap-2 font-semibold hover:text-link">
                <ArrowLeft aria-hidden="true" className="size-4" />
                {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={settingsHref(next.slug)} className="flex min-h-11 items-center gap-2 font-semibold hover:text-link">
                Siguiente: {next.title}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            ) : (
              <Link href="/admin/configuracion" className="flex min-h-11 items-center gap-2 font-semibold hover:text-link">
                Volver al resumen
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            )}
          </nav>
        </div>
        <div className="grid content-start gap-5 max-xl:order-first xl:order-2 xl:sticky xl:top-6">
          <Panel title="Dónde se ve">
            {guide.where.length ? (
              <ul className="grid gap-2">
                {guide.where.map((place) => (
                  <li key={place.label}>
                    <a href={place.href} target="_blank" rel="noreferrer" className="admin-tile flex items-center gap-2 px-3 py-2 type-small font-medium">
                      <ExternalLink aria-hidden="true" className="size-3.5 shrink-0 text-muted" />
                      {place.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="type-small text-muted">Todavía en ninguna página. Lo que guardes acá queda listo para cuando se diseñe su lugar.</p>
            )}
          </Panel>
          <Panel title="Cómo completarlo">
            <ol className="admin-steps">
              {guide.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
    </>
  );
}

/** Lo que vive en el entorno del servidor: se muestra para saber qué falta; se cambia en el archivo .env y reiniciando. */
function ServerPage() {
  const rows: { label: string; value: string; variable: string; ok: boolean; how: string }[] = [
    { label: "Dominio público", value: env.NEXT_PUBLIC_SITE_URL, variable: "NEXT_PUBLIC_SITE_URL", ok: !env.NEXT_PUBLIC_SITE_URL.includes("localhost"), how: "La dirección real del sitio (https://…). Define las URL del sitemap, de Open Graph y de los enlaces absolutos." },
    { label: "Google Analytics 4", value: env.NEXT_PUBLIC_GA_ID ? "Configurado" : "Sin configurar", variable: "NEXT_PUBLIC_GA_ID", ok: Boolean(env.NEXT_PUBLIC_GA_ID), how: "El ID de medición (G-…). Sin él no se carga ningún tracker ni el aviso de cookies; el dashboard igual cuenta visitas propias." },
    { label: "Microsoft Clarity", value: env.NEXT_PUBLIC_CLARITY_ID ? "Configurado" : "Sin configurar", variable: "NEXT_PUBLIC_CLARITY_ID", ok: Boolean(env.NEXT_PUBLIC_CLARITY_ID), how: "El ID del proyecto de Clarity (grabaciones y mapas de calor). Como GA, solo se carga si la persona acepta las cookies de analítica. Hay que redesplegar." },
    { label: "Search Console", value: env.NEXT_PUBLIC_GSC_VERIFICATION ? "Configurado" : "Sin configurar", variable: "NEXT_PUBLIC_GSC_VERIFICATION", ok: Boolean(env.NEXT_PUBLIC_GSC_VERIFICATION), how: "El código de verificación que da Google Search Console para comprobar que el sitio es tuyo." },
    { label: "Dónde se guardan las imágenes", value: env.STORAGE_DRIVER === "s3" ? "S3 / R2" : "Disco local", variable: "STORAGE_DRIVER", ok: true, how: "«local» guarda en el servidor; «s3» en un bucket (S3 o Cloudflare R2) y necesita sus claves." },
  ];
  return (
    <>
      <AdminHeading title="Servidor" note="Estos valores viven en el entorno del servidor (archivo .env), no en el panel. Se muestran para saber qué falta; los cambia quien administra el servidor." crumbs={CRUMBS} />
      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Panel title="Variables">
          <dl className="grid gap-3">
            {rows.map((row) => (
              <div key={row.variable} className="admin-tile grid gap-1 px-4 py-3">
                <dt className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-semibold">{row.label}</span>
                  <span className={row.ok ? "admin-tag" : "admin-tag is-pending"}>{row.ok ? "Listo" : "Falta"}</span>
                </dt>
                <dd className="break-all">{row.value}</dd>
                <dd className="type-small text-muted">{row.how}</dd>
                <dd className="type-mono text-muted">{row.variable}</dd>
              </div>
            ))}
          </dl>
        </Panel>
        <Panel title="Cómo se cambian">
          <ol className="admin-steps">
            <li>Se editan en el archivo <code className="font-mono text-[0.9em]">.env</code> del servidor (o en el panel del proveedor, p. ej. Vercel › Environment Variables).</li>
            <li>Después hay que volver a desplegar o reiniciar el sitio para que tome los valores.</li>
            <li>
              El detalle de cada variable está en <code className="font-mono text-[0.9em]">docs/DEPLOY.md</code> del proyecto.
            </li>
          </ol>
        </Panel>
      </div>
    </>
  );
}
