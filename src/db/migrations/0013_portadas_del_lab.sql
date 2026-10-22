-- Portadas de los artículos del Lab (public/lab/covers/<slug>.png, generadas desde /dev/cover/<slug>): son la imagen
-- para compartir (Open Graph) y, sin portada subida, la imagen del Article. Solo donde no hay nada cargado.
UPDATE "posts"
SET "og_image" = '/lab/covers/' || "slug" || '.png', "updated_at" = now()
WHERE "slug" IN ('que-proceso-automatizar-primero', 'cuando-tu-excel-ya-es-un-sistema', 'ia-en-procesos-reales',
                 'cuanto-cuesta-un-sistema-a-medida-en-bolivia', 'empresas-de-desarrollo-de-software-en-bolivia')
  AND ("og_image" IS NULL OR "og_image" = '')
  AND "cover_media_id" IS NULL;
