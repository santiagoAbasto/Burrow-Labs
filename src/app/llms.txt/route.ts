import { getPosts, getProjects, getServices, getSettings } from "@/lib/content";
import { hasPendingMarkers } from "@/lib/legal-draft";
import { absoluteUrl } from "@/lib/seo";

const link = (label: string, path: string, note?: string) => `- [${label}](${absoluteUrl(path)})${note ? `: ${note}` : ""}`;

// llms.txt (llmstxt.org): resumen en Markdown del sitio público. Solo datos del CMS y páginas públicas; nada de admin, API ni infraestructura.
// No es un factor de ranking en Google: es una cortesía para agentes que lo pidan.
export async function GET() {
  const [settings, services, projects, posts] = await Promise.all([getSettings(), getServices(), getProjects(), getPosts()]);
  const { seo, contact, social } = settings;
  const cases = projects.filter((project) => !project.isDemo);
  const profiles = Object.values(social).filter((profile) => /^https?:\/\//.test(profile));
  // Igual que el sitemap: un texto legal en borrador no se anuncia.
  const legalLinks = (
    [
      ["Política de privacidad", "/privacidad", settings.legal.privacy],
      ["Términos y condiciones", "/terminos", settings.legal.terms],
      ["Política de cookies", "/cookies", settings.legal.cookies],
    ] as const
  ).flatMap(([label, path, text]) => (hasPendingMarkers(text) ? [] : [link(label, path)]));
  const lines = [
    `# ${seo.siteName}`,
    "",
    `> ${seo.description}`,
    "",
    `Slogan: «Codificando soluciones.» El sitio está en español (${seo.locale.replace("_", "-")}).`,
    // La ciudad es el dato que más piden los asistentes cuando alguien busca un proveedor local.
    ...(seo.city ? [`Ubicación: ${[seo.city, seo.region !== seo.city ? seo.region : "", "Bolivia"].filter(Boolean).join(", ")}. Trabajamos presencialmente en ${seo.city} y en remoto con el resto del país y del exterior.`] : []),
    "",
    "## Servicios",
    ...services.map((service) => link(service.name, `/servicios/${service.slug}`, service.tagline)),
    ...(cases.length ? ["", "## Proyectos y casos de estudio", ...cases.map((project) => link(project.title, `/proyectos/${project.slug}`, project.summary))] : []),
    "",
    "## Páginas principales",
    link("Inicio", "/"),
    link("Servicios", "/servicios"),
    link("Proyectos", "/proyectos"),
    link("Planes y precios base", "/planes", settings.plansDisclaimer),
    link("Nosotros", "/nosotros"),
    link("Desarrollo de software en Cochabamba", "/desarrollo-de-software-cochabamba", "Software a medida, automatización e IA para empresas de Cochabamba y de todo el país."),
    link("Clientes y sectores", "/clientes"),
    link("Lab", "/lab"),
    link("Preguntas frecuentes", "/faq"),
    link("Diagnóstico express", "/diagnostico"),
    link("Calculadora de procesos manuales", "/calculadora"),
    ...(posts.length ? ["", "## Lab (artículos)", ...posts.map((post) => link(post.title, `/lab/${post.slug}`, post.excerpt))] : []),
    "",
    "## Contacto",
    link("Formulario de contacto", "/contacto"),
    ...(contact.email ? [`- Email: ${contact.email}`] : []),
    ...profiles.map((profile) => `- ${profile}`),
    "",
    ...(legalLinks.length ? ["## Optional", ...legalLinks, ""] : []),
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
