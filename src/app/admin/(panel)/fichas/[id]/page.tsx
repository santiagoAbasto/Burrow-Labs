import { eq } from "drizzle-orm";
import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { z } from "zod";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { AdminHeading } from "@/components/admin/shell";
import { Ficha } from "@/components/ficha/ficha";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { projectSheets } from "@/db/schema";
import { deleteFicha } from "@/lib/admin/ficha-actions";
import { normalizeFicha } from "@/lib/ficha";
import { requireUser } from "@/lib/auth";

export default async function FichaEditorPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const [row] = await db.select().from(projectSheets).where(eq(projectSheets.id, id)).limit(1);
  if (!row) notFound();
  const data = normalizeFicha(row.data);

  return (
    <>
      <AdminHeading
        eyebrow="Fichas de proyecto"
        title={row.empresa || "Ficha nueva"}
        crumbs={[{ href: "/admin/fichas", label: "Fichas de proyecto" }]}
        note="Se guarda sola mientras escribís. Compartí el enlace de solo lectura con el cliente o exportá el PDF desde la barra de la ficha."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button href={`/ficha/${row.token}`} variant="secondary" target="_blank" rel="noopener" icon={<ExternalLink />}>
              Ver como cliente
            </Button>
            <ConfirmDelete action={deleteFicha.bind(null, id)} what="esta ficha" />
          </div>
        }
      />
      <Ficha initialData={data} fichaId={id} token={row.token} />
    </>
  );
}
