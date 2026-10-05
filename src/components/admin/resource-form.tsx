"use client";

import { ChevronDown } from "lucide-react";
import { useActionState, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Alert } from "./shell";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import type { FormState } from "@/lib/admin/actions";
import { slugify } from "@/lib/validation";
import { MarkdownField } from "./markdown-field";
import { MediaMulti, MediaPicker, type MediaOption } from "./media-picker";
import { SnippetPreview } from "./snippet-preview";

export type FormField = {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  hint?: string;
  from?: string;
  to?: string;
  options?: MediaOption[];
  /** Valor inicial ya serializado: string, boolean o lista de ids. */
  value: string | boolean | string[];
};

// Qué va en el panel lateral: estado y fecha de publicación, orden y las casillas de visibilidad.
// En este orden: primero el estado, después el orden y al final las casillas.
const SIDE_ORDER = ["status", "publishedAt", "sort", "featured", "authorized", "clientPublic", "noindex", "isDemo"];
const SIDE = new Set(SIDE_ORDER);
const SEO = new Set(["seoTitle", "seoDescription", "ogImage"]);

function SlugInput({ field }: { field: FormField }) {
  const [value, setValue] = useState(typeof field.value === "string" ? field.value : "");
  const touched = useRef(Boolean(field.value));
  // Sigue al campo del que deriva (nombre, título) hasta que se edita a mano.
  useEffect(() => {
    if (!field.from) return;
    const source = document.querySelector<HTMLInputElement>(`[name="${field.from}"]`);
    if (!source) return;
    const sync = () => {
      if (!touched.current) setValue(slugify(source.value));
    };
    source.addEventListener("input", sync);
    return () => source.removeEventListener("input", sync);
  }, [field.from]);
  return (
    <Input
      name={field.name}
      value={value}
      onChange={(event) => {
        touched.current = event.target.value !== "";
        setValue(event.target.value);
      }}
      className="font-mono"
      spellCheck={false}
    />
  );
}

function Control({ field, error }: { field: FormField; error?: string }) {
  const common = { name: field.name };
  const value = typeof field.value === "string" ? field.value : "";
  switch (field.type) {
    case "boolean":
      return (
        <Checkbox {...common} defaultChecked={field.value === true}>
          {field.label}
        </Checkbox>
      );
    case "multi": {
      const selected = Array.isArray(field.value) ? field.value : [];
      if (field.to === "media") return <MediaMulti name={field.name} label={field.label} options={field.options ?? []} selected={selected} />;
      return (
        <fieldset className="grid gap-2 p-5">
          <legend>{field.label}</legend>
          {field.options?.length ? (
            <div className="grid gap-1 sm:grid-cols-2">
              {field.options.map((option) => (
                <Checkbox key={option.value} name={field.name} value={option.value} defaultChecked={selected.includes(option.value)}>
                  {option.label}
                </Checkbox>
              ))}
            </div>
          ) : (
            <p className="type-small text-muted">Todavía no hay opciones cargadas.</p>
          )}
        </fieldset>
      );
    }
    case "relation":
      if (field.to === "media") return <MediaPicker name={field.name} label={field.label} hint={field.hint} options={field.options ?? []} defaultValue={value} error={error} />;
    // falls through
    case "select":
      return (
        <Field label={field.label} required={field.required} hint={field.hint} error={error}>
          <Select {...common} defaultValue={value}>
            {!field.required && <option value="">— Ninguno —</option>}
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      );
    case "textarea":
      return (
        <Field label={field.label} required={field.required} hint={field.hint} error={error}>
          <Textarea {...common} defaultValue={value} rows={3} />
        </Field>
      );
    case "markdown":
      return <MarkdownField name={field.name} label={field.label} hint={field.hint} required={field.required} error={error} defaultValue={value} />;
    case "list":
    case "pairs":
    case "children":
      return (
        <Field label={field.label} hint={field.hint} error={error}>
          <Textarea {...common} defaultValue={value} rows={Math.max(4, value.split("\n").length + 1)} />
        </Field>
      );
    case "slug":
      return (
        <Field label={field.label} required={field.required} hint={field.hint} error={error}>
          <SlugInput field={field} />
        </Field>
      );
    default:
      return (
        <Field label={field.label} required={field.required} hint={field.hint} error={error}>
          <Input {...common} defaultValue={value} type={field.type === "number" ? "number" : field.type === "datetime" ? "datetime-local" : "text"} step={field.type === "number" ? "any" : undefined} />
        </Field>
      );
  }
}

function Actions({ stay }: { stay: boolean }) {
  const { pending } = useFormStatus();
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-2 flex flex-wrap items-center gap-2 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
      <Button type="submit" loading={pending}>
        Guardar
      </Button>
      {stay && (
        <Button type="submit" name="stay" value="1" variant="secondary" loading={pending}>
          Guardar y seguir editando
        </Button>
      )}
      <UnsavedHint />
    </div>
  );
}

function UnsavedHint() {
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    const form = document.querySelector<HTMLFormElement>("form[data-resource-form]");
    if (!form) return;
    const mark = () => setDirty(true);
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    form.addEventListener("input", mark);
    window.addEventListener("beforeunload", warn);
    return () => {
      form.removeEventListener("input", mark);
      window.removeEventListener("beforeunload", warn);
    };
  }, [dirty]);
  return dirty ? <span className="ml-auto type-small text-muted">Hay cambios sin guardar.</span> : null;
}

/** Formulario de un recurso: campos principales a la izquierda; publicación y opciones a la derecha; SEO plegado al final. */
export function ResourceForm({ action, fields, stay = true, aside }: { action: (prev: FormState, form: FormData) => Promise<FormState>; fields: FormField[]; stay?: boolean; aside?: ReactNode }) {
  const [state, formAction] = useActionState(action, {});
  const groups = useMemo(
    () => ({
      main: fields.filter((field) => !SIDE.has(field.name) && !SEO.has(field.name)),
      side: fields.filter((field) => SIDE.has(field.name)).sort((a, b) => SIDE_ORDER.indexOf(a.name) - SIDE_ORDER.indexOf(b.name)),
      seo: fields.filter((field) => SEO.has(field.name)),
    }),
    [fields],
  );
  const render = (field: FormField): ReactNode => <Control key={field.name} field={field} error={state.errors?.[field.name]} />;

  return (
    <form action={formAction} noValidate data-resource-form className="grid gap-8">
      {state.error && <Alert kind="error">{state.error}</Alert>}
      {state.ok && <Alert kind="success">Guardado. Ya está en el sitio.</Alert>}
      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid gap-6">
          {groups.main.map(render)}
          {/* el recurso SEO (metadatos por ruta) lleva la vista previa a la vista */}
          {fields.some((field) => field.name === "path") && <SnippetPreview titleFields={["title"]} descriptionFields={["description"]} />}
          {groups.seo.length > 0 && (
            <details className="group admin-panel">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-semibold">
                SEO: cómo se ve en Google
                <ChevronDown aria-hidden="true" className="size-5 transition-transform group-open:rotate-180" />
              </summary>
              <div className="grid gap-5 border-t border-line p-5">
                <p className="type-small text-muted">Lo que ve Google. Vacío = se usa el título y el resumen del contenido.</p>
                <SnippetPreview titleFields={["seoTitle", "title", "name"]} descriptionFields={["seoDescription", "summary", "excerpt", "tagline"]} />
                {groups.seo.map(render)}
              </div>
            </details>
          )}
        </div>
        {(groups.side.length > 0 || aside) && (
          <div className="grid content-start gap-5 xl:sticky xl:top-6">
            {groups.side.length > 0 && (
              <aside className="admin-panel grid gap-5">
                <h2 className="admin-panel-title">Publicación</h2>
                {groups.side.map(render)}
              </aside>
            )}
            {aside}
          </div>
        )}
      </div>
      <Actions stay={stay} />
    </form>
  );
}
