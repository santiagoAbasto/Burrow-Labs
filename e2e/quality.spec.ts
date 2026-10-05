import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { overflowX } from "./helpers";

const WIDTHS = [320, 375, 390, 425, 768, 1024, 1280, 1366, 1440, 1920];
const KEY_PAGES = ["/", "/servicios", "/servicios/automatizacion", "/proyectos", "/planes", "/nosotros", "/lab", "/lab/ia-en-procesos-reales", "/contacto", "/diagnostico", "/calculadora", "/faq", "/esta-pagina-no-existe"];

test.describe("SEO técnico", () => {
  test("metadata, canonical, Open Graph y JSON-LD en el Home", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Burrow Labs/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /localhost:3210\/?$/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{60,}/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /.+/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /og-logo\.png/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    const types = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) => nodes.flatMap((node) => [JSON.parse(node.textContent ?? "null")].flat().map((item) => item?.["@type"])));
    expect(types).toEqual(expect.arrayContaining(["Organization", "WebSite", "ProfessionalService"]));
    expect(JSON.stringify(types)).not.toContain("Review"); // nada de reseñas inventadas
  });

  test("cada página tiene título y descripción propios", async ({ page }) => {
    const seen = new Set<string>();
    for (const path of ["/", "/servicios", "/servicios/automatizacion", "/planes", "/lab", "/lab/ia-en-procesos-reales", "/contacto"]) {
      await page.goto(path);
      const title = await page.title();
      expect(seen.has(title), `título repetido en ${path}: ${title}`).toBe(false);
      seen.add(title);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`${path === "/" ? "" : path}/?$`));
    }
  });

  test("robots, sitemap y llms.txt", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /admin");
    expect(robots).toContain("sitemap.xml");
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/servicios/automatizacion");
    expect(sitemap).toContain("/lab/ia-en-procesos-reales");
    expect(sitemap).not.toContain("/admin");
    expect(sitemap).not.toContain("demo-");
    const llms = await request.get("/llms.txt");
    expect(llms.headers()["content-type"]).toContain("text/markdown");
    expect(await llms.text()).toContain("# Burrow Labs");
  });

  test("cabeceras de seguridad", async ({ request }) => {
    const headers = (await request.get("/")).headers();
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBeTruthy();
    expect(headers["x-powered-by"]).toBeUndefined();
  });
});

test.describe("responsive", () => {
  for (const width of WIDTHS) {
    test(`sin scroll horizontal a ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width < 768 ? 780 : 900 });
      for (const path of KEY_PAGES) {
        await page.goto(path);
        expect(await overflowX(page), `${path} desborda a ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  }

  test("objetivos táctiles de al menos 44px en móvil", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 780 });
    await page.goto("/");
    const small = await page.locator("header a, header button, main .btn, footer .btn").evaluateAll((nodes) =>
      nodes
        .filter((node) => (node as HTMLElement).offsetParent !== null)
        .map((node) => ({ text: node.textContent?.trim().slice(0, 30), height: Math.round(node.getBoundingClientRect().height) }))
        .filter((item) => item.height < 44),
    );
    expect(small).toEqual([]);
  });
});

test.describe("accesibilidad (axe, WCAG 2 A/AA)", () => {
  for (const path of ["/", "/servicios/automatizacion", "/planes", "/contacto", "/diagnostico", "/lab/ia-en-procesos-reales", "/faq", "/admin/login"]) {
    test(`sin infracciones serias en ${path}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      const serious = results.violations.filter((violation) => violation.impact === "serious" || violation.impact === "critical");
      expect(serious.map((violation) => `${violation.id}: ${violation.nodes.length} → ${violation.nodes[0]?.target}`)).toEqual([]);
    });
  }

  test("se puede saltar al contenido y recorrer el header con teclado", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Saltar al contenido" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Burrow Labs, ir al inicio" }).first()).toBeFocused();
  });
});
