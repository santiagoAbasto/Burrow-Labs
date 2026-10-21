"use server";

import { and, asc, eq, inArray, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { HOME_SECTIONS } from "@/components/home/sections";
import { db } from "@/db";
import { homeSections, leads, media, passwordResets, rateLimits, sessions, siteSettings, users } from "@/db/schema";
import { claimPasswordReset, createPasswordReset, createSession, destroySession, getSession, hashPassword, requireUser, RESET_MS, verifyCredentials, verifyPassword } from "@/lib/auth";
import { logActivity } from "./activity";
import { getSettings, revalidateContent, settingsSchema, TAGS } from "@/lib/content";
import { notifyIndexNow } from "@/lib/indexnow";
import { accountKey, clientIp, clientKey, rateLimit } from "@/lib/rate-limit";
import { isInternalPath } from "@/lib/analytics-events";
import { env } from "@/lib/env";
import { emailConfigured, renderBrandEmail, renderReplyEmail, sendEmail } from "@/lib/email";
import { MAX_UPLOAD_FILES, newMediaKey, processImageUpload, storage, UploadError } from "@/lib/storage";
import { slugify, slugSchema } from "@/lib/validation";
import { parseJsonForm, type JsonShape } from "./json-form";
import { column, getResource, type AdminField } from "./resources";
import { SETTINGS_SHAPE, type SettingsGroup } from "./settings-shape";

// Los argumentos ligados con .bind() viajan en la petición: se comprueban como cualquier otra entrada.
const isUuid = (value: unknown): value is string => z.uuid().safeParse(value).success;
/** Clave de una sección del Home. hasOwn y no `in`: «constructor» no es una sección. */
const isHomeKey = (key: unknown): key is keyof typeof HOME_SECTIONS => typeof key === "string" && Object.hasOwn(HOME_SECTIONS, key);
/** Id de un registro: uuid, salvo los recursos cuya clave primaria es otra columna (SEO usa la ruta). */
const isRowId = (resource: { pk?: string }, value: unknown): value is string => (resource.pk ? typeof value === "string" && value.length > 0 && value.length <= 300 : isUuid(value));
const isWebUrl = (value: string) => /^https?:\/\/[^\s"'<>]+$/i.test(value) && URL.canParse(value);

export type FormState = { error?: string; errors?: Record<string, string>; ok?: boolean };

const text = (form: FormData, name: string) => String(form.get(name) ?? "").replace(/\r\n/g, "\n").trim();
const lines = (form: FormData, name: string) =>
  text(form, name)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
const isUnique = (error: unknown) => {
  const e = error as { code?: string; cause?: { code?: string } };
  return (e.code ?? e.cause?.code) === "23505";
};

/* ───────────────────────────── sesión ───────────────────────────── */

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  const email = text(form, "email").toLowerCase();
  const password = form.get("password");
  // Dos límites cada 15 minutos: 5 por IP (fuerza bruta desde un origen) y 10 por cuenta (la misma
  // cuenta probada desde muchas IP). La clave por cuenta sale del email enviado, exista o no el
  // usuario, así que el bloqueo no revela qué cuentas existen. Sin IP fiable (proxy mal configurado)
  // no se usa la clave por IP: sería una sola para todos y cualquiera bloquearía el ingreso.
  // En orden: un intento que ya frenó la clave por IP no gasta el cupo de la cuenta, así que desde una
  // sola IP no se puede dejar bloqueada la cuenta de otro.
  const requestHeaders = await headers();
  const keys = [clientIp(requestHeaders) ? { key: clientKey(requestHeaders, "login"), limit: 5 } : null, { key: accountKey("login-user", email), limit: 10 }].filter((entry) => entry !== null);
  for (const { key, limit } of keys) {
    const result = await rateLimit(key, { limit, windowSec: 900 });
    if (!result.ok) return { error: `Demasiados intentos. Probá de nuevo en ${Math.ceil(result.retryAfterSec / 60)} minutos.` };
  }
  const parsed = z.object({ email: z.email().max(254), password: z.string().min(1).max(200) }).safeParse({ email, password });
  const user = parsed.success ? await verifyCredentials(parsed.data.email, parsed.data.password) : null;
  if (!user) return { error: "Email o contraseña incorrectos." }; // mismo mensaje exista o no el usuario
  await db.delete(rateLimits).where(inArray(rateLimits.key, keys.map(({ key }) => key))); // un ingreso correcto no consume intentos
  await createSession(user.id);
  await logActivity(user, "login", "sesión", null);
  redirect("/admin");
}

/**
 * Pide el enlace de recuperación. Responde siempre igual —exista o no la cuenta— para no delatar qué
 * direcciones son administradores, y el correo sale por el mismo relay de Google Workspace que el resto.
 */
export async function requestPasswordReset(_prev: FormState, form: FormData): Promise<FormState> {
  const email = text(form, "email").toLowerCase();
  // Mismos dos límites que el ingreso: por IP y por cuenta. Sin esto, el formulario sería una forma
  // cómoda de inundar de correos la casilla de un administrador.
  const requestHeaders = await headers();
  const keys = [clientIp(requestHeaders) ? { key: clientKey(requestHeaders, "reset"), limit: 5 } : null, { key: accountKey("reset-user", email), limit: 5 }].filter((entry) => entry !== null);
  for (const { key, limit } of keys) {
    const result = await rateLimit(key, { limit, windowSec: 900 });
    if (!result.ok) return { error: `Demasiados pedidos. Probá de nuevo en ${Math.ceil(result.retryAfterSec / 60)} minutos.` };
  }
  if (!z.email().max(254).safeParse(email).success) return { ok: true }; // misma respuesta que un email válido sin cuenta

  const [user] = await db.select({ id: users.id, name: users.name }).from(users).where(eq(users.email, email)).limit(1);
  if (user) {
    const token = await createPasswordReset(user.id);
    const url = `${env.NEXT_PUBLIC_SITE_URL}/admin/recuperar/${token}`;
    const minutos = Math.round(RESET_MS / 60000);
    const subject = "Cambiá tu contraseña de Burrow Labs";
    const body = [
      `Hola${user.name ? ` ${user.name}` : ""},`,
      "",
      "Pediste cambiar la contraseña del panel de Burrow Labs. El botón de abajo te lleva a elegir una nueva.",
      "",
      `El enlace vale **${minutos} minutos** y se usa una sola vez. Si pedís otro, este deja de servir.`,
      "",
      "**Si no fuiste vos, ignorá este correo**: tu contraseña no cambia hasta que alguien abra ese enlace y escriba una nueva.",
    ].join("\n");
    let social: Awaited<ReturnType<typeof getSettings>>["social"] | undefined;
    try {
      social = (await getSettings()).social;
    } catch {
      // sin redes antes que sin correo
    }
    const { html, text: plain } = renderBrandEmail({ subject, bodyMarkdown: body, preheader: `El enlace vale ${minutos} minutos y se usa una sola vez.`, cta: { label: "Elegir una contraseña nueva", href: url }, social });
    const result = await sendEmail({ to: email, subject, html, text: plain });
    // Nunca se registra el token ni se delata el resultado en pantalla: solo queda en el log del servidor.
    if (!result.ok) console.error(`[recuperación] no se pudo enviar el correo: ${result.error}`);
  }
  return { ok: true };
}

/** Cambia la contraseña con el token del correo, cierra todas las sesiones de esa cuenta y entra. */
export async function completePasswordReset(token: string, _prev: FormState, form: FormData): Promise<FormState> {
  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{16,128}$/.test(token)) return { error: "El enlace no es válido. Pedí uno nuevo." };
  const requestHeaders = await headers();
  if (clientIp(requestHeaders)) {
    const result = await rateLimit(clientKey(requestHeaders, "reset-set"), { limit: 10, windowSec: 900 });
    if (!result.ok) return { error: `Demasiados intentos. Probá de nuevo en ${Math.ceil(result.retryAfterSec / 60)} minutos.` };
  }
  const parsed = passwordSchema.safeParse(String(form.get("password") ?? ""));
  if (!parsed.success) return { error: "Revisá los campos marcados.", errors: { password: parsed.error.issues[0]?.message ?? "Inválida." } };
  if (String(form.get("password")) !== String(form.get("confirm"))) return { error: "Las contraseñas no coinciden.", errors: { confirm: "No coincide." } };

  // Se valida y se marca usado en el mismo UPDATE: sin ventana entre comprobar y consumir.
  const userId = await claimPasswordReset(token);
  if (!userId) return { error: "El enlace venció o ya se usó. Pedí uno nuevo." };
  const [row] = await db.update(users).set({ passwordHash: await hashPassword(parsed.data) }).where(eq(users.id, userId)).returning({ id: users.id, email: users.email, name: users.name });
  if (!row) return { error: "El enlace venció o ya se usó. Pedí uno nuevo." };
  // Cambiar la contraseña echa a quien estuviera dentro con la vieja, en cualquier dispositivo.
  await db.delete(sessions).where(eq(sessions.userId, userId));
  await db.delete(passwordResets).where(eq(passwordResets.userId, userId));
  await createSession(userId);
  await logActivity(row, "update", "sesión", null, "contraseña recuperada por correo");
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin");
}

/* ───────────────────────────── CRUD genérico ───────────────────────────── */

// ponytail: las fechas del admin se interpretan en hora de Bolivia (UTC−4, sin horario de verano)
// — hacerlo configurable si el sitio se administra desde otra zona.
const ADMIN_UTC_OFFSET = "-04:00";

function parseField(field: AdminField, form: FormData, numeric: boolean, notNull: boolean): { value?: unknown; error?: string } {
  const raw = text(form, field.name);
  switch (field.type) {
    case "boolean":
      return { value: form.get(field.name) === "on" };
    case "number": {
      // Vacío en una columna obligatoria (orden, minutos de lectura): se deja el valor por defecto.
      if (!raw) return { value: notNull ? undefined : null };
      const n = Number(raw.replace(",", "."));
      if (!Number.isFinite(n)) return { error: "Tiene que ser un número." };
      return { value: numeric ? String(n) : Math.round(n) };
    }
    case "select":
      if (!raw && !field.required) return { value: field.options?.[0]?.value ?? "" };
      return field.options?.some((option) => option.value === raw) ? { value: raw } : { error: "Elegí una opción." };
    case "list":
      return { value: lines(form, field.name) };
    case "pairs":
      return {
        value: lines(form, field.name).map((line) => {
          const [label, ...rest] = line.split("|");
          return { label: label.trim(), value: rest.join("|").trim() };
        }),
      };
    case "datetime": {
      if (!raw) return { value: null };
      const date = new Date(`${raw}${ADMIN_UTC_OFFSET}`);
      return Number.isNaN(date.getTime()) ? { error: "Fecha inválida." } : { value: date };
    }
    case "relation":
      if (!raw) return { value: null };
      return z.uuid().safeParse(raw).success ? { value: raw } : { error: "Opción inválida." };
    case "slug": {
      const value = raw || slugify(text(form, field.from ?? ""));
      return slugSchema.safeParse(value).success ? { value } : { error: "Solo minúsculas, números y guiones." };
    }
    default:
      if (field.required && !raw) return { error: "Este campo es obligatorio." };
      return { value: raw.slice(0, 60000) };
  }
}

/** Rutas públicas que cambian con un registro: su página y el listado que la contiene (para avisar a IndexNow). */
function publicPaths(resource: { href?: (row: Record<string, unknown>) => string | null }, row: Record<string, unknown> | undefined): string[] {
  const path = row && resource.href?.(row);
  if (!path) return [];
  const parent = path.split("/").slice(0, -1).join("/");
  return parent ? [path, parent] : [path];
}

export async function saveResource(key: string, id: string | null, _prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const resource = getResource(key);
  if (!resource || (id !== null && !isRowId(resource, id))) return { error: "Recurso desconocido." };
  const pk = resource.pk ?? "id";

  const values: Record<string, unknown> = {};
  const errors: Record<string, string> = {};
  for (const field of resource.fields) {
    if (field.type === "multi" || field.type === "children") continue;
    const col = column(resource.table, field.name);
    const { value, error } = parseField(field, form, field.type === "number" && col.columnType === "PgNumeric", col.notNull);
    if (error) errors[field.name] = error;
    else if (value !== undefined) values[field.name] = value;
  }
  if (key === "seo" && typeof values.path === "string" && !isInternalPath(values.path)) errors.path = "La ruta empieza con una sola «/» y no lleva espacios ni parámetros.";
  if (typeof values.website === "string" && values.website && !isWebUrl(values.website)) errors.website = "Tiene que ser una dirección web completa, con https://.";
  if (Object.keys(errors).length) return { error: "Revisá los campos marcados.", errors };
  if (values.status === "published" && !values.publishedAt) values.publishedAt = new Date();

  let rowId = id;
  try {
    if (id) await db.update(resource.table).set(values as never).where(eq(column(resource.table, pk), id));
    else {
      const [created] = await db.insert(resource.table).values(values as never).returning({ id: column(resource.table, pk) });
      rowId = String(created.id);
    }
    for (const field of resource.fields) {
      if (!field.through || !rowId) continue;
      const { table, own, other } = field.through;
      const items = field.type === "children" ? lines(form, field.name) : form.getAll(field.name).map(String).filter((v) => z.uuid().safeParse(v).success);
      await db.delete(table).where(eq(column(table, own), rowId));
      if (items.length) {
        await db.insert(table).values(items.map((item, i) => ({ [own]: rowId, [other]: item, ...("sort" in table ? { sort: (i + 1) * 10 } : {}) })) as never);
      }
    }
  } catch (error) {
    if (isUnique(error)) return { error: "Ya existe otro registro con ese slug o ruta.", errors: { [pk === "path" ? "path" : "slug"]: "Ya está en uso." } };
    console.error(`[admin] no se pudo guardar ${key}`);
    return { error: "No se pudo guardar. Probá de nuevo." };
  }
  revalidateContent(...resource.tags);
  notifyIndexNow(...publicPaths(resource, values));
  await logActivity(user, id ? "update" : "create", key, rowId, String(values[resource.titleField] ?? ""));
  // «Guardar y seguir» vuelve al mismo registro; si no, al listado.
  redirect(form.get("stay") ? `/admin/${key}/${encodeURIComponent(rowId ?? "")}?guardado=1` : `/admin/${key}?guardado=1`);
}

export async function deleteResource(key: string, id: string): Promise<void> {
  const user = await requireUser();
  const resource = getResource(key);
  if (!resource || !isRowId(resource, id)) return;
  const pk = column(resource.table, resource.pk ?? "id");
  const [row] = await db.delete(resource.table).where(eq(pk, id)).returning();
  revalidateContent(...resource.tags);
  notifyIndexNow(...publicPaths(resource, row as Record<string, unknown> | undefined));
  await logActivity(user, "delete", key, id, String((row as Record<string, unknown> | undefined)?.[resource.titleField] ?? ""));
  redirect(`/admin/${key}?eliminado=1`);
}

/** Cambio rápido de estado desde el listado (publicar / despublicar / archivar). */
export async function setResourceStatus(key: string, id: string, form: FormData): Promise<void> {
  const user = await requireUser();
  const resource = getResource(key);
  const status = z.enum(["draft", "published", "archived"]).safeParse(text(form, "status"));
  if (!resource || !isRowId(resource, id) || !status.success || !resource.fields.some((field) => field.name === "status")) return;
  const values: Record<string, unknown> = { status: status.data };
  if (status.data === "published" && resource.fields.some((field) => field.name === "publishedAt")) {
    const [row] = await db.select().from(resource.table).where(eq(column(resource.table, resource.pk ?? "id"), id)).limit(1);
    if (!(row as Record<string, unknown> | undefined)?.publishedAt) values.publishedAt = new Date();
  }
  const [changed] = await db.update(resource.table).set(values as never).where(eq(column(resource.table, resource.pk ?? "id"), id)).returning();
  revalidateContent(...resource.tags);
  notifyIndexNow(...publicPaths(resource, changed as Record<string, unknown> | undefined));
  await logActivity(user, "update", key, id, `estado → ${status.data}`);
  redirect(`/admin/${key}?guardado=1`);
}

/* ───────────────────────────── Home y configuración ───────────────────────────── */

export async function saveHomeSection(key: string, _prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!isHomeKey(key)) return { error: "Sección desconocida." };
  const content = parseJsonForm(HOME_SECTIONS[key].defaults as JsonShape, form, "content");
  const sort = Number(text(form, "sort"));
  const row = { enabled: form.get("enabled") === "on", sort: Number.isFinite(sort) ? Math.round(sort) : 0, content };
  await db.insert(homeSections).values({ key, ...row }).onConflictDoUpdate({ target: homeSections.key, set: row });
  revalidateContent(TAGS.home);
  await logActivity(user, "update", "home", key, HOME_SECTIONS[key].label);
  redirect("/admin/home?guardado=1");
}

/** Muestra u oculta una sección del Home desde el listado. */
export async function toggleHomeSection(key: string, enabled: boolean): Promise<void> {
  const user = await requireUser();
  if (!isHomeKey(key) || typeof enabled !== "boolean") return;
  await db.update(homeSections).set({ enabled }).where(eq(homeSections.key, key));
  revalidateContent(TAGS.home);
  await logActivity(user, "update", "home", key, `${HOME_SECTIONS[key].label}: ${enabled ? "visible" : "oculta"}`);
  redirect("/admin/home?guardado=1");
}

/** Sube o baja una sección del Home un lugar, intercambiando su orden con la vecina. */
export async function moveHomeSection(key: string, direction: "up" | "down"): Promise<void> {
  const user = await requireUser();
  if (!isHomeKey(key) || (direction !== "up" && direction !== "down")) return;
  const rows = await db.select({ key: homeSections.key, sort: homeSections.sort }).from(homeSections).orderBy(asc(homeSections.sort), asc(homeSections.key));
  const index = rows.findIndex((row) => row.key === key);
  const other = rows[index + (direction === "up" ? -1 : 1)];
  if (index < 0 || !other) return;
  const current = rows[index];
  // si dos secciones comparten número, se separan para que el intercambio sea visible
  const [a, b] = current.sort === other.sort ? (direction === "up" ? [other.sort, other.sort + 1] : [other.sort + 1, other.sort]) : [other.sort, current.sort];
  await db.update(homeSections).set({ sort: a }).where(eq(homeSections.key, current.key));
  await db.update(homeSections).set({ sort: b }).where(eq(homeSections.key, other.key));
  revalidateContent(TAGS.home);
  await logActivity(user, "update", "home", key, `${HOME_SECTIONS[key].label}: orden`);
  redirect("/admin/home");
}

export async function saveSettingsGroup(group: SettingsGroup, _prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  if (typeof group !== "string" || !Object.hasOwn(SETTINGS_SHAPE, group)) return { error: "Grupo desconocido." };
  let value = parseJsonForm(SETTINGS_SHAPE[group], form, group);
  // WhatsApp y contacto comparten el grupo `contact`: cada pantalla edita solo sus campos.
  const only = form.getAll("only").map(String);
  if (only.length && typeof value === "object" && value !== null) {
    const [current] = await db.select().from(siteSettings).where(eq(siteSettings.key, group)).limit(1);
    const previous = (current?.value ?? {}) as Record<string, unknown>;
    value = { ...previous, ...Object.fromEntries(Object.entries(value).filter(([k]) => only.includes(k))) };
  }
  const parsed = settingsSchema.shape[group].safeParse(value);
  if (!parsed.success) return { error: `Hay un valor inválido. ${parsed.error.issues.find((issue) => issue.code === "custom")?.message ?? "Revisá los campos."}` };
  await db.insert(siteSettings).values({ key: group, value: parsed.data }).onConflictDoUpdate({ target: siteSettings.key, set: { value: parsed.data } });
  revalidateContent(TAGS.settings);
  await logActivity(user, "settings", "configuración", group);
  return { ok: true };
}

/* ───────────────────────────── media ───────────────────────────── */

/** Sube una o varias imágenes (campo `file`, múltiple). Cada una se valida y se re-codifica a WebP sin EXIF. */
export async function uploadMedia(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const files = form.getAll("file").filter((entry): entry is File => entry instanceof File && entry.size > 0);
  if (files.length === 0) return { error: "Elegí al menos una imagen." };
  if (files.length > MAX_UPLOAD_FILES) return { error: `Hasta ${MAX_UPLOAD_FILES} imágenes por envío. Subí el resto en otra tanda.` };
  const failed: string[] = [];
  for (const file of files) {
    try {
      const image = await processImageUpload(file);
      const key = newMediaKey();
      await storage.put(image.buffer, { key, contentType: image.mime });
      const filename = file.name.replace(/[^\w.\- ]+/g, "").slice(0, 120) || "imagen";
      await db.insert(media).values({ key, filename, mime: image.mime, size: image.buffer.length, width: image.width, height: image.height, alt: text(form, "alt").slice(0, 300) });
      await logActivity(user, "upload", "media", key, filename);
    } catch (error) {
      failed.push(`${file.name}: ${error instanceof UploadError ? error.message : "no se pudo subir"}`);
      if (!(error instanceof UploadError)) console.error("[admin] falló una subida de imagen");
    }
  }
  revalidateContent(TAGS.media);
  if (failed.length) return { error: failed.join(" · "), ok: failed.length < files.length };
  return { ok: true };
}

export async function updateMediaAlt(id: string, form: FormData): Promise<void> {
  await requireUser();
  if (!isUuid(id)) return;
  await db.update(media).set({ alt: text(form, "alt").slice(0, 300) }).where(eq(media.id, id));
  revalidateContent(TAGS.media);
  redirect("/admin/media?guardado=1");
}

export async function deleteMedia(id: string): Promise<void> {
  const user = await requireUser();
  if (!isUuid(id)) return;
  const [row] = await db.delete(media).where(eq(media.id, id)).returning({ key: media.key, filename: media.filename });
  if (row) await storage.remove(row.key).catch(() => console.error("[admin] no se pudo borrar un archivo del storage"));
  revalidateContent(TAGS.media, TAGS.projects, TAGS.clients, TAGS.posts);
  if (row) await logActivity(user, "delete", "media", id, row.filename);
  redirect("/admin/media?eliminado=1");
}

/* ───────────────────────────── leads ───────────────────────────── */

const LEAD_STATUSES = ["new", "contacted", "won", "lost", "spam"] as const;
// La bitácora de leads anota solo el id y qué se hizo: nunca el nombre ni el email de la persona,
// para que el borrado definitivo de un lead no deje rastros suyos en activity_log.

export async function updateLead(id: string, form: FormData): Promise<void> {
  const user = await requireUser();
  if (!isUuid(id)) redirect("/admin/leads");
  const status = z.enum(LEAD_STATUSES).safeParse(text(form, "status"));
  if (status.success) {
    const [row] = await db.update(leads).set({ status: status.data, notes: text(form, "notes").slice(0, 5000) }).where(eq(leads.id, id)).returning({ id: leads.id });
    if (row) await logActivity(user, "update", "leads", id, `estado y notas → ${status.data}`);
  }
  redirect(form.get("stay") ? `/admin/leads/${id}?guardado=1` : "/admin/leads?guardado=1");
}

/** Responde una consulta por correo desde el panel (plantilla con el burro). Si era nueva pasa a «contactado» y queda anotado en las notas. */
export async function replyLead(id: string, _prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const subject = text(form, "subject").trim();
  const message = text(form, "message").trim();
  const errors: Record<string, string> = {};
  if (subject.length < 3 || subject.length > 150) errors.subject = "Entre 3 y 150 caracteres.";
  if (message.length < 10 || message.length > 5000) errors.message = "Entre 10 y 5000 caracteres.";
  if (Object.keys(errors).length) return { error: "Revisá los campos marcados.", errors };
  if (!isUuid(id)) return { error: "La consulta ya no existe." };
  const [lead] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  if (!lead) return { error: "La consulta ya no existe." };

  const { html, text: plain } = renderReplyEmail({ bodyMarkdown: message, signature: user.name || "El equipo" });
  const sent = await sendEmail({ to: lead.email, subject, html, text: plain });
  if (!sent.ok) return { error: `No se pudo enviar: ${sent.error}` };

  const stamp = new Date().toLocaleString("es-BO", { timeZone: "America/La_Paz", dateStyle: "short", timeStyle: "short" });
  const note = `${stamp} · Respondido por correo (${user.name || user.email}): «${subject}»${emailConfigured ? "" : " [sin proveedor: solo consola]"}`;
  await db
    .update(leads)
    .set({ status: lead.status === "new" ? "contacted" : lead.status, notes: `${lead.notes ? `${lead.notes}\n` : ""}${note}`.slice(0, 5000) })
    .where(eq(leads.id, id));
  await logActivity(user, "send", "leads", id, "respuesta por correo");
  return { ok: true };
}

/** Cambio de estado desde el listado. */
export async function setLeadStatus(id: string, form: FormData): Promise<void> {
  const user = await requireUser();
  const status = z.enum(LEAD_STATUSES).safeParse(text(form, "status"));
  if (status.success && isUuid(id)) {
    const [row] = await db.update(leads).set({ status: status.data }).where(eq(leads.id, id)).returning({ id: leads.id });
    if (row) await logActivity(user, "update", "leads", id, `estado → ${status.data}`);
  }
  const back = text(form, "back");
  redirect(back.startsWith("/admin/leads") ? back : "/admin/leads");
}

export async function deleteLead(id: string): Promise<void> {
  const user = await requireUser();
  if (!isUuid(id)) redirect("/admin/leads");
  await db.delete(leads).where(eq(leads.id, id)); // borrado definitivo: derecho de supresión
  await logActivity(user, "delete", "leads", id);
  redirect("/admin/leads?eliminado=1");
}

/* ───────────────────────────── usuarios y cuenta ───────────────────────────── */

const passwordSchema = z.string().min(12, "Mínimo 12 caracteres.").max(200);

export async function createUser(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = z
    .object({ name: z.string().trim().min(1, "Poné un nombre.").max(80), email: z.email("Email inválido.").max(254), password: passwordSchema })
    .safeParse({ name: text(form, "name"), email: text(form, "email").toLowerCase(), password: String(form.get("password") ?? "") });
  if (!parsed.success) return { error: "Revisá los campos marcados.", errors: Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message])) };
  if (String(form.get("password")) !== String(form.get("confirm"))) return { error: "Las contraseñas no coinciden.", errors: { confirm: "No coincide." } };
  try {
    const [created] = await db.insert(users).values({ name: parsed.data.name, email: parsed.data.email, passwordHash: await hashPassword(parsed.data.password) }).returning({ id: users.id });
    await logActivity(user, "create", "usuarios", created.id, parsed.data.email);
  } catch (error) {
    if (isUnique(error)) return { error: "Ya existe un usuario con ese email.", errors: { email: "Ya está en uso." } };
    console.error("[admin] no se pudo crear el usuario");
    return { error: "No se pudo crear el usuario." };
  }
  redirect("/admin/usuarios?guardado=1");
}

export async function deleteUser(id: string): Promise<void> {
  const user = await requireUser();
  if (!isUuid(id) || id === user.id) return; // nadie se borra a sí mismo
  const others = await db.select({ id: users.id }).from(users).where(ne(users.id, id)).limit(1);
  if (!others.length) return; // siempre queda al menos un administrador
  const [row] = await db.delete(users).where(eq(users.id, id)).returning({ email: users.email });
  if (row) await logActivity(user, "delete", "usuarios", id, row.email);
  redirect("/admin/usuarios?eliminado=1");
}

/** Restablece la contraseña de OTRO administrador y cierra sus sesiones. La propia se cambia en Mi cuenta, con la actual. */
export async function resetUserPassword(id: string, _prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!isUuid(id)) return { error: "El usuario ya no existe." };
  // Sin la contraseña actual, una sesión ajena abierta (equipo desatendido, cookie robada) no puede quedarse con la cuenta.
  if (id === user.id) return { error: "Tu propia contraseña se cambia desde «Mi cuenta», con la contraseña actual." };
  const parsed = passwordSchema.safeParse(String(form.get("password") ?? ""));
  if (!parsed.success) return { error: "Revisá los campos marcados.", errors: { password: parsed.error.issues[0]?.message ?? "Inválida." } };
  if (String(form.get("password")) !== String(form.get("confirm"))) return { error: "Las contraseñas no coinciden.", errors: { confirm: "No coincide." } };
  const [row] = await db.update(users).set({ passwordHash: await hashPassword(parsed.data) }).where(eq(users.id, id)).returning({ id: users.id });
  if (!row) return { error: "El usuario ya no existe." };
  await db.delete(sessions).where(eq(sessions.userId, id));
  await logActivity(user, "update", "usuarios", id, "contraseña");
  return { ok: true };
}

/** La propia cuenta: nombre y, con la contraseña actual, una nueva. */
export async function updateAccount(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const name = text(form, "name").slice(0, 80);
  if (!name) return { error: "Poné un nombre.", errors: { name: "Obligatorio." } };
  const wantsPassword = String(form.get("password") ?? "") !== "";
  if (wantsPassword) {
    const [row] = await db.select({ hash: users.passwordHash }).from(users).where(eq(users.id, user.id)).limit(1);
    if (!row || !(await verifyPassword(String(form.get("current") ?? ""), row.hash))) return { error: "La contraseña actual no es correcta.", errors: { current: "Incorrecta." } };
    const parsed = passwordSchema.safeParse(String(form.get("password")));
    if (!parsed.success) return { error: "Revisá los campos marcados.", errors: { password: parsed.error.issues[0]?.message ?? "Inválida." } };
    if (String(form.get("password")) !== String(form.get("confirm"))) return { error: "Las contraseñas nuevas no coinciden.", errors: { confirm: "No coincide." } };
    await db.update(users).set({ name, passwordHash: await hashPassword(parsed.data) }).where(eq(users.id, user.id));
    const session = await getSession();
    if (session) await db.delete(sessions).where(and(eq(sessions.userId, user.id), ne(sessions.id, session.id))); // las otras sesiones se cierran
    await logActivity(user, "update", "cuenta", user.id, "contraseña");
  } else {
    await db.update(users).set({ name }).where(eq(users.id, user.id));
    await logActivity(user, "update", "cuenta", user.id, "nombre");
  }
  // Sin esto, React reinicia el formulario con el nombre viejo (el que trajo la página) y el menú no se entera.
  revalidatePath("/admin", "layout");
  return { ok: true };
}
