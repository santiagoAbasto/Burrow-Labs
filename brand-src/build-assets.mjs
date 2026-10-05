// Genera public/brand/* y los iconos a partir de los vectores oficiales (Illustrator).
// No redibuja nada: recorta el lienzo, separa capas y pasa a contorno el único texto vivo («</>»).
//   node brand-src/build-assets.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const SRC = new URL("./", import.meta.url);
const OUT = new URL("../public/brand/", import.meta.url);
const APP = new URL("../src/app/", import.meta.url);

// ---------------------------------------------------------------- lector mínimo de SVG
// ponytail: alcanza para lo que exporta Illustrator (sin CDATA ni «>» dentro de atributos) — usar un parser XML si cambia el origen
function parse(file) {
  const source = readFileSync(new URL(file, SRC), "utf8").replace(/<\?xml[^>]*\?>|<metadata>[\s\S]*?<\/metadata>|<!--[\s\S]*?-->/g, "");
  const root = { children: [] };
  const stack = [root];
  for (const [, close, tag, attrs, selfClose, text] of source.matchAll(/<(\/?)([\w:]+)([^>]*?)(\/?)>|([^<]+)/g)) {
    if (text !== undefined) {
      if (text.trim()) stack.at(-1).children.push(text.replace(/\s+/g, " ").trim());
    } else if (close) stack.pop();
    else {
      const node = { tag, attrs, children: [] };
      stack.at(-1).children.push(node);
      if (!selfClose) stack.push(node);
    }
  }
  return root.children[0];
}
const elements = (node) => node.children.filter((child) => typeof child !== "string");
/** Elemento por su ruta de índices («4.0.1» = quinto hijo → primero → segundo). */
const at = (node, path) => path.split(".").reduce((current, index) => elements(current)[index], node);
const print = (node) =>
  typeof node === "string"
    ? node
    : node.children.length
      ? `<${node.tag}${node.attrs}>${node.children.map(print).join("")}</${node.tag}>`
      : `<${node.tag}${node.attrs}/>`;
/** Copia del árbol sin los nodos indicados. */
const without = (node, ...removed) =>
  typeof node === "string"
    ? node
    : { ...node, children: node.children.filter((child) => !removed.includes(child)).map((child) => without(child, ...removed)) };

// «</>» está como texto vivo en Arial Black: sin la fuente instalada (Android, Linux) se vería con otra letra.
// Contornos de esos tres glifos (unidades de la fuente, 2048 por em), tal como los dibuja la tipografía.
const GLYPHS = [
  { advance: 1352, d: "M1244 112 107 585V881L1244 1353V998L553 732L1244 465Z" },
  { advance: 569, d: "M367 1491H575L207 -24H1Z" },
  { advance: 1352, d: "M108 112 1245 585V881L108 1353V998L799 732L108 465Z" },
];
const FONT_SIZE = 93.23;
function outlineText(tree, path) {
  const node = at(tree, path);
  const scale = FONT_SIZE / 2048;
  let x = 0;
  const glyphs = GLYPHS.map(({ advance, d }) => {
    const glyph = `<path transform="translate(${x} 0)" d="${d}"/>`;
    x += advance;
    return glyph;
  });
  node.tag = "g";
  node.attrs = ` fill="#fff" ${node.attrs.match(/transform="[^"]*/)[0]} scale(${scale} ${-scale})"`;
  node.children = glyphs;
}

const sizes = {};
function svg(name, [x, y, width, height], defs, ...content) {
  const text = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${width} ${height}" width="${Math.round(width)}" height="${Math.round(height)}">${print(defs)}${content.map(print).join("")}</svg>\n`;
  writeFileSync(new URL(`${name}.svg`, OUT), text);
  sizes[name] = { width: Math.round(width), height: Math.round(height) };
  return text;
}
// Recorte horizontal de una capa. Es una máscara y no un clip-path a propósito: el clip se aplica trazo por trazo y, en el borde
// suavizado, los colores apilados (amarillo, negro, gris) se mezclan y dejan una línea visible sobre la capa de abajo.
const band = (id, y, height, ...content) =>
  `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="${y}" width="1080" height="${height}"><rect x="0" y="${y}" width="1080" height="${height}" fill="#fff"/></mask><g mask="url(#${id})">${content.map(print).join("")}</g>`;

// ---------------------------------------------------------------- insignia y burro (burrow-recuperado.svg)
// Hijos de la raíz: 0 defs · 1 fondo gris + anillos · 2 paisaje · 3 contornos del burro · 4 burro (4.0.1 cabeza, 4.3 «</>»)
const badge = parse("burrow-recuperado.svg");
const defs = at(badge, "0");
outlineText(badge, "4.3");
const rings = without(at(badge, "1"), at(badge, "1.0")); // sin el rectángulo gris del lienzo
const scenery = at(badge, "2");
const outline = at(badge, "3");
const donkey = at(badge, "4");
const pupil = at(badge, "4.0.1.15.4.1");

// Medidas del vector (unidades del lienzo de 1080).
const BADGE_BOX = [106.2, 106.2, 867.6, 867.6]; // anillo exterior (865.6 × 851.2) centrado en un cuadrado, con 1 de margen para su trazo
const MASCOT_BOX = [284.6, 125.6, 528.7, 819.5]; // contorno amarillo + sudadera, con 1 de margen
const EYE = { center: [509.3, 481.3], radius: 71.9 }; // interior del aro negro del ojo
const PUPIL = { center: [541.48, 447.97], radius: 10.33 };
const EAR_CUT = 380.7; // base de las orejas: arriba, capa de orejas; abajo, cuerpo
const EAR_OVERLAP = 27; // las orejas siguen por detrás del cuerpo para que al girar no se abra un hueco
const EAR_PIVOT = [505, 389];

const body = [outline, without(donkey, pupil)]; // la pupila se dibuja en CSS para que pueda moverse
const ears = [outline, at(badge, "4.0.1")];
const badgeSvg = svg("badge", BADGE_BOX, defs, rings, scenery, outline, donkey);
svg("badge-bg", BADGE_BOX, defs, rings, scenery);
svg("badge-ears", BADGE_BOX, defs, band("ears", 0, EAR_CUT + EAR_OVERLAP, ...ears));
svg("badge-body", BADGE_BOX, defs, band("body", EAR_CUT, 1080 - EAR_CUT, ...body));
const mascotSvg = svg("mascot", MASCOT_BOX, defs, outline, donkey);
svg("mascot-ears", MASCOT_BOX, defs, band("ears", 0, EAR_CUT + EAR_OVERLAP, ...ears));
svg("mascot-body", MASCOT_BOX, defs, band("body", EAR_CUT, 1080 - EAR_CUT, ...body));

const geometry = ([x, y, width, height]) => {
  const point = ([px, py]) => [+((px - x) / width).toFixed(5), +((py - y) / height).toFixed(5)];
  return {
    eye: { center: point(EYE.center), radius: +(EYE.radius / width).toFixed(5) },
    pupil: { center: point(PUPIL.center), radius: +(PUPIL.radius / width).toFixed(5) },
    pupilMaxTravel: +((EYE.radius - PUPIL.radius - 5.4) / width).toFixed(5),
    earPivot: point(EAR_PIVOT),
  };
};

// ---------------------------------------------------------------- logo completo y wordmark (burrow-ofi.svg)
// Hijos de la raíz: 0 defs · 1 fondo gris · 2 logo (2.4 burro: 2.4.2 punto suelto sin área, 2.4.3.3 «</>»; 2.5 letras «BURROW LABS»)
const full = parse("burrow-ofi.svg");
outlineText(full, "2.4.3.3");
const logoSvg = svg("logo-full", [106.2, 102.5, 867.6, 875], at(full, "0"), without(at(full, "2"), at(full, "2.4.2")));
// El banner negro viene fundido con el contorno del burro (2.4.1): estos son sus mismos tramos, cerrando recto el borde superior.
const BANNER =
  '<path class="st41" d="M838.37,857.66H241.63c-15.75,0-28.51,12.77-28.51,28.51v61.77c0,15.75,12.77,28.51,28.51,28.51h596.74c15.75,0,28.51-12.77,28.51-28.51v-61.77c0-15.75-12.77-28.51-28.51-28.51Z"/>';
svg("wordmark", [213.12, 857.66, 653.76, 118.79], at(full, "0"), BANNER, at(full, "2.5"));

writeFileSync(
  new URL("manifest.json", OUT),
  JSON.stringify(
    {
      note: "Geometría normalizada (0–1) respecto del lienzo de cada juego de capas; los radios son fracción del ancho.",
      badge: geometry(BADGE_BOX),
      mascot: geometry(MASCOT_BOX),
      sizes,
    },
    null,
    2,
  ) + "\n",
);

// ---------------------------------------------------------------- lo que el formato obliga a ser mapa de bits (salen del vector)
const PAPER = "#ededed"; // fondo del lienzo original
const render = (text, width) => sharp(Buffer.from(text), { density: (72 * width) / +text.match(/width="(\d+)"/)[1] }).resize({ width });
const onPaper = async (text, canvasWidth, canvasHeight, width) =>
  sharp({ create: { width: canvasWidth, height: canvasHeight, channels: 3, background: PAPER } })
    .composite([{ input: await render(text, width).png().toBuffer() }])
    .png();

await render(badgeSvg, 512).png().toFile(fileURLToPath(new URL("icon.png", APP)));
await (await onPaper(badgeSvg, 180, 180, 164)).toFile(fileURLToPath(new URL("apple-icon.png", APP)));
await (await onPaper(logoSvg, 1200, 630, 556)).toFile(fileURLToPath(new URL("og-logo.png", OUT)));
// textura del burro para la escena 3D del hero (WebGL necesita píxeles)
await render(mascotSvg, 1321).webp({ lossless: true, effort: 6 }).toFile(fileURLToPath(new URL("mascot-texture.webp", OUT)));

// favicon.ico: PNG de 16, 32 y 48 dentro del contenedor ICO
const icons = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await render(badgeSvg, size).png().toBuffer() })));
const header = Buffer.alloc(6 + 16 * icons.length);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(icons.length, 4);
let offset = header.length;
icons.forEach(({ size, data }, index) => {
  const entry = 6 + 16 * index;
  header[entry] = size;
  header[entry + 1] = size;
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(data.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += data.length;
});
writeFileSync(new URL("favicon.ico", APP), Buffer.concat([header, ...icons.map((icon) => icon.data)]));

for (const [name, size] of Object.entries(sizes)) console.log(`${name}.svg  ${size.width}×${size.height}`);
