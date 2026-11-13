import { ExternalLink } from "lucide-react";
import { SeasonForm } from "@/components/admin/season-form";
import { AdminHeading, Alert, Panel } from "@/components/admin/shell";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/content";
import { isSeasonActive, seasonInstant, SEASON_PREVIEW_COOKIE, parseSeasonPreview } from "@/lib/season";
import { seasonMusicReady } from "@/lib/season-server";
import { cookies } from "next/headers";

const WHEN = new Intl.DateTimeFormat("es-BO", { dateStyle: "long", timeStyle: "short", timeZone: "America/La_Paz" });

/** Sitio → Campaña de Navidad: encender, programar, previsualizar (solo en esta sesión) y apagar. */
export default async function SeasonPage() {
  await requireUser();
  const { season } = await getSettings();
  const preview = parseSeasonPreview((await cookies()).get(SEASON_PREVIEW_COOKIE)?.value);
  const active = isSeasonActive(season);
  const start = seasonInstant(season.start);
  const end = seasonInstant(season.end);
  const status =
    season.mode === "manual"
      ? "Encendida a mano: se ve ahora y queda así hasta que la apagues."
      : season.mode === "scheduled" && start && end
        ? active
          ? `Encendida por programación: se apaga sola el ${WHEN.format(end)} (hora de Bolivia).`
          : end <= new Date()
            ? `Programada, pero el período ya terminó el ${WHEN.format(end)}. Nadie la ve.`
            : `Programada: se enciende sola el ${WHEN.format(start)} (hora de Bolivia). Hoy nadie la ve.`
        : "Apagada: el sitio y el panel se ven como siempre.";

  return (
    <>
      <AdminHeading
        eyebrow="Sitio"
        title="Campaña de Navidad"
        note="Viste el sitio y el panel de Navidad sin tocar ninguna página: gorro sobre el burro, luces, trineo con renos y un paisaje en el pie. Se enciende a mano o sola entre dos fechas, y se apaga igual."
        actions={
          <Button href="/" target="_blank" variant="secondary" icon={<ExternalLink />}>
            Ver el sitio
          </Button>
        }
      />
      <div className="grid max-w-4xl gap-6">
        <Alert kind={active ? "success" : "info"}>{status}</Alert>
        {preview && <Alert kind="info">Tenés una vista previa abierta: solo vos la ves, en este navegador. Se cierra al guardar, con «Salir» en el aviso de abajo, o sola a las dos horas.</Alert>}
        {!seasonMusicReady() && (
          <Alert kind="info">
            Todavía no hay pista de música: falta el archivo <code>public/audio/navidad.mp3</code>. Hasta que esté, el botón de música no aparece aunque el interruptor esté encendido. Nunca se usan canciones con derechos de autor.
          </Alert>
        )}
        <Panel title="Campaña">
          <SeasonForm settings={preview ?? season} />
        </Panel>
      </div>
    </>
  );
}
