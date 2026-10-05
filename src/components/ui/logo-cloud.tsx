import Image from "next/image";
import { cn } from "@/lib/cn";
import { SmartLink } from "./smart-link";

export type LogoCloudItem = {
  name: string;
  href?: string;
  /** Sin logo se muestra el nombre en tipografía (sectores, clientes sin logo). */
  logo?: { src: string; width: number; height: number };
};

type LogoCloudProps = {
  items: LogoCloudItem[];
  /** Nombre accesible de la lista, p. ej. «Sectores con los que trabajamos». */
  label: string;
  className?: string;
};

/** Fila tipográfica estática (sin carrusel). Solo clientes y logos autorizados. */
export function LogoCloud({ items, label, className }: LogoCloudProps) {
  return (
    <ul className={cn("logo-cloud", className)} aria-label={label}>
      {items.map((item) => {
        const content = item.logo ? <Image {...item.logo} alt={item.name} /> : item.name;
        return (
          <li key={item.name}>
            {item.href ? <SmartLink href={item.href}>{content}</SmartLink> : content}
          </li>
        );
      })}
    </ul>
  );
}
