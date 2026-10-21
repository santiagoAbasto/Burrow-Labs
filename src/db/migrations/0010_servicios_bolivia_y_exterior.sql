-- Servicios y descripciones: cinco servicios (suma apps móviles) y empresas de Bolivia y del exterior, no solo Cochabamba.
-- Cada UPDATE solo corre si el texto sigue siendo el sembrado o el que había en producción: lo editado en el panel no se toca.
UPDATE "seo_metadata"
SET "title" = 'Servicios de software a medida en Bolivia', "description" = 'Sistemas empresariales, automatización, IA aplicada, plataformas web y apps móviles para empresas de Bolivia y del exterior. Primero entendemos el proceso.', "updated_at" = now()
WHERE "path" = '/servicios' AND "title" = 'Servicios de software a medida para empresas' AND "description" = 'Cuatro servicios para empresas: sistemas empresariales, automatización e integraciones, IA aplicada y plataformas web. Primero entendemos el proceso.';
--> statement-breakpoint
UPDATE "seo_metadata"
SET "description" = 'Software studio de Bolivia con base en Cochabamba: sistemas a medida, apps móviles, automatización e IA para empresas de Bolivia y del exterior.', "updated_at" = now()
WHERE "path" = '/' AND "description" IN ('Software studio en Cochabamba, Bolivia: sistemas a medida, automatizaciones, integraciones e IA para empresas que quieren operar con menos trabajo manual.', 'Software studio en Cochabamba, Bolivia: sistemas a medida, automatizaciones, integraciones e IA aplicada para empresas que quieren operar con menos trabajo manual.');
--> statement-breakpoint
UPDATE "site_settings"
SET "value" = jsonb_set("value", '{description}', to_jsonb('Burrow Labs es un software studio de Bolivia que construye sistemas a medida, aplicaciones móviles, automatizaciones, integraciones e IA aplicada para empresas de Bolivia y del exterior.'::text)), "updated_at" = now()
WHERE "key" = 'seo' AND "value"->>'description' = 'Burrow Labs es un software studio de Bolivia que construye sistemas a medida, automatizaciones, integraciones e IA aplicada para empresas.';
--> statement-breakpoint
UPDATE "site_settings"
SET "value" = jsonb_set("value", '{body}', to_jsonb(replace("value"->>'body', 'sistemas web, automatizaciones, integraciones e IA aplicada.', 'sistemas web, aplicaciones móviles, automatizaciones, integraciones e IA aplicada.'))), "updated_at" = now()
WHERE "key" = 'about' AND strpos("value"->>'body', 'sistemas web, automatizaciones, integraciones e IA aplicada.') > 0;
