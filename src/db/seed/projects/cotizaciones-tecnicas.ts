// Caso confidencial: cliente anonimizado por pedido del dueño. Métricas solo las del brief (pruebas de backend).
import type { SeedProject } from "./types";

export const project: SeedProject = {
  slug: "cotizaciones-tecnicas",
  title: "Cotizaciones técnicas sin cálculos improvisados",
  category: "sistemas-empresariales",
  services: ["sistemas-empresariales", "automatizacion", "inteligencia-artificial"],
  badge: "Caso confidencial",
  sector: "Automatización comercial",
  visual: "flow",
  summary:
    "Un sistema para armar cotizaciones complejas sin hojas de cálculo: datos comerciales, fórmulas controladas y PDFs desde un solo lugar, con IA solo donde hace falta interpretar.",
  problem: `Cotizar no era llenar un formulario. Cada propuesta exigía reunir información de la empresa, sus contactos, las condiciones comerciales acordadas, las líneas del pedido, las alternativas que se ofrecían y los cálculos técnicos que definían el precio final.

Esa información vivía en lugares distintos: correos, planillas con fórmulas heredadas y la memoria de quien más tiempo llevaba cotizando. Armar una cotización era, en la práctica, volver a construirla desde cero cada vez, con el riesgo de que un valor mal copiado o una regla aplicada a medias cambiara el resultado sin que nadie lo notara.`,
  context: `La empresa es técnica: lo que cotiza no es un listado de productos con precio fijo, sino propuestas donde cada línea puede tener alternativas y donde el precio sale de fórmulas que combinan parámetros técnicos con condiciones comerciales.

Con el tiempo, esas reglas se habían repartido entre hojas de cálculo, criterios de cada persona y acuerdos que nunca quedaron escritos. Dos personas podían cotizar lo mismo y llegar a números distintos, y revisar una propuesta implicaba rehacer el cálculo a mano para poder confiar en ella.`,
  solution: `Diseñamos un flujo de cotización con pasos explícitos: empresa → contacto → condiciones → líneas y alternativas → cálculo → documento. Cada paso guarda datos estructurados, así que la cotización deja de ser un archivo y pasa a ser un registro que se puede consultar, comparar y auditar.

Las fórmulas viven en el sistema, con parámetros controlados, y el cálculo es determinístico: la misma entrada produce siempre el mismo resultado. La inteligencia artificial entra en un único lugar: interpretar pedidos escritos en texto libre y convertirlos en una estructura que el sistema entiende. Si el modelo no responde o su respuesta no pasa la validación, un camino determinístico toma el relevo y la persona completa lo que falta.`,
  challenge: `El desafío fue trazar una línea clara entre dos tipos de trabajo. Un modelo de lenguaje es bueno leyendo un pedido escrito en texto libre, con unidades mezcladas y referencias implícitas, y proponiendo una estructura. Es malo, en cambio, para calcular: puede acertar casi siempre, y «casi siempre» no sirve cuando el número termina en una propuesta firmada.

> Los cálculos sensibles no dependen de una respuesta probabilística de IA.

Con ese principio, la IA quedó confinada a la interpretación: sugiere, estructura y marca lo que no entendió. Todo lo que define un precio pasa por fórmulas versionadas, validadas y con pruebas. Si el modelo falla o no está disponible, el flujo sigue con una interpretación determinística más conservadora, sin bloquear a quien cotiza.`,
  architecture: `Backend en Laravel con una API autenticada con Sanctum; frontend en React con TypeScript. La base de datos puede ser SQLite o MySQL según la instalación: el dominio se modeló sin depender de particularidades del motor, así que el mismo código corre en una instalación liviana o en una con más carga.

Decisiones que marcaron el diseño:

- **Motor de fórmulas determinístico.** Las fórmulas se guardan con sus parámetros y se evalúan en el backend, nunca en el navegador ni en el modelo de IA.
- **OpenAI para interpretación estructurada.** El modelo recibe texto libre y devuelve una estructura validada contra un esquema; lo que no valida pasa al fallback determinístico.
- **Auditoría en el dominio.** Cada cambio en una cotización, condición o fórmula queda registrado con autor y momento.
- **Permisos por rol** sobre qué se puede ver, editar y aprobar.
- **PDF generado desde los datos**, no desde una plantilla editada a mano, para que el documento refleje lo calculado.`,
  sections: "",
  features: [
    "Empresas y contactos con sus condiciones comerciales",
    "Cotizaciones con líneas y alternativas por línea",
    "Fórmulas de cálculo con parámetros controlados",
    "Cálculo determinístico y reproducible",
    "Interpretación asistida de pedidos en texto libre",
    "Fallback determinístico cuando la IA no responde o no valida",
    "Generación de PDF a partir de la cotización",
    "Permisos por rol",
    "Auditoría de cambios",
  ],
  stack: ["Laravel", "PHP", "React", "TypeScript", "Sanctum", "MySQL", "SQLite", "OpenAI"],
  result: `Cotizar dejó de ser reconstruir una propuesta desde cero. Datos comerciales, fórmulas y documento viven en un mismo sistema, y la misma entrada da siempre el mismo resultado.

**Antes.** La información estaba en correos, planillas y en la memoria de quien más tiempo llevaba cotizando. Dos personas podían cotizar lo mismo y llegar a números distintos.

**Después.** La cotización es un registro con pasos explícitos (empresa, contacto, condiciones, líneas y alternativas, cálculo, documento), y el PDF sale de los mismos datos que se calcularon.

- Centralización: fórmulas versionadas con parámetros controlados, en lugar de reglas repartidas en planillas.
- Trazabilidad: cada cambio en una cotización, una condición o una fórmula queda registrado con autor y momento.
- Reducción de tareas manuales: la IA convierte un pedido en texto libre en una estructura que el sistema entiende; si falla, un camino determinístico toma el relevo.
- Control de accesos: permisos por rol sobre qué se puede ver, editar y aprobar.`,
  resultsMetrics: [
    { label: "Pruebas de backend", value: "150" },
    { label: "Aserciones", value: "1.096" },
  ],
  ctaTitle: "",
  ctaLead: "",
  seoTitle: "Sistema de cotizaciones técnicas a medida",
  seoDescription:
    "Caso de estudio: un sistema de cotizaciones complejas con fórmulas controladas, cálculo determinístico, PDFs y auditoría. IA solo para interpretar pedidos.",
  year: null,
  featured: false,
};
