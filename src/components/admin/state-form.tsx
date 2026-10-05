"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Alert } from "./shell";
import { Button } from "@/components/ui/button";
import type { FormState } from "@/lib/admin/actions";

export function SubmitButton({ children = "Guardar", variant }: { children?: ReactNode; variant?: "primary" | "secondary" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} variant={variant}>
      {children}
    </Button>
  );
}

/** Formulario con estado de servidor: muestra el error general o la confirmación. Los errores por campo los pinta `render`. */
export function StateForm({
  action,
  children,
  submit = "Guardar",
  className = "grid gap-6",
  encType,
}: {
  action: (prev: FormState, form: FormData) => Promise<FormState>;
  children: ReactNode | ((state: FormState) => ReactNode);
  submit?: ReactNode;
  className?: string;
  encType?: "multipart/form-data";
}) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className={className} noValidate encType={encType}>
      {typeof children === "function" ? children(state) : children}
      {state.error && <Alert kind="error">{state.error}</Alert>}
      {state.ok && <Alert kind="success">Guardado. Ya está en el sitio.</Alert>}
      <div>
        <SubmitButton>{submit}</SubmitButton>
      </div>
    </form>
  );
}
