import { AdminHeading, EmptyState } from "@/components/admin/shell";
import { Button } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <>
      <AdminHeading title="Esto no está" />
      <EmptyState title="El burro cavó y no encontró nada acá." action={<Button href="/admin">Volver al dashboard</Button>}>
        La página no existe o el registro fue eliminado.
      </EmptyState>
    </>
  );
}
