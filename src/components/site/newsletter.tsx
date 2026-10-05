"use client";

import { ArrowRight, Check, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { Grip } from "@/components/brand/limbs";
import { Mascot } from "@/components/brand/mascot";
import { Button } from "@/components/ui/button";
import { Checkbox, Input } from "@/components/ui/form";
import { cn } from "@/lib/cn";
import { subscribeNewsletter, type NewsletterState } from "@/lib/newsletter-actions";

type Status = "idle" | "focus" | "typing" | "pending" | "ok" | "error";

// Tierra que salta mientras el burro cava: desplazamiento final de cada punto (en px).
const DIRT = [
  ["12%", "-22px", "-30px"],
  ["34%", "-6px", "-40px"],
  ["62%", "8px", "-36px"],
  ["84%", "22px", "-26px"],
] as const;

/**
 * Suscripción a la newsletter con el burro asomando por detrás del campo, agarrado del borde con las
 * pezuñas. Mira al cursor; al enfocar se asoma más, al escribir mueve las orejas, al enviar cava, en
 * éxito sube con un cartel y en error se sacude con las orejas caídas. Estados por data-state en la
 * sección; el movimiento vive en newsletter.css (solo transform/opacity, nada con reduced motion).
 */
/** `place` distingue esta instancia para lectores de pantalla cuando hay dos en la página (cuerpo y pie). */
export function Newsletter({ className, place }: { className?: string; place?: string }) {
  const pathname = usePathname();
  const [state, action, pending] = useActionState<NewsletterState, FormData>(subscribeNewsletter, { ok: false });
  const [focused, setFocused] = useState(false);
  const [typing, setTyping] = useState(false);
  // Después de un error, el burro se recupera en cuanto volvés al campo (el mensaje sigue hasta el próximo envío).
  // Se guarda el estado que tocaste: un envío nuevo trae otro objeto y vuelve a contar como «sin tocar».
  const [touchedState, setTouchedState] = useState<NewsletterState | null>(null);
  const touched = touchedState === state;
  const setTouched = () => setTouchedState(state);
  const started = useRef<HTMLInputElement>(null);
  const done = useRef<HTMLParagraphElement>(null);
  const timer = useRef(0);
  const id = useId();
  const emailId = `${id}-email`;
  const descId = `${id}-desc`;
  const msgId = `${id}-msg`;

  useEffect(() => {
    if (started.current) started.current.value = String(Date.now());
    return () => clearTimeout(timer.current);
  }, []);
  useEffect(() => {
    if (state.ok) done.current?.focus();
  }, [state.ok]);

  const onInput = () => {
    setTyping(true);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setTyping(false), 600);
  };

  const failed = !state.ok && Boolean(state.message || state.errors);
  const emailError = state.errors?.email;
  const message = state.ok ? undefined : (emailError ?? state.message);
  const status: Status = pending ? "pending" : state.ok ? "ok" : typing ? "typing" : focused ? "focus" : failed && !touched ? "error" : "idle";
  const sign = "¡Suscripto!";

  return (
    <section className={cn("nl", className)} data-state={status} aria-labelledby={`${id}-title`}>
      <div className="nl-card" data-stratum="chalk">
        <div className="nl-copy">
          <p className="eyebrow type-mono">
            <span className="veta-dot" aria-hidden="true" />
            Newsletter
          </p>
          <h2 id={`${id}-title`} className="mt-3 type-h3">
            Novedades desde la madriguera
            {place && <span className="sr-only"> ({place})</span>}
          </h2>
          <p id={descId} className="mt-2 text-muted">
            Cada tanto contamos qué estamos construyendo, qué automatización valió la pena, qué experimento con IA funcionó y cuál no.
          </p>
          <p className="mt-2 type-small text-muted">Sin spam. Solo cuando tengamos algo que realmente valga la pena desenterrar.</p>
        </div>

        <form action={action} noValidate className="nl-form" data-clarity-mask="True">
          <div className="nl-row">
            <div className="nl-edge">
              <div className="nl-burro" aria-hidden="true">
                <div className="nl-stage">
                  <div className="nl-bust">
                    <Mascot variant="mascot" sizes="96px" className="w-full" />
                  </div>
                </div>
                {/* las pezuñas agarran el borde superior del campo (mismas piezas que la vagoneta) */}
                <svg viewBox="0 0 100 40" className="nl-hands">
                  <Grip x={17} edge={40} scale={1.1} className="nl-grip" />
                  <Grip x={83} edge={40} scale={1.1} className="nl-grip" delay={-0.07} />
                </svg>
                {DIRT.map(([left, dx, dy], i) => (
                  <span key={left} className="veta-dot nl-dirt" style={{ left, "--i": i, "--dx": dx, "--dy": dy } as CSSProperties} />
                ))}
                <span className="nl-sign">{sign}</span>
              </div>

              {state.ok ? (
                <p ref={done} tabIndex={-1} role="status" className="nl-done">
                  <Check aria-hidden="true" strokeWidth={2.5} />
                  <span>{state.message ?? "¡Listo! Te avisamos cuando el burro desentierre algo."}</span>
                </p>
              ) : (
                <>
                  <label htmlFor={emailId} className="sr-only">
                    Tu email
                  </label>
                  <Input
                    id={emailId}
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="tu@correo.com"
                    required
                    className="nl-input"
                    aria-describedby={cn(descId, message && msgId) || undefined}
                    aria-invalid={emailError ? true : undefined}
                    onFocus={() => {
                      setFocused(true);
                      setTouched();
                    }}
                    onBlur={() => setFocused(false)}
                    onInput={onInput}
                  />
                </>
              )}
            </div>
            {!state.ok && (
              <Button type="submit" size="lg" loading={pending} icon={<ArrowRight />}>
                Quiero entrar
              </Button>
            )}
          </div>

          {!state.ok && (
            <Checkbox name="consent" required error={state.errors?.consent} onChange={setTouched}>
              Acepto recibir correos según la{" "}
              <Link href="/privacidad" className="text-link underline underline-offset-4">
                política de privacidad
              </Link>
              . Podés darte de baja en cada envío.
            </Checkbox>
          )}

          {/* Honeypot: invisible para personas; un bot lo completa. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              Fax
              <input name="fax" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <input ref={started} type="hidden" name="t" />
          <input type="hidden" name="source" value={pathname ?? ""} />

          <p id={msgId} aria-live="polite" className="nl-msg">
            {message && (
              <>
                <span className="hazard" aria-hidden="true">
                  <TriangleAlert strokeWidth={2.5} />
                </span>
                <span>{message}</span>
              </>
            )}
          </p>
        </form>
      </div>
    </section>
  );
}
