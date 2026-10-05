// Caso confidencial: inmobiliaria anonimizada. Sin cifras, sin nombres, sin datos de clientes.
import type { SeedProject } from "./types";

export const project: SeedProject = {
  slug: "crm-inmobiliario",
  title: "CRM inmobiliario + experiencia pública",
  category: "sistemas-empresariales",
  services: ["sistemas-empresariales", "web-y-ecommerce"],
  badge: "Caso confidencial",
  sector: "Sector inmobiliario",
  visual: "grid",
  summary:
    "CRM y sitio público de una inmobiliaria sobre una misma base: propiedades, captaciones, leads, pipeline, agenda, equipo y contenidos. Construido con Laravel, React y MySQL.",
  problem: `La información comercial de la inmobiliaria estaba repartida en herramientas que no se hablaban entre sí. Las propiedades se cargaban en un lugar, las captaciones en otro, los leads se seguían aparte y las visitas quedaban en la agenda de cada quien. Ninguna de esas fuentes era la definitiva.

El sitio público agravaba el problema: no se alimentaba de la misma base, así que cada propiedad nueva y cada cambio de precio o de estado había que cargarlo dos veces. Entre una carga y la otra, la web mostraba una cosa y el equipo comercial manejaba otra. Si alguna vez tuviste que avisarle a alguien que bajara de la web una propiedad ya vendida, sabés de qué hablamos.`,
  context: `Se trata de una inmobiliaria con un equipo de agentes, un pipeline de ventas definido y la necesidad de publicar propiedades con buen posicionamiento en buscadores. El negocio dependía de dos cosas a la vez: que el equipo tuviera la información al día para vender y que las propiedades aparecieran en la web cuando alguien las buscaba.

Cada agente trabajaba sus captaciones y sus visitas, pero armar la visión general del pipeline era un trabajo aparte. El sitio público se mantenía por su lado y no reflejaba de forma automática lo que el equipo cargaba internamente, así que la web quedaba desactualizada con frecuencia.`,
  solution: `Construimos una plataforma única con dos caras sobre los mismos datos. Por un lado, un CRM interno donde el equipo administra propiedades, captaciones, leads, agenda y agentes, con un pipeline comercial en formato Kanban para ver en qué etapa está cada oportunidad. Por el otro, un sitio público administrable que publica esas mismas propiedades y los contenidos del CMS sin pasos intermedios.

El punto central es que no hay dos bases. Cuando una propiedad se marca como publicada, aparece en la web con su ficha, sus metadatos de SEO y su entrada en el sitemap. Los leads, vengan de donde vengan, se cargan en el mismo pipeline que ve todo el equipo y quedan asignables a un agente. El trabajo se hace una vez y se ve en todos lados.`,
  challenge: `Lo difícil no era cada módulo por separado, sino que todos compartieran la misma información sin que alguien tuviera que sincronizarla a mano. El pipeline en Kanban, la agenda de visitas y la publicación pública tocan los mismos registros desde ángulos distintos: un agente mueve una tarjeta, otro agenda una visita, alguien edita la ficha de la propiedad, y la web tiene que mostrar el estado correcto en todo momento.

Eso obligó a definir con cuidado qué significa cada estado de una propiedad y de un lead, quién puede cambiarlo y qué consecuencias tiene. Una propiedad vendida no puede seguir publicada; una visita agendada tiene que verse en la agenda del agente correcto. Las reglas tenían que vivir en el sistema, no en la memoria del equipo.`,
  architecture: `La plataforma está construida con Laravel y PHP en el backend, React en la interfaz y MySQL como base de datos. Es el stack web habitual del estudio: maduro, fácil de mantener y adecuado para una operación de este tamaño.

Las decisiones que más pesaron:

- **Un solo modelo de datos** para el CRM y el sitio público. No hay exportación ni sincronización: la web consulta los mismos registros que el equipo edita.
- **Estados explícitos** para propiedades y leads, con las transiciones permitidas definidas en el backend. La publicación pública depende de ese estado y no de un paso aparte.
- **Roles y permisos** que separan lo que puede hacer un agente, un administrador y quien gestiona contenidos.
- **SEO, sitemap, PDFs y códigos QR generados desde los mismos datos**, para que la ficha pública, el documento imprimible y el enlace rápido nunca cuenten versiones distintas de la misma propiedad.`,
  sections: "",
  features: [
    "Gestión de propiedades con ficha completa y estado de publicación",
    "Registro y seguimiento de captaciones",
    "Leads con pipeline comercial en Kanban",
    "Agenda de visitas y tareas por agente",
    "Equipo de agentes con roles y permisos",
    "CMS para páginas y contenidos del sitio público",
    "Reportes de gestión",
    "Fichas de propiedad en PDF y códigos QR",
    "SEO por propiedad y sitemap generado desde la base",
    "Registro de suscriptores desde el sitio público",
  ],
  stack: ["Laravel", "PHP", "React", "MySQL"],
  result: `Propiedades, captaciones, leads, agenda y sitio público se administran desde una misma plataforma: el trabajo se hace una vez y se ve en todos lados.

**Antes.** Cada propiedad y cada cambio de precio o de estado se cargaba dos veces, y entre una carga y otra la web decía una cosa y el equipo manejaba otra.

**Después.** Una propiedad marcada como publicada aparece en la web con ficha, SEO y sitemap. Una propiedad vendida no puede seguir publicada: la regla vive en el sistema.

- Menor duplicación de información: una sola base; la web lee los registros que el equipo edita.
- Procesos conectados: el estado de propiedades y leads define qué se publica y qué ve cada agente.
- Reducción de tareas manuales: ficha, PDF, QR y sitemap salen de los mismos datos, sin trabajo extra.
- Información disponible desde un único sistema: el pipeline se ve en el Kanban con el estado real de cada oportunidad.`,
  resultsMetrics: [],
  ctaTitle: "",
  ctaLead: "",
  seoTitle: "CRM inmobiliario a medida con sitio conectado",
  seoDescription:
    "Caso de estudio: una inmobiliaria unificó propiedades, captaciones, leads, agenda y sitio público en una sola plataforma construida con Laravel, React y MySQL.",
  year: null,
  featured: false,
};
