import { ArrowDown, ArrowRight } from "lucide-react";
import { Mascot } from "@/components/brand/mascot";
import { TrackClick } from "@/components/site/track";
import { Button } from "@/components/ui/button";
import { Sticker } from "@/components/ui/sticker";
import { Container } from "@/components/ui/stratum";
import { TerrainCut } from "@/components/ui/terrain-cut";
import { getFeaturedProjects } from "@/lib/content";
import type { HomeContent } from "../sections";
import { HeroDescent } from "./descent";

const TILT = ["-rotate-3", "rotate-2", "-rotate-1", "rotate-3", "-rotate-2", "rotate-1"];

export default async function Hero({ content }: { content: HomeContent<"hero"> }) {
  // Sin proyectos publicados, «Ver proyectos» lleva a los servicios.
  const hasProjects = (await getFeaturedProjects()).length > 0;

  return (
    <HeroDescent surfaceItems={content.surfaceItems} depthItems={content.depthItems}>
      <div data-stratum="surface" className="hero-panel hero-intro flex min-h-svh items-center pt-24 pb-16">
        <Container>
          <p className="flex items-center gap-2.5 type-mono">
            <span className="veta-dot" aria-hidden="true" />
            {content.eyebrow}
          </p>
          <h1 className="mt-5 type-display">{content.title}</h1>
          <div className="mt-6 grid items-start gap-10 lg:mt-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="type-lead">{content.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <TrackClick event="cta_hero" meta={{ cta: "primary" }}>
                <Button href="/contacto" size="lg" icon={<ArrowRight />}>
                  {content.ctaPrimary}
                </Button>
              </TrackClick>
              <TrackClick event="cta_hero" meta={{ cta: "secondary" }}>
                <Button href={hasProjects ? "/proyectos" : "#servicios"} size="lg" variant="secondary" icon={hasProjects ? <ArrowRight /> : <ArrowDown />}>
                  {content.ctaSecondary}
                </Button>
              </TrackClick>
            </div>
            <Sticker as="span" tilt="left" className="mt-10 inline-block max-[380px]:hidden">
              <span className="block px-3 py-1.5 type-mono font-bold">{content.badge}</span>
            </Sticker>
          </div>

          {/* El burro está siempre. Las etiquetas son la versión sin canvas del desorden de la superficie: con la escena 3D las reemplazan las tarjetas. */}
          <div className="hero-static relative mx-auto w-full max-w-sm lg:col-span-5 lg:col-start-8 lg:mt-6" aria-hidden="true">
            <Mascot variant="badge" sizes="(min-width: 1024px) 320px, 70vw" priority className="mx-auto w-3/4" />
            <ul className="mt-6 flex flex-wrap justify-center gap-2 xl:-mx-8">
              {content.surfaceItems.map((item, i) => (
                <li key={item} className={`${TILT[i % TILT.length]} rounded-md border border-dashed border-line-strong bg-panel px-3 py-1.5 type-mono`}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          </div>
        </Container>
      </div>

      <div className="hero-static">
        <TerrainCut from="surface" to="deep" variant="fault" />
      </div>
      <div data-stratum="deep" className="hero-panel flex items-center py-section">
        <Container>
          <p className="hero-bridge type-h2 text-balance max-lg:rounded-lg max-lg:bg-navy-800/90 max-lg:p-5">{content.bridge}</p>
          <ul className="hero-static mt-10 flex flex-wrap gap-2" aria-label="En qué se convierten">
            {content.depthItems.map((item) => (
              <li key={item} className="rounded-md border border-yellow-400 bg-panel px-3 py-1.5 type-mono">
                {item}
              </li>
            ))}
          </ul>
        </Container>
      </div>

      <div className="hero-static">
        <TerrainCut from="deep" to="lab" variant="ridge" />
      </div>
      <div data-stratum="lab" className="hero-panel flex items-end py-section text-center">
        <Container className="grid justify-items-center">
          <Mascot variant="mascot" sizes="220px" className="hero-static mb-8 w-44" />
          <p className="type-display">{content.closingTitle}</p>
          <p className="mt-3 type-h3 text-accent">{content.closingTagline}</p>
        </Container>
      </div>
    </HeroDescent>
  );
}
