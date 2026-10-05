# Burrow Labs — UI kit

Implementación de [DESIGN.md](DESIGN.md). Vitrina viva: `/dev/ui` (solo en desarrollo; `noindex` y 404 en producción).

- Tokens y base: `src/app/globals.css`
- Estilo de los componentes: `src/components/ui/ui.css` (se importa en `@layer components`)
- Componentes: `src/components/ui/*.tsx` — se importan por archivo (`@/components/ui/button`). No hay barril `index.ts` a propósito: importar un barril desde un server component arrastraría los componentes cliente al bundle de la página.
- Motion: `src/lib/motion.ts` · Clases: `src/lib/cn.ts`

## 1. Reglas de uso

1. **Solo variables semánticas** en componentes: `--bg --panel --fg --muted --line --line-strong --accent --accent-fg --link --focus`. Nunca un hex ni un primitivo (`bg-blue-500`) para pintar UI: deja de funcionar al cambiar de estrato. Excepciones, ya encapsuladas en el kit: la veta, el sticker y la placa de error usan `yellow-400` + `ink` fijos.
2. **Sobrescribir**: el estilo base vive en `@layer components`, así que cualquier utilidad de Tailwind en `className` gana (`<Button className="w-full">`). `cn()` solo une clases, no resuelve conflictos entre utilidades.
3. La paleta por defecto de Tailwind está **borrada** (`--color-*: initial`): `bg-zinc-100`, `text-black` o `bg-purple-500` no existen. Negro es `ink`.
4. **Amarillo = acento, nunca fondo de sección.** Aparece en: botón primario sobre estratos oscuros, foco sobre estratos oscuros, estado activo (pestaña, paso), `veta-dot`, placa de error, sticker. En `surface` / `chalk` el primario es negro y el amarillo solo aparece como la veta que se enciende al pasar el cursor.
5. **Sticker**: solo mascota, sello «Built in Bolivia», insignias del juego y la tarjeta destacada de planes. Una tarjeta cualquiera no lleva sticker.
6. **No hay rojo en la paleta.** El error se señala con la placa de mina (triángulo negro sobre amarillo) + texto en negrita + borde reforzado del control. No depende del color.
7. Lightning CSS (el compilador de CSS de Next) **descarta `translate` si en la misma regla hay `transform`**. Poner todo el desplazamiento en `transform`.

## 2. Tokens

### Color — primitivos (`bg-*`, `text-*`, `border-*`)

`blue-600 #156EAD` · `blue-500 #1671B1` · `blue-400 #3E93CF` · `blue-300 #699BBA` · `blue-200 #AEC6D4` · `navy-700 #174E74` · `navy-800 #123C5A` · `night-900 #0F1921` · `night-950 #080D12` · `ink #080a09` · `paper #EDEDED` · `white #FFFFFF` · `yellow-400 #FCEA10` · `yellow-500 #EEDD28` · `donkey-300 #C4C2C1` · `donkey-400 #B7B6B2` · `steel-600 #5E615E`

Para ilustración, 3D y marca. No para UI.

### Color — semánticos por estrato

Utilidades: `bg-bg` `bg-panel` `text-fg` `text-muted` `border-line` `border-line-strong` `bg-accent` `text-accent-fg` `text-link` `outline-focus` (y cualquier combinación: `border-fg`, `bg-fg`, `text-bg`…).

| Estrato | `--bg` | `--panel` | `--fg` | `--muted` | `--line` | `--line-strong` | `--accent` / `--accent-fg` | `--link` | `--focus` |
|---|---|---|---|---|---|---|---|---|---|
| `surface` | paper | white | ink | `#4A4F52` | ink 15% | ink 55% | ink / white | blue-500 | ink |
| `chalk` | white | paper | ink | `#4A4F52` | ink 12.5% | ink 55% | ink / white | blue-500 | ink |
| `topsoil` | blue-500 | navy-700 | white | `#E9F2F8` | white 25% | white 70% | yellow-400 / ink | white | yellow-400 |
| `deep` | navy-700 | navy-800 | white | `#C5D8E4` | white 18% | white 55% | yellow-400 / ink | blue-200 | yellow-400 |
| `lab` | night-900 | night-950 | `#F2F5F7` | `#9FB3C1` | white 14% | white 40% | yellow-400 / ink | `#7DB9E6` | yellow-400 |
| `bedrock` | night-950 | night-900 | `#F2F5F7` | `#8FA3B1` | white 12% | white 40% | yellow-400 / ink | `#7DB9E6` | yellow-400 |

Variables añadidas a las de DESIGN.md §2:

- `--panel`: superficie contigua para tarjetas, campos y pozos. Siempre es el primitivo vecino (blanco sobre papel, `navy-800` sobre `navy-700`…).
- `--line-strong`: borde de controles e iconos que deben verse (≥3:1). `--line` es solo decorativo (divisores).
- `--focus`: color del anillo de foco. `--accent-hover` / `--accent-mark`: hover del botón primario.
- Además cada estrato fija `color-scheme` (los `<select>` nativos y las barras de scroll salen claros u oscuros).

**Cambio respecto de DESIGN.md:** `--muted` de `topsoil` pasó de `#DCEBF5` (4.33:1, no llegaba a AA) a `#E9F2F8` (4.65:1).

### Radios, espacio, contenedor

`rounded-sm` 6px · `rounded-md` 12px (controles) · `rounded-lg` 20px (paneles) · `rounded-pill`.
`max-w-site` 1280px · `max-w-wide` 1440px · `px-gutter` 16→24px · `py-section` `clamp(5rem, 12vw, 10rem)`.

### Tipografía

Archivo variable (`wght` 100–900, `wdth` 62–125) y JetBrains Mono, con `next/font/google` (`display: swap`, fallback de métricas ajustadas). `font-sans` / `font-mono`.

| Utilidad | Tamaño | Estilo |
|---|---|---|
| `type-display` | 2.125 → 7rem | 900, MAYÚSCULAS, ancho `--wdth-display`, interlineado 0.94, tracking −0.02em |
| `type-h1` | 1.69 → 4.5rem | 900, MAYÚSCULAS, ancho `--wdth-display`, 0.96 |
| `type-h2` | 1.75 → 3.25rem | 800, MAYÚSCULAS, ancho `--wdth-display`, 1.0 |
| `type-h3` | 1.25 → 1.75rem | 600, caja normal, ancho 100 (subtítulos) |
| `type-lead` | 1.125 → 1.375rem | bajada, `--muted`, máx. 60ch |
| `type-body` | 1.0625 → 1.125rem | 1.6, máx. 68ch |
| `type-small` | 0.875rem | notas, ayudas |
| `type-mono` | 0.75rem | JetBrains Mono, MAYÚSCULAS, tracking 0.08em |

También existen como tamaño suelto: `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-lead`, `text-body`, `text-small`, `text-mono-xs`.

`--wdth-display` (eje `wdth` de los titulares): 106% en mobile → 112% desde 640px → 125% desde 1024px.

**Cambio respecto de DESIGN.md:** el mínimo de `display` (2.75rem) y `h1` (2.25rem) no entra en pantallas chicas con una palabra larga en mayúsculas: «CODIFICANDO» a 2.75rem mide 382px y en 375px hay 343. Por debajo de ~450px los dos tamaños bajan con el ancho (`min(11.2vw, …)` y `min(8.6vw, …)`) y los titulares usan `wdth` 106. Verificado en navegador a 320px: «CODIFICANDO» (`display`) y «AUTOMATIZAMOS» (`h1`) entran en una línea; «AUTOMATIZACIÓN» en `h1` entra por cálculo (286 de 288px). Desde 450px la escala es la de DESIGN.md. Los tres titulares llevan `overflow-wrap: break-word` como último recurso.

Los titulares usan `text-wrap: balance`; párrafos y listas, `pretty`. Máximo 3 líneas en un titular display: si hace falta, forzar el corte con `<br className="max-sm:hidden" />`.

### Motion

| CSS | TS (`@/lib/motion`) | Valor |
|---|---|---|
| `--motion-fast` · `duration-fast` | `motion.fast` / `motionMs.fast` | 140ms |
| `--motion-normal` · `duration-normal` | `motion.normal` / `motionMs.normal` | 280ms |
| `--motion-slow` · `duration-slow` | `motion.slow` / `motionMs.slow` | 600ms |
| `--ease-out` · `ease-out` | `ease.out` / `ease.css.out` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| `--ease-in-out` · `ease-in-out` | `ease.inOut` / `ease.css.inOut` | `cubic-bezier(0.65, 0, 0.35, 1)` |
| — | `spring` | `{ type: "spring", stiffness: 420, damping: 34 }` |

`motion` y `motionMs`: segundos (Motion, GSAP) y milisegundos. `transition.fast | normal | slow`: objetos listos para `transition={…}` de Motion. `REDUCED_MOTION_QUERY` para `matchMedia` / `gsap.matchMedia`. `motionConfig` para `<MotionConfig {...motionConfig}>` (`reducedMotion: "user"`). En componentes cliente el hook es `useReducedMotion` de `motion/react`. `motion.ts` no importa nada: se puede usar desde server components.

`prefers-reduced-motion: reduce` anula globalmente la duración de transiciones y animaciones CSS. Las animaciones por JS (Motion, GSAP, R3F) deben respetarlo por su cuenta.

### Base

Foco visible: anillo de 2px + offset 2px en `--focus`. Selección de texto en `--accent`. Scrollbar fina del color del texto. `scroll-padding-top: 5rem` para anclas bajo un header fijo. Un `<dialog>` modal abierto bloquea el scroll del documento.

## 3. Contraste (WCAG 2.x, calculado)

Mínimos: 4.5:1 texto · 3:1 UI. Cada par se calculó sobre `--bg` y sobre `--panel`.

| Estrato | fg/bg | muted/bg | link/bg | fg/panel | muted/panel | link/panel | accent-fg/accent | accent/bg | focus/bg | line-strong/bg · /panel |
|---|---|---|---|---|---|---|---|---|---|---|
| `surface` | 16.96 | 7.09 | 4.64 | 19.85 | 8.30 | 5.43 | 19.85 | 16.96 | 16.96 | 4.22 · 4.40 |
| `chalk` | 19.85 | 8.30 | 5.43 | 16.96 | 7.09 | 4.64 | 19.85 | 19.85 | 19.85 | 4.40 · 4.22 |
| `topsoil` | 5.21 | 4.59 | 5.21 | 8.83 | 7.79 | 8.83 | 15.99 | 4.20 | 4.20 | 3.40 · 5.27 |
| `deep` | 8.83 | 6.02 | 4.97 | 11.54 | 7.87 | 6.50 | 15.99 | 7.11 | 7.11 | 3.87 · 4.65 |
| `lab` | 16.24 | 8.20 | 8.43 | 17.81 | 9.00 | 9.25 | 15.99 | 14.32 | 14.32 | 3.81 · 3.79 |
| `bedrock` | 17.81 | 7.47 | 9.25 | 16.24 | 6.81 | 8.43 | 15.99 | 15.71 | 15.71 | 3.79 · 3.81 |

Notas:

- `blue-500` sobre `paper` da 4.45:1 y no llega a AA para texto chico: por eso `--link` en `surface` y `chalk` es `blue-600` (`#156EAD`, 4.64:1). `blue-500` queda para fondos, bordes y gráficos.
- `blue-500` sobre `lab` da 3.41:1 y `blue-400` 5.32:1: en `lab` / `bedrock` el texto azul es siempre `--link` (`#7DB9E6`).
- Texto blanco sobre `topsoil` da 5.21:1; es el estrato con menos margen. No poner texto sobre un `topsoil` aclarado.
- `yellow-400` sobre `paper` da 1.06:1: el amarillo nunca es texto ni trazo suelto sobre estratos claros; siempre va con el borde negro (`veta-dot`, `hazard`, sticker).
- `--line` (1.3–1.6:1) es decorativo. Un borde que comunica algo usa `--line-strong`.
- Botón deshabilitado: exento de contraste por norma; se apaga hacia el estrato, sin opacidad.

## 4. Componentes

Todos aceptan `className`. «Nativo» = además recibe los atributos del elemento HTML indicado.

### Estructura

**`Container`** — `@/components/ui/stratum` · nativo `div`
`wide?: boolean` (1440px en lugar de 1280px).

**`Stratum`** — `@/components/ui/stratum` · nativo `section`
Envuelve una sección y fija su estrato: pinta `--bg` / `--fg` y redefine todas las variables.
`tone: Tone` · `as?: "section" | "div" | "header" | "footer" | "main" | "article" | "aside"` · `id?` · `depth?: number` → `data-depth` · `label?: string` → `data-stratum-label` (ambos para el profundímetro) · `flush?: boolean` (sin `py-section`).
También exporta `TONES` y el tipo `Tone = "surface" | "chalk" | "topsoil" | "deep" | "lab" | "bedrock"`.
Sin componente: cualquier elemento con `data-stratum="lab"` se comporta igual (una tarjeta, un panel).

**`TerrainCut`** — `@/components/ui/terrain-cut`
Corte de terreno entre dos estratos. Decorativo (`aria-hidden`). Se coloca entre dos `Stratum`.
`from: Tone` · `to: Tone` · `variant?: "ridge" | "shelf" | "fault"` · `flip?: boolean` · `detail?: "braces" | "error" | "cable"` (`{ }`, `ERROR 500`, un tramo de cable) · `detailAt?: number` (% horizontal, 72 por defecto).
El detalle queda enterrado justo debajo del corte, sobre el padding superior del estrato siguiente: ese estrato no debe ser `flush`. Máximo un detalle por corte y no en todos.

**`Sticker`** — `@/components/ui/sticker` · nativo `div`
`as?: "div" | "span" | "article" | "li" | "figure"` · `tone?: Tone` (estrato del interior) · `tilt?: "left" | "right"` (2°). El anillo amarillo ocupa 5px por fuera: el componente ya trae ese margen. Clase suelta: `.sticker`.

**`SectionHeading`** — `@/components/ui/section-heading`
`title: ReactNode` · `eyebrow?: ReactNode` (rótulo mono con `veta-dot`) · `children?` (bajada) · `as?: "h1" | "h2" | "h3"` · `size?: "display" | "h1" | "h2"` · `align?: "start" | "center"` · `id?` (del titular, para `aria-labelledby`).

**`BrandPhrase`** — `@/components/ui/section-heading`
Rótulo mono entre estratos, sobre una línea. `children` (la frase) · `mark?: string` (p. ej. «−12 m»). Una por transición.

**`CTA`** — `@/components/ui/cta`
Banda completa (incluye su `Stratum` y `Container`). `title: ReactNode` · `lead?` · `action: { label, href }` · `secondary?: { label, href }` · `tone?: Tone` (`topsoil`) · `id?` · `headingId?`.

### Acciones

**`Button`** — `@/components/ui/button`
`variant?: "primary" | "secondary" | "ghost" | "link"` · `size?: "md" | "lg"` (44 / 56px) · `loading?: boolean` · `icon?: ReactNode` (al final) · `disabled?`.
Con `href` es un enlace (`<Link>` interno, `<a>` externo en pestaña nueva con `rel="noopener noreferrer"`); sin `href` es `<button type="button">` — **para enviar un formulario hay que pasar `type="submit"`**.
Estados: hover (primario: veta amarilla en claros, `yellow-500` en oscuros; secundario: se invierte; flecha +3px), active (`scale(0.97)`), focus-visible, disabled, loading (cursor de terminal, `aria-busy`, bloqueado; un enlace en `loading` o `disabled` se renderiza como `<span role="link" aria-disabled>`).

**`SmartLink`** — `@/components/ui/smart-link` · nativo `a`
`href: string`. `<Link>` para rutas internas; `<a>` para `#ancla`, `mailto:`, `tel:` y externos (pestaña nueva + rel seguro).

**`Badge`** — `@/components/ui/badge` · nativo `span`
`variant?: "outline" | "solid" | "accent"` · `dot?: boolean` (antepone `veta-dot`).

### Formularios — `@/components/ui/form`

**`Field`** — `label: ReactNode` · `hint?` · `error?` · `required?` · `children`: un solo control.
Inyecta en el control `id`, `required`, `aria-describedby` (ayuda + error) y `aria-invalid`. Los campos no obligatorios muestran «(opcional)».

**`Input`** · **`Textarea`** · **`Select`** — nativos `input` / `textarea` / `select` (los `<option>` van como children). 48px de alto, 16px de texto (iOS no hace zoom).

**`Checkbox`** — nativo `input` · `children` (texto del label, admite enlaces) · `error?`. Trae su propio label: no va dentro de `Field`.

```tsx
<Field label="Email" required error={errors.email}>
  <Input name="email" type="email" autoComplete="email" />
</Field>
<Checkbox name="consent" required>Acepto que me contacten.</Checkbox>
```

### Superposiciones

**`Modal`** / **`Drawer`** — `@/components/ui/dialog` (cliente)
Sobre `<dialog>` + `showModal()`: foco atrapado, Esc, telón, foco devuelto al disparador. También cierran con la X y con clic en el telón.
`title: ReactNode` · `description?` · `children` · `trigger?: ReactNode` (el botón que abre; puede venir de un server component) · `open?` + `onOpenChange?` (modo controlado, sin `trigger`) · `tone?: Tone` (Modal `chalk`, Drawer `lab`) · Drawer: `side?: "right" | "left"`.
Al abrir, el foco va al primer elemento enfocable (la X); para llevarlo a un campo, ponerle `autoFocus`.

```tsx
<Modal trigger={<Button>Abrir</Button>} title="Diagnóstico express">…</Modal>
```

**`Tooltip`** — `@/components/ui/tooltip` (cliente)
`label: ReactNode` · `children`: un elemento enfocable · `side?: "top" | "bottom"` · `align?: "center" | "start" | "end"`.
Aparece con hover (250ms de espera) y con foco de teclado; Esc lo cierra sin mover el foco; se corrige en horizontal para no salir de la pantalla. No cambia de lado solo. No es para contenido imprescindible ni interactivo.

### Contenido

**`Accordion`** + **`AccordionItem`** — `@/components/ui/accordion`
`<details>` nativo. `AccordionItem`: `title: ReactNode` · `children` · `name?: string` (el mismo `name` en varios items = solo uno abierto) · `defaultOpen?`.

**`Tabs`** — `@/components/ui/tabs` (cliente)
`tabs: { id, label, content }[]` · `label: string` (nombre accesible) · `defaultId?` · `onChange?`.
← → Inicio Fin mueven y activan. Todos los paneles están en el HTML (los inactivos con `hidden`). La lista hace scroll horizontal si no entra.

**`Metric`** — `@/components/ui/metric`
`value: ReactNode` · `unit?: string` · `label: ReactNode` · `note?`. Solo datos reales.

**`LogoCloud`** — `@/components/ui/logo-cloud`
`items: { name, href?, logo?: { src, width, height } }[]` · `label: string`. Sin `logo` se muestra el nombre en tipografía (sectores). Fila estática.

**`Timeline`** — `@/components/ui/timeline`
`items: { meta?, title, body? }[]`. Lista ordenada sobre la veta.

**`ProcessNode`** — `@/components/ui/process-node`
`step: number` · `title: string` · `children?` · `state?: "idle" | "active" | "done"`. Es un `<li>`: va dentro de un `<ol>`.

**`AnimatedCode`** — `@/components/ui/animated-code` (cliente)
`lines: { text, kind?: "cmd" | "out" | "ok" }[]` · `title?` · `speed?` (ms por carácter, 32) · `tone?: Tone` (`bedrock`).
Escribe una vez al entrar en pantalla. El texto completo está siempre en el DOM (sin layout shift); con reduced motion queda entero y quieto. Fragmentos cortos: 3–6 líneas.

**`Markdown`** — `@/components/ui/markdown` (solo servidor)
`children: string`. `react-markdown` + `remark-gfm`, sin HTML crudo (`skipHtml`), URLs saneadas, enlaces externos con `rel="noopener noreferrer"`, `# h1` baja a `<h2>`. La prosa (`.prose`) también se puede usar suelta.

### Clases sueltas

`.veta-dot` (nodo de la veta) · `.sticker` · `.hazard` (placa de error) · `.control` (aspecto de campo) · `.btn` + `data-variant` + `data-size` · `.badge` · `.prose`.

## 5. Accesibilidad verificada

Con Playwright sobre `/dev/ui` a 375 y 1440px: Modal y Drawer (abren con Enter y Espacio, foco dentro, Tab no sale, Esc / X / telón cierran, foco devuelto, scroll bloqueado), Tabs (← → Inicio Fin, tabindex itinerante, Tab pasa al panel), Tooltip (foco de teclado, `aria-describedby`, Esc), Accordion (Enter, exclusivo por `name`), Field (label, error y `aria-invalid` asociados), objetivos táctiles ≥44px, sin desborde horizontal a 320 / 375 / 768 / 1440, AnimatedCode con y sin reduced motion.

No verificado: lector de pantalla real, Safari y Firefox (las transiciones de entrada de `<dialog>` usan `@starting-style` y `transition-behavior: allow-discrete`; donde no existan, el diálogo abre sin animación).
