import "server-only";
import { and, asc, desc, eq, inArray, isNull, lte, or, sql, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { revalidateTag, unstable_cache } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import {
  clients,
  faqs,
  homeSections,
  media,
  planFeatures,
  plans,
  postCategories,
  posts,
  projectCategories,
  projectMedia,
  projects,
  projectServices,
  seoMetadata,
  services,
  siteSettings,
  testimonials,
} from "@/db/schema";
import { env } from "./env";
import { storage } from "./storage";
import { isHttpsUrl, slugSchema } from "./validation";

/* ───────────────────────────── Caché ───────────────────────────── */

export const TAGS = {
  settings: "settings",
  home: "home",
  services: "services",
  projects: "projects", // incluye project_categories, project_media y project_services
  clients: "clients",
  testimonials: "testimonials",
  plans: "plans", // incluye plan_features
  faqs: "faqs",
  posts: "posts", // incluye post_categories
  seo: "seo",
  media: "media",
} as const;
export type ContentTag = (typeof TAGS)[keyof typeof TAGS];

/** Invalida al instante lo cacheado bajo esos tags. Llamar desde las mutaciones del admin. */
export function revalidateContent(...tags: ContentTag[]): void {
  for (const tag of tags) revalidateTag(tag, { expire: 0 });
}

// Se usa `unstable_cache` (modelo de caché sin Cache Components, documentado en
// next/dist/docs/01-app/02-guides/caching-without-cache-components.md): `"use cache"` exige activar
// `cacheComponents` para todo el proyecto. El resultado se serializa a JSON: por eso los tipos
// públicos llevan fechas como string ISO.
// ponytail: revalidate de 300 s para que una publicación programada aparezca sola (hasta 5 min de
// retraso) — bajar el valor o invalidar con un cron si se necesitara puntualidad.
function cached<A extends unknown[], R>(name: string, tags: ContentTag[], fn: (...args: A) => Promise<R>) {
  return unstable_cache(fn, [name, String(env.SHOW_DEMO_CONTENT)], { tags, revalidate: 300 });
}

/* ─────────────────────── Entrada por slug ─────────────────────── */

// Los getters por slug reciben texto de la URL (`/proyectos/<lo que sea>`, `/contacto?servicio=<lo que
// sea>`). Dos filtros antes de tocar la base o la caché: (1) el formato del esquema —un byte nulo o una
// ruta no llegan a PostgreSQL— y (2) que el slug esté en el listado público ya cacheado. Así un slug
// desconocido no cuesta una consulta ni deja una clave nueva en la caché por cada valor inventado.
const isSlug = (value: unknown): value is string => slugSchema.safeParse(value).success;

/* ─────────────────────────── Visibilidad ─────────────────────────── */

/** Público = publicado y con fecha de publicación vacía o ya cumplida. */
function isPublic(t: { status: PgColumn; publishedAt: PgColumn }): SQL {
  return and(eq(t.status, "published"), or(isNull(t.publishedAt), lte(t.publishedAt, sql`now()`)))!;
}

/** Proyectos: además, los borradores demo cuando SHOW_DEMO_CONTENT está activo (nunca en producción). */
function projectVisible(): SQL {
  return env.SHOW_DEMO_CONTENT
    ? or(isPublic(projects), and(eq(projects.isDemo, true), eq(projects.status, "draft")))!
    : isPublic(projects);
}

const iso = (d: Date | null) => d?.toISOString() ?? null;

/* ───────────────────────────── Media ───────────────────────────── */

export type MediaRef = { url: string; width: number | null; height: number | null; alt: string };

async function mediaByIds(ids: (string | null)[]): Promise<Map<string, MediaRef>> {
  const wanted = [...new Set(ids.filter((id): id is string => !!id))];
  if (!wanted.length) return new Map();
  const rows = await db.select().from(media).where(inArray(media.id, wanted));
  return new Map(rows.map((m) => [m.id, { url: storage.publicUrl(m.key), width: m.width, height: m.height, alt: m.alt }]));
}

/* ──────────────────────────── Settings ──────────────────────────── */

const text = (fallback = "") => z.string().default(fallback);
// Perfil de una red: vacío o https://. Nada de http://, javascript: ni direcciones a medias: estas
// URL salen como enlaces en el sitio y en los correos.
const profileUrl = () =>
  z
    .string()
    .trim()
    .refine((url) => url === "" || isHttpsUrl(url), "Las redes van con la dirección completa, empezando por https://.")
    .default("");
// prefault({}): un grupo ausente se resuelve con los defaults de cada campo.
const group = <T extends z.ZodRawShape>(shape: T) => z.object(shape).prefault({} as never);

// Los defaults son copy literal del brief o vacíos. Nada inventado.
export const settingsSchema = z.object({
  contact: group({
    email: text(),
    whatsappPhone: text(), // formato internacional; vacío = el botón lleva a /contacto
    whatsappEnabled: z.boolean().default(false),
    whatsappTooltip: text("¿Cavamos una solución?"),
    whatsappGreeting: text("Hola 👋 ¿Qué problema querés dejar de hacer a mano?"),
    whatsappDefaultMessage: text("Hola Burrow Labs, quiero conversar sobre un proyecto."),
  }),
  social: group({
    instagram: profileUrl(),
    linkedin: profileUrl(),
    github: profileUrl(),
    facebook: profileUrl(),
    tiktok: profileUrl(),
    x: profileUrl(),
  }),
  seo: group({
    siteName: text("Burrow Labs"),
    titleTemplate: text("%s · Burrow Labs"),
    description: text(
      "Construimos software, automatizaciones, integraciones e inteligencia artificial para transformar procesos manuales en sistemas claros, útiles y escalables.",
    ),
    ogImage: text(),
    locale: text("es_BO"),
    city: text(),
    region: text(),
    country: text("BO"),
  }),
  sectors: z.array(z.string()).default([]),
  brandPhrases: z.array(z.string()).default([]),
  plansDisclaimer: text("Precio base. El alcance final se confirma antes de comenzar."),
  about: group({
    headline: text("Pequeños por diseño. Obsesionados con resolver."),
    body: text(), // md
    vision: text(), // md
    values: z.array(z.object({ name: z.string(), description: text() })).default([]),
  }),
  legal: group({ privacy: text(), terms: text(), cookies: text() }), // md
});
export type Settings = z.infer<typeof settingsSchema>;
export type SettingsKey = keyof Settings;

/**
 * Valor de un grupo tal como está guardado → valor válido. Si falta o está corrupto, sus defaults; si
 * solo algunos campos son inválidos (una red guardada sin https:// antes de que se exigiera), se
 * descartan esos campos y el resto del grupo se conserva.
 */
export function readSettingsGroup<K extends SettingsKey>(key: K, stored: unknown): Settings[K] {
  const schema = settingsSchema.shape[key] as unknown as z.ZodType<Settings[K]>;
  let parsed = schema.safeParse(stored);
  if (!parsed.success && typeof stored === "object" && stored !== null && !Array.isArray(stored)) {
    const bad = new Set(parsed.error.issues.map((issue) => String(issue.path[0])));
    parsed = schema.safeParse(Object.fromEntries(Object.entries(stored).filter(([field]) => !bad.has(field))));
  }
  return parsed.success ? parsed.data : schema.parse(undefined);
}

/** Cada clave de site_settings es un grupo (ver readSettingsGroup). */
export const getSettings = cached("settings", [TAGS.settings], async (): Promise<Settings> => {
  const rows = await db.select().from(siteSettings);
  const stored = new Map(rows.map((r) => [r.key, r.value]));
  const keys = Object.keys(settingsSchema.shape) as SettingsKey[];
  return Object.fromEntries(keys.map((key) => [key, readSettingsGroup(key, stored.get(key))])) as Settings;
});

/* ───────────────────────────── Home ───────────────────────────── */

export type HomeSection = { key: string; enabled: boolean; sort: number; content: unknown };

/** Todas las secciones, ordenadas. El Home filtra por `enabled`. */
export const getHomeSections = cached("home-sections", [TAGS.home], async (): Promise<HomeSection[]> => {
  return db
    .select({ key: homeSections.key, enabled: homeSections.enabled, sort: homeSections.sort, content: homeSections.content })
    .from(homeSections)
    .orderBy(asc(homeSections.sort), asc(homeSections.key));
});

/* ──────────────────────────── Servicios ──────────────────────────── */

const serviceColumns = {
  id: services.id,
  slug: services.slug,
  name: services.name,
  tagline: services.tagline,
  problem: services.problem,
  solution: services.solution,
  examples: services.examples,
  technologies: services.technologies,
  icon: services.icon,
  ctaLabel: services.ctaLabel,
  seoTitle: services.seoTitle,
  seoDescription: services.seoDescription,
  ogImage: services.ogImage,
  updatedAt: services.updatedAt,
};
export type Service = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  problem: string;
  solution: string;
  examples: string[];
  technologies: string[];
  icon: string;
  ctaLabel: string;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  updatedAt: string;
};

export const getServices = cached("services", [TAGS.services], async (): Promise<Service[]> => {
  const rows = await db.select(serviceColumns).from(services).where(isPublic(services)).orderBy(asc(services.sort), asc(services.name));
  return rows.map((row) => ({ ...row, updatedAt: row.updatedAt.toISOString() }));
});

/** Sale del listado cacheado: un slug mal formado o desconocido devuelve null sin consultar ni cachear. */
export async function getService(slug: string): Promise<Service | null> {
  if (!isSlug(slug)) return null;
  return (await getServices()).find((service) => service.slug === slug) ?? null;
}

/* ──────────────────────────── Proyectos ──────────────────────────── */

export type Category = { id: string; slug: string; name: string };

export const getProjectCategories = cached("project-categories", [TAGS.projects], async (): Promise<Category[]> => {
  return db
    .select({ id: projectCategories.id, slug: projectCategories.slug, name: projectCategories.name })
    .from(projectCategories)
    .orderBy(asc(projectCategories.sort), asc(projectCategories.name));
});

export type ProjectSummary = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: { slug: string; name: string } | null;
  /** Null cuando el caso es anónimo o el cliente no autorizó aparecer. */
  clientName: string | null;
  cover: MediaRef | null;
  year: number | null;
  featured: boolean;
  /** true = borrador demo (solo visible con SHOW_DEMO_CONTENT): pintar la cinta «DEMO». */
  isDemo: boolean;
  /** Etiqueta de estado («Producto propio», «Caso confidencial»…); vacía = sin etiqueta. */
  badge: string;
  /** Contexto de industria que se puede contar sin nombrar al cliente; vacío = no se muestra. */
  sector: string;
  /** Esquema que ilustra el caso cuando no hay portada (clave de PROJECT_VISUALS); vacío = ninguno. */
  visual: string;
  stack: string[];
  /** Rotulan el esquema en el listado. */
  features: string[];
  resultsMetrics: { label: string; value: string }[];
};

export type Project = ProjectSummary & {
  problem: string;
  context: string;
  solution: string;
  challenge: string;
  architecture: string;
  /** Markdown: cada `## Título` es una sección propia después de «Arquitectura». */
  sections: string;
  result: string;
  ctaTitle: string;
  ctaLead: string;
  gallery: (MediaRef & { caption: string })[];
  services: { slug: string; name: string }[];
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  publishedAt: string | null;
  updatedAt: string;
};

// El nombre del cliente solo sale si el caso lo permite Y el cliente está autorizado y publicado.
const publicClientName = sql<string | null>`CASE WHEN ${projects.clientPublic} AND ${clients.authorized} AND ${isPublic(clients)} THEN ${clients.name} END`;

function projectRows(where: SQL) {
  return db
    .select({ project: projects, categorySlug: projectCategories.slug, categoryName: projectCategories.name, clientName: publicClientName })
    .from(projects)
    .leftJoin(projectCategories, eq(projectCategories.id, projects.categoryId))
    .leftJoin(clients, eq(clients.id, projects.clientId))
    .where(where)
    .orderBy(asc(projects.sort), desc(projects.year), asc(projects.title));
}

type ProjectRow = Awaited<ReturnType<typeof projectRows>>[number];

function toSummary({ project: p, categorySlug, categoryName, clientName }: ProjectRow, covers: Map<string, MediaRef>): ProjectSummary {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    category: categorySlug && categoryName ? { slug: categorySlug, name: categoryName } : null,
    clientName,
    cover: (p.coverMediaId && covers.get(p.coverMediaId)) || null,
    year: p.year,
    featured: p.featured,
    isDemo: p.isDemo,
    badge: p.badge,
    sector: p.sector,
    visual: p.visual,
    stack: p.stack,
    features: p.features,
    resultsMetrics: p.resultsMetrics,
  };
}

/** Proyectos visibles; `category` es el slug de la categoría. */
export const getProjects = cached(
  "projects",
  [TAGS.projects, TAGS.clients, TAGS.media],
  async ({ category }: { category?: string } = {}): Promise<ProjectSummary[]> => {
    const rows = await projectRows(category ? and(projectVisible(), eq(projectCategories.slug, category))! : projectVisible());
    const covers = await mediaByIds(rows.map((r) => r.project.coverMediaId));
    return rows.map((r) => toSummary(r, covers));
  },
);

const projectsByService = cached(
  "projects-by-service",
  [TAGS.projects, TAGS.services, TAGS.clients, TAGS.media],
  async (serviceSlug: string): Promise<ProjectSummary[]> => {
    const linked = db
      .select({ id: projectServices.projectId })
      .from(projectServices)
      .innerJoin(services, eq(services.id, projectServices.serviceId))
      .where(eq(services.slug, serviceSlug));
    const rows = await projectRows(and(projectVisible(), inArray(projects.id, linked))!);
    const covers = await mediaByIds(rows.map((r) => r.project.coverMediaId));
    return rows.map((r) => toSummary(r, covers));
  },
);

/** Proyectos visibles relacionados con un servicio público (por slug del servicio); vacío si el servicio no existe. */
export async function getProjectsByService(serviceSlug: string): Promise<ProjectSummary[]> {
  return (await getService(serviceSlug)) ? projectsByService(serviceSlug) : [];
}

export async function getFeaturedProjects(): Promise<ProjectSummary[]> {
  return (await getProjects()).filter((p) => p.featured);
}

const projectBySlug = cached(
  "project",
  [TAGS.projects, TAGS.clients, TAGS.media, TAGS.services],
  async (slug: string): Promise<Project | null> => {
    const [row] = await projectRows(and(eq(projects.slug, slug), projectVisible())!).limit(1);
    if (!row) return null;
    const p = row.project;
    const [gallery, related] = await Promise.all([
      db
        .select({ mediaId: projectMedia.mediaId, caption: projectMedia.caption })
        .from(projectMedia)
        .where(eq(projectMedia.projectId, p.id))
        .orderBy(asc(projectMedia.sort)),
      db
        .select({ slug: services.slug, name: services.name })
        .from(projectServices)
        .innerJoin(services, eq(services.id, projectServices.serviceId))
        .where(and(eq(projectServices.projectId, p.id), isPublic(services)))
        .orderBy(asc(services.sort)),
    ]);
    const refs = await mediaByIds([p.coverMediaId, ...gallery.map((g) => g.mediaId)]);
    return {
      ...toSummary(row, refs),
      problem: p.problem,
      context: p.context,
      solution: p.solution,
      challenge: p.challenge,
      architecture: p.architecture,
      sections: p.sections,
      result: p.result,
      ctaTitle: p.ctaTitle,
      ctaLead: p.ctaLead,
      gallery: gallery.flatMap((g) => {
        const ref = refs.get(g.mediaId);
        return ref ? [{ ...ref, caption: g.caption }] : [];
      }),
      services: related,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      ogImage: p.ogImage,
      publishedAt: iso(p.publishedAt),
      updatedAt: p.updatedAt.toISOString(),
    };
  },
);

/** Un slug mal formado o que no está en el listado visible devuelve null sin consultar ni cachear. */
export async function getProject(slug: string): Promise<Project | null> {
  if (!isSlug(slug) || !(await getProjects()).some((project) => project.slug === slug)) return null;
  return projectBySlug(slug);
}

/* ───────────────────── Clientes y testimonios ───────────────────── */

export type Client = { id: string; slug: string; name: string; sector: string; website: string | null; logo: MediaRef | null };

/** Solo clientes publicados Y autorizados. */
export const getClients = cached("clients", [TAGS.clients, TAGS.media], async (): Promise<Client[]> => {
  const rows = await db
    .select()
    .from(clients)
    .where(and(isPublic(clients), eq(clients.authorized, true)))
    .orderBy(asc(clients.sort), asc(clients.name));
  const logos = await mediaByIds(rows.map((c) => c.logoMediaId));
  return rows.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    sector: c.sector,
    website: c.website,
    logo: (c.logoMediaId && logos.get(c.logoMediaId)) || null,
  }));
});

export type Testimonial = {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string;
  clientName: string | null;
  clientSlug: string | null;
  projectSlug: string | null;
};

/** Solo testimonios publicados Y autorizados. El cliente y el proyecto se enlazan solo si también son públicos. */
export const getTestimonials = cached(
  "testimonials",
  [TAGS.testimonials, TAGS.clients, TAGS.projects],
  async (): Promise<Testimonial[]> => {
    const clientOk = sql`${clients.authorized} AND ${isPublic(clients)}`;
    return db
      .select({
        id: testimonials.id,
        quote: testimonials.quote,
        authorName: testimonials.authorName,
        authorRole: testimonials.authorRole,
        clientName: sql<string | null>`CASE WHEN ${clientOk} THEN ${clients.name} END`,
        clientSlug: sql<string | null>`CASE WHEN ${clientOk} THEN ${clients.slug} END`,
        projectSlug: sql<string | null>`CASE WHEN ${isPublic(projects)} THEN ${projects.slug} END`,
      })
      .from(testimonials)
      .leftJoin(clients, eq(clients.id, testimonials.clientId))
      .leftJoin(projects, eq(projects.id, testimonials.projectId))
      .where(and(isPublic(testimonials), eq(testimonials.authorized, true)))
      .orderBy(asc(testimonials.sort), asc(testimonials.createdAt));
  },
);

/* ───────────────────────────── Planes ───────────────────────────── */

export type Plan = {
  id: string;
  slug: string;
  category: "web" | "systems";
  name: string;
  tagline: string;
  /** Null si no hay precio o si el modo es `quote` u `hidden`: un precio oculto nunca llega al cliente. */
  priceAmount: number | null;
  currency: string;
  priceMode: "from" | "fixed" | "quote" | "hidden";
  deliveryTime: string;
  featured: boolean;
  ctaLabel: string;
  features: string[];
};

/** Planes visibles con sus beneficios. Agrupar por `category` ("web" | "systems") en la vista. */
export const getPlans = cached("plans", [TAGS.plans], async (): Promise<Plan[]> => {
  const rows = await db.select().from(plans).where(isPublic(plans)).orderBy(asc(plans.category), asc(plans.sort), asc(plans.name));
  if (!rows.length) return [];
  const features = await db
    .select()
    .from(planFeatures)
    .where(
      inArray(
        planFeatures.planId,
        rows.map((p) => p.id),
      ),
    )
    .orderBy(asc(planFeatures.sort));
  return rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    category: p.category,
    name: p.name,
    tagline: p.tagline,
    priceAmount: p.priceAmount !== null && (p.priceMode === "from" || p.priceMode === "fixed") ? Number(p.priceAmount) : null,
    currency: p.currency,
    priceMode: p.priceMode,
    deliveryTime: p.deliveryTime,
    featured: p.featured,
    ctaLabel: p.ctaLabel,
    features: features.filter((f) => f.planId === p.id).map((f) => f.text),
  }));
});

/* ────────────────────────────── FAQ ────────────────────────────── */

export type Faq = { id: string; question: string; answer: string; category: string };

export const getFaqs = cached("faqs", [TAGS.faqs], async ({ homeOnly }: { homeOnly?: boolean } = {}): Promise<Faq[]> => {
  return db
    .select({ id: faqs.id, question: faqs.question, answer: faqs.answer, category: faqs.category })
    .from(faqs)
    .where(homeOnly ? and(isPublic(faqs), eq(faqs.showOnHome, true)) : isPublic(faqs))
    .orderBy(asc(faqs.sort), asc(faqs.createdAt));
});

/* ───────────────────────── Lab (blog) ───────────────────────── */

export const getPostCategories = cached("post-categories", [TAGS.posts], async (): Promise<Category[]> => {
  return db
    .select({ id: postCategories.id, slug: postCategories.slug, name: postCategories.name })
    .from(postCategories)
    .orderBy(asc(postCategories.sort), asc(postCategories.name));
});

export type PostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: { slug: string; name: string } | null;
  cover: MediaRef | null;
  authorName: string;
  readingMinutes: number;
  publishedAt: string | null;
};
export type Post = PostSummary & {
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  updatedAt: string;
};

function postRows(where: SQL) {
  return db
    .select({ post: posts, categorySlug: postCategories.slug, categoryName: postCategories.name })
    .from(posts)
    .leftJoin(postCategories, eq(postCategories.id, posts.categoryId))
    .where(where)
    .orderBy(sql`${posts.publishedAt} DESC NULLS LAST`, desc(posts.createdAt));
}

type PostRow = Awaited<ReturnType<typeof postRows>>[number];

function toPostSummary({ post: p, categorySlug, categoryName }: PostRow, covers: Map<string, MediaRef>): PostSummary {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    category: categorySlug && categoryName ? { slug: categorySlug, name: categoryName } : null,
    cover: (p.coverMediaId && covers.get(p.coverMediaId)) || null,
    authorName: p.authorName,
    readingMinutes: p.readingMinutes,
    publishedAt: iso(p.publishedAt),
  };
}

/** Artículos visibles, del más reciente al más antiguo; `category` es el slug de la categoría. */
export const getPosts = cached(
  "posts",
  [TAGS.posts, TAGS.media],
  async ({ category }: { category?: string } = {}): Promise<PostSummary[]> => {
    const rows = await postRows(category ? and(isPublic(posts), eq(postCategories.slug, category))! : isPublic(posts));
    const covers = await mediaByIds(rows.map((r) => r.post.coverMediaId));
    return rows.map((r) => toPostSummary(r, covers));
  },
);

const postBySlug = cached("post", [TAGS.posts, TAGS.media], async (slug: string): Promise<Post | null> => {
  const [row] = await postRows(and(eq(posts.slug, slug), isPublic(posts))!).limit(1);
  if (!row) return null;
  const p = row.post;
  return {
    ...toPostSummary(row, await mediaByIds([p.coverMediaId])),
    content: p.content,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    ogImage: p.ogImage,
    updatedAt: p.updatedAt.toISOString(),
  };
});

/** Un slug mal formado o que no está en el listado público devuelve null sin consultar ni cachear. */
export async function getPost(slug: string): Promise<Post | null> {
  if (!isSlug(slug) || !(await getPosts()).some((post) => post.slug === slug)) return null;
  return postBySlug(slug);
}

/* ────────────────────────────── SEO ────────────────────────────── */

export type SeoOverride = { title: string | null; description: string | null; ogImage: string | null; noindex: boolean };

/** Metadatos editados a mano para una ruta (`/servicios`, `/planes`…), o null si no hay. */
export const getSeo = cached("seo", [TAGS.seo], async (path: string): Promise<SeoOverride | null> => {
  const [row] = await db
    .select({ title: seoMetadata.title, description: seoMetadata.description, ogImage: seoMetadata.ogImage, noindex: seoMetadata.noindex })
    .from(seoMetadata)
    .where(eq(seoMetadata.path, path))
    .limit(1);
  return row ?? null;
});
