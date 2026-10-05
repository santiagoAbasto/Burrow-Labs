import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export type SmartLinkProps = Omit<ComponentProps<"a">, "href"> & { href: string };

/**
 * <Link> para rutas internas; <a> para lo demás (#ancla, mailto:, tel:, externos).
 * Los enlaces externos abren pestaña nueva con rel seguro.
 */
export function SmartLink({ href, rel, ...rest }: SmartLinkProps) {
  if (href.startsWith("/") && !href.startsWith("//")) {
    return <Link href={href} rel={rel} {...rest} />;
  }
  const external = /^(https?:)?\/\//i.test(href);
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      {...rest}
      rel={external ? cn("noopener noreferrer", rel) : rel}
    />
  );
}
