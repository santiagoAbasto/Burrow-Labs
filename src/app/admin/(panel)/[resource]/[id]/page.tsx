import { ArrowLeft, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { HelpAside } from "@/components/admin/help-box";
import { ResourceForm, type FormField } from "@/components/admin/resource-form";
import { AdminHeading } from "@/components/admin/shell";
import { Button } from "@/components/ui/button";
import { deleteResource, saveResource } from "@/lib/admin/actions";
import { getRow, loadVirtual, mediaOptions, relationOptions } from "@/lib/admin/data";
import { getResource, type AdminField } from "@/lib/admin/resources";
import { requireUser } from "@/lib/auth";

// Las fechas se editan en hora de Bolivia (ver ADMIN_UTC_OFFSET en actions.ts).
const toLocalInput = (date: Date) => new Date(date.getTime() - 4 * 3_600_000).toISOString().slice(0, 16);

function initial(field: AdminField, row: Record<string, unknown> | null, virtual: Record<string, string[]>): FormField["value"] {
  if (field.type === "multi") return virtual[field.name] ?? [];
  if (field.type === "children") return (virtual[field.name] ?? []).join("\n");
  const value = row?.[field.name];
  if (field.type === "boolean") return value === true;
  if (value === null || value === undefined) return field.type === "select" && !row ? (field.options?.[0]?.value ?? "") : "";
  if (field.type === "list") return (value as string[]).join("\n");
  if (field.type === "pairs") return (value as { label: string; value: string }[]).map((pair) => `${pair.label} | ${pair.value}`).join("\n");
  if (value instanceof Date) return toLocalInput(value);
  return String(value);
}

export default async function ResourceEdit({ params }: { params: Promise<{ resource: string; id: string }> }) {
  await requireUser();
  const { resource: key, id: rawId } = await params;
  const resource = getResource(key);
  if (!resource) notFound();
  const id = rawId === "nuevo" ? null : decodeURIComponent(rawId);
  const row = id ? await getRow(resource, id) : null;
  if (id && !row) notFound();
  const virtual = id ? await loadVirtual(resource, id) : {};

  const fields: FormField[] = await Promise.all(
    resource.fields.map(async (field) => ({
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      hint: field.hint,
      from: field.from,
      to: field.to,
      options: field.to === "media" ? await mediaOptions() : field.to ? await relationOptions(field.to) : field.options ? [...field.options] : undefined,
      value: initial(field, row, virtual),
    })),
  );
  const href = row && resource.href?.(row);

  return (
    <>
      <AdminHeading
        title={row ? String(row[resource.titleField] ?? "Editar") : `Nuevo ${resource.singular}`}
        note={resource.note}
        crumbs={[{ href: `/admin/${key}`, label: resource.label }]}
        actions={
          <>
            <Button href={`/admin/${key}`} variant="secondary">
              <ArrowLeft aria-hidden="true" className="size-4" />
              Volver
            </Button>
            {href && (
              <Button href={href} variant="secondary" target="_blank" icon={<ExternalLink />}>
                Ver en el sitio
              </Button>
            )}
            {id && <ConfirmDelete what={`este ${resource.singular}`} action={deleteResource.bind(null, key, id)} />}
          </>
        }
      />
      <ResourceForm action={saveResource.bind(null, key, id)} fields={fields} aside={<HelpAside topic={key} />} />
    </>
  );
}
