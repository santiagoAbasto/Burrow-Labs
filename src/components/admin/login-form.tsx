"use client";

import { Eye, EyeOff, LogIn } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Mascot } from "@/components/brand/mascot";
import { Alert } from "./shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import type { FormState } from "@/lib/admin/actions";

type PasswordProps = { shown: boolean; onToggle: () => void; onFocus: () => void; onBlur: () => void; id?: string; required?: boolean; "aria-describedby"?: string; "aria-invalid"?: boolean };

/** Campo de contraseña con botón para verla. Recibe id y aria-* de <Field> y se los pasa al input. */
function PasswordInput({ shown, onToggle, onFocus, onBlur, ...control }: PasswordProps) {
  return (
    <span className="relative block">
      <Input {...control} name="password" type={shown ? "text" : "password"} autoComplete="current-password" className="pr-12" onFocus={onFocus} onBlur={onBlur} />
      <button
        type="button"
        onClick={onToggle}
        aria-label={shown ? "Ocultar la clave" : "Ver la clave"}
        aria-pressed={shown}
        className="absolute top-1/2 right-1.5 grid size-9 -translate-y-1/2 place-items-center rounded-md text-muted hover:bg-panel hover:text-fg"
      >
        {shown ? <EyeOff aria-hidden="true" className="size-5" /> : <Eye aria-hidden="true" className="size-5" />}
      </button>
    </span>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" loading={pending} icon={<LogIn />} className="w-full">
      Ingresar
    </Button>
  );
}

/**
 * El burro acompaña el ingreso: sigue el cursor con la mirada, se tapa el ojo con la pezuña mientras
 * escribís la contraseña (y espía de reojo si la mostrás) y agacha las orejas si algo salió mal.
 */
export function LoginForm({ action }: { action: (prev: FormState, form: FormData) => Promise<FormState> }) {
  const [state, formAction] = useActionState(action, {});
  const [typing, setTyping] = useState(false);
  const [shown, setShown] = useState(false);
  const cover = typing ? (shown ? "peek" : "cover") : "rest";

  return (
    <div className="admin grid overflow-hidden rounded-lg border-[3px] border-ink bg-bg shadow-[0_0_0_5px_var(--color-yellow-400)] md:grid-cols-[1fr_1.1fr]">
      <div data-stratum="deep" className="relative flex flex-col justify-between gap-8 overflow-hidden px-8 pt-8 pb-0">
        <div>
          <p className="flex items-center gap-2.5 type-mono">
            <span className="veta-dot" aria-hidden="true" />
            Panel de administración
          </p>
          <h1 className="mt-4 type-h2">Entrá al taller.</h1>
          <p className="mt-3 max-w-xs text-muted">Acá se administra todo lo que se ve en el sitio: textos, planes, proyectos, leads y más.</p>
        </div>
        <div className="login-burro mx-auto w-52 md:w-56" data-cover={cover} data-sad={state.error ? "true" : undefined} key={state.error ? "sad" : "ok"} aria-hidden="true">
          <Mascot variant="mascot" sizes="224px" priority className="w-full" />
          {/* el brazo sube desde la laptop y tapa el ojo con la pezuña: la misma pieza (manga, mano gris, punta de pezuña) que usan los planes y la vagoneta */}
          <svg viewBox="0 0 100 155" className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
            <g className="login-arm">
              <path d="M30 118 L43 84" stroke="#fcea10" strokeWidth="24" strokeLinecap="round" />
              <path d="M30 118 L43 84" stroke="#080a09" strokeWidth="19" strokeLinecap="round" />
              <path d="M30 118 L43 84" stroke="#1671b1" strokeWidth="14" strokeLinecap="round" />
              <rect x="29" y="52" width="30" height="31" rx="15" fill="#fcea10" stroke="#fcea10" strokeWidth="6.5" strokeLinejoin="round" />
              <rect x="29" y="52" width="30" height="31" rx="15" fill="#c4c2c1" stroke="#080a09" strokeWidth="2.6" strokeLinejoin="round" />
              <path d="M30.7 60 a15 15 0 0 1 26.6 0 z" fill="#5e615e" stroke="#080a09" strokeWidth="2.6" strokeLinejoin="round" />
            </g>
          </svg>
        </div>
      </div>
      <form action={formAction} noValidate className="grid content-start gap-5 p-8 md:p-10">
        <Field label="Email" required>
          <Input name="email" type="email" autoComplete="username" inputMode="email" autoFocus />
        </Field>
        <Field label="Contraseña" required>
          <PasswordInput shown={shown} onToggle={() => setShown((value) => !value)} onFocus={() => setTyping(true)} onBlur={() => setTyping(false)} />
        </Field>
        {state.error && <Alert kind="error">{state.error}</Alert>}
        <Submit />
        <p className="type-small text-muted">
          <Link href="/admin/recuperar" className="text-link underline underline-offset-4">
            ¿Olvidaste la contraseña?
          </Link>{" "}
          Te mandamos un enlace por correo.
        </p>
      </form>
    </div>
  );
}
