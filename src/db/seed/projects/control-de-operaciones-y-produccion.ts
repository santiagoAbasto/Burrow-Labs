// Caso anonimizado (brief del dueño). Sin cliente, sin cifras, sin datos de despliegue.
import type { SeedProject } from "./types";

export const project: SeedProject = {
  slug: "control-de-operaciones-y-produccion",
  title: "Control de operaciones y producción",
  category: "sistemas-empresariales",
  services: ["sistemas-empresariales"],
  badge: "Sistema interno",
  sector: "Empresa manufacturera",
  visual: "flow",
  summary:
    "Sistema interno que ordena pedidos, etapas de producción, operadores, rechazos y depósitos en un solo flujo visible. Construido con Laravel y React.",
  problem: `Saber en qué etapa estaba un pedido exigía preguntar. El seguimiento vivía en registros manuales y en la memoria de cada operador: quién lo tenía, si había pasado el control, si lo habían rechazado y por qué. Para armar el panorama del día, la administración recorría el piso o esperaba a que cada responsable reportara.

Ese método funciona mientras la operación es chica. Con varios operadores por turno y varias etapas físicas, la información llega tarde, llega incompleta o llega distinta según a quién se le pregunte. Los rechazos eran el punto más débil: se corregían, pero no quedaba registro de cuántos hubo, en qué etapa aparecían ni por qué motivo.`,
  context: `La operación tiene etapas físicas bien marcadas: el material entra a depósito, pasa a ensamblaje, llega a control y, si no supera la revisión, vuelve atrás como rechazo. Cada etapa tiene responsables distintos y en cada turno trabajan varios operadores al mismo tiempo, muchas veces sobre pedidos diferentes.

El pedido es la unidad que atraviesa todo el recorrido, pero hasta entonces ningún sistema lo seguía de punta a punta. Depósito sabía qué había entrado, ensamblaje sabía qué estaba armando y control sabía qué había revisado; nadie tenía la foto completa sin juntar las tres versiones a mano.`,
  solution: `Tradujimos el recorrido físico a un flujo digital: cada pedido avanza por etapas con un estado explícito, un responsable asignado y una fecha en cada paso. Cuando control rechaza una pieza, el rechazo queda registrado con su motivo y el pedido vuelve a la etapa que corresponde, sin perder el historial de lo que ya pasó.

Los operadores registran su trabajo desde la misma plataforma: toman un pedido, lo mueven de etapa y marcan rechazos. La administración ve el flujo completo en un tablero: qué hay en depósito, qué está en ensamblaje, qué espera control y dónde se acumulan los rechazos. Dejó de preguntar para empezar a mirar.`,
  challenge: `Lo difícil no fue construir el flujo, sino no volverlo rígido. Un proceso físico tiene excepciones: un pedido que vuelve dos etapas, uno que espera material y queda en pausa, uno que control devuelve por un motivo que nadie había previsto. Si el sistema solo permite avanzar en línea recta, los operadores dejan de usarlo y vuelven al papel.

La decisión fue separar lo que es regla de lo que es criterio. Las transiciones válidas entre etapas están definidas y se validan en el servidor; dentro de ese marco, un rechazo puede devolver un pedido a cualquier etapa anterior y la administración puede corregir un movimiento equivocado dejando rastro. El flujo guía sin encerrar.`,
  architecture: `Aplicación web con **Laravel** en el servidor y **React** en la interfaz. Un solo sistema cubre lo que usan los operadores en el piso y lo que ve la administración, con permisos por rol para separar ambas vistas.

Decisiones que sostienen el diseño:

- El estado de un pedido no es un campo que se sobrescribe: cada cambio de etapa es un movimiento registrado, con responsable, fecha y motivo. El estado actual se deriva del último movimiento y el historial queda completo.
- Las transiciones permitidas entre etapas viven en el dominio, en código, no repartidas en formularios. Agregar una etapa o cambiar una regla se hace en un solo lugar.
- Los rechazos son una entidad propia, vinculada al pedido y a la etapa en la que se detectaron, para poder contarlos y revisarlos después.
- Las pantallas de operador son pocas y directas, pensadas para usarse rápido entre tareas.`,
  sections: "",
  features: [
    "Pedidos con historial completo de movimientos",
    "Etapas operativas que siguen el proceso real",
    "Estados explícitos en cada paso del flujo",
    "Operadores con responsable asignado por etapa",
    "Rechazos registrados con motivo y etapa de origen",
    "Depósitos como etapa de entrada y espera",
    "Ensamblaje con seguimiento por pedido y operador",
    "Tablero de seguimiento del flujo completo",
    "Administración con roles y corrección de movimientos",
  ],
  stack: ["Laravel", "PHP", "React"],
  result: `El recorrido físico de cada pedido (depósito, ensamblaje, control, rechazo) quedó traducido a un flujo con estado explícito, responsable y fecha en cada paso. El proceso no cambió: cambió cómo se registra.

**Antes.** Saber en qué etapa estaba un pedido exigía recorrer el piso o esperar que cada responsable reportara. Los rechazos se corregían, pero sin registro de etapa ni motivo.

**Después.** Los operadores toman un pedido, lo mueven de etapa y marcan rechazos desde la misma plataforma; la administración mira el tablero en vez de preguntar.

- Trazabilidad: cada cambio de etapa queda registrado con responsable, fecha y motivo; el historial del pedido queda completo.
- Procesos conectados: depósito, ensamblaje y control siguen el mismo pedido, no tres versiones.
- Información disponible desde un único sistema: depósito, ensamblaje, control y rechazos acumulados, en un solo tablero.
- Control de accesos: roles que separan la vista de los operadores de la de administración; una corrección deja rastro.`,
  resultsMetrics: [],
  ctaTitle: "",
  ctaLead: "",
  seoTitle: "Sistema de control de producción por etapas",
  seoDescription:
    "Caso de estudio: el recorrido de cada pedido por depósito, ensamblaje, control y rechazos convertido en un flujo digital con etapas, estados y responsables.",
  year: null,
  featured: false,
};
