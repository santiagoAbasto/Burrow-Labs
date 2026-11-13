import { describe, expect, it } from "vitest";
import { isInternalLink, isSeasonActive, parseSeasonPreview, resolveSeason, seasonAttributes, seasonFormSchema, seasonInstant, seasonSchema, SEASON_OFF, surfaceOf, toLocalInput } from "./season";

const base = seasonSchema.parse(undefined);
const scheduled = { ...base, mode: "scheduled" as const, start: "2026-12-01T00:00", end: "2027-01-07T00:00" };
/** Un instante escrito en hora de Bolivia (UTC−4). */
const bo = (local: string) => new Date(`${local}:00-04:00`);

describe("la campaña nace apagada", () => {
  it("sin nada guardado: modo apagado, nieve apagada, nadie la ve", () => {
    expect(base.mode).toBe("off");
    expect(base.snow).toBe(false);
    expect(isSeasonActive(base)).toBe(false);
    expect(resolveSeason({ settings: base, musicReady: true })).toEqual(SEASON_OFF);
    expect(seasonAttributes(null)).toEqual({});
  });

  it("un valor guardado corrupto vuelve a los valores iniciales en vez de romper el sitio", () => {
    expect(seasonSchema.safeParse({ mode: "siempre" }).success).toBe(false);
    expect(parseSeasonPreview("{no es json")).toBeNull();
    expect(parseSeasonPreview(JSON.stringify({ mode: "manual", link: "https://otro.sitio" }))).toBeNull();
  });
});

describe("modo programado: inicio inclusivo, fin exclusivo, hora de Bolivia", () => {
  it("un minuto antes del inicio todavía no se ve", () => {
    expect(isSeasonActive(scheduled, bo("2026-11-30T23:59"))).toBe(false);
  });
  it("en el minuto exacto del inicio ya se ve", () => {
    expect(isSeasonActive(scheduled, bo("2026-12-01T00:00"))).toBe(true);
  });
  it("un instante antes del fin se sigue viendo", () => {
    expect(isSeasonActive(scheduled, new Date(bo("2027-01-07T00:00").getTime() - 1))).toBe(true);
  });
  it("a la hora exacta del fin ya no se ve", () => {
    expect(isSeasonActive(scheduled, bo("2027-01-07T00:00"))).toBe(false);
  });
  it("las fechas se leen en hora de Bolivia, no en la del servidor (UTC)", () => {
    // 1 de diciembre 00:00 en Bolivia = 04:00 UTC: a las 03:59 UTC todavía es noviembre en La Paz
    expect(seasonInstant("2026-12-01T00:00")?.toISOString()).toBe("2026-12-01T04:00:00.000Z");
    expect(isSeasonActive(scheduled, new Date("2026-12-01T03:59:00Z"))).toBe(false);
    expect(isSeasonActive(scheduled, new Date("2026-12-01T04:00:00Z"))).toBe(true);
    expect(toLocalInput(new Date("2026-12-01T04:00:00Z"))).toBe("2026-12-01T00:00");
  });
  it("un intervalo incompleto, al revés o con una fecha que no existe nunca enciende", () => {
    const now = bo("2026-12-15T12:00");
    expect(isSeasonActive({ ...scheduled, end: "" }, now)).toBe(false);
    expect(isSeasonActive({ ...scheduled, start: "" }, now)).toBe(false);
    expect(isSeasonActive({ ...scheduled, start: scheduled.end, end: scheduled.start }, now)).toBe(false);
    expect(isSeasonActive({ ...scheduled, start: "2026-02-31T00:00" }, now)).toBe(false);
    expect(seasonInstant("2026-02-31T00:00")).toBeNull();
    expect(seasonInstant("mañana")).toBeNull();
  });
  it("manual se ve siempre; apagado, nunca, aunque las fechas digan otra cosa", () => {
    expect(isSeasonActive({ ...scheduled, mode: "manual" }, bo("2030-06-01T00:00"))).toBe(true);
    expect(isSeasonActive({ ...scheduled, mode: "off" }, bo("2026-12-15T12:00"))).toBe(false);
  });
});

describe("superficies", () => {
  it("el panel, el sitio y las rutas que no se visten", () => {
    expect(surfaceOf("/")).toBe("site");
    expect(surfaceOf("/proyectos/blackphone")).toBe("site");
    expect(surfaceOf("/admin")).toBe("admin");
    expect(surfaceOf("/admin/navidad")).toBe("admin");
    expect(surfaceOf("/administracion")).toBe("site"); // no es el panel: solo se parece
    for (const path of ["/api/season", "/ficha/abc", "/dev/cover/x", "/media/a.webp"]) expect(surfaceOf(path)).toBeNull();
  });

  it("cada superficie se apaga por separado y usa su intensidad", () => {
    const state = resolveSeason({ settings: { ...base, mode: "manual", admin: false }, musicReady: true });
    expect(state.admin).toBeNull();
    expect(state.site).toMatchObject({ surface: "site", intensity: "festive" });
    const both = resolveSeason({ settings: { ...base, mode: "manual" }, musicReady: true });
    expect(both.admin).toMatchObject({ surface: "admin", intensity: "subtle" });
  });

  it("la nieve, la música, el saludo y el enlace nunca llegan al panel", () => {
    const state = resolveSeason({ settings: { ...base, mode: "manual", snow: true, music: true, greeting: "Hola", link: "/contacto" }, musicReady: true });
    expect(state.site).toMatchObject({ snow: true, music: true, greeting: "Hola", link: "/contacto" });
    expect(state.admin).toMatchObject({ snow: false, music: false, greeting: "", link: "" });
  });

  it("sin la pista propia no hay música, aunque el interruptor esté encendido", () => {
    expect(resolveSeason({ settings: { ...base, mode: "manual", music: true }, musicReady: false }).site?.music).toBe(false);
  });

  it("animaciones apagadas → data-season-still desde el servidor", () => {
    const { site } = resolveSeason({ settings: { ...base, mode: "manual", animations: false }, musicReady: false });
    expect(seasonAttributes(site)).toEqual({ "data-season": "christmas", "data-season-surface": "site", "data-season-intensity": "festive", "data-season-still": "" });
    expect(seasonAttributes(resolveSeason({ settings: { ...base, mode: "manual" }, musicReady: false }).site)).not.toHaveProperty("data-season-still");
  });
});

describe("vista previa: solo en la sesión de quien administra", () => {
  const preview = { ...base, mode: "off" as const, siteIntensity: "subtle" as const };

  it("con sesión del panel se ve aunque la campaña esté apagada, y queda marcada como vista previa", () => {
    const state = resolveSeason({ settings: base, musicReady: false, preview, isAdmin: true });
    expect(state.site).toMatchObject({ intensity: "subtle", preview: true });
  });
  it("sin sesión la misma cookie no hace nada: un visitante nunca ve la vista previa de otro", () => {
    expect(resolveSeason({ settings: base, musicReady: false, preview, isAdmin: false })).toEqual(SEASON_OFF);
    expect(resolveSeason({ settings: base, musicReady: false, preview })).toEqual(SEASON_OFF);
  });
  it("sin sesión, con la campaña encendida, se ve la publicada y no la de la cookie", () => {
    const state = resolveSeason({ settings: { ...base, mode: "manual" }, musicReady: false, preview, isAdmin: false });
    expect(state.site).toMatchObject({ intensity: "festive", preview: false });
  });
});

describe("validación del formulario del panel", () => {
  const form = { ...base };
  const issues = (value: unknown) => {
    const result = seasonFormSchema.safeParse(value);
    return result.success ? [] : result.error.issues.map((issue) => String(issue.path[0]));
  };

  it("programada exige las dos fechas y que el fin sea posterior", () => {
    expect(issues({ ...form, mode: "scheduled" })).toEqual(["start", "end"]);
    expect(issues({ ...form, mode: "scheduled", start: "2026-12-10T00:00", end: "2026-12-10T00:00" })).toEqual(["end"]);
    expect(issues({ ...form, mode: "scheduled", start: "2026-12-10T00:00", end: "2026-12-01T00:00" })).toEqual(["end"]);
    expect(issues(scheduled)).toEqual([]);
  });
  it("apagada o manual no exigen fechas", () => {
    expect(issues({ ...form, mode: "off" })).toEqual([]);
    expect(issues({ ...form, mode: "manual" })).toEqual([]);
  });
  it("rechaza modos, intensidades y fechas inventadas", () => {
    expect(issues({ ...form, mode: "siempre" })).toEqual(["mode"]);
    expect(issues({ ...form, siteIntensity: "extrema" })).toEqual(["siteIntensity"]);
    expect(issues({ ...form, start: "2026-13-40T99:99" })).toEqual(["start"]);
  });
  it("el enlace del saludo solo puede ser una página de este sitio", () => {
    for (const link of ["https://otro.sitio", "//otro.sitio", "javascript:alert(1)", "/a b", '/"onload="x']) expect(issues({ ...form, link }), link).toEqual(["link"]);
    for (const link of ["", "/contacto", "/proyectos/blackphone?ref=navidad#top"]) expect(issues({ ...form, link }), link).toEqual([]);
    expect(isInternalLink("/contacto")).toBe(true);
    expect(isInternalLink(null)).toBe(false);
  });
  it("el saludo va en una línea: hasta 90 caracteres", () => {
    expect(issues({ ...form, greeting: "x".repeat(91) })).toEqual(["greeting"]);
    expect(issues({ ...form, greeting: "x".repeat(90) })).toEqual([]);
  });
});
