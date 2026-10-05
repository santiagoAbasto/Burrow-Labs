"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { SubmitButton } from "./state-form";

/** Borrar siempre pide confirmación. `action` es una server action ya enlazada al id. */
export function ConfirmDelete({ action, what }: { action: () => Promise<void>; what: string }) {
  return (
    <Modal
      title={`¿Eliminar ${what}?`}
      description="Esta acción no se puede deshacer."
      trigger={
        <Button variant="ghost" icon={<Trash2 />}>
          Eliminar
        </Button>
      }
    >
      <form action={action} className="mt-6">
        <SubmitButton>Sí, eliminar</SubmitButton>
      </form>
    </Modal>
  );
}
