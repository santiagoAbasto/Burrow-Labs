"use client";

import { ArrowRight, Check, Link2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { HomeContent } from "@/components/home/sections";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { calcQuery, calculate, CALC_DEFAULTS, CALC_LIMITS, type CalcInput } from "@/lib/calculator";
import { motion as duration, REDUCED_MOTION_QUERY } from "@/lib/motion";

const number = new Intl.NumberFormat("es-BO");

/** Número que cuenta hasta su nuevo valor. */
function Counter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(value);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia(REDUCED_MOTION_QUERY).matches) {
      el.textContent = number.format(value);
      shown.current = value;
      return;
    }
    // Cuenta con easeOut en requestAnimationFrame: para un número no hace falta el motor de Motion (~20 KB gzip).
    const from = shown.current;
    if (from === value) return;
    const start = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const t = Math.min((now - start) / (duration.slow * 1000), 1);
      shown.current = from + (value - from) * (1 - (1 - t) ** 2);
      el.textContent = number.format(Math.round(shown.current));
      if (t < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <span ref={ref}>{number.format(value)}</span>;
}

function Slider({ name, label, suffix, value, onChange }: { name: keyof CalcInput; label: string; suffix?: string; value: number; onChange: (value: number) => void }) {
  const id = useId();
  const { min, max } = CALC_LIMITS[name];
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="font-medium">
          {label}
        </label>
        <output htmlFor={id} className="font-mono text-lg font-bold tabular-nums">
          {value}
          {suffix}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-1 h-11 w-full accent-(--accent)"
      />
    </div>
  );
}

type Labels = Pick<
  HomeContent<"calculator">,
  "peopleLabel" | "hoursLabel" | "costLabel" | "weeksLabel" | "repetitiveLabel" | "hoursResultLabel" | "costResultLabel" | "recoverableLabel" | "disclaimer" | "cta" | "shareLabel"
>;

/** ¿Cuánto tiempo pierde tu empresa haciendo esto a mano? Se comparte por URL (solo números). */
export function Calculator({ labels, initial = CALC_DEFAULTS }: { labels: Labels; initial?: CalcInput }) {
  const [input, setInput] = useState(initial);
  const [copied, setCopied] = useState(false);
  const touched = useRef(false);
  const result = calculate(input);

  const set = (key: keyof CalcInput) => (value: number) => {
    setInput((prev) => ({ ...prev, [key]: value }));
    if (!touched.current) {
      touched.current = true;
      track("calculator_complete");
    }
  };

  const share = async () => {
    const url = `${window.location.origin}/calculadora?${calcQuery(input)}`;
    try {
      if (navigator.share) await navigator.share({ title: "Calculadora de procesos manuales · Burrow Labs", url });
      else await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // el usuario canceló el diálogo de compartir
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <form className="grid content-start gap-6" onSubmit={(event) => event.preventDefault()}>
        <Slider name="people" label={labels.peopleLabel} value={input.people} onChange={set("people")} />
        <Slider name="hours" label={labels.hoursLabel} suffix=" h" value={input.hours} onChange={set("hours")} />
        <Slider name="cost" label={labels.costLabel} value={input.cost} onChange={set("cost")} />
        <Slider name="weeks" label={labels.weeksLabel} value={input.weeks} onChange={set("weeks")} />
        <Slider name="repetitive" label={labels.repetitiveLabel} suffix="%" value={input.repetitive} onChange={set("repetitive")} />
      </form>

      <div data-stratum="lab" className="rounded-lg p-6 sm:p-10" aria-live="polite">
        <dl>
          <dt className="type-mono text-muted">{labels.hoursResultLabel}</dt>
          <dd className="mt-1 type-h1 text-accent tabular-nums">
            <Counter value={result.annualHours} /> <span className="text-[0.4em]">h</span>
          </dd>
        </dl>
        <dl className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <dt className="type-mono text-muted">{labels.costResultLabel}</dt>
              <dd className="mt-1 type-h2 tabular-nums">
                <span className="text-[0.5em]">USD</span> <Counter value={result.annualCost} />
              </dd>
            </div>
            <div>
              <dt className="type-mono text-muted">{labels.recoverableLabel}</dt>
              <dd className="mt-1 type-h2 tabular-nums">
                <Counter value={result.recoverableHours} /> <span className="text-[0.5em]">h</span>
              </dd>
            </div>
        </dl>
        <p className="mt-8 type-small text-muted">{labels.disclaimer}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href={`/contacto?origen=calculadora&${calcQuery(input)}`} icon={<ArrowRight />}>
            {labels.cta}
          </Button>
          <Button variant="secondary" onClick={share} icon={copied ? <Check /> : <Link2 />}>
            {copied ? "Enlace copiado" : labels.shareLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
