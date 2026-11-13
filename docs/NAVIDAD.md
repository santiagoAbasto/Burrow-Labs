# Campaña de Navidad

Capa de temporada que viste el sitio y el panel sin tocar ninguna página. Se enciende y se apaga desde **Sitio → Campaña de Navidad** (`/admin/navidad`). **Nace apagada**: con un deploy no cambia nada hasta que alguien la encienda.

## Concepto

«Navidad en la madriguera»: la mina de noche, con luces. La identidad de Burrow Labs no se reemplaza: siguen los azules, el amarillo y la tinta; la temporada suma rojo y verde pino.

- **El burro no se redibuja** (ver [BRAND-ASSETS.md](BRAND-ASSETS.md)). El gorro, el trineo, los renos y el paisaje son accesorios externos, como la vagoneta.
- **El gorro** es un dibujo propio en estilo de caricatura de trazo grueso (la referencia la eligió el dueño): piel esponjosa color crema en la banda y el pompón, copa roja con degradado que sube en curva, colita que cae por la izquierda hasta el pompón y una ramita de acebo. Va puesto en **una sola oreja** del burro, la izquierda: la tapa entera y la otra queda a la vista. La banda apoya en la cabeza sin tapar el ojo, con una sombra de apoyo, y lleva el contorno del burro del logotipo (tinta y borde amarillo de sticker) para que se lea como parte de la ilustración y no como un recorte pegado. Lo lleva cada burro del sitio y del panel: lo monta `Mascot`.
- **Los textos son saludos**, no promociones. Nada dice descuento ni fecha de entrega.

## Piezas

| Pieza | Dónde | Interruptor |
| --- | --- | --- |
| Gorro en una oreja del burro | logotipo, hero, planes, boletín, panel, acceso | Personajes |
| Trineo: el burro oficial con dos renos | cielo del paisaje del pie, 404, saludo del Dashboard | Personajes |
| Reno que pasea y burro que salta al tocarlo | paisaje del pie | Personajes |
| Luces que parpadean por turnos | bajo el encabezado, menú del panel, acceso | Luces |
| Colgantes en los márgenes | pantallas de 1536 px o más | Luces |
| Paisaje con saludo (texto y enlace opcionales) | entre el contenido y el pie | siempre |
| Botones-reno: astas y veta de caramelo; secundario con marco de caramelo | todo el sitio y el panel | siempre |
| Campos con anillo de caramelo al enfocar | todo el sitio y el panel | siempre |
| Nieve (14 copos) | solo el sitio | Nieve (apagada por defecto) |
| Música | solo el sitio | Música (necesita la pista) |

Intensidades: **festiva** (el sitio por defecto) suma estrellas en los estratos oscuros y enlaces en rojo profundo; en el panel, el menú pasa al verde pino. **Discreta** (el panel por defecto) deja solo adornos y acentos. Éxito, peligro y aviso nunca cambian de color.

## Reglas de diseño (del dueño)

1. El contenido nunca se cubre con adornos. En celular, «Reducir efectos» no flota: va quieto en el paisaje del pie.
2. Las luces no cruzan el texto: arriba van completas; al bajar dejan libre la columna de 80rem y quedan en los márgenes (en pantallas sin margen, desaparecen).
3. El gorro se mide contra el vector, no a ojo: los porcentajes están comentados en `season.css`.
4. En pantallas táctiles no existe el hover: el burro salta al tocarlo y la veta de caramelo de los botones queda encendida.
5. Parpadeo lento: un ciclo cada 3,2 s, sin apagarse del todo. Sin destellos.
6. `prefers-reduced-motion`, el interruptor «Animaciones» y el botón «Reducir efectos» (se recuerda en el navegador) detienen todo.

## Arquitectura

```
site_settings.season ──► getSettings() ──► src/lib/season.ts ──► layout raíz: <html data-season="christmas" …>
                                              (única decisión)   └► SeasonProvider (cliente) ──► SeasonSlot ──► pieces.tsx + season.css
cookie de vista previa ──► /api/season (reloj del servidor + sesión del panel) ──┘
```

- **`src/lib/season.ts`** es el único lugar que decide si la campaña está activa y en qué superficie (`site` o `admin`). Modos: `off`, `manual` y `scheduled`, con inicio inclusivo y fin exclusivo en hora de Bolivia (UTC−4), contra el reloj del servidor. Sin cron.
- **`src/app/layout.tsx`** escribe `data-season`, `data-season-surface` y `data-season-intensity` en `<html>`. Como las páginas son estáticas y no saben en qué ruta se sirven, llegan con los atributos del sitio; un script mínimo (solo con la campaña encendida, insertado con `useServerInsertedHTML`) los cambia antes del primer pintado en el panel y en las rutas que no se visten (`/api`, `/dev`, `/ficha`, `/media`).
- **Todo el estilo cuelga de `html[data-season="christmas"]`** (`src/components/season/season.css`). Esa hoja y las piezas (`pieces.tsx`) son un archivo aparte que solo se descarga con la campaña encendida: los pide `SeasonSlot`. Apagada, el único costo es `provider.tsx`.
- **Modo programado:** el HTML se regenera cada 5 minutos como el resto del contenido; para la hora exacta, el script consulta `/api/season` (solo en modo programado o con vista previa abierta).
- **Vista previa:** los ajustes van en una cookie `httpOnly` de quien administra, no en la base. `/api/season` solo la respeta si la petición trae una sesión del panel válida. No hay parámetro de URL. Dura dos horas o hasta guardar.
- **Puntos de montaje** (los únicos archivos del sitio que conocen la campaña): `Mascot` (gorro), `Header` (luces), el layout del sitio (paisaje, colgantes, controles), `not-found`, `AdminShell`, `Dashboard` y `LoginScreen`.

## Música

- **Nunca canciones con derechos de autor**, ni la grabación ni una recreación nota por nota. Solo una pista propia o libre de regalías.
- La pista va en `public/audio/navidad.mp3` (recodificada a ~112 kbps, sin metadatos). **Hoy no existe**: sin el archivo no hay botón ni se descarga nada, aunque el interruptor esté encendido. Subirla pide un deploy.
- Un `<audio>` único fuera de React (`src/components/season/music.ts`): en bucle, volumen 0,3, arranca con el primer gesto, no se descarga hasta que va a sonar, se calla al ocultar la pestaña y cada visitante la apaga con un botón fijo que recuerda la elección.

Prompt para generar la pista con Lyria:

```
Prompt: Warm instrumental holiday track for a small software studio from the Andes. Mid-tempo 96 BPM, 4/4, key of D major. Lead melody on charango and soft zampoña (pan flute), supported by nylon guitar, upright bass, light brushed drums and gentle sleigh bells. Subtle analog synth pad and a few playful 8-bit chiptune blips as a nod to coding. Cozy, optimistic, clever, a little mischievous. Original melody, simple and hummable. Clean mix, soft dynamics, suitable as low-volume website background. Seamless loop: the last bar resolves into the first, no fade in, no fade out, no intro, no ending. Length about 2 minutes.

Negative prompt: vocals, lyrics, choir, spoken words, existing Christmas carols or recognizable melodies, jingle bells melody, orchestral bombast, heavy drums, distortion, EDM drops, sudden volume changes, long silence, fade out, applause, sound effects.
```

Para recodificarla: `ffmpeg -i pista.wav -map_metadata -1 -codec:a libmp3lame -b:a 112k public/audio/navidad.mp3`.

## Verificación (13/11/2026)

- **Pruebas:** `src/lib/season.test.ts` (22: fechas límite, hora de Bolivia, superficies, vista previa, validación) y `src/lib/admin/season-actions.test.ts` (6: permisos, vista previa aislada, validación, caché). Suite completa: 208, en verde.
- **Navegador (Chrome), campaña encendida y apagada**, a 1366, 1600 y 375 px:
  - Sin desborde horizontal y sin errores de consola.
  - Tras 8 navegaciones seguidas no se acumulan adornos (una sola guirnalda, un paisaje, un juego de controles).
  - «Reducir efectos» deja 0 animaciones de la campaña y se recuerda al recargar.
  - Apagada: 0 elementos, 0 reglas de la campaña cargadas, sin script de arranque y sin pedido a `/api/season`. Las capturas coinciden con las de antes del cambio.
  - Vista previa: la ve quien tiene sesión del panel; un visitante anónimo no, ni copiando las cookies de vista previa.
- **Peso** (build de producción, gzip): hoja de la campaña 3,8 KB, piezas 9,4 KB, música 0,7 KB. Con la campaña apagada, el HTML del inicio no enlaza la hoja.
- **Contraste** (WCAG, medido): enlace rojo profundo `#9c1c1c` 6,9:1 sobre paper y 8,1:1 sobre blanco; saludo blanco sobre el cielo 11,5:1; rótulo amarillo 9,3:1; blanco sobre verde pino 9,2:1; selección blanco sobre rojo 5,0:1. Todos pasan AA.

### No comprobado

- **Sonido:** no hay pista todavía; el reproductor está probado solo por código (viene del de Apple Boss).
- **Toque real** en un teléfono: se probó con la emulación táctil de Chrome.
- **Safari y Firefox:** no se abrieron. La máscara de las luces lleva prefijo `-webkit-`; `rotate`/`translate` como propiedades sueltas piden Safari 14.1 o Firefox 72.
- **Rendimiento en un equipo lento:** con todo encendido hay unas 150 animaciones CSS de `opacity`/`transform` a la vez; no se midió el LCP con la campaña encendida.
