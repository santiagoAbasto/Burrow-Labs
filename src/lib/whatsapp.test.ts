import { describe, expect, it } from "vitest";
import { buildWhatsAppUrl, contextualMessage, normalizePhone } from "./whatsapp";

describe("normalizePhone", () => {
  it("deja solo dígitos en formato internacional", () => {
    expect(normalizePhone("+591 700-00000")).toBe("59170000000");
    expect(normalizePhone("00591 (7) 000 0000")).toBe("59170000000");
  });

  it("devuelve null si no hay un número usable", () => {
    for (const bad of [null, undefined, "", "abc", "12345", "1".repeat(16)]) expect(normalizePhone(bad)).toBeNull();
  });
});

describe("buildWhatsAppUrl", () => {
  it("arma la URL de wa.me con el mensaje codificado", () => {
    const url = buildWhatsAppUrl("+591 70000000", "Hola Burrow Labs, ¿hablamos? #1 & más");
    expect(url).toBe(`https://wa.me/59170000000?text=${encodeURIComponent("Hola Burrow Labs, ¿hablamos? #1 & más")}`);
    expect(new URL(url!).searchParams.get("text")).toBe("Hola Burrow Labs, ¿hablamos? #1 & más");
  });

  it("sin mensaje no agrega el parámetro", () => {
    expect(buildWhatsAppUrl("59170000000")).toBe("https://wa.me/59170000000");
  });

  it("sin teléfono devuelve null", () => {
    expect(buildWhatsAppUrl("", "Hola")).toBeNull();
    expect(buildWhatsAppUrl(null, "Hola")).toBeNull();
  });
});

describe("contextualMessage", () => {
  it("desde un proyecto usa el mensaje literal del brief", () => {
    expect(contextualMessage("/proyectos/trazabilidad", { projectTitle: "Plataforma industrial de trazabilidad" })).toBe(
      "Hola Burrow Labs, vi el proyecto Plataforma industrial de trazabilidad y quiero conversar sobre algo similar.",
    );
  });

  it("adapta el mensaje a servicios y planes", () => {
    expect(contextualMessage("/servicios/automatizacion", { serviceName: "Automatización" })).toContain("Automatización");
    expect(contextualMessage("/planes", { planName: "Turbo" })).toContain("plan Turbo");
    expect(contextualMessage("/planes")).toContain("planes");
  });

  it("en el resto usa el mensaje configurado en el CMS o el genérico", () => {
    expect(contextualMessage("/", { fallback: "Hola, vengo del sitio." })).toBe("Hola, vengo del sitio.");
    expect(contextualMessage("/nosotros")).toBe("Hola Burrow Labs, quiero conversar sobre un proyecto.");
    // `/proyectos-x` no es la sección de proyectos.
    expect(contextualMessage("/proyectos-x", { projectTitle: "X" })).toBe("Hola Burrow Labs, quiero conversar sobre un proyecto.");
  });
});
