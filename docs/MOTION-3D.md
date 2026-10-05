# Motion y 3D

Tokens y reglas: [DESIGN.md](DESIGN.md) §6 y `src/lib/motion.ts`.

## Reparto de librerías

| Herramienta | Dónde |
|---|---|
| CSS | Hover, foco, presión, header que se oculta, orejas de la mascota, botón de WhatsApp. |
| Motion | Diagrama del problema (líneas que se dibujan), contadores de la calculadora. |
| GSAP ScrollTrigger | Solo la vagoneta de «Cómo trabajamos». Se descarga cuando la sección se acerca a la pantalla. |
| three + React Three Fiber | Solo el hero. Chunk aparte, se pide si el dispositivo lo aguanta. |

Cada sección tiene un único gesto propio. No hay una animación de entrada genérica.

## Hero: la madriguera (`src/components/home/hero/`)

- `index.tsx` (servidor): los tres paneles en HTML — intro con el H1, frase puente y cierre. Es el LCP y funciona sin JavaScript.
- `descent.tsx` (cliente): decide si hay 3D y, si lo hay, fija la escena y convierte el scroll en progreso 0–1.
- `scene.tsx` (cliente, diferido): la escena.

**Cuándo hay 3D:** ancho ≥ 768px, WebGL disponible, sin `prefers-reduced-motion`, sin ahorro de datos, 4+ núcleos y 4+ GB, y que el primer panel entre entero en la pantalla. En cualquier otro caso queda la **composición estática**: los mismos tres paneles apilados, con la mascota y las piezas como etiquetas.

**Una sola composición:** la insignia del burro es HTML y está siempre, con o sin 3D. Cuando la escena carga, las etiquetas se funden y las tarjetas 3D aparecen alrededor de la insignia (`anchor` le pasa a la escena su posición en píxeles; si no hay lugar a la derecha, las tarjetas se achican). Las etiquetas siguen ocupando su espacio, así que el texto no se mueve al cargar. En pantallas de escritorio bajas (hasta 848px de alto) el panel se compacta para que el 3D también corra en portátiles de 13–14".

**Texto y túnel:** la frase puente (`.hero-bridge`) tiene un ancho máximo que termina antes del borde izquierdo del túnel (50vw + 20svh con la cámara del descenso). El profundímetro toma el estrato del hero mientras desciende.

**Qué pasa al bajar:** la cámara desciende por un corte del terreno. Las seis tarjetas de la superficie (Excel, mensajes, papeles…) caen por el túnel, se dan vuelta y llegan al laboratorio como datos, APIs, automatizaciones, dashboards, software e IA, conectadas por cables amarillos a la laptop del burro.

**Rendimiento:** materiales sin luz (colores exactos del logo), texturas dibujadas en canvas, partículas instanciadas, sin sombras ni postprocesado, DPR máx. 1,75, se pausa fuera de pantalla. No se descarga ningún modelo, HDRI ni fuente remota (la CSP tampoco lo permitiría).

**La mascota** en la escena es el asset original como textura plana. No está modelada.

## Mascota (`src/components/brand/`)

`Mascot` apila capas recortadas del logo (orejas, cuerpo) y dibuja la pupila en CSS. La pupila sigue al cursor (solo puntero fino); las orejas reaccionan al pasar el cursor por el logo. En reposo es idéntica al original. `Cart` la sienta en una vagoneta de mina, agarrada del borde con las dos pezuñas; la vagoneta y los brazos (`limbs.tsx`) son piezas dibujadas aparte. Con `data-rolling` giran las ruedas.

## El burro sostiene cada plan (`src/components/plans/`)

El nombre de cada plan va en un **cartel** (es el titular de la tarjeta) y el burro lo sostiene. Hay dos posturas: parado detrás del cartel, agarrándolo con las pezuñas y con las patas asomando por debajo, o sentado encima con las patas colgando. Cada plan tiene su acción:

| Plan | Qué pasa |
|---|---|
| Madriguera | Se esconde detrás del cartel y vuelve a asomar, entre montículos de tierra. |
| Impulso | Sentado sobre el cartel, que rebota sobre dos resortes. |
| Turbo | Corre con el cartel: patas a toda velocidad, polvo, estelas y fuego. |
| Conecta | Sentado mientras entran cables con datos al cartel. |
| Automatiza | El cartel va sobre engranajes y el burro saluda con una pezuña libre. |
| Escala | Levanta el cartel en puntas de pie; crecen las barras y sale la flecha. |
| Sistema | Sentado entre ventanas y gráficos. |
| Infinito | Levita con el cartel bajo un infinito; las patas le cuelgan. |

Un plan nuevo creado en el CMS recibe una de las ocho escenas de forma estable.

**Qué es original y qué no:** el burro es el vector del logo, sin tocar; el cartel solo tapa su parte inferior. Los brazos con pezuña, las patas traseras y los accesorios son piezas nuevas dibujadas en `plan-mascot.tsx`, con el mismo trazo del logo (relleno plano, línea negra, borde amarillo). El dueño de la marca las pidió el 2026-10-02.

En todas, las orejas aletean y los ojos miran a los lados (`lively` en `Mascot`), las pezuñas tamborilean y las patas se mueven. Al pasar el cursor por la tarjeta, el burro festeja. Las animaciones son CSS (`plans.css`), corren solo con la escena en pantalla (`SceneStage`) y se apagan con `prefers-reduced-motion`.

## Burrow Runner (`src/components/game/`)

`engine.ts` (lógica pura y probada), `render.ts` (canvas 2D), `burrow-runner.tsx` (bucle, controles, sonido, récord local) y `game-stage.tsx` (póster; el juego se descarga al pulsar «Jugar»). Se pausa solo fuera de pantalla o con la pestaña oculta. Mecánica y gráficos propios.

## Easter eggs

Saludo en la consola, código Konami (modo «Burro Developer»: etiqueta cada estrato como si fuera código) y el juego en el 404.
