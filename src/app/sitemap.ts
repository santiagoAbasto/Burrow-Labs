import type { MetadataRoute } from "next";
import { hasPendingMarkers } from "@/db/seed/legal";
import { getPost, getPosts, getProject, getProjects, getSeo, getServices, getSettings } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

const STATIC = ["/", "/servicios", "/proyectos", "/planes", "/nosotros", "/clientes", "/lab", "/contacto", "/diagnostico", "/calculadora", "/faq", "/desarrollo-de-software-cochabamba"];

type Entry = { path: string; lastModified?: string };

/**
 * Solo URL públicas, canónicas e indexables. Sin `changefreq` ni `priority`: Google los ignora.
 * `lastmod` solo cuando hay una fecha real de modificación (servicios, proyectos y artículos); el resto va sin fecha.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projects, posts, { legal }] = await Promise.all([getServices(), getProjects(), getPosts(), getSettings()]);
  // Los slugs salen de las listas públicas, así que el detalle por slug existe y ya está cacheado por las páginas.
  const [projectDetails, postDetails] = await Promise.all([
    // Los borradores demo nunca entran al sitemap.
    Promise.all(projects.filter((project) => !project.isDemo).map((project) => getProject(project.slug))),
    Promise.all(posts.map((post) => getPost(post.slug))),
  ]);
  const entries: Entry[] = [
    ...STATIC.map((path) => ({ path })),
    // Un texto legal con marcadores pendientes se publica «noindex» (ver su página): tampoco se anuncia.
    ...[
      { path: "/privacidad", text: legal.privacy },
      { path: "/terminos", text: legal.terms },
      { path: "/cookies", text: legal.cookies },
    ].flatMap(({ path, text }) => (hasPendingMarkers(text) ? [] : [{ path }])),
    ...services.map((service) => ({ path: `/servicios/${service.slug}`, lastModified: service.updatedAt })),
    ...projectDetails.flatMap((project) => (project ? [{ path: `/proyectos/${project.slug}`, lastModified: project.updatedAt }] : [])),
    ...postDetails.flatMap((post) => (post ? [{ path: `/lab/${post.slug}`, lastModified: post.updatedAt }] : [])),
  ];
  // Una ruta marcada «noindex» en Admin → SEO no se anuncia.
  const overrides = await Promise.all(entries.map((entry) => getSeo(entry.path)));
  return entries.filter((_, i) => !overrides[i]?.noindex).map(({ path, lastModified }) => ({ url: absoluteUrl(path), lastModified }));
}
