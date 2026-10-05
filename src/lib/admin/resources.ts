import "server-only";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import {
  clients,
  faqs,
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
  testimonials,
} from "@/db/schema";
import { PROJECT_BADGES, PROJECT_VISUALS } from "@/db/seed/projects/types";
import { TAGS, type ContentTag } from "@/lib/content";

// CMS genérico: cada recurso es una entrada de configuración. Agregar una entidad = agregar una entrada.

export type FieldType = "text" | "textarea" | "markdown" | "slug" | "number" | "boolean" | "select" | "list" | "pairs" | "datetime" | "relation" | "multi" | "children";

export type RelationKey = "projectCategories" | "postCategories" | "clients" | "projects" | "services" | "media";

export type AdminField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  hint?: string;
  /** slug: campo del que se deriva si queda vacío. */
  from?: string;
  options?: readonly { value: string; label: string }[];
  /** relation / multi: tabla relacionada. */
  to?: RelationKey;
  /** multi: tabla puente (este recurso ↔ `to`). children: tabla hija con una columna de texto. */
  through?: { table: PgTable; own: string; other: string };
};

export type AdminResource = {
  label: string;
  singular: string;
  table: PgTable;
  /** Columna de clave primaria (por defecto `id`). */
  pk?: string;
  titleField: string;
  columns: { name: string; label: string }[];
  fields: AdminField[];
  tags: ContentTag[];
  /** Ruta pública para el enlace «Ver en el sitio». */
  href?: (row: Record<string, unknown>) => string | null;
  note?: string;
};

const STATUS: AdminField[] = [
  {
    name: "status",
    label: "Estado",
    type: "select",
    required: true,
    options: [
      { value: "draft", label: "Borrador" },
      { value: "published", label: "Publicado" },
      { value: "archived", label: "Archivado" },
    ],
  },
  { name: "publishedAt", label: "Fecha de publicación", type: "datetime", hint: "Una fecha futura programa la publicación. Vacío = se publica al guardar como «Publicado»." },
];
const SEO: AdminField[] = [
  { name: "seoTitle", label: "SEO: título", type: "text", hint: "Vacío = usa el título." },
  { name: "seoDescription", label: "SEO: descripción", type: "textarea" },
  { name: "ogImage", label: "SEO: imagen para compartir (ruta o URL)", type: "text" },
];
const SORT: AdminField = { name: "sort", label: "Orden", type: "number", hint: "Menor = aparece primero." };
const slug = (from: string): AdminField => ({ name: "slug", label: "Slug (URL)", type: "slug", from, hint: "Vacío = se genera solo." });

export const RESOURCES = {
  servicios: {
    label: "Servicios",
    singular: "servicio",
    table: services,
    titleField: "name",
    columns: [
      { name: "name", label: "Nombre" },
      { name: "status", label: "Estado" },
      { name: "sort", label: "Orden" },
    ],
    tags: [TAGS.services],
    href: (row) => `/servicios/${row.slug}`,
    fields: [
      { name: "name", label: "Nombre", type: "text", required: true },
      slug("name"),
      { name: "tagline", label: "Frase", type: "text" },
      {
        name: "icon",
        label: "Icono",
        type: "select",
        options: ["code", "workflow", "sparkles", "plug", "globe", "building"].map((value) => ({ value, label: value })),
      },
      { name: "problem", label: "El problema", type: "markdown" },
      { name: "solution", label: "Cómo lo resolvemos", type: "markdown" },
      { name: "examples", label: "Ejemplos", type: "list", hint: "Uno por línea." },
      { name: "technologies", label: "Tecnologías", type: "list", hint: "Una por línea. Solo las que realmente se usan." },
      { name: "ctaLabel", label: "Texto del botón", type: "text" },
      SORT,
      ...STATUS,
      ...SEO,
    ],
  },
  proyectos: {
    label: "Proyectos",
    singular: "proyecto",
    table: projects,
    titleField: "title",
    columns: [
      { name: "title", label: "Título" },
      { name: "status", label: "Estado" },
      { name: "featured", label: "Destacado" },
      { name: "isDemo", label: "Demo" },
    ],
    tags: [TAGS.projects],
    href: (row) => `/proyectos/${row.slug}`,
    note: "Solo se publican casos reales y autorizados. Si el cliente no autorizó su nombre, dejá «Mostrar el nombre del cliente» apagado y usá un título anonimizado.",
    fields: [
      { name: "title", label: "Título", type: "text", required: true, hint: "Si el caso es anónimo: «Plataforma industrial de trazabilidad»." },
      slug("title"),
      { name: "summary", label: "Resumen", type: "textarea" },
      { name: "categoryId", label: "Categoría", type: "relation", to: "projectCategories" },
      { name: "clientId", label: "Cliente", type: "relation", to: "clients" },
      { name: "clientPublic", label: "Mostrar el nombre del cliente (requiere su autorización)", type: "boolean" },
      { name: "year", label: "Año", type: "number" },
      { name: "featured", label: "Destacado en el Home", type: "boolean" },
      { name: "isDemo", label: "Es contenido demo (nunca se publica)", type: "boolean" },
      { name: "coverMediaId", label: "Portada", type: "relation", to: "media" },
      { name: "problem", label: "Problema", type: "markdown" },
      { name: "context", label: "Contexto", type: "markdown" },
      { name: "solution", label: "Solución", type: "markdown" },
      { name: "challenge", label: "Desafío", type: "markdown" },
      { name: "architecture", label: "Arquitectura", type: "markdown" },
      { name: "features", label: "Funcionalidades", type: "list", hint: "Una por línea." },
      { name: "stack", label: "Stack", type: "list", hint: "Una tecnología por línea." },
      { name: "result", label: "Resultado", type: "markdown" },
      { name: "resultsMetrics", label: "Métricas del resultado", type: "pairs", hint: "Una por línea: «etiqueta | valor». Solo métricas demostradas; si no hay, dejar vacío." },
      { name: "sections", label: "Secciones propias", type: "markdown", hint: "Van después de «Arquitectura». Cada «## Título» abre una sección numerada en el índice del caso." },
      {
        name: "badge",
        label: "Etiqueta",
        type: "select",
        options: [{ value: "", label: "Sin etiqueta" }, ...PROJECT_BADGES.map((value) => ({ value, label: value }))],
        hint: "Solo si aporta: «Caso confidencial» cuando el cliente no se nombra, «Producto propio» para lo nuestro.",
      },
      { name: "sector", label: "Sector o contexto", type: "text", hint: "Lo que sí se puede contar sin nombrar al cliente: «Empresa industrial», «Sector inmobiliario». Nunca inventado." },
      {
        name: "visual",
        label: "Esquema",
        type: "select",
        options: [{ value: "", label: "Ninguno" }, ...PROJECT_VISUALS.map((value) => ({ value, label: value }))],
        hint: "Ilustra el caso cuando no hay portada: capas, flujo, nodos o grilla, dibujados con las funcionalidades.",
      },
      { name: "ctaTitle", label: "Cierre: frase", type: "text", hint: "Vacío = cierre general del sitio." },
      { name: "ctaLead", label: "Cierre: bajada", type: "textarea" },
      { name: "services", label: "Servicios relacionados", type: "multi", to: "services", through: { table: projectServices, own: "projectId", other: "serviceId" } },
      {
        name: "gallery",
        label: "Galería (capturas reales)",
        type: "multi",
        to: "media",
        through: { table: projectMedia, own: "projectId", other: "mediaId" },
        hint: "Solo capturas propias y seguras (sin datos personales, precios internos, IMEI ni credenciales). Orden sugerido: tienda o sitio público, ficha de producto, panel, inventario, ventas o pedidos, servicio técnico, reportes. Sin portada ni galería el caso muestra su esquema.",
      },
      SORT,
      ...STATUS,
      ...SEO,
    ],
  },
  "categorias-de-proyectos": {
    label: "Categorías de proyectos",
    singular: "categoría",
    table: projectCategories,
    titleField: "name",
    columns: [
      { name: "name", label: "Nombre" },
      { name: "sort", label: "Orden" },
    ],
    tags: [TAGS.projects],
    fields: [{ name: "name", label: "Nombre", type: "text", required: true }, slug("name"), SORT],
  },
  clientes: {
    label: "Clientes",
    singular: "cliente",
    table: clients,
    titleField: "name",
    columns: [
      { name: "name", label: "Nombre" },
      { name: "sector", label: "Sector" },
      { name: "authorized", label: "Autorizado" },
      { name: "status", label: "Estado" },
    ],
    tags: [TAGS.clients, TAGS.projects],
    note: "Un cliente solo aparece en el sitio si está publicado Y marcado como autorizado.",
    fields: [
      { name: "name", label: "Nombre", type: "text", required: true },
      slug("name"),
      { name: "sector", label: "Sector", type: "text" },
      { name: "website", label: "Sitio web", type: "text" },
      { name: "logoMediaId", label: "Logo", type: "relation", to: "media" },
      { name: "authorized", label: "El cliente autorizó aparecer públicamente", type: "boolean" },
      SORT,
      ...STATUS,
    ],
  },
  testimonios: {
    label: "Testimonios",
    singular: "testimonio",
    table: testimonials,
    titleField: "authorName",
    columns: [
      { name: "authorName", label: "Autor" },
      { name: "authorized", label: "Autorizado" },
      { name: "status", label: "Estado" },
    ],
    tags: [TAGS.testimonials],
    note: "Solo testimonios reales y autorizados por escrito.",
    fields: [
      { name: "quote", label: "Testimonio", type: "textarea", required: true },
      { name: "authorName", label: "Autor", type: "text", required: true },
      { name: "authorRole", label: "Cargo", type: "text" },
      { name: "clientId", label: "Cliente", type: "relation", to: "clients" },
      { name: "projectId", label: "Proyecto", type: "relation", to: "projects" },
      { name: "authorized", label: "El autor autorizó publicarlo", type: "boolean" },
      SORT,
      ...STATUS,
    ],
  },
  planes: {
    label: "Planes",
    singular: "plan",
    table: plans,
    titleField: "name",
    columns: [
      { name: "name", label: "Nombre" },
      { name: "category", label: "Categoría" },
      { name: "priceAmount", label: "Precio" },
      { name: "status", label: "Estado" },
    ],
    tags: [TAGS.plans],
    href: () => "/planes",
    fields: [
      { name: "name", label: "Nombre", type: "text", required: true },
      slug("name"),
      {
        name: "category",
        label: "Categoría",
        type: "select",
        required: true,
        options: [
          { value: "web", label: "Planes web" },
          { value: "systems", label: "Automatización y sistemas" },
        ],
      },
      { name: "tagline", label: "Frase", type: "text" },
      { name: "priceAmount", label: "Precio", type: "number" },
      { name: "currency", label: "Moneda", type: "text", hint: "USD, BOB…" },
      {
        name: "priceMode",
        label: "Cómo se muestra el precio",
        type: "select",
        required: true,
        options: [
          { value: "from", label: "«desde» + precio" },
          { value: "fixed", label: "Precio fijo" },
          { value: "quote", label: "«A cotizar» (sin número)" },
          { value: "hidden", label: "Oculto" },
        ],
      },
      { name: "deliveryTime", label: "Plazo estimado", type: "text" },
      { name: "featured", label: "Plan destacado", type: "boolean" },
      { name: "ctaLabel", label: "Texto del botón", type: "text" },
      { name: "features", label: "Beneficios", type: "children", hint: "Uno por línea.", through: { table: planFeatures, own: "planId", other: "text" } },
      SORT,
      ...STATUS,
    ],
  },
  faq: {
    label: "FAQ",
    singular: "pregunta",
    table: faqs,
    titleField: "question",
    columns: [
      { name: "question", label: "Pregunta" },
      { name: "category", label: "Categoría" },
      { name: "showOnHome", label: "En el Home" },
      { name: "status", label: "Estado" },
    ],
    tags: [TAGS.faqs],
    href: () => "/faq",
    fields: [
      { name: "question", label: "Pregunta", type: "text", required: true },
      { name: "answer", label: "Respuesta", type: "markdown" },
      { name: "category", label: "Categoría", type: "text" },
      { name: "showOnHome", label: "Mostrar en el Home", type: "boolean" },
      SORT,
      ...STATUS,
    ],
  },
  blog: {
    label: "Blog (Burrow Lab)",
    singular: "artículo",
    table: posts,
    titleField: "title",
    columns: [
      { name: "title", label: "Título" },
      { name: "status", label: "Estado" },
      { name: "publishedAt", label: "Publicación" },
    ],
    tags: [TAGS.posts],
    href: (row) => `/lab/${row.slug}`,
    fields: [
      { name: "title", label: "Título", type: "text", required: true },
      slug("title"),
      { name: "excerpt", label: "Bajada", type: "textarea" },
      { name: "content", label: "Contenido", type: "markdown" },
      { name: "categoryId", label: "Categoría", type: "relation", to: "postCategories" },
      { name: "coverMediaId", label: "Portada", type: "relation", to: "media" },
      { name: "authorName", label: "Autor", type: "text" },
      { name: "readingMinutes", label: "Minutos de lectura", type: "number" },
      ...STATUS,
      ...SEO,
    ],
  },
  "categorias-del-blog": {
    label: "Categorías del blog",
    singular: "categoría",
    table: postCategories,
    titleField: "name",
    columns: [
      { name: "name", label: "Nombre" },
      { name: "sort", label: "Orden" },
    ],
    tags: [TAGS.posts],
    fields: [{ name: "name", label: "Nombre", type: "text", required: true }, slug("name"), SORT],
  },
  seo: {
    label: "SEO",
    singular: "ruta",
    table: seoMetadata,
    pk: "path",
    titleField: "path",
    columns: [
      { name: "path", label: "Ruta" },
      { name: "title", label: "Título" },
      { name: "noindex", label: "No indexar" },
    ],
    tags: [TAGS.seo],
    href: (row) => String(row.path),
    note: "Título y descripción por ruta. Lo cargado acá pisa lo que define cada página.",
    fields: [
      { name: "path", label: "Ruta", type: "text", required: true, hint: "Empieza con «/». Ej.: /servicios" },
      { name: "title", label: "Título", type: "text" },
      { name: "description", label: "Descripción", type: "textarea" },
      { name: "ogImage", label: "Imagen para compartir (ruta o URL)", type: "text" },
      { name: "noindex", label: "No indexar esta ruta", type: "boolean" },
    ],
  },
} satisfies Record<string, AdminResource>;

export type ResourceKey = keyof typeof RESOURCES;

export function getResource(key: string): (AdminResource & { key: ResourceKey }) | null {
  // hasOwn y no `in`: «constructor» o «toString» no son recursos.
  return typeof key === "string" && Object.hasOwn(RESOURCES, key) ? { ...(RESOURCES[key as ResourceKey] as AdminResource), key: key as ResourceKey } : null;
}

/** Columna de una tabla por nombre de propiedad (clave camelCase del esquema). */
export function column(table: PgTable, name: string): PgColumn {
  const col = (table as unknown as Record<string, PgColumn | undefined>)[name];
  if (!col) throw new Error(`Columna desconocida: ${name}`);
  return col;
}

export const RELATIONS: Record<RelationKey, { table: PgTable; label: string }> = {
  projectCategories: { table: projectCategories, label: "name" },
  postCategories: { table: postCategories, label: "name" },
  clients: { table: clients, label: "name" },
  projects: { table: projects, label: "title" },
  services: { table: services, label: "name" },
  media: { table: media, label: "filename" },
};
