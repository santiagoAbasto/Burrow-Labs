# Burrow Labs — Arquitectura

Complementa a [PLAN.md](PLAN.md) (qué se construye) y [SECURITY.md](SECURITY.md) (controles). Acá está el cómo.

## 1. Carpetas

```
drizzle.config.ts        config de drizzle-kit (lee .env.local)
next.config.ts           distDir por env, headers de seguridad, imágenes
vitest.config.ts         alias @/, base de tests, exclusión de e2e/
src/
  app/
    api/events/route.ts      POST de eventos first-party anónimos
    media/[...key]/route.ts  sirve los archivos del storage local
  db/
    schema.ts            tablas, enums e índices (fuente de verdad)
    index.ts             cliente postgres.js + instancia Drizzle (`db`, `client`)
    migrations/          SQL generado por `pnpm db:generate` (se versiona)
    seed.ts              admin inicial + seedContent()
    seed-content.ts      contenido inicial (idempotente)
  lib/
    env.ts               variables de entorno validadas (servidor)
    auth.ts              contraseñas, sesiones, requireUser (servidor)
    rate-limit.ts        ventana fija en BD + clave de cliente (servidor)
    storage.ts           drivers local/S3 + processImageUpload (servidor)
    content.ts           lecturas públicas cacheadas con tags (servidor)
    seo.ts               buildMetadata + JSON-LD (servidor)
    validation.ts        esquemas Zod de leads + slug (cliente y servidor)
    whatsapp.ts          URL de wa.me + mensaje contextual (cliente y servidor)
    analytics-events.ts  lista cerrada de eventos + esquema (cliente y servidor)
    analytics.ts         track() (cliente)
    *.test.ts            tests unitarios junto a cada lib
storage/uploads/         media del driver local (fuera de git)
```

Los módulos de servidor empiezan con `import "server-only"`: importarlos desde un componente de cliente rompe el build en lugar de filtrar código o secretos al navegador.

## 2. Flujo de datos

**Lectura (sitio público).** Server component → función de `src/lib/content.ts` → consulta Drizzle envuelta en caché → HTML. Los componentes nunca consultan la base directamente y nunca reciben filas crudas: `content.ts` devuelve tipos públicos (`Service`, `ProjectSummary`, `Plan`…) con la regla de visibilidad ya aplicada.

**Regla de visibilidad** (una sola implementación, `isPublic` en `content.ts`):

- `status = 'published'` y (`published_at` vacío o `<= now()`).
- `clients` y `testimonials`: además `authorized = true`.
- El nombre de un cliente dentro de un proyecto solo sale si `projects.client_public` y el cliente está autorizado y publicado. Si no, `clientName` es `null` (caso anonimizado).
- Un plan con `price_mode` `quote` u `hidden` llega con `priceAmount: null`: el precio oculto no viaja al navegador.
- Con `SHOW_DEMO_CONTENT=true` fuera de producción, los proyectos `is_demo` en borrador también se devuelven, con `isDemo: true` para pintar la cinta «DEMO». En producción la variable se ignora (`env.ts`).

**Escritura (admin).** Formulario → server action → `requireUser()` → validación Zod → Drizzle → `revalidateContent(TAGS.x)`.

**Leads.** Formulario → server action → `rateLimit(clientKey(headers, "contact"))` → `contactLeadSchema` / `diagnosticLeadSchema` → insert en `leads` (solo con `consent = true`). Los leads no se cachean ni se escriben en logs.

**Media.** `processImageUpload(file)` → `storage.put(buffer, { key: newMediaKey(), contentType })` → fila en `media`. Lectura: `storage.publicUrl(key)` → `/media/<key>` (local) o `S3_PUBLIC_URL/<key>` (S3/R2/MinIO). `content.ts` ya entrega las imágenes como `MediaRef { url, width, height, alt }`.

**Eventos.** `track(name, meta)` en el cliente → `POST /api/events` → validación contra la lista cerrada → `analytics_events`. Si GA4 está cargado, el mismo evento va también a `window.gtag`.

## 3. Caché y tags

Se usa `unstable_cache` de `next/cache` con tags (modelo «sin Cache Components» de la documentación de Next 16, `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`). La directiva `"use cache"` exige activar `cacheComponents` para todo el proyecto, lo que cambia el modelo de render de todas las páginas; se puede migrar más adelante sin tocar a quienes llaman a `content.ts`.

Consecuencias prácticas:

- El resultado cacheado se serializa a JSON: los tipos públicos llevan las fechas como **string ISO** (`publishedAt`, `updatedAt`).
- Cada lectura se revalida sola cada 300 s. Es lo que hace aparecer una publicación programada sin intervención (retraso máximo: 5 minutos).
- Tras una mutación, el admin llama a `revalidateContent(...tags)`, que expira el tag al instante (`revalidateTag(tag, { expire: 0 })`).

| Tag (`TAGS.*`) | Tablas | Lecturas que lo usan |
|---|---|---|
| `settings` | `site_settings` | `getSettings` |
| `home` | `home_sections` | `getHomeSections` |
| `services` | `services` | `getServices`, `getService`, `getProject` |
| `projects` | `projects`, `project_categories`, `project_media`, `project_services` | `getProjects`, `getFeaturedProjects`, `getProject`, `getProjectCategories`, `getTestimonials` |
| `clients` | `clients` | `getClients`, `getProjects`, `getProject`, `getTestimonials` |
| `testimonials` | `testimonials` | `getTestimonials` |
| `plans` | `plans`, `plan_features` | `getPlans` |
| `faqs` | `faqs` | `getFaqs` |
| `posts` | `posts`, `post_categories` | `getPosts`, `getPost`, `getPostCategories` |
| `seo` | `seo_metadata` | `getSeo`, `buildMetadata` |
| `media` | `media` | todo lo que devuelve imágenes |

Regla para el admin: al guardar una tabla, invalidar su tag. Al editar `media` (por ejemplo el `alt`), invalidar `media`.

`getSession()` usa otra caché distinta: `cache` de React, que solo deduplica dentro de una misma request.

## 4. Base de datos y migraciones

- Tablas en snake_case, ids `uuid` (`gen_random_uuid()`), fechas `timestamptz`. En `schema.ts` las claves van en camelCase y Drizzle las traduce con `casing: "snake_case"`, que está en `src/db/index.ts` y en `drizzle.config.ts` y debe coincidir en ambos.
- Cambiar el esquema: editar `src/db/schema.ts` → `pnpm db:generate` → revisar el SQL generado → aplicar.

| Destino | Comando |
|---|---|
| Desarrollo (`DATABASE_URL`) | `pnpm db:migrate` |
| Tests (`TEST_DATABASE_URL`) | `DB_TARGET=test pnpm db:migrate` |
| Tests de un agente con base propia | `createdb burrow_labs_test_a1` y luego `TEST_DB_SUFFIX=_a1 DB_TARGET=test pnpm db:migrate` |
| Producción | `DATABASE_URL=… pnpm db:migrate` (las variables del entorno tienen prioridad sobre `.env.local`) |

- `pnpm db:seed` es idempotente: crea el admin de `ADMIN_EMAIL`/`ADMIN_PASSWORD` solo si no existe (mínimo 12 caracteres; nunca imprime la clave) y después corre `seedContent(db)`.
- **Contenido ya sembrado.** `seedContent` nunca pisa filas: lo que se corrige en `seed-content.ts` o en `src/db/seed/` solo llega a bases nuevas. Una fila **nueva** (un servicio o un artículo con slug que no existe) sí la inserta el próximo deploy. Para cambiar un texto que ya está en producción: `pnpm exec drizzle-kit generate --custom --name <nombre>` y un `UPDATE` de solo datos **condicionado al texto anterior** (si alguien lo editó en el panel, no se toca), separando sentencias con `--> statement-breakpoint`. Ejemplos: `0008`, `0010`, `0011`. El contenedor lo aplica al arrancar. Escribir en la base de producción por SSH no es el camino. Después, avisar a IndexNow a mano: la migración no pasa por el panel.
- `pnpm test` corre **siempre** contra la base de tests: `vitest.config.ts` reemplaza `DATABASE_URL` por `TEST_DATABASE_URL` (+ `TEST_DB_SUFFIX`). Los tests crean filas con prefijos aleatorios y las borran al terminar, así que pueden correr en paralelo sobre la misma base.

## 5. Cómo agregar una entidad

1. **Esquema.** Tabla nueva en `src/db/schema.ts`. Si es contenido editorial, incluir `...publishing` (estado + `published_at`), `...timestamps` y, si tiene página propia, `slug` único y `...seo`.
2. **Migración.** `pnpm db:generate`, revisar el SQL, `pnpm db:migrate` y `DB_TARGET=test pnpm db:migrate`.
3. **Lectura pública.** En `src/lib/content.ts`: un tag en `TAGS` (o reutilizar uno), el tipo público y una función `cached(...)` que aplique `isPublic(tabla)`. Sin fechas `Date` en el tipo de retorno.
4. **Admin.** Una entrada en la configuración de recursos del CMS; la acción de guardado llama a `revalidateContent(TAGS.nuevo)`.
5. **Seed** (si corresponde) en `src/db/seed-content.ts`, idempotente (`onConflictDoNothing` / `onConflictDoUpdate`).
6. **Test** de la regla de visibilidad en `src/lib/content.test.ts`.

## 6. Variables de entorno

Se leen y validan en `src/lib/env.ts` (Zod). Una variable vacía (`CLAVE=`) cuenta como no definida. Si la validación falla, el proceso no arranca y el error nombra la variable, nunca su valor.

| Variable | Obligatoria | Uso |
|---|---|---|
| `DATABASE_URL` | Sí | Conexión a PostgreSQL |
| `TEST_DATABASE_URL` | Para `pnpm test` | Base de tests |
| `TEST_DB_SUFFIX` | No | Sufijo de base de tests por agente |
| `DB_TARGET` | No | `test` hace que drizzle-kit apunte a la base de tests |
| `NEXT_PUBLIC_SITE_URL` | En producción | Canonical, Open Graph, sitemap, JSON-LD. Default `http://localhost:3000` |
| `AUTH_SECRET` | En producción (≥ 32 caracteres) | Clave del HMAC que anonimiza la IP en el rate limit |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Solo para el seed | Usuario inicial del admin |
| `STORAGE_DRIVER` | No (`local`) | `local` o `s3` |
| `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL` | Con `STORAGE_DRIVER=s3` | Storage S3/R2/MinIO |
| `NEXT_PUBLIC_GA_ID` | No | Si está vacía no se carga GA4 ni se abre la CSP hacia Google |
| `NEXT_PUBLIC_GSC_VERIFICATION` | No | Verificación de Search Console |
| `SHOW_DEMO_CONTENT` | No (`false`) | Muestra borradores demo; se ignora en producción |
| `NEXT_DIST_DIR` | No (`.next`) | Directorio de build por proceso (ver AGENTS.md) |

`next.config.ts` lee `NEXT_PUBLIC_GA_ID` y `S3_PUBLIC_URL` al construir: cambiarlas requiere un build nuevo.

## 7. Mapa de la aplicación

- **Sitio público** — `src/app/(site)/`. El layout monta header, footer, profundímetro, WhatsApp, consentimiento y analytics. El Home se arma desde `home_sections` con el registro `src/components/home/registry.tsx` (clave → componente + estrato); el copy editable y su forma están en `src/components/home/sections.ts`.
- **Admin** — `src/app/admin/`. CRUD genérico dirigido por `src/lib/admin/resources.ts`; acciones en `src/lib/admin/actions.ts`; formularios JSON (Home y settings) en `src/lib/admin/json-form.ts`. Ver [CMS.md](CMS.md).
- **Leads** — `src/lib/lead-actions.ts` (contacto y diagnóstico): Zod, rate limit, honeypot, trampa de tiempo, consentimiento.
- **Herramientas** — `src/lib/calculator.ts` y `src/lib/diagnostic.ts` son lógica pura con tests; sus componentes están en `src/components/tools/`.
- **Marca, 3D y juego** — ver [MOTION-3D.md](MOTION-3D.md) y [BRAND-ASSETS.md](BRAND-ASSETS.md).
- **Despliegue** — imagen Docker (`Dockerfile`) detrás de un proxy con HTTPS. El kit de producción y los procedimientos internos se mantienen fuera del repositorio público.
