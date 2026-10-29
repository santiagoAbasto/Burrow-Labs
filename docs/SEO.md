# SEO, GEO y analytics

Dominio canónico: `https://burrowlabs.com.bo` (sin `www`, sin barra final). Sale de `NEXT_PUBLIC_SITE_URL`: sin esa variable en producción, canonical, sitemap, Open Graph y JSON-LD apuntan a `localhost`.

## Implementado

### Indexabilidad y URL

- **Una variante por URL.** Next redirige con un solo `308` la barra final y las barras dobles (`/servicios/` → `/servicios`). Las mayúsculas (`/Servicios`) y las rutas o slugs inexistentes responden `404` real, con `noindex`.
- **Canonical absoluto** en cada página, sin parámetros: `/proyectos?categoria=…`, `/lab?categoria=…`, `/contacto?plan=…|servicio=…|proyecto=…` y `/calculadora?p=…` declaran como canónica la URL limpia.
- **No indexables:** `/admin` y `/api` (`X-Robots-Tag: noindex, nofollow` desde `next.config.ts`), `/dev/ui` (404 en producción y `noindex`), `/newsletter/baja/[token]` (`noindex, nofollow`), 404, proyectos demo y textos legales con marcadores pendientes.
- **Sin `hreflang`:** el sitio es monolingüe (`es-BO`). Se agrega cuando exista otra versión de idioma.
- **Slugs validados.** Las rutas dinámicas (`/servicios/[slug]`, `/proyectos/[slug]`, `/lab/[slug]`) y la precarga de `/contacto` pasan el slug por `findBySlug` (`src/lib/seo.ts`): forma de slug (`slugSchema`) y existencia en la lista ya cacheada, antes de cualquier getter por slug. Un slug inventado da 404 (o se ignora en contacto) sin crear entradas de caché.

### Metadata por página (`buildMetadata` en `src/lib/seo.ts`)

Título, descripción, canonical, `robots` (`index, follow, max-image-preview:large, max-snippet:-1`), Open Graph (`type`, `url`, `site_name`, `locale es_BO`, imagen con ancho, alto y `alt`), Twitter `summary_large_image` y, si existe `NEXT_PUBLIC_GSC_VERIFICATION`, la verificación de Search Console.

- **Prioridad:** lo cargado en **Admin → SEO** para la ruta pisa el SEO de la entidad (servicio, proyecto, artículo), y este pisa el respaldo escrito en el código.
- **Contrato de títulos:** si el título ya contiene el nombre del sitio («Burrow Labs»), se usa tal cual; si no, se le aplica la plantilla `%s · Burrow Labs`. Así el Home puede ser «Burrow Labs | Software a medida, automatización e IA» y `/nosotros` «Sobre Burrow Labs» sin repetir la marca. Probado en `src/lib/seo.test.ts`.
- **Respaldos en código:** cada página trae un título específico por si la ruta no tiene fila en la base.

### robots.txt (`src/app/robots.ts`)

```
User-Agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /dev/
Disallow: /newsletter/baja/

Sitemap: https://burrowlabs.com.bo/sitemap.xml
```

Un solo grupo: Googlebot, Bingbot y los rastreadores de búsqueda con IA (OAI-SearchBot, PerplexityBot, Claude-SearchBot) entran a todo lo público. `robots.txt` ordena el rastreo; **no es seguridad ni saca páginas del índice** (Google: «it is not a mechanism for keeping a web page out of Google»). El admin se protege con sesión.

### Sitemap (`src/app/sitemap.ts`)

Solo URL públicas, canónicas, `200` e indexables: páginas fijas, servicios, proyectos publicados (nunca demo) y artículos. Quedan afuera admin, API, `/dev`, bajas, URL con parámetros, rutas marcadas `noindex` en Admin → SEO y textos legales en borrador.

- **Sin `changefreq` ni `priority`:** Google los ignora.
- **`lastmod` solo con fecha real:** `updatedAt` de servicios, proyectos y artículos. Las páginas fijas van sin fecha.
- Se regenera solo: caché de 300 s e invalidación al guardar en el admin.

### Datos estructurados (JSON-LD, en el HTML del servidor)

| Página | Tipos |
| --- | --- |
| Todas | `Organization` (`/#organization`), `WebSite` (`/#website`) |
| Home | + `ProfessionalService` (misma entidad, mismo `@id`) |
| Interiores | + `BreadcrumbList` |
| `/servicios/[slug]` | + `Service` (`…#service`, `provider` → organización) |
| `/proyectos/[slug]` | + `Article` (caso de estudio: `author` y `publisher` → organización, `about` → servicios relacionados) |
| `/lab/[slug]` | + `Article` (`author` organización si firma el estudio, persona si no) |
| `/desarrollo-de-software-cochabamba` | + `ItemList` de `Service` (uno por servicio, `provider` → organización, `areaServed` = ciudad dentro del país) |

- **Una sola entidad** `Organization`: nombre, URL, logo absoluto (`/icon.png`, 512×512), descripción, `PostalAddress` (calle, ciudad, región y país, solo lo cargado en Admin → Configuración → SEO) y `sameAs` únicamente con los perfiles cargados en Admin → Configuración → Redes (incluido el de TechBehemoths desde el 28/10/2026). Email solo si está cargado. La calle, la ciudad y el teléfono también se ven en el pie de todas las páginas: el marcado no publica nada que no esté a la vista.
- **Nunca:** `FAQPage`, `Review`, `AggregateRating`, precios, `SoftwareApplication`, direcciones o teléfonos inventados.
- Las fechas de `Article` son las de la base (`publishedAt`, `updatedAt`).

### `/llms.txt`

Resumen en Markdown generado desde el CMS: qué es Burrow Labs, servicios, proyectos públicos, páginas principales, artículos y contacto público (formulario, email si está cargado, redes cargadas). No lista admin, API, correos internos ni infraestructura.

### Manifest, iconos y Open Graph

- **`/manifest.webmanifest`:** nombre y descripción del CMS, `lang es-BO`, colores `paper` (`#ededed`, igual que el `themeColor` del layout) e iconos de 192, 512 y 512 «maskable».
- **Iconos:** `favicon.ico` (16/32/48), `icon.png` (512), `icon1.png` (192, reducción de `icon.png`), `apple-icon.png` (180) y `/icon-maskable.png` (el badge oficial al 72 % sobre papel; lo compone `src/app/icon-maskable.png/route.ts` al compilar). Ninguno redibuja la marca: todos salen del badge oficial.
- **Imagen para compartir:** `public/brand/og-logo.png`, 1200×630, opaca, sobre papel. Se usa cuando la página no tiene portada u imagen propia.

### Enlazado interno

- Cada servicio lista sus casos relacionados; cada caso enlaza a sus servicios (ficha «Servicios»). Ambos salen de la relación proyecto↔servicio de la base.
- `/faq` y `/lab` suman una salida a `/servicios` en la banda final, además de `/contacto`.
- **Bloque «Del Lab»** (`src/components/site/lab-reading.tsx`): hasta 4 artículos recientes en `/servicios`, en cada `/servicios/[slug]` y en `/desarrollo-de-software-cochabamba`; cada artículo enlaza a hasta 4 de los otros («Seguir leyendo»). Existe porque Search Console marcaba los artículos como «rastreados» o «descubiertos, sin indexar» mientras solo los enlazaba `/lab` (21/10/2026).

## Decisiones

- **Sin schema `FAQPage`.** Google ya no muestra ese resultado enriquecido; las respuestas van como texto visible, que es lo que leen buscadores y asistentes.
- **`llms.txt` no es un factor de ranking.** Google lo dice expresamente: no hacen falta «AI text files» ni marcado especial para aparecer en AI Overviews o AI Mode; alcanza con estar indexado y poder mostrar snippet. Se mantiene porque es barato y no molesta.
- **Rastreadores de IA abiertos por defecto.** Bloquear los de entrenamiento es una decisión del dueño (abajo).
- **Dirección solo real.** La calle la carga el dueño en el panel (desde el 12/10/2026, la de la oficina en Cochabamba); nunca se inventa ni se completa.
- **Una sola página local, la de la base.** `/desarrollo-de-software-cochabamba` existe porque ahí está la oficina; ninguna otra ciudad tiene página (serían doorway). Todo el resto del sitio presenta a Burrow Labs como empresa de **Bolivia** que trabaja para todo el país y el exterior y recibe pagos desde cualquier país: ningún título ni texto lo encierra en Cochabamba.
- **`/admin` va en `Disallow` y además responde `noindex`.** Con el `Disallow` Google no llega a leer el `noindex`; se acepta porque el admin no tiene enlaces públicos y pide sesión.

## Perfiles fuera del sitio

- **Google Business Profile** (cuenta `admin@burrowlabs.com.bo`, nunca la de Apple Boss): nombre, dirección, horario, descripción, servicios y redes. Es la fuente: todo cambio de ficha se hace primero acá.
- **Bing Places**: se sincroniza con Google. Al tocar «Sincronizar», Bing reemplaza sus datos con los de Google y **borra las redes que solo estaban cargadas en Bing**.
- **TechBehemoths** (plan gratis, verificada): el enlace de texto «Verified on TechBehemoths» en `/nosotros` (`data-techbehemoths-verification`, sin `nofollow`) mantiene la verificación. No quitarlo ni agregarle `nofollow`. Se eligió la versión de texto y no la insignia porque la insignia carga una imagen de su CDN en cada visita.
- **GitHub**: la organización `burrow-labs-bo`, que es el `sameAs` de GitHub.

## Rastreadores de IA: cómo bloquear el entrenamiento

Hoy no se bloquea ninguno. Estos son los tokens documentados por cada empresa:

| Token | Empresa | Para qué sirve | Bloquearlo afecta la búsqueda |
| --- | --- | --- | --- |
| `OAI-SearchBot` | OpenAI | Índice de búsqueda de ChatGPT | **Sí**: el sitio deja de aparecer en las respuestas de búsqueda de ChatGPT |
| `GPTBot` | OpenAI | Entrenamiento de modelos | No |
| `ChatGPT-User` | OpenAI | Visitas pedidas por una persona | No decide la aparición en búsqueda |
| `Google-Extended` | Google | Entrenamiento de Gemini y grounding | No: «does not impact a site's inclusion in Google Search» |
| `ClaudeBot` | Anthropic | Entrenamiento | No |
| `Claude-SearchBot` / `Claude-User` | Anthropic | Búsqueda / visitas pedidas por una persona | Sí / — |
| `PerplexityBot` | Perplexity | Índice de búsqueda (no entrena modelos) | Sí |
| `CCBot` | Common Crawl | Conjunto de datos abierto, usado para entrenar | No |

Para bloquear solo el entrenamiento, agregar a `rules` en `src/app/robots.ts`:

```ts
{ userAgent: ["GPTBot", "Google-Extended", "ClaudeBot", "CCBot"], disallow: "/" },
```

No tocar `Googlebot`, `Bingbot` ni `OAI-SearchBot`. OpenAI tarda unas 24 h en aplicar un cambio de `robots.txt`. AI Overviews y AI Mode usan `Googlebot`: se controlan con `noindex`, `nosnippet` o `max-snippet`, no con `Google-Extended`.

## Fuentes consultadas (octubre de 2026)

- OpenAI, bots: <https://platform.openai.com/docs/bots>
- Google, rastreadores comunes y `Google-Extended`: <https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers>
- Google, funciones de IA: <https://developers.google.com/search/docs/appearance/ai-features>
- Google, robots.txt: <https://developers.google.com/search/docs/crawling-indexing/robots/intro>
- Google, sitemaps: <https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap>
- Google, canónicas: <https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls>
- Google, `Organization`, `Article`, `BreadcrumbList`: <https://developers.google.com/search/docs/appearance/structured-data/organization>
- IndexNow: <https://www.indexnow.org/documentation>
- Anthropic, Perplexity y Common Crawl: documentación propia de cada rastreador.

## Analytics

- **Propio y anónimo** (`/api/events` → tabla `analytics_events`): sin cookies, sin IP, sin identificadores. Alimenta el dashboard.
- **Google Analytics 4:** solo si existe `NEXT_PUBLIC_GA_ID` y la persona acepta el banner. Sin ID no se carga nada ni aparece banner.
- **Search Console:** `NEXT_PUBLIC_GSC_VERIFICATION` publica la etiqueta `google-site-verification`.

Eventos: `page_view` (solo propio), `cta_hero`, `contact_submit`, `whatsapp_click`, `project_view`, `plan_view`, `plan_cta`, `diagnostic_start`, `diagnostic_complete`, `calculator_complete`, `game_start`, `game_complete`.

## Pendiente

**Del dueño**

- Decidir si se bloquean los rastreadores de entrenamiento.
- Hecho: Search Console y Bing Webmaster Tools verificados con sitemap; redes cargadas (Instagram, LinkedIn, Facebook, TikTok, GitHub y la ficha de Maps); dirección, teléfono y horario en Google Business y Bing Places; textos legales aprobados e indexables.

**Del servidor**

- Hecho (comprobado el 28/10/2026): `http://`, `www.` y `http://www.` llegan al dominio raíz con un solo salto.
- Hecho: `NEXT_PUBLIC_SITE_URL=https://burrowlabs.com.bo` al compilar y al correr.

**Técnico, más adelante**

- **IndexNow** (Bing, Yandex, Naver, Seznam…; Google no participa): **implementado**. Con `INDEXNOW_KEY` definida, cada alta, cambio, publicación o baja de un servicio, caso, artículo, plan, FAQ o ruta SEO desde el panel avisa a `api.indexnow.org` la URL y su listado (`src/lib/indexnow.ts`, un intento, sin reintentos); la clave se sirve en `/indexnow-key.txt`. Sin clave no se avisa nada y esa ruta responde 404. Activo en producción. Lo que entra por una migración o por el seed **no** pasa por el panel: hay que avisar a mano (POST a `api.indexnow.org` con la clave pública de `/indexnow-key.txt`).
- **Imagen Open Graph por servicio y por caso: hecho (28/10/2026).** Cada servicio y cada caso tiene su portada en `public/og/servicios/<slug>.png` y `public/og/proyectos/<slug>.png` (misma plantilla que el Lab, ver [BRAND-ASSETS.md](BRAND-ASSETS.md)), cargada como «imagen para compartir» por la migración `0014`. Es su Open Graph y, en los casos, la imagen del `Article`. Una portada real subida desde el panel la reemplaza. **Artículos: hecho (21/10/2026)**: cada artículo tiene su portada en `public/lab/covers/<slug>.png`, cargada como «imagen para compartir»; es su Open Graph y, sin portada subida, la portada de la página y la imagen del `Article` (ver [BRAND-ASSETS.md](BRAND-ASSETS.md)).
