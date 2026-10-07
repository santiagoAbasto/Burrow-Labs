import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Ficha } from "@/components/ficha/ficha";
import { db } from "@/db";
import { projectSheets } from "@/db/schema";
import { normalizeFicha } from "@/lib/ficha";

// Enlace privado de solo lectura: no se indexa y se lee fresco en cada visita.
export const metadata: Metadata = { title: "Ficha de proyecto", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PublicFichaPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!token || token.length > 64) notFound();
  const [row] = await db.select().from(projectSheets).where(eq(projectSheets.token, token)).limit(1);
  if (!row) notFound();
  return <Ficha initialData={normalizeFicha(row.data)} readOnly />;
}
