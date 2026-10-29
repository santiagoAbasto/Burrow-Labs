import type { JsonShape } from "./json-form";

// Forma de cada grupo de `site_settings` para generar su formulario. Los arrays llevan una fila de
// muestra (define las columnas); el contenido real viene de la base. La guía (títulos, pasos, campos)
// está en settings-guide.ts.
export const SETTINGS_SHAPE = {
  contact: { email: "", whatsappPhone: "", whatsappEnabled: true, whatsappTooltip: "", whatsappGreeting: "", whatsappDefaultMessage: "" },
  social: { instagram: "", linkedin: "", github: "", facebook: "", tiktok: "", x: "", googleMaps: "", techbehemoths: "" },
  seo: { siteName: "", titleTemplate: "", description: "", ogImage: "", locale: "", street: "", city: "", region: "", country: "" },
  sectors: [""],
  brandPhrases: [""],
  plansDisclaimer: "",
  about: { headline: "", body: "\n", vision: "", values: [{ name: "", description: "" }] },
  legal: { privacy: "", terms: "", cookies: "" },
} satisfies Record<string, JsonShape>;

export type SettingsGroup = keyof typeof SETTINGS_SHAPE;
