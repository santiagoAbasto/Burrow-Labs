// Artículos iniciales de Burrow Lab. COPY REAL: conocimiento general, sin cifras ni clientes inventados.
// seoTitle va sin el nombre del sitio (se agrega « · Burrow Labs»); los enlaces internos apuntan al servicio o al caso que desarrolla la idea.

export const POST_CATEGORIES = [
  { slug: "automatizacion", name: "Automatización" },
  { slug: "ia-aplicada", name: "IA aplicada" },
  { slug: "software-empresarial", name: "Software empresarial" },
  { slug: "integraciones", name: "Integraciones" },
  { slug: "web-y-ecommerce", name: "Web y e-commerce" },
];

export const POSTS = [
  {
    slug: "que-proceso-automatizar-primero",
    category: "automatizacion",
    title: "Qué proceso automatizar primero (y cuál dejar tranquilo)",
    excerpt:
      "No todo lo repetitivo merece automatizarse hoy. Una forma simple de elegir el primer proceso sin gastar de más ni frustrar al equipo.",
    readingMinutes: 6,
    seoTitle: "Qué proceso automatizar primero en tu empresa",
    seoDescription:
      "Cuatro preguntas para elegir el primer proceso a automatizar: frecuencia, reglas claras, datos disponibles y riesgo si falla. Y qué conviene dejar tranquilo.",
    content: `Cuando una empresa decide automatizar, casi siempre empieza por el proceso que más molesta. Es comprensible, pero no siempre es el mejor primer paso. El proceso que más molesta suele ser también el más enredado: tiene excepciones, depende de tres personas y nadie lo hace igual dos veces.

El primer proceso que automatices tiene que cumplir otra función: demostrar que se puede, rápido y sin drama. Para elegirlo alcanza con cuatro preguntas.

## 1. ¿Se repite con frecuencia?

Una tarea que ocurre una vez al mes no devuelve el esfuerzo de automatizarla, salvo que un error ahí salga muy caro. Buscá lo que pasa todos los días o varias veces por semana: cargar pedidos, enviar el mismo aviso, armar el mismo reporte, pasar datos de una planilla a otra.

Un ejercicio útil: pedile a cada persona del equipo que anote durante una semana lo que hizo más de tres veces. La lista suele sorprender.

## 2. ¿Tiene reglas claras?

Automatizar es escribir reglas. Si para decidir qué hacer hay que «ver el caso», todavía no hay regla: hay criterio. Y el criterio se puede asistir, pero no reemplazar de entrada.

Buenos candidatos:

- «Si el pedido supera cierto monto, avisar a administración.»
- «Cada lunes, enviar el estado de cuenta a los clientes con saldo.»
- «Cuando entra un formulario, crear el contacto y asignarlo a un vendedor.»

Malos candidatos para empezar: negociaciones, reclamos delicados, cualquier cosa donde la respuesta correcta cambie según quién pregunta.

## 3. ¿Los datos ya existen en algún lado?

Un proceso se puede automatizar cuando su información vive en un lugar al que un sistema puede llegar: una base de datos, una planilla ordenada, un formulario, una API. Si los datos están en audios de WhatsApp, en papeles o en la cabeza de alguien, el primer trabajo no es automatizar: es capturar esos datos de forma ordenada.

Esto no es una mala noticia. Muchas veces el mayor beneficio aparece justo ahí: en dejar de depender de la memoria de una persona.

## 4. ¿Qué pasa si falla?

Empezá por algo donde un error sea visible y barato. Un recordatorio que no salió se nota y se corrige. Una factura mal emitida es otra historia. La confianza del equipo en la automatización se construye con aciertos chicos, no con una apuesta grande.

## Una regla para ordenar la lista

Con las respuestas, poné cada proceso en una tabla simple:

| Proceso | Frecuencia | Reglas claras | Datos disponibles | Riesgo si falla |
|---|---|---|---|---|
| Aviso de pedido listo | Diaria | Sí | Sí | Bajo |
| Conciliación bancaria | Semanal | En parte | Sí | Alto |
| Cotizaciones a medida | Diaria | No | En parte | Medio |

El primero de la lista es el que tiene frecuencia alta, reglas claras, datos disponibles y riesgo bajo. Casi nunca es el más glamoroso. Casi siempre es el que libera tiempo desde la primera semana. Para estimar cuánto, la [calculadora de procesos manuales](/calculadora) pasa esa tarea a horas y costo por año.

## Lo que conviene dejar tranquilo

Hay procesos que no vale la pena tocar todavía:

- **Los que están por cambiar.** Si el área se va a reorganizar, automatizar hoy es construir sobre arena.
- **Los que nadie puede explicar.** Si tres personas describen el proceso de tres formas distintas, primero hay que acordar cómo es.
- **Los que funcionan y casi no ocurren.** No todo lo manual es un problema.

## Después del primero

Un primer proceso automatizado enseña más que cualquier plan: muestra dónde están los datos de verdad, quién decide qué y qué excepciones existen. Con eso, el segundo proyecto se define mejor y suele ser más ambicioso. Así encaramos las [automatizaciones e integraciones](/servicios/automatizacion): un proceso concreto por vez.

La pregunta no es «¿qué podemos automatizar?», porque la respuesta es «casi todo». La pregunta útil es «¿qué conviene automatizar primero?». Y esa se responde con una lista, cuatro columnas y un poco de honestidad sobre cómo se trabaja hoy.`,
  },
  {
    slug: "cuando-tu-excel-ya-es-un-sistema",
    category: "software-empresarial",
    title: "Señales de que tu Excel ya es un sistema (y te está pidiendo una base de datos)",
    excerpt:
      "Las planillas son una gran herramienta hasta que dejan de serlo. Siete señales concretas de que llegó el momento de pasar a un sistema.",
    readingMinutes: 6,
    seoTitle: "Cuándo pasar de Excel a un sistema: 7 señales",
    seoDescription:
      "Siete señales de que tu planilla de Excel ya funciona como un sistema, qué cambia al pasar a una base de datos con permisos e historial y cómo hacer el cambio.",
    content: `Excel es probablemente el software de gestión más usado del mundo, y con razón: es flexible, todos lo conocen y permite resolver un problema en una tarde. El inconveniente es que esa misma flexibilidad lo convierte, sin que nadie lo decida, en el sistema central de la empresa.

No hay nada malo en usar planillas. El problema aparece cuando la planilla empieza a hacer el trabajo de una base de datos sin tener sus protecciones. Estas son las señales.

## 1. Hay un archivo que se llama «FINAL_v3_ahora_sí»

Si para saber cuál es la versión correcta hay que preguntarle a alguien, ya no hay una fuente de verdad. Cada copia es una versión distinta de la realidad, y tarde o temprano dos personas toman decisiones con números diferentes.

## 2. Solo una persona entiende cómo funciona

Las fórmulas encadenadas, las macros y las hojas ocultas terminan formando un sistema que tiene un único operador. Mientras esa persona está, todo anda. Cuando se va de vacaciones, el proceso se detiene. Lo vimos en un caso de [cotizaciones técnicas](/proyectos/cotizaciones-tecnicas): las reglas vivían en planillas con fórmulas heredadas y en la memoria de quien más tiempo llevaba cotizando.

## 3. Copiar y pegar es parte del procedimiento

Si el paso tres del proceso es «copiar la columna F y pegarla en la otra planilla», hay dos sistemas que deberían ser uno. Cada copia manual es una oportunidad de error que nadie va a notar hasta fin de mes.

## 4. Dos personas no pueden trabajar al mismo tiempo

Las planillas compartidas mejoraron mucho, pero no resuelven lo de fondo: no saben quién puede tocar qué. En una base de datos, un vendedor carga pedidos y no puede modificar precios. En una planilla, cualquiera puede borrar una columna por accidente.

## 5. El archivo tarda en abrir

Una planilla con decenas de miles de filas y fórmulas cruzadas está haciendo un trabajo para el que no fue pensada. La lentitud es el síntoma; el riesgo real es que un día el archivo se dañe.

## 6. Nadie sabe quién cambió un dato

¿Quién modificó ese precio? ¿Cuándo? ¿Cuánto decía antes? Si la respuesta es «no hay forma de saberlo», falta trazabilidad. Para stock, cobranzas o cualquier dato con consecuencias económicas, eso importa. En una [plataforma industrial de trazabilidad](/proyectos/plataforma-industrial-de-trazabilidad) que construimos, ese historial se registra solo, por diseño.

## 7. Los reportes se arman a mano

Si cada informe requiere filtrar, copiar, armar una tabla dinámica y dar formato, el reporte no es un reporte: es una tarea. Un sistema lo genera solo, siempre igual, con los datos del momento.

## Qué cambia con un sistema

Pasar de planillas a un [sistema a medida](/servicios/sistemas-empresariales) no significa perder flexibilidad. Significa ganar cuatro cosas que una planilla no puede dar:

- **Una sola fuente de verdad.** Todos ven el mismo dato, actualizado.
- **Permisos.** Cada persona hace lo que le corresponde y nada más.
- **Historial.** Cada cambio queda registrado.
- **Automatización.** Lo que hoy es copiar y pegar pasa a ocurrir solo.

Y no hace falta abandonar Excel. Un buen sistema exporta a planilla cuando se necesita analizar algo puntual. La diferencia es que la planilla vuelve a ser lo que siempre debió ser: una herramienta de análisis, no el lugar donde vive el negocio.

## Cómo hacer la transición sin trauma

El error más común es querer reemplazar todo de una vez. Funciona mejor así:

1. **Elegir una planilla**, la más crítica o la más dolorosa.
2. **Entender qué hace realmente**: qué datos guarda, quién la usa, qué decisiones salen de ahí.
3. **Construir solo eso**, con los datos existentes migrados.
4. **Usarlo en paralelo un tiempo corto** hasta que el equipo confíe.
5. **Recién entonces, pasar a la siguiente.**

Si reconociste tres o más señales, no es urgente, pero ya es momento de planificarlo. Las planillas no fallan de golpe: se vuelven frágiles de a poco, hasta que un día el costo de seguir igual es mayor que el de cambiar.`,
  },
  {
    slug: "ia-en-procesos-reales",
    category: "ia-aplicada",
    title: "IA en procesos reales: dónde sí, dónde no y dónde todavía no",
    excerpt:
      "La inteligencia artificial sirve mucho para algunas tareas y muy poco para otras. Una guía práctica para decidir sin dejarse llevar por la moda.",
    readingMinutes: 7,
    seoTitle: "IA en procesos reales: dónde sí y dónde no",
    seoDescription:
      "Guía práctica para decidir dónde usar IA en una empresa: sirve para lenguaje, clasificación y borradores; no para cálculos exactos ni reglas que ya conocés.",
    content: `«Queremos ponerle IA» es hoy una de las frases más escuchadas en reuniones de negocio. Casi nunca viene acompañada de la pregunta que importa: ¿para resolver qué?

La inteligencia artificial, y en particular los modelos de lenguaje, son muy buenos en un tipo de trabajo y poco confiables en otro. Saber distinguirlos ahorra dinero y decepciones.

## Dónde sí: lenguaje, clasificación y borradores

Los modelos actuales son fuertes cuando la tarea consiste en leer, resumir, clasificar o redactar.

- **Atender consultas repetidas.** Preguntas sobre horarios, estados de pedido o características de un producto, respondidas con información real del negocio.
- **Clasificar lo que entra.** Separar reclamos de consultas, detectar urgencias, derivar cada mensaje al área correcta.
- **Extraer datos de documentos.** Leer una factura, una orden de compra o un catálogo en PDF y pasar sus datos a un sistema.
- **Redactar un primer borrador.** Respuestas, descripciones de productos, resúmenes de reuniones. Una persona revisa y aprueba.
- **Buscar en información propia.** Encontrar la respuesta dentro de manuales, políticas o fichas técnicas en lugar de revisar carpetas.

El patrón común: mucho texto, reglas difíciles de escribir a mano y un margen de error tolerable o una persona que valida.

## Dónde no: cálculos, reglas fijas y decisiones sin revisión

Hay tareas donde usar IA es complicar algo que ya tenía una solución mejor.

- **Cálculos exactos.** Un precio, un impuesto o un stock se calculan con código, no con un modelo que «estima». En un sistema de [cotizaciones técnicas](/proyectos/cotizaciones-tecnicas) lo resolvimos así: la IA interpreta el pedido y las fórmulas calculan.
- **Reglas que ya conocés.** Si la regla es «si pasa X, hacer Y», eso es una automatización común: más barata, más rápida y siempre igual.
- **Decisiones con consecuencias y sin supervisión.** Aprobar un crédito, despedir, diagnosticar. La IA puede asistir; no debería decidir sola.
- **Datos que no pueden salir de la empresa**, salvo que la solución esté diseñada específicamente para eso.

Una buena prueba: si podés describir la solución como una lista de pasos fijos, no necesitás IA. Necesitás un sistema.

## Dónde todavía no: cuando falta el orden previo

La IA no arregla el desorden. Lo amplifica. Antes de sumarla conviene revisar:

- **¿Los datos están ordenados?** Un asistente que responde sobre productos necesita un catálogo correcto. Si el catálogo tiene precios viejos, las respuestas también.
- **¿El proceso está definido?** No se puede automatizar con IA un proceso que cada persona hace distinto.
- **¿Hay a quién derivar?** Un asistente necesita una salida clara hacia una persona cuando no sabe o no debe responder.

Muchas veces el proyecto correcto no es «poner IA», sino ordenar los datos y el proceso. La IA viene después, y funciona mucho mejor.

## Cómo se ve una implementación sensata

Las [integraciones de IA](/servicios/inteligencia-artificial) que funcionan en negocios reales suelen compartir estas características:

1. **Un alcance acotado.** Una tarea concreta, no «un asistente que haga todo».
2. **Fuentes de datos controladas.** El modelo responde con información de la empresa, no con lo que «recuerda».
3. **Límites explícitos.** Qué puede responder, qué no y cuándo pasa la conversación a una persona.
4. **Registro de lo que hace.** Para revisar, corregir y mejorar.
5. **Una forma de medir.** Cuántas consultas resuelve, cuántas deriva, dónde se equivoca.

## IA integrada, no IA por poner IA

La pregunta útil no es si una empresa debería usar inteligencia artificial. Es en qué parte de su operación hay texto, volumen y repetición suficientes como para que valga la pena, y si los datos y procesos están listos para sostenerla.

A veces la respuesta es un [asistente conectado al catálogo](/proyectos/asistente-de-ventas-con-ia) y a WhatsApp. A veces es una [automatización simple](/servicios/automatizacion) que no necesita ningún modelo. Y a veces es, primero, dejar de usar tres planillas distintas para lo mismo.

Las tres son buenas respuestas. La mala es implementar IA porque todos lo están haciendo.`,
  },
];
