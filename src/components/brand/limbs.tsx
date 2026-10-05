// Brazos y patas del burro. No vienen en el logo (que es un busto): son piezas nuevas, dibujadas aparte
// con su mismo trazo —relleno plano, línea negra y borde amarillo—, que se colocan junto al vector
// original sin modificarlo. Ver docs/BRAND-ASSETS.md.

const INK = "#080a09";
const YELLOW = "#fcea10";
const BLUE = "#1671b1";
const STEEL = "#5e615e";
const GRAY = "#c4c2c1";

const line = { stroke: INK, strokeWidth: 2.6, strokeLinejoin: "round", strokeLinecap: "round" } as const;
const halo = { fill: YELLOW, stroke: YELLOW, strokeWidth: 6.5, strokeLinejoin: "round" } as const;

/**
 * Brazo que pasa por encima de un borde y lo agarra: manga de la sudadera, mano gris y pezuña.
 * `x` es el centro y `edge` la altura del borde, en unidades del <svg> que lo contiene.
 */
export function Grip({ x, edge, scale = 1, className, delay = 0 }: { x: number; edge: number; scale?: number; className?: string; delay?: number }) {
  const pill = { x: -7.5, y: -13, width: 15, height: 25, rx: 7.5 };
  return (
    <g transform={`translate(${x} ${edge}) scale(${scale})`}>
      <g className={className} style={{ animationDelay: `${delay}s` }}>
        <rect {...pill} {...halo} />
        <rect {...pill} fill={BLUE} {...line} />
        <path d="M-7.5 -3 h15 v8 a7.5 7.5 0 0 1 -15 0 z" fill={GRAY} {...line} />
        <path d="M-7.5 5 h15 a7.5 7.5 0 0 1 -15 0 z" fill={STEEL} {...line} />
      </g>
    </g>
  );
}

/** Pata con su pezuña, para usar dentro de un <svg>. El arranque (`top`) queda escondido detrás del cuerpo o de un cartel. */
export function Leg({ x, top, foot, className }: { x: number; top: number; foot: number; className?: string }) {
  const leg = `M${x - 6} ${top} h12 V${foot - 8} h-12 z`;
  const hoof = `M${x - 7} ${foot - 9} h14 l3 9 h-20 z`;
  return (
    <g className={className} style={{ transformOrigin: `${x}px ${top + 4}px` }}>
      <path d={`${leg} ${hoof}`} {...halo} />
      <path d={leg} fill={GRAY} {...line} />
      <path d={hoof} fill={STEEL} {...line} />
    </g>
  );
}
