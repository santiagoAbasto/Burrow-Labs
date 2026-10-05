import { describe, expect, it } from "vitest";
import { settingsSchema, type Settings } from "./content";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  caseStudyJsonLd,
  composeTitle,
  findBySlug,
  organizationJsonLd,
  professionalServiceJsonLd,
  serializeJsonLd,
  serviceJsonLd,
  SITE_URL,
  webSiteJsonLd,
} from "./seo";

const base = settingsSchema.parse({}) as Settings;
const settings: Settings = { ...base, social: { ...base.social, instagram: "https://www.instagram.com/burrowlabsbo/", x: "sin-url" } };
const ORG = { "@id": `${SITE_URL}/#organization` };

describe("composeTitle", () => {
  const template = "%s · Burrow Labs";
  it("aplica la plantilla cuando el título no nombra al sitio", () => {
    expect(composeTitle("Planes y precios base", "Burrow Labs", template)).toBe("Planes y precios base · Burrow Labs");
  });
  it("usa el título tal cual cuando ya nombra al sitio", () => {
    expect(composeTitle("Burrow Labs | Software a medida, automatización e IA", "Burrow Labs", template)).toBe("Burrow Labs | Software a medida, automatización e IA");
    expect(composeTitle("Sobre burrow labs", "Burrow Labs", template)).toBe("Sobre burrow labs");
  });
  it("sin título devuelve el nombre del sitio", () => {
    expect(composeTitle("", "Burrow Labs", template)).toBe("Burrow Labs");
  });
});

describe("findBySlug", () => {
  const items = [{ slug: "automatizacion" }, { slug: "web-y-ecommerce" }];
  it("encuentra un slug conocido", () => {
    expect(findBySlug(items, "automatizacion")).toBe(items[0]);
  });
  it("descarta lo que no es un slug o no está en la lista", () => {
    for (const raw of ["no-existe", "Automatizacion", "automatizacion/", "../admin", "a b", "", "a".repeat(200), undefined, ["automatizacion"]]) {
      expect(findBySlug(items, raw)).toBeUndefined();
    }
  });
});

describe("JSON-LD", () => {
  it("Organization: logo absoluto, país sin dirección inventada y solo perfiles con URL", () => {
    const org = organizationJsonLd(settings);
    expect(org).toMatchObject({ "@type": "Organization", ...ORG, name: "Burrow Labs", url: `${SITE_URL}/` });
    expect(org.logo).toMatchObject({ "@type": "ImageObject", url: `${SITE_URL}/icon.png` });
    expect(org.address).toEqual({ "@type": "PostalAddress", addressCountry: "BO" });
    expect(org.sameAs).toEqual(["https://www.instagram.com/burrowlabsbo/"]);
    expect(org).not.toHaveProperty("email");
    expect(org).not.toHaveProperty("telephone");
  });

  it("ProfessionalService y WebSite apuntan a la misma organización", () => {
    expect(professionalServiceJsonLd(settings)).toMatchObject({ "@type": "ProfessionalService", ...ORG, areaServed: "BO" });
    expect(webSiteJsonLd(settings)).toMatchObject({ "@id": `${SITE_URL}/#website`, publisher: ORG, inLanguage: "es-BO" });
  });

  it("Service referencia a la organización como proveedor", () => {
    const service = serviceJsonLd({ slug: "automatizacion", name: "Automatización", tagline: "Menos trabajo manual.", seoDescription: null }, settings);
    expect(service).toMatchObject({ "@id": `${SITE_URL}/servicios/automatizacion#service`, provider: ORG, description: "Menos trabajo manual." });
  });

  it("Article del Lab: autor organización si firma el estudio, persona si no", () => {
    const post = { slug: "nota", title: "Nota", excerpt: "Resumen.", authorName: "Burrow Labs", publishedAt: "2026-09-16T12:00:00.000Z", updatedAt: "2026-10-02T14:44:07.795Z", cover: null, seoDescription: null };
    const article = articleJsonLd(post, settings);
    expect(article).toMatchObject({ "@type": "Article", author: ORG, publisher: ORG, datePublished: post.publishedAt, dateModified: post.updatedAt });
    expect(article).not.toHaveProperty("image");
    expect(articleJsonLd({ ...post, authorName: "Ana Pérez" }, settings).author).toEqual({ "@type": "Person", name: "Ana Pérez" });
  });

  it("caso de estudio: Article sobre los servicios relacionados, sin reviews, ratings ni precios", () => {
    const project = { slug: "crm", title: "CRM", summary: "Resumen.", seoDescription: null, cover: null, publishedAt: null, updatedAt: "2026-10-02T14:44:07.795Z", services: [{ slug: "automatizacion", name: "Automatización" }] };
    const json = caseStudyJsonLd(project, settings);
    expect(json).toMatchObject({ "@type": "Article", author: ORG, publisher: ORG, url: `${SITE_URL}/proyectos/crm` });
    expect(json.about).toEqual([{ "@type": "Service", "@id": `${SITE_URL}/servicios/automatizacion#service`, name: "Automatización", url: `${SITE_URL}/servicios/automatizacion` }]);
    expect(json).not.toHaveProperty("datePublished");
    expect(JSON.stringify(json)).not.toMatch(/Review|Rating|price|SoftwareApplication/i);
  });

  it("BreadcrumbList numera desde 1 con URL absolutas", () => {
    const { itemListElement } = breadcrumbJsonLd([{ name: "Inicio", path: "/" }, { name: "Planes", path: "/planes" }]) as { itemListElement: { position: number; item: string }[] };
    expect(itemListElement.map((item) => [item.position, item.item])).toEqual([[1, `${SITE_URL}/`], [2, `${SITE_URL}/planes`]]);
  });

  it("serializeJsonLd no deja cerrar la etiqueta script", () => {
    expect(serializeJsonLd({ name: "</script><script>alert(1)</script>" })).not.toContain("<");
  });
});
