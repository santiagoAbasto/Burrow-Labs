import { afterEach, describe, expect, it, vi } from "vitest";
import { leadForProspect, parseSince, prospectTokenOk, sheetForProspect, type LeadRow, type SheetRow } from "./prospect-sync";

const TOKEN = "a".repeat(40);
const at = new Date("2026-10-30T12:00:00Z");

describe("prospectTokenOk", () => {
  it("solo acepta el token exacto con Bearer, y sin token configurado no entra nadie", () => {
    expect(prospectTokenOk(`Bearer ${TOKEN}`, TOKEN)).toBe(true);
    expect(prospectTokenOk(`Bearer ${TOKEN}x`, TOKEN)).toBe(false);
    expect(prospectTokenOk(TOKEN, TOKEN)).toBe(false);
    expect(prospectTokenOk(null, TOKEN)).toBe(false);
    expect(prospectTokenOk("Bearer ", undefined)).toBe(false);
  });
});

describe("parseSince", () => {
  it("lee una fecha ISO y con cualquier otra cosa empieza desde el principio", () => {
    expect(parseSince("2026-10-01T00:00:00Z").toISOString()).toBe("2026-10-01T00:00:00.000Z");
    expect(parseSince("ayer").getTime()).toBe(0);
    expect(parseSince(null).getTime()).toBe(0);
  });
});

describe("mapeo para Prospect", () => {
  it("una consulta lleva lo que el cliente contó y el enlace al panel", () => {
    const lead: LeadRow = {
      id: "l1", type: "diagnostic", name: "Ana", company: "Panadería", email: "ana@x.bo", whatsapp: "+59170000000",
      projectType: "Web", budget: "Hasta USD 300", timeline: "Lo antes posible", message: "Quiero vender por internet",
      payload: { q1: "Pedidos por WhatsApp" }, consentAt: at, status: "new", createdAt: at, updatedAt: at,
    };
    const out = leadForProspect(lead, "https://burrowlabs.com.bo");
    expect(out.kind).toBe("diagnostico");
    expect(out.answers).toEqual({ q1: "Pedidos por WhatsApp" });
    expect(out.adminUrl).toBe("https://burrowlabs.com.bo/admin/leads/l1");
  });

  it("una ficha no lleva presupuesto, descuentos, pagos, hosting ni notas internas, y tolera datos a medias", () => {
    const sheet: SheetRow = {
      id: "s1", code: "BL-2026-PANA", empresa: "Panadería", status: "in_progress", priority: "Alta", updatedAt: at,
      data: {
        rubro: "Panadería", objetivo: "Pedidos en línea", telefonos: [{ label: "Dueño", v: "70000000" }], emails: null,
        requerimientos: [{ t: "Catálogo de tortas", st: "ok", nota: "interna" }, { t: "  " }],
        presupuesto: "USD 900", descuentos: [{ t: "10%" }], pago: "50% adelanto", notas: "cliente difícil", hostingCual: "x",
      },
    };
    const out = sheetForProspect(sheet, "https://burrowlabs.com.bo");
    expect(out.estado).toBe("En curso");
    expect(out.telefonos).toEqual(["70000000"]);
    expect(out.emails).toEqual([]);
    expect(out.requerimientos).toEqual([{ t: "Catálogo de tortas", st: "ok", tag: null }]);
    const json = JSON.stringify(out);
    for (const secret of ["USD 900", "10%", "adelanto", "cliente difícil", "interna"]) expect(json).not.toContain(secret);
  });
});

describe("GET /api/prospect/sync", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("sin token configurado la ruta no existe; con un token equivocado responde 401 sin tocar la base", async () => {
    let { GET } = await import("@/app/api/prospect/sync/route");
    expect((await GET(new Request("http://x/api/prospect/sync"))).status).toBe(404);

    vi.resetModules();
    vi.stubEnv("PROSPECT_API_TOKEN", TOKEN);
    ({ GET } = await import("@/app/api/prospect/sync/route"));
    const res = await GET(new Request("http://x/api/prospect/sync", { headers: { authorization: "Bearer otro-token-cualquiera-de-40-caracteres" } }));
    expect(res.status).toBe(401);
  });
});
