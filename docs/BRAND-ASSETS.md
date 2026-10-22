# Assets de marca

Origen: los **vectores oficiales** de Illustrator, en `brand-src/`:

- `burrow-recuperado.svg` — la mascota en su insignia.
- `burrow-ofi.svg` — el logo completo («BOLIVIAN IA» / «BURROW LABS»).

Todo lo de `public/brand/` y los iconos de `src/app/` se generan con `brand-src/build-assets.mjs` **sin redibujar nada**: se recorta el lienzo, se separan capas y se pasa a contorno el único texto vivo. Como son SVG, no se pixelan a ningún tamaño ni densidad de pantalla.

```bash
node brand-src/build-assets.mjs
```

| Archivo | Qué es |
|---|---|
| `logo-full.svg` | Logo completo, sin el fondo gris del lienzo. |
| `badge.svg` | Insignia de la mascota. |
| `wordmark.svg` | Banner «BURROW LABS» del logo. |
| `mascot.svg` | El burro solo, con su contorno amarillo. |
| `badge-bg`, `badge-ears`, `badge-body` (`.svg`) | Capas de la insignia para animar orejas y pupila. |
| `mascot-ears`, `mascot-body` (`.svg`) | Capas del burro solo. |
| `manifest.json` | Tamaños y geometría (ojo, pupila, pivote de las orejas), tomada de las coordenadas del vector. |
| `mascot-texture.webp` | El burro a 1321×2048 para la escena 3D del hero (WebGL necesita píxeles). |
| `og-logo.png` | Imagen para compartir por defecto (las redes no aceptan SVG). |
| `src/app/icon.png`, `apple-icon.png`, `favicon.ico` | Iconos (formatos que exigen mapa de bits). |

Los cuatro mapas de bits salen del vector en cada generación, al tamaño exacto en que se usan.

**Verificación:** renderizados con el mismo encuadre, `badge.svg`, `mascot.svg` y `logo-full.svg` difieren del original en 0,0003/255 de media (máximo 14/255, solo en el suavizado del borde de «</>»). Las capas apiladas más la pupila en CSS dan la misma imagen que `badge.svg`.

**Tres cosas que no son un recorte literal:**

- «</>» venía como texto vivo en Arial Black; sin esa fuente instalada (Android, Linux) se vería con otra letra. Se reemplaza por los contornos de esos tres glifos, con la misma posición, tamaño y transformación.
- La pupila se quita de la capa del cuerpo para dibujarla en CSS y poder moverla.
- En el logo, el banner negro viene fundido con el contorno del burro. Para el `wordmark` se usan sus mismos tramos, cerrando recto el borde superior que en el logo tapa la laptop.

Las capas se cortan con una máscara horizontal en la base de las orejas (no con `clip-path`: el clip se aplica trazo por trazo y deja una línea visible en el borde suavizado).

`brand-src/mascota-insignia.webp` y `logo-completo.webp` son las exportaciones raster que se usaron antes de tener el vector. Ya no intervienen en nada.

## Reglas

No redibujar, recolorear ni deformar la mascota. Permitido: mover la pupila, inclinar las orejas, taparla en parte con un objeto y sumar accesorios externos (la vagoneta, los carteles de los planes).

En las ilustraciones de los planes el burro tiene brazos con pezuña y patas traseras, y en la vagoneta (recorrido de «Cómo trabajamos» y Burrow Runner) se agarra del borde con las pezuñas. Son piezas nuevas, dibujadas aparte con el trazo del logo, que se colocan junto al vector original sin modificarlo. Las pidió el dueño de la marca el 2026-10-02; no forman parte del logo.

## Correo

Los clientes de correo no corren CSS ni JavaScript: el burro animado de los correos es un **GIF** y el resto son PNG. Salen de las mismas capas del vector (`mascot-ears.svg`, `mascot-body.svg`, `manifest.json`) con `brand-src/build-email-assets.mjs`, sin redibujar nada: las orejas giran alrededor de su pivote y la pupila se mueve, como en el sitio, pero cuadro a cuadro. Los usa la plantilla de `src/lib/email.ts` (`renderBrandEmail`) con URL absolutas a `NEXT_PUBLIC_SITE_URL/brand/email/…`.

```bash
pnpm brand:email
```

| Archivo (`public/brand/email/`) | Qué es |
|---|---|
| `burro.gif` | El burro en bucle: 1 cuadro en reposo (idéntico al logo, 0,9 s) + 10 cuadros de gesto (120 ms): orejas ±7° ida y vuelta, pupila que mira a un lado y vuelve. 520×806 (se muestra a 260), fondo blanco (los GIF no tienen alfa decente), 128 colores sin tramado, ~145 KB. |
| `logo.png` | Logo completo sobre blanco, 480 px (para mostrar a 240). No lo usa la plantilla hoy; queda para una cabecera grande. |
| `wordmark.png` | Banner «BURROW LABS», 440 px (se muestra a 220): la cabecera del correo. |
| `badge.png` | Insignia, 96 px (se muestra a 48): la firma del pie. |
| `instagram`, `linkedin`, `github`, `facebook`, `tiktok`, `x` (`.png`) | Iconos de redes, 56 px (se muestran a 28): glifos simples propios con trazo tinta sobre un círculo amarillo, no los logos registrados. |

Todos los PNG van al doble del tamaño en que se muestran, por las pantallas retina. Límites: Outlook de escritorio no anima los GIF (muestra el primer cuadro, por eso es el de reposo) ni respeta los bordes redondeados; el resto de clientes (Gmail, Apple Mail, Outlook web y móvil, Thunderbird) lo animan.

## Colores

Los tokens de `src/app/globals.css` son los valores exactos del vector: `#1671B1` azul del anillo y de «LABS» · `#174E74` azul marino del cielo · `#0F1921` noche (silueta de la ciudad) · `#080A09` negro del contorno · `#FCEA10` amarillo del contorno · `#EEDD28` amarillo del logo completo · `#C4C2C1` gris del burro · `#B7B6B2` gris del burro en el logo completo · `#699BBA` montañas · `#5E615E` gris de la laptop · `#EDEDED` fondo del lienzo.

Derivados (no están en el logo): `blue-600`, `blue-400`, `blue-200`, `navy-800` y `night-950`. Existen por contraste o por profundidad; ver [DESIGN.md](DESIGN.md).

El juego, la escena 3D y los accesorios dibujados (vagoneta, escenas de los planes) repiten estos valores como constantes, porque canvas y WebGL no leen variables CSS: si cambia un token, hay que cambiarlo también ahí.

## Portadas del Lab

Cada artículo tiene una portada de 1200×630 en `public/lab/covers/<slug>.png` (al doble de resolución): estrato «lab», categoría y minutos de lectura, el título, el wordmark y la insignia oficial, sin redibujar nada. Es la imagen para compartir del artículo (Open Graph) y, si no tiene una portada subida en el panel, la imagen de su `Article`. En la página no se muestra, porque repetiría el título del encabezado.

Para un artículo nuevo, con el sitio en desarrollo:

```bash
node scripts/shot.mjs /dev/cover/<slug> public/lab/covers/<slug>.png 1200 630 --dpr=2
```

Después se carga `/lab/covers/<slug>.png` en «SEO: imagen para compartir» del artículo (o en `ogImage` de `src/db/seed/posts.ts` si el artículo entra por el seed). `/dev/cover/<slug>` responde 404 en producción.

