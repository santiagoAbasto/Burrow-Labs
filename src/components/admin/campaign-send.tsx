"use client";

import { Send } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import type { FormState } from "@/lib/admin/actions";
import { Alert } from "./shell";
import { SubmitButton } from "./state-form";

/** «Enviarme una prueba»: va al email del admin logueado. Sin proveedor real, avisa que solo quedó en consola. */
export function SendTestForm({ action, email, configured }: { action: (prev: FormState, form: FormData) => Promise<FormState>; email: string; configured: boolean }) {
  const [state, formAction] = useActionState(action, {});
  return (
    <form action={formAction} className="grid gap-3">
      <p className="type-small text-muted">Te llega a {email} con «[Prueba]» en el asunto. Los suscriptores no reciben nada.</p>
      {state.error && <Alert kind="error">{state.error}</Alert>}
      {state.ok && (configured ? <Alert kind="success">Prueba enviada a {email}. Revisá tu bandeja (y el spam).</Alert> : <Alert kind="info">Sin proveedor de correo (EMAIL_DRIVER=log): la prueba solo quedó en la consola del servidor.</Alert>)}
      <div>
        <SubmitButton variant="secondary">Enviarme una prueba</SubmitButton>
      </div>
    </form>
  );
}

/** «Enviar a N suscriptores» con confirmación. `action` es sendCampaign ya enlazada al id. */
export function SendCampaignButton({ action, recipients }: { action: () => Promise<void>; recipients: number }) {
  const people = `${recipients} ${recipients === 1 ? "suscriptor" : "suscriptores"}`;
  if (recipients === 0) return <Button disabled>Nadie a quien enviar todavía</Button>;
  return (
    <Modal title={`¿Enviar a ${people}?`} description={`Se va a enviar a ${recipients} ${recipients === 1 ? "persona" : "personas"}. No se puede deshacer.`} trigger={<Button icon={<Send />}>Enviar a {people}</Button>}>
      <form action={action} className="mt-6">
        <SubmitButton>Sí, enviar ahora</SubmitButton>
      </form>
    </Modal>
  );
}
