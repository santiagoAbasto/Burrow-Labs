"use client";

import { Field, Input } from "@/components/ui/form";
import type { FormState } from "@/lib/admin/actions";
import { MarkdownField } from "./markdown-field";
import { StateForm } from "./state-form";

/** Asunto + cuerpo en Markdown. Sirve para crear (sin `campaign`) y para editar un borrador. */
export function CampaignForm({ action, campaign }: { action: (prev: FormState, form: FormData) => Promise<FormState>; campaign?: { subject: string; body: string } }) {
  return (
    <StateForm action={action} submit={campaign ? "Guardar" : "Crear campaña"} className="grid gap-5">
      {(state) => (
        <>
          <Field label="Asunto" hint="Lo que se ve en la bandeja de entrada. Corto y concreto." required error={state.errors?.subject}>
            <Input name="subject" defaultValue={campaign?.subject} maxLength={150} autoComplete="off" />
          </Field>
          <MarkdownField name="body" label="Cuerpo" required error={state.errors?.body} defaultValue={campaign?.body} hint="Markdown: **negrita**, ## títulos, - listas, [enlaces](url). El pie con la baja se agrega solo." />
        </>
      )}
    </StateForm>
  );
}
