// Genera public/brand/email/* para la plantilla de correo (src/lib/email.ts): los clientes de correo no
// corren CSS ni JS, así que el burro animado es un GIF y el resto PNG. Todo sale de las capas del vector
// (public/brand/mascot-ears.svg, mascot-body.svg, manifest.json) sin redibujar nada: las orejas giran
// alrededor de su pivote y la pupila se mueve, como en el sitio, pero cuadro a cuadro.
//   node brand-src/build-email-assets.mjs   (o pnpm brand:email)
import { mkdirSync, readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const BRAND = new URL("../public/brand/", import.meta.url);
const OUT = new URL("../public/brand/email/", import.meta.url);
mkdirSync(OUT, { recursive: true });

const INK = "#080a09";
const YELLOW = "#fcea10";
const PUPIL_INK = "#090a0b"; // el negro de la pupila en el vector original
const read = (name) => readFileSync(new URL(name, BRAND), "utf8");
const manifest = JSON.parse(read("manifest.json"));
const out = (name) => fileURLToPath(new URL(name, OUT));

/** SVG → PNG al ancho pedido (density proporcional al width declarado, como en build-assets.mjs). */
const render = (text, width, height) =>
  sharp(Buffer.from(text), { density: (72 * width) / +text.match(/width="(\d+)"/)[1] }).resize(width, height, { fit: "fill" });
// Los PNG con alfa se ven bien en todos los clientes; el logo completo va sobre blanco porque no tiene borde propio.
const png = (text, width, background) => (background ? render(text, width).flatten({ background }) : render(text, width)).png({ compressionLevel: 9 });

// ---------------------------------------------------------------- burro.gif
// 1 cuadro en reposo (idéntico al logo, con pausa larga) + 10 cuadros de gesto: las orejas van y vuelven ±7° y la
// pupila mira a un lado y vuelve. Los PNG animados no se ven en casi ningún cliente; el GIF sí (Outlook de
// escritorio muestra solo el primer cuadro, que por eso es el de reposo).
const WIDTH = 520; // se muestra a 260: al doble por las pantallas retina (pesa ~145 KB; a 260 serían ~65 KB)
const HEIGHT = Math.round((WIDTH * manifest.sizes.mascot.height) / manifest.sizes.mascot.width);
const GESTURE_FRAMES = 10;
const EAR_DEGREES = 7;
const PUPIL_TRAVEL = 0.7; // fracción del recorrido máximo de la pupila (manifest.pupilMaxTravel)
const FRAME_MS = 120;
const REST_MS = 900;

const ears = read("mascot-ears.svg");
const body = read("mascot-body.svg");
const [vx, vy, vw, vh] = ears.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
const geo = manifest.mascot;
const pivot = [vx + geo.earPivot[0] * vw, vy + geo.earPivot[1] * vh];

const earsAt = (degrees) =>
  ears.replace(/(<svg[^>]*>)/, `$1<g transform="rotate(${degrees.toFixed(2)} ${pivot[0].toFixed(2)} ${pivot[1].toFixed(2)})">`).replace(/<\/svg>\s*$/, "</g></svg>");
const pupilAt = (dx) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${vw} ${vh}" width="${manifest.sizes.mascot.width}" height="${manifest.sizes.mascot.height}"><circle cx="${(vx + (geo.pupil.center[0] + dx) * vw).toFixed(2)}" cy="${(vy + geo.pupil.center[1] * vh).toFixed(2)}" r="${(geo.pupil.radius * vw).toFixed(2)}" fill="${PUPIL_INK}"/></svg>`;

const bodyPng = await render(body, WIDTH, HEIGHT).png().toBuffer();
async function frame(degrees, pupilDx) {
  const layers = await Promise.all([render(earsAt(degrees), WIDTH, HEIGHT).png().toBuffer(), render(pupilAt(pupilDx), WIDTH, HEIGHT).png().toBuffer()]);
  return sharp({ create: { width: WIDTH, height: HEIGHT, channels: 3, background: "#ffffff" } })
    .composite([{ input: layers[0] }, { input: bodyPng }, { input: layers[1] }])
    .png()
    .toBuffer();
}
const frames = [await frame(0, 0)];
for (let k = 1; k <= GESTURE_FRAMES; k++) {
  const t = k / (GESTURE_FRAMES + 1); // (0,1): el reposo ya está en el primer cuadro
  frames.push(await frame(EAR_DEGREES * Math.sin(2 * Math.PI * t), geo.pupilMaxTravel * PUPIL_TRAVEL * Math.sin(Math.PI * t)));
}
await sharp(frames, { join: { animated: true } })
  .gif({ delay: [REST_MS, ...Array(GESTURE_FRAMES).fill(FRAME_MS)], loop: 0, colours: 128, dither: 0, effort: 10 })
  .toFile(out("burro.gif"));

// ---------------------------------------------------------------- PNG fijos (al doble del tamaño en que se muestran, por las pantallas retina)
await png(read("logo-full.svg"), 480, "#ffffff").toFile(out("logo.png")); // se muestra a 240
await png(read("badge.svg"), 96).toFile(out("badge.png")); // se muestra a 48
await png(read("wordmark.svg"), 440).toFile(out("wordmark.png")); // se muestra a 220

// ---------------------------------------------------------------- redes: glifos simples propios (trazo tinta sobre círculo amarillo), no los logos registrados
const GLYPHS = {
  instagram: '<rect x="8" y="8" width="12" height="12" rx="3.5"/><circle cx="14" cy="14" r="2.9"/><circle cx="17.6" cy="10.4" r="0.5" fill="INK"/>',
  linkedin: '<path d="M9.6 12.6V19"/><circle cx="9.6" cy="9.4" r="0.6" fill="INK"/><path d="M13.6 19v-6.4M13.6 14.9c0-1.4 1-2.4 2.4-2.4s2.4 1 2.4 2.4V19"/>',
  github: '<circle cx="9" cy="9" r="1.9"/><circle cx="19" cy="9" r="1.9"/><circle cx="14" cy="19.4" r="1.9"/><path d="M9 11v1c0 1.6 1.1 2.6 2.7 2.6h4.6c1.6 0 2.7-1 2.7-2.6v-1M14 14.6v2.9"/>',
  facebook: '<path d="M16.8 8h-1.5c-1.7 0-2.6 1-2.6 2.7V20M10.4 13.4h5.2"/>',
  tiktok: '<path d="M12.6 18.2V8.4c1.2 1.5 3 2.4 5 2.5"/><circle cx="10.2" cy="18.2" r="2.4"/>',
  x: '<path d="M9.2 9.2l9.6 9.6M18.8 9.2l-9.6 9.6"/>',
};
for (const [name, glyph] of Object.entries(GLYPHS)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28"><circle cx="14" cy="14" r="13" fill="${YELLOW}" stroke="${INK}" stroke-width="1.5"/><g fill="none" stroke="${INK}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${glyph.replaceAll("INK", INK)}</g></svg>`;
  await png(svg, 56).toFile(out(`${name}.png`)); // se muestran a 28
}

// ---------------------------------------------------------------- verificación
for (const name of ["burro.gif", "logo.png", "badge.png", "wordmark.png", ...Object.keys(GLYPHS).map((n) => `${n}.png`)]) {
  const meta = await sharp(out(name), { pages: -1 }).metadata();
  const kb = (statSync(out(name)).size / 1024).toFixed(1);
  console.log(`${name.padEnd(14)} ${meta.width}×${meta.pageHeight ?? meta.height}${meta.pages > 1 ? ` · ${meta.pages} cuadros` : ""} · ${kb} KB`);
}
