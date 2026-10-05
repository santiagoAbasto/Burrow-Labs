import type { Metadata } from "next";
import { ConsentReset } from "@/components/site/consent-analytics";
import { JsonLd } from "@/components/site/json-ld";
import { PageHeader } from "@/components/site/page-header";
import { Markdown } from "@/components/ui/markdown";
import { Container, Stratum } from "@/components/ui/stratum";
import { hasPendingMarkers } from "@/db/seed/legal";
import { getSettings } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

const PATH = "/cookies";
const TITLE = "Política de cookies";

// Un borrador (texto con marcadores pendientes) nunca se indexa; al completarlo en el panel vuelve a ser indexable solo.
export async function generateMetadata(): Promise<Metadata> {
  const { legal } = await getSettings();
  return buildMetadata({ path: PATH, title: TITLE, noindex: hasPendingMarkers(legal.cookies) });
}

export default async function LegalPage() {
  const { legal } = await getSettings();
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: TITLE, path: PATH }])} />
      <PageHeader eyebrow="Legal" title={TITLE} tone="lab" />
      <Stratum tone="chalk">
        <Container className="max-w-3xl">
          <Markdown>{legal.cookies}</Markdown>
          <ConsentReset />
        </Container>
      </Stratum>
    </>
  );
}
