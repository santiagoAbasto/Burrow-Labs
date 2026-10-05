"use client";

import { ArrowRight, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Mascot } from "@/components/brand/mascot";
import { Tooltip } from "@/components/ui/tooltip";
import { track } from "@/lib/analytics";
import { buildWhatsAppUrl, contextualMessage } from "@/lib/whatsapp";

type Props = {
  /** Viene de settings (CMS). Sin teléfono válido, el botón lleva a /contacto. */
  phone: string;
  tooltip: string;
  greeting: string;
  defaultMessage: string;
};

/** El globo con el teléfono que todo el mundo reconoce como WhatsApp, en los colores de la marca (nada de verde ajeno). */
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" className="size-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 3.5A12.5 12.5 0 0 0 5.3 22.4L3.8 28.2l6-1.5A12.5 12.5 0 1 0 16 3.5z" />
      <path d="M11.6 10.3c.3-.5 1.3-.7 1.7-.2l1.3 2.2c.2.4.1.8-.2 1.1l-.8.8c.9 1.9 2.4 3.4 4.3 4.3l.8-.8c.3-.3.7-.4 1.1-.2l2.2 1.3c.5.4.3 1.4-.2 1.7-.9.9-2.1 1.3-3.3.9A11 11 0 0 1 10.7 13.6c-.4-1.2 0-2.4.9-3.3z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** WhatsApp flotante con identidad Burrow Labs. Estados: cerrado, hover (tooltip) y abierto (tarjeta). */
export function WhatsAppButton({ phone, tooltip, greeting, defaultMessage }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    const onClick = (event: PointerEvent) => {
      if (!panel.current?.contains(event.target as Node) && !trigger.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onClick);
    };
  }, [open]);

  const go = () => {
    // El mensaje se arma con la página actual: en un proyecto o servicio, lleva su nombre.
    const heading = document.querySelector("main h1")?.textContent?.trim();
    const message = contextualMessage(pathname, { projectTitle: heading, serviceName: heading, fallback: defaultMessage });
    track("whatsapp_click", { path: pathname });
    const url = buildWhatsAppUrl(phone, message);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    else if (pathname === "/contacto") document.querySelector<HTMLInputElement>("main form input[name=name]")?.focus();
    else router.push("/contacto");
    setOpen(false);
  };

  const button = (
    <button
      ref={trigger}
      type="button"
      onClick={() => setOpen((value) => !value)}
      aria-expanded={open}
      aria-controls={panelId}
      aria-label={open ? "Cerrar" : `WhatsApp: ${tooltip}`}
      className="whatsapp-fab flex min-h-14 items-center gap-2.5 rounded-full bg-yellow-400 px-4 font-bold text-ink"
    >
      {open ? <X aria-hidden="true" className="size-6" /> : <WhatsAppIcon />}
      <span className={open ? "sr-only" : "max-sm:sr-only"}>WhatsApp</span>
    </button>
  );

  return (
    <div className="fixed right-4 bottom-4 z-40 sm:right-6 sm:bottom-6" data-stratum="surface" style={{ background: "none" }}>
      {open && (
        <div
          ref={panel}
          id={panelId}
          role="dialog"
          aria-label="Hablar con Burrow Labs"
          className="sticker absolute right-0 bottom-[calc(100%+0.875rem)] w-[min(19rem,calc(100vw-2rem))] bg-white p-5 text-ink"
        >
          <div className="flex items-start gap-3">
            <Mascot variant="badge" sizes="56px" className="w-14" />
            <p className="pt-1 font-semibold">{greeting}</p>
          </div>
          <button type="button" onClick={go} className="btn mt-4 w-full" data-variant="primary" data-size="md" autoFocus>
            Hablemos
            <span className="btn-icon" aria-hidden="true">
              <ArrowRight />
            </span>
          </button>
        </div>
      )}
      {/* Siempre dentro de <Tooltip>: si el botón cambiara de lugar en el árbol al abrir o cerrar, se volvería a montar y perdería el foco. */}
      <Tooltip label={tooltip} side="top" align="end" disabled={open}>
        {button}
      </Tooltip>
    </div>
  );
}
