import { cn } from "@/lib/cn";
import type { Tone } from "./stratum";

// Una sola forma de corte (línea quebrada, no una onda) con tres variantes.
const LINES = {
  ridge:
    "M0 34 L96 30 L172 44 L260 40 L318 22 L420 26 L512 48 L640 44 L702 30 L820 36 L905 18 L1010 24 L1088 46 L1196 40 L1270 28 L1362 34 L1440 26",
  shelf:
    "M0 20 H180 L204 38 H420 L452 28 H690 L716 52 H930 L958 40 H1180 L1210 24 H1440",
  fault:
    "M0 46 L240 42 L420 50 L600 44 L690 46 L730 16 L900 20 L1100 14 L1280 22 L1440 18",
} as const;

type TerrainCutProps = {
  /** Estrato de arriba. */
  from: Tone;
  /** Estrato de abajo. */
  to: Tone;
  variant?: keyof typeof LINES;
  /** Espeja el corte en horizontal. */
  flip?: boolean;
  /** Detalle enterrado bajo el corte. Máximo uno por corte. */
  detail?: "braces" | "error" | "cable";
  /** Posición horizontal del detalle, en % del ancho. */
  detailAt?: number;
  className?: string;
};

/** Corte de terreno entre dos estratos. Decorativo: oculto para lectores de pantalla. */
export function TerrainCut({
  from,
  to,
  variant = "ridge",
  flip = false,
  detail,
  detailAt = 72,
  className,
}: TerrainCutProps) {
  const line = LINES[variant];
  return (
    <div className={cn("terrain", className)} data-stratum={from} aria-hidden="true">
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        focusable="false"
        style={flip ? { transform: "scaleX(-1)" } : undefined}
      >
        <g data-stratum={to}>
          <path className="terrain-fill" d={`${line} V80 H0 Z`} />
          <path className="terrain-seam" d={line} transform="translate(0 14)" />
        </g>
      </svg>
      {detail && (
        <span
          className="terrain-detail type-mono"
          data-stratum={to}
          data-detail={detail}
          style={{ left: `${detailAt}%` }}
        >
          {detail === "braces" && "{ }"}
          {detail === "error" && "ERROR 500"}
          {detail === "cable" && (
            <svg width="112" height="22" viewBox="0 0 112 22" fill="none" strokeLinecap="round">
              <path className="terrain-cable-jacket" d="M3 5 C28 5 30 17 56 17 S84 6 109 11" />
              <path className="terrain-cable-core" d="M3 5 C28 5 30 17 56 17 S84 6 109 11" />
            </svg>
          )}
        </span>
      )}
    </div>
  );
}
