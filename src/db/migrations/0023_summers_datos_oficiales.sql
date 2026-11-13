-- Caso Summer’s Style con los datos oficiales del salón (13/11/2026). Solo datos; cada cambio se aplica únicamente si el
-- texto sigue siendo el sembrado en 0020: lo que alguien editó en el panel no se toca.
-- · Nunca «Calacala»: el dueño del salón pidió no usarlo porque confunde a sus clientes. Va «en Cochabamba» y, en el alt de
--   «Cómo llegar», la avenida oficial (Av. Circunvalación).
-- · Sin número fijo de servicios: eran 21 y hoy son 22 (sitemap de summersstyles.com.bo). Va «más de veinte servicios».
-- · updated_at del caso = dateModified del JSON-LD y lastmod del sitemap.
UPDATE "projects"
SET "context" = replace(
      replace("context", 'en Calacala, Cochabamba, para mujeres, hombres y niños', 'en Cochabamba, para mujeres, hombres y niños'),
      'Su catálogo tiene 21 servicios en cinco categorías', 'Su catálogo tiene más de veinte servicios en cinco categorías'),
    "features" = array_replace("features", 'Catálogo de 21 servicios con filtros por público y buscador', 'Catálogo de más de veinte servicios con filtros por público y buscador'),
    "updated_at" = now()
WHERE "slug" = 'summers-style'
  AND (strpos("context", 'en Calacala, Cochabamba, para mujeres') > 0
    OR strpos("context", 'Su catálogo tiene 21 servicios') > 0
    OR 'Catálogo de 21 servicios con filtros por público y buscador' = ANY("features"));
--> statement-breakpoint
UPDATE "media"
SET "alt" = replace("alt", 'la ruta hasta el salón en Calacala', 'la ruta hasta el salón, sobre la Av. Circunvalación')
WHERE "key" = '/capturas/summers-style/como-llegar.webp' AND strpos("alt", 'la ruta hasta el salón en Calacala') > 0;
--> statement-breakpoint
UPDATE "project_media" pm
SET "caption" = 'Catálogo: más de veinte servicios con filtros, buscador, precio y duración, editables desde el panel.'
FROM "projects" p, "media" m
WHERE pm."project_id" = p."id" AND pm."media_id" = m."id"
  AND p."slug" = 'summers-style' AND m."key" = '/capturas/summers-style/servicios.webp'
  AND pm."caption" = 'Catálogo: 21 servicios con filtros, buscador, precio y duración, editables desde el panel.';
