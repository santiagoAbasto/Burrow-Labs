// Caso de estudio: Commerce Intelligence. Proyecto propio (sin cliente). COPY REAL del brief del dueño; sin cifras inventadas.
import type { SeedProject } from "./types";

export const project: SeedProject = {
  slug: "commerce-intelligence",
  title: "Commerce Intelligence: IA para analizar, reglas para decidir",
  category: "ia",
  services: ["inteligencia-artificial"],
  badge: "IA aplicada",
  sector: "E-commerce · Inteligencia de negocio",
  visual: "nodes",
  summary:
    "Plataforma de comercio que investiga productos y mercado con IA, pero puntúa oportunidades y fija precios con reglas determinísticas, auditables y probadas.",
  problem: `Una decisión comercial —qué producto conviene, a qué precio, con qué prioridad— se apoya cada vez más en información que un modelo de lenguaje puede leer y resumir mucho más rápido que una persona. Hasta ahí, la IA ayuda.

El problema aparece cuando esa misma IA termina calculando. Un modelo puede responder distinto a la misma pregunta dos veces, y después nadie puede explicar por qué un producto quedó con tal puntaje o tal precio. Para investigar, esa variabilidad es tolerable. Para un cálculo que mueve dinero, no: tiene que dar siempre el mismo resultado, poder explicarse y poder probarse.`,
  context: `Commerce Intelligence es un proyecto propio de Burrow Labs, pensado para una operación de comercio que necesita hacer tres cosas de forma continua: investigar productos y mercado, puntuar oportunidades para decidir dónde poner la atención y fijar precios con reglas que después se puedan auditar.

Las tres tareas son de naturaleza distinta. La investigación es abierta y se beneficia de un modelo que lee, resume e interpreta. El scoring y el pricing son cálculos: reciben datos, aplican reglas y devuelven un número que alguien va a tener que defender. Mezclarlas en una sola «respuesta de la IA» era la tentación obvia, y justo lo que queríamos evitar.`,
  solution: `Dividimos la plataforma en dos capas con responsabilidades claras. La IA interpreta: investiga, lee fuentes, extrae atributos y devuelve una estructura de datos con lo que entendió. El código determinístico decide: toma esa estructura, aplica el scoring y el motor de pricing, y registra cada paso.

Además, ningún proveedor de IA forma parte del dominio. Los modelos se consumen detrás de una abstracción, así que cambiar de proveedor —por costo, calidad o disponibilidad— es una configuración, no una reescritura. Cada decisión queda trazada: qué interpretó el modelo, qué reglas se aplicaron y qué resultado salió.`,
  challenge: `Lo difícil no fue conectar un modelo: fue dibujar la frontera. ¿Dónde termina la interpretación y dónde empieza la decisión? Si la IA devuelve «este producto parece premium», ¿eso es un dato o ya es un juicio sobre el precio?

La resolvimos con un contrato: la IA solo puede devolver estructuras tipadas con atributos observables, nunca puntajes ni precios. Todo número con consecuencias se calcula del lado determinístico, con reglas explícitas.

Y esa frontera tenía que poder probarse automáticamente. Para eso, el dominio no puede depender de que un modelo responda igual dos veces: las pruebas trabajan sobre la estructura que entra, no sobre el modelo que la produjo. Así se verifica que el scoring y el pricing dan siempre el mismo resultado y que el flujo completo se comporta igual sin importar qué proveedor esté detrás.`,
  architecture: `El backend está en Laravel sobre MySQL; la interfaz, en React con TypeScript. El corazón del diseño es la separación entre los proveedores de IA y el dominio:

- **Una interfaz común de proveedor** define qué le pedimos a cualquier modelo: investigar e interpretar, devolviendo estructuras validadas.
- **Un orquestador** elige el proveedor, arma el pedido, valida la respuesta contra el esquema esperado y la entrega al dominio. Es el único lugar que sabe qué proveedores existen.
- **Motores determinísticos** de scoring y pricing: código puro, sin llamadas a modelos, con reglas explícitas y legibles.

Las pruebas siguen la misma división: Pest para el dominio y los motores, Vitest para la lógica de la interfaz y Playwright para los flujos de extremo a extremo.

> IA para interpretación. Código determinístico para cálculos y reglas.`,
  sections: "",
  features: [
    "Investigación de productos y mercado asistida por IA",
    "Interpretación estructurada: el modelo devuelve atributos validados, no conclusiones",
    "Scoring determinístico de oportunidades",
    "Motor de pricing con reglas explícitas",
    "Proveedores de IA intercambiables sin tocar el dominio",
    "Trazabilidad de cada decisión: qué se interpretó, qué regla se aplicó, qué salió",
    "Pruebas automatizadas de extremo a extremo",
  ],
  stack: ["Laravel", "PHP", "React", "TypeScript", "MySQL", "Pest", "Vitest", "Playwright"],
  result: `La lógica crítica quedó explícita y separada de los modelos. Cuando querés saber por qué un producto tiene cierto puntaje o precio, la respuesta está en reglas legibles y en un registro de la decisión, no en una conversación con un modelo.

**Antes.** Un modelo podía responder distinto a la misma pregunta dos veces, y después nadie podía explicar por qué un producto quedó con tal puntaje o tal precio.

**Después.** La IA investiga, interpreta y devuelve atributos observables; el código determinístico puntúa, fija precios y registra cada paso.

- Trazabilidad: cada decisión guarda qué interpretó el modelo, qué reglas se aplicaron y qué salió.
- Centralización: las reglas de scoring y pricing viven en motores propios, legibles, sin llamadas a modelos.
- Procesos conectados: investigar, puntuar y fijar precio es un solo flujo, no tres herramientas.
- Capacidad de incorporar nuevos módulos: sumar o cambiar un proveedor de IA es configuración, no una reescritura.`,
  resultsMetrics: [{ label: "Pruebas en verde", value: "381 / 381" }],
  ctaTitle: "",
  ctaLead: "",
  seoTitle: "Commerce Intelligence: IA y pricing con reglas",
  seoDescription:
    "Caso de estudio: una plataforma de comercio donde la IA investiga e interpreta y motores determinísticos calculan scoring y precios con reglas auditables.",
  year: null,
  featured: true,
};
