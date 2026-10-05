import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SmartLink } from "./smart-link";

type Own = {
  /** primary: negro en estratos claros, amarillo en oscuros. */
  variant?: "primary" | "secondary" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  /** Bloquea el botón y muestra el cursor de terminal. */
  loading?: boolean;
  /** Icono al final (p. ej. <ArrowRight /> de lucide-react). */
  icon?: ReactNode;
};
type AsButton = Own & ComponentProps<"button"> & { href?: undefined };
type AsLink = Own & Omit<ComponentProps<"a">, "href"> & { href: string; disabled?: boolean };
export type ButtonProps = AsButton | AsLink;

/** Con `href` es un enlace (<Link> interno o <a>); sin `href`, un <button type="button">. */
export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  className,
  children,
  ...rest
}: ButtonProps) {
  const shared = {
    className: cn("btn", className),
    "data-variant": variant,
    "data-size": size,
  };
  const content = (
    <>
      {loading && <span className="sr-only">Cargando: </span>}
      {children}
      {loading ? (
        <span className="btn-loader" aria-hidden="true" />
      ) : (
        icon && (
          <span className="btn-icon" aria-hidden="true">
            {icon}
          </span>
        )
      )}
    </>
  );

  if (rest.href !== undefined) {
    const { href, disabled, ...anchor } = rest;
    if (disabled || loading) {
      return (
        <span {...shared} role="link" aria-disabled="true" aria-busy={loading || undefined}>
          {content}
        </span>
      );
    }
    return (
      <SmartLink href={href} {...anchor} {...shared}>
        {content}
      </SmartLink>
    );
  }

  const { type = "button", disabled, ...button } = rest;
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...button}
      {...shared}
    >
      {content}
    </button>
  );
}
