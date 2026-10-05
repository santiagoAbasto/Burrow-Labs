"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { recommend } from "./diagnostic";
import { limitClient } from "./rate-limit";
import { contactLeadSchema, diagnosticLeadSchema } from "./validation";

export type LeadState = { ok: boolean; message?: string; errors?: Record<string, string> };

const GENERIC = "No pudimos enviar el formulario. Probá de nuevo en un momento.";
const MIN_FILL_MS = 2500; // trampa de tiempo: una persona no completa el formulario en menos

/** Trampa de tiempo: un envío sin marca de inicio o demasiado rápido se rechaza con el mensaje genérico. */
function tooFast(renderedAt: unknown): LeadState | null {
  const started = typeof renderedAt === "string" || typeof renderedAt === "number" ? Number(renderedAt || NaN) : NaN; // sin `t` también cae (Number("") sería 0)
  return !Number.isFinite(started) || Date.now() - started < MIN_FILL_MS ? { ok: false, message: GENERIC } : null;
}

/**
 * 5 envíos por hora por visitante. Se llama DESPUÉS de validar: solo cuentan los envíos que se van a
 * guardar, así quien corrige un campo varias veces no queda bloqueado (ni pierde el lead) y un envío
 * inválido no escribe nada en la base.
 */
async function overLimit(scope: string): Promise<LeadState | null> {
  const limit = await limitClient(await headers(), scope, { limit: 5, windowSec: 3600 });
  return limit.ok ? null : { ok: false, message: "Recibimos varios envíos seguidos. Probá de nuevo más tarde o escribinos por WhatsApp." };
}

function fieldErrors(error: z.ZodError): Record<string, string> {
  return Object.fromEntries(error.issues.map((issue) => [issue.path.join("."), issue.message]).reverse());
}

const text = (form: FormData, key: string) => {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
};

/** Formulario de /contacto. Valida en servidor, limita envíos y guarda el lead solo con consentimiento. */
export async function submitContact(_prev: LeadState, form: FormData): Promise<LeadState> {
  const fast = tooFast(form.get("t"));
  if (fast) return fast;

  const parsed = contactLeadSchema.safeParse({
    name: text(form, "name"),
    company: text(form, "company"),
    email: text(form, "email"),
    whatsapp: text(form, "whatsapp"),
    goal: text(form, "goal"),
    projectType: text(form, "projectType"),
    budget: text(form, "budget"),
    timeline: text(form, "timeline"),
    message: text(form, "message"),
    consent: form.get("consent") === "on",
    fax: text(form, "fax"),
  });
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    // El honeypot no se le explica al bot: mismo mensaje genérico.
    return errors.fax ? { ok: false, message: GENERIC } : { ok: false, message: "Revisá los campos marcados.", errors };
  }

  const blocked = await overLimit("contact");
  if (blocked) return blocked;

  const { goal, consent, fax: _fax, ...lead } = parsed.data;
  void _fax;
  try {
    await db.insert(leads).values({
      ...lead,
      type: "contact",
      consent,
      payload: { goal, context: text(form, "context").slice(0, 200) },
      sourcePath: text(form, "source").slice(0, 200) || "/contacto",
    });
  } catch {
    console.error("[leads] no se pudo guardar un lead de contacto"); // sin datos personales en logs
    return { ok: false, message: GENERIC };
  }
  return { ok: true };
}

/** Diagnóstico express: el contacto es opcional y solo se guarda con consentimiento. */
export async function submitDiagnostic(input: unknown, renderedAt: number): Promise<LeadState> {
  const fast = tooFast(renderedAt);
  if (fast) return fast;

  const parsed = diagnosticLeadSchema.safeParse(input);
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    return errors.fax ? { ok: false, message: GENERIC } : { ok: false, message: "Revisá los campos marcados.", errors };
  }
  const blocked = await overLimit("diagnostic");
  if (blocked) return blocked;

  const { answers, name, company, email, whatsapp, consent } = parsed.data;
  try {
    await db.insert(leads).values({
      type: "diagnostic",
      name,
      company,
      email,
      whatsapp,
      consent,
      projectType: recommend(answers).result, // la recomendación se recalcula en servidor
      message: answers.manualWork,
      payload: { answers },
      sourcePath: "/diagnostico",
    });
  } catch {
    console.error("[leads] no se pudo guardar un lead de diagnóstico");
    return { ok: false, message: GENERIC };
  }
  return { ok: true };
}
