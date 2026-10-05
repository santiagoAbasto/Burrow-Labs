"use client";

import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Tone } from "./stratum";

type DialogProps = {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /**
   * Elemento que abre el diálogo (un <Button>). El clic se captura por delegación,
   * así que puede venir de un server component. Sin trigger: usar open/onOpenChange.
   */
  trigger?: ReactNode;
  /** Modo controlado. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Estrato del panel. */
  tone?: Tone;
  className?: string;
};

function Dialog({
  variant,
  side,
  title,
  description,
  children,
  trigger,
  open,
  onOpenChange,
  tone,
  className,
}: DialogProps & { variant: "modal" | "drawer"; side?: "left" | "right" }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [internal, setInternal] = useState(false);
  const isOpen = open ?? internal;

  const set = (next: boolean) => {
    if (open === undefined) setInternal(next);
    onOpenChange?.(next);
  };

  // showModal() da gratis: foco atrapado, Esc, capa superior y foco devuelto al cerrar.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    else if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  // Clic en el telón (el propio <dialog>, fuera del panel) = cerrar.
  const onBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) set(false);
  };

  return (
    <>
      {trigger && (
        <span className="contents" onClick={() => set(true)}>
          {trigger}
        </span>
      )}
      <dialog
        ref={ref}
        className={cn("dialog", className)}
        data-variant={variant}
        data-side={side}
        data-stratum={tone}
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        onClose={() => set(false)}
        onClick={onBackdrop}
      >
        <div className="dialog-body">
          <div className="dialog-head">
            <h2 id={titleId} className="type-h3">
              {title}
            </h2>
            <button type="button" className="dialog-close" aria-label="Cerrar" onClick={() => set(false)}>
              <X aria-hidden="true" />
            </button>
          </div>
          {description && (
            <p id={descriptionId} className="text-muted">
              {description}
            </p>
          )}
          {children}
        </div>
      </dialog>
    </>
  );
}

/** Diálogo modal centrado sobre <dialog>. Cierra con Esc, con el telón o con la X. */
export function Modal({ tone = "chalk", ...props }: DialogProps) {
  return <Dialog variant="modal" tone={tone} {...props} />;
}

/** Panel lateral sobre <dialog> (menú mobile, filtros). */
export function Drawer({
  tone = "lab",
  side = "right",
  ...props
}: DialogProps & { side?: "left" | "right" }) {
  return <Dialog variant="drawer" side={side} tone={tone} {...props} />;
}
