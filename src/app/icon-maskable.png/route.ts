import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Se genera una vez, al compilar.
export const dynamic = "force-static";

const SIZE = 512;
/** El badge ocupa el 72 % del lienzo: entra completo en la zona segura de un icono «maskable» (círculo del 80 %). */
const BADGE = 368;

/** Icono «maskable» del manifest: el badge oficial (src/app/icon.png) centrado sobre el papel del sitio. No redibuja nada. */
export async function GET() {
  const badge = await sharp(await readFile(path.join(process.cwd(), "src/app/icon.png"))).resize(BADGE).toBuffer();
  const icon = await sharp({ create: { width: SIZE, height: SIZE, channels: 3, background: "#ededed" } })
    .composite([{ input: badge }])
    .png()
    .toBuffer();
  return new Response(new Uint8Array(icon), { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" } });
}
