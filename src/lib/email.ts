import "server-only";
import { createHmac } from "node:crypto";
import nodemailer, { type Transporter } from "nodemailer";
import { env } from "./env";
import { isHttpsUrl } from "./validation";

/** `from` solo se pasa cuando el correo no sale del remitente general (hoy, la newsletter). */
export type EmailMessage = { to: string; subject: string; html: string; text: string; headers?: Record<string, string>; from?: string };
export type EmailResult = { ok: true } | { ok: false; error: string };

/** Vía de envío elegida con EMAIL_DRIVER. Con `log` nada sale del servidor. */
export const emailDriver = env.EMAIL_DRIVER;
/** true cuando hay un proveedor real configurado; con el driver `log` los correos solo se registran en consola. */
export const emailConfigured = emailDriver !== "log";
/** Remitente de la bienvenida y las campañas: EMAIL_FROM_NEWSLETTER o, si no está, el general. */
export const newsletterFrom = env.EMAIL_FROM_NEWSLETTER ?? env.EMAIL_FROM;

const ENDPOINT = { resend: "https://api.resend.com/emails", brevo: "https://api.brevo.com/v3/smtp/email" } as const;

/** «Marca <envios@dominio>» → { name, email } (Brevo los pide separados). */
function sender(from: string): { name?: string; email: string } {
  const match = /^(.*?)\s*<([^>]+)>$/.exec(from.trim());
  const name = match?.[1].replace(/^"|"$/g, "").trim();
  return { email: match ? match[2] : from.trim(), ...(name ? { name } : {}) };
}

/**
 * Identificador del destinatario para los logs: hmac del email, 8 hex. Permite ver que dos líneas son
 * del mismo destinatario sin que el email (un dato personal) quede escrito en la salida del servidor.
 */
const recipientId = (email: string) => createHmac("sha256", env.AUTH_SECRET).update(`email|${email.trim().toLowerCase()}`).digest("hex").slice(0, 8);

// SMTP: un solo transporte con conexiones reutilizadas (una campaña no abre una sesión por correo).
let transport: Transporter | undefined;
const smtp = () =>
  (transport ??= nodemailer.createTransport({
    pool: true,
    maxConnections: 2,
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465, // 465 = TLS implícito
    requireTLS: true, // en otro puerto, STARTTLS obligatorio: nunca en claro
    name: new URL(env.NEXT_PUBLIC_SITE_URL).hostname, // EHLO con el dominio: el relay de Google rechaza nombres genéricos
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000,
  }));

/** Envía por SMTP o por la API del proveedor. Nunca lanza: un fallo vuelve como { ok:false, error } sin la clave ni el destinatario. */
export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  if (emailDriver === "log") {
    console.info(`[email:log] ${message.subject} → destinatario #${recipientId(message.to)}`);
    return { ok: true };
  }
  const key = env.EMAIL_API_KEY ?? "";
  const from = message.from ?? env.EMAIL_FROM ?? ""; // env.ts exige EMAIL_FROM con un driver real
  if (emailDriver === "smtp") {
    try {
      await smtp().sendMail({ from, to: message.to, subject: message.subject, html: message.html, text: message.text, headers: message.headers });
      return { ok: true };
    } catch (error) {
      // El texto del servidor puede citar al destinatario: solo salen el código de respuesta o el tipo de fallo.
      const { responseCode, code } = error as { responseCode?: unknown; code?: unknown };
      const detail = typeof responseCode === "number" ? `respondió ${responseCode}` : typeof code === "string" ? `falló (${code})` : "falló";
      return { ok: false, error: `smtp ${detail}` };
    }
  }
  const request: { headers: Record<string, string>; body: unknown } =
    emailDriver === "resend"
      ? { headers: { Authorization: `Bearer ${key}` }, body: { from, to: [message.to], subject: message.subject, html: message.html, text: message.text, headers: message.headers } }
      : { headers: { "api-key": key }, body: { sender: sender(from), to: [{ email: message.to }], subject: message.subject, htmlContent: message.html, textContent: message.text, headers: message.headers } };
  try {
    const res = await fetch(ENDPOINT[emailDriver], { method: "POST", headers: { "Content-Type": "application/json", ...request.headers }, body: JSON.stringify(request.body) });
    if (res.ok) return { ok: true };
    const detail = await res.json().then((json: { message?: unknown }) => (typeof json?.message === "string" ? json.message.slice(0, 200) : "")).catch(() => "");
    return { ok: false, error: `${emailDriver} respondió ${res.status}${detail ? `: ${detail}` : ""}` };
  } catch {
    return { ok: false, error: `no se pudo conectar con ${emailDriver}` };
  }
}

/* ───────────────────────────── plantilla de campaña ─────────────────────────────
   Los clientes de correo no leen variables CSS ni hojas externas: acá sí van hex (los del logo) y estilos inline.
   El Markdown se convierte con un conversor propio y acotado (react-dom/server no se puede importar en el grafo de
   servidor de Next). ponytail: cubre títulos, párrafos, negrita, cursiva, enlaces, imágenes (solo del sitio), listas, citas, código y
   líneas; sin tablas ni HTML crudo (se escapa) — a más necesidad, un parser Markdown completo. */

const INK = "#080a09";
const YELLOW = "#fcea10";
const BLUE = "#1671b1";
const PAPER = "#ededed";
const MUTED = "#4a4f52";
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const STYLE = {
  h2: "margin:24px 0 8px;font-size:22px;line-height:1.25",
  h3: "margin:20px 0 8px;font-size:18px;line-height:1.3",
  p: "margin:0 0 16px",
  list: "margin:0 0 16px;padding-left:24px",
  quote: `margin:0 0 16px;padding:4px 16px;border-left:4px solid ${YELLOW};color:${MUTED}`,
  code: "font-family:Menlo,Consolas,monospace;font-size:14px;background:#f3f3f1;padding:1px 4px;border-radius:3px",
  pre: "margin:0 0 16px;padding:12px 16px;background:#f3f3f1;border-radius:4px;overflow:auto;font-size:14px;font-family:Menlo,Consolas,monospace;white-space:pre-wrap",
  img: "max-width:100%;height:auto;display:block;margin:0 0 16px",
  hr: "border:0;border-top:1px solid #e3e3e0;margin:24px 0",
  link: `color:${BLUE};text-decoration:underline`,
};

const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
/** Solo direcciones web o de correo: nada de javascript: ni data:. */
const safeUrl = (url: string) => (/^(https?:\/\/|mailto:)/i.test(url) ? url : "#");
/**
 * Imágenes solo del propio sitio (las del panel se sirven en /media): una alojada en otro servidor le avisaría a ese
 * tercero cada apertura del correo, y la política de privacidad dice que eso no pasa. De las demás queda el texto alternativo.
 * ponytail: con STORAGE_DRIVER=s3 las imágenes subidas viven en el bucket y quedarían fuera — sumar S3_PUBLIC_URL y revisar la política.
 */
const ownImage = (url: string) => url.startsWith(`${env.NEXT_PUBLIC_SITE_URL}/`);

/** Elementos en línea sobre texto ya escapado: código, imágenes, enlaces, negrita y cursiva. */
function inline(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, (_, code: string) => `<code style="${STYLE.code}">${code}</code>`)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt: string, url: string) => (ownImage(url) ? `<img src="${url}" alt="${alt}" style="${STYLE.img}">` : alt))
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label: string, url: string) => `<a href="${safeUrl(url)}" style="${STYLE.link}">${label}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*\w])[*_]([^*_\n]+)[*_](?=[^*\w]|$)/g, "$1<em>$2</em>");
}

const BLOCK_START = /^(#{1,6}\s|>|```|\s*[-*]\s|\s*\d+[.)]\s|(-{3,}|\*{3,})\s*$)/;

/** Bloques: títulos, líneas, citas, listas, código y párrafos (líneas seguidas hasta una vacía). */
function markdownToHtml(markdown: string): string {
  // El HTML crudo se descarta (como skipHtml): lo que queda se escapa igual.
  const lines = markdown.replace(/<[^>]*>/g, "").replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;
  const take = (test: RegExp, strip: RegExp) => {
    const items: string[] = [];
    while (i < lines.length && test.test(lines[i])) items.push(lines[i++].replace(strip, ""));
    return items;
  };
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.startsWith("```")) {
      i++;
      const code: string[] = [];
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      i++;
      out.push(`<pre style="${STYLE.pre}">${escapeHtml(code.join("\n"))}</pre>`);
      continue;
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      const tag = heading[1].length >= 3 ? "h3" : "h2"; // el h1 del correo es el asunto
      out.push(`<${tag} style="${STYLE[tag]}">${inline(heading[2])}</${tag}>`);
      i++;
      continue;
    }
    if (/^(-{3,}|\*{3,})\s*$/.test(line)) {
      out.push(`<hr style="${STYLE.hr}">`);
      i++;
      continue;
    }
    if (/^>/.test(line)) {
      out.push(`<blockquote style="${STYLE.quote}">${inline(take(/^>/, /^>\s?/).join(" "))}</blockquote>`);
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      out.push(`<ul style="${STYLE.list}">${take(/^\s*[-*]\s+/, /^\s*[-*]\s+/).map((item) => `<li>${inline(item)}</li>`).join("")}</ul>`);
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      out.push(`<ol style="${STYLE.list}">${take(/^\s*\d+[.)]\s+/, /^\s*\d+[.)]\s+/).map((item) => `<li>${inline(item)}</li>`).join("")}</ol>`);
      continue;
    }
    // párrafo: la línea actual y las siguientes no vacías que no empiecen otro bloque
    const paragraph = [lines[i++].trim()];
    while (i < lines.length && lines[i].trim() && !BLOCK_START.test(lines[i])) paragraph.push(lines[i++].trim());
    out.push(`<p style="${STYLE.p}">${inline(paragraph.join(" "))}</p>`);
  }
  return out.join("");
}

/* ───────────────────────────── correo con la marca ─────────────────────────────
   Un solo diseño para newsletter, bienvenida y respuestas: tablas anidadas, estilos inline y PNG/GIF generados por
   brand-src/build-email-assets.mjs (public/brand/email/). El burro es la estrella: GIF animado (orejas y pupila)
   dentro de un marco sticker sobre papel; abajo el cuerpo sobre blanco, la tarjeta amarilla con el botón, las redes
   y el pie. Outlook de escritorio muestra solo el primer cuadro del GIF (el de reposo) y no respeta los radios. */

export const SOCIAL_LABELS = { instagram: "Instagram", linkedin: "LinkedIn", github: "GitHub", facebook: "Facebook", tiktok: "TikTok", x: "X" } as const;
export type SocialNetwork = keyof typeof SOCIAL_LABELS;

/** Correo con la marca: asunto, cuerpo en Markdown y, opcionalmente, botón, redes y enlace de baja. */
export type BrandEmail = {
  subject: string;
  bodyMarkdown: string;
  /** Texto que algunos clientes muestran junto al asunto. */
  preheader?: string;
  cta?: { label: string; href: string };
  social?: Partial<Record<"instagram" | "linkedin" | "github" | "facebook" | "tiktok" | "x", string>>;
  /** Solo en la newsletter: pie «te suscribiste… Darse de baja». Sin él, pie de respuesta directa. */
  unsubscribeUrl?: string;
};

const asset = (name: string) => `${env.NEXT_PUBLIC_SITE_URL}/brand/email/${name}`;
/** «burrowlabs.com.bo» (en local, «localhost:3000»). */
const siteHost = () => new URL(env.NEXT_PUBLIC_SITE_URL).host;
/** Primeras palabras del cuerpo sin la sintaxis Markdown, para el preheader cuando no se da uno. */
const summary = (markdown: string) =>
  markdown
    .replace(/<[^>]*>|!\[[^\]]*\]\([^)]*\)|```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#*_>`]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);

const SOCIAL_ORDER: SocialNetwork[] = ["instagram", "linkedin", "github", "facebook", "tiktok", "x"];
/** Redes cargadas en el CMS: solo direcciones https:// bien formadas; cualquier otra cosa se omite. */
const socialLinks = (social: BrandEmail["social"]) =>
  SOCIAL_ORDER.flatMap((network) => {
    const href = social?.[network]?.trim() ?? "";
    return isHttpsUrl(href) ? [{ network, label: SOCIAL_LABELS[network], href }] : [];
  });

export function renderBrandEmail(input: BrandEmail): { html: string; text: string } {
  const site = env.NEXT_PUBLIC_SITE_URL;
  const host = siteHost();
  const cta = input.cta ?? { label: "Ver el sitio", href: site };
  const preheader = input.preheader ?? summary(input.bodyMarkdown);
  const social = socialLinks(input.social);
  const footer = input.unsubscribeUrl
    ? `Recibís este correo porque te suscribiste en ${escapeHtml(host)} · <a href="${escapeHtml(input.unsubscribeUrl)}" style="color:${MUTED};text-decoration:underline">Darse de baja</a>`
    : `Te escribimos de Burrow Labs por la consulta que nos dejaste en ${escapeHtml(host)}.`;
  const img = (name: string, width: number, height: number, alt: string, extra = "") =>
    `<img src="${asset(name)}" width="${width}" height="${height}" alt="${escapeHtml(alt)}" style="display:block;border:0;outline:none;text-decoration:none;width:${width}px;max-width:100%;height:auto;${extra}">`;
  const table = (attrs: string, rows: string) => `<table role="presentation" cellpadding="0" cellspacing="0" border="0" ${attrs}>${rows}</table>`;

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><meta name="color-scheme" content="light"><title>${escapeHtml(input.subject)}</title></head><body style="margin:0;padding:0;background:${PAPER};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%"><div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:${PAPER};opacity:0;mso-hide:all">${escapeHtml(preheader)}${"&zwnj;&nbsp;".repeat(40)}</div>${table(
    `width="100%" style="background:${PAPER}"`,
    `<tr><td align="center" style="padding:28px 12px 32px">${table(
      `width="600" style="width:100%;max-width:600px;font-family:${FONT};color:${INK};font-size:16px;line-height:1.6;text-align:left"`,
      [
        // cabecera: el banner «BURROW LABS» del logo, enlazado al sitio
        `<tr><td align="center" style="padding:0 0 24px"><a href="${escapeHtml(site)}" style="text-decoration:none">${img("wordmark.png", 220, 40, "Burrow Labs")}</a></td></tr>`,
        // hero: el burro en su marco sticker (halo amarillo + trazo tinta) sobre el papel, y el asunto como título
        `<tr><td align="center" style="padding:0 0 8px">${table(
          `align="center" style="margin:0 auto"`,
          `<tr><td style="background:${YELLOW};border-radius:28px;padding:5px">${table(
            "",
            `<tr><td style="background:#ffffff;border:3px solid ${INK};border-radius:22px;padding:18px 24px 0">${img("burro.gif", 240, 372, "El burro de Burrow Labs, frente a su laptop, moviendo las orejas", "margin:0 auto")}</td></tr>`,
          )}</td></tr>`,
        )}</td></tr>`,
        `<tr><td align="center" style="padding:28px 16px 24px"><h1 style="margin:0;font-size:30px;line-height:1.15;font-weight:900;letter-spacing:-0.01em;text-transform:uppercase;color:${INK}">${escapeHtml(input.subject)}</h1></td></tr>`,
        // cuerpo sobre blanco
        `<tr><td style="background:#ffffff;border-radius:20px;padding:32px 28px 16px">${markdownToHtml(input.bodyMarkdown)}</td></tr>`,
        // tarjeta amarilla con el botón
        `<tr><td align="center" style="padding:16px 0 0"><div style="background:${YELLOW};border-radius:20px;padding:28px 24px;text-align:center"><p style="margin:0 0 16px;font-family:Menlo,Consolas,monospace;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${INK}">Codificando soluciones.</p>${table(
          `align="center" style="margin:0 auto"`,
          `<tr><td align="center" style="background:${INK};border-radius:12px"><a href="${escapeHtml(cta.href)}" style="display:inline-block;padding:15px 30px;font-family:${FONT};font-size:16px;line-height:1.2;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px">${escapeHtml(cta.label)}</a></td></tr>`,
        )}</div></td></tr>`,
        // redes (solo las cargadas) y el sitio
        social.length
          ? `<tr><td align="center" style="padding:32px 0 0">${table(
              `align="center" style="margin:0 auto"`,
              `<tr>${social.map(({ network, label, href }) => `<td style="padding:0 6px"><a href="${escapeHtml(href)}" title="${label}" style="text-decoration:none">${img(`${network}.png`, 28, 28, label)}</a></td>`).join("")}</tr>`,
            )}</td></tr>`
          : "",
        `<tr><td align="center" style="padding:${social.length ? 14 : 32}px 0 0">${table(
          `align="center" style="margin:0 auto"`,
          `<tr><td style="padding:0 10px 0 0">${img("badge.png", 48, 48, "Insignia de Burrow Labs")}</td><td style="font-size:15px;line-height:1.3"><strong style="display:block;color:${INK}">Burrow Labs</strong><a href="${escapeHtml(site)}" style="color:${BLUE};text-decoration:none">${escapeHtml(host)}</a></td></tr>`,
        )}</td></tr>`,
        // pie
        `<tr><td align="center" style="padding:24px 24px 0;font-size:13px;line-height:1.5;color:${MUTED}">${footer}</td></tr>`,
      ].join(""),
    )}</td></tr>`,
  )}</body></html>`;

  const text = [
    input.subject,
    "",
    input.bodyMarkdown.trim(),
    "",
    `${cta.label}: ${cta.href}`,
    ...(social.length ? ["", ...social.map(({ label, href }) => `${label}: ${href}`)] : []),
    "",
    "—",
    `Burrow Labs · ${site}`,
    input.unsubscribeUrl ? `Recibís este correo porque te suscribiste en ${host}\nDarse de baja: ${input.unsubscribeUrl}` : `Te escribimos de Burrow Labs por la consulta que nos dejaste en ${host}.`,
    "",
  ].join("\n");
  return { html, text };
}

/**
 * Respuesta a una consulta: un correo simple, como escrito a mano. Sin imágenes, botón ni redes, para que Gmail lo trate
 * como una conversación (pestaña Principal) y no como una promoción, que es donde cae la plantilla de marca.
 */
export function renderReplyEmail({ bodyMarkdown, signature }: { bodyMarkdown: string; signature: string }): { html: string; text: string } {
  const site = env.NEXT_PUBLIC_SITE_URL;
  const host = siteHost();
  const footer = `Te escribimos por la consulta que nos dejaste en ${host}.`;
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:16px;font-family:${FONT};font-size:15px;line-height:1.6;color:${INK}">${markdownToHtml(bodyMarkdown.replace(/!\[[^\]]*\]\([^)]*\)/g, ""))}<p style="${STYLE.p}">—<br>${escapeHtml(signature)}<br>Burrow Labs · <a href="${escapeHtml(site)}" style="${STYLE.link}">${escapeHtml(host)}</a></p><p style="margin:24px 0 0;font-size:13px;color:${MUTED}">${escapeHtml(footer)}</p></body></html>`;
  const text = [bodyMarkdown.trim(), "", "—", signature, `Burrow Labs · ${site}`, "", footer, ""].join("\n");
  return { html, text };
}

/** Correo de campaña (newsletter): el correo con la marca y el pie con la baja. Las redes se pasan llamando a renderBrandEmail. */
export function renderCampaignEmail({ subject, bodyMarkdown, unsubscribeUrl }: { subject: string; bodyMarkdown: string; unsubscribeUrl: string }): { html: string; text: string } {
  return renderBrandEmail({ subject, bodyMarkdown, unsubscribeUrl });
}
