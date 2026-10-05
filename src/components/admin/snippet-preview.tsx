"use client";

import { useEffect, useState } from "react";

/** Cómo se vería el resultado en Google: lee en vivo los campos SEO del formulario (o el título si están vacíos). */
export function SnippetPreview({ titleFields, descriptionFields, path }: { titleFields: string[]; descriptionFields: string[]; path?: string }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  useEffect(() => {
    const form = document.querySelector<HTMLFormElement>("form[data-resource-form]");
    if (!form) return;
    const value = (names: string[]) => {
      for (const name of names) {
        const el = form.elements.namedItem(name);
        const v = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement ? el.value.trim() : "";
        if (v) return v;
      }
      return "";
    };
    const sync = () => {
      setTitle(value(titleFields));
      setDescription(value(descriptionFields));
    };
    sync();
    form.addEventListener("input", sync);
    return () => form.removeEventListener("input", sync);
  }, [titleFields, descriptionFields]);
  const cut = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);
  return (
    <div className="admin-panel" aria-live="polite">
      <p className="admin-panel-title">Así se vería en Google</p>
      <p className="truncate type-small text-muted">burrowlabs.com.bo{path ? ` › ${path.replace(/^\//, "")}` : ""}</p>
      <p className="mt-0.5 truncate text-[1.125rem] leading-snug font-semibold text-link">{cut(title || "Título de la página", 60)}</p>
      <p className="mt-0.5 text-[0.875rem] leading-snug text-muted">{cut(description || "La descripción que aparece bajo el título. Entre 120 y 160 caracteres funciona mejor.", 160)}</p>
      <p className="mt-2 type-small text-muted">
        Título: {title.length}/60 · Descripción: {description.length}/160
      </p>
    </div>
  );
}
