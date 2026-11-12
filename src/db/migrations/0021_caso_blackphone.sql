-- Caso nuevo: Blackphone, sistema privado nombrado a pedido del dueño (12/11/2026), con 5 capturas 4K de una copia
-- local con datos de ejemplo. El texto sale de src/db/seed/projects/blackphone.ts. Si algo ya existe
-- (creado en el panel o por el seed), no se toca: todo va con ON CONFLICT DO NOTHING o condicionado a que falte.
INSERT INTO "clients" ("slug", "name", "sector", "website", "authorized", "status", "published_at", "sort")
VALUES ($c$blackphone$c$, $c$Blackphone$c$, $c$Comercio de tecnología$c$, NULL, true, 'published', now(), 25)
ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint
INSERT INTO "projects" ("slug", "title", "summary", "website", "category_id", "client_id", "client_public", "problem", "context",
  "solution", "challenge", "architecture", "sections", "result", "features", "stack", "results_metrics", "badge", "sector", "visual",
  "cta_title", "cta_lead", "year", "featured", "sort", "status", "published_at", "seo_title", "seo_description", "og_image")
SELECT $c$blackphone$c$, $c$Blackphone: inventario, ventas, servicio técnico y caja por sucursal$c$, $c$Sistema de gestión de Blackphone, tienda de tecnología con varias sucursales: inventario por IMEI, ventas con permuta, reservas, servicio técnico, cotizaciones, caja diaria y reportes. Laravel, React y PostgreSQL.$c$, NULL, (SELECT "id" FROM "project_categories" WHERE "slug" = $c$sistemas-empresariales$c$),
  (SELECT "id" FROM "clients" WHERE "slug" = $c$blackphone$c$), true,
  $c$**Una tienda de celulares no vende cajas iguales.** Cada celular tiene su IMEI, su batería, su condición y su historia; un vidrio templado, en cambio, se vende por cantidad. En el mismo mostrador se vende, se separa un equipo con un anticipo, se recibe otro en parte de pago, se cotiza por WhatsApp y se recibe un equipo para reparar.

Cuando eso vive en planillas y chats, los errores son caros: un equipo que figura disponible pero ya se vendió, una reparación que vuelve con un reclamo sin nada escrito sobre cómo entró, una caja que no cierra y nadie sabe por qué.

Y con más de una sucursal, todo se multiplica: cada local necesita su inventario, su caja y sus notas, sin que un código se repita ni una sucursal vea lo de la otra.$c$,
  $c$**Un sistema privado, hecho para el mostrador.** Blackphone vende celulares, computadoras, equipos de marca, accesorios y repuestos, nuevos y seminuevos, y hace servicio técnico. El sistema no tiene tienda pública: todo pide sesión, y el buscador no lo indexa.

Trabaja con varias sucursales; arrancó con Cochabamba y Sucre. Hay dos paneles: el de administración, con costos, reportes y configuración, y el del vendedor, que vende, reserva y cotiza sin ver nunca un costo.$c$,
  $c$**Un solo sistema para todo lo que pasa en la tienda.** Construimos un sistema de gestión con inventario, ventas, reservas, servicio técnico, cotizaciones, egresos, clientes, caja diaria y reportes sobre la misma base y las mismas reglas.

- **Inventario:** cada celular y computadora es una unidad con IMEI o serie, batería, condición y precio para cliente final y para tiendas. Accesorios y repuestos se llevan por cantidad, con su historial de movimientos.
- **Mostrador:** ventas con varios ítems, permuta y pago en efectivo, QR, transferencia o tarjeta; reservas con anticipo; boleta en A4 y en 80 mm.
- **Taller:** servicio técnico con el estado de recepción del equipo, técnico asignado, comisiones y recibo para el cliente.
- **Control:** caja diaria por sucursal, auditoría de inventario por conteo físico y reportes por día, semana, mes y año.

> Lo que se vende, se separa o se repara queda escrito en el mismo lugar donde está el stock.$c$,
  $c$**Varias sucursales sin que se mezclen.** Cada sucursal tiene su inventario, sus ventas, sus reservas, sus servicios, sus clientes y sus egresos. El aislamiento no depende de que cada pantalla se acuerde de filtrar: lo aplica un alcance global sobre los modelos, y lo que se carga queda en la sucursal activa de quien lo carga. Una cuenta con sucursal asignada no ve otra ni escribiendo la dirección a mano.

Los códigos de nota llevan el prefijo de la sucursal (CBA-V001, SUC-V001), así dos cajas venden al mismo tiempo en ciudades distintas sin que un código se repita. Un traspaso entre sucursales pasa por «en tránsito»: lo enviado no se puede vender en ninguna de las dos hasta que el destino confirma que llegó.

Nadie reparte más alcance del que tiene: un administrador de sucursal da acceso solo a la suya, y el sistema no deja quedarse sin super administradores ni apagar la última sucursal.$c$,
  $c$Blackphone es un **monolito** en **Laravel 13** con **React 19** por **Inertia**, sin una API aparte. La base es **PostgreSQL 18** y los comprobantes en PDF salen con dompdf.

Todo corre en **Docker Compose**: la aplicación (Apache y PHP 8.5), una cola de trabajos, el programador de tareas y la base, con contenedores, volúmenes, claves y base propios. En el servidor comparte solo el proxy con HTTPS con otros sitios.

Decisiones que importan:

- El stock por cantidad se mueve por un único servicio que bloquea la fila y deja el renglón en el historial: el saldo nunca se edita a mano.
- El costo de una pieza o de un producto lo pone siempre el servidor desde el inventario; el vendedor nunca lo recibe.
- Los permisos se aplican en el servidor, no solo en el menú: cada rol entra a los módulos que tiene asignados.
- Los reportes automáticos llegan desde n8n por una ruta propia con token.$c$,
  $c$## Servicio técnico que se defiende solo

La nota de servicio incluye cómo llega el equipo: una revisión punto por punto (enciende, pantalla, táctil, cámaras, Face ID, chasis…) con Sí, No o No se pudo probar, a la que se pueden sumar puntos en el mostrador. El código de desbloqueo es obligatorio indicarlo, y que el cliente no lo deje también se imprime.

Todo sale en la boleta A4 y en el recibo térmico, porque la nota existe para responder sola si después se discute en qué estado entró el equipo. Cada técnico tiene su especialidad y su comisión, y el servidor no deja asignar un Android al técnico de Apple ni mandando el formulario a mano.

## Caja diaria por sucursal

Una caja por sucursal y por día. Se abre anotando con cuánto arranca el cajón; desde ahí, lo que se cobra en efectivo se suma solo. Al cerrar se cuenta el efectivo y quedan guardados el desglose, lo esperado, lo contado y la diferencia: si sobró o faltó, queda a la vista y firmado.

## Ventas a tiendas

Además del cliente final, Blackphone vende a otras tiendas. Cada producto puede tener un precio mayorista; la venta a una tienda reusa la numeración, el stock, la nota y la caja, pero va en su propio módulo, solo para administración, y el vendedor nunca ve ese precio.

## Cotizaciones y reportes

Las cotizaciones se arman en el sistema, salen en PDF y se envían por correo o por WhatsApp, una por una o en lote. Los reportes muestran ventas, ganancias y cierres por día, semana, mes y año, y el inventario se exporta en PDF por tipo, por nombre o con un filtro armado a mano.$c$,
  $c$Blackphone está en producción desde octubre de 2026, como sistema privado de la tienda, con inventario, mostrador, taller y caja sobre una misma base.

**Sin un sistema.** El stock, las ventas, las reparaciones y la caja de cada local se siguen por separado, y cada cierre depende de reconstruir el día.

**Con el sistema.** Cada movimiento queda en el lugar donde está el stock, cada sucursal ve lo suyo y la caja cierra con la diferencia a la vista.

- Un único sistema para inventario, ventas, reservas, servicio técnico, cotizaciones y caja.
- Trazabilidad: cada equipo con su IMEI, cada movimiento de stock con quién y por qué, cada cierre de caja guardado.
- Control de accesos: el vendedor vende sin ver costos, y cada cuenta trabaja solo con su sucursal.
- QA automatizado: suite de pruebas para proteger los flujos críticos.

> Una tienda puede vender sin sistema. Lo difícil es saber, al cerrar, qué pasó.$c$,
  ARRAY[$c$Inventario por unidad con IMEI, serie, batería y condición$c$, $c$Accesorios y repuestos por cantidad con historial de movimientos$c$, $c$Ventas con varios ítems, permuta y cuatro formas de pago$c$, $c$Reservas con anticipo y control de vencimiento$c$, $c$Servicio técnico con revisión de recepción y comisiones$c$, $c$Caja diaria por sucursal con cierre y diferencia$c$, $c$Varias sucursales aisladas, con traspasos en tránsito$c$, $c$Cotizaciones en PDF por correo y WhatsApp$c$, $c$Panel del vendedor sin costos y roles por módulo$c$, $c$Reportes y auditoría de inventario por conteo físico$c$]::text[],
  ARRAY[$c$Laravel$c$, $c$PHP$c$, $c$React$c$, $c$Inertia$c$, $c$Tailwind CSS$c$, $c$PostgreSQL$c$, $c$Docker$c$, $c$Vite$c$, $c$n8n$c$]::text[],
  $c$[{"label":"Pruebas automatizadas","value":"362"}]$c$::jsonb, $c$Sistema interno$c$, $c$Comercio de tecnología$c$, $c$layers$c$, $c$¿Tu tienda lleva el stock en una planilla?$c$, $c$Construimos sistemas de gestión a la medida de cada comercio: inventario, ventas, servicio técnico y caja, con una o varias sucursales. Contanos qué querés resolver.$c$,
  2026, false, 18, 'published', now(), $c$Sistema para tienda de celulares: Blackphone$c$, $c$Caso de estudio: Blackphone, sistema de gestión para una tienda de tecnología en Bolivia, con inventario por IMEI, ventas, servicio técnico, caja y sucursales.$c$, '/og/proyectos/blackphone.png'
ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint
INSERT INTO "project_services" ("project_id", "service_id")
SELECT p."id", s."id" FROM "projects" p JOIN "services" s ON s."slug" IN ('sistemas-empresariales', 'automatizacion')
WHERE p."slug" = 'blackphone'
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "media" ("key", "filename", "mime", "size", "width", "height", "alt") VALUES
  ($c$/capturas/blackphone/inicio.webp$c$, $c$inicio.webp$c$, 'image/webp', 159858, 3840, 2400, $c$Resumen del panel de Blackphone: saludo del día, accesos a nueva venta, servicio y producto, y los resultados del período con los montos desenfocados$c$),
  ($c$/capturas/blackphone/celulares.webp$c$, $c$celulares.webp$c$, 'image/webp', 232272, 3840, 2400, $c$Inventario de celulares de Blackphone con IMEI, batería, condición nuevo o seminuevo, procedencia, costo, precio y precio para tiendas$c$),
  ($c$/capturas/blackphone/venta.webp$c$, $c$venta.webp$c$, 'image/webp', 192148, 3840, 2400, $c$Nueva venta en Blackphone: cliente, pago por QR, un iPhone buscado por IMEI y un vidrio templado vendido por cantidad$c$),
  ($c$/capturas/blackphone/servicio.webp$c$, $c$servicio.webp$c$, 'image/webp', 222644, 3840, 2400, $c$Nuevo servicio técnico en Blackphone: código de desbloqueo y revisión del equipo punto por punto con Sí y No, y el resumen del servicio$c$),
  ($c$/capturas/blackphone/caja.webp$c$, $c$caja.webp$c$, 'image/webp', 178268, 3840, 2400, $c$Caja diaria de Blackphone con las sucursales Cochabamba y Sucre, cada una con su apertura y los cierres anteriores$c$)
ON CONFLICT ("key") DO NOTHING;
--> statement-breakpoint
INSERT INTO "project_media" ("project_id", "media_id", "caption", "sort")
SELECT p."id", m."id", v.caption, v.sort
FROM (VALUES
    ($c$/capturas/blackphone/inicio.webp$c$, $c$El Resumen: accesos directos y resultados del período. Datos de ejemplo; los montos van desenfocados.$c$, 10),
    ($c$/capturas/blackphone/celulares.webp$c$, $c$Inventario de celulares: cada equipo con su IMEI, batería, condición y precio para cliente final y para tiendas. Datos de ejemplo.$c$, 20),
    ($c$/capturas/blackphone/venta.webp$c$, $c$Nueva venta en pasos: cliente, forma de pago, productos por IMEI o por cantidad y permuta opcional. Datos de ejemplo.$c$, 30),
    ($c$/capturas/blackphone/servicio.webp$c$, $c$Servicio técnico: cómo llega el equipo, código de desbloqueo y revisión punto por punto, impresos en la nota. Datos de ejemplo.$c$, 40),
    ($c$/capturas/blackphone/caja.webp$c$, $c$Caja diaria por sucursal: se abre con el efectivo inicial y se cierra contando. Datos de ejemplo.$c$, 50)
  ) AS v(key, caption, sort)
JOIN "projects" p ON p."slug" = 'blackphone'
JOIN "media" m ON m."key" = v.key
ON CONFLICT DO NOTHING;
--> statement-breakpoint
-- La primera captura es la portada: se ve en la cabecera del caso, en el listado y en el Home (solo si no tenía).
UPDATE "projects" SET "cover_media_id" = (SELECT "id" FROM "media" WHERE "key" = $c$/capturas/blackphone/inicio.webp$c$), "updated_at" = now()
WHERE "slug" = 'blackphone' AND "cover_media_id" IS NULL;
