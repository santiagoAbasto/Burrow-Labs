-- Caso nuevo: Burrow Prospect, nuestro sistema de prospección (06/11/2026, a pedido del dueño), con 5 capturas 4K reales
-- de la app con datos de ejemplo. El texto sale de src/db/seed/projects/burrow-prospect.ts. Si el caso ya existe (creado en el
-- panel o por el seed), no se toca: todo va con ON CONFLICT DO NOTHING o condicionado a que falte.
INSERT INTO "projects" ("slug", "title", "summary", "website", "category_id", "problem", "context", "solution", "challenge",
  "architecture", "sections", "result", "features", "stack", "results_metrics", "badge", "sector", "visual", "cta_title", "cta_lead",
  "year", "featured", "sort", "status", "published_at", "seo_title", "seo_description", "og_image")
SELECT $c$burrow-prospect$c$, $c$Burrow Prospect by Burrow Labs: de la ficha de Google a la reunión$c$, $c$Nuestro sistema para conseguir clientes: busca negocios en Google, los puntúa con hechos, pide permiso, escribe por WhatsApp y un agente de IA responde sin inventar. Laravel, React y PostgreSQL.$c$, $c$https://prospect.burrowlabs.com.bo/demos$c$, (SELECT "id" FROM "project_categories" WHERE "slug" = $c$ia$c$),
  $c$Conseguir clientes para un estudio de software tiene un trabajo repetitivo detrás: encontrar negocios, ver qué les falta de verdad, conseguir un contacto, escribir, hacer seguimiento y mostrar qué se podría construir para cada uno. Hecho a mano, ese trabajo se corta en cada paso.

Y el atajo habitual es el peor: copiar números de Google Maps y mandar el mismo mensaje a todos. Eso es spam, no tiene permiso de nadie y quema el canal, porque WhatsApp limita o bloquea a quien escribe sin que lo esperen. Necesitábamos lo contrario: pocos mensajes, a quien aceptó recibirlos, con algo concreto para su negocio.$c$,
  $c$Burrow Prospect es una herramienta interna de Burrow Labs: la usamos nosotros para conseguir nuestros propios clientes, en español de Bolivia y con la hora de La Paz. Analiza negocios de Bolivia, Argentina y Colombia, y solo contacta en Bolivia.

En Bolivia, el canal donde un negocio responde es WhatsApp. Por eso todo pasa por la API oficial de Meta: plantillas aprobadas para el primer mensaje, una ventana de 24 horas para conversar después de que el negocio escribe, y webhooks firmados para cada mensaje que entra. Hacia afuera, siempre firma Burrow Labs: ningún mensaje, correo ni propuesta lleva el nombre de una persona.$c$,
  $c$Construimos el recorrido completo, de la búsqueda a la reunión, con un rastro en cada paso:

1. **Buscar.** Barridos en Google Places por rubro y ciudad, con un tope mensual.
2. **Puntuar.** Un score de 0 a 100 que solo usa hechos observados: si la ficha de Google enlaza un sitio propio, si tiene teléfono público, cuántas reseñas y qué rating. El score ordena; no excluye a nadie.
3. **La ficha.** Auditoría del sitio web, datos de Maps y una lectura de IA que propone qué ofrecer, qué mini apps le servirían y qué preguntarle.
4. **Llamadas.** Los mejores prospectos sin permiso todavía, con un guion armado con sus hechos. Si acepta, queda registrado quién atendió, cuándo y a qué número.
5. **Autopiloto.** La IA redacta un borrador por negocio; nosotros aprobamos el lote viendo cada mensaje completo, y el envío sale con ritmo, tope diario y horario.
6. **El agente de WhatsApp.** Cuando el negocio responde, contesta corto y solo con lo que está escrito. Si le falta un dato, pasa la conversación a una persona.
7. **La demo.** Cada rubro tiene una mini app que funciona de verdad, con un enlace corto propio para cada negocio.
8. **La reunión.** Día y hora en la agenda, con invitación pública, archivo de calendario y enlace a Google Calendar.

Cada cambio de estado queda en el historial de la ficha. Cada envío tiene su mensaje y cada permiso tiene quién lo dio, cuándo y a qué número.$c$,
  $c$El primer desafío fue no hacer spam con una herramienta pensada para escribir a muchos negocios. La respuesta está en el código, no en la buena voluntad: sin permiso registrado no se escribe, y encontrar un número publicado no es permiso. Una baja vale para todos los canales y para todas las fichas con ese número, y un «no me interesa» corto también es baja. El primer contacto de cada lote y cada plantilla pasan por una aprobación humana.

El segundo fue un agente de IA que conversa con clientes reales sin inventar. Un modelo de lenguaje puede prometer un precio, un plazo o un alcance con la misma seguridad con la que acierta. Por eso responde solo con una base de conocimiento escrita, la ficha del negocio y la conversación, y un filtro de salida solo deja pasar los montos y plazos que fijó el dueño. Además tuvo que aprender a reconocer lo que no es una persona: los contestadores automáticos de los negocios y otros asistentes de IA. Dos IAs no venden: si del otro lado responde un bot, el agente se calla y avisa.$c$,
  $c$Una sola aplicación, con trabajo pesado en segundo plano:

- **App:** Laravel 13 con Inertia y React 19 en TypeScript, Tailwind 4 y PostgreSQL 18.
- **Worker:** una cola que redacta borradores, envía con ritmo, responde con el agente, baja archivos y transcribe audios de WhatsApp.
- **Scheduler:** sincroniza con burrowlabs.com.bo cada 10 minutos, actualiza el estado de las plantillas en Meta cada hora y reprograma lo aprobado que esperaba el tope o el horario.
- **Integraciones:** WhatsApp Cloud API con webhooks firmados, Google Places para la búsqueda y la ficha, y un modelo de lenguaje para borradores, propuestas, la lectura de la ficha y el agente.

Corre en contenedores (app, worker, scheduler y base) en el mismo servidor que otros sitios, detrás de un proxy compartido. Cada despliegue respalda la base, migra, comprueba la salud de la app y verifica que los demás sitios sigan respondiendo igual; un script vuelve al release anterior si hace falta. La base se respalda cada día y se guardan 14 días.$c$,
  $c$## Demos que funcionan

Cada rubro tiene una mini app real, no una maqueta: dos pantallas con el mismo estado. En el celular, el cliente reserva, pide, compra, agenda o cotiza; en el panel, el dueño ve el día con cifras, su agenda o su cocina, clientes, reportes y automatizaciones. Lo que pasa de un lado aparece del otro.

- Hay cinco tipos de mini app (agenda, pedidos, catálogo, listado y cotización) con un mundo visual por familia de rubros: paleta, tipografía y colores de gráficos propios.
- El nombre, la dirección y las reseñas salen de la ficha de Google del negocio. Los precios, personas y productos son de ejemplo, y la página lo dice.
- La demo no guarda nada en el servidor ni le escribe a nadie. Cuando el negocio abre su enlace, pide una reunión o llena la ficha de requerimientos, nos llega un aviso.

## El agente de WhatsApp

Responde solo a quien escribe, dentro de la ventana de 24 horas, en tres frases como máximo. Antes de contestar, un filtro separa lo que no escribió una persona: el contestador automático del negocio, una ráfaga de mensajes o un pedido de baja. Si el contestador tapa nuestro mensaje, se reenvía a los 90 segundos aclarando que es para el dueño o encargado, una sola vez.

Cuando le falta un dato, hay un reclamo o un tema legal, o el negocio pide una persona, el agente responde con un mensaje cordial fijo y nos avisa con el motivo («falta un dato: …»). Lo que falta se agrega a la base de conocimiento y desde entonces el agente lo usa. Aparte de las pruebas automatizadas, el agente tiene una evaluación con IA real de 68 casos de conversación.

## Conectado con este sitio

Las consultas y las fichas de proyecto que llegan a burrowlabs.com.bo pasan a Prospect cada 10 minutos y se unen al prospecto por teléfono o correo. La sincronización trae solo los campos útiles para atender: nunca presupuestos acordados, descuentos, pagos ni notas internas. Sin el token compartido, la ruta del sitio no existe; con uno equivocado, responde 401 sin tocar la base. Repetir la sincronización no duplica nada.$c$,
  $c$Burrow Prospect está en producción y es la herramienta con la que Burrow Labs busca y atiende a sus propios clientes. La versión 2.0.0 salió el 6 de noviembre de 2026.

**Sin un sistema.** Prospectar es buscar en Maps, copiar números y escribir uno por uno, con el riesgo de mandar lo mismo a todos y sin un registro de quién aceptó qué.

**Con Burrow Prospect.** Cada negocio llega con su score explicado, su ficha y una demo de su rubro. Solo se escribe a quien dio permiso, cada mensaje pasa por una aprobación y el agente responde sin inventar.

- Trazabilidad: cada permiso, envío, respuesta y cambio de estado queda en la ficha.
- Cumplimiento: plantillas aprobadas por Meta, bajas en todos los canales y topes de envío.
- Pruebas: ninguna prueba automatizada llama a Google, a Meta ni al modelo de lenguaje.
- Capacidad de crecer: los 60 rubros, los países y la base de conocimiento se amplían sin rehacer el sistema.$c$,
  ARRAY[$c$Búsqueda en Google Places por rubro y ciudad, con barridos y tope mensual$c$, $c$Score de 0 a 100 solo con hechos observados en la ficha de Google$c$, $c$Ficha con auditoría web, datos de Maps y lectura de IA$c$, $c$Modo llamadas: guion con los hechos del negocio y permiso registrado$c$, $c$Autopiloto: lotes de borradores con aprobación, ritmo, tope diario y horario$c$, $c$WhatsApp por la API oficial de Meta, con plantillas aprobadas y bandeja en vivo$c$, $c$Agente de IA con base de conocimiento escrita, que deriva a una persona cuando duda$c$, $c$Demos por rubro que funcionan, con enlace corto propio para cada negocio$c$, $c$Agenda con invitación pública, archivo .ics y Google Calendar$c$, $c$Métricas: embudo, respuestas, permisos y envíos$c$]::text[],
  ARRAY[$c$Laravel$c$, $c$PHP$c$, $c$React$c$, $c$TypeScript$c$, $c$Inertia$c$, $c$Tailwind CSS$c$, $c$PostgreSQL$c$, $c$WhatsApp Cloud API$c$, $c$Google Places$c$, $c$Anthropic$c$, $c$OpenAI$c$, $c$Docker$c$]::text[],
  $c$[{"label":"Pruebas automatizadas","value":"385"},{"label":"Rubros con su ficha","value":"60"},{"label":"Casos de evaluación del agente","value":"68"}]$c$::jsonb, $c$Producto propio$c$, $c$Prospección comercial$c$, $c$flow$c$, $c$¿Tu equipo comercial también vive entre Maps, WhatsApp y planillas?$c$, $c$Construimos sistemas de prospección y atención a la medida de cada proceso, con permiso, trazabilidad e IA que no inventa. Contanos cómo consiguen clientes hoy.$c$,
  2026, true, 15, 'published', now(), $c$Burrow Prospect: prospección con IA y WhatsApp$c$, $c$Caso de estudio: Burrow Prospect, nuestro sistema de prospección. Busca negocios en Google, pide permiso, escribe por WhatsApp y su agente de IA no inventa nada.$c$, '/og/proyectos/burrow-prospect.png'
ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint
INSERT INTO "project_services" ("project_id", "service_id")
SELECT p."id", s."id" FROM "projects" p JOIN "services" s ON s."slug" IN ('inteligencia-artificial', 'automatizacion', 'sistemas-empresariales')
WHERE p."slug" = 'burrow-prospect'
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "media" ("key", "filename", "mime", "size", "width", "height", "alt") VALUES
  ($c$/capturas/burrow-prospect/inicio.webp$c$, $c$inicio.webp$c$, 'image/webp', 210056, 3840, 2400, $c$Inicio de Burrow Prospect con datos de ejemplo: prospectos, contactados, respuestas, reuniones, los negocios para contactar primero y las próximas reuniones$c$),
  ($c$/capturas/burrow-prospect/bandeja.webp$c$, $c$bandeja.webp$c$, 'image/webp', 299518, 3840, 2400, $c$Bandeja de WhatsApp de Burrow Prospect con una conversación de ejemplo atendida por el agente de IA$c$),
  ($c$/capturas/burrow-prospect/ficha.webp$c$, $c$ficha.webp$c$, 'image/webp', 261328, 3840, 2400, $c$Ficha de un prospecto de ejemplo en Burrow Prospect, con el score, las etapas del embudo y la lectura de IA$c$),
  ($c$/capturas/burrow-prospect/llamadas.webp$c$, $c$llamadas.webp$c$, 'image/webp', 261644, 3840, 2400, $c$Modo llamadas de Burrow Prospect con el guion de una llamada de ejemplo y los botones para registrar el resultado$c$),
  ($c$/capturas/burrow-prospect/demo.webp$c$, $c$demo.webp$c$, 'image/webp', 202848, 3840, 2400, $c$Demo pública de Burrow Prospect para barberías: el panel del dueño y el celular del cliente, con datos de ejemplo$c$)
ON CONFLICT ("key") DO NOTHING;
--> statement-breakpoint
INSERT INTO "project_media" ("project_id", "media_id", "caption", "sort")
SELECT p."id", m."id", v.caption, v.sort
FROM (VALUES
    ($c$/capturas/burrow-prospect/inicio.webp$c$, $c$Inicio: el día de un vistazo, con qué negocios contactar primero, los seguimientos y las próximas reuniones (datos de ejemplo).$c$, 10),
    ($c$/capturas/burrow-prospect/bandeja.webp$c$, $c$Bandeja: el agente de IA responde dentro de la ventana de 24 horas y deja la cita en la agenda (datos de ejemplo).$c$, 20),
    ($c$/capturas/burrow-prospect/ficha.webp$c$, $c$Ficha: el score explicado con hechos, la etapa del embudo y la lectura de IA con qué ofrecerle (datos de ejemplo).$c$, 30),
    ($c$/capturas/burrow-prospect/llamadas.webp$c$, $c$Llamadas: un guion con los hechos del negocio y el permiso registrado con quién atendió (datos de ejemplo).$c$, 40),
    ($c$/capturas/burrow-prospect/demo.webp$c$, $c$Demo de barbería: el panel del dueño y el celular del cliente comparten el mismo estado (datos de ejemplo).$c$, 50)
  ) AS v(key, caption, sort)
JOIN "projects" p ON p."slug" = 'burrow-prospect'
JOIN "media" m ON m."key" = v.key
ON CONFLICT DO NOTHING;
--> statement-breakpoint
-- La primera captura es la portada: se ve en la cabecera del caso, en el listado y en el Home (solo si no tenía).
UPDATE "projects" SET "cover_media_id" = (SELECT "id" FROM "media" WHERE "key" = $c$/capturas/burrow-prospect/inicio.webp$c$), "updated_at" = now()
WHERE "slug" = 'burrow-prospect' AND "cover_media_id" IS NULL;
