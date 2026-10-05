// Caso de estudio: Apple Boss (producto propio). Contenido verificado contra el código del proyecto;
// lo que no se pudo confirmar en el repositorio no se publica. Sin seriales, IMEI, precios ni clientes.
import type { SeedProject } from "./types";

export const project: SeedProject = {
  slug: "apple-boss",
  title: "Apple Boss: una tienda por fuera, un sistema de operaciones por dentro",
  category: "sistemas-empresariales",
  services: ["sistemas-empresariales", "web-y-ecommerce", "automatizacion"],
  badge: "Producto propio",
  sector: "Comercio de tecnología",
  visual: "apple-boss",
  summary:
    "Una plataforma que conecta tienda online, inventario, ventas, reservas, cotizaciones, servicio técnico, pagos, automatizaciones y reportes en una misma operación. Laravel, React, PostgreSQL y n8n.",

  problem: `**Cuando vender es solo una parte del problema.** En un comercio de tecnología una venta nunca es un solo movimiento. El mismo acto afecta a la vez la disponibilidad en la tienda, el inventario, el estado de una unidad concreta, la ficha del cliente, el pago, una reserva que quizás existía antes, el comprobante y el seguimiento que viene después.

Cuando esos procesos viven en herramientas separadas, la información se duplica, cada consulta se hace a mano y los errores se multiplican: un equipo que figura disponible pero ya se vendió, una reserva que nadie descontó, una cotización que no coincide con lo que terminó saliendo.

Apple Boss necesitaba centralizar la operación sin perder flexibilidad: atender ventas online y, al mismo tiempo, sostener los procesos internos de un negocio que vende, repara y recibe equipos.`,

  context: `**Una operación con muchas piezas.** Apple Boss vende iPhone, Mac, otros productos Apple, accesorios y equipos de otras marcas, nuevos y seminuevos, y además ofrece servicio técnico y recibe equipos en parte de pago. Cada una de esas familias se maneja distinto: un iPhone es una unidad física con su propia historia; un cargador es un artículo del que hay varias unidades iguales; una reparación es un trabajo con cliente, equipo, diagnóstico y entrega.

El sistema contempla que un producto se trate según su categoría, variante, condición (nuevo, seminuevo, open box, reacondicionado), unidad física, disponibilidad, estado y precio. Y sobre todo eso conviven dos mundos: la experiencia pública de quien compra desde el celular y la operación interna de quien registra, cotiza, repara y cierra el día.`,

  solution: `**Una sola plataforma para conectar la operación.** Construimos una plataforma propia que conecta la experiencia pública con los procesos administrativos. Productos, publicaciones y contenido del sitio se administran desde el mismo panel donde se registran ventas, reservas, cotizaciones, servicios técnicos, pagos y reportes. Todo lee y escribe sobre la misma fuente de información.

El objetivo no fue construir un e-commerce. Fue construir el núcleo digital del negocio, y que la tienda sea una de sus caras. Cuando una unidad se vende por mostrador, desaparece de la tienda; cuando se paga un pedido online, la unidad queda marcada como vendida en el inventario; cuando una cotización se concreta, el stock ya sabe qué pasó.

> Lo que ve el cliente es la tienda. Lo que sostiene la tienda es el sistema.`,

  challenge: `**El stock no es solo un número.** En la mayoría de los sistemas el inventario es «producto X → cantidad 12». Acá eso no alcanza. Un iPhone o una Mac son unidades concretas, con número de serie, IMEI, condición de batería y un estado propio. Dos equipos del mismo modelo, capacidad y color pueden valer distinto y estar en situaciones distintas: uno disponible, otro reservado, otro en servicio.

La cadena que modelamos es producto → variante → unidad → estado → operación. Cada operación la toca de forma distinta: una venta marca la unidad como vendida y la despublica de la tienda; una reserva o un pedido online pendiente de pago la retienen para que nadie más la compre; una auditoría la busca por escaneo y registra si falta; un servicio técnico la vincula con un cliente y una reparación.

Los datos de la unidad son del comprador, no del público: la tienda nunca muestra IMEI ni serie, y recién se copian al pedido cuando el pago quedó confirmado. Para los accesorios la lógica es la contraria: una publicación por artículo, visible mientras quede al menos una unidad.`,

  architecture: `Apple Boss es un monolito modular en **Laravel** con **React** por **Inertia**: los controladores alimentan las pantallas directamente, sin una API separada por cada vista. La base es **PostgreSQL**, y todo corre en **Docker** (aplicación, worker de colas, base de datos, Node para Vite y n8n).

El recorrido es: experiencia pública → aplicación web → comercio y administración → lógica de negocio → inventario, pagos y automatización → PostgreSQL, APIs y n8n → reportes.

Decisiones que importan:

- La lógica de negocio vive en clases de soporte explícitas (creación de pedidos, confirmación de pago, retención de stock, entrega, condición de inventario, garantía) y no repartida en controladores. Son testeables y se leen como reglas.
- Ventas, reservas y auditorías corren en transacciones con bloqueo de filas: dos personas no pueden vender la misma unidad.
- Del navegador solo se acepta qué producto y cuántos; precio, disponibilidad y costo de envío los resuelve el servidor.
- Las APIs JSON existen solo donde hacen falta: búsqueda y carrito públicos, consulta de stock, catálogo v1 documentado con OpenAPI, y endpoints protegidos por token para las automatizaciones.
- Las tareas pesadas (PDF de auditoría, envío de newsletters, correos de estado de pedido) salen por cola.
- Generación de PDF del lado del servidor para comprobantes, cotizaciones, auditorías y reportes; Google Drive para compartir una cotización por enlace.`,

  sections: `## Dos capas, un mismo sistema

### Experiencia pública

La tienda tiene un inicio armado por secciones administrables, catálogo con filtros por categoría, condición y precio, búsqueda, páginas de familia (iPhone, Mac, seminuevos) y fichas de producto con galería de imágenes, variantes, especificaciones, disponibilidad y productos compatibles. Las fichas de iPhone, Mac y accesorios se completan desde una base de fichas técnicas por modelo.

Hay comparadores públicos por familia de producto cuyo precio y stock calcula el servidor desde el inventario, colecciones, promociones con precio promocional y etiquetas, novedades, formulario de trade-in, formulario de servicio técnico, reseñas, newsletter, cuenta de cliente (con ingreso por Google) y seguimiento de pedidos. El SEO es técnico y administrable: slugs, metadatos por página, datos estructurados, sitemap y robots.

### Operación interna

El panel reúne un resumen con avisos, inventario de celulares, computadoras, productos Apple y productos generales, auditorías por escaneo, ventas con comprobante, pedidos de la tienda, reservas, cotizaciones, servicio técnico con técnicos, egresos, clientes, reportes, exportaciones, notificaciones, usuarios y roles. El vendedor tiene su propio panel («Mi día») con sus ventas, su meta mensual y sin costos ni ganancias a la vista.

La tienda online se administra desde el mismo lugar: publicaciones e imágenes, categorías, colecciones, compatibilidades, constructor del inicio, menús, páginas, preguntas frecuentes, servicios, ubicaciones, reseñas, novedades, newsletter, SEO y configuración comercial.

## Un e-commerce conectado a la operación

La tienda no es una plataforma de terceros con el inventario sincronizado por detrás. Es una capa del mismo sistema. Publicar un producto en la tienda parte del inventario: para equipos, una publicación por unidad; para accesorios, una por artículo. La condición nunca se inventa (es la que tiene cargada el inventario) y nunca se copian costo, procedencia, IMEI ni serie.

El carrito vive en el navegador, pero cada vez que importa el servidor lo vuelve a validar contra precio, publicación y disponibilidad. El checkout crea un pedido con código, retiene las unidades mientras el pago está pendiente y las libera solas si el plazo vence. Entrega en tienda, delivery local o envío a otro departamento salen de la configuración, con costo y plazo calculados en el servidor.

El cliente sigue su pedido con un enlace privado o con el código más el correo de compra: nunca se adivina por código solo. Cada cambio de estado (pago reportado, pago confirmado, preparando, enviado, entregado) queda en una línea de tiempo visible para el cliente y en el panel.

## Pagos e integraciones

El checkout se conecta con diferentes alternativas de pago utilizadas por el negocio, incluyendo integraciones bancarias y servicios digitales, además de transferencia con comprobante y pago al retirar en tienda. Cada medio se activa solo si está configurado; si no hay forma de cobrar a distancia, el envío a domicilio no se ofrece.

Proveedores integrados hoy: QR del Banco Nacional de Bolivia, Libélula y Binance Pay.

El flujo es el mismo para todos: checkout → solicitud de pago → proveedor → validación → confirmación → actualización de la operación. La decisión de diseño más importante está en la validación: el aviso de un proveedor (un retorno al sitio o un webhook) nunca confirma un pedido por sí solo. El sistema vuelve a consultar al proveedor por el estado real de la transacción y compara el monto antes de marcar el pago. Si mañana un aviso llegara falsificado o con un error sutil de firma, nadie se lleva un equipo gratis.

Para cobrar en cripto el precio en bolivianos se convierte con un tipo de cambio consultado y cacheado; si no hay tipo de cambio confiable, el medio no se ofrece en vez de inventar una tasa. Cuando el pago es manual (transferencia, comprobante), queda «en revisión» hasta que alguien del panel lo confirma. La confirmación es idempotente: confirmar dos veces no vende dos veces.

## Cuando el sistema termina el trabajo solo

Alrededor de la operación corre **n8n**, en el mismo Docker que la aplicación, con dos flujos hoy:

- **Reporte semanal inteligente.** Cada lunes a la mañana n8n calcula el período anterior, pide los datos comerciales a un endpoint protegido de Laravel, arma el prompt, llama a un modelo de OpenAI para redactar el resumen y guarda el reporte de vuelta en Laravel, que lo publica en el panel con un aviso.
- **Backup diario.** Todas las noches se genera un respaldo de PostgreSQL.

El patrón es siempre el mismo:

1. Un evento o un horario dispara el flujo.
2. El sistema expone los datos por una API con token propio y límite de solicitudes.
3. n8n los procesa y los pasa al servicio que corresponda (IA, comando, API).
4. El resultado vuelve al sistema y aparece donde la gente ya trabaja.

Los tokens de automatización son distintos del token de exportación financiera, se pueden rotar sin cortar n8n y, si no están configurados, el endpoint rechaza todo.

## Datos que terminan en decisiones

El panel tiene reportes de ventas por día, semana, mes y año con exportación a PDF, reportes de servicio técnico filtrados y resumidos, exportaciones de inventario por familia y tipo, y un dashboard con gráficos propios en SVG. El vendedor ve lo suyo; el administrador ve costo, ganancia y procedencia.

El reporte semanal generado por n8n se guarda como contenido estructurado, con versión de motor y de prompt, y queda marcado como visto por cada usuario que lo abre. La IA redacta e interpreta un resumen sobre cifras que calculó el sistema; no decide nada ni toca datos. Si un número está mal, el error está en la consulta, no en el modelo, y por eso la fuente de verdad sigue siendo la base.

## No todos necesitan ver ni hacer lo mismo

El acceso interno exige autenticación por sesión, con recuperación de contraseña, límites de intentos y política de contraseña fuerte. El registro público está cerrado: las cuentas del panel las crea un administrador.

Los roles son administrables. El sistema trae **Administrador** (todo, no se le puede quitar) y **Vendedor**, y permite crear otros asignando módulos del panel: ventas, pedidos, reservas, servicio técnico, cotizaciones, egresos, reportes, clientes, inventario, auditoría, tienda online, marketing, exportaciones, usuarios. El mismo mapa de permisos arma el menú y corta el acceso en el servidor: lo que no se ve tampoco se puede abrir por URL.

Hay reglas que van más allá del módulo: el vendedor nunca recibe costo, ganancia ni procedencia (se quitan en el servidor, no en la pantalla). Las páginas públicas proyectan únicamente campos permitidos, y hay pruebas que verifican que IMEI, serie y costo no se filtren. Cabeceras de seguridad, CSRF, saneado del contenido enriquecido y límites de tamaño y tipo en los uploads completan el cuadro.

## La relación no termina en la venta

El servicio técnico empieza antes de que el equipo llegue: desde el sitio el cliente pide una revisión indicando el tipo de equipo (iPhone, iPad, Mac, Apple Watch, AirPods, Android u otro) y el problema. La solicitud aparece en el panel con un aviso.

Cuando el equipo entra a la tienda se registra la orden con cliente, equipo, marca, técnico asignado y una **recepción punto por punto**: qué funcionaba y qué no al momento de dejarlo, más el código de desbloqueo. Ningún punto viene marcado por defecto, porque una nota que dice «todo funcionaba» sin que nadie lo probó no defiende a nadie. Esa recepción sale impresa en la nota que firman cliente y tienda.

La orden lleva detalle del trabajo, notas, precio, costo (que el vendedor puede dejar pendiente para que lo cargue el administrador) y puede vincularse a una venta. Cada cliente conserva su historial de reparaciones.

## Cotizaciones y reservas

Una **cotización** es una propuesta armada con productos del inventario o servicios, cantidades, descuento y notas, con un snapshot del cliente para que el histórico no cambie si el cliente cambia. Se exporta a PDF, se envía por correo con el PDF adjunto, se puede publicar en Google Drive para compartir por enlace y se prepara para WhatsApp, individual o en lote. Queda registrado por qué canal se envió.

Una **reserva** separa disponibilidad antes de concretar la venta: unidades concretas, monto de seña, términos y estado. Mientras está activa, el equipo no se le vende a nadie más; al convertirse en venta se enlaza con ella. El mismo principio aplica a los pedidos online pendientes de pago. Y para equipos que el cliente quiere entregar en parte de pago, el **trade-in** recibe un cuestionario por tipo de equipo, marca los puntos críticos, sugiere un grado y se sigue por etapas en el panel.

## Del sistema al documento

Cada operación deja un documento listo para imprimir o compartir, generado por el servidor desde los mismos datos:

- Comprobantes de venta y de reserva en formato carta y en 80 mm para impresora térmica.
- Nota de servicio técnico con la recepción del equipo, y recibo en 80 mm.
- Cotizaciones en PDF, con la misma estructura que se ve en el formulario y en la tabla de revisión.
- Comprobante del pedido online.
- Reporte de auditoría de inventario, generado en segundo plano al cerrar la auditoría.
- Reportes de ventas, egresos, servicios y exportaciones de inventario.

La regla es una sola: lo que dice el documento es lo que dice la base en ese momento.`,

  features: [
    "Catálogo público con categorías, colecciones, compatibilidades y comparadores",
    "Inventario con control por unidad (serie e IMEI) y auditorías por escaneo",
    "Ventas, reservas y cotizaciones con PDF",
    "Pedidos online con checkout, retención de stock y seguimiento privado",
    "Checkout con pagos integrados: bancarios, digitales y en tienda",
    "Servicio técnico con recepción punto por punto y seguimiento",
    "Trade-in con cuestionario por tipo de equipo",
    "Usuarios y roles con permisos por módulo",
    "Reportes semanales automatizados con n8n e IA",
    "CMS del sitio público: inicio, páginas, menús, FAQ y SEO",
    "Newsletter con campañas y suscriptores",
    "Backups diarios automatizados",
  ],

  stack: ["Laravel", "PHP", "React", "JavaScript", "Inertia", "PostgreSQL", "Docker", "n8n", "REST APIs", "Webhooks", "Vite", "OpenAI"],

  result: `**De herramientas separadas a una operación conectada.** Tienda, inventario, ventas, reservas, servicio técnico y pagos comparten una misma base y las mismas reglas.

**Antes.** Una venta por mostrador o una reserva obligaban a actualizar varias herramientas, y mientras tanto la tienda podía seguir ofreciendo un equipo que ya no estaba.

**Después.** Lo vendido por mostrador desaparece de la tienda, lo pagado online queda vendido en el inventario y lo reservado no se le vende a nadie más.

- Centralización: tienda, inventario, ventas, reservas, servicio técnico y pagos en un mismo panel.
- Trazabilidad: cada unidad tiene su historia (disponible, reservada, vendida, en servicio) y cada pedido online, su línea de tiempo.
- Control de accesos: roles por módulo; el vendedor nunca ve costo, ganancia ni procedencia.
- Capacidad de incorporar nuevos módulos: trade-in, solicitudes de servicio y newsletter se sumaron después sobre el mismo inventario.

> Una tienda puede vender productos. Una plataforma puede ayudar a operar el negocio.`,

  resultsMetrics: [],

  ctaTitle: "No necesitás copiar Apple Boss. Necesitás un sistema para tu proceso.",
  ctaLead:
    "¿Tu negocio también creció más rápido que sus herramientas? Cada operación es distinta. Contanos cómo trabajan hoy y analizamos qué vale la pena centralizar, automatizar o integrar.",

  seoTitle: "Apple Boss: e-commerce conectado al inventario",
  seoDescription:
    "Caso de estudio: tienda online, inventario por unidad, ventas, reservas, servicio técnico y pagos de un comercio de tecnología en una sola plataforma.",
  year: null,
  featured: true,
};
