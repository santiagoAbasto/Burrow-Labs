import { expect, test } from "@playwright/test";
import { login } from "./helpers";

test.describe.configure({ mode: "serial" });

test.describe("contacto", () => {
  test("valida en servidor: sin datos ni consentimiento no envía", async ({ page }) => {
    await page.goto("/contacto");
    await page.waitForTimeout(2700); // trampa de tiempo
    await page.getByRole("button", { name: "Enviar" }).click();
    await expect(page.getByText("Revisá los campos marcados.")).toBeVisible();
    await expect(page.getByText("Decinos tu nombre.")).toBeVisible();
    await expect(page.getByText("Necesitamos tu consentimiento para guardar tus datos.")).toBeVisible();
  });

  test("un envío demasiado rápido se rechaza (bot)", async ({ page }) => {
    await page.goto("/contacto");
    await page.getByLabel("Nombre").fill("Bot Veloz");
    await page.getByLabel("Email", { exact: true }).fill("bot@example.com"); // el pie tiene «Tu email» (newsletter)
    await page.getByLabel("¿Qué querés construir?").fill("Spam");
    await page.getByLabel("Tipo de proyecto").selectOption("Web");
    await page.getByLabel("Descripción").fill("Mensaje enviado en menos de dos segundos.");
    await page.getByLabel(/Acepto que Burrow Labs/).check();
    await page.getByRole("button", { name: "Enviar" }).click();
    await expect(page.getByText("No pudimos enviar el formulario.")).toBeVisible();
  });

  test("un envío válido se guarda como lead", async ({ page }) => {
    await page.goto("/contacto?plan=sistema");
    await page.getByLabel("Nombre").fill("Ana E2E");
    await page.getByLabel("Empresa").fill("Empresa de Prueba");
    await page.getByLabel("Email", { exact: true }).fill("ana.e2e@example.com");
    await page.getByLabel("Descripción").fill("Queremos dejar de cargar pedidos a mano en tres planillas.");
    await page.getByLabel(/Acepto que Burrow Labs/).check();
    await page.waitForTimeout(2700);
    await page.getByRole("button", { name: "Enviar" }).click();
    await expect(page.getByRole("heading", { name: "Recibido." })).toBeVisible();
  });
});

test.describe("admin", () => {
  test("sin sesión, /admin muestra el ingreso y no se indexa", async ({ page, request }) => {
    await page.goto("/admin");
    await expect(page.getByRole("button", { name: "Ingresar" })).toBeVisible();
    await page.goto("/admin/leads");
    await expect(page).toHaveURL(/\/admin$/);
    const response = await request.get("/admin/login");
    expect(response.headers()["x-robots-tag"]).toContain("noindex");
    expect((await request.get("/admin/leads/export")).status()).toBe(401);
  });

  test("credenciales incorrectas no entran", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill("nadie@example.com");
    await page.getByLabel("Contraseña").fill("incorrecta-123456");
    await page.getByRole("button", { name: "Ingresar" }).click();
    await expect(page.getByText("Email o contraseña incorrectos.")).toBeVisible();
    await expect(page).toHaveURL(/\/admin$/);
  });

  test("el lead del formulario aparece y se puede gestionar", async ({ page }) => {
    await login(page);
    await expect(page.getByText("Leads nuevos sin atender")).toBeVisible();
    await page.getByRole("link", { name: "Consultas", exact: true }).first().click();
    await page.getByRole("link", { name: "Ana E2E" }).click();
    await expect(page.getByText("ana.e2e@example.com")).toBeVisible();
    await expect(page.locator("dl").getByText("Plan Sistema")).toBeVisible(); // también aparece en la respuesta prearmada
    await page.getByLabel("Estado").selectOption("contacted");
    await page.getByLabel("Notas internas").fill("Respondido por email.");
    await page.getByRole("button", { name: "Guardar", exact: true }).click();
    await expect(page.getByText("Guardado.")).toBeVisible();
    await expect(page.locator("tr", { hasText: "Ana E2E" })).toContainText("Contactado");
  });

  test("CMS: crear una FAQ la publica en el sitio", async ({ page }) => {
    await login(page);
    await page.goto("/admin/faq/nuevo");
    await page.getByLabel("Pregunta").fill("E2E ¿Esta pregunta viene del CMS?");
    await page.getByLabel("Respuesta").fill("Sí: la creó una prueba automática.");
    await page.getByLabel("Categoría").fill("General");
    await page.getByLabel("Estado").selectOption("published");
    await page.getByRole("button", { name: "Guardar", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/faq\?guardado=1/);
    await page.goto("/faq");
    await expect(page.getByText("E2E ¿Esta pregunta viene del CMS?").first()).toBeVisible();
  });

  test("CMS: cambiar el precio de un plan se refleja en /planes", async ({ page }) => {
    await login(page);
    await page.goto("/admin/planes");
    await page.getByRole("link", { name: "Turbo" }).click();
    await page.getByRole("spinbutton", { name: /^Precio/ }).fill("275");
    await page.getByRole("button", { name: "Guardar", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/planes\?guardado=1/);
    await page.goto("/planes");
    await expect(page.locator("li").filter({ has: page.getByRole("heading", { name: "Turbo", exact: true }) })).toContainText("USD 275");
    // se restaura desde el propio CMS (así también se invalida la caché)
    await page.goto("/admin/planes");
    await page.getByRole("link", { name: "Turbo" }).click();
    await page.getByRole("spinbutton", { name: /^Precio/ }).fill("250");
    await page.getByRole("button", { name: "Guardar", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/planes\?guardado=1/);
  });

  test("CMS: editar una sección del Home cambia el sitio", async ({ page }) => {
    await login(page);
    await page.goto("/admin/home/final_cta");
    const title = page.getByLabel("Título");
    const original = await title.inputValue();
    await title.fill("Menos trabajo manual. Más negocio. (E2E)");
    await page.getByRole("button", { name: "Guardar", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/home\?guardado=1/);
    await page.goto("/");
    await expect(page.locator("#contacto")).toContainText("(E2E)");
    await page.goto("/admin/home/final_cta");
    await page.getByLabel("Título").fill(original);
    await page.getByRole("button", { name: "Guardar", exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/home\?guardado=1/);
  });

  test("WhatsApp: sin número lleva a contacto; con número abre wa.me con mensaje contextual", async ({ page }) => {
    await page.goto("/servicios/automatizacion");
    await page.getByRole("button", { name: "¿Cavamos una solución?" }).click();
    await expect(page.getByText("¿Qué problema querés dejar de hacer a mano?")).toBeVisible();
    await page.getByRole("button", { name: "Hablemos" }).click();
    await expect(page).toHaveURL("/contacto");

    await login(page);
    await page.goto("/admin/whatsapp");
    await page.getByLabel(/Teléfono de WhatsApp/).fill("+591 70000000");
    await page.getByRole("button", { name: "Guardar", exact: true }).click();
    await expect(page.getByText("Guardado.")).toBeVisible();

    // Se captura la URL que el botón intenta abrir, sin salir a internet.
    await page.addInitScript(() => {
      window.open = (target) => {
        (window as unknown as { opened: string }).opened = String(target);
        return null;
      };
    });
    await page.goto("/servicios/automatizacion");
    await page.getByRole("button", { name: "¿Cavamos una solución?" }).click();
    await page.getByRole("button", { name: "Hablemos" }).click();
    const url = decodeURIComponent(await page.evaluate(() => (window as unknown as { opened: string }).opened));
    expect(url).toMatch(/^https:\/\/wa\.me\//);
    expect(url).toContain("59170000000");
    expect(url).toContain("me interesa el servicio de Automatización");

    await page.goto("/admin/whatsapp");
    await page.getByLabel(/Teléfono de WhatsApp/).fill("");
    await page.getByRole("button", { name: "Guardar", exact: true }).click();
    await expect(page.getByText("Guardado.")).toBeVisible();
  });

  test("cerrar sesión bloquea el panel", async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: /Cerrar sesión/ }).first().click();
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin$/);
  });
});
