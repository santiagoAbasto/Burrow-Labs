import type { ReactNode } from "react";
import { Reveal } from "@/components/site/reveal";

/** Se vuelve a montar en cada navegación: la página entra con un fundido y se activa el revelado por scroll. */
export default function SiteTemplate({ children }: { children: ReactNode }) {
  return (
    <div className="page-enter">
      <Reveal />
      {children}
    </div>
  );
}
