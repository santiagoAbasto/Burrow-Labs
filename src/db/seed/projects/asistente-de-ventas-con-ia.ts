// Caso anonimizado: entorno comercial, sin nombre. Métricas solo las del brief (pruebas automatizadas).
import type { SeedProject } from "./types";

export const project: SeedProject = {
  slug: "asistente-de-ventas-con-ia",
  title: "Asistente de ventas con IA",
  category: "ia",
  services: ["inteligencia-artificial"],
  badge: "MVP funcional",
  sector: "Operación comercial",
  visual: "nodes",
  summary:
    "Un asistente que entiende consultas, códigos y fotos para identificar productos y responder con datos reales del negocio. IA con herramientas controladas sobre Laravel y React.",
  problem: `En un comercio con muchos productos, buena parte de las consultas son técnicas: si un código corresponde a tal modelo, si una pieza es compatible con otra, si hay existencias, qué diferencia hay entre dos referencias parecidas. La información para responder ya existía en el catálogo, en el stock y en la documentación interna. Pero llegar a ella requería que una persona buscara, comparara y redactara la respuesta, consulta por consulta.

El equipo comercial dedicaba tiempo a repetir respuestas que el sistema ya sabía, y la calidad dependía de quién atendía. Cuando la consulta entraba como una foto del producto o un código mal tipeado, el trabajo manual era todavía mayor.`,
  context: `Entorno comercial con una gran variedad de productos, donde las consultas llegan en formas muy distintas: texto libre, códigos de producto o de proveedor, y fotografías de la etiqueta o del artículo. El canal puede ser un chat web, WhatsApp u otro medio de mensajería; el asistente se diseñó para no depender de ninguno en particular.

Los datos que necesita ya vivían en el sistema de la empresa: catálogo, existencias y documentación interna. El punto de partida no fue «agregar IA», sino conectar lo que el negocio ya sabía con la forma en que la gente pregunta.`,
  solution: `Construimos un asistente que combina modelos de lenguaje con herramientas controladas del sistema. El modelo se encarga de entender qué pregunta el cliente y de qué producto habla, incluso a partir de una foto o de un código incompleto. Pero la información que responde no sale del modelo: sale de herramientas que consultan el catálogo, el stock y la documentación, y devuelven datos verificados.

Cada respuesta pasa por reglas del negocio antes de llegar al cliente. Si la consulta excede lo que el asistente puede resolver con datos, o toca información sensible, el caso pasa a un operador con todo el contexto de la conversación. La IA asiste el proceso comercial; no lo reemplaza.`,
  challenge: `El riesgo principal con un asistente de este tipo es que suene seguro y esté equivocado. Un modelo de lenguaje puede inventar un precio, afirmar que hay stock o completar un dato técnico que no existe, y lo hace con la misma fluidez con la que acierta. En un entorno comercial, una respuesta así cuesta ventas y confianza.

El desafío fue diseñar un sistema donde el modelo nunca sea la fuente de precios, existencias ni información sensible. Esos datos solo pueden venir de una herramienta del sistema, y si la herramienta no devuelve nada, el asistente lo dice y deriva. También hubo que resolver ambigüedades reales: códigos parecidos, fotos borrosas, consultas que mezclan varios productos en un mismo mensaje.`,
  architecture: `La arquitectura separa tres responsabilidades que suelen mezclarse cuando se integra IA:

- **El modelo interpreta.** Clasifica la consulta, extrae códigos, identifica productos en fotografías y decide qué herramienta necesita. Trabaja con salidas estructuradas, no con texto libre que haya que parsear.
- **Las herramientas consultan.** Funciones del backend que buscan en catálogo, stock y documentación. El modelo las invoca por tool calling; nunca accede a la base de datos directamente.
- **Las reglas validan.** Una capa determinística revisa cada respuesta antes de enviarla: qué datos pueden mostrarse, qué acciones requieren una persona y cuándo derivar.

El backend está en Laravel sobre MySQL, con un panel en React y TypeScript para operar y monitorear. Los proveedores de IA (OpenAI, Gemini y Anthropic) son intercambiables detrás de una misma interfaz, para comparar costo y calidad sin tocar el resto del sistema. Los prompts están versionados y cada conversación registra qué versión, proveedor y herramientas se usaron, para auditar una respuesta después.`,
  sections: `## Lo que la IA puede y no puede hacer

La frontera está definida en código, no en el prompt. Que el modelo «sepa» que no debe inventar precios no alcanza: la regla tiene que ser imposible de saltar.

**Lo que el modelo puede hacer:** interpretar una consulta, extraer un código, reconocer un producto en una foto, elegir qué herramienta consultar y redactar la respuesta con los datos que esa herramienta devolvió.

**Lo que el modelo no puede hacer:** afirmar un precio, un stock o una condición comercial que no venga de una herramienta; ejecutar acciones con efecto (reservar, cotizar, confirmar) sin pasar por las reglas del negocio; ni acceder a información que el canal no tiene permitido ver.

Cuando una consulta cae fuera de esa frontera, el asistente responde con lo que sí sabe y deriva el resto a un operador con el historial completo. El cliente no choca con una pared: nota que alguien sigue la conversación.`,
  features: [
    "Interpretación de consultas en texto libre y códigos de producto",
    "Búsqueda asistida de productos en el catálogo",
    "Reconocimiento visual de productos a partir de fotografías",
    "Consulta de stock y documentación mediante herramientas controladas",
    "Historial conversacional con contexto entre mensajes",
    "Respuestas de fallback cuando no hay datos suficientes",
    "Derivación a un operador humano con el contexto completo",
    "Monitoreo del asistente: conversaciones, herramientas usadas y derivaciones",
    "Proveedores de IA intercambiables: OpenAI, Gemini y Anthropic",
    "Versionado de prompts con registro por conversación",
  ],
  stack: ["Laravel", "PHP", "React", "TypeScript", "MySQL", "OpenAI", "Gemini", "Anthropic"],
  result: `Quedó como un MVP funcional: un asistente que interpreta consultas, códigos y fotos, identifica productos y responde con datos del negocio, con una salida clara hacia un operador.

**Antes.** Cada consulta técnica (si un código corresponde a tal modelo, si hay existencias, qué diferencia hay entre dos referencias) requería que una persona buscara, comparara y redactara la respuesta.

**Después.** La parte repetible de la consulta la resuelve el asistente con datos verificados del sistema; la que requiere criterio sigue en manos del equipo, con el historial completo de la conversación.

- Procesos conectados: catálogo, stock y documentación interna responden por donde la gente pregunta.
- Trazabilidad: cada conversación registra qué proveedor, qué versión del prompt y qué herramientas se usaron.
- Reducción de tareas manuales: en el alcance del MVP, las respuestas que el sistema ya sabía dejan de redactarse a mano.
- Capacidad de incorporar nuevos módulos: canales, herramientas y reglas se amplían sin rehacer la arquitectura.`,
  resultsMetrics: [
    { label: "Pruebas automatizadas", value: "161" },
    { label: "Aserciones", value: "421" },
  ],
  ctaTitle: "",
  ctaLead: "",
  seoTitle: "Asistente de ventas con IA: caso de estudio",
  seoDescription:
    "Caso de estudio: un asistente que interpreta consultas, códigos y fotos, identifica productos y responde con datos reales del negocio, sin inventar precios.",
  year: null,
  featured: true,
};
