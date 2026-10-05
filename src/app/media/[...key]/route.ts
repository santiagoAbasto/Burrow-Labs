import { readFile } from "node:fs/promises";
import path from "node:path";
import { resolveLocalPath } from "@/lib/storage";

// Solo se sirven los tipos raster que el propio sitio genera o admite.
const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
};

const notFound = () => new Response(null, { status: 404 });

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  // resolveLocalPath rechaza cualquier clave que salga del directorio de subidas.
  const file = resolveLocalPath(key.join("/"));
  const contentType = file && CONTENT_TYPES[path.extname(file).toLowerCase()];
  if (!file || !contentType) return notFound();
  try {
    return new Response(new Uint8Array(await readFile(file)), {
      headers: {
        "Content-Type": contentType,
        // Las claves son aleatorias y nunca se reescriben: se pueden cachear para siempre.
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return notFound();
  }
}
