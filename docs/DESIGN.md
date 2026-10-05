# Burrow Labs — Dirección de arte y design system

Fuente de verdad visual: los logos oficiales en `public/brand/`. Todo color sale de ahí.

## 1. Concepto: «El descenso»

MADRIGUERA → LABORATORIO → CÓDIGO → SISTEMA → CRECIMIENTO.

El sitio **se recorre hacia abajo como una excavación**. Arriba está la superficie (clara, color papel del logo), donde se ven los problemas visibles: Excel, mensajes, papeles. Cada sección es un **estrato** más profundo y más oscuro, hasta el laboratorio (casi negro) y la roca madre (footer). Subir es «volver a la superficie».

Tres elementos propios, que ninguna plantilla tiene:

1. **Estratos.** El fondo cambia por capas geológicas, no por «secciones alternadas». La unión entre estratos es un **corte de terreno** (línea SVG irregular, 1 sola forma reutilizable con variantes), a veces con un detalle enterrado (`{ }`, un cable, un `ERROR 500` fósil). Sobrio: máximo un detalle por corte.
2. **La veta.** Una línea amarilla continua (el amarillo del contorno del logo) que baja por la página conectando secciones: es túnel, cable y recorrido. Se dibuja con el scroll. En «Proceso» el burro la recorre.
3. **El profundímetro.** Indicador fijo (desktop ≥1280) con el nombre del estrato actual y la profundidad en metros; es navegación real (lista de anclas accesible), en tipografía mono.

Balance: layout sobrio y editorial (aire, tipografía fuerte, grilla precisa) + **lenguaje sticker del logo** solo en la mascota y en 2–3 piezas clave. No es neo-brutalismo ni caricatura.

## 2. Color (extraído del logo)

Primitivos:

| Token | Hex | Origen en el logo |
|---|---|---|
| `blue-600` | `#156EAD` | derivado: `blue-500` apenas oscurecido, para enlaces sobre `paper` (AA) |
| `blue-500` | `#1671B1` | anillo exterior, «LABS» |
| `blue-400` | `#3E93CF` | brillo de la capucha (derivado para texto sobre oscuro) |
| `blue-300` | `#699BBA` | montañas |
| `blue-200` | `#AEC6D4` | nieve / brillos |
| `navy-700` | `#174E74` | círculo interior |
| `navy-800` | `#123C5A` | banda interior (oscurecido) |
| `night-900` | `#0F1921` | silueta de la ciudad |
| `night-950` | `#080D12` | derivado para roca madre |
| `ink` | `#080a09` | negro de trazos y banner |
| `paper` | `#EDEDED` | fondo del logo |
| `white` | `#FFFFFF` | anillo blanco |
| `yellow-400` | `#FCEA10` | contorno sticker |
| `yellow-500` | `#EEDD28` | contorno (logo completo), hover |
| `donkey-300` | `#C4C2C1` | cuerpo del burro |
| `donkey-400` | `#B7B6B2` | cuerpo (logo completo) |
| `steel-600` | `#5E615E` | laptop |

Semánticos por estrato (cada estrato define las mismas variables; los componentes solo usan las semánticas):

| Estrato | `--bg` | `--fg` | `--muted` | `--line` | `--accent` | `--accent-fg` | `--link` |
|---|---|---|---|---|---|---|---|
| `surface` | `#EDEDED` | `#080a09` | `#4A4F52` | `#080a0926` | `#080a09` | `#FFFFFF` | `#156EAD` |
| `chalk` (lectura) | `#FFFFFF` | `#080a09` | `#4A4F52` | `#080a0920` | `#080a09` | `#FFFFFF` | `#156EAD` |
| `topsoil` | `#1671B1` | `#FFFFFF` | `#DCEBF5` | `#FFFFFF40` | `#FCEA10` | `#080a09` | `#FFFFFF` |
| `deep` | `#174E74` | `#FFFFFF` | `#C5D8E4` | `#FFFFFF2E` | `#FCEA10` | `#080a09` | `#AEC6D4` |
| `lab` | `#0F1921` | `#F2F5F7` | `#9FB3C1` | `#FFFFFF24` | `#FCEA10` | `#080a09` | `#3E93CF`→usar `#7DB9E6` en texto chico |
| `bedrock` | `#080D12` | `#F2F5F7` | `#8FA3B1` | `#FFFFFF1F` | `#FCEA10` | `#080a09` | `#7DB9E6` |

Reglas:
- **Amarillo = acento, nunca fondo de sección.** Se usa en: CTA primario sobre estratos oscuros, la veta, foco, estado activo, contorno sticker. En `surface`/`chalk` el CTA primario es **negro** (como el banner del logo) y el amarillo solo aparece como subrayado/veta.
- `#1671B1` no se usa para texto chico sobre `lab`/`bedrock` (contraste 3.4:1): usar `--link`.
- Contraste mínimo AA (4.5:1 texto, 3:1 UI) verificado por estrato.
- Nada de gradientes decorativos. Único degradado permitido: transición vertical entre dos estratos contiguos y la niebla de profundidad del 3D.
- Sin glow, sin glassmorphism, sin blobs, sin morado.

## 3. Tipografía

- **Display y texto: Archivo** (variable, ejes `wght` 100–900 y `wdth` 62–125). Una sola familia.
  - Titulares: `wght 800–900`, `wdth 112–125`, MAYÚSCULAS, tracking −0.02em, interlineado 0.92–1.0. Remite al wordmark del logo.
  - Subtítulos: `wght 600`, `wdth 100`, caja normal.
  - Cuerpo: `wght 400–450`, `wdth 100`, 17–18px, interlineado 1.6, ancho máx. 68ch.
- **Mono: JetBrains Mono** para eyebrows, profundímetro, etiquetas de datos, fragmentos de código y números de paso.
- Escala fluida con `clamp()`: `display` 2.75→7rem · `h1` 2.25→4.5rem · `h2` 1.75→3.25rem · `h3` 1.25→1.75rem · `body` 1.0625→1.125rem · `small` 0.875rem · `mono-xs` 0.75rem con tracking 0.08em en mayúsculas.
- Nunca más de 3 líneas en un titular display; `text-wrap: balance` en titulares y `pretty` en párrafos.

## 4. Espacio, forma, borde

- Grilla de 12 columnas, contenedor máx. 1280px (1440 en secciones full-bleed), gutter 24px (16px en mobile).
- Ritmo vertical de sección: `clamp(5rem, 12vw, 10rem)`.
- Radios: `sm 6px` · `md 12px` · `lg 20px` · `pill 999px`. Paneles grandes `lg`; controles `md`.
- Bordes de 1px con `--line`. Nada de sombras difusas grandes; profundidad con capas y borde.
- **Sticker** (solo mascota, sello «Built in Bolivia», insignias del juego y tarjeta destacada de planes): trazo negro 3px + anillo amarillo 5px desplazado. Clase utilitaria `.sticker`.
- Tarjetas: prohibido repetir 6 tarjetas idénticas. Cada lista tiene una composición propia (índice editorial, panel con pestañas, filas, bento asimétrico, tabla).

## 5. Mascota

- Se usa **el asset original**, en capas separadas del vector oficial (SVG, nítido a cualquier tamaño): `badge` (insignia completa), `mascot` (burro recortado por su contorno amarillo), `ears` y `pupil` para microanimación.
- Permitido: mover pupila (sigue al cursor, ±6px), inclinar orejas ≤4°, entrar/salir de cuadro, sentarlo en una **vagoneta de mina** (accesorio externo dibujado aparte) para el juego y para el recorrido del proceso.
- Prohibido: redibujar, recolorear, deformar, cambiar proporciones, generar poses nuevas con IA.
- Apariciones (medidas): header (logo), hero (final del descenso), proceso (vagoneta), planes (escenas con pezuñas), juego, 404, WhatsApp flotante, newsletter (agarrado del campo, en el pie y en /lab), footer. No en cada sección.

## 6. Motion system

Tokens (CSS y TS, mismos valores):

| Token | Duración | Uso |
|---|---|---|
| `motion.fast` | 140ms | hover, foco, presión |
| `motion.normal` | 280ms | entradas, tooltips, acordeones |
| `motion.slow` | 600ms | transiciones de panel, revelados grandes |

Easings: `ease-out` `cubic-bezier(0.22, 1, 0.36, 1)` (entradas) · `ease-in-out` `cubic-bezier(0.65, 0, 0.35, 1)` (movimientos) · `spring` (Motion: stiffness 420, damping 34) para feedback físico.

Reglas:
- Cada animación dirige atención, explica, da feedback o cuenta la historia. Si no hace una de las cuatro, se quita.
- **No** hay una animación de entrada genérica aplicada a todas las secciones. Cada sección tiene un único gesto propio (ej.: problema = los nodos se conectan; proceso = la vagoneta avanza; planes = nada, es contenido de decisión).
- Solo `transform` y `opacity`. Nada que provoque layout shift.
- `prefers-reduced-motion`: sin scroll-scrub, sin parallax, sin 3D animado; estados finales visibles de entrada.
- Reparto: CSS (hover/estados) · Motion (micro, entradas, layout) · GSAP ScrollTrigger (solo hero y línea de proceso) · R3F (solo hero).

## 7. Hero 3D — «la madriguera»

- **Composición:** corte transversal. Arriba, la superficie clara con el desorden (hojas de cálculo, burbujas de mensaje, papeles, tareas repetidas, sistemas sueltos) como piezas low-poly planas en los colores del logo. Un agujero baja.
- **Scroll (GSAP, sección fijada ~300vh en desktop):** la cámara desciende por el túnel; las piezas caen, se ordenan y se transforman en nodos de datos, llaves `{ }` de API, engranajes de automatización, paneles de dashboard y un núcleo de IA, conectados por la veta amarilla. Fondo: de `paper` a `navy` a `night` con niebla de profundidad.
- **Final:** cámara de laboratorio con la mascota (sprite del asset original) frente a su laptop y el cierre «BURROW LABS — CODIFICANDO SOLUCIONES.».
- **Texto siempre en HTML** sobre el canvas (accesible, nítido, LCP). Nada de fuentes remotas para texto 3D.
- **Rendimiento:** carga diferida tras el primer render; geometrías instanciadas; sin sombras dinámicas ni postprocesado pesado; DPR máx. 1.75; se pausa fuera de viewport y con la pestaña oculta.
- **Mobile:** escena reducida (menos piezas, DPR 1.25, sin pin largo: descenso corto).
- **Fallback** (sin WebGL, hardware limitado, `saveData`, reduced motion): ilustración estática SVG/CSS del mismo corte transversal. El hero se entiende igual.

## 8. Home, sección por sección

| # | Sección | Estrato | Gesto propio |
|---|---|---|---|
| A | Hero | `surface` → baja a `lab` | Descenso 3D |
| B | Social proof / sectores | `surface` | Fila tipográfica, sin carrusel infinito |
| C | Problema | `surface` → corte → `topsoil` | Nodos sueltos (antes) que se conectan en un flujo (después) |
| D | Servicios | `deep` | Índice editorial: lista grande a la izquierda, panel de detalle que cambia a la derecha (en mobile, acordeón) |
| E | Cómo trabajamos | `deep` → `lab` | Túnel con 6 estaciones; la vagoneta con el burro avanza con el scroll |
| F | Proyectos | `lab` | Casos en filas grandes asimétricas (se oculta si no hay publicados) |
| G | Confianza | `lab` | Lista técnica tipo checklist de despliegue, mono, sin iconos de colores |
| H | Calculadora | `chalk` (una «hoja» que emerge) | Los números cuentan al cambiar los controles |
| I | Planes | `chalk` | Dos pestañas (Web / Sistemas); tabla clara, plan destacado con sticker |
| J | Burrow Runner | `bedrock` | Pantalla de arcade; carga al pulsar |
| K | FAQ | `lab` | Acordeón sobrio |
| L | CTA final | `topsoil` | Frase grande + un solo botón |
| M | Footer | `bedrock` | «Volver a la superficie» |

Frases de marca: una por transición, como rótulo mono entre estratos. Nunca juntas.

## 9. UI kit (`src/components/ui`)

Button (primary / secondary / ghost / link; tamaños md / lg; estados hover, active, focus-visible, disabled, loading) · Badge · SectionHeading (eyebrow mono + título + bajada) · Input · Textarea · Select (nativo estilizado) · Checkbox · Modal (`<dialog>`) · Drawer (`<dialog>`) · Tooltip · Accordion (`<details>`) · Tabs · Metric · LogoCloud · Timeline · AnimatedCode · ProcessNode · ServiceCard · ProjectCard · PlanCard · Testimonial · FAQ · CTA.

- Objetivo táctil mínimo 44×44px. Foco visible: anillo amarillo 2px + offset 2px (negro sobre estratos claros).
- Elementos nativos antes que JS (`<dialog>`, `<details>`, `<select>`).
- Sin cursor personalizado.

## 10. Lo que no se hace

Gradientes al azar · glow · glassmorphism · blobs · morado · seis tarjetas iguales · emojis como iconos · ilustraciones stock · la misma animación de entrada en todo · titulares gigantes sin función · scroll que marea · burro genérico.
