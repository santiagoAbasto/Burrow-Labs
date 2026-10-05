# Pruebas

| Comando | Qué corre |
|---|---|
| `pnpm lint` | ESLint (reglas de Next y React). |
| `pnpm typecheck` | TypeScript estricto. |
| `pnpm test` | Vitest: 79 tests de lógica (auth, rate limit, storage, contenido, validación, WhatsApp, calculadora, diagnóstico, motor del juego, formularios del CMS). Usa `TEST_DATABASE_URL`. |
| `pnpm test:e2e` | Playwright: 62 tests contra un build de producción y la base de test. |
| `pnpm build` | Build de producción (necesita la base). |
| `pnpm check` | lint + typecheck + test + build. |

## E2E (`e2e/`)

- **`site.spec.ts`** — Home, 15 páginas interiores, menú de escritorio y móvil, 404, contenido honesto (sin proyectos ni clientes inventados), planes y precios, calculadora, diagnóstico, Burrow Runner.
- **`leads-admin.spec.ts`** — validación del contacto, trampa anti-bots, lead guardado, login y bloqueo del admin, CRUD del CMS reflejado en el sitio (FAQ, precio de un plan, sección del Home), WhatsApp con y sin número, cierre de sesión.
- **`quality.spec.ts`** — metadata, canonical, Open Graph, JSON-LD, robots, sitemap, llms.txt, cabeceras de seguridad, **sin scroll horizontal en 320 / 375 / 390 / 425 / 768 / 1024 / 1280 / 1366 / 1440 / 1920** en 13 páginas, objetivos táctiles de 44px, accesibilidad con axe (WCAG 2 A/AA) y navegación por teclado.

`pnpm test:e2e` prepara la base de test, construye en `.next-e2e` y levanta el sitio en el puerto 3210. No toca la base de desarrollo.

## Herramientas de QA visual

- `node scripts/shot.mjs <ruta> <salida.png> [ancho] [alto] [--full] [--scroll=a,b] [--reduced]` — capturas con el dev server en marcha.
- `node scripts/overflow.mjs <rutas…>` — lista qué elementos desbordan a 320px.

## Resultados medidos (build de producción, Lighthouse)

| Página | Performance | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|
| Home (escritorio) | 99 | 100 | 100 | 100 |
| Home (móvil, 4G lenta simulada) | 88 | 100 | 100 | 100 |
| Servicio (móvil) | 95 | 100 | 100 | 100 |
| Planes (móvil) | 94 | 100 | 100 | 100 |

CLS 0 en todas. En el Home móvil el LCP es de 3,9 s con red lenta simulada; es el punto a mejorar.

## No verificado

Lector de pantalla real, Safari y Firefox, dispositivos físicos, el driver S3 contra un bucket y el arranque con Docker.
