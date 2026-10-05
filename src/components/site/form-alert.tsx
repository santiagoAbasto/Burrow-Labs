import { TriangleAlert } from "lucide-react";

/** Aviso de formulario: placa de mina + texto en negrita (no depende del color). */
export function FormAlert({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="flex items-center gap-3 font-semibold">
      <span className="hazard" aria-hidden="true">
        <TriangleAlert />
      </span>
      {children}
    </p>
  );
}
