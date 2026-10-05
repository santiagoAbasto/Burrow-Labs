// Compartido por cliente y servidor. El teléfono viene siempre de settings (CMS), nunca del código.

/** Deja solo dígitos, en formato internacional (código de país incluido). Null si no es un número usable. */
export function normalizePhone(input: string | null | undefined): string | null {
  const digits = (input ?? "").replace(/\D/g, "").replace(/^00/, "");
  return digits.length >= 10 && digits.length <= 15 ? digits : null;
}

/** URL de wa.me con el mensaje precargado, o null si no hay teléfono válido. */
export function buildWhatsAppUrl(phone: string | null | undefined, message?: string): string | null {
  const digits = normalizePhone(phone);
  if (!digits) return null;
  const text = message?.trim();
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export type WhatsAppContext = {
  projectTitle?: string;
  serviceName?: string;
  planName?: string;
  /** Mensaje por defecto configurado en el CMS (settings.contact.whatsappDefaultMessage). */
  fallback?: string;
};

/** Mensaje precargado según la página desde la que se abre WhatsApp (brief §19). */
export function contextualMessage(pathname: string, ctx: WhatsAppContext = {}): string {
  const under = (base: string) => pathname === base || pathname.startsWith(`${base}/`);
  if (under("/proyectos") && ctx.projectTitle)
    return `Hola Burrow Labs, vi el proyecto ${ctx.projectTitle} y quiero conversar sobre algo similar.`;
  if (under("/proyectos")) return "Hola Burrow Labs, estuve viendo sus proyectos y quiero conversar sobre algo similar.";
  if (under("/servicios") && ctx.serviceName)
    return `Hola Burrow Labs, me interesa el servicio de ${ctx.serviceName} y quiero conversar.`;
  if (under("/servicios")) return "Hola Burrow Labs, estuve viendo sus servicios y quiero conversar.";
  if (under("/planes") && ctx.planName)
    return `Hola Burrow Labs, me interesa el plan ${ctx.planName} y quiero conversar sobre mi proyecto.`;
  if (under("/planes")) return "Hola Burrow Labs, estuve viendo los planes y quiero conversar sobre mi proyecto.";
  if (under("/calculadora"))
    return "Hola Burrow Labs, usé la calculadora de procesos manuales y quiero conversar sobre cómo automatizarlos.";
  if (under("/diagnostico")) return "Hola Burrow Labs, hice el diagnóstico express y quiero conversar sobre el resultado.";
  if (under("/lab")) return "Hola Burrow Labs, leí un artículo de Burrow Lab y quiero conversar.";
  return ctx.fallback?.trim() || "Hola Burrow Labs, quiero conversar sobre un proyecto.";
}
