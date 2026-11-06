-- La primera captura de cada caso pasa a ser su portada (06/11/2026, a pedido del dueño): la evidencia se ve
-- arriba del caso y en el listado, no al final. Solo si el caso no tenía portada (una subida en el panel manda).
UPDATE "projects" SET "cover_media_id" = (SELECT "id" FROM "media" WHERE "key" = '/capturas/apple-boss/inicio.webp'), "updated_at" = now()
WHERE "slug" = 'apple-boss' AND "cover_media_id" IS NULL AND EXISTS (SELECT 1 FROM "media" WHERE "key" = '/capturas/apple-boss/inicio.webp');
--> statement-breakpoint
UPDATE "projects" SET "cover_media_id" = (SELECT "id" FROM "media" WHERE "key" = '/capturas/crm-inmobiliario/inicio.webp'), "updated_at" = now()
WHERE "slug" = 'crm-inmobiliario' AND "cover_media_id" IS NULL AND EXISTS (SELECT 1 FROM "media" WHERE "key" = '/capturas/crm-inmobiliario/inicio.webp');
