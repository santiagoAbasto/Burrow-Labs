-- Casos con su sitio en producción y capturas reales (06/11/2026, a pedido del dueño).
-- Ninth Group pasa a nombrarse: su sitio ya muestra «Desarrollado por Burrow Labs» con enlace a este sitio.
-- Cada cambio de texto está condicionado al texto anterior (si alguien lo editó en el panel, no se toca).
-- Las capturas son archivos del propio sitio (public/capturas/): la clave de media es su ruta.
UPDATE "projects" SET "website" = 'https://appleboss.com.bo', "updated_at" = now() WHERE "slug" = 'apple-boss' AND "website" IS NULL;
--> statement-breakpoint
UPDATE "projects" SET "website" = 'https://ninthgroup.bo', "updated_at" = now() WHERE "slug" = 'crm-inmobiliario' AND "website" IS NULL;
--> statement-breakpoint
INSERT INTO "clients" ("slug", "name", "sector", "website", "authorized", "status", "published_at", "sort")
VALUES ('ninth-group', 'Ninth Group', 'Inmobiliario', 'https://ninthgroup.bo', true, 'published', now(), 10)
-- Si ya existía (cargado sin autorización), el dueño lo autoriza ahora; el sitio web solo se completa si estaba vacío.
ON CONFLICT ("slug") DO UPDATE SET
  "authorized" = true,
  "status" = 'published',
  "published_at" = coalesce("clients"."published_at", now()),
  "website" = coalesce(nullif("clients"."website", ''), excluded."website");
--> statement-breakpoint
UPDATE "projects" SET "client_id" = (SELECT "id" FROM "clients" WHERE "slug" = 'ninth-group'), "client_public" = true
-- Mientras el caso siga anónimo: si ya tenía un cliente sin autorizar, pasa a ser Ninth Group.
WHERE "slug" = 'crm-inmobiliario' AND "client_public" = false;
--> statement-breakpoint
UPDATE "projects" SET "badge" = '' WHERE "slug" = 'crm-inmobiliario' AND "badge" = 'Caso confidencial';
--> statement-breakpoint
UPDATE "projects" SET "title" = 'Ninth Group: CRM inmobiliario + experiencia pública'
WHERE "slug" = 'crm-inmobiliario' AND "title" = 'CRM inmobiliario + experiencia pública';
--> statement-breakpoint
UPDATE "projects" SET "summary" = 'CRM y sitio público de Ninth Group, red inmobiliaria de Cochabamba, sobre una misma base: propiedades, captaciones, leads, pipeline, agenda y contenidos. Laravel, React y MySQL.'
WHERE "slug" = 'crm-inmobiliario' AND "summary" = 'CRM y sitio público de una inmobiliaria sobre una misma base: propiedades, captaciones, leads, pipeline, agenda, equipo y contenidos. Construido con Laravel, React y MySQL.';
--> statement-breakpoint
UPDATE "projects" SET "seo_title" = 'CRM inmobiliario a medida para Ninth Group'
WHERE "slug" = 'crm-inmobiliario' AND "seo_title" = 'CRM inmobiliario a medida con sitio conectado';
--> statement-breakpoint
UPDATE "projects" SET "seo_description" = 'Caso de estudio: Ninth Group, red inmobiliaria de Cochabamba, unificó propiedades, captaciones, leads, agenda y su sitio público en una sola plataforma.'
WHERE "slug" = 'crm-inmobiliario' AND "seo_description" = 'Caso de estudio: una inmobiliaria unificó propiedades, captaciones, leads, agenda y sitio público en una sola plataforma construida con Laravel, React y MySQL.';
--> statement-breakpoint
INSERT INTO "media" ("key", "filename", "mime", "size", "width", "height", "alt") VALUES
  ('/capturas/apple-boss/inicio.webp', 'inicio.webp', 'image/webp', 47250, 1600, 1000, 'Página de inicio de appleboss.com.bo, con el buscador, el menú de categorías y la portada de iPhone'),
  ('/capturas/apple-boss/iphone.webp', 'iphone.webp', 'image/webp', 65346, 1600, 1000, 'Catálogo de iPhone en appleboss.com.bo, con modelos nuevos y seminuevos'),
  ('/capturas/apple-boss/seminuevos.webp', 'seminuevos.webp', 'image/webp', 51420, 1600, 1000, 'Sección de seminuevos de appleboss.com.bo, con cada equipo publicado por unidad'),
  ('/capturas/apple-boss/servicio-tecnico.webp', 'servicio-tecnico.webp', 'image/webp', 52660, 1600, 1000, 'Página de servicio técnico de iPhone y Mac en appleboss.com.bo'),
  ('/capturas/crm-inmobiliario/inicio.webp', 'inicio.webp', 'image/webp', 50248, 1600, 1000, 'Página de inicio de ninthgroup.bo, el sitio público de Ninth Group'),
  ('/capturas/crm-inmobiliario/propiedades.webp', 'propiedades.webp', 'image/webp', 64206, 1600, 1000, 'Catálogo de propiedades en Cochabamba en ninthgroup.bo, con filtros por operación, tipo, ciudad y zona'),
  ('/capturas/crm-inmobiliario/proyecto-en-preventa.webp', 'proyecto-en-preventa.webp', 'image/webp', 78914, 1600, 1000, 'Ficha de un proyecto en preventa en ninthgroup.bo, con avance de obra y plan de pago'),
  ('/capturas/crm-inmobiliario/vender-mi-propiedad.webp', 'vender-mi-propiedad.webp', 'image/webp', 45044, 1600, 1000, 'Página «Vender mi propiedad» de ninthgroup.bo para pedir una valoración')
ON CONFLICT ("key") DO NOTHING;
--> statement-breakpoint
INSERT INTO "project_media" ("project_id", "media_id", "caption", "sort")
SELECT p."id", m."id", v.caption, v.sort
FROM (VALUES
    ('apple-boss', '/capturas/apple-boss/inicio.webp', 'La tienda que ve el cliente: buscador, categorías y catálogo en appleboss.com.bo.', 10),
    ('apple-boss', '/capturas/apple-boss/iphone.webp', 'Catálogo de iPhone: nuevos y seminuevos, con la condición explícita en cada publicación.', 20),
    ('apple-boss', '/capturas/apple-boss/seminuevos.webp', 'Seminuevos publicados por unidad: condición, estado de batería y garantía en cada equipo.', 30),
    ('apple-boss', '/capturas/apple-boss/servicio-tecnico.webp', 'Servicio técnico: el pedido de revisión entra a la misma operación que la tienda.', 40),
    ('crm-inmobiliario', '/capturas/crm-inmobiliario/inicio.webp', 'El sitio público de Ninth Group, en ninthgroup.bo.', 10),
    ('crm-inmobiliario', '/capturas/crm-inmobiliario/propiedades.webp', 'Propiedades: el catálogo público sale de la misma base donde el equipo carga cada inmueble.', 20),
    ('crm-inmobiliario', '/capturas/crm-inmobiliario/proyecto-en-preventa.webp', 'Proyecto en preventa: avance de obra, plan de pago y galería en la misma ficha.', 30),
    ('crm-inmobiliario', '/capturas/crm-inmobiliario/vender-mi-propiedad.webp', 'Vender mi propiedad: el pedido de valoración llega al CRM como solicitud y lo toma un asesor de la oficina.', 40)
  ) AS v(slug, key, caption, sort)
JOIN "projects" p ON p."slug" = v.slug
JOIN "media" m ON m."key" = v.key
ON CONFLICT DO NOTHING;
