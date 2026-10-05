"use client";

import { Send } from "lucide-react";
import { Field, Input, Textarea } from "@/components/ui/form";
import type { FormState } from "@/lib/admin/actions";
import { StateForm } from "./state-form";

/** Responder una consulta desde el panel: sale como un correo simple (sin plantilla de marca) y queda anotado en la consulta. */
export function LeadReply({ action, subject, message }: { action: (prev: FormState, form: FormData) => Promise<FormState>; subject: string; message: string }) {
  return (
    <StateForm
      action={action}
      className="grid gap-4"
      submit={
        <>
          <Send aria-hidden="true" className="size-4" />
          Enviar por correo
        </>
      }
    >
      {(state) => (
        <>
          <Field label="Asunto" required error={state.errors?.subject}>
            <Input name="subject" defaultValue={subject} />
          </Field>
          <Field label="Mensaje" hint="Markdown simple: **negrita**, listas con «-», [enlaces](url). Firma y pie van solos." required error={state.errors?.message}>
            <Textarea name="message" defaultValue={message} rows={10} />
          </Field>
        </>
      )}
    </StateForm>
  );
}
