import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type BadgeProps = ComponentProps<"span"> & {
  variant?: "outline" | "solid" | "accent";
  /** Antepone el nodo de la veta (estado activo, «en vivo»). */
  dot?: boolean;
};

export function Badge({ variant = "outline", dot = false, className, children, ...rest }: BadgeProps) {
  return (
    <span className={cn("badge type-mono", className)} data-variant={variant} {...rest}>
      {dot && <span className="veta-dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
