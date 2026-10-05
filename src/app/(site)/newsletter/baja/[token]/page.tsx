import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/site/page-header";
import { Button } from "@/components/ui/button";
import { Container, Stratum } from "@/components/ui/stratum";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { unsubscribe } from "@/lib/newsletter-actions";

// Página personal (llega desde el enlace de cada correo): nunca se indexa.
export const metadata: Metadata = { title: "Darse de baja de la newsletter", robots: { index: false, follow: false } };

export default async function UnsubscribePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [row] = token.length <= 64 ? await db.select({ status: subscribers.status }).from(subscribers).where(eq(subscribers.token, token)).limit(1) : [];

  async function confirm() {
    "use server";
    await unsubscribe(token);
    redirect(`/newsletter/baja/${encodeURIComponent(token)}`);
  }

  if (!row) {
    return (
      <>
        <PageHeader eyebrow="Newsletter" title="Este enlace ya no sirve" tone="lab" actions={<Button href="/contacto" variant="secondary">Escribinos</Button>}>
          Puede que el email ya se haya eliminado o que el enlace esté incompleto. Si querés dejar de recibir la newsletter, escribinos y lo resolvemos.
        </PageHeader>
      </>
    );
  }
  if (row.status === "unsubscribed") {
    return (
      <PageHeader eyebrow="Newsletter" title="Listo, no te escribimos más." tone="lab" actions={<Button href="/" variant="secondary">Volver al inicio</Button>}>
        Si cambiás de idea, escribinos y te volvemos a anotar.
      </PageHeader>
    );
  }
  return (
    <>
      <PageHeader
        eyebrow="Newsletter"
        title="¿Querés dejar de recibir la newsletter?"
        tone="lab"
        actions={
          <form action={confirm}>
            <Button type="submit">Sí, darme de baja</Button>
          </form>
        }
      >
        Un clic y no te mandamos nada más. Sin preguntas.
      </PageHeader>
      <Stratum tone="chalk">
        <Container className="max-w-3xl">
          <p className="text-muted">Tu email queda marcado como baja durante 12 meses, para no volver a escribirte, y después se borra solo. Si preferís que lo eliminemos antes, pedilo por el formulario de contacto.</p>
        </Container>
      </Stratum>
    </>
  );
}
