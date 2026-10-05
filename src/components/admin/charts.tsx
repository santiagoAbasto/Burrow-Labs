// Gráficos del dashboard: componentes de servidor, SVG en línea, sin JS en el navegador.
// Colores solo por clases de charts.css (variables de globals.css). Los textos de ejes van en
// HTML fuera del SVG para que no escalen con el viewBox (de 320 a 1440 px).
import Link from "next/link";

export type ChartTone = "ink" | "yellow" | "blue";

const EMPTY = "Todavía no hay datos.";
const num = (n: number) => n.toLocaleString("es-BO");
const pct = (part: number, whole: number) => `${whole > 0 ? Math.round((part / whole) * 100) : 0} %`;
const allZero = (values: number[]) => values.every((v) => !(v > 0));

const dateFormat = new Intl.DateTimeFormat("es-BO", { day: "numeric", month: "short", timeZone: "UTC" });
/** 'YYYY-MM-DD' → '3 oct'. Cualquier otra etiqueta se muestra tal cual. */
function shortDate(label: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(label)) return label;
  const date = new Date(`${label}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? label : dateFormat.format(date).replace(/\.$/, "");
}

/** Techo «redondo» del eje y, divisible en 3 tramos con etiquetas enteras (3, 6, 9, 12, 15, 30 × 10^k). */
function niceTop(max: number) {
  if (!(max > 0)) return 3;
  const mag = 10 ** Math.floor(Math.log10(max));
  return (([3, 6, 9, 12, 15, 30].find((c) => c * mag >= max) ?? 30) * mag);
}

/** Índices de las ~5 etiquetas del eje x, repartidas de punta a punta. */
function spread(n: number, count = 5) {
  if (n <= count) return Array.from({ length: n }, (_, i) => i);
  return Array.from({ length: count }, (_, i) => Math.round((i * (n - 1)) / (count - 1)));
}

/** Trazo de una serie dentro del viewBox 0 0 100 100 (x por índice, y invertida). */
function linePath(values: number[], top: number) {
  const n = values.length;
  const r = (x: number) => Math.round(x * 100) / 100;
  return values.map((v, i) => `${i === 0 ? "M" : "L"}${n === 1 ? 50 : r((i / (n - 1)) * 100)} ${r(100 - (v / top) * 100)}`).join(" ");
}

function Empty({ text = EMPTY, small = false }: { text?: string; small?: boolean }) {
  return (
    <p className="chart-empty" data-size={small ? "sm" : undefined}>
      {text}
    </p>
  );
}

/* ---------- AreaChart ----------------------------------------------------- */
export type AreaSeries = { name: string; values: number[]; tone?: ChartTone };

export function AreaChart({ labels, series, ariaLabel, height = 180 }: { labels: string[]; series: AreaSeries[]; ariaLabel: string; height?: number }) {
  const n = labels.length;
  const rows = series.map((s, i) => ({ ...s, tone: s.tone ?? (i === 0 ? "ink" : "blue"), values: labels.map((_, j) => s.values[j] ?? 0) }));
  if (n === 0 || rows.every((s) => allZero(s.values))) return <Empty />;

  const top = niceTop(Math.max(...rows.flatMap((s) => s.values)));
  const ticks = [3, 2, 1, 0].map((k) => (top * k) / 3);
  const xTicks = spread(n);

  return (
    <div className="chart-area">
      <div className="chart-area-y" aria-hidden="true">
        {ticks.map((t) => (
          <span key={t}>{num(t)}</span>
        ))}
      </div>
      <div className="chart-area-plot" style={{ height }}>
        <div className="chart-grid" aria-hidden="true">
          {ticks.map((t) => (
            <i key={t} />
          ))}
        </div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%" role="img" aria-label={ariaLabel}>
          {rows.map((s) => (
            <g key={s.name} className="chart-series">
              {n > 1 && <path className="chart-fill" data-tone={s.tone} d={`${linePath(s.values, top)} L100 100 L0 100 Z`} />}
              <path className="chart-line" data-tone={s.tone} d={linePath(s.values, top)} vectorEffect="non-scaling-stroke" />
            </g>
          ))}
        </svg>
        {rows.map((s) => (
          <i key={s.name} className="chart-dot" data-tone={s.tone} style={{ left: n === 1 ? "50%" : "100%", top: `${100 - ((s.values[n - 1] ?? 0) / top) * 100}%` }} aria-hidden="true" />
        ))}
      </div>
      <div className="chart-area-x" aria-hidden="true">
        {xTicks.map((i) => (
          <span key={i} style={{ left: n === 1 ? "50%" : `${(i / (n - 1)) * 100}%` }} data-edge={n > 1 && i === 0 ? "start" : n > 1 && i === n - 1 ? "end" : undefined}>
            {shortDate(labels[i] ?? "")}
          </span>
        ))}
      </div>
      <ul className="chart-legend">
        {rows.map((s) => (
          <li key={s.name}>
            <i className="chart-dot" data-tone={s.tone} aria-hidden="true" />
            <span>{s.name}</span>
            <b>{num(s.values[n - 1] ?? 0)}</b>
          </li>
        ))}
      </ul>
      <table className="sr-only">
        <caption>{ariaLabel}</caption>
        <thead>
          <tr>
            <th scope="col">Fecha</th>
            {rows.map((s) => (
              <th key={s.name} scope="col">
                {s.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((label, i) => (
            <tr key={label + i}>
              <th scope="row">{shortDate(label)}</th>
              {rows.map((s) => (
                <td key={s.name}>{num(s.values[i] ?? 0)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- BarList ------------------------------------------------------- */
export type BarItem = { label: string; value: number; href?: string; hint?: string };

export function BarList({ items, total, empty, format = num }: { items: BarItem[]; total?: number; empty?: string; format?: (n: number) => string }) {
  if (items.length === 0 || allZero(items.map((i) => i.value))) return <Empty text={empty} />;
  const max = Math.max(...items.map((i) => i.value), 1);
  const whole = total ?? items.reduce((sum, i) => sum + i.value, 0);

  return (
    <ol className="chart-bars">
      {items.map((item, i) => (
        <li key={item.label + i} className="chart-bar">
          <div className="chart-bar-head">
            <span className="chart-bar-label">{item.href ? <Link href={item.href}>{item.label}</Link> : item.label}</span>
            <span className="chart-bar-value">
              {format(item.value)} <small>{pct(item.value, whole)}</small>
            </span>
          </div>
          <div className="chart-bar-track" aria-hidden="true">
            <span className="chart-bar-fill" style={{ width: `${(Math.max(item.value, 0) / max) * 100}%` }} />
          </div>
          {item.hint && <p className="chart-bar-hint">{item.hint}</p>}
        </li>
      ))}
    </ol>
  );
}

/* ---------- Donut --------------------------------------------------------- */
export type DonutSlice = { label: string; value: number };

const DONUT_TONES = ["ink", "yellow", "blue", "blue-300", "donkey", "paper"] as const;
const RING = 38; // radio del anillo en el viewBox 0 0 100 100
const RING_WIDTH = 16;

export function Donut({ slices, ariaLabel, empty, center }: { slices: DonutSlice[]; ariaLabel: string; empty?: string; center?: string }) {
  const clean = slices.map((s) => ({ ...s, value: Math.max(s.value, 0) }));
  if (clean.length === 0 || allZero(clean.map((s) => s.value))) return <Empty text={empty} />;

  // Máximo 6 porciones: la cola se agrupa en «Otros».
  const shown = clean.length > DONUT_TONES.length ? [...clean.slice(0, DONUT_TONES.length - 1), { label: "Otros", value: clean.slice(DONUT_TONES.length - 1).reduce((sum, s) => sum + s.value, 0) }] : clean;
  const total = shown.reduce((sum, s) => sum + s.value, 0);
  const arcs = shown.reduce<{ label: string; value: number; tone: (typeof DONUT_TONES)[number]; share: number; start: number }[]>((acc, s, i) => {
    const prev = acc[i - 1];
    return [...acc, { ...s, tone: DONUT_TONES[i] ?? "paper", share: (s.value / total) * 100, start: prev ? prev.start + prev.share : 0 }];
  }, []);
  const boundaries = arcs.filter((a) => a.share > 0);

  return (
    <div className="chart-donut">
      <svg viewBox="0 0 100 100" width="100%" role="img" aria-label={ariaLabel}>
        <g transform="rotate(-90 50 50)">
          {arcs.map((a) => a.share > 0 && <circle key={a.label} className="chart-arc" data-tone={a.tone} cx="50" cy="50" r={RING} pathLength="100" strokeDasharray={`${a.share} ${100 - a.share}`} strokeDashoffset={-a.start} />)}
        </g>
        {boundaries.length > 1 &&
          boundaries.map((a) => <line key={a.label} className="chart-arc-gap" x1="50" y1={50 - RING + RING_WIDTH / 2 + 0.75} x2="50" y2={50 - RING - RING_WIDTH / 2 - 0.75} transform={`rotate(${(a.start / 100) * 360} 50 50)`} />)}
        <circle className="chart-arc-edge" cx="50" cy="50" r={RING + RING_WIDTH / 2} />
        <circle className="chart-arc-edge" cx="50" cy="50" r={RING - RING_WIDTH / 2} />
        {center && (
          <text className="chart-donut-center" x="50" y="50" fontSize={center.length <= 3 ? 18 : center.length <= 5 ? 14 : 10}>
            {center}
          </text>
        )}
      </svg>
      <ul className="chart-legend" data-stack="true">
        {arcs.map((a) => (
          <li key={a.label}>
            <i className="chart-dot" data-tone={a.tone} aria-hidden="true" />
            <span>{a.label}</span>
            <b>
              {num(a.value)} <small>{pct(a.value, total)}</small>
            </b>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- Sparkline ----------------------------------------------------- */
export function Sparkline({ values, tone = "ink" }: { values: number[]; tone?: ChartTone }) {
  if (values.length === 0 || allZero(values)) return <Empty small />;
  const top = Math.max(...values) || 1;
  const n = values.length;
  const last = values[n - 1] ?? 0;
  const summary = `Tendencia: ${n} valores, mínimo ${num(Math.min(...values))}, máximo ${num(top)}, último ${num(last)}`;

  return (
    <div className="chart-spark">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%" role="img" aria-label={summary}>
        <g className="chart-series">
          {n > 1 && <path className="chart-fill" data-tone={tone} d={`${linePath(values, top)} L100 100 L0 100 Z`} />}
          <path className="chart-line" data-tone={tone} d={linePath(values, top)} vectorEffect="non-scaling-stroke" />
        </g>
      </svg>
      <i className="chart-dot" data-tone={tone} style={{ left: n === 1 ? "50%" : "100%", top: `${100 - (last / top) * 100}%` }} aria-hidden="true" />
      <p className="sr-only">Valores: {values.map(num).join(", ")}</p>
    </div>
  );
}

/* ---------- HourBars ------------------------------------------------------ */
const HOURS = 24;
const HOUR_W = 10; // unidades del viewBox por hora

export function HourBars({ values, ariaLabel }: { values: number[]; ariaLabel: string }) {
  const hours = Array.from({ length: HOURS }, (_, h) => Math.max(values[h] ?? 0, 0));
  if (allZero(hours)) return <Empty />;
  const max = Math.max(...hours);
  const peak = hours.indexOf(max);

  return (
    <div className="chart-hours">
      <div className="chart-hours-plot">
        <svg viewBox={`0 0 ${HOURS * HOUR_W} 100`} preserveAspectRatio="none" width="100%" height="100%" role="img" aria-label={`${ariaLabel}. Hora pico: ${peak} h con ${num(max)}.`}>
          <g className="chart-hours-bars">
            {hours.map((v, h) => v > 0 && <rect key={h} className="chart-hour" data-peak={h === peak ? "true" : undefined} x={h * HOUR_W + 1.5} y={100 - (v / max) * 100} width={HOUR_W - 3} height={(v / max) * 100} vectorEffect="non-scaling-stroke" />)}
          </g>
          <line className="chart-baseline" x1="0" y1="100" x2={HOURS * HOUR_W} y2="100" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="chart-hours-peak" style={{ left: `${((peak + 0.5) / HOURS) * 100}%` }} aria-hidden="true">
          {peak} h · {num(max)}
        </span>
      </div>
      <div className="chart-hours-x" aria-hidden="true">
        {[0, 6, 12, 18].map((h) => (
          <span key={h} style={{ gridColumn: h + 1 }}>
            {h} h
          </span>
        ))}
      </div>
      <table className="sr-only">
        <caption>{ariaLabel}</caption>
        <thead>
          <tr>
            <th scope="col">Hora</th>
            <th scope="col">Valor</th>
          </tr>
        </thead>
        <tbody>
          {hours.map((v, h) => (
            <tr key={h}>
              <th scope="row">{h} h</th>
              <td>{num(v)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Delta --------------------------------------------------------- */
export function Delta({ now, before }: { now: number; before: number }) {
  const title = `Período anterior: ${num(before)} · ahora: ${num(now)}`;
  if (before <= 0) {
    return now > 0 ? (
      <span className="chart-delta" data-dir="new" title={title}>
        nuevo
      </span>
    ) : (
      <span className="chart-delta" data-dir="flat" title={title}>
        <span aria-hidden="true">=</span>
        <span className="sr-only">sin cambio</span>
      </span>
    );
  }
  const change = Math.round((Math.abs(now - before) / before) * 100);
  const dir = change === 0 ? "flat" : now > before ? "up" : "down";
  return (
    <span className="chart-delta" data-dir={dir} title={title}>
      <span aria-hidden="true">{dir === "up" ? "▲" : dir === "down" ? "▼" : "="}</span>
      <span className="sr-only">{dir === "up" ? "sube" : dir === "down" ? "baja" : "sin cambio"}</span>
      {dir !== "flat" && ` ${num(change)} %`}
    </span>
  );
}
