-- Caso nuevo: Summer’s Style, cliente nombrado a pedido del dueño (09/11/2026; su sitio ya dice «Desarrollado por Burrow Labs»),
-- con 5 capturas 4K de su sitio en producción. El texto sale de src/db/seed/projects/summers-style.ts. Si algo ya existe
-- (creado en el panel o por el seed), no se toca: todo va con ON CONFLICT DO NOTHING o condicionado a que falte.
INSERT INTO "clients" ("slug", "name", "sector", "website", "authorized", "status", "published_at", "sort")
VALUES ($c$summers-style$c$, $c$Summer’s Style$c$, $c$Barbería y belleza$c$, $c$https://summersstyles.com.bo$c$, true, 'published', now(), 20)
ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint
INSERT INTO "projects" ("slug", "title", "summary", "website", "category_id", "client_id", "client_public", "problem", "context",
  "solution", "challenge", "architecture", "sections", "result", "features", "stack", "results_metrics", "badge", "sector", "visual",
  "cta_title", "cta_lead", "year", "featured", "sort", "status", "published_at", "seo_title", "seo_description", "og_image")
SELECT $c$summers-style$c$, $c$Summer’s Style: reservas en línea y un panel para todo el salón$c$, $c$Web y sistema de gestión de Summer’s Style, barbería y salón de belleza de Cochabamba: catálogo, reservas con horarios reales, agenda, clientes, caja y contenido editable. Laravel, React y MySQL.$c$, $c$https://summersstyles.com.bo$c$, (SELECT "id" FROM "project_categories" WHERE "slug" = $c$web$c$),
  (SELECT "id" FROM "clients" WHERE "slug" = $c$summers-style$c$), true,
  $c$**Un turno parece simple hasta que hay que darlo bien.** En un salón de barbería y belleza, dar una cita toca muchas cosas a la vez: qué servicio es, cuánto dura de verdad, quién lo hace, si esa persona trabaja ese día, si hay un puesto libre y si alguien más está pidiendo el mismo horario en ese momento.

Cuando todo eso se resuelve de memoria o en un chat, el error aparece en el peor lugar: dos clientes a la misma hora, un servicio largo metido en un hueco corto o un precio que no coincide con lo que se cobró al final.

Summer’s Style necesitaba una web que muestre el salón y deje reservar sin llamar, y un sistema interno que sostenga esa promesa: agenda, clientes y caja sobre las mismas reglas.$c$,
  $c$**Un salón para todo público, con servicios muy distintos.** Summer’s Style es una barbería y salón de belleza en Calacala, Cochabamba, para mujeres, hombres y niños. Su catálogo tiene 21 servicios en cinco categorías: cortes y barbería, coloración, ondulaciones, tratamientos capilares y uñas. Una barba dura 30 minutos; un soft gel con diseño, dos horas y media. Algunos precios son fijos y otros son «desde», porque dependen de una evaluación en el salón.

Sobre eso conviven dos mundos: quien busca el salón en Google y reserva desde el celular, y el equipo que recibe, atiende, cobra y cierra el día. Y uno más: el dueño, que quiere cambiar un texto, una foto o el número de WhatsApp sin depender de un programador.$c$,
  $c$**Una sola aplicación con tres caras.** Construimos la web pública del salón y el panel con el que el equipo maneja agenda, clientes, caja y contenido, sobre una misma base y las mismas reglas.

- **Para el cliente:** catálogo con filtros Hombres / Mujeres y buscador, reserva en tres pasos con horarios realmente libres, sin pagar ni crear cuenta, y un enlace privado para cambiar o cancelar.
- **Para el equipo:** agenda del día con estados de atención, fichas de clientes con sus consentimientos, caja con cobros, propinas y cierre, y reportes de ingresos y ocupación.
- **Para el dueño:** cada página, foto, texto, botón de WhatsApp y dato de SEO se edita desde el panel, sin tocar código.

> El cliente ve un salón. El equipo ve su día. El dueño ve su negocio.$c$,
  $c$**Que dos personas no reserven el mismo horario.** La reserva es la promesa más delicada del sistema: un horario que la web muestra libre tiene que estar libre de verdad cuando el cliente confirma. El motor de disponibilidad calcula los huecos en el servidor con las jornadas, los descansos, las excepciones, las citas, las retenciones y los recursos compartidos de cada sucursal, sumando el tiempo de preparación y de limpieza de cada servicio.

Al confirmar, la cita se guarda dentro de una transacción con bloqueos en un orden fijo (sucursal, profesional, recursos) y se vuelve a validar todo. Si dos personas eligen el mismo horario, una lo obtiene y a la otra se le pide elegir otro. Cada reserva lleva una clave de idempotencia: si la conexión falla y el navegador reintenta, la cita no se duplica.

Las horas se guardan en UTC y se muestran en la hora de la sucursal. Reprogramar es atómico y conserva el precio y la duración con que se reservó; cancelar libera el horario, pero nunca devuelve dinero por sí solo.$c$,
  $c$Summer’s Style es un **monolito por dominios**: **Laravel 13** resuelve rutas, permisos y reglas, y **React 19** presenta la web y el panel con **Inertia**, sin una API aparte ni microservicios. La base es **MySQL 8.4**.

El recorrido es: visitante → Cloudflare (DNS, proxy y Turnstile) → Caddy con HTTPS → Nginx → Laravel → MySQL y archivos, con un scheduler aparte para las tareas programadas.

Decisiones que importan:

- Cada área del negocio es un dominio con sus propias reglas: agenda, contenido y SEO, clientes, caja, identidad, notificaciones, reportes y analítica.
- Todo corre en Docker Compose con usuario, base, volúmenes y redes propios; lo único compartido con otros sitios del servidor es el proxy.
- El dinero se guarda en centavos enteros: Bs. 60 es 6000, y nunca se calcula con decimales flotantes.
- Los permisos se verifican en el servidor: la interfaz no es la frontera de seguridad.
- Cada versión se despliega con un respaldo previo y vuelve sola a la anterior si la web no responde sana. La base y sus datos no se tocan.$c$,
  $c$## La reserva, paso a paso

El cliente elige el servicio, el día y la hora, y deja sus datos. No paga ni crea una cuenta. Mientras completa el formulario, el horario queda retenido cinco minutos; si no confirma, la retención vence sola y el horario vuelve a estar libre, sin depender de una limpieza programada.

Al confirmar recibe un código de cita y un enlace privado para reprogramar o cancelar. Ese enlace sirve para una sola cita, vence y se puede revocar, y en la base se guarda solo su huella, nunca el enlace. Quien quiera puede abrir una cuenta, pero coincidir en el teléfono no alcanza para ver un historial: la cuenta se vincula con una verificación.

Si el cliente elige «cualquiera disponible», el sistema asigna un profesional concreto y lo vuelve a validar en el servidor. Cada cita guarda una copia del servicio tal como se reservó, para que un cambio de precio posterior no altere lo acordado.

## Un panel para el día del salón

La agenda muestra el día, la semana o un profesional, con los estados de cada cita: confirmada, cliente llegó, en atención, completada, cancelada o no asistió. El servidor controla qué cambio de estado es válido, y la atención y el pago van por separado.

Cada cliente tiene su historial, notas privadas cifradas y consentimientos independientes para comunicaciones y fotos. La ficha incluye una asesoría de imagen para el equipo, con referencias de rostro, perfil y cabello. El análisis automático con IA solo corre si el cliente lo autorizó y queda registrado; sus fotos necesitan otra autorización y se borran al revocarla. Sin la clave del modelo configurada, el sistema no simula ningún análisis.

## Caja sin sorpresas

Hay una caja abierta por sucursal, con apertura, cobros parciales y mixtos, señas, propinas separadas y descuentos que exigen un permiso específico. El cierre compara el efectivo esperado con el contado y deja la diferencia a la vista.

El sistema distingue el precio estimado, el acordado, el valor reservado y el dinero cobrado. Un precio «desde» necesita acuerdo antes de cobrarse. Nada se borra: una corrección es un reverso o una devolución que deja el movimiento original. Cada cobro emite un comprobante interno, que no reemplaza a la factura.

## Contenido que edita el dueño

Un solo esquema describe cada campo editable: el formulario del panel, la validación y la página pública salen del mismo lugar. Un campo vacío vuelve al texto original, no acepta HTML y los enlaces se validan antes de guardarse.

Desde el panel se cambian los textos y las fotos de cada página, los fondos, las promociones, el número de WhatsApp con su mensaje y el botón flotante, y el SEO de cada página, servicio, categoría y producto. La biblioteca de imágenes trae una guía de medidas y pesos, y las fotos subidas se recodifican a WebP. Las políticas legales quedan bloqueadas hasta completar sus datos.

Los precios y las duraciones no se editan en el contenido: salen del módulo Servicios, el mismo que usa la reserva. Lo que dice la web es lo que se reserva y lo que se cobra.

## Encontrable en Google y en las IA

El salón es un negocio local, y la web está hecha para que lo encuentren:

- Datos estructurados del negocio como barbería, salón de belleza y salón de uñas, con cada servicio, su oferta y su público, las preguntas frecuentes y las migas de pan.
- Una página por servicio y por categoría, con título y descripción propios, y un sitemap con imágenes.
- El contenido principal (servicios con precio, preguntas, dirección y teléfono) se lee sin ejecutar JavaScript, y hay un /llms.txt con el catálogo para los asistentes de IA.
- Indexado en Google Search Console y Bing, con analítica propia sin cookies que mide visitas y el embudo de reserva. Los enlaces y códigos QR de campaña atribuyen cada reserva a su origen.

## «Cómo llegar» en 3D

La página de inicio tiene un video de 40 segundos hecho con datos reales de OpenStreetMap: la ruta se calcula con OSRM y un auto recorre la Av. Melchor Urquidi, pasa la rotonda del Sombrero de Chola y llega a la puerta del salón. La escena está hecha en Three.js y se renderiza a 60 cuadros por segundo; la línea de la ruta es una sola cinta recortada en el shader, para que no parpadee de un cuadro a otro.

## Roles y seguridad

Hay ocho roles con permisos por sucursal: propietario, administrador, encargado, recepción, caja, profesional, editor y cliente. El panel tiene verificación en dos pasos con códigos de recuperación de un solo uso, y la cuenta del propietario está protegida contra cambios ordinarios.

Los formularios públicos (reserva, contacto, reseñas y lista de espera) pasan por Turnstile de Cloudflare y límites de solicitudes. Una reseña solo se puede dejar desde una cita completada, una por cita y con moderación antes de publicarse.$c$,
  $c$Summer’s Style está en producción en summersstyles.com.bo, indexado en Google y Bing, con la reserva, el panel y el contenido editable sobre una misma base.

**Sin un sistema.** Cada consulta de precio, horario o ubicación se responde a mano, y el turno depende de que alguien lo anote bien.

**Con la plataforma.** La web responde precio, duración, horarios y cómo llegar; la reserva se valida en el servidor; el equipo ve su día y la caja cierra con la diferencia a la vista.

- Una sola fuente: el precio y la duración que muestra la web son los que usa la reserva y los que cobra la caja.
- Trazabilidad: cada cita guarda una copia del servicio reservado y cada corrección de caja conserva el movimiento original.
- Autonomía: el dueño cambia textos, fotos, WhatsApp y SEO sin tocar código.
- Capacidad de crecer: el sistema está preparado para sumar sucursales sin rehacerlo.

> Una web puede mostrar un salón. Un sistema puede sostener su agenda.$c$,
  ARRAY[$c$Catálogo de 21 servicios con filtros por público y buscador$c$, $c$Reserva en tres pasos con horarios reales, sin cuenta ni pago$c$, $c$Enlace privado para reprogramar o cancelar la cita$c$, $c$Agenda del día con estados de atención$c$, $c$Clientes con consentimientos y asesoría de imagen$c$, $c$Caja con cobros, señas, propinas, cierre y devoluciones$c$, $c$Contenido, WhatsApp y SEO editables desde el panel$c$, $c$Ocho roles con permisos por sucursal y verificación en dos pasos$c$, $c$Analítica propia sin cookies con el embudo de reserva$c$, $c$Video «Cómo llegar» en 3D con calles de OpenStreetMap$c$]::text[],
  ARRAY[$c$Laravel$c$, $c$PHP$c$, $c$React$c$, $c$TypeScript$c$, $c$Inertia$c$, $c$Tailwind CSS$c$, $c$MySQL$c$, $c$Docker$c$, $c$Nginx$c$, $c$Cloudflare$c$, $c$Three.js$c$, $c$Playwright$c$]::text[],
  $c$[{"label":"Pruebas automatizadas","value":"210"}]$c$::jsonb, $c$$c$, $c$Barbería y salón de belleza$c$, $c$summers$c$, $c$¿Tu negocio también da turnos por WhatsApp?$c$, $c$Construimos webs con reservas y sistemas de gestión a la medida de cada negocio de servicios. Contanos cómo agendan hoy y vemos qué vale la pena automatizar.$c$,
  2026, true, 17, 'published', now(), $c$Web y reservas para barbería: Summer’s Style$c$, $c$Caso de estudio: Summer’s Style, salón de Cochabamba, con web propia, reservas con horarios reales, agenda, clientes, caja y SEO local en un solo sistema.$c$, '/og/proyectos/summers-style.png'
ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint
INSERT INTO "project_services" ("project_id", "service_id")
SELECT p."id", s."id" FROM "projects" p JOIN "services" s ON s."slug" IN ('web-y-ecommerce', 'sistemas-empresariales')
WHERE p."slug" = 'summers-style'
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "media" ("key", "filename", "mime", "size", "width", "height", "alt") VALUES
  ($c$/capturas/summers-style/inicio.webp$c$, $c$inicio.webp$c$, 'image/webp', 254274, 3840, 2400, $c$Inicio de summersstyles.com.bo: «Tu estilo. Tu momento.», con las puertas Hombres y Mujeres sobre el salón$c$),
  ($c$/capturas/summers-style/servicios.webp$c$, $c$servicios.webp$c$, 'image/webp', 272594, 3840, 2400, $c$Catálogo de servicios de Summer’s Style con filtros por público y categoría, buscador, precios en bolivianos y duración$c$),
  ($c$/capturas/summers-style/reservar.webp$c$, $c$reservar.webp$c$, 'image/webp', 201132, 3840, 2400, $c$Primer paso de la reserva en summersstyles.com.bo: elegir el servicio, con filtros, buscador y el resumen de la cita$c$),
  ($c$/capturas/summers-style/servicio.webp$c$, $c$servicio.webp$c$, 'image/webp', 192156, 3840, 2400, $c$Ficha del Corte premium en summersstyles.com.bo, con lo que incluye, el precio de Bs. 100 y la duración$c$),
  ($c$/capturas/summers-style/como-llegar.webp$c$, $c$como-llegar.webp$c$, 'image/webp', 159336, 3840, 2400, $c$Video «Cómo llegar» de Summer’s Style: un auto recorre en un mapa 3D la ruta hasta el salón en Calacala$c$)
ON CONFLICT ("key") DO NOTHING;
--> statement-breakpoint
INSERT INTO "project_media" ("project_id", "media_id", "caption", "sort")
SELECT p."id", m."id", v.caption, v.sort
FROM (VALUES
    ($c$/capturas/summers-style/inicio.webp$c$, $c$La portada: dos puertas, Hombres y Mujeres, que llevan a los servicios de cada público.$c$, 10),
    ($c$/capturas/summers-style/servicios.webp$c$, $c$Catálogo: 21 servicios con filtros, buscador, precio y duración, editables desde el panel.$c$, 20),
    ($c$/capturas/summers-style/reservar.webp$c$, $c$Reserva en tres pasos: servicio, día y hora, y tus datos, sin crear cuenta ni pagar.$c$, 30),
    ($c$/capturas/summers-style/servicio.webp$c$, $c$Ficha de servicio: qué incluye, precio y duración, con el botón para reservar o consultar por WhatsApp.$c$, 40),
    ($c$/capturas/summers-style/como-llegar.webp$c$, $c$«Cómo llegar»: un video 3D con calles reales de OpenStreetMap, de la Av. Melchor Urquidi a la puerta del salón.$c$, 50)
  ) AS v(key, caption, sort)
JOIN "projects" p ON p."slug" = 'summers-style'
JOIN "media" m ON m."key" = v.key
ON CONFLICT DO NOTHING;
--> statement-breakpoint
-- La primera captura es la portada: se ve en la cabecera del caso, en el listado y en el Home (solo si no tenía).
UPDATE "projects" SET "cover_media_id" = (SELECT "id" FROM "media" WHERE "key" = $c$/capturas/summers-style/inicio.webp$c$), "updated_at" = now()
WHERE "slug" = 'summers-style' AND "cover_media_id" IS NULL;
