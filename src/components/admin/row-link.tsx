import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Enlace principal de una fila de listado: la insignia del burro y el nombre, sin subrayado. */
export function RowLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("row-link", className)}>
      <Image src="/brand/badge.svg" alt="" width={20} height={20} className="row-link-badge" aria-hidden="true" />
      <span className="min-w-0 truncate">{children}</span>
    </Link>
  );
}
