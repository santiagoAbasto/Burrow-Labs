"use client";

import { Field, Input } from "@/components/ui/form";
import type { FormState } from "@/lib/admin/actions";
import { StateForm } from "./state-form";

type Action = (prev: FormState, form: FormData) => Promise<FormState>;

export function CreateUserForm({ action }: { action: Action }) {
  return (
    <StateForm action={action} submit="Crear usuario" className="grid gap-4">
      {(state) => (
        <>
          <Field label="Nombre" required error={state.errors?.name}>
            <Input name="name" autoComplete="off" />
          </Field>
          <Field label="Email" required error={state.errors?.email}>
            <Input name="email" type="email" autoComplete="off" inputMode="email" />
          </Field>
          <Field label="Contraseña" hint="Mínimo 12 caracteres. Después puede cambiarla desde «Mi cuenta»." required error={state.errors?.password}>
            <Input name="password" type="password" autoComplete="new-password" />
          </Field>
          <Field label="Repetila" required error={state.errors?.confirm}>
            <Input name="confirm" type="password" autoComplete="new-password" />
          </Field>
        </>
      )}
    </StateForm>
  );
}

/** Restablece la contraseña de otro administrador. La propia se cambia con AccountForm (pide la actual). */
export function ResetPasswordForm({ action }: { action: Action }) {
  return (
    <StateForm action={action} submit="Cambiar contraseña" className="mt-4 grid max-w-sm gap-4">
      {(state) => (
        <>
          <Field label="Nueva contraseña" hint="Mínimo 12 caracteres." required error={state.errors?.password}>
            <Input name="password" type="password" autoComplete="new-password" />
          </Field>
          <Field label="Repetila" required error={state.errors?.confirm}>
            <Input name="confirm" type="password" autoComplete="new-password" />
          </Field>
          <p className="type-small text-muted">Sus sesiones abiertas se cierran.</p>
        </>
      )}
    </StateForm>
  );
}

export function AccountForm({ action, name }: { action: Action; name: string }) {
  return (
    <StateForm action={action} submit="Guardar cambios" className="grid max-w-md gap-5">
      {(state) => (
        <>
          <Field label="Nombre" hint="Así aparecés en la bitácora." required error={state.errors?.name}>
            <Input name="name" defaultValue={name} autoComplete="name" />
          </Field>
          <fieldset className="grid gap-4 p-5">
            <legend>Cambiar contraseña (opcional)</legend>
            <Field label="Contraseña actual" error={state.errors?.current}>
              <Input name="current" type="password" autoComplete="current-password" />
            </Field>
            <Field label="Nueva contraseña" hint="Mínimo 12 caracteres. Dejá vacío para no cambiarla." error={state.errors?.password}>
              <Input name="password" type="password" autoComplete="new-password" />
            </Field>
            <Field label="Repetí la nueva" error={state.errors?.confirm}>
              <Input name="confirm" type="password" autoComplete="new-password" />
            </Field>
          </fieldset>
        </>
      )}
    </StateForm>
  );
}
