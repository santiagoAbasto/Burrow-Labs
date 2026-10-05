import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/content";

// Los colores son los tokens de globals.css en hex (el manifest no admite variables): paper, igual que el themeColor del layout.
const PAPER = "#ededed";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { seo } = await getSettings();
  return {
    name: seo.siteName,
    short_name: seo.siteName,
    description: seo.description,
    lang: seo.locale.replace("_", "-"),
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: PAPER,
    theme_color: PAPER,
    icons: [
      { src: "/icon1.png", sizes: "192x192", type: "image/png" },
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
