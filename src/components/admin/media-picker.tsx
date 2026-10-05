"use client";

import { ImageOff, Images } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { Field } from "@/components/ui/form";
import { cn } from "@/lib/cn";

export type MediaOption = { value: string; label: string; image?: string; width?: number | null; height?: number | null };

/** Elige una imagen de la biblioteca (relación a `media`): muestra la actual y abre la galería para cambiarla. */
export function MediaPicker({ name, label, hint, options, defaultValue, error }: { name: string; label: string; hint?: string; options: MediaOption[]; defaultValue?: string; error?: string }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const current = options.find((option) => option.value === value);
  return (
    <Field label={label} hint={hint} error={error}>
      <div className="flex flex-wrap items-center gap-4">
        <input type="hidden" name={name} value={value} />
        <Modal title="Biblioteca de imágenes" description={options.length ? "Elegí una. Para subir nuevas, andá a Media." : "Todavía no hay imágenes. Subilas en Media."} open={open} onOpenChange={setOpen} className="max-w-3xl">
          <Gallery options={options} selected={value ? [value] : []} onPick={(id) => { setValue(id); setOpen(false); }} />
        </Modal>
        <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-panel">
          {current?.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- miniatura de la biblioteca, tamaño fijo
            <img src={current.image} alt="" className="size-full object-cover" />
          ) : (
            <ImageOff aria-hidden="true" className="size-6 text-muted" />
          )}
        </div>
        <div className="grid gap-2">
          <p className="truncate type-small text-muted">{current ? current.label : "Sin imagen"}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" icon={<Images />} onClick={() => setOpen(true)}>
              {current ? "Cambiar" : "Elegir imagen"}
            </Button>
            {current && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setValue("")}>
                Quitar
              </Button>
            )}
          </div>
        </div>
      </div>
    </Field>
  );
}

function Gallery({ options, selected, onPick }: { options: MediaOption[]; selected: string[]; onPick: (id: string) => void }) {
  const [q, setQ] = useState("");
  const shown = options.filter((option) => option.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="mt-4 grid gap-4">
      <input type="search" value={q} onChange={(event) => setQ(event.target.value)} placeholder="Filtrar por nombre…" className="control min-h-10" aria-label="Filtrar imágenes" />
      <ul className="grid max-h-[60vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
        {shown.map((option) => (
          <li key={option.value}>
            <button type="button" onClick={() => onPick(option.value)} className={cn("block w-full overflow-hidden rounded-md border-2 text-left", selected.includes(option.value) ? "border-ink shadow-[0_0_0_3px_var(--color-yellow-400)]" : "border-line hover:border-line-strong")}>
              <span className="block aspect-square bg-panel">
                {option.image && (
                  // eslint-disable-next-line @next/next/no-img-element -- miniatura de la biblioteca, tamaño fijo
                  <img src={option.image} alt="" className="size-full object-cover" loading="lazy" />
                )}
              </span>
              <span className="block truncate px-2 py-1.5 type-small">{option.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Varias imágenes (galería de un proyecto): casillas con miniatura. */
export function MediaMulti({ name, label, options, selected }: { name: string; label: string; options: MediaOption[]; selected: string[] }) {
  return (
    <fieldset className="grid gap-3 p-5">
      <legend>{label}</legend>
      {options.length === 0 ? (
        <p className="type-small text-muted">Todavía no hay imágenes en Media.</p>
      ) : (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {options.map((option) => (
            <li key={option.value}>
              <label className="group block cursor-pointer">
                <input type="checkbox" name={name} value={option.value} defaultChecked={selected.includes(option.value)} className="peer sr-only" />
                <span className="block overflow-hidden rounded-md border-2 border-line peer-checked:border-ink peer-checked:shadow-[0_0_0_3px_var(--color-yellow-400)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
                  <span className="block aspect-square bg-panel">
                    {option.image && (
                      // eslint-disable-next-line @next/next/no-img-element -- miniatura de la biblioteca, tamaño fijo
                      <img src={option.image} alt="" className="size-full object-cover" loading="lazy" />
                    )}
                  </span>
                  <span className="block truncate px-2 py-1.5 type-small">{option.label}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </fieldset>
  );
}
