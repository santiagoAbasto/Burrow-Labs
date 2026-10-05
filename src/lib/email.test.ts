import { afterEach, describe, expect, it, vi } from "vitest";

const FROM = "Burrow Labs <hola@burrowlabs.com.bo>";
const SITE = "https://burrowlabs.com.bo";
const message = { to: "qa@example.com", subject: "Hola", html: "<p>Hola</p>", text: "Hola", headers: { "List-Unsubscribe": "<https://burrowlabs.com.bo/newsletter/baja/t>" } };

/** Carga el módulo con un driver dado (las constantes se fijan al importar). */
async function load(driver: "log" | "smtp" | "resend" | "brevo", extra: Record<string, unknown> = {}) {
  vi.resetModules();
  vi.doMock("./env", () => ({
    env: { EMAIL_DRIVER: driver, EMAIL_API_KEY: driver === "log" ? undefined : "clave-de-prueba", EMAIL_FROM: FROM, NEXT_PUBLIC_SITE_URL: SITE, AUTH_SECRET: "s".repeat(32), ...extra },
  }));
  return import("./email");
}

/** Sustituye nodemailer por un transporte falso: ningún test abre una conexión real. */
function mockSmtp(sendMail: (mail: unknown) => Promise<unknown>) {
  const createTransport = vi.fn((options: unknown) => ({ sendMail, options }));
  vi.doMock("nodemailer", () => ({ default: { createTransport } }));
  return createTransport;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.doUnmock("./env");
  vi.doUnmock("nodemailer");
});

describe("sendEmail", () => {
  it("log: no llama a ningún proveedor, registra en consola y devuelve ok", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const { emailConfigured, emailDriver, sendEmail } = await load("log");
    expect(emailDriver).toBe("log");
    expect(emailConfigured).toBe(false);
    expect(await sendEmail(message)).toEqual({ ok: true });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledWith(expect.stringContaining("Hola"));
    // El email del destinatario es un dato personal: en el log va solo un identificador derivado.
    const logged = info.mock.calls.flat().join(" ");
    expect(logged).not.toContain("qa@example.com");
    expect(logged).not.toContain("example.com");
    expect(logged).toMatch(/destinatario #[0-9a-f]{8}$/);
    await sendEmail({ ...message, to: " QA@example.com" });
    expect(info.mock.calls[1][0]).toBe(info.mock.calls[0][0]); // mismo destinatario → mismo identificador
  });

  it("resend: POST a su API con Bearer y el cuerpo que espera", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchSpy);
    const { emailConfigured, sendEmail } = await load("resend");
    expect(emailConfigured).toBe(true);
    expect(await sendEmail(message)).toEqual({ ok: true });
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({ Authorization: "Bearer clave-de-prueba", "Content-Type": "application/json" });
    expect(JSON.parse(String(init.body))).toEqual({ from: FROM, to: ["qa@example.com"], subject: "Hola", html: "<p>Hola</p>", text: "Hola", headers: message.headers });
  });

  it("brevo: POST a su API con api-key y el remitente separado en nombre y email", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(new Response(JSON.stringify({ messageId: "x" }), { status: 201 }));
    vi.stubGlobal("fetch", fetchSpy);
    const { sendEmail } = await load("brevo");
    expect(await sendEmail(message)).toEqual({ ok: true });
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.brevo.com/v3/smtp/email");
    expect(init.headers).toMatchObject({ "api-key": "clave-de-prueba", "Content-Type": "application/json" });
    expect(JSON.parse(String(init.body))).toEqual({
      sender: { name: "Burrow Labs", email: "hola@burrowlabs.com.bo" },
      to: [{ email: "qa@example.com" }],
      subject: "Hola",
      htmlContent: "<p>Hola</p>",
      textContent: "Hola",
      headers: message.headers,
    });
  });

  it("smtp: un transporte reutilizado, con TLS obligatorio, EHLO del dominio y el remitente configurado", async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: "x" });
    const createTransport = mockSmtp(sendMail);
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const { emailConfigured, sendEmail } = await load("smtp", { SMTP_HOST: "smtp.example.com", SMTP_PORT: 465, SMTP_USER: "envios@example.com", SMTP_PASSWORD: "secreto-smtp" });
    expect(emailConfigured).toBe(true);
    expect(await sendEmail(message)).toEqual({ ok: true });
    expect(await sendEmail(message)).toEqual({ ok: true });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(createTransport).toHaveBeenCalledTimes(1);
    expect(createTransport.mock.calls[0][0]).toMatchObject({
      pool: true,
      host: "smtp.example.com",
      port: 465,
      secure: true,
      requireTLS: true,
      name: "burrowlabs.com.bo",
      auth: { user: "envios@example.com", pass: "secreto-smtp" },
    });
    expect(sendMail).toHaveBeenCalledWith({ from: FROM, to: "qa@example.com", subject: "Hola", html: "<p>Hola</p>", text: "Hola", headers: message.headers });
  });

  it("la newsletter sale de EMAIL_FROM_NEWSLETTER y, si no está, del remitente general", async () => {
    const sendMail = vi.fn().mockResolvedValue({});
    mockSmtp(sendMail);
    const novedades = "Burrow Labs <novedades@burrowlabs.com.bo>";
    const withOwn = await load("smtp", { SMTP_HOST: "smtp.example.com", SMTP_PORT: 587, EMAIL_FROM_NEWSLETTER: novedades });
    expect(withOwn.newsletterFrom).toBe(novedades);
    await withOwn.sendEmail({ ...message, from: withOwn.newsletterFrom });
    await withOwn.sendEmail(message);
    expect(sendMail.mock.calls.map(([mail]) => (mail as { from: string }).from)).toEqual([novedades, FROM]);
    expect((await load("smtp", { SMTP_HOST: "smtp.example.com", SMTP_PORT: 587 })).newsletterFrom).toBe(FROM);
  });

  it("smtp: en el 587 usa STARTTLS obligatorio y, sin usuario, no manda credenciales (relay por IP)", async () => {
    const createTransport = mockSmtp(vi.fn().mockResolvedValue({}));
    const { sendEmail } = await load("smtp", { SMTP_HOST: "smtp-relay.example.com", SMTP_PORT: 587 });
    expect(await sendEmail(message)).toEqual({ ok: true });
    expect(createTransport.mock.calls[0][0]).toMatchObject({ port: 587, secure: false, requireTLS: true, auth: undefined });
  });

  it("smtp: un rechazo o una caída vuelven como { ok:false } sin el destinatario ni la contraseña", async () => {
    const rejection = Object.assign(new Error("550 5.1.1 <qa@example.com> no existe"), { responseCode: 550, response: "550 5.1.1 <qa@example.com> no existe" });
    mockSmtp(vi.fn().mockRejectedValue(rejection));
    const smtp = { SMTP_HOST: "smtp.example.com", SMTP_PORT: 465, SMTP_USER: "envios@example.com", SMTP_PASSWORD: "secreto-smtp" };
    const rejected = await (await load("smtp", smtp)).sendEmail(message);
    expect(rejected).toEqual({ ok: false, error: "smtp respondió 550" });

    mockSmtp(vi.fn().mockRejectedValue(Object.assign(new Error("Invalid login: secreto-smtp"), { code: "EAUTH" })));
    const failed = await (await load("smtp", smtp)).sendEmail(message);
    expect(failed).toEqual({ ok: false, error: "smtp falló (EAUTH)" });
    expect(JSON.stringify([rejected, failed])).not.toMatch(/qa@example\.com|secreto-smtp/);
  });

  it("un rechazo o una caída del proveedor vuelven como { ok:false } sin lanzar y sin la clave", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: "domain not verified" }), { status: 403 })));
    const rejected = await (await load("resend")).sendEmail(message);
    expect(rejected).toEqual({ ok: false, error: "resend respondió 403: domain not verified" });
    expect(JSON.stringify(rejected)).not.toContain("clave-de-prueba");

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));
    expect(await (await load("brevo")).sendEmail(message)).toEqual({ ok: false, error: "no se pudo conectar con brevo" });
  });
});

describe("renderBrandEmail", () => {
  const body = "## Hola\n\nUn [enlace](https://burrowlabs.com.bo/lab) y **negrita**.\n\n- uno\n- dos";

  it("arma el correo con preheader, logo, burro animado, título, Markdown convertido y botón por defecto", async () => {
    const { renderBrandEmail } = await load("log");
    const { html, text } = renderBrandEmail({ subject: "Novedades <abril>", bodyMarkdown: body, preheader: "Lo que desenterramos este mes" });
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("<title>Novedades &lt;abril&gt;</title>");
    expect(html).toContain("Novedades &lt;abril&gt;</h1>");
    expect(html).toContain("Lo que desenterramos este mes&zwnj;");
    expect(html).toContain(`src="${SITE}/brand/email/wordmark.png"`);
    expect(html).toContain(`src="${SITE}/brand/email/burro.gif"`);
    expect(html).toContain(`src="${SITE}/brand/email/badge.png"`);
    for (const tag of html.match(/<img[^>]*>/g) ?? []) expect(tag).toMatch(/ alt="[^"]+"/); // todas con alt
    expect(html).toContain("#fcea10");
    expect(html).toContain("<h2");
    expect(html).toContain("<strong>negrita</strong>");
    expect(html).toContain("<li>uno</li>");
    expect(html).toContain('href="https://burrowlabs.com.bo/lab"');
    expect(html).toContain(`<a href="${SITE}" style="display:inline-block;padding:15px 30px`);
    expect(html).toContain("Ver el sitio</a>");
    expect(text).toContain("Novedades <abril>");
    expect(text).toContain("## Hola");
    expect(text).toContain(`Ver el sitio: ${SITE}`);
  });

  it("sin preheader, usa las primeras palabras del cuerpo sin la sintaxis Markdown", async () => {
    const { renderBrandEmail } = await load("log");
    const { html } = renderBrandEmail({ subject: "x", bodyMarkdown: "## Hola\n\nUn [enlace](https://a.b) y **negrita**." });
    expect(html).toContain("Hola Un enlace y negrita.&zwnj;");
  });

  it("el botón lleva el href y la etiqueta pedidos, escapados", async () => {
    const { renderBrandEmail } = await load("log");
    const { html, text } = renderBrandEmail({ subject: "x", bodyMarkdown: "Hola", cta: { label: "Ver el <plan>", href: "https://burrowlabs.com.bo/planes?a=1&b=2" } });
    expect(html).toContain('href="https://burrowlabs.com.bo/planes?a=1&amp;b=2"');
    expect(html).toContain("Ver el &lt;plan&gt;</a>");
    expect(text).toContain("Ver el <plan>: https://burrowlabs.com.bo/planes?a=1&b=2");
  });

  it("muestra solo las redes con URL, con su icono y su enlace, y las lista en el texto plano", async () => {
    const { renderBrandEmail } = await load("log");
    const social = { instagram: "https://instagram.com/burrowlabs", github: "", x: "https://x.com/burrowlabs" };
    const { html, text } = renderBrandEmail({ subject: "x", bodyMarkdown: "Hola", social });
    expect(html).toContain('href="https://instagram.com/burrowlabs"');
    expect(html).toContain(`src="${SITE}/brand/email/instagram.png"`);
    expect(html).toContain('alt="Instagram"');
    expect(html).toContain(`src="${SITE}/brand/email/x.png"`);
    expect(html).not.toContain("github.png");
    expect(html).not.toContain("linkedin.png");
    expect(text).toContain("Instagram: https://instagram.com/burrowlabs");
    expect(text).toContain("X: https://x.com/burrowlabs");
    expect(text).not.toContain("GitHub");

    const bare = renderBrandEmail({ subject: "x", bodyMarkdown: "Hola" }).html;
    expect(bare).not.toContain("instagram.png");
  });

  it("omite las redes cuya URL no es https:// bien formada", async () => {
    const { renderBrandEmail } = await load("log");
    const social = { instagram: "javascript:alert(1)", linkedin: "http://linkedin.com/company/x", github: 'https://github.com/x" onclick="y', x: "https://x.com/burrowlabs" };
    const { html, text } = renderBrandEmail({ subject: "x", bodyMarkdown: "Hola", social });
    expect(html).toContain('href="https://x.com/burrowlabs"');
    for (const bad of ["javascript:", "http://linkedin.com", "onclick", "instagram.png", "linkedin.png", "github.png"]) expect(html, bad).not.toContain(bad);
    expect(text).not.toContain("javascript:");
  });

  it("pie: con enlace de baja dice que te suscribiste y permite darte de baja; sin él, es una respuesta a tu consulta", async () => {
    const { renderBrandEmail } = await load("log");
    const unsubscribeUrl = "https://burrowlabs.com.bo/newsletter/baja/abc123";
    const newsletter = renderBrandEmail({ subject: "x", bodyMarkdown: "Hola", unsubscribeUrl });
    expect(newsletter.html).toContain("Recibís este correo porque te suscribiste en burrowlabs.com.bo");
    expect(newsletter.html).toContain(`<a href="${unsubscribeUrl}"`);
    expect(newsletter.html).toContain("Darse de baja");
    expect(newsletter.text).toContain(`Darse de baja: ${unsubscribeUrl}`);

    const reply = renderBrandEmail({ subject: "x", bodyMarkdown: "Hola" });
    expect(reply.html).toContain("Te escribimos de Burrow Labs por la consulta que nos dejaste en burrowlabs.com.bo.");
    expect(reply.html).not.toContain("Darse de baja");
    expect(reply.text).toContain("Te escribimos de Burrow Labs por la consulta que nos dejaste en burrowlabs.com.bo.");
    expect(reply.text).not.toContain("Darse de baja");
  });

  it("descarta el HTML crudo del Markdown y escapa el resto", async () => {
    const { renderBrandEmail } = await load("log");
    const { html } = renderBrandEmail({ subject: "x", bodyMarkdown: "Hola <script>alert(1)</script> <img src=x onerror=alert(1)> y [js](javascript:alert(1))" });
    expect(html).not.toContain("<script");
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("javascript:");
  });
});

describe("renderReplyEmail", () => {
  it("es un correo simple: el mensaje, la firma y el pie, sin imágenes, botón ni redes", async () => {
    const { renderReplyEmail } = await load("log");
    const { html, text } = renderReplyEmail({ bodyMarkdown: "Hola Ana,\n\nTe paso la **propuesta** y ![logo](https://burrowlabs.com.bo/brand/x.png) <b>sin HTML</b>.", signature: "Equipo <Burrow>" });
    expect(html).not.toMatch(/<img|burro\.gif|wordmark|data-variant|instagram/i);
    expect(html).toContain("<strong>propuesta</strong>");
    expect(html).toContain("Equipo &lt;Burrow&gt;");
    expect(html).not.toContain("<b>sin HTML</b>");
    expect(html).toContain(`<a href="${SITE}"`);
    expect(html).toContain("Te escribimos por la consulta que nos dejaste en burrowlabs.com.bo.");
    expect(text).toBe("Hola Ana,\n\nTe paso la **propuesta** y ![logo](https://burrowlabs.com.bo/brand/x.png) <b>sin HTML</b>.\n\n—\nEquipo <Burrow>\nBurrow Labs · https://burrowlabs.com.bo\n\nTe escribimos por la consulta que nos dejaste en burrowlabs.com.bo.\n");
  });
});

describe("imágenes del cuerpo", () => {
  it("solo se cargan las del propio sitio; de las demás queda el texto alternativo", async () => {
    const { renderBrandEmail } = await load("log");
    const body = `![Del sitio](${SITE}/media/foto.png) y ![Ajena](https://otro-servidor.example/pixel.png) y ![Disfrazada](${SITE}.otro.example/x.png)`;
    const { html } = renderBrandEmail({ subject: "x", bodyMarkdown: body });
    expect(html).toContain(`<img src="${SITE}/media/foto.png" alt="Del sitio"`);
    expect(html).not.toMatch(/otro-servidor\.example|otro\.example/);
    expect(html).toContain("Ajena");
  });
});

describe("renderCampaignEmail", () => {
  it("es el correo con la marca más el enlace de baja", async () => {
    const { renderCampaignEmail } = await load("log");
    const unsubscribeUrl = "https://burrowlabs.com.bo/newsletter/baja/abc123";
    const { html, text } = renderCampaignEmail({ subject: "Novedades", bodyMarkdown: "## Hola\n\nTexto.", unsubscribeUrl });
    expect(html).toContain("burro.gif");
    expect(html).toContain("<h2");
    expect(html).toContain(`href="${unsubscribeUrl}"`);
    expect(html).toContain("Darse de baja");
    expect(html).toContain("te suscribiste en burrowlabs.com.bo");
    expect(text).toContain("## Hola");
    expect(text).toContain(`Darse de baja: ${unsubscribeUrl}`);
  });
});
