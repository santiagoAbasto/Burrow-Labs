import type { Metadata } from "next";
import { HOME_SECTIONS, parseSectionContent } from "@/components/home/sections";
import { JsonLd } from "@/components/site/json-ld";
import { PageHeader } from "@/components/site/page-header";
import { Calculator } from "@/components/tools/calculator";
import { CTA } from "@/components/ui/cta";
import { Container, Stratum } from "@/components/ui/stratum";
import { TerrainCut } from "@/components/ui/terrain-cut";
import { parseCalcParams } from "@/lib/calculator";
import { getHomeSections } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const generateMetadata = (): Promise<Metadata> => buildMetadata({ path: "/calculadora", title: "Calculadora de procesos manuales" });

/** La URL compartible lleva solo números (?p=&h=&c=&s=&r=). */
export default async function CalculatorPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [params, sections] = await Promise.all([searchParams, getHomeSections()]);
  const content = parseSectionContent("calculator", sections.find((section) => section.key === "calculator")?.content ?? HOME_SECTIONS.calculator.defaults);
  return (
    <>
      <PageHeader eyebrow={content.eyebrow} title={content.title}>
        {content.body}
      </PageHeader>
      <TerrainCut from="deep" to="chalk" variant="shelf" />
      <Stratum tone="chalk">
        <Container>
          <Calculator labels={content} initial={parseCalcParams(params)} />
        </Container>
      </Stratum>
      <TerrainCut from="chalk" to="topsoil" variant="ridge" />
      <CTA title="Si se repite, lo automatizamos." action={{ label: "Hacer el diagnóstico express", href: "/diagnostico" }} secondary={{ label: "Contanos qué querés resolver", href: "/contacto" }} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: "Calculadora de procesos manuales", path: "/calculadora" }])} />
    </>
  );
}
