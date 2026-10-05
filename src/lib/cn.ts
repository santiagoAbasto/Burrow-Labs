export type ClassValue = string | false | null | undefined;

// ponytail: no resuelve conflictos entre utilidades de Tailwind — el kit pone su
// estilo base en @layer components (ui.css), así que cualquier utilidad lo pisa.
export function cn(...parts: ClassValue[]): string {
  return parts.filter(Boolean).join(" ");
}
