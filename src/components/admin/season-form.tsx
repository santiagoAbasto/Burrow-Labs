"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select } from "@/components/ui/form";
import type { FormState } from "@/lib/admin/actions";
import { previewSeason, saveSeason } from "@/lib/admin/season-actions";
import type { SeasonSettings } from "@/lib/season";
import { Alert } from "./shell";

const PIECES: { name: keyof SeasonSettings; label: string; hint: string }[] = [
  { name: "characters", label: "Personajes", hint: "El gorro sobre el burro, el trineo con renos y el burro del paisaje." },
  { name: "lights", label: "Luces", hint: "Guirnaldas bajo el encabezado y colgantes en los márgenes de las pantallas anchas." },
  { name: "animations", label: "Animaciones", hint: "Parpadeo lento, galope y vuelo del trineo. Apagadas, todo queda quieto." },
  { name: "snow", label: "Nieve", hint: "Catorce copos que caen despacio. Solo en el sitio, nunca en el panel." },
  { name: "music", label: "Música", hint: "La pista propia, a volumen bajo y solo en el sitio. Cada visitante la puede apagar." },
];

function Buttons() {
  const { pending } = useFormStatus();
  return (
    <div className="flex flex-wrap gap-3">
      <Button type="submit" loading={pending}>
        Guardar y publicar
      </Button>
      <Button type="submit" variant="secondary" name="intent" value="preview" disabled={pending}>
        Ver solo yo (vista previa)
      </Button>
    </div>
  );
}

/** Un solo formulario, dos destinos: guardar para todos o previsualizar en la sesión de quien administra. */
export function SeasonForm({ settings }: { settings: SeasonSettings }) {
  const [state, action] = useActionState(async (prev: FormState, form: FormData) => {
    const preview = form.get("intent") === "preview";
    const result = await (preview ? previewSeason(prev, form) : saveSeason(prev, form));
    // La vista previa vive en una cookie: se recarga para que el servidor y el script la lean.
    if (result.ok && preview) window.location.reload();
    return { ...result, preview } as FormState & { preview?: boolean };
  }, {} as FormState & { preview?: boolean });
  const error = (name: string) => state.errors?.[name];

  return (
    <form action={action} className="grid gap-6" noValidate>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Estado" hint="Programada se enciende y se apaga sola." error={error("mode")}>
          <Select name="mode" defaultValue={settings.mode}>
            <option value="off">Apagada</option>
            <option value="manual">Encendida ahora</option>
            <option value="scheduled">Programada</option>
          </Select>
        </Field>
        <Field label="Empieza" hint="Hora de Bolivia. Desde ese minuto se ve." error={error("start")}>
          <Input type="datetime-local" name="start" defaultValue={settings.start} aria-invalid={error("start") ? true : undefined} />
        </Field>
        <Field label="Termina" hint="Hora de Bolivia. A esa hora exacta ya no se ve." error={error("end")}>
          <Input type="datetime-local" name="end" defaultValue={settings.end} aria-invalid={error("end") ? true : undefined} />
        </Field>
      </div>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-3 font-bold">Dónde se ve</legend>
        <div className="grid content-start gap-3">
          <Checkbox name="site" defaultChecked={settings.site}>
            En el sitio público
          </Checkbox>
          <Field label="Intensidad del sitio" error={error("siteIntensity")}>
            <Select name="siteIntensity" defaultValue={settings.siteIntensity}>
              <option value="festive">Festiva: además cambian enlaces y fondos oscuros</option>
              <option value="subtle">Discreta: solo adornos y acentos</option>
            </Select>
          </Field>
        </div>
        <div className="grid content-start gap-3">
          <Checkbox name="admin" defaultChecked={settings.admin}>
            En el panel
          </Checkbox>
          <Field label="Intensidad del panel" error={error("adminIntensity")}>
            <Select name="adminIntensity" defaultValue={settings.adminIntensity}>
              <option value="festive">Festiva: el menú pasa al verde pino</option>
              <option value="subtle">Discreta: solo adornos y acentos</option>
            </Select>
          </Field>
        </div>
      </fieldset>

      <fieldset className="grid gap-3">
        <legend className="mb-3 font-bold">Piezas</legend>
        {PIECES.map((piece) => (
          <div key={piece.name}>
            <Checkbox name={piece.name} defaultChecked={Boolean(settings[piece.name])}>
              {piece.label}
            </Checkbox>
            <p className="mt-1 pl-8 type-small text-muted">{piece.hint}</p>
          </div>
        ))}
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Saludo del pie" hint="Opcional, una línea. Vacío: «¡Felices fiestas! Seguimos cavando soluciones.»" error={error("greeting")}>
          <Input name="greeting" defaultValue={settings.greeting} maxLength={90} aria-invalid={error("greeting") ? true : undefined} />
        </Field>
        <Field label="Enlace del saludo" hint="Opcional. Una página de este sitio, por ejemplo /contacto." error={error("link")}>
          <Input name="link" defaultValue={settings.link} placeholder="/contacto" aria-invalid={error("link") ? true : undefined} />
        </Field>
      </div>

      {state.error && <Alert kind="error">{state.error}</Alert>}
      {state.ok && !state.preview && <Alert kind="success">Guardado. Ya vale para todos los visitantes.</Alert>}
      <Buttons />
    </form>
  );
}
