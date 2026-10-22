"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { REDUCED_MOTION_QUERY } from "@/lib/motion";
import { Mascot } from "./mascot";

/** Insignia + wordmark oficiales (recortes del logo, no tipografía recreada). Al pasar el cursor, las orejas reaccionan. */
export function Logo({ className, priority = false }: { className?: string; priority?: boolean }) {
  const pathname = usePathname();
  return (
    <Link
      href="/"
      aria-label="Burrow Labs, ir al inicio"
      className={cn("inline-flex items-center gap-2.5", className)}
      onClick={(event) => {
        // Ya en el inicio, Next no navega a la misma página y el clic no hacía nada: el logo sube hasta arriba.
        if (pathname !== "/") return;
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: matchMedia(REDUCED_MOTION_QUERY).matches ? "auto" : "smooth" });
      }}
    >
      <Mascot variant="badge" sizes="48px" track={false} priority={priority} className="w-11" />
      {/* En el header es la imagen que Chrome suele tomar como LCP: se precarga y se pide con prioridad alta. */}
      <Image src="/brand/wordmark.svg" alt="" width={654} height={119} preload={priority} fetchPriority={priority ? "high" : undefined} className="h-7 w-auto" />
    </Link>
  );
}
