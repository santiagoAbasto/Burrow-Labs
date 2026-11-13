import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { SeasonProvider } from "@/components/season/provider";
import { seasonAttributes, type SeasonState } from "@/lib/season";
import { publicSeason } from "@/lib/season-server";
import "./globals.css";

// Archivo variable con los ejes wght (100–900) y wdth (62–125): una sola familia
// para display y texto. next/font genera el fallback con métricas ajustadas (sin CLS).
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: { default: "Burrow Labs — Codificando soluciones.", template: "%s · Burrow Labs" },
  description:
    "Software studio boliviano. Webs, sistemas y automatización: tecnología creada para hacer crecer tu negocio.",
};

export const viewport: Viewport = {
  themeColor: "#EDEDED", // paper: la superficie
};

/**
 * Antes del primer pintado: el HTML llega con los atributos del sitio público (las páginas son estáticas y no saben
 * en qué ruta se sirven); en el panel o en las rutas sin campaña este script los cambia por los de esa superficie, y
 * respeta «Reducir efectos». Solo se emite con la campaña encendida. La misma regla vive en surfaceOf().
 */
function seasonBootScript(state: SeasonState): string {
  const attrs = { site: seasonAttributes(state.site), admin: seasonAttributes(state.admin) };
  return `(function(a){var h=document.documentElement,p=location.pathname,s=p==="/admin"||p.indexOf("/admin/")===0?"admin":/^\\/(api|dev|ficha|media)(\\/|$)/.test(p)?null:"site",w=s?a[s]:{},k;for(k in a.site)if(!(k in w))h.removeAttribute(k);for(k in w)h.setAttribute(k,w[k]);try{if(w["data-season"]&&localStorage.getItem("burrowlabs:season-effects")==="reduced")h.setAttribute("data-season-still","")}catch(e){}})(${JSON.stringify(attrs)})`;
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { state, scheduled } = await publicSeason();
  const on = state.site !== null || state.admin !== null;
  // data-scroll-behavior: Next 16 ya no apaga el scroll suave al navegar; sin esto la vuelta arriba quedaba a medio camino.
  // suppressHydrationWarning: los atributos data-season de <html> los ajusta el script de arranque según la ruta.
  return (
    <html lang="es-BO" data-scroll-behavior="smooth" className={`${archivo.variable} ${jetbrainsMono.variable}`} {...seasonAttributes(state.site)} suppressHydrationWarning>
      <body>
        <SeasonProvider initial={state} check={scheduled} boot={on ? seasonBootScript(state) : undefined}>
          {children}
        </SeasonProvider>
      </body>
    </html>
  );
}
