import { describe, expect, it } from "vitest";
import { contactLeadSchema, diagnosticLeadSchema, slugify, slugSchema } from "./validation";

const contact = {
  name: "Ana Pérez",
  company: "",
  email: "  Ana@Example.com ",
  whatsapp: "",
  goal: "Un sistema de pedidos",
  projectType: "Sistema",
  budget: "",
  timeline: "2 meses",
  message: "Hoy llevamos los pedidos en una planilla y se nos pierden.",
  consent: true,
  fax: "",
};

describe("contactLeadSchema", () => {
  it("acepta un lead válido y normaliza", () => {
    const lead = contactLeadSchema.parse(contact);
    expect(lead.email).toBe("ana@example.com");
    expect(lead.company).toBeUndefined();
    expect(lead.whatsapp).toBeUndefined();
    expect(lead.timeline).toBe("2 meses");
  });

  it("rechaza sin consentimiento", () => {
    expect(contactLeadSchema.safeParse({ ...contact, consent: false }).success).toBe(false);
    expect(contactLeadSchema.safeParse({ ...contact, consent: undefined }).success).toBe(false);
    expect(contactLeadSchema.safeParse({ ...contact, consent: "on" }).success).toBe(false);
  });

  it("rechaza el honeypot lleno", () => {
    expect(contactLeadSchema.safeParse({ ...contact, fax: "http://spam.example" }).success).toBe(false);
    const withoutHoneypot: Partial<typeof contact> = { ...contact };
    delete withoutHoneypot.fax;
    expect(contactLeadSchema.safeParse(withoutHoneypot).success).toBe(true);
  });

  it("valida email, tipo de proyecto, WhatsApp y longitudes", () => {
    expect(contactLeadSchema.safeParse({ ...contact, email: "no-es-email" }).success).toBe(false);
    expect(contactLeadSchema.safeParse({ ...contact, projectType: "Blockchain" }).success).toBe(false);
    expect(contactLeadSchema.safeParse({ ...contact, whatsapp: "<script>" }).success).toBe(false);
    expect(contactLeadSchema.safeParse({ ...contact, whatsapp: "+591 700 00000" }).success).toBe(true);
    expect(contactLeadSchema.safeParse({ ...contact, message: "x".repeat(4001) }).success).toBe(false);
  });
});

describe("diagnosticLeadSchema", () => {
  const diagnostic = {
    name: "Ana Pérez",
    email: "ana@example.com",
    consent: true,
    answers: { manualWork: "Cargar ventas en Excel", people: "2-5", tools: "Excel, WhatsApp", needs: ["ventas", "automatizacion"], hasSystem: false },
    recommendation: "Automatización",
  };

  it("acepta un diagnóstico válido", () => {
    expect(diagnosticLeadSchema.safeParse(diagnostic).success).toBe(true);
  });

  it("rechaza sin consentimiento, con honeypot o con opciones fuera de lista", () => {
    expect(diagnosticLeadSchema.safeParse({ ...diagnostic, consent: false }).success).toBe(false);
    expect(diagnosticLeadSchema.safeParse({ ...diagnostic, fax: "x" }).success).toBe(false);
    expect(diagnosticLeadSchema.safeParse({ ...diagnostic, recommendation: "Blockchain" }).success).toBe(false);
    expect(diagnosticLeadSchema.safeParse({ ...diagnostic, answers: { ...diagnostic.answers, needs: [] } }).success).toBe(false);
  });
});

describe("slug", () => {
  it("slugify quita acentos, símbolos y guiones sobrantes", () => {
    expect(slugify("  Automatización & IA aplicada!  ")).toBe("automatizacion-ia-aplicada");
    expect(slugify("¿Qué es un CRM?")).toBe("que-es-un-crm");
    expect(slugSchema.safeParse(slugify("E-commerce B2B")).success).toBe(true);
  });

  it("slugSchema rechaza slugs inválidos", () => {
    for (const bad of ["", "Con-Mayúscula", "con espacio", "-inicio", "fin-", "doble--guion", "../etc"]) expect(slugSchema.safeParse(bad).success).toBe(false);
  });
});
