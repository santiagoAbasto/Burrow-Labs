# Burrow Labs — Auditoría y plan de implementación

Fecha: 2026-10-02 · Estado: **slices 0–10 implementados** (ver el estado de pruebas en [TESTING.md](TESTING.md)).
Documento hermano: [DESIGN.md](DESIGN.md) (dirección de arte, tokens, motion).

---

## 1. Auditoría del estado actual

| Qué | Resultado |
|---|---|
| Proyecto | **Greenfield.** Sin código ni repositorio previos. |
| Assets | 2 logos oficiales WebP 2000×2000 (fondo `#EEEEEE`): `1.webp` (mascota en insignia) y `2.webp` (logo completo «BOLIVIAN IA / BURROW LABS»). Al inicio no había vector original y se trabajó sobre el raster; desde el 2026-10-02 la marca sale de los SVG oficiales de Illustrator (ver [BRAND-ASSETS.md](BRAND-ASSETS.md)). |
| Instagram `@burrowlabsbo` | Bio pública: «Codificando Soluciones · Webs • Sistemas • Automatización · Tecnología creada para hacer crecer tu negocio». El resto pide login (no se usó). |
| Entorno | Node 26.7 · pnpm 11.8 · git 2.54 · PostgreSQL 14 local activo en `:5432` · Docker 29 · ImageMagick, cwebp, ffmpeg · Chromium de Playwright instalado. |
| Librerías | Nada instalado todavía. Three.js/R3F, Motion y GSAP se instalan en el Slice 0. |
| Testing | Nada todavía. Se instala Vitest + Playwright. |

## 2. Stack (últimas versiones estables al 2026-10-02)

| Capa | Elección | Uso |
|---|---|---|
| Framework | Next.js 16.3 (App Router) + React 19.3 + TypeScript strict | SSR/ISR, server actions, SEO |
| Estilos | Tailwind CSS 4.3 (tokens en `@theme`) | Todo el styling; CSS puro para hover/estados |
| Motion | `motion` 14 | Microinteracciones, entradas, layout |
| Scroll | GSAP 3.15 + ScrollTrigger | **Solo** hero (descenso) y línea de proceso |
| 3D | three 0.186 + @react-three/fiber 9 + drei 10 | Hero «madriguera», lazy |
| Datos | PostgreSQL + Drizzle ORM 0.45 + `postgres` | Todo el contenido de negocio |
| Validación | Zod 4 | Server actions y API |
| Markdown | react-markdown + remark-gfm | Casos de estudio, Lab, FAQ, legales |
| Imágenes | sharp | Re-codifica y valida subidas |
| Tests | Vitest 5 (lógica) + Playwright 1.63 (E2E) | |
| Iconos | lucide-react + SVG propios | Nunca emojis como iconografía |

Sin librerías extra de UI, de auth, de formularios ni de tours: se resuelve con plataforma + lo ya instalado.

## 3. Arquitectura

```
src/
  app/
    (site)/            sitio público (layout: Header, Footer, WhatsApp, DepthGauge)
    admin/login        login
    admin/(panel)/     CMS (sin 3D ni motion decorativo)
    api/events         eventos first-party anónimos
    media/[...key]     sirve archivos del storage local
    sitemap.ts · robots.ts · llms.txt · manifest · opengraph-image
  components/
    ui/                UI kit (Button, Badge, Input, Modal, Drawer, Tooltip…)
    brand/             Logo, Mascot (capas del asset original)
    site/              Header, Footer, WhatsAppButton, DepthGauge, ConsentBanner
    home/              secciones del Home (una carpeta por sección)
    game/              Burrow Runner (motor puro + canvas)
    admin/             shell y CRUD genérico
  db/                  schema.ts, cliente, migraciones, seed
  lib/                 auth, storage, rate-limit, content (queries cacheadas), seo, analytics, whatsapp, validation
e2e/                   Playwright
docs/                  PLAN, DESIGN, ARCHITECTURE, CMS, SEO, SECURITY, DEPLOY, TESTING, CONTENT-STATUS
```

- **Lectura de contenido:** server components → `src/lib/content.ts` (queries Drizzle cacheadas con tags). Cada mutación del admin revalida su tag. Las páginas públicas quedan estáticas/ISR.
- **Home dirigido por datos:** `home_sections` define orden, visibilidad y textos; un registro `key → componente` arma la página.
- **CMS genérico:** un solo motor CRUD dirigido por configuración (`resources`): campos, columnas de lista, validación Zod derivada. Un recurso nuevo = una entrada de config.
- **Storage abstraído:** `put/remove/url` con driver `local` (disco + ruta `/media`) y driver `s3` (S3/R2/MinIO) elegido por env.
- **Auth propia mínima:** scrypt (`node:crypto`), sesiones en BD con token hasheado, cookie `httpOnly` + `SameSite=Lax` + `Secure` en producción.
- **3D:** el HTML del hero (H1, copy, CTAs) se renderiza en servidor; el canvas se carga después, solo si el dispositivo aguanta; si no, queda la ilustración estática.

## 4. Modelo de datos

`users` · `sessions` · `site_settings` (clave/valor JSON: contacto, WhatsApp, redes, SEO por defecto, SEO local) · `home_sections` · `services` · `project_categories` · `projects` · `project_media` · `project_services` · `clients` · `testimonials` · `plans` · `plan_features` · `faqs` · `post_categories` · `posts` · `leads` · `seo_metadata` (por ruta) · `media` · `analytics_events` · `rate_limits`.

- Estados `draft | published | archived` + `published_at` (permite programar publicación).
- Slugs únicos en servicios, proyectos, planes, posts, categorías.
- `projects.client_public=false` → caso anonimizado (se muestra el título genérico, nunca el cliente).
- `clients.authorized` y `testimonials.authorized` deben ser `true` para salir al público.
- `plans.price_mode`: `from | fixed | quote | hidden`, con `currency` y `status`.
- `leads`: solo se guardan con `consent=true`; nunca van a logs.
- `analytics_events`: nombre + ruta + meta sin PII, más atributos coarse (país, dispositivo, navegador, idioma, host del referrer, bot) y un hash de visitante que rota cada día; sin IP ni user agent en claro, sin cookies.

## 5. Rutas

Públicas: `/` · `/servicios` · `/servicios/[slug]` · `/proyectos` · `/proyectos/[slug]` · `/planes` · `/nosotros` · `/clientes` · `/lab` · `/lab/[slug]` · `/contacto` · `/diagnostico` · `/calculadora` · `/faq` · `/privacidad` · `/terminos` · `/cookies` · 404 con juego.
Admin: `/admin/login` · `/admin` (Dashboard, Home, Servicios, Proyectos, Clientes, Testimonios, Planes, FAQ, Blog, Leads, SEO, Media, Configuración, WhatsApp).
Técnicas: `/sitemap.xml` · `/robots.txt` · `/llms.txt` · `/api/events` · `/media/*`.

## 6. Seguridad

Validación server-side con Zod en toda entrada · rate limiting en BD (login, contacto, diagnóstico, eventos) · honeypot + trampa de tiempo en formularios · verificación de origen en server actions · headers seguros (CSP, HSTS, nosniff, frame-ancestors, Referrer-Policy, Permissions-Policy) · subidas solo raster re-codificadas con sharp, nombre aleatorio, tope de tamaño · admin con `noindex` y fuera de sitemap/robots · secretos solo por env · logs sin PII · escape por defecto (React) y Markdown sin HTML crudo.

## 7. Slices y olas de ejecución

| Ola | Slices | Contenido | Cierre |
|---|---|---|---|
| 0 | 0 | Scaffold, dependencias, tokens, esquema + migraciones + seed, auth, storage, UI kit, shell (Header/Footer), assets de marca | lint · typecheck · tests · build · capturas |
| 1 | 1–6 | Hero + 3D · social proof + problema + confianza · servicios + proceso · portfolio + casos · planes + calculadora + diagnóstico · Burrow Runner + 404 · contacto + WhatsApp + leads + FAQ + nosotros + legales | ídem |
| 2 | 7–9 | CMS completo · Lab/blog · SEO (metadata, sitemap, robots, JSON-LD, llms.txt, OG) · analytics + consentimiento | ídem |
| 3 | 10 | E2E de flujos críticos · QA visual en 320/375/390/425/768/1024/1280/1366/1440/1920 · accesibilidad · seguridad · performance/Lighthouse · documentación · deploy | reporte final |

Dentro de cada ola los agentes trabajan en paralelo con **archivos propios, puerto propio, `distDir` propio y base de datos de test propia**. Ninguno instala dependencias ni hace commits.

## 8. Contenido: qué es real y qué falta

Se mantiene en un documento interno (fuera del repositorio público) con tres etiquetas: **COPY REAL**, **PLACEHOLDER PENDIENTE**, **DATO QUE REQUIERE CONFIRMACIÓN**.

- Real (del brief): slogan, propuesta de valor, servicios, frases de marca, proceso, nombres y precios base de planes, preguntas del FAQ, valores, textos del juego/404/WhatsApp.
- Placeholder pendiente: beneficios y plazos de cada plan, respuestas del FAQ que dependen de política comercial, casos de estudio (se siembran como **borrador demo**, nunca públicos).
- Requiere dato real: número de WhatsApp, email, dominio, redes (solo se conoce Instagram), clientes/logos autorizados, testimonios, proyectos reales, ID de GA4, datos legales del titular.

## 9. Decisiones por defecto (se cambian sin tocar código salvo la primera)

1. **Voz del copy:** se respeta literal el copy del brief (incluye voseo: «Contanos qué querés resolver»). Si se prefiere tuteo, se cambia desde el CMS/seed.
2. **Sin proyectos publicados:** la sección de proyectos del Home se oculta y «Ver lo que construimos» apunta a Servicios; `/proyectos` muestra un estado vacío diseñado.
3. **Sin clientes autorizados:** la franja de social proof muestra sectores.
4. **Sin GA4 configurado:** no se carga ningún tracker ni aparece banner de cookies.
5. **Sin número de WhatsApp:** el botón flotante lleva a `/contacto`.
6. **Idioma:** solo español (es-BO). i18n queda fuera hasta que se pida.
7. **Deploy documentado:** Docker (Next standalone + Postgres + volumen de media) y alternativa Vercel + Postgres gestionado + storage S3/R2.
