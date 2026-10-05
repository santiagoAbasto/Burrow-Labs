import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * Esquema que ilustra un caso cuando no hay portada: capas, flujo, nodos, grilla o el árbol de Apple Boss.
 * Se dibuja con las funcionalidades del caso (nunca una captura inventada) en el lenguaje gráfico del sitio:
 * trazo de tinta, cajas de taller, un solo acento. SVG servido desde el servidor, sin JavaScript.
 */

type Tone = "dashed" | "solid" | "accent";

const FONT = "var(--font-jetbrains), ui-monospace, monospace";

/** Hasta dos líneas de ~16 caracteres; lo que no entra se corta con «…». */
function lines(label: string, max = 16): string[] {
  const text = label.toUpperCase();
  if (text.length <= max) return [text];
  const words = text.split(" ");
  const first: string[] = [];
  while (words.length && [...first, words[0]].join(" ").length <= max) first.push(words.shift()!);
  if (!first.length) return [text.slice(0, max - 1) + "…"];
  const rest = words.join(" ");
  return [first.join(" "), rest.length > max ? rest.slice(0, max - 1) + "…" : rest];
}

function Box({ x, y, w, h, label, tone = "solid", size = 11 }: { x: number; y: number; w: number; h: number; label: string; tone?: Tone; size?: number }) {
  const rows = lines(label, Math.floor(w / (size * 0.66)));
  const fill = tone === "accent" ? "var(--accent)" : "var(--panel)";
  const color = tone === "accent" ? "var(--accent-fg)" : "var(--fg)";
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={fill} stroke={tone === "accent" ? "var(--accent)" : "var(--line-strong)"} strokeWidth={1.5} strokeDasharray={tone === "dashed" ? "5 4" : undefined} />
      <text x={x + w / 2} y={y + h / 2 + (rows.length === 2 ? -size * 0.65 : 0)} textAnchor="middle" dominantBaseline="central" fontFamily={FONT} fontSize={size} fontWeight={700} letterSpacing="0.08em" fill={color}>
        {rows.map((row, i) => (
          <tspan key={i} x={x + w / 2} dy={i ? size * 1.3 : 0}>
            {row}
          </tspan>
        ))}
      </text>
    </g>
  );
}

const Line = ({ d, accent, marker }: { d: string; accent?: boolean; marker?: string }) => (
  <path d={d} fill="none" stroke={accent ? "var(--accent)" : "var(--line-strong)"} strokeWidth={accent ? 2 : 1.5} strokeLinecap="round" markerEnd={marker ? `url(#${marker})` : undefined} />
);

function Layers({ labels }: { labels: string[] }) {
  const rows = (labels.length >= 4 ? labels : [...labels, "Acceso", "Procesos", "Reglas", "Datos"]).slice(0, 4);
  return (
    <>
      {rows.map((label, i) => (
        <g key={i}>
          <text x={38} y={70 + i * 72} textAnchor="end" dominantBaseline="central" fontFamily={FONT} fontSize={10} fill="var(--muted)">
            {String(i + 1).padStart(2, "0")}
          </text>
          <Box x={56} y={44 + i * 72} w={368} h={52} label={label} tone={i === 2 ? "accent" : i === 0 ? "dashed" : "solid"} />
          {i < 3 && <Line d={`M240 ${96 + i * 72} v20`} accent />}
        </g>
      ))}
      <Line d="M448 44 v268" />
      {rows.map((_, i) => (
        <Line key={i} d={`M444 ${70 + i * 72} h8`} />
      ))}
    </>
  );
}

function Flow({ labels, marker }: { labels: string[]; marker: string }) {
  const steps = (labels.length >= 4 ? labels : [...labels, "Entrada", "Proceso", "Validación", "Resultado"]).slice(0, 4);
  const at = [
    [40, 70],
    [290, 70],
    [290, 232],
    [40, 232],
  ] as const;
  return (
    <>
      <Line d="M190 98 H270" marker={marker} />
      <Line d="M365 126 V212" marker={marker} />
      <Line d="M270 260 H210" marker={marker} />
      {steps.map((label, i) => (
        <Box key={i} x={at[i][0]} y={at[i][1]} w={150} h={56} label={label} tone={i === 3 ? "accent" : i === 0 ? "dashed" : "solid"} />
      ))}
      <Line d="M40 320 H440" />
      {steps.map((_, i) => (
        <text key={i} x={40 + i * 133} y={340} fontFamily={FONT} fontSize={10} fill="var(--muted)">
          {String(i + 1).padStart(2, "0")}
        </text>
      ))}
    </>
  );
}

function Nodes({ labels }: { labels: string[] }) {
  const [hub = "Sistema", ...rest] = labels;
  const around = (rest.length >= 6 ? rest : [...rest, "Datos", "Reglas", "Herramientas", "Historial", "Validación", "Operador"]).slice(0, 6);
  const spots = [
    [240, 48],
    [392, 112],
    [392, 248],
    [240, 312],
    [88, 248],
    [88, 112],
  ] as const;
  return (
    <>
      {spots.map(([x, y], i) => (
        <Line key={i} d={`M240 180 L${x} ${y}`} />
      ))}
      {spots.map(([x, y], i) => (
        <Box key={i} x={x - 64} y={y - 22} w={128} h={44} label={around[i]} tone="dashed" size={10} />
      ))}
      <Box x={165} y={152} w={150} h={56} label={hub} tone="accent" />
    </>
  );
}

function Grid({ labels }: { labels: string[] }) {
  const cards = (labels.length >= 3 ? labels : [...labels, "Resumen", "Estado", "Pendientes"]).slice(0, 3);
  const rows = labels.slice(3, 6);
  const bars = [34, 56, 44, 70, 52, 80, 62];
  return (
    <>
      <rect x={24} y={24} width={100} height={312} rx={8} fill="var(--panel)" stroke="var(--line-strong)" strokeWidth={1.5} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={40} y={48 + i * 26} width={i === 1 ? 68 : 52} height={6} rx={3} fill={i === 1 ? "var(--accent)" : "var(--line-strong)"} />
      ))}
      <rect x={140} y={24} width={316} height={40} rx={8} fill="var(--panel)" stroke="var(--line-strong)" strokeWidth={1.5} />
      <rect x={156} y={41} width={90} height={6} rx={3} fill="var(--line-strong)" />
      {cards.map((label, i) => (
        <Box key={i} x={140 + i * 109} y={80} w={98} h={66} label={label} tone={i === 0 ? "accent" : "solid"} size={10} />
      ))}
      <rect x={140} y={162} width={316} height={92} rx={8} fill="var(--panel)" stroke="var(--line-strong)" strokeWidth={1.5} />
      {bars.map((h, i) => (
        <rect key={i} x={160 + i * 41} y={240 - h} width={22} height={h} rx={3} fill={i === 5 ? "var(--accent)" : "var(--line-strong)"} />
      ))}
      <rect x={140} y={270} width={316} height={66} rx={8} fill="var(--panel)" stroke="var(--line-strong)" strokeWidth={1.5} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Line d={`M156 ${291 + i * 18} H440`} />
          {rows[i] && (
            <text x={156} y={287 + i * 18} fontFamily={FONT} fontSize={9} letterSpacing="0.08em" fill="var(--muted)">
              {lines(rows[i], 36)[0]}
            </text>
          )}
        </g>
      ))}
    </>
  );
}

/** Árbol de Apple Boss: tienda → núcleo → inventario / ventas / servicio → automatización → reportes / integraciones. */
function AppleBoss({ marker }: { marker: string }) {
  return (
    <>
      <Line d="M240 64 V86" marker={marker} />
      <Line d="M240 134 V150 M100 150 H380 M100 150 V162 M240 150 V162 M380 150 V162" />
      <Line d="M100 206 V222 M240 206 V222 M380 206 V222 M100 222 H380 M240 222 V236" marker={marker} />
      <Line d="M240 280 V294 M150 294 H330 M150 294 V306 M330 294 V306" />
      <Box x={165} y={20} w={150} h={44} label="Tienda online" tone="dashed" />
      <Box x={165} y={86} w={150} h={48} label="Núcleo comercial" tone="accent" />
      <Box x={40} y={162} w={120} h={44} label="Inventario" />
      <Box x={180} y={162} w={120} h={44} label="Ventas" />
      <Box x={320} y={162} w={120} h={44} label="Servicio" />
      <Box x={165} y={236} w={150} h={44} label="Automatización" />
      <Box x={80} y={306} w={140} h={40} label="Reportes" size={10} />
      <Box x={260} y={306} w={140} h={40} label="Integraciones" size={10} />
    </>
  );
}

type ProjectVisualProps = {
  /** Clave de PROJECT_VISUALS; cualquier otra cosa dibuja «layers». */
  kind: string;
  /** Funcionalidades del caso: rotulan las cajas. */
  labels: string[];
  /** Título del caso, para el texto alternativo. */
  title: string;
  className?: string;
};

export function ProjectVisual({ kind, labels, title, className }: ProjectVisualProps) {
  const marker = `arrow-${useId().replace(/:/g, "")}`;
  const body =
    kind === "apple-boss" ? <AppleBoss marker={marker} /> : kind === "flow" ? <Flow labels={labels} marker={marker} /> : kind === "nodes" ? <Nodes labels={labels} /> : kind === "grid" ? <Grid labels={labels} /> : <Layers labels={labels} />;
  return (
    <div className={cn("relative grid place-items-center overflow-hidden rounded-lg border border-line bg-panel", className)}>
      <span className="absolute top-3 left-4 type-mono text-muted" aria-hidden="true">
        Esquema
      </span>
      <svg viewBox="0 0 480 360" preserveAspectRatio="xMidYMid meet" role="img" aria-label={`Esquema del caso: ${title}`} className="h-full w-full max-h-full p-4">
        <defs>
          <marker id={marker} viewBox="0 0 10 10" refX={9} refY={5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
            <path d="M1 1 L9 5 L1 9" fill="none" stroke="var(--line-strong)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>
        {body}
      </svg>
    </div>
  );
}
