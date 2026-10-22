import { expect, test } from "@playwright/test";

const PAGES: [path: string, heading: RegExp][] = [
  ["/servicios", /Software a medida para empresas de Bolivia y del exterior/i],
  ["/servicios/automatizacion", /Automatización/i],
  ["/proyectos", /Problema, trabajo, resultado/i],
  ["/planes", /De procesos manuales/i],
  ["/nosotros", /Pequeños por diseño/i],
  ["/clientes", /negocios reales/i],
  ["/lab", /Donde probamos antes de prometer/i],
  ["/lab/ia-en-procesos-reales", /IA en procesos reales/i],
  ["/contacto", /Contanos qué querés resolver/i],
  ["/diagnostico", /Qué necesita tu negocio/i],
  ["/calculadora", /Cuánto tiempo pierde tu empresa/i],
  ["/faq", /Lo que nos preguntan/i],
  ["/privacidad", /Política de privacidad/i],
  ["/terminos", /Términos y condiciones/i],
  ["/cookies", /Política de cookies/i],
];

test.describe("navegación", () => {
  test("el Home dice qué hace Burrow Labs y cómo empezar", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("CODIFICANDO SOLUCIONES.");
    await expect(page.getByRole("link", { name: "Contanos qué querés resolver" }).first()).toHaveAttribute("href", "/contacto");
    for (const id of ["problema", "servicios", "proceso", "confianza", "calculadora", "planes", "juego", "faq", "contacto"]) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
  });

  for (const [path, heading] of PAGES) {
    test(`${path} responde y tiene su titular`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
    });
  }

  test("el menú principal lleva a cada sección", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Principal", exact: true });
    for (const [label, path] of [["Servicios", "/servicios"], ["Planes", "/planes"], ["Lab", "/lab"], ["Nosotros", "/nosotros"], ["Proyectos", "/proyectos"]]) {
      await nav.getByRole("link", { name: label }).click();
      await expect(page).toHaveURL(path);
    }
  });

  test("menú móvil: abre, navega y cierra", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.getByRole("button", { name: "Abrir menú" }).click();
    const drawer = page.getByRole("dialog", { name: "Menú" });
    await expect(drawer).toBeVisible();
    await drawer.getByRole("link", { name: "Planes" }).click();
    await expect(page).toHaveURL("/planes");
    await expect(drawer).toBeHidden();
  });

  test("el header vuelve al color de la superficie al subir rápido", async ({ page }) => {
    // El hero cambia su estrato con el descenso 3D, que llega con retraso al scroll: el header lo tiene que seguir
    // aunque ya no haya otro evento de scroll (antes quedaba en «deep», con el menú blanco sobre papel).
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    test.skip(!(await page.evaluate(() => !!document.createElement("canvas").getContext("webgl2"))), "sin WebGL no hay descenso 3D");
    const hero = page.locator("#inicio");
    const header = page.locator(".site-header");
    await page.mouse.move(700, 450); // la escena se monta con la primera interacción
    await expect(hero).toHaveAttribute("data-live", "true", { timeout: 20_000 });
    await page.evaluate(() => {
      const el = document.getElementById("inicio")!;
      scrollTo({ top: el.offsetTop + (el.offsetHeight - innerHeight) * 0.65, behavior: "instant" });
    });
    await expect(hero).toHaveAttribute("data-stratum", "deep");
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await expect(hero).toHaveAttribute("data-stratum", "surface");
    await expect(header).toHaveAttribute("data-stratum", "surface");
  });

  test("una ruta inexistente muestra el 404 con el juego", async ({ page }) => {
    const response = await page.goto("/esta-pagina-no-existe");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/cavó demasiado profundo/);
    await expect(page.getByRole("link", { name: "Volver a la superficie" }).first()).toHaveAttribute("href", "/");
    await expect(page.getByRole("button", { name: "Jugar" })).toBeVisible();
  });
});

test.describe("contenido honesto", () => {
  test("los casos publicados son reales: Apple Boss primero y sin placeholders", async ({ page }) => {
    await page.goto("/proyectos");
    const cases = page.getByRole("main").locator("ol > li");
    await expect(cases).toHaveCount(8);
    await expect(cases.first()).toContainText("Apple Boss");
    await expect(cases.first()).toContainText("Producto propio");
    const body = page.locator("body");
    for (const placeholder of ["CONTENIDO DEMO", "por confirmar", "Demo · no público", "lorem ipsum"]) {
      await expect(body).not.toContainText(placeholder, { ignoreCase: true });
    }
    await cases.first().getByRole("link").click();
    await expect(page).toHaveURL(/\/proyectos\/apple-boss/);
    await expect(page.getByRole("navigation", { name: "Secciones del caso" })).toContainText("Resultado");
    await expect(page.getByRole("img", { name: /Esquema del caso/ }).first()).toBeVisible();
    await page.goto("/");
    await expect(page.locator("#proyectos")).toBeAttached();
    await expect(page.getByRole("link", { name: "Ver proyectos" }).first()).toHaveAttribute("href", "/proyectos");
  });

  test("sin clientes autorizados se muestran sectores", async ({ page }) => {
    await page.goto("/clientes");
    await expect(page.getByRole("list", { name: "Sectores para los que construimos" })).toContainText("Manufactura");
  });
});

test.describe("planes", () => {
  test("muestra los 8 planes con sus precios base y el aviso", async ({ page }) => {
    await page.goto("/planes");
    for (const [name, price] of [["Madriguera", "USD 85"], ["Impulso", "USD 150"], ["Turbo", "USD 250"], ["Conecta", "USD 320"], ["Automatiza", "USD 450"], ["Escala", "USD 650"], ["Sistema", "USD 900"], ["Infinito", "USD 1.500"]]) {
      const card = page.locator("li").filter({ has: page.getByRole("heading", { name, exact: true }) });
      await expect(card).toContainText(price);
      await expect(card).toContainText("desde");
    }
    await expect(page.getByText("Precio base. El alcance final se confirma antes de comenzar.").first()).toBeVisible();
  });

  test("el botón de un plan abre el contacto con ese plan precargado", async ({ page }) => {
    await page.goto("/planes");
    await page.getByRole("link", { name: "Quiero el plan Turbo" }).click();
    await expect(page).toHaveURL(/\/contacto\?plan=turbo/);
    await expect(page.getByLabel("¿Qué querés construir?")).toHaveValue("Plan Turbo");
  });
});

test.describe("calculadora y diagnóstico", () => {
  test("la calculadora calcula y se comparte por URL", async ({ page }) => {
    await page.goto("/calculadora?p=4&h=10&c=8&s=50&r=50");
    const results = page.locator("main [aria-live=polite]"); // el pie tiene su propio aria-live (newsletter)
    await expect(results).toContainText("2.000"); // 4 × 10 × 50 horas
    await expect(results).toContainText("16.000"); // × USD 8
    await expect(results).toContainText("1.000"); // 50 % repetitivo
    await expect(page.getByText(/No es una promesa de ahorro/)).toBeVisible();
  });

  test("el diagnóstico recomienda según las respuestas", async ({ page }) => {
    await page.goto("/diagnostico");
    await page.getByLabel("Contalo con tus palabras").fill("Cargamos pedidos de WhatsApp en una planilla.");
    await page.getByRole("button", { name: "Siguiente" }).click();
    await page.getByText("2 a 5", { exact: true }).click();
    await page.getByRole("button", { name: "Siguiente" }).click();
    await page.getByRole("button", { name: "+ Excel" }).click();
    await page.getByRole("button", { name: "Siguiente" }).click();
    await page.getByText("Automatización", { exact: true }).click();
    await page.getByRole("button", { name: "Siguiente" }).click();
    await page.getByText("No", { exact: true }).click();
    await page.getByRole("button", { name: "Ver mi diagnóstico" }).click();
    await expect(page.getByRole("heading", { name: "Automatizar lo que se repite" })).toBeVisible();
    await expect(page.getByText(/no una cotización/)).toBeVisible();
  });

  test("el diagnóstico no avanza sin respuesta", async ({ page }) => {
    await page.goto("/diagnostico");
    await page.getByRole("button", { name: "Siguiente" }).click();
    await expect(page.locator("p[role=alert]")).toContainText("Contanos al menos una tarea");
  });
});

test.describe("Burrow Runner", () => {
  test("carga al pulsar Jugar, salta y termina al chocar", async ({ page }) => {
    await page.goto("/esta-pagina-no-existe");
    await expect(page.locator("canvas")).toHaveCount(0); // no se descarga hasta que se pide
    await page.getByRole("button", { name: "Jugar" }).click();
    const game = page.getByRole("group", { name: /Burrow Runner/ });
    await expect(game.locator("canvas")).toBeVisible();
    await page.keyboard.press("Space"); // un salto no rompe nada
    await expect(game.getByRole("button", { name: "Pausar" })).toBeEnabled();
    // sin esquivar, tarde o temprano los bugs ganan
    await expect(game.getByText("Los bugs ganaron esta ronda.")).toBeVisible({ timeout: 30_000 });
    await expect(game.getByRole("link", { name: "Construyamos algo mejor." })).toHaveAttribute("href", "/contacto");
    await game.getByRole("button", { name: "Jugar de nuevo" }).click();
    await expect(game.getByText("Los bugs ganaron esta ronda.")).toBeHidden();
  });
});
