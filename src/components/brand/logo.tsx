import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Mascot } from "./mascot";

/** Insignia + wordmark oficiales (recortes del logo, no tipografía recreada). Al pasar el cursor, las orejas reaccionan. */
export function Logo({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Link href="/" aria-label="Burrow Labs, ir al inicio" className={cn("inline-flex items-center gap-2.5", className)}>
      <Mascot variant="badge" sizes="48px" track={false} priority={priority} className="w-11" />
      {/* En el header es la imagen que Chrome suele tomar como LCP: se precarga y se pide con prioridad alta. */}
      <Image src="/brand/wordmark.svg" alt="" width={654} height={119} preload={priority} fetchPriority={priority ? "high" : undefined} className="h-7 w-auto" />
    </Link>
  );
}
