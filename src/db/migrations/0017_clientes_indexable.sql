-- /clientes vuelve a ser indexable (06/11/2026, a pedido del dueño): ya hay un cliente autorizado y publicado
-- (Ninth Group). Revierte el noindex de 0014; si alguien ya lo cambió en Admin → SEO, no se toca. Sin noindex,
-- la ruta vuelve sola al sitemap.
UPDATE "seo_metadata" SET "noindex" = false, "updated_at" = now()
WHERE "path" = '/clientes' AND "noindex" = true;
