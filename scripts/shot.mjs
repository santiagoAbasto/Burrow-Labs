// Capturas para QA visual. Uso:
//   node scripts/shot.mjs <ruta> <salida.png> [ancho=1440] [alto=900] [--full] [--scroll=px|fracción] [--reduced] [--wait=ms] [--dpr=n]
import { chromium } from "@playwright/test";

const [path = "/", out = "shot.png", width = "1440", height = "900", ...flags] = process.argv.slice(2);
const flag = (name) => flags.find((f) => f.startsWith(`--${name}`))?.split("=")[1];
const base = process.env.BASE_URL ?? "http://localhost:3000";

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({
  viewport: { width: Number(width), height: Number(height) },
  deviceScaleFactor: Number(flag("dpr") ?? 1),
  reducedMotion: flags.includes("--reduced") ? "reduce" : "no-preference",
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await page.goto(base + path, { waitUntil: "networkidle" });
await page.waitForTimeout(Number(flag("wait") ?? 1200));
// --scroll=a,b,c toma una captura por posición (px, o fracción 0–1 del alto total): salida-1.png, salida-2.png…
const scrolls = flag("scroll")?.split(",").map(Number) ?? [];
for (const [i, s] of scrolls.entries()) {
  await page.evaluate((s) => {
    const max = document.documentElement.scrollHeight - innerHeight;
    scrollTo({ top: s <= 1 ? max * s : s, behavior: "instant" });
  }, s);
  await page.waitForTimeout(1400);
  await page.screenshot({ path: scrolls.length > 1 ? out.replace(/\.png$/, `-${i + 1}.png`) : out });
}
if (!scrolls.length) await page.screenshot({ path: out, fullPage: flags.includes("--full") });
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
console.log(JSON.stringify({ out, overflowX: overflow, height: await page.evaluate(() => document.documentElement.scrollHeight), errors: errors.slice(0, 5).map((e) => e.slice(0, 300)) }));
await browser.close();
