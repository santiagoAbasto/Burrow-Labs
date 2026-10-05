"use client";

import { Play } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Cart } from "@/components/brand/cart";
import type { HomeContent } from "@/components/home/sections";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

// El juego no viaja en el bundle inicial: se descarga recién al pulsar «Jugar».
const BurrowRunner = dynamic(() => import("./burrow-runner"), {
  ssr: false,
  loading: () => <p className="grid size-full place-items-center type-mono text-muted">Cargando el túnel…</p>,
});

type Labels = Pick<HomeContent<"game">, "play" | "controls" | "lose" | "loseQuestion" | "loseCta">;

/** Pantalla de arcade: póster con «Jugar»; el juego se monta al pulsarlo. */
export function GameStage({ labels, className }: { labels: Labels; className?: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className={className}>
      <div
        data-stratum="bedrock"
        className={cn("relative h-[230px] overflow-hidden rounded-lg border-2 border-line-strong sm:h-[300px] lg:h-[360px]")}
      >
        {playing ? (
          <BurrowRunner labels={labels} />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-5">
            <div aria-hidden="true" className="absolute inset-x-0 bottom-[16%] h-[3px] bg-yellow-400" />
            <Cart className="absolute bottom-[16%] left-[8%] w-16 sm:w-20" />
            <Button size="lg" onClick={() => setPlaying(true)} icon={<Play />}>
              {labels.play}
            </Button>
          </div>
        )}
      </div>
      <p className="mt-3 type-small text-muted">{labels.controls}</p>
    </div>
  );
}
