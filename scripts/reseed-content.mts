// Vuelve a sembrar el contenido editorial del sitio desde src/db/seed-content.ts (solo desarrollo):
//   pnpm exec tsx scripts/reseed-content.mts
// Borra proyectos, servicios, planes, FAQ, secciones del Home, SEO por ruta y las claves de configuración
// de contenido (about, seo, brandPhrases, plansDisclaimer, sectors, legal) y los artículos sembrados. Conserva
// contacto, redes, medios, artículos propios, consultas, suscriptores, campañas, analítica y usuarios.
// OJO: pisa los textos legales con el borrador del seed. Se niega en producción.
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
registerHooks({
  resolve: (specifier, context, nextResolve) =>
    nextResolve(specifier, specifier === "server-only" ? { ...context, conditions: [...context.conditions, "react-server"] } : context),
});

async function main() {
  if (process.env.NODE_ENV === "production") throw new Error("reseed-content solo corre en desarrollo.");
  const { inArray } = await import("drizzle-orm");
  const { client, db } = await import("../src/db/index");
  const { faqs, homeSections, planFeatures, plans, posts, projects, seoMetadata, services, siteSettings } = await import("../src/db/schema");
  const { POSTS } = await import("../src/db/seed/posts");
  const { seedContent } = await import("../src/db/seed-content");
  try {
    await db.delete(projects);
    await db.delete(services);
    await db.delete(planFeatures);
    await db.delete(plans);
    await db.delete(faqs);
    await db.delete(homeSections);
    await db.delete(seoMetadata);
    await db.delete(posts).where(inArray(posts.slug, POSTS.map((post) => post.slug)));
    await db.delete(siteSettings).where(inArray(siteSettings.key, ["about", "seo", "brandPhrases", "plansDisclaimer", "sectors", "legal"]));
    await seedContent(db);
    console.log("Contenido sembrado de nuevo. El sitio lo muestra al vencer su caché (hasta 5 minutos) o al guardar algo en el panel.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
