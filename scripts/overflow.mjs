// Auditoría de desbordes horizontales. Uso:
//   BASE_URL=http://localhost:3000 WIDTHS=320,375,768,1024,1366,1440,1920 node scripts/overflow.mjs / /proyectos ...
// Para cada ancho y ruta imprime el desborde del documento y los primeros elementos que se pasan del borde
// (se ignoran los fijos; la cinta de frases desborda a propósito dentro de overflow:hidden).
import { chromium } from "@playwright/test";
const base = process.env.BASE_URL ?? "http://localhost:3000";
const widths = (process.env.WIDTHS ?? "320").split(",").map(Number);
const b = await chromium.launch();
for (const width of widths) {
  const p = await b.newPage({ viewport: { width, height: 900 } });
  for (const path of process.argv.slice(2)) {
    await p.goto(base + path, { waitUntil: "networkidle" });
    const r = await p.evaluate(() => {
      const w = document.documentElement.clientWidth;
      return {
        over: document.documentElement.scrollWidth - w,
        els: [...document.querySelectorAll("body *")]
          .filter((e) => e.getBoundingClientRect().right > w + 1 && getComputedStyle(e).position !== "fixed" && !e.closest(".ticker"))
          .slice(0, 4)
          .map((e) => e.tagName + "." + String(e.className).slice(0, 50) + " → " + Math.round(e.getBoundingClientRect().right)),
      };
    });
    console.log(width, path, r.over, r.els.length ? JSON.stringify(r.els) : "");
  }
  await p.close();
}
await b.close();
