import { Mascot } from "@/components/brand/mascot";

/** Mientras carga una pantalla del panel. */
export default function AdminLoading() {
  return (
    <div className="grid min-h-[50vh] place-items-center" role="status" aria-live="polite">
      <div className="grid justify-items-center gap-3">
        <Mascot variant="mascot" sizes="64px" lively className="w-14" />
        <p className="type-mono text-muted">Cavando…</p>
      </div>
    </div>
  );
}
