// Guía de Configuración: qué es cada bloque, dónde se ve en el sitio, cómo completarlo y cómo se llama cada campo.
// Es la única fuente para el menú lateral, el resumen y las pantallas de cada bloque.
import { BadgeDollarSign, Globe, Mail, Quote, Scale, Server, Share2, Sparkles, Users, type LucideIcon } from "lucide-react";
import type { Settings } from "@/lib/content";
import { hasPendingMarkers } from "@/lib/legal-draft";
import type { SettingsGroup } from "./settings-shape";

export type FieldGuide = { label?: string; hint?: string; placeholder?: string };
export type GroupStatus = { ok: boolean; text: string };
export type SettingsGuide = {
  group: SettingsGroup;
  slug: string;
  title: string;
  icon: LucideIcon;
  /** Qué es, en una o dos frases. */
  what: string;
  /** Dónde se ve en el sitio (enlaces públicos). Vacío = todavía no se muestra. */
  where: { label: string; href: string }[];
  /** Cómo completarlo, paso a paso. */
  steps: string[];
  /** Solo estas claves del grupo se editan en esta pantalla (el resto las edita otra pantalla). */
  only?: string[];
  /** En qué parte del menú vive: los bloques que son contenido del sitio van en «Contenido», en el orden de la navegación pública. */
  menu: { group: "Contenido" | "Sitio"; label: string };
  fields: Record<string, FieldGuide>;
  status: (settings: Settings) => GroupStatus;
};

const filled = (value: string) => value.trim().length > 0;

export const SETTINGS_GUIDE: SettingsGuide[] = [
  {
    group: "contact",
    slug: "contacto",
    menu: { group: "Sitio", label: "Configuración › Contacto" },
    title: "Contacto",
    icon: Mail,
    what: "El email público del estudio. Es a donde escribe la gente que prefiere el correo antes que WhatsApp.",
    where: [
      { label: "Pie de página (todas las páginas)", href: "/" },
      { label: "Página de contacto", href: "/contacto" },
    ],
    steps: ["Escribí el email que querés que vea la gente.", "Guardá: aparece en el pie y en /contacto al instante.", "El número de WhatsApp no va acá: se configura en Captación › WhatsApp."],
    only: ["email"],
    fields: { email: { label: "Email público", hint: "Vacío = no se muestra en ninguna parte.", placeholder: "hola@burrowlabs.com.bo" } },
    status: ({ contact }) => (filled(contact.email) ? { ok: true, text: "Listo" } : { ok: false, text: "Falta el email" }),
  },
  {
    group: "social",
    slug: "redes",
    menu: { group: "Sitio", label: "Configuración › Redes sociales" },
    title: "Redes sociales",
    icon: Share2,
    what: "Los perfiles del estudio en redes. Solo se muestran los que tengan dirección.",
    where: [
      { label: "Pie de página (todas las páginas)", href: "/" },
      { label: "Página de contacto (solo Instagram)", href: "/contacto" },
    ],
    steps: ["Pegá la dirección completa del perfil, empezando por https://.", "Dejá vacías las redes que no uses: no aparecen.", "Instagram además se muestra en la página de contacto.", "La ficha de Google no es una red, pero va acá: le confirma a los buscadores que el estudio y la ficha verificada son lo mismo."],
    fields: {
      instagram: { label: "Instagram", placeholder: "https://www.instagram.com/burrowlabsbo/" },
      linkedin: { label: "LinkedIn", placeholder: "https://www.linkedin.com/company/burrow-labs/" },
      github: { label: "GitHub", placeholder: "https://github.com/burrow-labs-bo" },
      facebook: { label: "Facebook", placeholder: "https://www.facebook.com/burrowlabs" },
      tiktok: { label: "TikTok", placeholder: "https://www.tiktok.com/@burrowlabs" },
      x: { label: "X (Twitter)", placeholder: "https://x.com/burrowlabs" },
      googleMaps: { label: "Ficha de Google (Maps)", hint: "La dirección de tu ficha verificada. Abrí la ficha en Google Maps, tocá «Compartir» y copiá el enlace.", placeholder: "https://maps.app.goo.gl/..." },
    },
    status: ({ social }) => {
      const count = Object.values(social).filter(filled).length;
      return count ? { ok: true, text: `${count} ${count === 1 ? "red cargada" : "redes cargadas"}` } : { ok: false, text: "Sin redes" };
    },
  },
  {
    group: "seo",
    slug: "seo",
    menu: { group: "Sitio", label: "SEO › Por defecto" },
    title: "SEO",
    icon: Globe,
    what: "Cómo se presenta el sitio en Google y cuando alguien comparte un enlace por WhatsApp, Facebook o LinkedIn.",
    where: [
      { label: "Pestaña del navegador y resultados de Google (todas las páginas)", href: "/" },
      { label: "Vista previa al compartir un enlace", href: "/" },
      { label: "Datos del negocio para Google (SEO local)", href: "/contacto" },
    ],
    steps: [
      "Nombre del sitio: tal cual querés que aparezca.",
      "Plantilla del título: «%s» se reemplaza por el título de cada página.",
      "Descripción: entre 120 y 160 caracteres, con qué hacés y para quién.",
      "Imagen al compartir: una imagen de Media de 1200×630; vacío = el logo.",
      "Dirección, ciudad, departamento y país: para que Google asocie el estudio a su lugar. La calle, igual que en tu ficha de Google.",
    ],
    fields: {
      siteName: { label: "Nombre del sitio", placeholder: "Burrow Labs" },
      titleTemplate: { label: "Plantilla del título de las páginas", hint: "«%s» es el título de cada página. Con «%s · Burrow Labs», la página de planes se titula «Planes · Burrow Labs».", placeholder: "%s · Burrow Labs" },
      description: { label: "Descripción por defecto", hint: "Lo que Google muestra bajo el título cuando la página no tiene una propia. Entre 120 y 160 caracteres funciona mejor." },
      ogImage: { label: "Imagen al compartir un enlace", hint: "Ruta de una imagen subida en Media (empieza con /media/) o una dirección completa. Recomendado 1200×630. Vacío = el logo.", placeholder: "/media/portada.webp" },
      locale: { label: "Idioma y región", hint: "Código para las redes sociales: es_BO para Bolivia. No lo cambies salvo que el sitio cambie de idioma.", placeholder: "es_BO" },
      street: { label: "Calle y número", hint: "Tal cual figura en la ficha de Google, carácter por carácter: los buscadores cruzan las dos. Vacío = solo la ciudad.", placeholder: "Av. San Martín 123, Edificio Las Palmas, piso 2, oficina 4" },
      city: { label: "Ciudad", hint: "Dónde está el estudio. Vacío = sin SEO local.", placeholder: "Santa Cruz de la Sierra" },
      region: { label: "Departamento", placeholder: "Santa Cruz" },
      country: { label: "País (código de 2 letras)", hint: "BO para Bolivia.", placeholder: "BO" },
    },
    status: ({ seo }) => (!filled(seo.description) || !filled(seo.siteName) ? { ok: false, text: "Falta la descripción" } : filled(seo.city) ? { ok: true, text: "Listo" } : { ok: true, text: "Listo · sin ciudad (SEO local)" }),
  },
  {
    group: "sectors",
    slug: "sectores",
    menu: { group: "Contenido", label: "Clientes › Sectores" },
    title: "Sectores",
    icon: Sparkles,
    what: "Los rubros para los que construís. Se muestran en lugar de los logos de clientes mientras no haya clientes autorizados.",
    where: [
      { label: "Home › sección de confianza", href: "/" },
      { label: "Página de clientes", href: "/clientes" },
    ],
    steps: ["Un sector por línea.", "Entre 5 y 8 se ven bien; más se amontonan.", "Cuando haya clientes autorizados con logo, esta lista deja de mostrarse sola."],
    fields: { sectors: { label: "Sectores", hint: "Uno por línea.", placeholder: "Industria\nComercio\nServicios" } },
    status: ({ sectors }) => (sectors.length ? { ok: true, text: `${sectors.length} sectores` } : { ok: false, text: "Vacío" }),
  },
  {
    group: "plansDisclaimer",
    slug: "aviso-de-planes",
    menu: { group: "Contenido", label: "Planes › Aviso de precios" },
    title: "Aviso de planes",
    icon: BadgeDollarSign,
    what: "La aclaración que acompaña a los precios: que son puntos de partida y cuándo se confirma el alcance.",
    where: [
      { label: "Página de planes (arriba y bajo la tabla)", href: "/planes" },
      { label: "Home › planes", href: "/" },
    ],
    steps: ["Una sola oración, clara.", "Decí que son precios base y en qué momento se confirma el alcance final."],
    fields: { plansDisclaimer: { label: "Aviso", placeholder: "Precio base. El alcance final se confirma antes de comenzar." } },
    status: ({ plansDisclaimer }) => (filled(plansDisclaimer) ? { ok: true, text: "Listo" } : { ok: false, text: "Vacío" }),
  },
  {
    group: "about",
    slug: "nosotros",
    menu: { group: "Contenido", label: "Nosotros" },
    title: "Nosotros",
    icon: Users,
    what: "La página Nosotros: el titular, la historia del estudio, la visión y los valores.",
    where: [{ label: "Página Nosotros", href: "/nosotros" }],
    steps: [
      "Titular: una frase que resuma por qué existe el estudio.",
      "Historia: en Markdown (## para subtítulos, **negrita**). Quiénes son, cómo trabajan, qué los diferencia.",
      "Visión: hacia dónde va el estudio. Vacío = esa parte no se muestra.",
      "Valores: una línea por valor, con el nombre y la descripción separados por «|».",
    ],
    fields: {
      headline: { label: "Titular", placeholder: "Pequeños por diseño. Obsesionados con resolver." },
      body: { label: "Historia", hint: "Markdown. Contá quiénes son, cómo trabajan y qué los diferencia." },
      vision: { label: "Visión", hint: "Markdown. Vacío = la sección no se muestra." },
      values: { label: "Valores", hint: "Una línea por valor: nombre | descripción. Ejemplo: Claridad | Explicamos qué vamos a hacer, cuánto cuesta y cuándo.", placeholder: "Claridad | Explicamos qué vamos a hacer, cuánto cuesta y cuándo." },
    },
    status: ({ about }) => (filled(about.body) ? { ok: true, text: "Listo" } : { ok: false, text: "Falta la historia" }),
  },
  {
    group: "legal",
    slug: "legales",
    menu: { group: "Contenido", label: "Textos legales" },
    title: "Textos legales",
    icon: Scale,
    what: "Privacidad, términos y cookies. El sitio los enlaza desde el pie y desde el consentimiento del formulario de contacto.",
    where: [
      { label: "Política de privacidad", href: "/privacidad" },
      { label: "Términos y condiciones", href: "/terminos" },
      { label: "Política de cookies", href: "/cookies" },
    ],
    steps: ["Markdown: ## para cada sección.", "Hacelos revisar por alguien de legales antes de publicar.", "Cuando un texto quede aprobado, borrá el aviso «Borrador pendiente de revisión legal» del inicio: mientras lo tenga, la página sale sin indexar."],
    fields: {
      privacy: { label: "Política de privacidad", hint: "Markdown. Qué datos se guardan, para qué y cómo pedir que se borren." },
      terms: { label: "Términos y condiciones", hint: "Markdown. Quién es el titular del sitio y en qué condiciones se usa." },
      cookies: { label: "Política de cookies", hint: "Markdown. Qué cookies usa el sitio y cómo elegir." },
    },
    status: ({ legal }) => {
      const texts = Object.values(legal);
      if (texts.some((text) => !filled(text))) return { ok: false, text: "Falta un texto" };
      return texts.some(hasPendingMarkers) ? { ok: false, text: "Borrador: falta aprobar algún texto" } : { ok: true, text: "Listo" };
    },
  },
  {
    group: "brandPhrases",
    slug: "frases",
    menu: { group: "Sitio", label: "Configuración › Frases de marca" },
    title: "Frases de marca",
    icon: Quote,
    what: "Frases cortas con la voz del estudio. Corren en la cinta del Home (debajo del hero) y rotan de a una en el pie de página; sin frases, queda «Codificando soluciones.».",
    where: [
      { label: "Home › cinta de frases bajo el hero (se puede ocultar desde Home)", href: "/" },
      { label: "Pie de página, debajo del logo (rotan cada 4,5 s)", href: "/" },
    ],
    steps: ["Una frase por línea; la primera es la que se ve al cargar.", "Cortas y en primera persona del plural: construimos, automatizamos, resolvemos.", "Entre 3 y 10 frases funciona bien; con una sola no hay rotación."],
    fields: { brandPhrases: { label: "Frases", hint: "Una por línea.", placeholder: "Codificando soluciones.\nNo empezamos por el código. Empezamos por entender cómo trabaja tu negocio." } },
    status: ({ brandPhrases }) => (brandPhrases.length ? { ok: true, text: `${brandPhrases.length} frases rotando` } : { ok: true, text: "Sin frases: se ve «Codificando soluciones.»" }),
  },
];

/** El bloque «Servidor» no es un grupo de settings: son valores del entorno, solo lectura. */
export const SERVER_SLUG = "servidor";
export const SERVER_ICON: LucideIcon = Server;

export const settingsHref = (slug: string) => `/admin/configuracion/${slug}`;
export const guideBySlug = (slug: string) => SETTINGS_GUIDE.find((guide) => guide.slug === slug);
export const slugForGroup = (group: string) => SETTINGS_GUIDE.find((guide) => guide.group === group)?.slug;
