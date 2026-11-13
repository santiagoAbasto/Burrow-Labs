"use client";

// Piezas de la campaña de Navidad. Este archivo (y season.css) solo se descarga con la campaña encendida: lo pide
// SeasonSlot (provider.tsx). Todo es decorativo salvo los controles: `aria-hidden`, sin foco y sin capturar clics.
//
// El burro NO se redibuja (docs/BRAND-ASSETS.md): es el vector oficial de public/brand/. El gorro, el trineo, los
// renos y el paisaje son accesorios externos dibujados acá, igual que la vagoneta.
import { Music, Sparkles, VolumeX } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore, type ReactNode, type SVGProps } from "react";
import type { SeasonView } from "@/lib/season";
import { stopSeasonPreview } from "@/lib/admin/season-actions";
import { setReducedEffects, useReducedEffects } from "./provider";
import "./season.css";

type PieceProps = { view: SeasonView };

/* Colores de temporada (season.css). El amarillo y los azules son los de la marca. */
const C = {
  red: "var(--nv-red)",
  redDeep: "var(--nv-red-deep)",
  pine: "var(--nv-pine)",
  pineLight: "var(--nv-pine-light)",
  gold: "var(--color-yellow-400)",
  goldDeep: "var(--color-yellow-500)",
  snow: "#ffffff",
  fur: "#9a6b45",
  furLight: "#c9a27a",
  furDark: "#6b4a2b",
  ink: "var(--color-ink)",
  blue: "var(--color-blue-400)",
};

function Svg({ className = "", children, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`nv-svg ${className}`} aria-hidden="true" focusable="false" {...rest}>
      {children}
    </svg>
  );
}

const SPARK = "M12 0C13 7 17 11 24 12C17 13 13 17 12 24C11 17 7 13 0 12C7 11 11 7 12 0Z";

/* ───────────── Gorro: tapa las DOS orejas del burro por completo; no modifica la marca ─────────────
   Lienzo 100×100, con la colita y el pompón cayendo hacia la izquierda. Está dibujado como el burro del logotipo:
   contorno de tinta y, por fuera, el borde amarillo de sticker. Así se lee como parte de la ilustración y no como
   un recorte pegado encima. La banda blanca apoya en la cabeza, justo sobre el ojo. */
const HAT_TAIL = "M42 9C20 5 4 22 4 50";
const HAT_CROWN = "M6 84C6 34 20 4 50 4C80 4 94 34 94 84Z";

/** La silueta entera (colita, copa, banda y pompón) trazada con un solo color: sirve de contorno. */
function HatSilhouette({ color, width }: { color: string; width: number }) {
  const line = { fill: color, stroke: color, strokeWidth: width, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  return (
    <>
      <path d={HAT_TAIL} fill="none" stroke={color} strokeWidth={15 + width} strokeLinecap="round" />
      <path d={HAT_CROWN} {...line} />
      <rect x="0" y="76" width="100" height="21" rx="10.5" {...line} />
      {[9, 23, 37, 51, 65, 79].map((x) => (
        <circle key={x} cx={x + 6} cy="78" r="8" {...line} />
      ))}
      <circle cx="4" cy="55" r="10" {...line} />
    </>
  );
}

function HatDrawing() {
  return (
    <>
      <HatSilhouette color={C.gold} width={9} />
      <HatSilhouette color={C.ink} width={4} />
      {/* colita caída hacia la izquierda, detrás de la copa */}
      <path d={HAT_TAIL} fill="none" stroke={C.redDeep} strokeWidth="15" strokeLinecap="round" />
      {/* copa */}
      <path d={HAT_CROWN} fill={C.red} />
      <path d="M6 84C6 52 12 24 28 11C20 30 18 56 20 84Z" fill={C.redDeep} />
      <path d="M81 62C80 38 72 20 56 13" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" opacity=".28" />
      <path d="M44 6C30 9 20 22 14 40" fill="none" stroke={C.ink} strokeWidth="2" strokeLinecap="round" opacity=".55" />
      {/* banda de piel */}
      <rect x="0" y="76" width="100" height="21" rx="10.5" fill={C.snow} />
      {[9, 23, 37, 51, 65, 79].map((x) => (
        <circle key={x} cx={x + 6} cy="78" r="8" fill={C.snow} />
      ))}
      <path d="M10 92.5H90" stroke="#d9dde2" strokeWidth="3" strokeLinecap="round" />
      {/* pompón */}
      <circle cx="4" cy="55" r="10" fill={C.snow} />
      <path d="M-2 58C0 62.5 6 63.5 10 61" fill="none" stroke="#d9dde2" strokeWidth="2.6" strokeLinecap="round" />
    </>
  );
}

/** El gorro de cada burro del sitio (lo monta Mascot): lo posiciona `.nv-hat` (season.css), medido contra el vector. */
export function Hat({ view }: PieceProps) {
  if (!view.characters) return null;
  return (
    <Svg viewBox="-14 -8 120 112" className="nv-hat">
      <HatDrawing />
    </Svg>
  );
}

/* ───────────── Luces: cable con focos que parpadean por turnos y colgantes entre foco y foco ───────────── */
const BULBS = [
  { x: 30, color: C.gold },
  { x: 90, color: C.red },
  { x: 150, color: C.snow },
  { x: 210, color: C.blue },
];

function LightsRun() {
  return (
    <Svg viewBox="0 0 240 46" className="nv-lights-run" preserveAspectRatio="xMidYMin meet">
      <path d="M0 4Q30 20 60 4T120 4T180 4T240 4" fill="none" stroke={C.pine} strokeWidth="1.8" />
      {[60, 120, 180, 240].map((x, i) => (
        <g key={x} className={`nv-swing nv-swing-${"abc"[i % 3]}`}>
          <path d={`M${x} 4V${i % 2 ? 22 : 16}`} stroke={C.goldDeep} strokeWidth="1" />
          {i % 2 ? <circle cx={x} cy="27" r="5" fill={i === 1 ? C.red : C.pineLight} /> : <path d={SPARK} fill={C.gold} transform={`translate(${x - 6} 14) scale(.5)`} />}
        </g>
      ))}
      {BULBS.map(({ x, color }, i) => (
        <g key={x}>
          <circle className={`nv-glow nv-bulb-${i + 1}`} cx={x} cy="20" r="10" fill={color} opacity=".3" />
          <rect x={x - 3} y="10" width="6" height="4.4" rx="1.2" fill={C.pine} />
          <ellipse className={`nv-bulb nv-bulb-${i + 1}`} cx={x} cy="20" rx="5.4" ry="7.2" fill={color} />
          <ellipse cx={x - 1.8} cy="17.5" rx="1.3" ry="2.4" fill="#fff" opacity=".55" />
        </g>
      ))}
    </Svg>
  );
}

function Lights({ runs = 9, className = "" }: { runs?: number; className?: string }) {
  return (
    <div className={`nv-lights ${className}`} aria-hidden="true">
      {Array.from({ length: runs }, (_, i) => (
        <LightsRun key={i} />
      ))}
    </div>
  );
}

/** Bajo el encabezado del sitio: arriba van completas; al bajar dejan libre la columna del contenido. */
export function HeaderLights({ view }: PieceProps) {
  return view.lights ? <Lights className="nv-lights-header" /> : null;
}

/* ───────────── Renos y trineo (de perfil, mirando a la derecha). En el trineo viaja el burro oficial ───────────── */
function Reindeer({ x, lead = false, phase = "" }: { x: number; lead?: boolean; phase?: string }) {
  return (
    <g transform={`translate(${x} 12)`}>
      <g className={`nv-gallop ${phase}`}>
        <g fill="none" stroke={C.furDark} strokeWidth="3.4" strokeLinecap="round">
          <path className="nv-leg nv-leg-a" d="M12 60L7 78" />
          <path className="nv-leg nv-leg-b" d="M19 61L22 78" />
          <path className="nv-leg nv-leg-b" d="M40 60L36 78" />
          <path className="nv-leg nv-leg-a" d="M46 59L52 77" />
          <path d="M58 26C57 18 53 14 48 11M56 19C53 19 50 17 47 18M61 25C63 18 67 14 72 12M63 19C66 18 69 16 72 17" strokeWidth="2.6" />
        </g>
        <ellipse cx="29" cy="52" rx="22" ry="11" fill={C.fur} />
        <path d="M44 48L54 30L64 34L54 56Z" fill={C.fur} />
        <ellipse cx="62" cy="33" rx="10" ry="8" fill={C.fur} />
        <ellipse cx="69" cy="36" rx="6" ry="5" fill={C.furLight} />
        <circle cx="74" cy="35" r="3.4" fill={lead ? C.red : C.ink} className={lead ? "nv-bulb nv-bulb-1" : undefined} />
        <circle cx="62" cy="30" r="1.8" fill={C.ink} />
        <ellipse cx="52" cy="26" rx="5" ry="2.6" fill={C.furDark} transform="rotate(-35 52 26)" />
        <path d="M7 50Q3 46 5 42" stroke={C.furLight} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M46 44Q51 50 57 46" stroke={C.red} strokeWidth="4" strokeLinecap="round" fill="none" />
        <circle cx="52" cy="50" r="2.4" fill={C.gold} />
      </g>
    </g>
  );
}

/** Lienzo 320×104. El burro es `public/brand/mascot.svg` tal cual; el trineo le tapa la parte de abajo. */
function Sleigh({ className = "" }: { className?: string }) {
  return (
    <Svg viewBox="0 -10 320 114" className={className}>
      <path d="M104 64Q150 70 190 58Q230 68 262 58" fill="none" stroke={C.goldDeep} strokeWidth="1.6" />
      <g className="nv-gallop nv-gallop-c">
        {/* patines */}
        <path d="M6 96H92C103 96 108 89 108 80" fill="none" stroke={C.gold} strokeWidth="4" strokeLinecap="round" />
        <path d="M26 96V84M76 96V84" stroke={C.goldDeep} strokeWidth="3" strokeLinecap="round" />
        {/* saco de regalos, detrás del burro */}
        <circle cx="24" cy="52" r="17" fill={C.pineLight} />
        <rect x="12" y="34" width="13" height="12" rx="2" fill={C.snow} transform="rotate(-14 18 40)" />
        <rect x="18" y="34" width="3" height="12" fill={C.red} transform="rotate(-14 18 40)" />
        <rect x="28" y="30" width="12" height="12" rx="2" fill={C.gold} transform="rotate(10 34 36)" />
        {/* el burro oficial, con su gorro */}
        <image href="/brand/mascot.svg" x="38" y="6" width="50" height="77.5" />
        <g transform="translate(40.5 -1.5) rotate(10 17 29) scale(.36)">
          <HatDrawing />
        </g>
        {/* cuerpo del trineo */}
        <path d="M4 58C4 76 12 84 28 84H90C98 84 102 78 102 70V64H86V72H38C30 72 24 66 22 58Z" fill={C.red} />
        <path d="M4 58C4 76 12 84 28 84H90C98 84 102 78 102 70V68C102 76 96 80 90 80H28C14 80 8 72 6 58Z" fill={C.redDeep} />
        <path d="M9 62C11 74 17 79 28 79H88" fill="none" stroke={C.gold} strokeWidth="2" strokeLinecap="round" />
      </g>
      <Reindeer x={126} phase="nv-gallop-b" />
      <Reindeer x={206} lead />
      <path d={SPARK} fill={C.gold} className="nv-bulb nv-bulb-2" transform="translate(2 12) scale(.45)" />
      <path d={SPARK} fill={C.snow} className="nv-bulb nv-bulb-4" transform="translate(112 4) scale(.35)" />
    </Svg>
  );
}

/* ───────────── Paisaje del pie: cielo, colinas, pinos con luces, regalos, el trineo y el burro ───────────── */
function Pine({ x, y, s = 1, light = false }: { x: number; y: number; s?: number; light?: boolean }) {
  const color = light ? C.pineLight : C.pine;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-3" y="34" width="6" height="8" fill={C.furDark} />
      <path d="M0 0L16 22H-16Z" fill={color} />
      <path d="M0 12L20 38H-20Z" fill={color} />
      <path d={SPARK} fill={C.gold} transform="translate(-5 -9) scale(.42)" />
      <circle className="nv-bulb nv-bulb-3" cx="-6" cy="28" r="2.2" fill={C.gold} />
      <circle className="nv-bulb nv-bulb-1" cx="7" cy="18" r="2.2" fill={C.red} />
      <circle className="nv-bulb nv-bulb-2" cx="-2" cy="14" r="1.8" fill={C.snow} />
    </g>
  );
}

function Gift({ x, y, a, b }: { x: number; y: number; a: string; b: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="6" width="22" height="16" rx="2" fill={a} />
      <rect x="-2" y="2" width="26" height="6" rx="2" fill={b} />
      <rect x="9" y="2" width="4" height="20" fill={C.gold} />
      <path d="M11 2C8 -4 2 -2 4 1C5 3 9 2.5 11 2ZM11 2C14 -4 20 -2 18 1C17 3 13 2.5 11 2Z" fill={C.goldDeep} />
    </g>
  );
}

const DEFAULT_GREETING = "¡Felices fiestas! Seguimos cavando soluciones.";

/** Entre el contenido y el pie. Tocar al burro lo hace saltar: en el celular no existe el hover. */
export function Landscape({ view }: PieceProps) {
  const [hop, setHop] = useState(false);
  useEffect(() => {
    if (!hop) return;
    const timer = setTimeout(() => setHop(false), 900);
    return () => clearTimeout(timer);
  }, [hop]);
  const greeting = view.greeting || DEFAULT_GREETING;

  return (
    <section className="nv-landscape" aria-label="Saludo de temporada">
      <div className="nv-stars" aria-hidden="true" />
      {view.characters && (
        <div className="nv-flight" aria-hidden="true">
          <Sleigh className="nv-flight-sleigh" />
        </div>
      )}
      <p className="nv-greeting">
        <span className="nv-greeting-kicker">Navidad en la madriguera</span>
        {view.link ? (
          <Link href={view.link} className="nv-greeting-text">
            {greeting}
          </Link>
        ) : (
          <span className="nv-greeting-text">{greeting}</span>
        )}
      </p>
      <Svg viewBox="0 0 1200 120" preserveAspectRatio="xMidYMax slice" className="nv-ground">
        <path d="M0 120V84Q150 54 300 80T600 76T900 82T1200 70V120Z" fill={C.pineLight} opacity=".45" />
        <path d="M0 120V98Q200 76 400 96T800 94T1200 90V120Z" fill={C.pine} />
        <Pine x={70} y={50} s={1.1} />
        <Pine x={118} y={62} s={0.8} light />
        <Pine x={420} y={56} s={0.9} light />
        <Pine x={720} y={54} s={1} />
        <Pine x={766} y={66} s={0.75} light />
        <Pine x={1140} y={46} s={1.15} />
        <Gift x={150} y={82} a={C.red} b={C.redDeep} />
        <Gift x={452} y={86} a={C.snow} b="#d9dde2" />
        <Gift x={800} y={84} a="var(--color-blue-500)" b="var(--color-navy-700)" />
        {view.characters && (
          <g className="nv-stroll">
            <g transform="translate(0 20) scale(.8)">
              <Reindeer x={0} lead />
            </g>
          </g>
        )}
        <path d="M0 120V112Q300 100 600 110T1200 106V120Z" fill="var(--nv-footer)" />
      </Svg>
      {/* En celular el control vive acá, quieto, y no flota sobre los formularios */}
      <EffectsButton className="nv-effects-inline" />
      {view.characters && (
        <button type="button" className="nv-burro" data-hop={hop || undefined} onClick={() => setHop(true)} aria-label="Saludar al burro">
          {/* eslint-disable-next-line @next/next/no-img-element -- vector oficial sin optimizar: next/image no aporta nada a un SVG */}
          <img src="/brand/mascot.svg" alt="" width={529} height={820} loading="lazy" decoding="async" draggable={false} />
          <Svg viewBox="-14 -8 120 112" className="nv-burro-hat">
            <HatDrawing />
          </Svg>
          <Svg viewBox="0 0 48 48" className="nv-burro-gift">
            <rect x="7" y="21" width="34" height="23" rx="3" fill={C.red} />
            <rect x="4" y="14" width="40" height="9" rx="3" fill={C.redDeep} />
            <rect x="21" y="14" width="6" height="30" fill={C.gold} />
            <path d="M24 14C19 4 8 5 11 12C13 16 20 15 24 14ZM24 14C29 4 40 5 37 12C35 16 28 15 24 14Z" fill={C.goldDeep} />
          </Svg>
        </button>
      )}
    </section>
  );
}

/* ───────────── Colgantes de los márgenes (solo donde sobra espacio) y nieve opcional ───────────── */
function Pendants({ side }: { side: "left" | "right" }) {
  const thread = { stroke: C.goldDeep, strokeWidth: 1.4 };
  return (
    <Svg viewBox="0 0 120 200" className={`nv-pendants nv-pendants-${side}`}>
      <g className="nv-swing nv-swing-a">
        <path d="M24 0V78" {...thread} />
        <circle cx="24" cy="94" r="16" fill={C.red} />
        <path d="M9 91Q24 99 39 91" fill="none" stroke={C.gold} strokeWidth="2" />
        <rect x="20" y="74" width="8" height="6" rx="1.5" fill={C.goldDeep} />
      </g>
      <g className="nv-swing nv-swing-b">
        <path d="M62 0V128" {...thread} />
        <path d={SPARK} fill={C.gold} transform="translate(44 126) scale(1.5)" />
      </g>
      <g className="nv-swing nv-swing-c">
        <path d="M98 0V46" {...thread} />
        <circle cx="98" cy="60" r="13" fill="var(--color-blue-500)" />
        <ellipse cx="94" cy="55" rx="3" ry="5" fill="#fff" opacity=".3" />
        <rect x="94.5" y="43" width="7" height="5" rx="1.5" fill={C.goldDeep} />
      </g>
    </Svg>
  );
}

const FLAKES = Array.from({ length: 14 }, (_, i) => ({ left: (i * 7.3 + 3) % 100, delay: -(i * 1.7), duration: 11 + (i % 5) * 2.4, size: 4 + (i % 3) * 2 }));

function Snow() {
  return (
    <div className="nv-snow" aria-hidden="true">
      {FLAKES.map((flake, i) => (
        <span key={i} style={{ left: `${flake.left}%`, width: flake.size, height: flake.size, animationDelay: `${flake.delay}s`, animationDuration: `${flake.duration}s` }} />
      ))}
    </div>
  );
}

/* ───────────── Controles del visitante: «Reducir efectos» y la música ───────────── */
function EffectsButton({ className = "" }: { className?: string }) {
  const reduced = useReducedEffects();
  return (
    <button type="button" className={`nv-control nv-effects ${className}`} aria-pressed={reduced} title={reduced ? "Activar efectos" : "Reducir efectos"} onClick={() => setReducedEffects(!reduced)}>
      <Sparkles aria-hidden="true" />
      <span>{reduced ? "Activar efectos" : "Reducir efectos"}</span>
    </button>
  );
}

type MusicModule = typeof import("./music");

function MusicButton() {
  const [music, setMusic] = useState<MusicModule | null>(null);
  useEffect(() => {
    let alive = true;
    import("./music").then((m) => alive && setMusic(m));
    return () => {
      alive = false;
    };
  }, []);
  const playing = useSyncExternalStore(
    (notify) => music?.onMusicChange(notify) ?? (() => {}),
    () => music?.isPlaying() ?? false,
    () => false,
  );
  if (!music) return null;
  return (
    <button type="button" className="nv-control nv-music" aria-pressed={playing} title={playing ? "Apagar la música" : "Música de Navidad"} onClick={() => music.toggleMusic()}>
      {playing ? <Music aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
      <span>{playing ? "Apagar la música" : "Música de Navidad"}</span>
    </button>
  );
}

function PreviewNotice() {
  return (
    <form action={stopSeasonPreview} className="nv-preview" role="status">
      <span>Vista previa de Navidad: solo la ves vos.</span>
      <button type="submit">Salir</button>
    </form>
  );
}

function Controls({ children }: { children: ReactNode }) {
  return <div className="nv-controls">{children}</div>;
}

/** Lo que el sitio suma fuera del flujo: colgantes, nieve, controles y el aviso de vista previa. */
export function SiteExtras({ view }: PieceProps) {
  return (
    <>
      {view.lights && (
        <>
          <Pendants side="left" />
          <Pendants side="right" />
        </>
      )}
      {view.snow && <Snow />}
      <Controls>
        <EffectsButton />
        {view.music && <MusicButton />}
      </Controls>
      {view.preview && <PreviewNotice />}
    </>
  );
}

/** 404 del sitio: el trineo pasa de largo. */
export function NotFoundScene({ view }: PieceProps) {
  return view.characters ? <Sleigh className="nv-notfound" /> : null;
}

/* ───────────── Panel ───────────── */
export function AdminLights({ view }: PieceProps) {
  return view.lights ? <Lights runs={2} className="nv-lights-admin" /> : null;
}

/** Saludo del Dashboard: una franja baja que no desplaza las métricas. */
export function AdminGreeting({ view }: PieceProps) {
  return (
    <div className="nv-admin-greeting">
      {view.lights && <Lights runs={6} className="nv-admin-greeting-lights" />}
      <p>
        <strong>¡Felices fiestas!</strong>
        <span>El panel está vestido de Navidad. Se apaga en Sitio → Campaña de Navidad.</span>
      </p>
      {view.characters && <Sleigh className="nv-admin-greeting-sleigh" />}
    </div>
  );
}

export function AdminExtras({ view }: PieceProps) {
  return (
    <>
      <EffectsButton className="nv-control-admin" />
      {view.preview && <PreviewNotice />}
    </>
  );
}

export function LoginScene({ view }: PieceProps) {
  return view.lights ? <Lights runs={5} className="nv-lights-login" /> : null;
}
