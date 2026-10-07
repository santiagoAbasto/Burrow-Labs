import type { ReactNode } from "react";

// La ficha pública vive fuera del sitio: sin cabecera ni pie, solo el documento sobre un fondo neutro.
export default function FichaPublicLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100dvh", background: "#20262b", padding: "24px 14px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>{children}</div>
    </div>
  );
}
