import type { CSSProperties, ReactNode } from "react";
import { Grip, Leg } from "@/components/brand/limbs";
import { Mascot } from "@/components/brand/mascot";
import { SceneStage } from "./scene-stage";

// El burro sostiene cada plan: el nombre del plan va en un cartel y el burro lo agarra con las pezuñas
// (parado detrás, con las patas asomando por debajo) o se sienta encima con las patas colgando.
// La mascota es SIEMPRE el vector original sin tocar. Las pezuñas, las patas y los accesorios son
// piezas nuevas dibujadas aparte, con el mismo trazo que el logo (relleno plano, línea negra, borde amarillo).
// Lienzo de 240 × 200: cartel de y = 126 a 170, suelo en y = 194. El movimiento está en plans.css.

const INK = "#080a09";
const YELLOW = "#fcea10";
const BLUE = "#1671b1";
const NAVY = "#174e74";
const STEEL = "#5e615e";
const GRAY = "#c4c2c1";
const WHITE = "#ffffff";

const SIGN_TOP = 126;
const SIGN_BOTTOM = 170;
const GROUND = 194;

const stroke = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round", strokeLinecap: "round" } as const;
const line = { ...stroke, strokeWidth: 2.6 } as const;
const halo = { fill: YELLOW, stroke: YELLOW, strokeWidth: 6.5, strokeLinejoin: "round" } as const;
const vars = (values: Record<string, string>) => values as CSSProperties;

function gear(cx: number, cy: number, r: number, teeth: number): string {
  const points: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    for (const offset of [-0.22, 0.22]) {
      const angle = ((i + offset) / (teeth * 2)) * Math.PI * 2;
      const radius = i % 2 === 0 ? r : r * 0.74;
      points.push(`${(cx + Math.cos(angle) * radius).toFixed(1)} ${(cy + Math.sin(angle) * radius).toFixed(1)}`);
    }
  }
  return `M${points.join(" L")} Z`;
}

const star = (x: number, y: number, r: number) => `M${x} ${y - r} l${r * 0.3} ${r * 0.7} l${r * 0.7} ${r * 0.3} l${-r * 0.7} ${r * 0.3} l${-r * 0.3} ${r * 0.7} l${-r * 0.3} ${-r * 0.7} l${-r * 0.7} ${-r * 0.3} l${r * 0.7} ${-r * 0.3} z`;
const INFINITY = "M100 34 C122 8 160 8 160 34 C160 60 122 60 100 34 C78 8 40 8 40 34 C40 60 78 60 100 34 Z";

/** Brazo levantado que saluda: manga de la sudadera, mano y pezuña. Sale de atrás del cartel. */
function WavingArm({ x }: { x: number }) {
  const pill = { x: x - 7.5, y: 84, width: 15, height: SIGN_TOP + 10 - 84, rx: 7.5 };
  const hand = `M${x - 7.5} 102 v-10.5 a7.5 7.5 0 0 1 15 0 v10.5 z`;
  return (
    <g className="fx-wave" style={{ transformOrigin: `${x}px ${SIGN_TOP + 4}px` }}>
      <rect {...pill} {...halo} />
      <rect {...pill} fill={BLUE} {...line} />
      <path d={hand} fill={GRAY} {...line} />
      <path d={`M${x - 7.5} 91.5 a7.5 7.5 0 0 1 15 0 z`} fill={STEEL} {...line} />
    </g>
  );
}

/** Estacas que clavan el cartel al suelo cuando el burro está sentado encima. */
const stakes = (
  <>
    {[40, 150].map((x) => (
      <rect key={x} x={x - 4} y={SIGN_BOTTOM - 4} width="8" height={GROUND - SIGN_BOTTOM + 4} fill={STEEL} {...line} />
    ))}
  </>
);

type Scene = {
  /** `holds`: parado detrás del cartel, lo agarra con las pezuñas. `sits`: sentado encima, patas colgando. */
  pose: "holds" | "sits";
  /** Centro del burro en el lienzo (0–240). */
  x: number;
  /** Clase de animación de las patas. */
  legs: string;
  /** Con `false`, la pezuña derecha no agarra el cartel (la escena dibuja ese brazo). */
  rightHoof?: boolean;
  /** Capas de accesorios: detrás de todo, entre el burro y el cartel, y delante de todo. */
  back?: ReactNode;
  mid?: ReactNode;
  front?: ReactNode;
};

const SCENES: Record<string, Scene> = {
  // Se esconde detrás del cartel y vuelve a asomar, entre montículos de tierra recién cavada.
  madriguera: {
    pose: "holds",
    x: 120,
    legs: "fx-step",
    back: <ellipse cx="120" cy="194" rx="46" ry="6" fill={INK} />,
    front: (
      <>
        {[
          ["-22px", "-40px", 40, GRAY],
          ["-4px", "-54px", 50, BLUE],
          ["16px", "-42px", 58, YELLOW],
          ["-18px", "-44px", 186, GRAY],
          ["8px", "-56px", 196, YELLOW],
          ["24px", "-36px", 204, GRAY],
        ].map(([dx, dy, x, fill], i) => (
          <circle key={i} className="fx-dirt" style={vars({ "--dx": String(dx), "--dy": String(dy) })} cx={Number(x)} cy="176" r={i % 2 ? 3 : 4} fill={String(fill)} stroke={INK} strokeWidth="1.5" />
        ))}
        {["M10 195 C24 195 28 173 46 173 C64 173 68 195 82 195 Z", "M162 195 C174 195 178 178 194 178 C210 178 214 195 226 195 Z"].map((mound) => (
          <g key={mound} className="fx-mound">
            <path d={mound} {...halo} />
            <path d={mound} fill={NAVY} {...stroke} />
          </g>
        ))}
        <circle cx="38" cy="187" r="3" fill={GRAY} />
        <circle cx="56" cy="184" r="2.5" fill={GRAY} />
        <circle cx="200" cy="188" r="3" fill={GRAY} />
      </>
    ),
  },
  // Sentado sobre el cartel, que rebota sobre dos resortes.
  impulso: {
    pose: "sits",
    x: 194,
    legs: "fx-flop",
    back: (
      <>
        {[44, 150].map((x) => (
          <path key={x} className="fx-spring" style={{ transformOrigin: `${x}px ${GROUND}px` }} d={`M${x - 12} ${SIGN_BOTTOM} l24 4 l-24 4 l24 4 l-24 4 l24 4 l-24 4`} fill="none" stroke={INK} strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {[22, 44, 96, 118].map((x, i) => (
          <path key={x} className="fx-rise" style={{ animationDelay: `${i * 0.21}s` }} d={`M${x - 8} 108 l8 -9 l8 9`} fill="none" stroke={BLUE} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        <path className="fx-twinkle" d={star(30, 40, 9)} fill={YELLOW} stroke={INK} strokeWidth="1.5" />
        <path className="fx-twinkle" style={{ animationDelay: "0.5s" }} d={star(112, 26, 7)} fill={YELLOW} stroke={INK} strokeWidth="1.5" />
        <path className="fx-twinkle" style={{ animationDelay: "0.9s" }} d={star(74, 62, 5)} fill={WHITE} stroke={INK} strokeWidth="1.5" />
      </>
    ),
  },
  // Corre con el cartel a toda velocidad: patas a mil, polvo, estelas y fuego.
  turbo: {
    pose: "holds",
    x: 132,
    legs: "fx-run",
    back: (
      <>
        {[
          [46, 0],
          [66, 0.25],
          [86, 0.1],
          [106, 0.4],
          [26, 0.55],
        ].map(([y, delay]) => (
          <path key={y} className="fx-streak" style={{ animationDelay: `${delay}s` }} d={`M6 ${y} h${30 + (y % 3) * 10}`} stroke={y % 4 ? YELLOW : BLUE} strokeWidth="4.5" strokeLinecap="round" />
        ))}
        {[0, 0.3, 0.6].map((delay) => (
          <circle key={delay} className="fx-dust" style={{ animationDelay: `${delay}s` }} cx="92" cy="187" r="8" fill={GRAY} stroke={INK} strokeWidth="1.5" />
        ))}
        <g className="fx-flame">
          <path d="M12 136 C-10 130 -18 142 -32 136 C-18 148 -12 160 12 158 Z" fill={YELLOW} {...stroke} strokeWidth="2.5" />
          <path d="M10 141 C-2 139 -8 144 -16 142 C-7 148 -2 152 10 151 Z" fill={WHITE} />
        </g>
      </>
    ),
  },
  // Sentado sobre el cartel mientras le enchufan todo: cables con datos viajando.
  conecta: {
    pose: "sits",
    x: 194,
    legs: "fx-swing",
    back: (
      <>
        {stakes}
        <g className="fx-flow" fill="none" stroke={YELLOW} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="5 9">
          <path d="M28 46 C28 92 50 92 50 124" />
          <path d="M94 32 C94 84 112 84 112 124" />
          <path d="M140 66 C140 96 132 100 132 124" />
        </g>
        {["M28 46 C28 92 50 92 50 124", "M94 32 C94 84 112 84 112 124", "M140 66 C140 96 132 100 132 124"].map((path, i) => (
          <circle key={path} className="fx-packet" style={{ offsetPath: `path("${path}")`, animationDelay: `${i * 0.45}s` }} r="4.5" fill={WHITE} stroke={INK} strokeWidth="2" />
        ))}
        {[50, 112, 132].map((x) => (
          <rect key={x} x={x - 5.5} y={SIGN_TOP - 9} width="11" height="10" rx="2" fill={INK} />
        ))}
        {[
          [28, 34, "M23 34 h10 M28 29 v10"],
          [94, 20, "M89 20 h10"],
          [140, 54, "M135 54 h10 M140 49 v10"],
        ].map(([x, y, icon], i) => (
          <g key={String(icon)} className="fx-pulse" style={{ animationDelay: `${i * 0.3}s`, transformOrigin: `${x}px ${y}px` }}>
            <rect x={Number(x) - 12} y={Number(y) - 12} width="24" height="24" rx="6" fill={BLUE} {...stroke} />
            <path d={String(icon)} stroke={WHITE} strokeWidth="3" strokeLinecap="round" />
          </g>
        ))}
        <path className="fx-twinkle" d={star(64, 70, 7)} fill={YELLOW} stroke={INK} strokeWidth="1.5" />
      </>
    ),
  },
  // El cartel va sobre engranajes y el burro saluda con una pezuña libre: se hace solo.
  automatiza: {
    pose: "holds",
    x: 120,
    legs: "fx-step",
    rightHoof: false,
    back: (
      <>
        <g className="fx-spin" style={{ transformOrigin: "204px 168px" }}>
          <path d={gear(204, 168, 26, 9)} fill={STEEL} {...stroke} />
          <circle cx="204" cy="168" r="8" fill={YELLOW} {...stroke} />
        </g>
        <g className="fx-spin-reverse" style={{ transformOrigin: "32px 174px" }}>
          <path d={gear(32, 174, 19, 7)} fill={GRAY} {...stroke} />
          <circle cx="32" cy="174" r="6" fill={BLUE} {...stroke} />
        </g>
        <g className="fx-spin" style={{ transformOrigin: "222px 112px", animationDuration: "1.6s" }}>
          <path d={gear(222, 112, 12, 6)} fill={YELLOW} {...stroke} strokeWidth="2.5" />
        </g>
        {[
          [36, 0],
          [60, 0.7],
          [20, 1.4],
        ].map(([x, delay]) => (
          <g key={x} className="fx-check" style={{ animationDelay: `${delay}s` }}>
            <circle cx={x} cy="86" r="10" fill={YELLOW} {...stroke} strokeWidth="2.5" />
            <path d={`M${x - 5} 86 l4 4 l7 -8`} fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}
      </>
    ),
    mid: <WavingArm x={180} />,
  },
  // Levanta el cartel en puntas de pie mientras las barras crecen y la flecha sale disparada.
  escala: {
    pose: "holds",
    x: 84,
    legs: "fx-tiptoe",
    back: (
      <>
        {[
          [166, 22],
          [184, 40],
          [202, 60],
          [220, 82],
        ].map(([x, h], i) => (
          <rect key={x} className="fx-grow" style={{ animationDelay: `${i * 0.16}s`, transformOrigin: `${x}px ${SIGN_TOP}px` }} x={x - 7} y={SIGN_TOP - h} width="14" height={h} rx="2" fill={BLUE} {...stroke} />
        ))}
        <path className="fx-arrow" pathLength={1} d="M148 96 L226 22" fill="none" stroke={YELLOW} strokeWidth="5" strokeLinecap="round" />
        <path className="fx-arrowhead" d="M226 22 h-16 M226 22 v16" fill="none" stroke={YELLOW} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path className="fx-twinkle" d={star(232, 10, 7)} fill={WHITE} stroke={INK} strokeWidth="1.5" />
      </>
    ),
  },
  // Sentado sobre el cartel entre ventanas, gráficos y una notificación que salta.
  sistema: {
    pose: "sits",
    x: 194,
    legs: "fx-swing",
    back: (
      <>
        {stakes}
        <g className="fx-float">
          <rect x="6" y="20" width="64" height="48" rx="5" fill={WHITE} {...stroke} />
          <rect x="6" y="20" width="64" height="12" rx="5" fill={BLUE} {...stroke} />
          <path className="fx-type" style={{ transformOrigin: "16px 44px" }} d="M16 44 h36" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <path className="fx-type" style={{ transformOrigin: "16px 55px", animationDelay: "0.5s" }} d="M16 55 h24" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <circle className="fx-ping" style={{ transformOrigin: "70px 20px" }} cx="70" cy="20" r="7" fill={YELLOW} {...stroke} strokeWidth="2.5" />
        </g>
        <g className="fx-float" style={{ animationDelay: "-1.4s" }}>
          <rect x="82" y="50" width="60" height="56" rx="5" fill={WHITE} {...stroke} />
          <rect x="82" y="50" width="60" height="12" rx="5" fill={INK} />
          {[
            [94, 22],
            [106, 30],
            [118, 16],
            [130, 26],
          ].map(([x, h], i) => (
            <rect key={x} className="fx-grow" style={{ animationDelay: `${i * 0.2}s`, animationDuration: "1.5s", transformOrigin: `${x}px 100px` }} x={x - 4} y={100 - h} width="8" height={h} fill={BLUE} />
          ))}
        </g>
      </>
    ),
  },
  // Levita con el cartel bajo un infinito con dos órbitas; las patas le cuelgan.
  infinito: {
    pose: "holds",
    x: 120,
    legs: "fx-swing",
    back: (
      <>
        <ellipse className="fx-shadow" cx="120" cy="194" rx="34" ry="4" fill={INK} opacity="0.3" />
        <g transform="translate(120 46) scale(1.5) translate(-100 -34)">
          <path d={INFINITY} fill="none" stroke={NAVY} strokeWidth="5" strokeLinecap="round" opacity="0.25" />
          <path className="fx-flow" d={INFINITY} fill="none" stroke={YELLOW} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="14 10" />
          {[0, -2].map((delay) => (
            <circle key={delay} className="fx-orbit" style={{ offsetPath: `path("${INFINITY}")`, animationDelay: `${delay}s` }} r="4.5" fill={delay ? BLUE : WHITE} {...stroke} strokeWidth="1.8" />
          ))}
        </g>
        <path className="fx-twinkle" d={star(16, 104, 9)} fill={BLUE} />
        <path className="fx-twinkle" style={{ animationDelay: "0.6s" }} d={star(224, 96, 7)} fill={BLUE} />
        <path className="fx-twinkle" style={{ animationDelay: "1.1s" }} d={star(206, 116, 5)} fill={YELLOW} stroke={INK} strokeWidth="1" />
      </>
    ),
  },
};

const ORDER = Object.keys(SCENES);

/** Elige la escena por slug del plan; un plan nuevo del CMS recibe una de forma estable. */
function sceneName(slug: string): string {
  if (SCENES[slug]) return slug;
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return ORDER[hash % ORDER.length];
}

const layer = (children: ReactNode) => (
  <svg viewBox="0 0 240 200" className="plan-scene-layer" aria-hidden="true">
    {children}
  </svg>
);
const percent = (units: number) => `${(units / 240) * 100}%`;

/** Ilustración del plan: el burro sosteniendo el cartel con el nombre (que es el titular de la tarjeta). */
export function PlanScene({ slug, name }: { slug: string; name: string }) {
  const key = sceneName(slug);
  const scene = SCENES[key];
  const holds = scene.pose === "holds";
  const burro = <Mascot variant="mascot" sizes="140px" lively className="w-full" />;

  return (
    <SceneStage className={`plan-scene scene-${key} pose-${scene.pose}`} style={vars({ "--i": String(ORDER.indexOf(key)) })}>
      {scene.back && layer(scene.back)}
      {/* entrada → reacción al hover → movimiento propio de la escena */}
      <div className="scene-enter">
        <div className="scene-party">
          <div className="scene-actor">
            {holds &&
              layer(
                <>
                  <Leg x={scene.x - 13} top={SIGN_BOTTOM - 20} foot={GROUND - 1} className={scene.legs} />
                  <Leg x={scene.x + 13} top={SIGN_BOTTOM - 20} foot={GROUND - 1} className={`${scene.legs} leg-b`} />
                </>,
              )}
            <div className="rig-top">
              {holds && (
                // El recorte es fijo: cuando el burro se esconde, no reaparece por debajo del cartel.
                <div className="rig-bust-clip">
                  <div className="rig-bust" style={{ left: percent(scene.x - 48), width: percent(96), top: "10%" }}>
                    {burro}
                  </div>
                </div>
              )}
              {scene.mid && layer(scene.mid)}
              <div className="plan-sign">
                <h3 className="plan-sign-name">{name}</h3>
              </div>
              {!holds &&
                layer(
                  <>
                    <Leg x={scene.x - 11} top={SIGN_TOP - 6} foot={SIGN_BOTTOM - 9} className={scene.legs} />
                    <Leg x={scene.x + 12} top={SIGN_TOP - 6} foot={SIGN_BOTTOM - 9} className={`${scene.legs} leg-b`} />
                  </>,
                )}
              {!holds && (
                <div className="rig-bust" style={{ left: percent(scene.x - 40), width: percent(80), top: "2.5%" }}>
                  {burro}
                </div>
              )}
              {holds &&
                layer(
                  <>
                    <Grip x={scene.x - 36} edge={SIGN_TOP} className="fx-hoof" />
                    {scene.rightHoof !== false && <Grip x={scene.x + 36} edge={SIGN_TOP} className="fx-hoof" delay={-0.7} />}
                  </>,
                )}
            </div>
          </div>
        </div>
      </div>
      {scene.front && layer(scene.front)}
      <span className="plan-scene-ground" aria-hidden="true" />
    </SceneStage>
  );
}
