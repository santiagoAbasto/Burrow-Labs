import type { Metadata } from "next";
import { JsonLd } from "@/components/site/json-ld";
import { PageHeader } from "@/components/site/page-header";
import { Diagnostic } from "@/components/tools/diagnostic";
import { Container, Stratum } from "@/components/ui/stratum";
import { TerrainCut } from "@/components/ui/terrain-cut";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const generateMetadata = (): Promise<Metadata> => buildMetadata({
    path: "/diagnostico",
    title: "Diagnóstico express: ¿qué necesita tu negocio?",
    description: "Cinco preguntas, dos minutos. Al final te decimos por dónde conviene empezar: web, automatización, sistema, integración o IA.",
  });

export default function DiagnosticPage() {
  return (
    <>
      <PageHeader eyebrow="Diagnóstico express" title="¿Qué necesita tu negocio?">
        Cinco preguntas, dos minutos. Al final te decimos por dónde conviene empezar: web, automatización, sistema, integración o IA.
      </PageHeader>
      <TerrainCut from="deep" to="chalk" variant="shelf" />
      <Stratum tone="chalk" className="min-h-[60svh]">
        <Container>
          <Diagnostic />
        </Container>
      </Stratum>
      <JsonLd data={breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: "Diagnóstico express", path: "/diagnostico" }])} />
    </>
  );
}
