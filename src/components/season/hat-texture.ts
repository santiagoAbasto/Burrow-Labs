import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as THREE from "three";
import { HatDrawing } from "./pieces";

// El gorro como textura para la escena 3D del inicio (el burro del laboratorio es una imagen en un plano, no el SVG
// de Mascot). Es el mismo dibujo que el del resto del sitio: se serializa a SVG, se rasteriza y se apoya sobre el plano.
// Solo se descarga con la campaña encendida y los personajes activos (scene.tsx lo pide con import()).
export const HAT_VIEWBOX = { x: -40, y: 30, w: 146, h: 148 };

export async function hatTexture(): Promise<THREE.Texture> {
  const style = getComputedStyle(document.documentElement);
  const markup = renderToStaticMarkup(createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: `${HAT_VIEWBOX.x} ${HAT_VIEWBOX.y} ${HAT_VIEWBOX.w} ${HAT_VIEWBOX.h}` }, createElement(HatDrawing)))
    // una imagen SVG suelta no hereda las variables de la página: se resuelven acá
    .replace(/var\((--[\w-]+)\)/g, (_, name: string) => style.getPropertyValue(name).trim() || "#000");
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = Math.round((768 * HAT_VIEWBOX.h) / HAT_VIEWBOX.w);
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
