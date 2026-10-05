// Caso confidencial: el cliente no autorizó nombrarse. Sin cifras de negocio; las métricas son evidencia técnica del dueño.
import type { SeedProject } from "./types";

export const project: SeedProject = {
  slug: "plataforma-industrial-de-trazabilidad",
  title: "Plataforma industrial de trazabilidad",
  category: "sistemas-empresariales",
  services: ["sistemas-empresariales"],
  badge: "Caso confidencial",
  sector: "Empresa industrial",
  visual: "layers",
  summary:
    "Inspecciones, documentación y seguimiento operativo en una sola plataforma, con acceso por organización y trazabilidad de cada acción. Laravel, React e Inertia.",
  problem: `La operación generaba información todos los días: inspecciones, documentos técnicos, estados de cada proceso. Pero esa información vivía repartida entre personas, carpetas y herramientas distintas, y juntarla para responder una pregunta simple llevaba tiempo y dependía de quién estuviera disponible.

El segundo problema era más delicado. En un entorno industrial, saber **quién hizo cada cosa y cuándo** no es un detalle administrativo: es parte del control del proceso. Si alguna vez tuviste que reconstruir quién cambió un dato, sabés lo que cuesta. Sin un registro confiable, cada revisión obligaba a armar la historia a mano, con información sensible y varios niveles de acceso de por medio.`,
  context: `Es un sistema empresarial para procesos industriales: inspecciones, registros técnicos y seguimiento operativo con documentación privada que no puede circular libremente. El cliente no autorizó que lo nombremos, así que este caso describe el problema y las decisiones, no su actividad concreta.

Lo que sí podemos contar es la forma del desafío. Más de una organización trabaja sobre la misma plataforma y cada una debe ver únicamente lo suyo. Dentro de cada organización hay distintos niveles de acceso: quien registra no es quien aprueba, y quien consulta un documento no necesariamente puede editarlo. Todo eso tenía que convivir en un sistema que, además, dejara registro de cada acción.`,
  solution: `Construimos una plataforma web que concentra en un solo lugar los registros, la documentación, los estados operativos y el seguimiento de actividad. Cada inspección, cada documento y cada cambio de estado quedan asociados a una organización, a un usuario y a un momento.

El control de acceso no es una capa agregada al final: define qué puede ver y hacer cada rol desde el primer día. La trazabilidad funciona igual. En lugar de pedirle a cada persona que anote lo que hizo, el sistema registra las acciones relevantes por diseño y el historial se consulta desde el mismo panel.

Las tareas que no necesitan a nadie delante de la pantalla corren en segundo plano, encoladas o programadas, sin frenar a quien está trabajando.`,
  challenge: `Un sistema de este tipo se puede resolver con formularios y tablas. Lo difícil estaba en lo que no se ve: que una organización nunca pueda llegar, ni por error ni por una dirección adivinada, a los datos de otra; que los permisos sean coherentes en toda la aplicación y no una lista de excepciones; y que el historial sea confiable, es decir, que nadie pueda alterarlo sin dejar rastro.

A eso se sumaba la documentación privada: archivos que no pueden quedar en una carpeta pública con un enlace difícil de adivinar, sino detrás de las mismas reglas de acceso que el resto del sistema.

Ninguna de esas tres cosas se agrega después. Si se diseñan tarde, cada pantalla nueva es una oportunidad de filtrar información.`,
  architecture: `El backend es **Laravel**; el frontend, **React** con **TypeScript**, unidos por **Inertia**: una sola aplicación, sin una API intermedia que duplicar ni mantener sincronizada. Los datos viven en **MySQL/MariaDB**.

Las decisiones que sostienen el caso:

- **Aislamiento por empresa.** Cada registro pertenece a una organización y ninguna consulta cruza ese límite.
- **Autorización centralizada.** Las reglas de qué puede hacer cada rol están en un solo lugar y se aplican tanto en el backend como en lo que la interfaz muestra.
- **Auditoría integrada.** Las acciones relevantes se registran con quién, cuándo y sobre qué, sin depender de que alguien lo anote.
- **Documentos privados.** Los archivos se sirven a través de la aplicación, con las mismas reglas de acceso que los datos.
- **Colas y tareas programadas.** Lo pesado y lo periódico corre fuera del ciclo de la petición.`,
  sections: `## Trazabilidad por diseño

En muchos sistemas la auditoría es un módulo que se agrega al final y registra lo que alcanza. Acá fue al revés: primero definimos qué preguntas tenía que poder responder el historial y después diseñamos las entidades para que esas respuestas salieran solas.

Las preguntas eran pocas y concretas: quién creó o modificó un registro, cuándo cambió de estado, quién cargó cada documento y qué organización es dueña de cada dato. Con eso definido, cada acción relevante deja su rastro en el momento en que ocurre, y el historial se consulta con los mismos permisos que el resto de la información.

Para la operación, la diferencia es simple: una revisión ya no empieza por reconstruir qué pasó. Empieza por leerlo.`,
  features: [
    "Autenticación de usuarios",
    "Roles y permisos por organización",
    "Aislamiento de información entre organizaciones",
    "Gestión de registros e inspecciones industriales",
    "Documentos privados con acceso controlado",
    "Historial de auditoría: quién hizo qué y cuándo",
    "Seguimiento de procesos y estados operativos",
    "Tareas automáticas en segundo plano",
    "Panel administrativo",
  ],
  stack: ["Laravel", "PHP", "React", "TypeScript", "Inertia", "MySQL", "MariaDB"],
  result: `Inspecciones, documentos y estados operativos dejaron de vivir repartidos entre personas y carpetas: están en una misma plataforma, con accesos explícitos y un historial que no depende de la memoria de nadie.

**Antes.** Responder «¿quién cambió esto y cuándo?» obligaba a reconstruir la historia a mano, con documentación sensible de por medio.

**Después.** Cada inspección, documento y cambio de estado queda asociado a una organización, a un usuario y a un momento. Una revisión ya no empieza por reconstruir qué pasó: empieza por leerlo.

- Centralización: registros, documentación técnica y seguimiento operativo en un solo lugar.
- Trazabilidad: cada acción relevante queda registrada con autor y momento, sin pedirle a nadie que lo anote.
- Control de accesos: cada organización ve únicamente lo suyo y cada rol hace lo que le corresponde, documentos privados incluidos.
- Reducción de tareas manuales: el historial se arma solo al ocurrir cada acción; nadie reconstruye quién hizo qué.`,
  resultsMetrics: [
    { label: "Pruebas automatizadas", value: "220" },
    { label: "Aserciones", value: "614" },
  ],
  ctaTitle: "",
  ctaLead: "",
  seoTitle: "Sistema de trazabilidad y auditoría industrial",
  seoDescription:
    "Caso de estudio: inspecciones, documentos privados y seguimiento operativo en una plataforma con aislamiento por organización, permisos y auditoría.",
  year: null,
  featured: true,
};
