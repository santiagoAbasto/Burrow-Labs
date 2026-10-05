import type { ReactNode } from "react";
import type { Tone } from "@/components/ui/stratum";
import CalculatorSection from "./calculator";
import Faq from "./faq";
import FinalCta from "./final-cta";
import GameSection from "./game";
import Hero from "./hero";
import Pains from "./pains";
import Phrases from "./phrases";
import Plans from "./plans";
import Problem from "./problem";
import Process from "./process";
import Projects from "./projects";
import { parseSectionContent, type HomeContent, type HomeSectionKey } from "./sections";
import Services from "./services";
import SocialProof from "./social-proof";
import Trust from "./trust";

type Entry<K extends HomeSectionKey> = {
  Component: (props: { content: HomeContent<K> }) => ReactNode | Promise<ReactNode>;
  /** Estrato con el que la sección empieza y termina: define los cortes de terreno entre secciones. */
  top: Tone;
  bottom: Tone;
};

export const HOME_REGISTRY: { [K in HomeSectionKey]: Entry<K> } = {
  hero: { Component: Hero, top: "surface", bottom: "lab" },
  phrases: { Component: Phrases, top: "lab", bottom: "lab" },
  social_proof: { Component: SocialProof, top: "lab", bottom: "lab" },
  problem: { Component: Problem, top: "lab", bottom: "lab" },
  pains: { Component: Pains, top: "lab", bottom: "lab" },
  services: { Component: Services, top: "deep", bottom: "deep" },
  process: { Component: Process, top: "deep", bottom: "deep" },
  projects: { Component: Projects, top: "lab", bottom: "lab" },
  trust: { Component: Trust, top: "lab", bottom: "lab" },
  calculator: { Component: CalculatorSection, top: "chalk", bottom: "chalk" },
  plans: { Component: Plans, top: "chalk", bottom: "chalk" },
  game: { Component: GameSection, top: "bedrock", bottom: "bedrock" },
  faq: { Component: Faq, top: "lab", bottom: "lab" },
  final_cta: { Component: FinalCta, top: "topsoil", bottom: "topsoil" },
};

export function renderHomeSection(key: HomeSectionKey, raw: unknown): ReactNode {
  const { Component } = HOME_REGISTRY[key] as Entry<HomeSectionKey>;
  return <Component content={parseSectionContent(key, raw)} />;
}
