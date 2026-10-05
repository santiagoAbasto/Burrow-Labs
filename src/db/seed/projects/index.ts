// Casos de estudio en el orden en que se publican. El primero es el producto propio.
import { project as appleBoss } from "./apple-boss";
import { project as asistenteVentasIa } from "./asistente-de-ventas-con-ia";
import { project as commerceIntelligence } from "./commerce-intelligence";
import { project as controlOperaciones } from "./control-de-operaciones-y-produccion";
import { project as cotizacionesTecnicas } from "./cotizaciones-tecnicas";
import { project as crmInmobiliario } from "./crm-inmobiliario";
import { project as plataformaB2b } from "./plataforma-b2b-de-catalogo-y-pedidos";
import { project as trazabilidadIndustrial } from "./plataforma-industrial-de-trazabilidad";
import type { SeedProject } from "./types";

export const PROJECTS: SeedProject[] = [
  appleBoss,
  trazabilidadIndustrial,
  asistenteVentasIa,
  plataformaB2b,
  cotizacionesTecnicas,
  commerceIntelligence,
  crmInmobiliario,
  controlOperaciones,
];

export type { SeedProject } from "./types";
export { PROJECT_BADGES, PROJECT_VISUALS, SERVICE_SLUGS } from "./types";
export type { ServiceSlug } from "./types";
