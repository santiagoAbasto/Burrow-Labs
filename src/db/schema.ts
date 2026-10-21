// Esquema de datos. Las claves van en camelCase y Drizzle las convierte a snake_case
// (`casing: "snake_case"` en src/db/index.ts y drizzle.config.ts: deben coincidir).
import {
  bigserial,
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const contentStatus = pgEnum("content_status", ["draft", "published", "archived"]);
export const planCategory = pgEnum("plan_category", ["web", "systems"]);
export const priceMode = pgEnum("price_mode", ["from", "fixed", "quote", "hidden"]);
export const leadType = pgEnum("lead_type", ["contact", "diagnostic"]);
export const leadStatus = pgEnum("lead_status", ["new", "contacted", "won", "lost", "spam"]);
export const subscriberStatus = pgEnum("subscriber_status", ["active", "unsubscribed"]);
export const campaignStatus = pgEnum("campaign_status", ["draft", "sending", "sent"]);
export const projectSheetStatus = pgEnum("project_sheet_status", ["new", "in_progress", "paused", "delivered"]);

const id = () => uuid().primaryKey().defaultRandom();
const ts = () => timestamp({ withTimezone: true });
const timestamps = {
  createdAt: ts().notNull().defaultNow(),
  updatedAt: ts()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};
// Estado editorial + publicación programada (published_at en el futuro = todavía no visible).
const publishing = {
  status: contentStatus().notNull().default("draft"),
  publishedAt: ts(),
};
const seo = {
  seoTitle: text(),
  seoDescription: text(),
  ogImage: text(),
};

export const users = pgTable("users", {
  id: id(),
  email: text().notNull().unique(),
  passwordHash: text().notNull(),
  name: text().notNull().default(""),
  createdAt: ts().notNull().defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: id(),
    tokenHash: text().notNull().unique(), // sha256 del token; el token en claro solo vive en la cookie
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: ts().notNull(),
    createdAt: ts().notNull().defaultNow(),
  },
  (t) => [index("sessions_expires_at_idx").on(t.expiresAt)],
);

// Recuperación de contraseña: el enlace que llega por correo. Mismo patrón que las sesiones —solo se
// guarda el sha256, el token en claro vive únicamente en el correo— y se usa una sola vez: `usedAt`
// se marca en el mismo UPDATE que lo valida, así dos envíos simultáneos no pueden cambiarla dos veces.
export const passwordResets = pgTable(
  "password_resets",
  {
    id: id(),
    tokenHash: text().notNull().unique(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: ts().notNull(),
    usedAt: ts(),
    createdAt: ts().notNull().defaultNow(),
  },
  (t) => [index("password_resets_expires_at_idx").on(t.expiresAt)],
);

export const siteSettings = pgTable("site_settings", {
  key: text().primaryKey(),
  value: jsonb().notNull(),
  updatedAt: timestamps.updatedAt,
});

export const homeSections = pgTable("home_sections", {
  key: text().primaryKey(),
  enabled: boolean().notNull().default(true),
  sort: integer().notNull().default(0),
  content: jsonb().notNull().default({}),
  updatedAt: timestamps.updatedAt,
});

export const media = pgTable("media", {
  id: id(),
  key: text().notNull().unique(), // clave en el storage
  filename: text().notNull(),
  mime: text().notNull(),
  size: integer().notNull(),
  width: integer(),
  height: integer(),
  alt: text().notNull().default(""),
  createdAt: ts().notNull().defaultNow(),
});

export const services = pgTable("services", {
  id: id(),
  slug: text().notNull().unique(),
  name: text().notNull(),
  tagline: text().notNull().default(""),
  problem: text().notNull().default(""), // md
  solution: text().notNull().default(""), // md
  examples: text().array().notNull().default([]),
  technologies: text().array().notNull().default([]),
  icon: text().notNull().default(""), // clave de icono, no SVG
  ctaLabel: text().notNull().default(""),
  sort: integer().notNull().default(0),
  ...publishing,
  ...seo,
  ...timestamps,
});

export const projectCategories = pgTable("project_categories", {
  id: id(),
  slug: text().notNull().unique(),
  name: text().notNull(),
  sort: integer().notNull().default(0),
});

export const clients = pgTable("clients", {
  id: id(),
  slug: text().notNull().unique(),
  name: text().notNull(),
  logoMediaId: uuid().references(() => media.id, { onDelete: "set null" }),
  sector: text().notNull().default(""),
  website: text(),
  authorized: boolean().notNull().default(false), // solo authorized=true sale al público
  sort: integer().notNull().default(0),
  ...publishing,
  ...timestamps,
});

export const projects = pgTable(
  "projects",
  {
    id: id(),
    slug: text().notNull().unique(),
    title: text().notNull(),
    summary: text().notNull().default(""),
    clientId: uuid().references(() => clients.id, { onDelete: "set null" }),
    clientPublic: boolean().notNull().default(false), // false = caso anonimizado
    categoryId: uuid().references(() => projectCategories.id, { onDelete: "set null" }),
    problem: text().notNull().default(""), // md (igual que los cinco siguientes)
    context: text().notNull().default(""),
    solution: text().notNull().default(""),
    challenge: text().notNull().default(""),
    architecture: text().notNull().default(""),
    result: text().notNull().default(""),
    features: text().array().notNull().default([]),
    stack: text().array().notNull().default([]),
    // Solo métricas demostradas. Nunca inventadas.
    resultsMetrics: jsonb().$type<{ label: string; value: string }[]>().notNull().default([]),
    // Secciones propias del caso después de «Arquitectura»: Markdown donde cada `## Título` abre una sección.
    sections: text().notNull().default(""),
    // Etiqueta de estado («Producto propio», «Caso confidencial»…). Vacía = sin etiqueta.
    badge: text().notNull().default(""),
    // Contexto de industria sin revelar al cliente («Empresa industrial», «Sector inmobiliario»). Nunca inventado.
    sector: text().notNull().default(""),
    // Esquema que ilustra el caso cuando no hay portada: clave de `PROJECT_VISUALS`.
    visual: text().notNull().default(""),
    // Cierre propio del caso; vacíos = CTA general del sitio.
    ctaTitle: text().notNull().default(""),
    ctaLead: text().notNull().default(""),
    coverMediaId: uuid().references(() => media.id, { onDelete: "set null" }),
    year: integer(),
    featured: boolean().notNull().default(false),
    isDemo: boolean().notNull().default(false),
    sort: integer().notNull().default(0),
    ...publishing,
    ...seo,
    ...timestamps,
  },
  (t) => [index("projects_status_sort_idx").on(t.status, t.sort)],
);

export const projectMedia = pgTable(
  "project_media",
  {
    projectId: uuid()
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    mediaId: uuid()
      .notNull()
      .references(() => media.id, { onDelete: "cascade" }),
    caption: text().notNull().default(""),
    sort: integer().notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.mediaId] })],
);

export const projectServices = pgTable(
  "project_services",
  {
    projectId: uuid()
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    serviceId: uuid()
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.projectId, t.serviceId] })],
);

export const testimonials = pgTable("testimonials", {
  id: id(),
  quote: text().notNull(),
  authorName: text().notNull(),
  authorRole: text().notNull().default(""),
  clientId: uuid().references(() => clients.id, { onDelete: "set null" }),
  projectId: uuid().references(() => projects.id, { onDelete: "set null" }),
  authorized: boolean().notNull().default(false),
  sort: integer().notNull().default(0),
  ...publishing,
  ...timestamps,
});

export const plans = pgTable("plans", {
  id: id(),
  slug: text().notNull().unique(),
  category: planCategory().notNull(),
  name: text().notNull(),
  tagline: text().notNull().default(""),
  priceAmount: numeric({ precision: 12, scale: 2 }),
  currency: text().notNull().default("USD"),
  priceMode: priceMode().notNull().default("from"),
  deliveryTime: text().notNull().default(""),
  featured: boolean().notNull().default(false),
  ctaLabel: text().notNull().default(""),
  sort: integer().notNull().default(0),
  ...publishing,
  ...timestamps,
});

export const planFeatures = pgTable(
  "plan_features",
  {
    id: id(),
    planId: uuid()
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    text: text().notNull(),
    sort: integer().notNull().default(0),
  },
  (t) => [index("plan_features_plan_idx").on(t.planId, t.sort)],
);

export const faqs = pgTable("faqs", {
  id: id(),
  question: text().notNull(),
  answer: text().notNull().default(""), // md
  category: text().notNull().default(""),
  showOnHome: boolean().notNull().default(false),
  sort: integer().notNull().default(0),
  ...publishing,
  ...timestamps,
});

export const postCategories = pgTable("post_categories", {
  id: id(),
  slug: text().notNull().unique(),
  name: text().notNull(),
  sort: integer().notNull().default(0),
});

export const posts = pgTable(
  "posts",
  {
    id: id(),
    slug: text().notNull().unique(),
    title: text().notNull(),
    excerpt: text().notNull().default(""),
    content: text().notNull().default(""), // md
    coverMediaId: uuid().references(() => media.id, { onDelete: "set null" }),
    categoryId: uuid().references(() => postCategories.id, { onDelete: "set null" }),
    authorName: text().notNull().default("Burrow Labs"),
    readingMinutes: integer().notNull().default(1),
    ...publishing,
    ...seo,
    ...timestamps,
  },
  (t) => [index("posts_status_published_idx").on(t.status, t.publishedAt)],
);

export const leads = pgTable(
  "leads",
  {
    id: id(),
    type: leadType().notNull(),
    name: text().notNull(),
    company: text(),
    email: text().notNull(),
    whatsapp: text(),
    projectType: text(),
    budget: text(),
    timeline: text(),
    message: text(),
    payload: jsonb().notNull().default({}), // respuestas del diagnóstico u otros campos
    sourcePath: text(),
    consent: boolean().notNull(), // solo se insertan leads con consent=true
    consentAt: ts().notNull().defaultNow(),
    status: leadStatus().notNull().default("new"),
    notes: text().notNull().default(""),
    ...timestamps,
  },
  (t) => [index("leads_status_created_idx").on(t.status, t.createdAt)],
);

// Newsletter: una fila por email (en minúsculas). La baja no borra: deja status=unsubscribed para no volver a escribirle.
export const subscribers = pgTable(
  "subscribers",
  {
    id: id(),
    email: text().notNull().unique(),
    status: subscriberStatus().notNull().default("active"),
    sourcePath: text(), // ruta desde la que se suscribió
    consentAt: ts().notNull().defaultNow(),
    token: text().notNull().unique(), // enlace de baja (randomBytes(24) base64url); nunca se muestra en el panel
    ...timestamps,
  },
  (t) => [index("subscribers_status_created_idx").on(t.status, t.createdAt)],
);

// Campañas: un correo en Markdown enviado a todos los suscriptores activos. Las cifras se fijan al enviar.
export const campaigns = pgTable(
  "campaigns",
  {
    id: id(),
    subject: text().notNull(),
    body: text().notNull().default(""), // md
    status: campaignStatus().notNull().default("draft"),
    recipients: integer().notNull().default(0),
    sent: integer().notNull().default(0),
    failed: integer().notNull().default(0),
    sentAt: ts(),
    createdBy: text().notNull().default(""), // nombre del admin
    ...timestamps,
  },
  (t) => [index("campaigns_created_idx").on(t.createdAt)],
);

// Bitácora del panel: quién cambió qué. Solo acciones del admin, nunca datos de visitantes.
export const activityLog = pgTable(
  "activity_log",
  {
    id: id(),
    userId: uuid().references(() => users.id, { onDelete: "set null" }),
    userName: text().notNull().default(""),
    action: text().notNull(), // create | update | delete | login | upload | settings | send | export
    entity: text().notNull(), // recurso (servicios, planes, leads, media, home, settings, users…)
    entityId: text(),
    title: text().notNull().default(""),
    createdAt: ts().notNull().defaultNow(),
  },
  (t) => [index("activity_log_created_idx").on(t.createdAt)],
);

export const seoMetadata = pgTable("seo_metadata", {
  path: text().primaryKey(),
  title: text(),
  description: text(),
  ogImage: text(),
  noindex: boolean().notNull().default(false),
  updatedAt: timestamps.updatedAt,
});

// Eventos first-party anónimos: sin IP ni user agent en claro, sin cookies. Solo atributos coarse
// derivados en el servidor y un hash de visitante que rota cada día (no sigue a nadie entre días).
export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: bigserial({ mode: "number" }).primaryKey(),
    name: text().notNull(),
    path: text().notNull(),
    meta: jsonb().notNull().default({}),
    visitor: text(), // hmac(día La Paz | ip | ua) recortado a 16 hex; cambia cada día
    country: text(), // ISO-3166 alfa-2 que informa el proxy (Vercel, Cloudflare, CloudFront)
    device: text({ enum: ["desktop", "mobile", "tablet"] }),
    browser: text({ enum: ["chrome", "safari", "firefox", "edge", "opera", "samsung", "other"] }),
    referrer: text(), // solo el host de document.referrer; nunca el propio sitio
    lang: text(), // dos letras del primer idioma de Accept-Language
    bot: boolean().notNull().default(false),
    createdAt: ts().notNull().defaultNow(),
  },
  (t) => [index("analytics_events_name_created_idx").on(t.name, t.createdAt), index("analytics_events_bot_created_idx").on(t.bot, t.createdAt)],
);

export const rateLimits = pgTable("rate_limits", {
  key: text().primaryKey(), // ámbito + hash del cliente; nunca la IP en claro
  count: integer().notNull(),
  windowStart: ts().notNull(),
});

// Fichas de proyecto: relevamiento interno (datos, técnica, requerimientos, peticiones del cliente).
// El contenido completo vive en `data` (jsonb); las columnas sueltas son solo para listar y buscar.
// `token` abre el enlace público de solo lectura (/ficha/<token>), sin sesión.
export const projectSheets = pgTable(
  "project_sheets",
  {
    id: id(),
    code: text().notNull().default(""),
    token: text().notNull().unique(), // randomBytes(18) base64url; nunca se adivina
    empresa: text().notNull().default(""),
    status: projectSheetStatus().notNull().default("new"),
    priority: text().notNull().default("Media"),
    data: jsonb().notNull().default({}),
    createdBy: text().notNull().default(""), // nombre del admin que la creó
    ...timestamps,
  },
  (t) => [index("project_sheets_status_updated_idx").on(t.status, t.updatedAt)],
);
