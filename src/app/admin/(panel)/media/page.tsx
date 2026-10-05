import { desc, ilike } from "drizzle-orm";
import { Copy } from "lucide-react";
import Image from "next/image";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { CopyButton } from "@/components/admin/copy-button";
import { HelpBox } from "@/components/admin/help-box";
import { AdminHeading, EmptyState, Flash, Panel } from "@/components/admin/shell";
import { SubmitButton } from "@/components/admin/state-form";
import { UploadZone } from "@/components/admin/upload-zone";
import { Field, Input } from "@/components/ui/form";
import { db } from "@/db";
import { media } from "@/db/schema";
import { deleteMedia, updateMediaAlt, uploadMedia } from "@/lib/admin/actions";
import { requireUser } from "@/lib/auth";
import { storage } from "@/lib/storage";

export default async function MediaAdmin({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireUser();
  const search = await searchParams;
  const q = search.q?.trim();
  const items = await db
    .select()
    .from(media)
    .where(q ? ilike(media.filename, `%${q.replace(/[%_\\]/g, "\\$&")}%`) : undefined)
    .orderBy(desc(media.createdAt))
    .limit(200);
  const size = items.reduce((sum, item) => sum + item.size, 0);

  return (
    <>
      <AdminHeading eyebrow="Sitio" title="Media" note={`${items.length} ${items.length === 1 ? "imagen" : "imágenes"} · ${(size / 1024 / 1024).toFixed(1)} MB. Las imágenes se eligen desde cada formulario (portada, logo, galería).`} />
      <Flash params={search} deleted="Imagen eliminada." />
      <div className="mb-6">
        <HelpBox topic="media" />
      </div>
      <Panel title="Subir" className="max-w-3xl">
        <UploadZone action={uploadMedia} />
      </Panel>
      <form action="/admin/media" role="search" className="mt-10 mb-4 max-w-sm">
        <label htmlFor="media-q" className="sr-only">
          Buscar por nombre de archivo
        </label>
        <input id="media-q" name="q" type="search" defaultValue={q} placeholder="Buscar por nombre…" className="control min-h-10 w-full" />
      </form>
      {items.length === 0 ? (
        <EmptyState title={q ? "Ninguna imagen con ese nombre." : "La biblioteca está vacía."}>{q ? "" : "Subí la primera imagen arriba. Después la vas a poder elegir como portada de un proyecto o logo de un cliente."}</EmptyState>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {items.map((item) => {
            const url = storage.publicUrl(item.key);
            return (
              <li key={item.id} className="admin-panel grid content-start gap-3 p-3">
                <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-panel">
                  <Image src={url} alt={item.alt} fill sizes="(min-width: 1280px) 320px, 50vw" className="object-contain" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold" title={item.filename}>
                    {item.filename}
                  </p>
                  <p className="type-small text-muted">
                    {item.width}×{item.height} · {Math.round(item.size / 1024)} KB · {item.createdAt.toLocaleDateString("es-BO", { timeZone: "America/La_Paz" })}
                  </p>
                </div>
                <form action={updateMediaAlt.bind(null, item.id)} className="grid gap-2">
                  <Field label="Texto alternativo">
                    <Input name="alt" defaultValue={item.alt} />
                  </Field>
                  <div className="flex flex-wrap items-center gap-2">
                    <SubmitButton variant="secondary">Guardar</SubmitButton>
                    <CopyButton value={url} label="Copiar URL" icon={<Copy aria-hidden="true" className="size-4" />} />
                    <span className="ml-auto">
                      <ConfirmDelete what="esta imagen" action={deleteMedia.bind(null, item.id)} />
                    </span>
                  </div>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
