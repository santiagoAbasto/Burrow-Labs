import type { Metadata } from "next";
import { Fragment } from "react";
import { HOME_REGISTRY, renderHomeSection } from "@/components/home/registry";
import { isHomeSectionKey, type HomeSectionKey } from "@/components/home/sections";
import { JsonLd } from "@/components/site/json-ld";
import { TerrainCut } from "@/components/ui/terrain-cut";
import { getHomeSections, getSettings } from "@/lib/content";
import { buildMetadata, professionalServiceJsonLd } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  // Respaldo si la ruta no tiene fila en Admin → SEO. Ya nombra al sitio: no se le aplica la plantilla.
  return buildMetadata({ path: "/", title: "Burrow Labs | Software a medida, automatización e IA" });
}

const CUTS = ["ridge", "shelf", "fault"] as const;

/** El Home se arma desde `home_sections`: orden, visibilidad y textos vienen del CMS. */
export default async function HomePage() {
  const [sections, settings] = await Promise.all([getHomeSections(), getSettings()]);
  const keys = sections.filter((s) => s.enabled && isHomeSectionKey(s.key)).map((s) => s.key as HomeSectionKey);
  const raw = new Map(sections.map((s) => [s.key, s.content]));

  return (
    <>
      {keys.map((key, i) => {
        const previous = keys[i - 1];
        const from = previous && HOME_REGISTRY[previous].bottom;
        const to = HOME_REGISTRY[key].top;
        return (
          <Fragment key={key}>
            {from && from !== to && <TerrainCut from={from} to={to} variant={CUTS[i % CUTS.length]} flip={i % 2 === 0} />}
            {renderHomeSection(key, raw.get(key))}
          </Fragment>
        );
      })}
      <JsonLd data={professionalServiceJsonLd(settings)} />
    </>
  );
}
