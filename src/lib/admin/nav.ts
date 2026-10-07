// Estructura del menú del panel. Sin "use client": la leen tanto el sidebar como las páginas de servidor (cejilla de los títulos).
// «Contenido» sigue el mismo orden que la navegación pública (src/components/site/nav.ts): Servicios, Proyectos, Planes, Lab, Nosotros y las herramientas.
import {
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CircleHelp,
  ClipboardList,
  History,
  LifeBuoy,
  Home,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Mail,
  MessageCircle,
  Package,
  Scale,
  Settings,
  UserRound,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { SERVER_SLUG, settingsHref } from "./settings-guide";

export type NavChild = { href: string; label: string };
export type NavItem = { href: string; label: string; icon: LucideIcon; /** Subpantallas: el ítem se despliega en el menú. */ children?: NavChild[] };
export type NavGroup = { title: string; items: NavItem[] };

export const ADMIN_NAV: NavGroup[] = [
  {
    title: "Panel",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/actividad", label: "Actividad", icon: History },
      { href: "/admin/guia", label: "Guía", icon: LifeBuoy },
    ],
  },
  {
    title: "Contenido",
    items: [
      { href: "/admin/home", label: "Home", icon: Home },
      { href: "/admin/servicios", label: "Servicios", icon: Wrench },
      {
        href: "/admin/proyectos",
        label: "Proyectos",
        icon: Briefcase,
        children: [
          { href: "/admin/proyectos", label: "Casos" },
          { href: "/admin/categorias-de-proyectos", label: "Categorías" },
        ],
      },
      {
        href: "/admin/planes",
        label: "Planes",
        icon: Package,
        children: [
          { href: "/admin/planes", label: "Planes" },
          { href: settingsHref("aviso-de-planes"), label: "Aviso de precios" },
        ],
      },
      {
        href: "/admin/blog",
        label: "Lab (blog)",
        icon: BookOpen,
        children: [
          { href: "/admin/blog", label: "Artículos" },
          { href: "/admin/categorias-del-blog", label: "Categorías" },
        ],
      },
      { href: settingsHref("nosotros"), label: "Nosotros", icon: Users },
      { href: "/admin/faq", label: "FAQ", icon: CircleHelp },
      {
        href: "/admin/clientes",
        label: "Clientes",
        icon: Building2,
        children: [
          { href: "/admin/clientes", label: "Clientes" },
          { href: "/admin/testimonios", label: "Testimonios" },
          { href: settingsHref("sectores"), label: "Sectores" },
        ],
      },
      { href: settingsHref("legales"), label: "Textos legales", icon: Scale },
    ],
  },
  {
    title: "Captación",
    items: [
      { href: "/admin/leads", label: "Consultas", icon: Inbox },
      { href: "/admin/fichas", label: "Fichas de proyecto", icon: ClipboardList },
      {
        href: "/admin/newsletter",
        label: "Newsletter",
        icon: Mail,
        children: [
          { href: "/admin/newsletter", label: "Suscriptores" },
          { href: "/admin/newsletter/campanas", label: "Campañas" },
        ],
      },
      { href: "/admin/whatsapp", label: "WhatsApp", icon: MessageCircle },
    ],
  },
  {
    title: "Sitio",
    items: [
      {
        href: "/admin/seo",
        label: "SEO",
        icon: BarChart3,
        children: [
          { href: "/admin/seo", label: "Por página" },
          { href: settingsHref("seo"), label: "Por defecto" },
        ],
      },
      { href: "/admin/media", label: "Media", icon: ImageIcon },
      {
        href: "/admin/configuracion",
        label: "Configuración",
        icon: Settings,
        children: [
          { href: "/admin/configuracion", label: "Resumen" },
          { href: settingsHref("contacto"), label: "Contacto" },
          { href: settingsHref("redes"), label: "Redes sociales" },
          { href: settingsHref("frases"), label: "Frases de marca" },
          { href: settingsHref(SERVER_SLUG), label: "Servidor" },
        ],
      },
      { href: "/admin/usuarios", label: "Usuarios", icon: Users },
      { href: "/admin/cuenta", label: "Mi cuenta", icon: UserRound },
    ],
  },
];

// Recursos que viven bajo otro ítem del menú.
export const NAV_PARENT: Record<string, string> = { "/admin/categorias-de-proyectos": "/admin/proyectos", "/admin/categorias-del-blog": "/admin/blog", "/admin/testimonios": "/admin/clientes" };

/** Nombre del grupo del menú al que pertenece una ruta (cejilla de los títulos). */
export function navGroupFor(href: string): string | undefined {
  const path = NAV_PARENT[href] ?? href;
  return ADMIN_NAV.find((group) => group.items.some((item) => item.href === path || item.children?.some((child) => child.href === path)))?.title;
}

/** Ítem con subpantallas al que pertenece una ruta (el ítem o alguna de sus subpantallas la contiene). */
export function navParentFor(path: string): NavItem | undefined {
  return ADMIN_NAV.flatMap((group) => group.items).find((item) => item.children?.some((child) => path === child.href || path.startsWith(`${child.href}/`)));
}
