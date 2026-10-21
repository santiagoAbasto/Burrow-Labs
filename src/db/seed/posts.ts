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
  {
    slug: "cuanto-cuesta-un-sistema-a-medida-en-bolivia",
    category: "software-empresarial",
    title: "Cuánto cuesta un sistema a medida en Bolivia",
    excerpt:
      "Qué define el precio de un software a medida, qué tramos existen y cómo pedir una cotización que se pueda comparar. Con nuestros precios base publicados.",
    readingMinutes: 8,
    publishedAt: "2026-10-12T06:00:00.000Z",
    seoTitle: "Cuánto cuesta un sistema a medida en Bolivia",
    seoDescription:
      "Qué define el precio de un software a medida en Bolivia: módulos, usuarios, integraciones y reglas. Tramos reales, precios base publicados y cómo pedir una cotización comparable.",
    content: `Si pediste cotizaciones para un sistema a medida, ya conocés la escena: tres proveedores, tres números muy distintos y ninguna forma clara de compararlos. Uno cotiza por hora, otro da un total cerrado y el tercero pide una reunión más antes de decir nada.

El problema no es que oculten el precio. Es que «un sistema a medida» no es un producto: es un rango enorme que va desde una planilla ordenada con un formulario hasta una plataforma que sostiene toda la operación de una empresa. Sin acotar el alcance, cualquier número es inventado.

Esta nota explica qué mueve realmente el precio, qué tramos existen y cómo pedir una cotización que puedas comparar con otra.

## Por qué casi nadie publica precios

Hay dos razones, y solo una es buena.

La buena: el precio depende del alcance, y el alcance no se conoce hasta entender el proceso. Dar un número antes de eso es adivinar.

La mala: publicar precios obliga a sostenerlos. Es más cómodo cotizar cada caso desde cero y ajustar según quién pregunta.

Nosotros elegimos publicar [precios base](/planes). No son presupuestos cerrados: son el piso de cada tipo de trabajo, para que sepas en qué orden de magnitud estás antes de la primera reunión. El alcance final se confirma por escrito antes de empezar.

## Qué define el precio, en orden de peso

### 1. Cuántos procesos toca

Un sistema que resuelve una sola cosa —tomar pedidos, controlar inventario, armar cotizaciones— es un proyecto acotado. Uno que conecta ventas con stock, con facturación y con reportes es otro animal, porque cada conexión agrega reglas y casos borde.

La pregunta útil no es «¿cuántas pantallas tiene?» sino «¿cuántos procesos distintos cambian si esto existe?».

### 2. Cuántas reglas tiene el proceso

Acá está la mayor parte del costo real, y casi nunca se ve en la primera conversación.

Un catálogo donde todos los clientes ven el mismo precio es simple. Un catálogo con precios por cliente, descuentos por volumen, listas que vencen y autorizaciones por monto es otra cosa, aunque la pantalla se vea igual. Lo mismo pasa con permisos, estados y excepciones: «todos menos los lunes», «salvo que el cliente sea antiguo», «si lo aprueba el gerente».

Esas reglas existen aunque nadie las haya escrito. Buena parte del trabajo de un proyecto serio es sacarlas a la luz antes de programar.

### 3. Con qué se tiene que conectar

Un sistema aislado cuesta menos que uno que se habla con lo que ya usás. Cada integración —un ERP, una pasarela de pago, WhatsApp, una planilla compartida— suma trabajo de desarrollo y, sobre todo, trabajo de manejar los errores: qué pasa cuando el otro sistema no responde, o responde distinto a lo esperado.

Las [integraciones y automatizaciones](/servicios/automatizacion) son de lo que más valor devuelve, pero hay que presupuestarlas aparte, no darlas por incluidas.

### 4. Cuánta información vieja hay que mudar

Migrar datos de planillas es trabajo real y casi siempre se subestima. Si hay cinco años de información en Excel, con columnas que cambiaron de significado y fechas en tres formatos, eso es una etapa del proyecto, no un detalle del final.

### 5. Cuántas personas lo van a usar, y con qué permisos

Dos usuarios que confían entre sí no necesitan control de accesos. Quince personas en cuatro roles, con cosas que unos pueden aprobar y otros no, sí. Los permisos son baratos de pedir y caros de agregar después.

## Los tramos, en la práctica

Los nombres y los números de abajo son los nuestros, pero los tramos se repiten en el mercado.

**Presencia web.** Una página que presenta el negocio y recibe contactos, o un sitio administrable donde vos cambiás textos e imágenes. Es el tramo más predecible porque el alcance se cierra rápido. Nuestros [planes web](/planes) empiezan desde USD 85.

**Automatización puntual.** Un proceso repetitivo que deja de hacerse a mano: cargar datos, avisar, generar el mismo reporte todas las semanas. Se mide en días, no en meses, y suele pagarse solo si la tarea es frecuente. Desde USD 450.

**Sistema para un área.** Una aplicación a medida para ventas, inventario, clientes u operaciones, con usuarios, permisos y reportes. Acá empieza el software de verdad: hay base de datos propia, reglas del negocio y migración de lo que ya existe. Desde USD 900.

**Plataforma conectada.** Varios módulos sobre una misma base, integraciones con sistemas externos y, donde aporte, IA aplicada. Se construye por fases, nunca de una sola vez. Desde USD 1.500, y el número final depende enteramente del alcance.

Si tu proyecto está entre dos tramos, la respuesta honesta suele ser empezar por el de abajo y crecer. Es más barato equivocarse en una etapa chica.

## Lo que no deberías estar pagando

**Un sistema completo antes de haber usado nada.** Preferimos entregar bloques funcionales que puedas probar desde el principio. Si el primer entregable llega a los cuatro meses, nadie sabe si va bien hasta que es tarde.

**Funciones que pediste por las dudas.** La mitad de las pantallas de un sistema sobredimensionado nunca se abren. Cada una costó.

**Licencias que no entendés.** Preguntá de quién es el código, dónde viven los datos y qué pasa si dejás de trabajar con el proveedor. Si la respuesta es confusa, es cara.

**La reunión número seis sin nada escrito.** Si después de varias conversaciones no hay un documento con alcance, plazo y precio, no hay proyecto: hay charla.

## Cómo pedir una cotización que se pueda comparar

Mandá siempre lo mismo a todos los proveedores:

1. **Qué proceso querés resolver**, descrito como pasa hoy, con nombres de puestos y no de personas.
2. **Quiénes lo usan** y qué puede hacer cada uno.
3. **Con qué sistemas tiene que hablar**, si hay alguno.
4. **Qué datos viejos hay que traer** y en qué formato están.
5. **Qué pasa si falla**: cuánto duele un error y cuánto se puede esperar.

Con eso, dos cotizaciones ya son comparables. Sin eso, cada proveedor imagina un proyecto distinto y los números no significan nada.

Pedí también que te separen el precio por etapas. Un total único de cinco cifras no dice nada; el mismo total partido en relevamiento, primer módulo, integraciones y migración sí.

## Antes de cotizar: ¿cuánto te cuesta no hacerlo?

Un sistema compite contra seguir como estás, y esa opción también tiene precio: horas de gente haciendo a mano lo que una máquina haría igual, errores que se arreglan después, decisiones tomadas con datos de la semana pasada.

Antes de pedir presupuestos, poné un número a eso. Nuestra [calculadora de procesos manuales](/calculadora) estima cuántas horas y cuánto dinero por año te cuesta una tarea que se repite todas las semanas. Si el resultado es menor al precio del sistema, la respuesta es esperar, y está bien.

Si no sabés en qué tramo cae lo tuyo, el [diagnóstico express](/diagnostico) son cinco preguntas y te orienta por dónde empezar: una web, una automatización, una integración o un [sistema a medida](/servicios/sistemas-empresariales).

Y si ya lo tenés claro, [contanos cómo funciona hoy tu proceso](/contacto). Te respondemos con alcance, plazo y precio por escrito.`,
  },
  {
    slug: "empresas-de-desarrollo-de-software-en-bolivia",
    category: "software-empresarial",
    title: "Empresas de desarrollo de software en Bolivia: quién hace qué",
    excerpt:
      "Un mapa de empresas de software de Cochabamba, Santa Cruz y La Paz, revisado empresa por empresa: qué hace cada una, desde dónde trabaja y cómo elegir según lo que necesitás.",
    readingMinutes: 5,
    publishedAt: "2026-10-21T12:00:00.000Z",
    seoTitle: "Empresas de desarrollo de software en Bolivia",
    seoDescription:
      "Empresas de software en Bolivia revisadas una por una: Cochabamba, Santa Cruz y La Paz. Qué hace cada una, desde dónde trabaja y cómo elegir proveedor.",
    content: `Si buscás una empresa de software en Bolivia, los listados que aparecen primero mezclan de todo: agencias de marketing, revendedores de licencias, empresas extranjeras con nombre parecido a una local y páginas que cambian solo el nombre de la ciudad. Armamos este mapa para ordenar eso.

No es un ranking. No decimos quién es mejor: decimos qué hace cada empresa y desde dónde trabaja, para que sepas a quién conviene llamar según lo que necesitás.

Una aclaración antes de empezar: nosotros también somos una empresa de software de Bolivia. Aparecemos al final, separados del resto.

## Cómo armamos la lista

- **Solo entra una empresa si su propio sitio dice qué hace y desde qué ciudad trabaja.** Lo revisamos sitio por sitio el 21 de octubre de 2026.
- **Lo que cada empresa dice de sí misma lo citamos como tal.** No verificamos sus clientes ni sus cifras, así que cuando aparece un número, es el que publica la empresa.
- **Quedaron afuera** los sitios que no responden, las empresas que solo existen en redes sociales, las páginas que repiten el mismo texto cambiando la ciudad y varias empresas de Estados Unidos y Europa que los directorios presentan como bolivianas.
- **Si tu empresa falta o un dato cambió**, [escribinos](/contacto) y lo corregimos.

## Empresas que trabajan para el exterior

Buena parte de las empresas bolivianas que venden desarrollo de software a otros países nacieron en Cochabamba. Trabajan sobre todo con empresas de Estados Unidos, con equipos que se suman al de su cliente.

- **[Jalasoft](https://www.jalasoft.com)**, Cochabamba. Equipos de desarrollo para empresas de Estados Unidos. Según su sitio, lleva 25 años.
- **[AssureSoft](https://www.assuresoft.com)**, nacida en Cochabamba. Equipos de ingeniería de software para empresas de Estados Unidos, con oficinas en Cochabamba, Santa Cruz y La Paz, además de otras fuera del país.

## Software de gestión y transformación digital

Empresas con productos propios o líneas de servicio amplias, más cerca de implementar una solución que de escribir una desde cero.

- **[TI Software](https://www.tisoft-srl.com)**, casa matriz en Cochabamba. Un ERP para el control administrativo y contable: inventarios, ventas, compras, facturación y estados financieros.
- **[Intersoft](https://www.intersoft.com.bo)**, Cochabamba. Transformación digital: firma digital, robotización, inteligencia de negocios, ciberseguridad, contact center y soluciones financieras. Según su sitio, tiene más de 20 años de experiencia.
- **[Grupo EBIM](https://grupoebim.com/bo/software-factory/)**, con oficinas en Santa Cruz y La Paz, y también en Lima y Guayaquil. Software a medida y consultoría SAP.

## Desarrollo a medida: sistemas, web y apps

Es el grupo más numeroso: estudios y fábricas de software que construyen sistemas, sitios y aplicaciones para la operación de cada cliente.

**Cochabamba**

- **[Altalos](https://altalos.com)**. Software, páginas web, tiendas en línea, aplicaciones móviles y de escritorio, además de marketing digital y soporte técnico.
- **[SpiderLabs Systems](https://spiderlabs.netlify.app)**. Sistemas de ventas e inventario, páginas web y aplicaciones empresariales.
- **[SYSBOL](https://sysbol.com.bo)**. Páginas web, sistemas y soluciones digitales para empresas.

**Santa Cruz**

- **[Orange Group](https://orangegroup.com.bo)**. Sistemas web a medida, páginas web y aplicaciones móviles, además de productos propios como un ERP y una pasarela de pago. Según su sitio, tiene más de 13 años.
- **[IQUS](https://www.iqus.com.bo)**. Fábrica de software: sistemas web y aplicaciones móviles a medida.
- **[La Sierra Tech](https://www.lasierratech.com/es)**. Desarrollo web, aplicaciones móviles, automatización con inteligencia artificial y consultoría.
- **[Smart Coding](https://smartcoding.cc)**. Software a medida, sitios y aplicaciones web y móviles, y sistemas ERP, CRM y de punto de venta.
- **[Syncra](https://syncra-team.com)**. Con sede en Santa Cruz y trabajo remoto: software a medida, integraciones por API y automatización.

**La Paz**

- **[ETV Consulting](https://etvholding.com)**. Constituida en La Paz en 2010, hoy se dedica por completo al desarrollo de software: aplicaciones web, plataformas por suscripción e integraciones con inteligencia artificial.
- **[InfinitySoft Bolivia](https://infinitysoftwarebolivia.com)**. Nació en La Paz: software empresarial a medida, aplicaciones web y móviles con inteligencia artificial, para empresas medianas de todo el país.

## Cómo elegir, sin importar la ciudad

La ciudad pesa menos de lo que parece. Casi todas estas empresas trabajan en remoto con clientes de otras ciudades, y varias con clientes de otros países. Lo que cambia el resultado es otra cosa.

### 1. Sabé qué tipo de proveedor necesitás

No es lo mismo sumar programadores a tu producto, implementar un sistema que ya existe o construir uno para tu operación. Las empresas de la primera sección hacen lo primero, las de la segunda lo segundo y las de la tercera lo tercero. Pedirle a una lo que hace otra es la forma más rápida de pagar de más.

### 2. Pedí ver algo funcionando

Una presentación no muestra cómo trabaja un equipo. Un sistema en uso, aunque sea de otro cliente y con datos de prueba, sí.

### 3. Pedí la cotización por alcance

Una cotización comparable dice qué incluye, qué no, en qué plazo y con qué entregas. Escribimos una guía con los tramos reales: [cuánto cuesta un sistema a medida en Bolivia](/lab/cuanto-cuesta-un-sistema-a-medida-en-bolivia).

### 4. Dejá por escrito de quién es el código

Quién es dueño del código, del dominio y del servidor tiene que estar en el contrato antes de empezar, no descubrirse al final.

### 5. Preguntá qué pasa después de entregar

Soporte, cambios y mantenimiento. Un sistema que nadie mantiene empieza a fallar justo cuando la empresa más depende de él.

## Si contratás desde otro país

Bolivia usa la misma hora todo el año, UTC−4: coincide con la costa este de Estados Unidos durante su horario de verano y va una hora adelante en invierno. Para un equipo de América, eso significa trabajar en el mismo horario.

Antes de empezar, preguntá en qué moneda cobra la empresa, cómo factura y qué medio de pago acepta desde tu país. Cada empresa lo resuelve distinto.

## Y nosotros

Burrow Labs es un software studio de Bolivia con base en Cochabamba. Construimos [sistemas empresariales](/servicios/sistemas-empresariales), [automatizaciones e integraciones](/servicios/automatizacion), [IA aplicada](/servicios/inteligencia-artificial), [plataformas web](/servicios/web-y-ecommerce) y [aplicaciones móviles](/servicios/aplicaciones-moviles) para empresas de toda Bolivia y del exterior, y recibimos pagos desde cualquier país. Nuestros [precios base](/planes) están publicados.

Si después de leer esto alguna de las otras empresas encaja mejor con lo que necesitás, también está bien: elegí por el proceso, no por la lista. Y si querés que lo veamos juntos, [contanos qué querés resolver](/contacto).`,
  },
];
