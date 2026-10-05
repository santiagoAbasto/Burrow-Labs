import { ArrowUp } from "lucide-react";
import type { Metadata } from "next";
import { GameStage } from "@/components/game/game-stage";
import { HOME_SECTIONS } from "@/components/home/sections";
import { Button } from "@/components/ui/button";
import { Container, Stratum } from "@/components/ui/stratum";

export const metadata: Metadata = { title: "Página no encontrada", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <Stratum tone="bedrock" flush className="min-h-svh pt-32 pb-section lg:pt-44">
      <Container>
        <p className="type-mono text-muted">Error 404 · −404 m</p>
        <h1 className="mt-5 max-w-4xl type-h1">Parece que este burro cavó demasiado profundo.</h1>
        <p className="mt-6 type-lead">La página que buscás no existe o cambió de lugar.</p>
        <Button href="/" size="lg" icon={<ArrowUp />} className="mt-8">
          Volver a la superficie
        </Button>
        <section className="mt-16" aria-labelledby="jugar-title">
          <h2 id="jugar-title" className="type-h3">
            Jugar mientras estás acá
          </h2>
          <GameStage labels={HOME_SECTIONS.game.defaults} className="mt-6" />
        </section>
      </Container>
    </Stratum>
  );
}
