-- Dos títulos SEO pasaban del largo del roadmap (46 caracteres + « · Burrow Labs») y el de apps encerraba el servicio en
-- Cochabamba: Burrow Labs trabaja para toda Bolivia y el exterior. Solo si siguen siendo el texto sembrado.
UPDATE "posts"
SET "seo_title" = 'Empresas de desarrollo de software en Bolivia', "updated_at" = now()
WHERE "slug" = 'empresas-de-desarrollo-de-software-en-bolivia'
  AND "seo_title" = 'Empresas de desarrollo de software en Bolivia (2026)';
--> statement-breakpoint
UPDATE "services"
SET "seo_title" = 'Desarrollo de aplicaciones móviles en Bolivia', "updated_at" = now()
WHERE "slug" = 'aplicaciones-moviles'
  AND "seo_title" = 'Desarrollo de aplicaciones móviles en Cochabamba';
