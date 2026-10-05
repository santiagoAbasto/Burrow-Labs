"use client";

import { ArrowLeft, ArrowRight, Check, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FormAlert } from "@/components/site/form-alert";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/form";
import { PhoneInput } from "@/components/ui/phone-input";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { NEED_LABELS, PEOPLE_OPTIONS, recommend, RESULT_INFO, type DiagnosticAnswers } from "@/lib/diagnostic";
import { submitDiagnostic, type LeadState } from "@/lib/lead-actions";
import { DIAGNOSTIC_NEEDS } from "@/lib/form-options";

const TOOL_HINTS = ["Excel", "WhatsApp", "Email", "Papel", "Un sistema propio", "Un ERP o sistema contable"];
const STEPS = 5;
const EMPTY: DiagnosticAnswers = { manualWork: "", people: "", tools: "", needs: [], hasSystem: false };

function Choice({ checked, onChange, type, name, children }: { checked: boolean; onChange: () => void; type: "radio" | "checkbox"; name: string; children: React.ReactNode }) {
  return (
    <label className={cn("flex min-h-12 items-center gap-3 rounded-md border px-4 py-2.5 font-medium transition-colors duration-fast", checked ? "border-fg bg-fg text-bg" : "border-line-strong bg-panel")}>
      <input type={type} name={name} checked={checked} onChange={onChange} className="size-4 accent-(--color-yellow-400)" />
      {children}
    </label>
  );
}

/** Diagnóstico express: 5 preguntas → recomendación por reglas. Dejar el contacto es opcional. */
export function Diagnostic() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(EMPTY);
  const [hasSystem, setHasSystem] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [lead, setLead] = useState<LeadState>({ ok: false });
  const [sending, setSending] = useState(false);
  const startedAt = useRef(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const begun = useRef(false);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  // Al cambiar de paso, el foco va al título del paso (teclado y lector de pantalla).
  useEffect(() => {
    if (begun.current) heading.current?.focus();
  }, [step]);

  const patch = (next: Partial<DiagnosticAnswers>) => {
    if (!begun.current) {
      begun.current = true;
      track("diagnostic_start");
    }
    setError("");
    setAnswers((prev) => ({ ...prev, ...next }));
  };

  const validate = (): string => {
    if (step === 0 && answers.manualWork.trim().length < 3) return "Contanos al menos una tarea que hagan a mano.";
    if (step === 1 && !answers.people) return "Elegí una opción.";
    if (step === 3 && answers.needs.length === 0) return "Elegí al menos una opción.";
    if (step === 4 && hasSystem === null) return "Elegí una opción.";
    return "";
  };

  const next = () => {
    const problem = validate();
    if (problem) return setError(problem);
    begun.current = true;
    if (step === STEPS - 1) track("diagnostic_complete", { result: recommend({ ...answers, hasSystem: hasSystem ?? false }).result });
    setStep(step + 1);
  };

  const final = { ...answers, hasSystem: hasSystem ?? false };
  const titleProps = { ref: heading, tabIndex: -1, className: "type-h2 outline-none" };

  if (step === STEPS) {
    const { result, also } = recommend(final);
    const info = RESULT_INFO[result];
    const send = async (form: FormData) => {
      setSending(true);
      const state = await submitDiagnostic(
        {
          name: form.get("name"),
          company: form.get("company") || undefined,
          email: form.get("email"),
          whatsapp: form.get("whatsapp") || undefined,
          consent: form.get("consent") === "on",
          fax: form.get("fax") || undefined,
          answers: final,
          recommendation: result,
        },
        startedAt.current,
      );
      setLead(state);
      setSending(false);
    };
    return (
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="type-mono text-muted">Tu diagnóstico</p>
          <h2 {...titleProps}>{info.title}</h2>
          <p className="mt-4 type-lead">{info.body}</p>
          {also && (
            <p className="mt-4 text-muted">
              También puede servirte: <Link href={RESULT_INFO[also].href} className="text-link underline underline-offset-4">{RESULT_INFO[also].title.toLowerCase()}</Link>.
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={info.href} icon={<ArrowRight />}>
              {info.linkLabel}
            </Button>
            <Button
              variant="secondary"
              icon={<RotateCcw />}
              onClick={() => {
                setAnswers(EMPTY);
                setHasSystem(null);
                setLead({ ok: false });
                setStep(0);
              }}
            >
              Empezar de nuevo
            </Button>
          </div>
          <p className="mt-6 type-small text-muted">Es una orientación a partir de tus respuestas, no una cotización. El alcance real se define conversando.</p>
        </div>

        <div className="rounded-lg border border-line-strong bg-panel p-6 sm:p-8">
          {lead.ok ? (
            <div role="status">
              <Check aria-hidden="true" className="size-9" strokeWidth={2.5} />
              <h3 className="mt-3 type-h3">Recibido. Te escribimos con este diagnóstico a mano.</h3>
            </div>
          ) : (
            <form action={send} noValidate className="grid gap-5" data-clarity-mask="True">
              <h3 className="type-h3">¿Querés que lo conversemos?</h3>
              <p className="text-muted">Opcional. Dejanos tus datos y te contactamos con este diagnóstico ya leído.</p>
              <Field label="Nombre" required error={lead.errors?.name}>
                <Input name="name" autoComplete="name" />
              </Field>
              <Field label="Email" required error={lead.errors?.email}>
                <Input name="email" type="email" autoComplete="email" inputMode="email" />
              </Field>
              <Field label="WhatsApp" error={lead.errors?.whatsapp}>
                <PhoneInput name="whatsapp" />
              </Field>
              <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>
                  Fax
                  <input name="fax" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              <Checkbox name="consent" required error={lead.errors?.consent}>
                Acepto que Burrow Labs guarde mis respuestas y mis datos para contactarme, según la{" "}
                <Link href="/privacidad" className="text-link underline underline-offset-4">
                  política de privacidad
                </Link>
                .
              </Checkbox>
              {lead.message && <FormAlert>{lead.message}</FormAlert>}
              <div>
                <Button type="submit" loading={sending} icon={<ArrowRight />}>
                  Enviar mi diagnóstico
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="max-w-2xl"
      onSubmit={(event) => {
        event.preventDefault();
        next();
      }}
    >
      <p className="type-mono text-muted" aria-live="polite">
        Pregunta {step + 1} de {STEPS}
      </p>
      <div className="mt-3 flex gap-1.5" aria-hidden="true">
        {Array.from({ length: STEPS }, (_, i) => (
          <span key={i} className={cn("h-1 flex-1 rounded-pill", i <= step ? "bg-fg" : "bg-line-strong/40")} />
        ))}
      </div>

      <fieldset className="mt-8">
        {step === 0 && (
          <>
            <legend>
              <h2 {...titleProps}>¿Qué hacen hoy a mano?</h2>
            </legend>
            <Field label="Contalo con tus palabras" hint="Ej.: cargamos los pedidos de WhatsApp en una planilla y después los pasamos al sistema de facturación." required className="mt-6">
              <Textarea rows={4} value={answers.manualWork} onChange={(event) => patch({ manualWork: event.target.value })} autoFocus />
            </Field>
          </>
        )}
        {step === 1 && (
          <>
            <legend>
              <h2 {...titleProps}>¿Cuántas personas participan?</h2>
            </legend>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {PEOPLE_OPTIONS.map((option) => (
                <Choice key={option} type="radio" name="people" checked={answers.people === option} onChange={() => patch({ people: option })}>
                  {option}
                </Choice>
              ))}
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <legend>
              <h2 {...titleProps}>¿Qué herramientas usan?</h2>
            </legend>
            <Field label="Herramientas" hint="Podés escribir o tocar las sugerencias." className="mt-6">
              <Input value={answers.tools} onChange={(event) => patch({ tools: event.target.value })} />
            </Field>
            <ul className="mt-3 flex flex-wrap gap-2">
              {TOOL_HINTS.map((tool) => (
                <li key={tool}>
                  <button
                    type="button"
                    className="badge type-mono min-h-11 px-3"
                    onClick={() => !answers.tools.includes(tool) && patch({ tools: [answers.tools.trim(), tool].filter(Boolean).join(", ") })}
                  >
                    + {tool}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
        {step === 3 && (
          <>
            <legend>
              <h2 {...titleProps}>¿Qué necesitás mejorar?</h2>
            </legend>
            <p className="mt-2 text-muted">Podés elegir más de una.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {DIAGNOSTIC_NEEDS.map((need) => (
                <Choice
                  key={need}
                  type="checkbox"
                  name="needs"
                  checked={answers.needs.includes(need)}
                  onChange={() => patch({ needs: answers.needs.includes(need) ? answers.needs.filter((n) => n !== need) : [...answers.needs, need] })}
                >
                  {NEED_LABELS[need]}
                </Choice>
              ))}
            </div>
          </>
        )}
        {step === 4 && (
          <>
            <legend>
              <h2 {...titleProps}>¿Ya tienen un sistema?</h2>
            </legend>
            <p className="mt-2 text-muted">Cualquier software de gestión cuenta: propio, contable, ERP o tienda online.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Choice type="radio" name="hasSystem" checked={hasSystem === true} onChange={() => (setError(""), setHasSystem(true))}>
                Sí
              </Choice>
              <Choice type="radio" name="hasSystem" checked={hasSystem === false} onChange={() => (setError(""), setHasSystem(false))}>
                No
              </Choice>
            </div>
          </>
        )}
      </fieldset>

      {error && (
        <div className="mt-5">
          <FormAlert>{error}</FormAlert>
        </div>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        {step > 0 && (
          <Button variant="secondary" onClick={() => (setError(""), setStep(step - 1))}>
            <ArrowLeft aria-hidden="true" className="size-4" />
            Atrás
          </Button>
        )}
        <Button type="submit" icon={<ArrowRight />}>
          {step === STEPS - 1 ? "Ver mi diagnóstico" : "Siguiente"}
        </Button>
      </div>
    </form>
  );
}
