"use client";

import { ArrowRight, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { HomeContent } from "@/components/home/sections";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { createState, jump, score, step, WORLD, type GameState, type Status } from "./engine";
import { draw } from "./render";

const BEST_KEY = "burrow-runner:best";
type Labels = Pick<HomeContent<"game">, "lose" | "loseQuestion" | "loseCta" | "controls">;

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

/** Burrow Runner. Se carga de forma diferida desde <GameStage>; arranca al montarse. */
export default function BurrowRunner({ labels }: { labels: Labels }) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const game = useRef<GameState>(createState());
  const audio = useRef<AudioContext | null>(null);
  const best = useRef(0);
  const mutedRef = useRef(true);
  const [status, setStatus] = useState<Status>("running");
  const [muted, setMuted] = useState(true);
  const [result, setResult] = useState({ score: 0, best: 0, record: false });

  const beep = (frequency: number, seconds: number) => {
    if (mutedRef.current) return;
    try {
      const ctx = (audio.current ??= new AudioContext());
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + seconds);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + seconds);
    } catch {
      // sin audio disponible: el juego sigue igual
    }
  };

  const start = useCallback(() => {
    const view = game.current.viewWidth;
    game.current = { ...createState(), status: "running", viewWidth: view };
    setStatus("running");
    track("game_start");
    box.current?.focus({ preventScroll: true });
  }, []);

  const setPaused = useCallback((paused: boolean) => {
    const state = game.current;
    if (state.status === "over" || state.status === "ready") return;
    state.status = paused ? "paused" : "running";
    setStatus(state.status);
  }, []);

  const act = () => {
    if (game.current.status === "over") return;
    if (game.current.status === "paused") return setPaused(false);
    if (jump(game.current)) beep(520, 0.09);
  };

  useEffect(() => {
    const el = canvas.current;
    const wrapper = box.current;
    const ctx = el?.getContext("2d");
    if (!el || !wrapper || !ctx) return;

    best.current = readBest();
    const mono = getComputedStyle(el).fontFamily;
    const mascot = new Image();
    mascot.src = "/brand/mascot.svg";

    let scale = 1;
    const resize = () => {
      const { width, height } = wrapper.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      scale = height / WORLD.height;
      el.width = Math.round(width * dpr);
      el.height = Math.round(height * dpr);
      game.current.viewWidth = width / scale;
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    };
    const resizer = new ResizeObserver(resize);
    resizer.observe(wrapper);
    resize();

    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      const state = game.current;
      const events = step(state, (now - last) / 1000);
      last = now;
      for (const event of events) {
        if (event === "collect") beep(880, 0.07);
        if (event === "hit") {
          beep(140, 0.3);
          const final = score(state);
          const record = final > best.current;
          if (record) {
            best.current = final;
            try {
              localStorage.setItem(BEST_KEY, String(final));
            } catch {
              // almacenamiento bloqueado: el récord vive solo en esta partida
            }
          }
          setResult({ score: final, best: best.current, record });
          setStatus("over");
          track("game_complete", { score: final });
        }
      }
      draw(ctx, state, best.current, mascot, mono);
    };
    frame = requestAnimationFrame(loop);

    // Fuera de pantalla o con la pestaña oculta, el juego se pausa solo.
    const onVisibility = () => document.hidden && setPaused(true);
    const visible = new IntersectionObserver(([entry]) => !entry.isIntersecting && setPaused(true), { threshold: 0.25 });
    visible.observe(wrapper);
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      cancelAnimationFrame(frame);
      resizer.disconnect();
      visible.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      void audio.current?.close();
    };
  }, [setPaused, start]);

  const toggleMute = () => {
    mutedRef.current = !mutedRef.current;
    setMuted(mutedRef.current);
  };

  return (
    <div
      ref={box}
      tabIndex={0}
      role="group"
      aria-label="Burrow Runner. Espacio o flecha arriba para saltar, P para pausar, M para el sonido."
      className="relative size-full outline-offset-[-4px]"
      onKeyDown={(event) => {
        if (event.target instanceof HTMLButtonElement || event.target instanceof HTMLAnchorElement) return;
        if (event.code === "Space" || event.code === "ArrowUp") {
          event.preventDefault(); // dentro del juego, la barra no hace scroll
          if (game.current.status === "over") start();
          else act();
        } else if (event.code === "KeyP") setPaused(game.current.status === "running");
        else if (event.code === "KeyM") toggleMute();
      }}
    >
      <canvas ref={canvas} onPointerDown={act} className="block size-full touch-manipulation font-mono select-none" aria-hidden="true" />

      <div className="absolute top-2 left-2 flex gap-1.5">
        <button
          type="button"
          onClick={() => setPaused(status === "running")}
          disabled={status === "over"}
          aria-label={status === "paused" ? "Reanudar" : "Pausar"}
          className="grid size-11 place-items-center rounded-md border border-line-strong bg-bg/80 disabled:opacity-40"
        >
          {status === "paused" ? <Play aria-hidden="true" className="size-5" /> : <Pause aria-hidden="true" className="size-5" />}
        </button>
        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Activar sonido" : "Silenciar"}
          aria-pressed={!muted}
          className="grid size-11 place-items-center rounded-md border border-line-strong bg-bg/80"
        >
          {muted ? <VolumeX aria-hidden="true" className="size-5" /> : <Volume2 aria-hidden="true" className="size-5" />}
        </button>
      </div>

      {status === "paused" && (
        <div className="absolute inset-0 grid place-items-center bg-bg/70">
          <Button onClick={() => setPaused(false)} icon={<Play />}>
            Seguir jugando
          </Button>
        </div>
      )}

      {status === "over" && (
        <div role="status" className="absolute inset-0 grid place-items-center overflow-y-auto bg-bg/85 p-4 text-center">
          <div>
            <p className="type-h3">{labels.lose}</p>
            <p className="mt-1 type-mono text-muted">
              Puntaje {result.score} · Récord {result.best}
              {result.record && " · ¡nuevo récord!"}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button onClick={start} icon={<RotateCcw />}>
                Jugar de nuevo
              </Button>
              <Button href="/contacto" variant="secondary" icon={<ArrowRight />}>
                {labels.loseCta}
              </Button>
            </div>
            <p className="mt-3 type-small text-muted">{labels.loseQuestion}</p>
          </div>
        </div>
      )}
    </div>
  );
}
