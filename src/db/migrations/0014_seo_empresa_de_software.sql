-- SEO del 28/10/2026 (auditoría con los datos de Search Console). Solo datos; cada cambio se aplica únicamente si el campo
-- sigue con el texto de producción o el sembrado: lo que alguien editó en el panel no se toca.
-- · Términos que se buscan: «empresa de desarrollo de software» en el Home, Nosotros, Contacto y la descripción de la entidad;
--   «desarrollo web» y «páginas web» en la página de Cochabamba y en Plataformas web.
-- · Enlaces internos: el mapa de empresas apunta al Home y a la página local; IA aplicada al artículo de IA; la respuesta de
--   precios al artículo de costos; Nosotros a los servicios y a dos casos.
-- · /clientes noindex mientras no haya clientes publicados (se revierte en Admin → SEO).
-- · Perfil de TechBehemoths en Redes (entra al sameAs y a llms.txt).
-- · Portadas para compartir de servicios y casos (public/og/, generadas desde /dev/cover/<slug>?tipo=…), solo donde no hay nada.
--   Sin tocar updated_at: cambia la imagen, no el contenido, y esa fecha es el dateModified del caso y el lastmod del sitemap.
UPDATE "seo_metadata" SET "title" = 'Burrow Labs | Empresa de desarrollo de software en Bolivia', "updated_at" = now()
WHERE "path" = '/' AND "title" = 'Burrow Labs | Software a medida en Bolivia';
--> statement-breakpoint
UPDATE "seo_metadata" SET "description" = 'Empresa de desarrollo de software de Bolivia, con oficina en Cochabamba: sistemas a medida, apps móviles, automatización e IA, con precios base publicados.', "updated_at" = now()
WHERE "path" = '/' AND "description" = 'Software studio de Bolivia con base en Cochabamba: sistemas a medida, apps móviles, automatización e IA para empresas de Bolivia y del exterior.';
--> statement-breakpoint
UPDATE "seo_metadata" SET "title" = 'Burrow Labs: empresa de software en Cochabamba, Bolivia', "updated_at" = now()
WHERE "path" = '/nosotros' AND "title" = 'Burrow Labs | Software studio en Cochabamba, Bolivia';
--> statement-breakpoint
UPDATE "seo_metadata" SET "description" = 'Quiénes somos y cómo trabajamos: una empresa de desarrollo de software de Bolivia, con base en Cochabamba, que entiende el proceso antes de programar.', "updated_at" = now()
WHERE "path" = '/nosotros' AND "description" = 'Quiénes somos y cómo trabajamos: un software studio de Bolivia, con base en Cochabamba, que entiende el proceso antes de programar. Para Bolivia y el exterior.';
--> statement-breakpoint
UPDATE "seo_metadata" SET "title" = 'Precios de páginas web y sistemas en Bolivia', "updated_at" = now()
WHERE "path" = '/planes' AND "title" = 'Precios de páginas web y sistemas a medida en Bolivia';
--> statement-breakpoint
UPDATE "seo_metadata" SET "description" = 'Empresa de desarrollo de software de Bolivia, con base en Cochabamba. Contanos cómo funciona hoy tu proceso y te proponemos qué automatizar o integrar.', "updated_at" = now()
WHERE "path" = '/contacto' AND "description" = 'Software studio de Bolivia con base en Cochabamba. Contanos cómo funciona hoy tu proceso y te proponemos qué automatizar, integrar o convertir en sistema.';
--> statement-breakpoint
UPDATE "seo_metadata" SET "description" = 'Desarrollo de software y desarrollo web en Cochabamba: sistemas a medida, páginas web, apps, automatización e IA para empresas de Bolivia y del exterior.', "updated_at" = now()
WHERE "path" = '/desarrollo-de-software-cochabamba' AND "description" = 'Software studio en Cochabamba, Bolivia: sistemas a medida, apps móviles, automatización, integraciones e IA para empresas de Bolivia y del exterior.';
--> statement-breakpoint
UPDATE "seo_metadata" SET "noindex" = true, "updated_at" = now()
WHERE "path" = '/clientes' AND "noindex" = false;
--> statement-breakpoint
UPDATE "site_settings" SET "value" = jsonb_set("value", '{description}', to_jsonb('Burrow Labs es una empresa de desarrollo de software de Bolivia, con base en Cochabamba, que construye sistemas a medida, aplicaciones móviles, automatizaciones, integraciones e IA aplicada para empresas de Bolivia y del exterior.'::text)), "updated_at" = now()
WHERE "key" = 'seo' AND "value"->>'description' = 'Burrow Labs es un software studio de Bolivia que construye sistemas a medida, aplicaciones móviles, automatizaciones, integraciones e IA aplicada para empresas de Bolivia y del exterior.';
--> statement-breakpoint
UPDATE "site_settings" SET "value" = jsonb_set("value", '{body}', to_jsonb(replace("value"->>'body', 'Conectamos sistemas, eliminamos tareas repetitivas y construimos herramientas para operar con menos trabajo manual: sistemas web, aplicaciones móviles, automatizaciones, integraciones e IA aplicada.', 'Somos una empresa de desarrollo de software de Bolivia, con base en Cochabamba. Conectamos sistemas, eliminamos tareas repetitivas y construimos herramientas para operar con menos trabajo manual: [sistemas web, aplicaciones móviles, automatizaciones, integraciones e IA aplicada](/servicios). Dos ejemplos: [Apple Boss](/proyectos/apple-boss) y [Commerce Intelligence](/proyectos/commerce-intelligence).'))), "updated_at" = now()
WHERE "key" = 'about' AND strpos("value"->>'body', 'Conectamos sistemas, eliminamos tareas repetitivas y construimos herramientas para operar con menos trabajo manual: sistemas web, aplicaciones móviles, automatizaciones, integraciones e IA aplicada.') > 0;
--> statement-breakpoint
UPDATE "site_settings" SET "value" = "value" || jsonb_build_object('techbehemoths', 'https://techbehemoths.com/company/burrow-labs'::text), "updated_at" = now()
WHERE "key" = 'social' AND coalesce("value"->>'techbehemoths', '') = '';
--> statement-breakpoint
UPDATE "home_sections" SET "content" = jsonb_set("content", '{body}', to_jsonb('Desarrollo de software a medida en Bolivia: sistemas empresariales, automatización e integraciones, IA aplicada, plataformas web y aplicaciones móviles. Elegimos la herramienta después de entender el problema.'::text)), "updated_at" = now()
WHERE "key" = 'services' AND "content"->>'body' = 'Sistemas empresariales, automatización e integraciones, IA aplicada y plataformas web. Elegimos la herramienta después de entender el problema.';
--> statement-breakpoint
UPDATE "services" SET "solution" = replace("solution", 'Y si el problema se resuelve mejor sin IA, te lo decimos.', 'Y si el problema se resuelve mejor sin IA, te lo decimos: en el Lab explicamos [dónde sí conviene usar IA y dónde no](/lab/ia-en-procesos-reales).'), "updated_at" = now()
WHERE "slug" = 'inteligencia-artificial' AND strpos("solution", 'Y si el problema se resuelve mejor sin IA, te lo decimos.') > 0 AND strpos("solution", '/lab/ia-en-procesos-reales') = 0;
--> statement-breakpoint
UPDATE "services" SET "tagline" = 'Páginas web y plataformas conectadas con cómo trabaja la empresa.', "updated_at" = now()
WHERE "slug" = 'web-y-ecommerce' AND "tagline" = 'Una web conectada con cómo trabaja la empresa.';
--> statement-breakpoint
UPDATE "services" SET "solution" = replace("solution", 'Construimos plataformas públicas y privadas, sitios administrables, e-commerce, catálogos B2B y portales conectados con la operación interna.', 'Construimos plataformas públicas y privadas, sitios administrables, e-commerce, catálogos B2B y portales conectados con la operación interna. Hacemos desarrollo web y páginas web desde Cochabamba, para empresas de toda Bolivia y del exterior, y los [planes web](/planes) tienen precio base publicado.'), "updated_at" = now()
WHERE "slug" = 'web-y-ecommerce' AND strpos("solution", 'Construimos plataformas públicas y privadas, sitios administrables, e-commerce, catálogos B2B y portales conectados con la operación interna.') > 0 AND strpos("solution", 'desarrollo web y páginas web') = 0;
--> statement-breakpoint
UPDATE "faqs" SET "answer" = replace("answer", 'El valor final se confirma por escrito antes de comenzar, después de entender qué necesitás.', 'El valor final se confirma por escrito antes de comenzar, después de entender qué necesitás. Qué mueve el precio, explicado por tramos: [cuánto cuesta un sistema a medida en Bolivia](/lab/cuanto-cuesta-un-sistema-a-medida-en-bolivia).'), "updated_at" = now()
WHERE "question" = '¿Cuánto cuesta desarrollar un sistema a medida?' AND strpos("answer", 'El valor final se confirma por escrito antes de comenzar, después de entender qué necesitás.') > 0 AND strpos("answer", '/lab/cuanto-cuesta') = 0;
--> statement-breakpoint
UPDATE "posts" SET "seo_description" = 'Qué define el precio de un software a medida en Bolivia: módulos, usuarios, integraciones y reglas. Tramos, precios base y cómo pedir una cotización.', "updated_at" = now()
WHERE "slug" = 'cuanto-cuesta-un-sistema-a-medida-en-bolivia' AND "seo_description" = 'Qué define el precio de un software a medida en Bolivia: módulos, usuarios, integraciones y reglas. Tramos reales, precios base publicados y cómo pedir una cotización comparable.';
--> statement-breakpoint
UPDATE "posts" SET "content" = replace("content", 'nosotros también somos una empresa de software de Bolivia.', 'nosotros también somos [una empresa de software de Bolivia](/).'), "updated_at" = now()
WHERE "slug" = 'empresas-de-desarrollo-de-software-en-bolivia' AND strpos("content", 'nosotros también somos una empresa de software de Bolivia.') > 0;
--> statement-breakpoint
UPDATE "posts" SET "content" = replace("content", 'Burrow Labs es un software studio de Bolivia con base en Cochabamba.', 'Burrow Labs es una [empresa de desarrollo de software de Bolivia](/) con base en [Cochabamba](/desarrollo-de-software-cochabamba).'), "updated_at" = now()
WHERE "slug" = 'empresas-de-desarrollo-de-software-en-bolivia' AND strpos("content", 'Burrow Labs es un software studio de Bolivia con base en Cochabamba.') > 0;
--> statement-breakpoint
UPDATE "services" SET "og_image" = '/og/servicios/' || "slug" || '.png'
WHERE "slug" IN ('sistemas-empresariales', 'automatizacion', 'inteligencia-artificial', 'web-y-ecommerce', 'aplicaciones-moviles') AND ("og_image" IS NULL OR "og_image" = '');
--> statement-breakpoint
UPDATE "projects" SET "og_image" = '/og/proyectos/' || "slug" || '.png'
WHERE "slug" IN ('apple-boss', 'plataforma-industrial-de-trazabilidad', 'asistente-de-ventas-con-ia', 'plataforma-b2b-de-catalogo-y-pedidos', 'cotizaciones-tecnicas', 'commerce-intelligence', 'crm-inmobiliario', 'control-de-operaciones-y-produccion') AND ("og_image" IS NULL OR "og_image" = '');
