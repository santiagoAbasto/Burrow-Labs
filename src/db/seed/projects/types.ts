// Forma de cada caso de estudio sembrado. Un archivo por caso en esta carpeta; el orden lo da `index.ts`.
// Reglas (docs/CONTENT-STATUS.md): nada inventado, sin métricas sin evidencia, clientes anonimizados
// salvo autorización explícita. Los campos largos son Markdown.

export const PROJECT_BADGES = ["Producto propio", "Caso confidencial", "MVP funcional", "Sistema interno", "Proyecto B2B", "IA aplicada"] as const;
export type ProjectBadge = (typeof PROJECT_BADGES)[number];

/** Esquemas disponibles para ilustrar un caso sin portada (src/components/projects/project-visual.tsx). */
export const PROJECT_VISUALS = ["layers", "flow", "nodes", "grid", "apple-boss"] as const;
export type ProjectVisual = (typeof PROJECT_VISUALS)[number];

/** Slugs de los cuatro servicios sembrados en `seed-content.ts` (rutas públicas `/servicios/<slug>`). */
export const SERVICE_SLUGS = ["sistemas-empresariales", "automatizacion", "inteligencia-artificial", "web-y-ecommerce"] as const;
export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export type SeedProject = {
  slug: string;
  title: string;
  /** Slug de `project_categories`: sistemas-empresariales | ia | automatizacion | e-commerce | b2b | apis | web | crm */
  category: string;
  /** Servicios que el caso realmente ejercita (tabla `project_services`): enlaza caso ↔ servicio en el sitio. */
  services: ServiceSlug[];
  badge: ProjectBadge | "";
  /** Contexto de industria que sí se puede contar («Empresa industrial»); vacío si no se conoce. */
  sector: string;
  visual: ProjectVisual;
  /** Máximo dos líneas en el listado. */
  summary: string;
  problem: string;
  context: string;
  solution: string;
  challenge: string;
  architecture: string;
  /** Secciones propias después de «Arquitectura»: cada `## Título` abre una. Vacío si no hace falta. */
  sections: string;
  /** Entre 5 y 10, concretas. */
  features: string[];
  /** Solo tecnologías verificadas. */
  stack: string[];
  result: string;
  /** Solo evidencia real (p. ej. cantidad de pruebas automatizadas). Sin porcentajes inventados. */
  resultsMetrics: { label: string; value: string }[];
  ctaTitle: string;
  ctaLead: string;
  /** Sin el nombre del sitio: se le agrega « · Burrow Labs» (hasta ~46 caracteres para no pasar de 60). */
  seoTitle: string;
  /** 140–160 caracteres: qué resuelve el caso y para quién. */
  seoDescription: string;
  year: number | null;
  featured: boolean;
};
