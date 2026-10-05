import { randomUUID } from "node:crypto";
import { inArray, like } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// Fuera de Next no existe la caché incremental: se prueba la consulta, sin caché.
vi.hoisted(() => {
  process.env.SHOW_DEMO_CONTENT = "true";
});
vi.mock("next/cache", () => ({
  unstable_cache: (fn: unknown) => fn,
  revalidateTag: vi.fn(),
}));

import { client, db } from "@/db";
import { clients, faqs, media, plans, posts, projects, services, siteSettings, testimonials } from "@/db/schema";
import { getClients, getFaqs, getPlans, getPost, getPosts, getProject, getProjects, getProjectsByService, getService, getServices, getSettings, getTestimonials, readSettingsGroup, settingsSchema } from "./content";
import { serializeJsonLd } from "./seo";

// Prefijo propio para no chocar con otros datos de la base de tests.
const p = `t${randomUUID().slice(0, 8)}`;
const past = new Date(Date.now() - 60_000);
const future = new Date(Date.now() + 3_600_000);
const mine = <T extends { slug: string }>(rows: T[]) => rows.filter((r) => r.slug.startsWith(p)).map((r) => r.slug);

beforeAll(async () => {
  await db.insert(services).values([
    { slug: `${p}-publicado`, name: "Publicado", status: "published" },
    { slug: `${p}-pasado`, name: "Fecha cumplida", status: "published", publishedAt: past },
    { slug: `${p}-programado`, name: "Programado", status: "published", publishedAt: future },
    { slug: `${p}-borrador`, name: "Borrador", status: "draft" },
    { slug: `${p}-archivado`, name: "Archivado", status: "archived" },
  ]);
  const [logo] = await db
    .insert(media)
    .values({ key: `${p}/logo.webp`, filename: "logo.webp", mime: "image/webp", size: 10, width: 80, height: 40, alt: "Logo" })
    .returning();
  const [authorized, unauthorized] = await db
    .insert(clients)
    .values([
      { slug: `${p}-autorizado`, name: `${p} Autorizado`, status: "published", authorized: true, logoMediaId: logo.id },
      { slug: `${p}-sin-permiso`, name: `${p} Sin Permiso`, status: "published", authorized: false },
    ])
    .returning();
  const [visible] = await db
    .insert(projects)
    .values([
      { slug: `${p}-con-cliente`, title: "Con cliente", status: "published", clientId: authorized.id, clientPublic: true, featured: true },
      { slug: `${p}-anonimo`, title: "Plataforma industrial de trazabilidad", status: "published", clientId: authorized.id, clientPublic: false },
      { slug: `${p}-sin-permiso`, title: "Cliente sin permiso", status: "published", clientId: unauthorized.id, clientPublic: true },
      { slug: `${p}-demo`, title: "Demo", status: "draft", isDemo: true },
      { slug: `${p}-borrador`, title: "Borrador real", status: "draft" },
    ])
    .returning();
  await db.insert(testimonials).values([
    { quote: `${p} sí`, authorName: "A", status: "published", authorized: true, clientId: unauthorized.id, projectId: visible.id },
    { quote: `${p} no`, authorName: "B", status: "published", authorized: false },
  ]);
  await db.insert(plans).values([
    { slug: `${p}-desde`, category: "web", name: "Desde", priceAmount: "85", priceMode: "from", status: "published" },
    { slug: `${p}-oculto`, category: "systems", name: "Oculto", priceAmount: "900", priceMode: "hidden", status: "published" },
    { slug: `${p}-inactivo`, category: "web", name: "Inactivo", priceAmount: "1", status: "archived" },
  ]);
  await db.insert(faqs).values([
    { question: `${p} home`, status: "published", showOnHome: true },
    { question: `${p} solo faq`, status: "published" },
  ]);
  await db.insert(posts).values([
    { slug: `${p}-post`, title: "Post", content: "Cuerpo", status: "published", publishedAt: past },
    { slug: `${p}-post-futuro`, title: "Futuro", status: "published", publishedAt: future },
  ]);
});

afterAll(async () => {
  await db.delete(testimonials).where(like(testimonials.quote, `${p}%`));
  await db.delete(projects).where(like(projects.slug, `${p}%`));
  await db.delete(clients).where(like(clients.slug, `${p}%`));
  await db.delete(media).where(like(media.key, `${p}%`));
  for (const t of [services, plans, posts]) await db.delete(t).where(like(t.slug, `${p}%`));
  await db.delete(faqs).where(like(faqs.question, `${p}%`));
  await db.delete(siteSettings).where(inArray(siteSettings.key, [`${p}-x`]));
  await client.end();
});

describe("visibilidad pública", () => {
  it("solo publicados con fecha vacía o cumplida", async () => {
    expect(mine(await getServices()).sort()).toEqual([`${p}-pasado`, `${p}-publicado`]);
    expect(await getService(`${p}-programado`)).toBeNull();
    expect(await getService(`${p}-borrador`)).toBeNull();
    expect((await getService(`${p}-publicado`))?.name).toBe("Publicado");
  });

  it("clientes: solo autorizados, con su logo", async () => {
    const list = (await getClients()).filter((c) => c.slug.startsWith(p));
    expect(list.map((c) => c.slug)).toEqual([`${p}-autorizado`]);
    expect(list[0].logo).toEqual({ url: `/media/${p}/logo.webp`, width: 80, height: 40, alt: "Logo" });
  });

  it("proyectos: el cliente solo aparece si el caso es público y el cliente autorizó", async () => {
    const list = (await getProjects()).filter((x) => x.slug.startsWith(p));
    const byslug = Object.fromEntries(list.map((x) => [x.slug, x]));
    expect(byslug[`${p}-con-cliente`].clientName).toBe(`${p} Autorizado`);
    expect(byslug[`${p}-anonimo`].clientName).toBeNull();
    expect(byslug[`${p}-sin-permiso`].clientName).toBeNull();
    expect(JSON.stringify(await getProject(`${p}-anonimo`))).not.toContain("Autorizado");
  });

  it("proyectos: con SHOW_DEMO_CONTENT sale el borrador demo marcado, no los borradores reales", async () => {
    const list = (await getProjects()).filter((x) => x.slug.startsWith(p));
    expect(list.find((x) => x.slug === `${p}-demo`)?.isDemo).toBe(true);
    expect(list.some((x) => x.slug === `${p}-borrador`)).toBe(false);
    expect(await getProject(`${p}-borrador`)).toBeNull();
    expect((await getProject(`${p}-demo`))?.isDemo).toBe(true);
  });

  it("testimonios: solo autorizados y sin nombrar a un cliente no autorizado", async () => {
    const list = (await getTestimonials()).filter((t) => t.quote.startsWith(p));
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ quote: `${p} sí`, clientName: null, clientSlug: null, projectSlug: `${p}-con-cliente` });
  });

  it("planes: el precio oculto no sale y los inactivos tampoco", async () => {
    const list = (await getPlans()).filter((x) => x.slug.startsWith(p));
    expect(list.map((x) => x.slug).sort()).toEqual([`${p}-desde`, `${p}-oculto`]);
    expect(list.find((x) => x.slug === `${p}-desde`)).toMatchObject({ priceAmount: 85, priceMode: "from", currency: "USD", features: [] });
    expect(list.find((x) => x.slug === `${p}-oculto`)?.priceAmount).toBeNull();
  });

  it("faqs: homeOnly filtra", async () => {
    const all = (await getFaqs()).filter((f) => f.question.startsWith(p));
    const home = (await getFaqs({ homeOnly: true })).filter((f) => f.question.startsWith(p));
    expect(all).toHaveLength(2);
    expect(home.map((f) => f.question)).toEqual([`${p} home`]);
  });

  it("posts: fechas como ISO y programados ocultos", async () => {
    expect(mine(await getPosts())).toEqual([`${p}-post`]);
    const post = await getPost(`${p}-post`);
    expect(post).toMatchObject({ content: "Cuerpo", authorName: "Burrow Labs", publishedAt: past.toISOString() });
    expect(await getPost(`${p}-post-futuro`)).toBeNull();
  });
});

describe("getters por slug", () => {
  it("un slug que no cumple el esquema devuelve null sin consultar la base", async () => {
    const select = vi.spyOn(db, "select");
    for (const bad of ["\u0000", "%00", "../../etc/passwd", "Con-Mayusculas", "con espacio", "a--b", "-a", "x".repeat(81), "' OR 1=1 --", "", undefined, null, 42, { slug: "x" }]) {
      expect(await getProject(bad as never), String(bad)).toBeNull();
      expect(await getService(bad as never), String(bad)).toBeNull();
      expect(await getPost(bad as never), String(bad)).toBeNull();
      expect(await getProjectsByService(bad as never), String(bad)).toEqual([]);
    }
    expect(select).not.toHaveBeenCalled();
    select.mockRestore();
  });

  it("un slug bien formado pero desconocido devuelve null, y el detalle solo se consulta si está en el listado", async () => {
    expect(await getProject(`${p}-no-existe`)).toBeNull();
    expect(await getService(`${p}-no-existe`)).toBeNull();
    expect(await getPost(`${p}-no-existe`)).toBeNull();
    expect(await getProjectsByService(`${p}-no-existe`)).toEqual([]);
    expect(await getProjectsByService(`${p}-borrador`)).toEqual([]); // el servicio existe pero no es público
    expect(await getProjectsByService(`${p}-publicado`)).toEqual([]); // público, sin proyectos enlazados
  });
});

describe("settings: redes sociales", () => {
  const social = settingsSchema.shape.social;

  it("solo admite https:// (o vacío)", () => {
    expect(social.parse({ instagram: " https://www.instagram.com/burrowlabsbo/ " }).instagram).toBe("https://www.instagram.com/burrowlabsbo/");
    expect(social.parse({}).instagram).toBe("");
    for (const bad of ["http://instagram.com/x", "javascript:alert(1)", "//instagram.com/x", "instagram.com/x", "https://", 'https://a.b/"onmouseover="x', "https://a.b/ x", "data:text/html,x"])
      expect(social.safeParse({ instagram: bad }).success, bad).toBe(false);
  });

  it("al leer, un campo inválido ya guardado se descarta sin perder el resto del grupo", () => {
    expect(readSettingsGroup("social", { instagram: "https://www.instagram.com/burrowlabsbo/", x: "javascript:alert(1)" })).toMatchObject({ instagram: "https://www.instagram.com/burrowlabsbo/", x: "" });
    expect(readSettingsGroup("social", "corrupto")).toMatchObject({ instagram: "" });
    expect(readSettingsGroup("contact", undefined).whatsappEnabled).toBe(false);
  });
});

describe("getSettings", () => {
  it("devuelve defaults seguros y tolera filas corruptas", async () => {
    await db
      .insert(siteSettings)
      .values({ key: `${p}-x`, value: "ignorada" })
      .onConflictDoNothing();
    const settings = await getSettings();
    expect(settings.contact.whatsappTooltip).toBeTypeOf("string");
    expect(settings.seo.siteName).toBeTruthy();
    expect(Array.isArray(settings.sectors)).toBe(true);
    expect(settings.legal).toEqual(expect.objectContaining({ privacy: expect.any(String) }));
    expect(settings).not.toHaveProperty(`${p}-x`);
  });
});

describe("serializeJsonLd", () => {
  it("escapa < para que el contenido no cierre la etiqueta script", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("<");
    expect(JSON.parse(out).name).toBe("</script><script>alert(1)</script>");
  });
});
