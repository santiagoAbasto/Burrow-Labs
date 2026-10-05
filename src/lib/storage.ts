import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { AwsClient } from "aws4fetch";
import sharp from "sharp";
import { env } from "./env";

export interface Storage {
  put(buffer: Buffer, opts: { key: string; contentType: string }): Promise<void>;
  remove(key: string): Promise<void>;
  publicUrl(key: string): string;
}

export const LOCAL_UPLOAD_DIR = path.resolve("storage/uploads");

// Segmentos alfanuméricos que no empiezan con punto: sin `..`, sin ocultos, sin barras invertidas.
const KEY_RE = /^[a-zA-Z0-9][a-zA-Z0-9._-]*(\/[a-zA-Z0-9][a-zA-Z0-9._-]*)*$/;

/** Ruta absoluta de una clave dentro del directorio de subidas, o null si la clave no es válida. */
export function resolveLocalPath(key: string): string | null {
  if (key.length > 200 || !KEY_RE.test(key)) return null;
  const file = path.resolve(LOCAL_UPLOAD_DIR, key);
  return file.startsWith(LOCAL_UPLOAD_DIR + path.sep) ? file : null;
}

function requirePath(key: string): string {
  const file = resolveLocalPath(key);
  if (!file) throw new Error("Clave de storage inválida");
  return file;
}

const local: Storage = {
  async put(buffer, { key }) {
    const file = requirePath(key);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, buffer);
  },
  async remove(key) {
    await rm(requirePath(key), { force: true });
  },
  publicUrl: (key) => `/media/${key}`,
};

// ponytail: URLs path-style (endpoint/bucket/clave), válidas en R2, MinIO y S3 con endpoint regional —
// pasar a virtual-hosted si algún proveedor deja de aceptar path-style.
function s3(): Storage {
  const aws = new AwsClient({
    accessKeyId: env.S3_ACCESS_KEY_ID!,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
    region: env.S3_REGION,
    service: "s3",
  });
  const url = (key: string) => {
    if (!KEY_RE.test(key)) throw new Error("Clave de storage inválida");
    return `${env.S3_ENDPOINT!.replace(/\/+$/, "")}/${env.S3_BUCKET}/${key}`;
  };
  const send = async (key: string, init: RequestInit) => {
    const res = await aws.fetch(url(key), init);
    if (!res.ok) throw new Error(`Storage S3: ${init.method} respondió ${res.status}`);
  };
  return {
    put: (buffer, { key, contentType }) =>
      send(key, { method: "PUT", body: new Uint8Array(buffer), headers: { "Content-Type": contentType } }),
    remove: (key) => send(key, { method: "DELETE" }),
    publicUrl: (key) => `${env.S3_PUBLIC_URL}/${key}`,
  };
}

export const storage: Storage = env.STORAGE_DRIVER === "s3" ? s3() : local;

/** Clave nueva con nombre aleatorio (nunca el nombre original del archivo). */
export function newMediaKey(ext = "webp"): string {
  const now = new Date();
  return `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}.${ext}`;
}

// Límites de subida. Tienen que ser coherentes entre sí y con los otros dos lugares que cortan antes:
// `experimental.serverActions.bodySizeLimit` en next.config.ts (10 MB por envío) y
// `client_max_body_size` del proxy (docs/SECURITY.md). Si se cambia uno, se cambian los tres.
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // por imagen
export const MAX_UPLOAD_TOTAL_BYTES = 10 * 1024 * 1024; // por envío (todas las imágenes juntas)
export const MAX_UPLOAD_FILES = 10; // por envío
const MAX_DIMENSION = 2560;
// ponytail: SVG no se acepta (puede llevar <script> y handlers: riesgo de XSS almacenado) —
// si hiciera falta, sanitizarlo en servidor y servirlo con CSP `sandbox`, o rasterizarlo.
const RASTER_FORMATS = new Set(["jpeg", "png", "webp", "gif", "avif", "heif"]);

/** Error con mensaje apto para mostrar al usuario del admin. */
export class UploadError extends Error {}

export type ProcessedImage = { buffer: Buffer; width: number; height: number; mime: "image/webp" };

/**
 * Valida y normaliza una imagen subida: tope de tamaño, decodificación real con sharp (no se confía
 * en la extensión ni en el Content-Type), y re-codificación a WebP, que descarta EXIF y cualquier
 * byte que no sea imagen.
 * ponytail: de un GIF animado queda solo el primer cuadro — usar `animated: true` si se necesitan.
 */
export async function processImageUpload(file: File): Promise<ProcessedImage> {
  if (file.size === 0) throw new UploadError("El archivo está vacío.");
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError("La imagen supera el máximo de 8 MB.");
  const input = Buffer.from(await file.arrayBuffer());
  try {
    // limitInputPixels corta imágenes gigantes que agotarían memoria al descomprimirse.
    const image = sharp(input, { limitInputPixels: 50_000_000 });
    const { format } = await image.metadata();
    if (!format || !RASTER_FORMATS.has(format)) throw new UploadError("Formato no admitido. Usá JPG, PNG, WebP, AVIF o GIF.");
    const { data, info } = await image
      .rotate() // aplica la orientación EXIF antes de descartarla
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
    return { buffer: data, width: info.width, height: info.height, mime: "image/webp" };
  } catch (error) {
    if (error instanceof UploadError) throw error;
    throw new UploadError("El archivo no es una imagen válida.");
  }
}
