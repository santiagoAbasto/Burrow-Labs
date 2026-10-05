import { Checkbox, Field, Input, Textarea } from "@/components/ui/form";
import type { JsonField } from "@/lib/admin/json-form";
import type { FieldGuide } from "@/lib/admin/settings-guide";

type Props = { field: JsonField; root?: boolean; only?: string[]; /** Etiqueta, ayuda y ejemplo por clave del campo (la última parte del nombre). */ guide?: Record<string, FieldGuide> };

/** Pinta los campos de un objeto JSON (sección del Home o grupo de settings). */
export function JsonFields({ field, root = true, only, guide }: Props) {
  const key = field.name.split(".").at(-1) ?? field.name;
  const g = guide?.[key] ?? {};
  const label = g.label ?? field.label;
  switch (field.kind) {
    case "group": {
      const fields = only ? field.fields.filter((child) => only.includes(child.name.split(".").at(-1) ?? "")) : field.fields;
      const body = fields.map((child) => <JsonFields key={child.name} field={child} root={false} guide={guide} />);
      return root ? (
        <div className="grid gap-5">{body}</div>
      ) : (
        <fieldset className="grid gap-5 p-5">
          <legend>{label}</legend>
          {body}
        </fieldset>
      );
    }
    case "boolean":
      return (
        <Checkbox name={field.name} defaultChecked={field.value}>
          {label}
        </Checkbox>
      );
    case "text":
      return (
        <Field label={label} hint={g.hint}>
          <Input name={field.name} defaultValue={field.value} placeholder={g.placeholder} />
        </Field>
      );
    case "long":
      return (
        <Field label={label} hint={g.hint}>
          <Textarea name={field.name} defaultValue={field.value} rows={3} placeholder={g.placeholder} />
        </Field>
      );
    case "markdown":
      return (
        <Field label={label} hint={g.hint ?? "Acepta Markdown."}>
          <Textarea name={field.name} defaultValue={field.value} rows={14} className="font-mono text-sm" placeholder={g.placeholder} />
        </Field>
      );
    case "list":
      return (
        <Field label={label} hint={g.hint ?? "Un elemento por línea."}>
          <Textarea name={field.name} defaultValue={field.value} rows={Math.max(4, field.value.split("\n").length + 1)} placeholder={g.placeholder} />
        </Field>
      );
    case "rows":
      return (
        <Field label={label} hint={g.hint ?? `Una línea por elemento, con los campos separados por «|»: ${field.columns.join(" | ")}`}>
          <Textarea name={field.name} defaultValue={field.value} rows={Math.max(4, field.value.split("\n").length + 1)} className="font-mono text-sm" placeholder={g.placeholder} />
        </Field>
      );
  }
}
