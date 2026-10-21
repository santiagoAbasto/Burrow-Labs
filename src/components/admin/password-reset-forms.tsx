"use client";

import { KeyRound, Mail } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Alert } from "./shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import type { FormState } from "@/lib/admin/actions";

type Action = (prev: FormState, form: FormData) => Promise<FormState>;

function Submit({ children, icon }: { children: string; icon: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" loading={pending} icon={icon} className="w-full">
      {children}
    </Button>
  );
}

/**
 * Pide el enlace por correo. La confirmación es la misma exista o no la cuenta: si dijera «esa
 * dirección no está registrada», el formulario serviría para averiguar quiénes son administradores.
 */
export function RequestResetForm({ action }: { action: Action }) {
  const [state, formAction] = useActionState(action, {});

  if (state.ok) {
    return (
      <div className="grid gap-5">
        <Alert kind="success">Si esa dirección tiene una cuenta, le mandamos un enlace para elegir una contraseña nueva.</Alert>
        <p className="type-small text-muted">
          El enlace vale una hora y se usa una sola vez. Si no llega, mirá el correo no deseado antes de pedir otro: pedir uno nuevo deja sin efecto al anterior.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="grid gap-5">
      <Field label="Email" hint="El mismo con el que entrás al panel." required>
        <Input name="email" type="email" autoComplete="username" inputMode="email" autoFocus />
      </Field>
      {state.error && <Alert kind="error">{state.error}</Alert>}
      <Submit icon={<Mail />}>Mandame el enlace</Submit>
    </form>
  );
}

/** Elige la contraseña nueva con el token del correo. Al guardar entra solo: la acción crea la sesión. */
export function NewPasswordForm({ action }: { action: Action }) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} noValidate className="grid gap-5">
      <Field label="Contraseña nueva" hint="Mínimo 12 caracteres." required error={state.errors?.password}>
        <Input name="password" type="password" autoComplete="new-password" autoFocus />
      </Field>
      <Field label="Repetila" required error={state.errors?.confirm}>
        <Input name="confirm" type="password" autoComplete="new-password" />
      </Field>
      {state.error && <Alert kind="error">{state.error}</Alert>}
      <Submit icon={<KeyRound />}>Guardar y entrar</Submit>
    </form>
  );
}
