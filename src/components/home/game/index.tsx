import { GameStage } from "@/components/game/game-stage";
import { SectionHeading } from "@/components/ui/section-heading";
import { Container, Stratum } from "@/components/ui/stratum";
import type { HomeContent } from "../sections";

export default function GameSection({ content }: { content: HomeContent<"game"> }) {
  return (
    <Stratum tone="bedrock" id="juego" label="Arcade" depth={82} aria-labelledby="juego-title">
      <Container>
        <SectionHeading id="juego-title" eyebrow={content.eyebrow} title={content.title}>
          {content.body}
        </SectionHeading>
        <GameStage labels={content} className="mt-12" />
      </Container>
    </Stratum>
  );
}
