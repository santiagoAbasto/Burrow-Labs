import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
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

export default function RootLayout({ children }: { children: ReactNode }) {
  // data-scroll-behavior: Next 16 ya no apaga el scroll suave al navegar; sin esto la vuelta arriba quedaba a medio camino.
  return (
    <html lang="es-BO" data-scroll-behavior="smooth" className={`${archivo.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
