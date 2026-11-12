-- SEO del 12/11/2026 (Search Console de 3 meses: «empresa de software» es la consulta con más impresiones y «software
-- cochabamba» no tiene ninguna). Solo datos; cada cambio se aplica únicamente si el campo sigue con el texto de producción:
-- lo que alguien editó en el panel no se toca.
-- · La página local compite por «empresa de software en Cochabamba»; /nosotros deja ese título para no pisarse con ella.
-- · El mapa de empresas de Bolivia pierde a SYSBOL (sysbol.com.bo ya no tiene DNS: enlace roto) y apunta al mapa nuevo de
--   Cochabamba, que entra por el seed (src/db/seed/posts.ts) en el arranque.
UPDATE "seo_metadata" SET "title" = 'Empresa de software en Cochabamba', "updated_at" = now()
WHERE "path" = '/desarrollo-de-software-cochabamba' AND "title" = 'Desarrollo de software a medida en Cochabamba';
--> statement-breakpoint
UPDATE "seo_metadata" SET "description" = 'Empresa de software en Cochabamba: desarrollo de software a medida, páginas web, apps, automatización e IA para empresas de Bolivia y del exterior.', "updated_at" = now()
WHERE "path" = '/desarrollo-de-software-cochabamba' AND "description" = 'Desarrollo de software y desarrollo web en Cochabamba: sistemas a medida, páginas web, apps, automatización e IA para empresas de Bolivia y del exterior.';
--> statement-breakpoint
UPDATE "seo_metadata" SET "title" = 'Quiénes somos: el equipo detrás de Burrow Labs', "updated_at" = now()
WHERE "path" = '/nosotros' AND "title" = 'Burrow Labs: empresa de software en Cochabamba, Bolivia';
--> statement-breakpoint
UPDATE "posts" SET "content" = replace("content", E'\n- **[SYSBOL](https://sysbol.com.bo)**. Páginas web, sistemas y soluciones digitales para empresas.', ''), "updated_at" = now()
WHERE "slug" = 'empresas-de-desarrollo-de-software-en-bolivia' AND strpos("content", '(https://sysbol.com.bo)') > 0;
--> statement-breakpoint
UPDATE "posts" SET "content" = replace("content", E'**Cochabamba**\n\n- **[Altalos]', E'**Cochabamba** (con más detalle en [el mapa de empresas de software de Cochabamba](/lab/empresas-de-software-en-cochabamba))\n\n- **[Altalos]'), "updated_at" = now()
WHERE "slug" = 'empresas-de-desarrollo-de-software-en-bolivia' AND strpos("content", '/lab/empresas-de-software-en-cochabamba') = 0;
