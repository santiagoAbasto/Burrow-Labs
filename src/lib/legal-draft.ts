/**
 * Un texto legal es un borrador si está vacío, si le quedan marcadores sin completar o si todavía lleva el aviso
 * de borrador (se quita a mano cuando el texto queda aprobado). Mientras lo sea, su página sale con noindex y fuera
 * del sitemap. Incluye el formato del seed anterior, por si la base todavía lo tiene.
 */
export const hasPendingMarkers = (text: string): boolean =>
  !text.trim() || /\[(?:PENDIENTE DEL PROPIETARIO|DATO POR CONFIRMAR)\b|Borrador pendiente de revisión legal/.test(text);
