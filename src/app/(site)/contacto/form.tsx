"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { FormAlert } from "@/components/site/form-alert";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/form";
import { PhoneInput } from "@/components/ui/phone-input";
import { track } from "@/lib/analytics";
import { submitContact, type LeadState } from "@/lib/lead-actions";
import { PROJECT_TYPES } from "@/lib/form-options";

const BUDGETS = ["Hasta USD 300", "USD 300 a 1.000", "USD 1.000 a 3.000", "Más de USD 3.000", "Todavía no lo sé"];
const TIMELINES = ["Lo antes posible", "En 1 a 3 meses", "En más de 3 meses", "Sin apuro"];

export type ContactPrefill = { goal?: string; projectType?: string; message?: string; context?: string };

export function ContactForm({ prefill }: { prefill: ContactPrefill }) {
  const [state, action, pending] = useActionState<LeadState, FormData>(submitContact, { ok: false });
  const started = useRef<HTMLInputElement>(null);
  const done = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (started.current) started.current.value = String(Date.now());
  }, []);
  useEffect(() => {
    if (!state.ok) return;
    track("contact_submit");
    done.current?.focus();
  }, [state.ok]);

  if (state.ok) {
    return (
      <div ref={done} tabIndex={-1} role="status" className="rounded-lg border border-line-strong bg-panel p-8 sm:p-12">
        <Check aria-hidden="true" className="size-10" strokeWidth={2.5} />
        <h2 className="mt-4 type-h2">Recibido.</h2>
        <p className="mt-4 type-lead">Leemos cada mensaje. Te vamos a responder con una propuesta concreta o con las preguntas que falten para armarla.</p>
        <Button href="/" variant="secondary" className="mt-8">
          Volver al inicio
        </Button>
      </div>
    );
  }

  const error = (name: string) => state.errors?.[name];
  return (
    <form action={action} noValidate className="grid gap-6" data-clarity-mask="True">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Nombre" required error={error("name")}>
          <Input name="name" autoComplete="name" />
        </Field>
        <Field label="Empresa" error={error("company")}>
          <Input name="company" autoComplete="organization" />
        </Field>
        <Field label="Email" required error={error("email")}>
          <Input name="email" type="email" autoComplete="email" inputMode="email" />
        </Field>
        <Field label="WhatsApp" error={error("whatsapp")}>
          <PhoneInput name="whatsapp" />
        </Field>
      </div>
      <Field label="¿Qué querés construir?" required error={error("goal")}>
        <Input name="goal" defaultValue={prefill.goal} placeholder="Ej.: un sistema de pedidos, una tienda online, automatizar reportes" />
      </Field>
      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="Tipo de proyecto" required error={error("projectType")}>
          <Select name="projectType" defaultValue={prefill.projectType ?? ""}>
            <option value="" disabled>
              Elegí una opción
            </option>
            {PROJECT_TYPES.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </Select>
        </Field>
        <Field label="Presupuesto aproximado" error={error("budget")}>
          <Select name="budget" defaultValue="">
            <option value="">Prefiero no decirlo</option>
            {BUDGETS.map((budget) => (
              <option key={budget}>{budget}</option>
            ))}
          </Select>
        </Field>
        <Field label="Plazo" error={error("timeline")}>
          <Select name="timeline" defaultValue="">
            <option value="">Sin definir</option>
            {TIMELINES.map((timeline) => (
              <option key={timeline}>{timeline}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Descripción" required hint="Cómo lo hacen hoy, cuántas personas participan y qué herramientas usan." error={error("message")}>
        <Textarea name="message" rows={6} defaultValue={prefill.message} />
      </Field>

      {/* Honeypot: invisible para personas; un bot lo completa. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Fax
          <input name="fax" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input ref={started} type="hidden" name="t" />
      <input type="hidden" name="context" value={prefill.context ?? ""} />
      <input type="hidden" name="source" value="/contacto" />

      <Checkbox name="consent" required error={error("consent")}>
        Acepto que Burrow Labs guarde estos datos para responder mi consulta, según la{" "}
        <Link href="/privacidad" className="text-link underline underline-offset-4">
          política de privacidad
        </Link>
        .
      </Checkbox>

      {state.message && <FormAlert>{state.message}</FormAlert>}
      <div>
        <Button type="submit" size="lg" loading={pending} icon={<ArrowRight />}>
          Enviar
        </Button>
      </div>
    </form>
  );
}
