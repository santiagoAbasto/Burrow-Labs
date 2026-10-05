import "server-only";
import type { Metadata } from "next";
import { getSeo, getSettings, type Post, type Project, type Service, type Settings } from "./content";
import { env } from "./env";
import { slugSchema } from "./validation";

export const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

/** Imagen para compartir por defecto: 1200×630 sobre el papel del sitio (la genera brand-src/build-assets.mjs). */
const DEFAULT_OG_IMAGE = "/brand/og-logo.png";
/** Logo de la organización para buscadores: el badge oficial de 512×512 que Next sirve desde src/app/icon.png. */
const LOGO = { path: "/icon.png", size: 512 };

/** URL absoluta a partir de una ruta (`/servicios`) o de una URL ya absoluta. */
export function absoluteUrl(pathOrUrl: string): string {
  return /^https?:\/\//.test(pathOrUrl) ? pathOrUrl : `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

/**
 * Busca un slug de URL en una lista ya cacheada (getServices, getProjects, getPosts, getPlans).
 * Los getters por slug guardan una entrada de caché por cada argumento: llamarlos con un slug inventado
 * llenaría la caché de basura. Por eso primero se valida la forma y que exista en la lista.
 */
export function findBySlug<T extends { slug: string }>(items: T[], raw: unknown): T | undefined {
  const slug = slugSchema.safeParse(raw);
  return slug.success ? items.find((item) => item.slug === slug.data) : undefined;
}

/** Título final: si ya nombra al sitio se usa tal cual; si no, se le aplica la plantilla («%s · Burrow Labs»). */
export function composeTitle(title: string, siteName: string, template: string): string {
  if (!title) return siteName;
  return title.toLowerCase().includes(siteName.toLowerCase()) ? title : template.replace("%s", title);
}

export type BuildMetadataInput = {
  /** Título de la página. Si no incluye el nombre del sitio, se le agrega con la plantilla. */
  title?: string;
  description?: string;
  /** Ruta canónica, sin parámetros ni barra final: `/servicios/automatizacion`. */
  path: string;
  /** Ruta o URL de la imagen Open Graph. */
  image?: string | null;
  noindex?: boolean;
  type?: "website" | "article";
};

/**
 * Metadata completa de una página: título, descripción, canonical absoluto, robots, Open Graph y Twitter.
 * Lo editado en el CMS para esa ruta (seo_metadata) pisa lo que pase la página.
 */
export async function buildMetadata(input: BuildMetadataInput): Promise<Metadata> {
  const [{ seo }, override] = await Promise.all([getSettings(), getSeo(input.path)]);
  const title = override?.title || input.title || "";
  const description = override?.description || input.description || seo.description;
  const image = override?.ogImage || input.image || seo.ogImage || DEFAULT_OG_IMAGE;
  const url = absoluteUrl(input.path);
  const images = [
    image === DEFAULT_OG_IMAGE
      ? { url: absoluteUrl(image), width: 1200, height: 630, type: "image/png", alt: `Logo de ${seo.siteName}` }
      : { url: absoluteUrl(image), alt: title || seo.siteName },
  ];

  return {
    metadataBase: new URL(SITE_URL),
    title: { absolute: composeTitle(title, seo.siteName, seo.titleTemplate) },
    description,
    alternates: { canonical: url },
    robots:
      override?.noindex || input.noindex
        ? { index: false, follow: false }
        : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    verification: env.NEXT_PUBLIC_GSC_VERIFICATION ? { google: env.NEXT_PUBLIC_GSC_VERIFICATION } : undefined,
    openGraph: {
      type: input.type ?? "website",
      url,
      siteName: seo.siteName,
      title: title || seo.siteName,
      description,
      locale: seo.locale,
      images,
    },
    twitter: { card: "summary_large_image", title: title || seo.siteName, description, images },
  };
}

/* ───────────────────────────── JSON-LD ─────────────────────────────
   Solo datos reales de settings y del CMS. Sin reviews, ratings, precios ni cifras: si un dato no existe, no se emite.
   Una sola entidad Organization (`/#organization`); el resto la referencia por @id. */

type JsonLd = Record<string, unknown>;

const HOME_URL = absoluteUrl("/");
const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const serviceId = (slug: string) => `${absoluteUrl(`/servicios/${slug}`)}#service`;
const language = (settings: Settings) => settings.seo.locale.replace("_", "-");
/** Quita las claves vacías para no publicar propiedades sin valor. */
const compact = (obj: JsonLd): JsonLd =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && !v.length)));

function organizationFields(settings: Settings): JsonLd {
  const { seo, contact, social } = settings;
  return compact({
    "@id": ORG_ID,
    name: seo.siteName,
    url: HOME_URL,
    logo: { "@type": "ImageObject", "@id": `${SITE_URL}/#logo`, url: absoluteUrl(LOGO.path), width: LOGO.size, height: LOGO.size },
    image: absoluteUrl(seo.ogImage || DEFAULT_OG_IMAGE),
    description: seo.description,
    email: contact.email,
    // Sin dirección postal inventada: el país siempre; ciudad y región solo si se cargan en Admin → Configuración → SEO.
    address: seo.country
      ? compact({ "@type": "PostalAddress", addressLocality: seo.city, addressRegion: seo.region, addressCountry: seo.country })
      : undefined,
    // Solo los perfiles cargados en el CMS.
    sameAs: Object.values(social).filter((profile) => /^https?:\/\//.test(profile)),
  });
}

export function organizationJsonLd(settings: Settings): JsonLd {
  return { "@context": "https://schema.org", "@type": "Organization", ...organizationFields(settings) };
}

/** Home: la misma entidad (mismo @id) descrita como estudio de servicios profesionales. */
export function professionalServiceJsonLd(settings: Settings): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    ...organizationFields(settings),
    ...compact({ areaServed: settings.seo.country }),
  };
}

export function webSiteJsonLd(settings: Settings): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: HOME_URL,
    name: settings.seo.siteName,
    description: settings.seo.description,
    inLanguage: language(settings),
    publisher: { "@id": ORG_ID },
  };
}

/** Migas: de la raíz a la página actual. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function serviceJsonLd(service: Pick<Service, "slug" | "name" | "tagline" | "seoDescription">, settings: Settings): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": serviceId(service.slug),
    ...compact({
      name: service.name,
      description: service.seoDescription || service.tagline,
      url: absoluteUrl(`/servicios/${service.slug}`),
      serviceType: service.name,
      areaServed: settings.seo.country,
    }),
    provider: { "@id": ORG_ID },
  };
}

export function articleJsonLd(
  post: Pick<Post, "slug" | "title" | "excerpt" | "authorName" | "publishedAt" | "updatedAt" | "cover" | "seoDescription">,
  settings: Settings,
): JsonLd {
  const url = absoluteUrl(`/lab/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    ...compact({
      headline: post.title,
      description: post.seoDescription || post.excerpt,
      url,
      image: post.cover ? absoluteUrl(post.cover.url) : undefined,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      inLanguage: language(settings),
    }),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    isPartOf: { "@id": WEBSITE_ID },
    // Firmado por el estudio = la organización; cualquier otra firma es una persona.
    author: post.authorName && post.authorName !== settings.seo.siteName ? { "@type": "Person", name: post.authorName } : { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
}

/** Caso de estudio: un artículo del estudio sobre un trabajo propio. Nunca SoftwareApplication, reviews, ratings ni precios. */
export function caseStudyJsonLd(
  project: Pick<Project, "slug" | "title" | "summary" | "seoDescription" | "cover" | "publishedAt" | "updatedAt" | "services">,
  settings: Settings,
): JsonLd {
  const url = absoluteUrl(`/proyectos/${project.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    ...compact({
      headline: project.title,
      description: project.seoDescription || project.summary,
      url,
      image: project.cover ? absoluteUrl(project.cover.url) : undefined,
      datePublished: project.publishedAt,
      dateModified: project.updatedAt,
      inLanguage: language(settings),
      articleSection: "Caso de estudio",
      about: project.services.map((service) => ({
        "@type": "Service",
        "@id": serviceId(service.slug),
        name: service.name,
        url: absoluteUrl(`/servicios/${service.slug}`),
      })),
    }),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    isPartOf: { "@id": WEBSITE_ID },
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
}

/** Serializa para `<script type="application/ld+json">`: escapa `<` para que el contenido no pueda cerrar la etiqueta. */
export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
