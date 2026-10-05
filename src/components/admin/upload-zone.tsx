"use client";

import { UploadCloud } from "lucide-react";
import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Alert } from "./shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import type { FormState } from "@/lib/admin/actions";
import { cn } from "@/lib/cn";

// Mismos topes que el servidor (src/lib/storage.ts y serverActions.bodySizeLimit en next.config.ts). Acá solo
// avisan antes de enviar: un envío que supera el tope del servidor se corta sin un mensaje claro.
const MAX_FILE_MB = 8;
const MAX_TOTAL_MB = 10;
const MAX_FILES = 10;
const MB = 1024 * 1024;

function tooBig(files: File[]): string | null {
  if (files.length > MAX_FILES) return `Hasta ${MAX_FILES} imágenes por envío. Subí el resto en otra tanda.`;
  const big = files.find((file) => file.size > MAX_FILE_MB * MB);
  if (big) return `«${big.name}» supera los ${MAX_FILE_MB} MB.`;
  // margen para el resto del formulario dentro del tope del envío
  if (files.reduce((sum, file) => sum + file.size, 0) > (MAX_TOTAL_MB - 0.5) * MB) return `El envío supera los ${MAX_TOTAL_MB} MB en total. Subí las imágenes en tandas más chicas.`;
  return null;
}

function Submit({ count, blocked }: { count: number; blocked: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} disabled={count === 0 || blocked}>
      {count > 1 ? `Subir ${count} imágenes` : "Subir imagen"}
    </Button>
  );
}

/** Zona para arrastrar y soltar (o elegir) varias imágenes. Sin JS sigue siendo un <input type=file múltiple>. */
export function UploadZone({ action }: { action: (prev: FormState, form: FormData) => Promise<FormState> }) {
  const [state, formAction] = useActionState(action, {});
  const [names, setNames] = useState<string[]>([]);
  const [limitError, setLimitError] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const read = (files: FileList | null) => {
    const list = files ? Array.from(files) : [];
    setNames(list.map((file) => file.name));
    setLimitError(tooBig(list));
  };

  return (
    <form action={formAction} encType="multipart/form-data" noValidate className="grid gap-5">
      <label
        className={cn("grid cursor-pointer place-items-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors", over ? "border-ink bg-panel" : "border-line-strong hover:bg-panel")}
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setOver(false);
          if (input.current && event.dataTransfer.files.length) {
            input.current.files = event.dataTransfer.files;
            read(event.dataTransfer.files);
          }
        }}
      >
        <UploadCloud aria-hidden="true" className="size-8 text-muted" />
        <span className="font-semibold">Arrastrá imágenes acá o hacé clic para elegirlas</span>
        <span className="type-small text-muted">JPG, PNG, WebP o AVIF · hasta {MAX_FILE_MB} MB cada una, {MAX_TOTAL_MB} MB y {MAX_FILES} imágenes por envío · se convierten a WebP sin metadatos</span>
        <input ref={input} name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="sr-only" onChange={(event) => read(event.target.files)} />
        {names.length > 0 && <span className="mt-2 max-w-full truncate type-mono text-muted">{names.join(" · ")}</span>}
      </label>
      <Field label="Texto alternativo" hint="Describe la imagen para quien no puede verla. Se aplica a todas las que subas ahora; después se puede ajustar una por una.">
        <Input name="alt" />
      </Field>
      {limitError ? <Alert kind="error">{limitError}</Alert> : state.error && <Alert kind="error">{state.error}</Alert>}
      {state.ok && !state.error && !limitError && <Alert kind="success">{names.length > 1 ? "Imágenes subidas. Ya se pueden elegir en los formularios." : "Imagen subida. Ya se puede elegir en los formularios."}</Alert>}
      <div>
        <Submit count={names.length} blocked={limitError !== null} />
      </div>
    </form>
  );
}
