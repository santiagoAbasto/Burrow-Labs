"use client";

import { Bold, Code, Eye, Heading2, Italic, Link2, List, Pencil, Quote } from "lucide-react";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Field, Textarea } from "@/components/ui/form";

type Wrap = { before: string; after?: string; block?: boolean; placeholder: string };
const TOOLS: { label: string; icon: typeof Bold; wrap: Wrap }[] = [
  { label: "Negrita", icon: Bold, wrap: { before: "**", after: "**", placeholder: "texto" } },
  { label: "Cursiva", icon: Italic, wrap: { before: "_", after: "_", placeholder: "texto" } },
  { label: "Título", icon: Heading2, wrap: { before: "## ", block: true, placeholder: "Título" } },
  { label: "Lista", icon: List, wrap: { before: "- ", block: true, placeholder: "ítem" } },
  { label: "Cita", icon: Quote, wrap: { before: "> ", block: true, placeholder: "cita" } },
  { label: "Enlace", icon: Link2, wrap: { before: "[", after: "](https://)", placeholder: "texto del enlace" } },
  { label: "Código", icon: Code, wrap: { before: "`", after: "`", placeholder: "código" } },
];

type EditorProps = { name: string; defaultValue: string; id?: string; required?: boolean; "aria-describedby"?: string; "aria-invalid"?: boolean };

/** El control en sí: recibe id y aria-* de <Field> y se los pasa al textarea, así el label le apunta. */
function Editor({ name, defaultValue, id, ...aria }: EditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [preview, setPreview] = useState(false);

  const apply = ({ before, after = "", block, placeholder }: Wrap) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = el.value.slice(start, end) || placeholder;
    let insert = `${before}${selected}${after}`;
    let from = start;
    if (block) {
      // al inicio de línea
      const lineStart = el.value.lastIndexOf("\n", start - 1) + 1;
      from = lineStart;
      insert = `${before}${el.value.slice(lineStart, start)}${selected}${after}`;
    }
    const next = `${el.value.slice(0, from)}${insert}${el.value.slice(end)}`;
    setValue(next);
    requestAnimationFrame(() => {
      el.focus();
      const cursor = from + insert.length - after.length;
      el.setSelectionRange(cursor - selected.length, cursor);
    });
  };

  return (
    <div>
      <div className="md-toolbar" role="toolbar" aria-label="Formato" aria-controls={id}>
        {TOOLS.map((tool) => (
          <button key={tool.label} type="button" title={tool.label} aria-label={tool.label} onClick={() => apply(tool.wrap)} disabled={preview}>
            <tool.icon aria-hidden="true" className="size-4" />
          </button>
        ))}
        <button type="button" onClick={() => setPreview((v) => !v)} aria-pressed={preview} className="ml-auto gap-1.5">
          {preview ? <Pencil aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
          {preview ? "Editar" : "Vista previa"}
        </button>
      </div>
      {preview ? (
        <div className="md-preview prose" aria-live="polite">
          {value.trim() ? <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>{value}</ReactMarkdown> : <p className="text-muted">Nada que mostrar todavía.</p>}
          <input type="hidden" name={name} value={value} />
        </div>
      ) : (
        <Textarea ref={ref} id={id} name={name} value={value} onChange={(event) => setValue(event.target.value)} rows={Math.min(28, Math.max(10, value.split("\n").length + 2))} className="font-mono text-sm leading-relaxed" {...aria} />
      )}
    </div>
  );
}

/** Textarea Markdown con barra de formato y vista previa (el mismo render que usa el sitio, sin HTML crudo). */
export function MarkdownField({ name, label, hint, required, error, defaultValue = "" }: { name: string; label: string; hint?: string; required?: boolean; error?: string; defaultValue?: string }) {
  return (
    <Field label={label} hint={hint ?? "Acepta Markdown: **negrita**, _cursiva_, ## títulos, - listas, [enlaces](url)."} required={required} error={error} className="md-editor">
      <Editor name={name} defaultValue={defaultValue} />
    </Field>
  );
}
