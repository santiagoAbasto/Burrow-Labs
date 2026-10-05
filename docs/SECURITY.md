# Burrow Labs — Seguridad

Qué se protege, de qué, y con qué control concreto (con su archivo). Complementa a [ARCHITECTURE.md](ARCHITECTURE.md).

## 1. Qué se protege

| Activo | Dónde vive | Por qué importa |
|---|---|---|
| Datos personales de leads | tabla `leads` | Nombre, email, WhatsApp y mensajes de personas reales |
| Acceso al CMS | `users`, `sessions` | Quien entra puede publicar en nombre de la marca |
| Contenido no público | borradores, clientes sin autorización, precios ocultos | Publicarlo por error rompe acuerdos con clientes |
| Secretos | variables de entorno | Base de datos, storage, `AUTH_SECRET` |
| Integridad del sitio | HTML servido, archivos de media | Un sitio alterado daña a la marca y a sus visitantes |

## 2. Riesgos considerados

1. Acceso no autorizado al admin: prueba masiva de contraseñas, robo o reutilización de sesión.
2. Abuso de formularios y endpoints públicos: spam, bots, saturación.
3. Inyección de contenido activo: scripts en texto del CMS, en archivos subidos o en JSON-LD.
4. Lectura o escritura de archivos fuera del directorio de media.
5. Filtración de datos: PII en logs o analítica, secretos en el bundle del navegador, contenido no autorizado en páginas públicas.
6. Peticiones entre sitios contra acciones del admin o contra endpoints propios.
7. Incrustación del sitio en marcos de terceros.

8. Agotamiento de recursos del servidor por un visitante sin sesión: disco (páginas generadas a pedido), memoria, tabla de límites.

Fuera de alcance de esta capa: disponibilidad ante ataques volumétricos (se resuelve en el proxy o CDN), seguridad del servidor y de la base (hardening, backups, mínimo privilegio del usuario de PostgreSQL: ver DEPLOY.md).

## 3. Controles implementados

### Autenticación y sesiones — `src/lib/auth.ts`

- Contraseñas con **scrypt** (`node:crypto`), N=2^15, r=8, p=3, salt aleatorio de 16 bytes por contraseña. Los parámetros se guardan dentro del hash para poder subirlos sin invalidar cuentas.
- Comparación en tiempo constante (`timingSafeEqual`). Un hash corrupto devuelve `false`, no lanza.
- `verifyCredentials` hace el mismo trabajo de cálculo exista o no el email, para que el tiempo de respuesta no indique qué cuentas existen.
- Token de sesión de 32 bytes aleatorios. En la base se guarda solo su **sha256**: una copia de la tabla `sessions` no sirve para entrar.
- Cookie de sesión: `HttpOnly`, `SameSite=Lax`, `Path=/`, sin `Domain`. En producción se llama **`__Host-bl_session`** y lleva `Secure`: con ese prefijo el navegador solo la acepta si viene con `Secure`, `Path=/` y sin `Domain`, así que un subdominio (o una página servida por HTTP) no puede plantar ni pisar la sesión del panel. Importa porque HSTS va sin `includeSubDomains`. En desarrollo (HTTP) se llama `bl_session`, sin prefijo ni `Secure`. Crear, leer y cerrar sesión usan la misma constante (`SESSION_COOKIE`).
- Duración: 7 días, con renovación deslizante cuando queda menos de la mitad, y **tope absoluto de 30 días desde que se creó** (`SESSION_MAX_MS`): pasado ese plazo hay que volver a ingresar aunque la sesión se haya usado todos los días. Una cookie robada no vive indefinidamente.
- La vigencia se comprueba en la base en cada request (`expires_at > now()` y el tope sobre `created_at`); cerrar sesión borra la fila, así que la sesión se revoca del lado del servidor.
- `requireUser()` redirige a `/admin`, que sin sesión muestra el ingreso. **Debe llamarse en cada página y en cada server action del admin**: un layout protegido no protege las acciones.
- El seed exige una contraseña inicial de 12 caracteres o más y nunca la imprime (`src/db/seed.ts`).

**Ingreso — `login` en `src/lib/admin/actions.ts`.** Dos límites, cada uno de 15 minutos:

| Clave | Tope | Qué frena |
|---|---|---|
| `login:hmac(ip)` | 5 intentos | Fuerza bruta desde un mismo origen |
| `login-user:hmac(email)` | 10 intentos | La misma cuenta probada desde muchas IP (relleno de credenciales) |

- La clave por cuenta sale del email que llega en el formulario, **exista o no el usuario**: el bloqueo y su mensaje son idénticos para una cuenta real y para una inventada. Junto con el mensaje único «Email o contraseña incorrectos» y el cálculo de scrypt que se hace igual sin usuario, el ingreso no permite enumerar cuentas.
- Un ingreso correcto borra las dos claves.
- Sin IP fiable (ver [Detrás de un proxy](#detrás-de-un-proxy)) la clave por IP no se usa: sería una sola para todo el mundo y cualquiera podría bloquear el ingreso con cinco intentos. Queda el límite por cuenta.
- Se evalúan en orden: un intento que ya frenó la clave por IP no gasta el cupo de la cuenta. Desde una sola IP no se puede dejar bloqueada la cuenta de otro (5 intentos como mucho, de los 10).
- Techo conocido del límite por cuenta: quien conozca el email de un administrador y use dos o más IP puede demorarle el ingreso mandando 10 intentos cada 15 minutos. Salidas: restringir `/admin` por IP en el proxy, o borrar la fila (`DELETE FROM rate_limits WHERE key LIKE 'login-user:%'`).
- «Restablecer contraseña» (pantalla Usuarios) solo sirve para **otra** cuenta. La propia se cambia en Mi cuenta, que pide la contraseña actual: una sesión ajena abierta no alcanza para quedarse con la cuenta. Los dos caminos cierran las demás sesiones del usuario.
- Los argumentos que las acciones reciben ligados con `.bind()` (ids, claves de recurso, tokens) viajan en la petición: se validan como cualquier otra entrada (`uuid`, lista cerrada con `Object.hasOwn`, formato del token) antes de tocar la base.

### Rate limiting — `src/lib/rate-limit.ts`

- Ventana fija en la tabla `rate_limits`, con un único `INSERT … ON CONFLICT DO UPDATE` atómico (probado bajo concurrencia).
- La clave del cliente es `ámbito:HMAC-SHA256(AUTH_SECRET, ip)`; la de una cuenta, `ámbito:HMAC-SHA256(AUTH_SECRET, email)`. **Ni la IP ni el email se guardan en claro**, ni acá ni en ninguna otra tabla.
- **De dónde sale la IP (`clientIp`).** El modelo es **un** proxy de confianza delante de Next. Se toma la **última** entrada de `X-Forwarded-For`, que es la que escribe ese proxy; las anteriores las puede inventar quien hace la petición. `X-Real-IP` solo como respaldo. El valor tiene que ser una IP válida.
- **Cuándo la IP no es fiable.** Next completa `X-Forwarded-For` con la dirección del socket cuando la cabecera no llega; detrás de un proxy que no la reenvía, esa dirección es la del propio proxy (`127.0.0.1`, o la red privada de Docker). Por eso loopback, redes privadas y link-local cuentan como «IP desconocida», igual que una cabecera ausente o con basura. En ese caso:
  - todos los visitantes comparten la clave `ámbito:hmac("shared")`, con un cupo **20 veces mayor** (`limitClient`): sirve de cortacircuitos global sin que unos pocos envíos bloqueen el formulario para todo el mundo;
  - el ingreso al panel **no** usa clave por IP (solo la de cuenta);
  - el servidor escribe una vez en el log `[rate-limit] no llega la IP real del visitante…`. Es un error de despliegue: se corrige en el proxy, no acá.
  - En desarrollo y en los E2E (localhost) este es el comportamiento normal.
- Límites vigentes: `/api/events` 60 por minuto; contacto, diagnóstico y newsletter 5 por hora cada uno; ingreso, ver arriba.
- **Formularios públicos: se valida primero y se cuenta después.** Solo gastan cupo los envíos válidos (los que se van a guardar). Quien corrige un campo varias veces no queda bloqueado ni pierde el lead, y un envío inválido, el honeypot o la trampa de tiempo no escriben nada en la base.
- Limpieza: las filas de más de un día se borran de forma oportunista (1 % de las llamadas).
- Techo conocido: la ventana fija admite hasta el doble del límite en el borde entre dos ventanas. Detrás de un NAT compartido (oficina, operador móvil) varias personas comparten cupo.

### Validación de entrada — `src/lib/validation.ts`, `src/lib/analytics-events.ts`

- Toda entrada externa pasa por Zod en el servidor. Los esquemas se comparten con el cliente solo para dar feedback temprano; el servidor valida siempre.
- Leads: longitudes máximas en todos los campos, email y WhatsApp con formato, tipo de proyecto de lista cerrada, **consentimiento obligatorio (`true` literal)** y honeypot (`fax`) que debe llegar vacío.
- Slugs: solo minúsculas, números y guiones. **Los getters por slug de `src/lib/content.ts`** (`getProject`, `getService`, `getPost`, `getProjectsByService`) reciben texto de la URL: un valor que no cumple el esquema (byte nulo, mayúsculas, una ruta) devuelve `null` sin llegar a PostgreSQL, y uno bien formado solo se consulta si está en el listado público ya cacheado. Un slug inventado no cuesta una consulta ni deja una clave nueva en la caché.
- Rutas de analítica (`isInternalPath`): una sola «/» inicial, sin query ni hash, sin «//», «\», espacios ni caracteres de control. Es lo que evita guardar como «ruta» algo que un navegador resuelve como otro dominio (`//otro.sitio`, `/\otro.sitio`, `/<tab>/otro.sitio`). El dashboard, además, solo enlaza las rutas que pasan esa misma regla. La ruta de un override de SEO usa la misma función.
- URLs del CMS: las redes sociales solo admiten `https://` (esquema de settings); un valor inválido ya guardado se descarta al leer sin perder el resto del grupo, y los correos vuelven a filtrar. El sitio web de un cliente tiene que ser `http(s)://`.
- Las consultas van por Drizzle con parámetros; no se concatena SQL.

### Subida y entrega de archivos — `src/lib/storage.ts`, `src/app/media/[...key]/route.ts`

- Topes: **8 MB por imagen, 10 MB y 10 imágenes por envío**, 50 megapíxeles. El tope del envío es el de las server actions (`experimental.serverActions.bodySizeLimit: "10mb"` en `next.config.ts`; el valor por defecto de Next es 1 MB) y tiene que coincidir con `MAX_UPLOAD_*` en `src/lib/storage.ts` y con `client_max_body_size` del proxy. El formulario avisa antes de enviar si se pasa.
- No se confía en la extensión ni en el `Content-Type`: el archivo se **decodifica con sharp** y se **re-codifica a WebP**. Lo que no decodifica como raster se rechaza; lo que se guarda es una imagen nueva, sin EXIF ni bytes ajenos.
- **SVG no se acepta**: puede contener scripts.
- El nombre en disco es aleatorio (`newMediaKey()`); el nombre original solo queda como dato en la tabla `media`.
- Las claves se validan con una lista blanca de caracteres (segmentos alfanuméricos que no empiezan con punto) y, además, la ruta resuelta debe quedar dentro de `storage/uploads`. Vale para leer, escribir y borrar.
- `/media/*` solo entrega extensiones raster conocidas, con `Content-Type` fijo por extensión, `X-Content-Type-Options: nosniff` y `Cache-Control: immutable`. Cualquier otra cosa responde 404.

### Cabeceras — `next.config.ts`

| Cabecera | Valor |
|---|---|
| `Content-Security-Policy` | ver abajo |
| `Strict-Transport-Security` | `max-age=63072000` (solo producción). **Sin `includeSubDomains` y sin `preload`** |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` (respaldo de `frame-ancestors`) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | cámara, micrófono, geolocalización, pagos, USB y topics desactivados |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `X-Robots-Tag` | `noindex, nofollow` en `/admin/*` y `/api/*` |

`X-Powered-By` está desactivado.

**HSTS sin `includeSubDomains` ni `preload`: decisión del propietario.** Con `includeSubDomains`, el primer navegador que visita `https://burrowlabs.com.bo` obliga HTTPS en **todos** los subdominios durante dos años; uno que hoy o mañana sirva por HTTP (correo web, panel del hosting, staging) deja de abrir para esos visitantes y no se puede revertir desde el servidor. `preload` lo vuelve además permanente en la lista de los navegadores. Se revisa cuando el propietario confirme qué subdominios existen. Dos consecuencias a cuidar: el proxy no debe agregar su propia cabecera HSTS con otro valor, y la cookie de sesión compensa la falta de `includeSubDomains` con el prefijo `__Host-`.

**CSP y por qué no usa nonce.** Una CSP con nonce obliga a generar un valor distinto por request, y eso fuerza render dinámico en todas las páginas: se pierde el prerender estático y la caché de CDN, que son la base del rendimiento y del SEO de este sitio. Se eligió la variante sin nonce que documenta Next (`node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`, «Without Nonces»):

- `script-src 'self' 'unsafe-inline'` — Next inserta scripts inline de arranque. `'unsafe-eval'` solo en desarrollo.
- `default-src 'self'`, `object-src 'none'`, `frame-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, `upgrade-insecure-requests` (producción).
- `connect-src 'self'`, `img-src 'self' data: blob:`, `font-src 'self' data:`, `worker-src 'self' blob:`.
- Los orígenes de Google Analytics solo se agregan si `NEXT_PUBLIC_GA_ID` existe; el origen de `S3_PUBLIC_URL`, solo si está configurado.

Lo que esta CSP sí garantiza: ningún script, estilo, fuente, frame ni conexión hacia orígenes no listados, ningún plugin, ningún `<base>` ni envío de formularios hacia afuera, y el sitio no se puede enmarcar. Lo que no cubre es el script inline; eso lo cubren los controles de la sección siguiente. Camino de mejora si el modelo de render cambia: nonce por request o SRI (`experimental.sri`).

Consecuencia para quien desarrolla: nada de CDNs en runtime (fuentes, HDRIs, decodificadores). Todo asset se sirve desde el propio origen.

### Páginas generadas a pedido — `next.config.ts`, `src/lib/content.ts`

Las rutas `[slug]` generan y cachean una respuesta por cada valor que se pida, incluidos los 404. Con la configuración por defecto de Next eso se escribía en disco sin tope (~75 KB por slug inventado): cualquier visitante podía llenar el disco, que en un VPS se comparte con PostgreSQL.

- `experimental.isrFlushToDisk: false`: lo generado a pedido queda **solo en la caché en memoria**, que tiene tope (`cacheMaxMemorySize`, 50 MB por defecto). Lo prerenderizado en el build se sigue sirviendo desde disco. Verificado sobre un build de producción: 60 slugs inexistentes más 20 variantes de `/contacto?proyecto=…` no crean ningún archivo.
- Los getters por slug filtran antes de consultar (ver «Validación de entrada»).
- El proxy limita peticiones por IP (ver abajo).

Lo que cambia con `isrFlushToDisk: false`, para tenerlo presente:

- Una página regenerada (cada 5 minutos, o al guardar en el panel) vive en memoria. Si el proceso se reinicia **sin reconstruir**, la primera petición a cada página recibe la copia del build y la siguiente ya la versión nueva. Con Docker no pasa: el contenedor reconstruye en cada arranque.
- Mientras el proceso vive, un cambio hecho desde el panel nunca se sirve viejo: la invalidación por tags descarta también la copia del build.
- La opción es experimental (existe en Next 16.3.8: `node_modules/next/dist/server/config-shared.js`). Al actualizar Next hay que confirmar que sigue existiendo y repetir la prueba: `find <distDir>/server -type f | wc -l` antes y después de pedir 20 slugs inexistentes; el número no debe crecer.

### Detrás de un proxy

El sitio **no** se expone directo: escucha en `127.0.0.1:3000` y delante va un proxy con HTTPS (nginx o Caddy). Varios controles dependen de lo que ese proxy envía. Requisitos, con nginx como referencia:

| Requisito | Por qué |
|---|---|
| `Host` y `X-Forwarded-Host` = el dominio público | Las server actions (ingreso, contacto, newsletter, diagnóstico) y `/api/events` comparan `Origin` con el host. nginx manda por defecto `Host: 127.0.0.1:3000`: sin esto **todas las acciones responden «Invalid Server Actions request»**. No taparlo con `serverActions.allowedOrigins` |
| `X-Forwarded-Proto` = el esquema real | Redirecciones y URL absolutas correctas |
| `X-Forwarded-For` = la IP real, **pisando** lo que mande el cliente (`$remote_addr`) | Es la IP del rate limit y del contador de visitantes. Con `$proxy_add_x_forwarded_for` también funciona (la IP real queda última). Sin esta línea el límite por IP no existe |
| `X-Real-IP` = la IP real | Respaldo |
| Vaciar `CF-IPCountry`, `X-Vercel-IP-Country`, `CloudFront-Viewer-Country` y `X-Country-Code` | Sin un CDN delante, el país lo inventaría el visitante. Solo alimenta un gráfico, pero es un dato falso. Con un CDN real, dejar pasar solo la suya |
| `limit_req` por IP | Frena el barrido de slugs, el abuso de formularios y la fuerza bruta antes de llegar a la app |
| `client_max_body_size 1m` en general y `10m` solo en `/admin` | Igual al tope de subida. Fuera del panel nadie necesita mandar más de 1 MB |
| Ocultar `x-nextjs-cache`, `x-nextjs-prerender`, `x-nextjs-stale-time`; `server_tokens off` | No revelar el stack |
| No agregar otra cabecera `Strict-Transport-Security` | La pone la app, sin `includeSubDomains` |

```nginx
limit_req_zone $binary_remote_addr zone=site:10m rate=10r/s;

server {
  listen 443 ssl http2;
  server_name burrowlabs.com.bo;
  server_tokens off;
  client_max_body_size 1m;

  proxy_http_version 1.1;
  proxy_set_header Host              $host;
  proxy_set_header X-Forwarded-Host  $host;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-For   $remote_addr;   # pisa lo que mande el cliente
  proxy_set_header X-Real-IP         $remote_addr;
  proxy_set_header CF-IPCountry              "";
  proxy_set_header X-Vercel-IP-Country       "";
  proxy_set_header CloudFront-Viewer-Country "";
  proxy_set_header X-Country-Code            "";
  proxy_hide_header x-nextjs-cache;
  proxy_hide_header x-nextjs-prerender;
  proxy_hide_header x-nextjs-stale-time;

  location / {
    limit_req zone=site burst=40 nodelay;
    proxy_pass http://127.0.0.1:3000;
  }
  location /admin {
    client_max_body_size 10m;          # subida de imágenes del panel
    limit_req zone=site burst=40 nodelay;
    proxy_pass http://127.0.0.1:3000;
  }
}
```

Los `proxy_set_header` van en el bloque `server` y los `location` no declaran ninguno propio: en nginx, un `location` con un `proxy_set_header` deja de heredar todos los del nivel superior.

Prueba de aceptación, desde fuera del servidor:

1. El formulario de contacto envía y el ingreso al panel funciona (si no, falta `Host`).
2. El límite por IP no se evade inventando la cabecera. Con el comando de abajo, las primeras 60 respuestas son `400` y las siguientes `429` (un `503` es el `limit_req` de nginx: bajar el ritmo). Si siguen saliendo `400`, el proxy no está pisando `X-Forwarded-For`.
   ```bash
   for i in $(seq 1 65); do curl -s -o /dev/null -w "%{http_code} " -X POST https://burrowlabs.com.bo/api/events -H "X-Forwarded-For: 203.0.113.$i" -d '{}'; sleep 0.15; done
   ```
3. El log del servidor **no** muestra `[rate-limit] no llega la IP real del visitante`.
4. `curl -sI https://burrowlabs.com.bo/` no trae `x-nextjs-*` y trae un solo `Strict-Transport-Security: max-age=63072000`.
5. `curl -s https://burrowlabs.com.bo/api/health` responde `{"status":"ok",…}`.

Si más adelante se pone un CDN delante (Cloudflare), el modelo pasa a ser de dos saltos: nginx tiene que tomar la IP de la cabecera del CDN (`real_ip_header CF-Connecting-IP` con `set_real_ip_from` de sus rangos) o todos los visitantes de un mismo nodo compartirán límite.

### Salud del servicio — `src/app/api/health/route.ts`

`GET /api/health` hace un `SELECT 1` con un plazo de 2 segundos y responde `200 {"status":"ok"}` o `503 {"status":"degraded"}`, con `timestamp` y `version` (la de `package.json`) y nada más: sin secretos, hostname, rutas, variables ni el motivo del fallo. `Cache-Control: no-store`, `X-Robots-Tag: noindex`. Lo usa el healthcheck de `docker-compose.yml` y sirve para un monitor externo.

### Salida y contenido activo

Reglas para los componentes (se revisan en cada slice):

- React escapa por defecto. `dangerouslySetInnerHTML` no se usa con contenido del CMS; la única excepción es JSON-LD, siempre a través de `serializeJsonLd`.
- Markdown con `react-markdown` **sin** `rehype-raw`: el HTML crudo dentro del Markdown no se interpreta.
- JSON-LD: `serializeJsonLd` (`src/lib/seo.ts`) escapa `<`, así un texto del CMS no puede cerrar la etiqueta `<script>` (con test).
- Los iconos de servicios son claves de una lista, no SVG guardado en la base.

### Peticiones entre sitios

- Cookie de sesión `SameSite=Lax`: no viaja en `POST` iniciados desde otros sitios.
- Las server actions de Next comparan `Origin` con `Host` y solo aceptan `POST`.
- `/api/events` rechaza peticiones cuyo `Origin` no coincide con el host.
- Ninguna operación que modifique datos responde a `GET`.

### Privacidad y datos — `src/lib/content.ts`, `src/app/api/events/route.ts`, `src/lib/analytics.ts`

- `analytics_events` guarda nombre, ruta y un `meta` acotado (8 claves, valores escalares cortos), más atributos coarse derivados en el servidor y descartados en el origen: país (dos letras, lo informa el proxy), dispositivo, navegador, idioma (dos letras), host del referrer (nunca el propio sitio ni la ruta) y si el user agent parece bot. Ni la IP ni el user agent se guardan en claro: el único identificador es un hash HMAC de `día La Paz | ip | user agent` recortado a 16 hex, que sirve para contar visitantes únicos del día y cambia cada día, así que no sigue a nadie entre días. Sin cookies. La ruta no admite query ni hash, que podrían arrastrar datos personales. Los nombres de evento son una lista cerrada.
- GA4 no se carga si no hay ID; `track()` solo le reenvía eventos si `window.gtag` ya existe (es decir, si hubo consentimiento).
- Los leads solo se insertan con consentimiento y guardan la fecha (`consent_at`). No se escriben en logs.
- **Logs sin datos personales.** Con `EMAIL_DRIVER=log` cada correo deja en consola el asunto y un identificador del destinatario (`hmac` del email, 8 hex), nunca la dirección. Los errores de formularios y de envío tampoco la incluyen. `docker-compose.yml` rota los logs de los contenedores (10 MB × 5).
- **Bitácora (`activity_log`) sin datos de visitantes.** Para leads y suscriptores anota el id y qué se hizo («estado → contacted», «respuesta por correo», «suscriptor → Baja»), nunca el nombre ni el email: el borrado definitivo de un lead o de un suscriptor no deja rastros suyos. Los nombres y emails que sí aparecen son los de los administradores.
- **Exportes CSV**: cada descarga de leads o de suscriptores queda en la bitácora con quién, cuándo y cuántas filas (no el contenido).
- **Newsletter.** El formulario público responde siempre el mismo mensaje de éxito: no revela si un email ya estaba en la lista ni si se había dado de baja. Un email dado de baja **no se reactiva** desde el formulario (cualquiera podría volver a suscribir a quien pidió no recibir más): lo reactiva un administrador desde el panel, a pedido de la persona. La bienvenida se envía solo a las altas nuevas. Sigue sin doble opt-in (ver pendientes).
- La visibilidad pública se decide en un único lugar (`isPublic` en `content.ts`) y tiene tests: borradores, programados, clientes y testimonios sin autorización, nombre de cliente en casos anonimizados y precios ocultos no salen de la capa de datos.
- `SHOW_DEMO_CONTENT` se ignora en producción aunque esté activa (`src/lib/env.ts`).
- **El token de baja no llega a la analítica.** `analyticsEventSchema` reduce `/newsletter/baja/<token>` a `/newsletter/baja` en la ruta y en la meta, y el bloque de Caddy va sin log de acceso: el enlace de baja de un suscriptor no queda escrito en ningún registro.
- **Analítica de terceros solo con consentimiento** (`src/components/site/consent-analytics.tsx`): GA4 y Clarity no se cargan hasta «Aceptar», nunca en `/newsletter/baja/…` ni en el panel. La CSP suma sus dominios solo si su ID existe (GA4 sin Ads: `www.googletagmanager.com`, `*.google-analytics.com`, `*.analytics.google.com`; Clarity: `*.clarity.ms`, `c.bing.com`). Los IDs se validan con formato estricto porque se interpolan en scripts. El `<script>` de Clarity no puede tener `id="clarity"`: el elemento pisaría `window.clarity`.
- **Imágenes de los correos solo del propio sitio** (`ownImage` en `src/lib/email.ts`): una imagen externa en una campaña funcionaría como píxel de apertura para un tercero.
- **Borrado automático por plazos** (`src/lib/retention.ts`, programado en `src/instrumentation.ts`): al arrancar el servidor de producción y cada 24 h se borran consultas sin actividad en 24 meses (spam: 1 mes), bajas de newsletter de más de 12 meses, eventos de analítica de más de 14 y bitácora de más de 12. Son los plazos que publica `/privacidad`; un test los ata al texto. El log deja solo cantidades.

### Secretos y configuración — `src/lib/env.ts`

- Secretos solo por variables de entorno; `.env*` está fuera de git y de la imagen Docker (salvo `.env.example`, con valores de ejemplo genéricos).
- Validación al arrancar: en producción faltar `DATABASE_URL` o un `AUTH_SECRET` de 32+ caracteres detiene el proceso; con `EMAIL_DRIVER=resend|brevo` también faltar `EMAIL_API_KEY` o `EMAIL_FROM`, y con `smtp` faltar `SMTP_HOST` o `EMAIL_FROM` (no hay remitente por defecto). El error nombra la variable, nunca el valor.
- **El `.env` del servidor va con permisos `600`** (`chmod 600 .env`) y dueño el usuario que corre el despliegue.
- **Correo sin secreto en el entorno.** En producción el envío usa un relay SMTP autorizado a nivel de red, sin contraseña de correo en el `.env`. La conexión exige TLS (`requireTLS`) y los errores de envío salen sin el destinatario ni el texto del servidor (`src/lib/email.ts`).

**Después del primer arranque.** `ADMIN_EMAIL` y `ADMIN_PASSWORD` existen solo para que el seed cree el primer administrador. El seed corre en cada arranque del contenedor: si las variables se quedan, la contraseña inicial sigue en texto plano en el `.env` y a la vista con `docker inspect`, y un administrador inicial eliminado desde Usuarios se vuelve a crear en el siguiente `docker compose up`. Una vez que el panel abre:

1. Entrar y cambiar la contraseña desde **Mi cuenta**.
2. Borrar `ADMIN_EMAIL` y `ADMIN_PASSWORD` del `.env` del servidor (vacías, el seed no crea ni modifica usuarios).
3. `docker compose up -d` para que el contenedor arranque sin ellas, y comprobar: `docker compose exec web env | grep ADMIN_` no muestra valores.

### Contenedor — `Dockerfile`, `docker-compose.yml`

- El proceso corre como el usuario `node`, no como root; `/app` y la carpeta de media le pertenecen. Un volumen `media` **creado antes** de este cambio conserva dueño root: corregirlo una vez con `docker compose run --rm --user root web chown -R node:node /app/storage`.
- El puerto se publica solo en `127.0.0.1`; PostgreSQL no se publica.
- Healthcheck del servicio `web` contra `/api/health`; rotación de logs en los dos servicios.
- Techos conocidos: la imagen instala también las dependencias de desarrollo (el build corre al arrancar), y la aplicación usa el rol que crea la imagen de PostgreSQL, que es superusuario. Ver pendientes.
- Los módulos con acceso a secretos o a la base llevan `import "server-only"`. Solo las variables `NEXT_PUBLIC_*` llegan al navegador, y ninguna es secreta.

### Admin fuera de buscadores

`X-Robots-Tag: noindex, nofollow` en `/admin/*` y `/api/*` (`next.config.ts`). Además, `sitemap.ts` no debe listar rutas del admin y `robots.ts` debe excluirlas.

## 4. Verificación

`pnpm test` cubre: hash y verificación de contraseñas, ciclo completo de sesión (creación, token hasheado en BD, renovación, vencimiento, tope absoluto de 30 días, cierre), nombre y atributos de la cookie en desarrollo y en producción, ingreso (límite por IP, límite por cuenta con y sin usuario existente, ingreso sin IP fiable, limpieza de contadores), restablecer contraseña (no sobre la propia cuenta; ids que no son uuid), rate limit (N permitidas, N+1 bloqueada, liberación al cambiar la ventana, atomicidad, IP y email no almacenados, IP del proxy tratada como desconocida, cupo compartido), validación de leads (sin consentimiento, honeypot), newsletter (respuesta única, baja respetada, cupo solo para envíos válidos, tokens con formato), rutas de analítica que no salen del sitio, getters por slug que no consultan con entrada inválida, redes solo `https://`, correo (log sin destinatario, redes filtradas), bitácora sin datos de la persona, `/api/health` (forma, `no-store`, fallo y demora de la base sin filtrar el motivo), subida de imágenes (no-imagen, SVG, tamaño, EXIF eliminado), claves de storage fuera del directorio, respuestas de `/media`, `/api/events` y la regla de visibilidad.

Lo que **no** cubren los tests y se verificó a mano: `isrFlushToDisk` sobre un build de producción (sin archivos nuevos tras 80 peticiones a valores inventados; `/proyectos/%00`, `/servicios/%00` y `/lab/%00` responden 404 y no 500), y que Chromium acepta la cookie `__Host-` en `http://localhost` (los E2E corren un build de producción ahí). No se verificó: la imagen Docker (no se construyó) ni la configuración de nginx (se aplica en el servidor).

## 5. Pendientes y límites conocidos

| Pendiente | Por qué no está | De quién depende |
|---|---|---|
| Segundo factor (TOTP) en el panel | Con uno o dos administradores el límite por cuenta y la contraseña de 12+ caracteres alcanzan; es lo primero a sumar si crece el equipo | Propietario decide cuándo |
| Roles | Hoy todo usuario del panel es administrador: puede crear y borrar usuarios, exportar leads y enviar campañas | Propietario, cuando haya un tercer usuario |
| CSP con nonce para `/admin` | La CSP permite script inline (ver arriba). `/admin` ya es dinámico: un `src/proxy.ts` limitado a `/admin/:path*` puede emitir nonce solo ahí sin tocar el sitio público | Posterior |
| Doble opt-in de la newsletter | Hace falta un estado `pending` (migración) y una página de confirmación. Mientras tanto: bienvenida solo a altas nuevas, baja respetada y respuesta única | Propietario / revisión legal |
| Retención automática (leads, bajas, eventos, bitácora) | No hay plazos definidos; cuando existan, una purga mínima con cron | Propietario fija los plazos |
| Rol de PostgreSQL sin superusuario | El contenedor usa el rol que crea la imagen oficial. Crear un rol de aplicación dueño de la base y usarlo en `DATABASE_URL` | Servidor |
| Imagen sin dependencias de desarrollo | El build corre al arrancar porque prerenderiza con el contenido de la base | Posterior (cuando haya CI con acceso a la base) |
| Backups cifrados y fuera del servidor | `pg_dump` a un archivo local no alcanza | Servidor |

Límites conocidos que se aceptan:

- La CSP permite script inline en el sitio público (ver arriba).
- No hay rotación automática de `AUTH_SECRET`; cambiarlo reinicia las ventanas de rate limit y los identificadores de visitante, no cierra sesiones.
- El límite por cuenta permite demorar el ingreso de un administrador cuyo email se conozca (ver «Ingreso»).
- Un email dado de baja que quiera volver tiene que pedirlo: el formulario público no lo reactiva.
- `isrFlushToDisk` es una opción experimental de Next: revisar en cada actualización.
- Reportes de seguridad: por el email de contacto configurado en el CMS.
