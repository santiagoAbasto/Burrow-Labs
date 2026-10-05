import type { ComponentProps, ReactNode } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";

export function Accordion({ className, ...rest }: ComponentProps<"div">) {
  return <div className={cn("accordion", className)} {...rest} />;
}

type AccordionItemProps = {
  title: ReactNode;
  children: ReactNode;
  /** Mismo `name` en varios items = solo uno abierto a la vez (nativo). */
  name?: string;
  defaultOpen?: boolean;
  className?: string;
};

/** <details> nativo: funciona sin JavaScript y con «buscar en la página». */
export function AccordionItem({ title, children, name, defaultOpen, className }: AccordionItemProps) {
  return (
    <details className={cn("accordion-item", className)} name={name} open={defaultOpen}>
      <summary>
        <span>{title}</span>
        <Plus className="accordion-icon" aria-hidden="true" />
      </summary>
      <div className="accordion-content">{children}</div>
    </details>
  );
}
