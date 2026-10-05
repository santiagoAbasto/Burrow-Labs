# Roadmap editorial y mapa de intención

Qué página responde a cada búsqueda, qué contenido conviene escribir después y qué no hay que crear.
La metadata vive en `src/db/seed-content.ts` (constante `SEO`, servicios, FAQ), `src/db/seed/projects/*.ts` y `src/db/seed/posts.ts`; después del lanzamiento se edita desde el panel.

Reglas que valen para todo lo de abajo:

- Cada pieza sale de **experiencia propia** contada en un caso publicado. Si no hay un caso que la respalde, no se escribe.
- Sin cifras de negocio inventadas, sin clientes nombrados sin permiso, sin promesas de posición en buscadores.
- Una pieza responde **una pregunta** y enlaza a la página que vende eso (servicio, caso, planes o herramienta).
- No hay fechas ni frecuencia comprometida: se publica cuando la pieza está bien, en el orden de la lista.

## 1. Mapa de intención

Una URL por intención. Si dos páginas compiten por la misma búsqueda, la segunda sobra o debe enlazar a la primera.

| Cluster | Intención | Qué muestra hoy el buscador | URL que responde | Apoyo |
|---|---|---|---|---|
| Software a medida (Bolivia) | Comercial: elegir proveedor | Home y páginas de servicio de estudios bolivianos, más un par de listados «top 5» | `/` | `/nosotros`, `/proyectos` |
| Sistemas empresariales a medida | Comercial | Páginas de servicio de agencias y algún «qué es» | `/servicios/sistemas-empresariales` | Casos de trazabilidad, B2B, producción |
| Software de gestión | Comercial / informacional | Igual que el anterior, mezclado con ERP | `/servicios/sistemas-empresariales` | `/lab/cuando-tu-excel-ya-es-un-sistema` |
| Automatización de procesos | Informacional en la búsqueda genérica (guías «qué es» de fabricantes); comercial cuando se busca servicio | Guías largas de fabricantes y blogs | `/servicios/automatizacion` (servicio) y `/lab/que-proceso-automatizar-primero` (guía) | `/calculadora`, FAQ «¿Cuándo conviene automatizar un proceso?» |
| Integración de sistemas / APIs | Mixta | Guías de bancos y fabricantes junto a páginas de servicio | `/servicios/automatizacion` | FAQ «¿Cómo conectan sistemas que hoy trabajan separados?», caso Apple Boss (pagos, n8n) |
| Inventario a medida | Mixta, fragmentada | Guías, listados de SaaS y pocos proveedores a medida | `/proyectos/apple-boss` | `/servicios/sistemas-empresariales`; pieza 1 del roadmap |
| CRM a medida | Comercial | Landings de agencias y artículos «cuándo tiene sentido» | `/proyectos/crm-inmobiliario` | FAQ «¿Cuándo una empresa necesita un CRM propio?»; pieza 7 |
| B2B (catálogo, portal, pedidos) | Comercial | Páginas de servicio de e-commerce B2B | `/proyectos/plataforma-b2b-de-catalogo-y-pedidos` | `/servicios/web-y-ecommerce`; pieza 6 |
| E-commerce a medida | Comercial | Páginas de servicio de agencias | `/servicios/web-y-ecommerce` | `/proyectos/apple-boss`; pieza 5 |
| Desarrollo web profesional | Comercial / transaccional (precio) | Páginas de servicio y de precios | `/servicios/web-y-ecommerce` y `/planes` | Planes web desde USD 85 |
| IA aplicada / automatización con IA | Informacional con salida comercial | Guías de fabricantes y landings de agencias | `/servicios/inteligencia-artificial` | `/lab/ia-en-procesos-reales`, FAQ «¿Qué puede automatizar una empresa con IA?» |
| Asistentes de ventas con IA | Comercial; la búsqueda genérica devuelve productos SaaS y listados | Productos y «mejores herramientas» | `/proyectos/asistente-de-ventas-con-ia` | Pieza 9. No se compite por la búsqueda genérica: el caso sirve a quien busca uno construido sobre sus datos |
| Pedidos | Comercial | — | `/proyectos/plataforma-b2b-de-catalogo-y-pedidos` (B2B) y `/proyectos/apple-boss` (tienda) | `/servicios/sistemas-empresariales` |
| Cotizaciones | Comercial | — | `/proyectos/cotizaciones-tecnicas` | Pieza 3 |
| Trazabilidad | Informacional en la genérica («qué es»), comercial en la larga | Guías de logística e industria, fabricantes de marcado | `/proyectos/plataforma-industrial-de-trazabilidad` | Pieza 4 |
| Producción / operaciones | Comercial | — | `/proyectos/control-de-operaciones-y-produccion` | Pieza 8 |
| Dashboards y reportes | Comercial | — | `/servicios/sistemas-empresariales` | Caso Apple Boss («Datos que terminan en decisiones»); pieza 10 |
| Precio de un sistema a medida | Informacional: «cuánto cuesta» | Artículos con rangos de precio | `/planes` | FAQ «¿Cuánto cuesta desarrollar un sistema a medida?»; pieza 12 |
| Qué necesito (web, sistema, automatización) | Informacional / herramienta | — | `/diagnostico` | FAQ «¿Qué diferencia hay entre una web y un sistema empresarial?» |

Lectura de los resultados de búsqueda: hecha con consultas en español sin geolocalizar en Bolivia, así que sirve para ver **qué tipo de página** domina, no para estimar posiciones ni volumen. No hay datos de volumen: cuando Search Console tenga impresiones reales, esta tabla se revisa con ellas.

## 2. Piezas a escribir

Destino: Burrow Lab (`/lab/<slug>`). El slug es una propuesta. Cada pieza lleva al menos un enlace al caso del que sale, uno al servicio y uno a una herramienta o a planes.

### 1. Stock por unidad: cuando el inventario no es un número

- **Intención:** informacional con salida comercial (inventario a medida para comercio de tecnología, equipos con serie o IMEI).
- **Pregunta que responde:** ¿cómo se controla el stock cuando cada equipo es una unidad distinta y no una cantidad?
- **Experiencia real:** Apple Boss. La cadena producto → variante → unidad → estado → operación; una publicación por unidad para equipos y una por artículo para accesorios; reservas y pedidos pendientes que retienen la unidad; auditorías por escaneo.
- **URL destino:** `/lab/stock-por-unidad`
- **Enlaces internos:** `/proyectos/apple-boss`, `/servicios/sistemas-empresariales`, `/planes`.

### 2. Cuándo la IA interpreta y cuándo las reglas deciden

- **Intención:** informacional (cómo usar IA en un proceso sin perder control).
- **Pregunta que responde:** ¿qué parte de un proceso se le puede dar a un modelo y cuál tiene que quedar en código?
- **Experiencia real:** Commerce Intelligence (la IA devuelve atributos validados; scoring y precios los calculan motores determinísticos) y cotizaciones técnicas (la IA solo interpreta el pedido).
- **URL destino:** `/lab/ia-interpreta-reglas-deciden`
- **Enlaces internos:** `/proyectos/commerce-intelligence`, `/proyectos/cotizaciones-tecnicas`, `/servicios/inteligencia-artificial`, `/lab/ia-en-procesos-reales`.

### 3. Cotizaciones con fórmulas determinísticas

- **Intención:** comercial-informacional (sistema de cotizaciones para empresas técnicas).
- **Pregunta que responde:** ¿cómo se logra que dos personas coticen lo mismo y lleguen al mismo número?
- **Experiencia real:** cotizaciones técnicas. Flujo empresa → contacto → condiciones → líneas y alternativas → cálculo → documento; fórmulas versionadas evaluadas en el backend; PDF generado desde los datos; camino determinístico cuando la IA no valida.
- **URL destino:** `/lab/cotizaciones-con-formulas-deterministicas`
- **Enlaces internos:** `/proyectos/cotizaciones-tecnicas`, `/servicios/sistemas-empresariales`, `/lab/cuando-tu-excel-ya-es-un-sistema`.

### 4. Trazabilidad y auditoría por diseño

- **Intención:** informacional (qué es trazabilidad en un sistema interno) con salida comercial.
- **Pregunta que responde:** ¿cómo se sabe quién cambió un dato y cuándo, sin pedirle a nadie que lo anote?
- **Experiencia real:** plataforma industrial de trazabilidad. Primero las preguntas que el historial debe responder, después las entidades; aislamiento por organización; documentos privados servidos con las mismas reglas de acceso.
- **URL destino:** `/lab/trazabilidad-y-auditoria-por-diseno`
- **Enlaces internos:** `/proyectos/plataforma-industrial-de-trazabilidad`, `/servicios/sistemas-empresariales`, FAQ «¿Trabajan con información sensible?».

### 5. Cómo se valida un pago antes de confirmar un pedido

- **Intención:** informacional técnica-comercial (e-commerce a medida, integración de pagos).
- **Pregunta que responde:** ¿alcanza con el aviso del proveedor de pagos para dar un pedido por pagado?
- **Experiencia real:** Apple Boss. El aviso (retorno o webhook) nunca confirma solo: el sistema vuelve a consultar al proveedor y compara el monto; confirmación idempotente; retención de unidades mientras el pago está pendiente; pagos manuales «en revisión».
- **URL destino:** `/lab/validar-un-pago-antes-de-confirmar-un-pedido`
- **Enlaces internos:** `/proyectos/apple-boss`, `/servicios/web-y-ecommerce`, `/servicios/automatizacion`.

### 6. Un solo catálogo para el sitio, el portal y la administración

- **Intención:** comercial-informacional (plataforma B2B, precios por cliente).
- **Pregunta que responde:** ¿cómo se le muestra a cada empresa su precio sin mantener tres catálogos?
- **Experiencia real:** plataforma B2B de catálogo y pedidos. Un único modelo de producto; la diferencia entre público y privado está en qué se muestra y a quién; pedidos que nacen cargados.
- **URL destino:** `/lab/un-solo-catalogo-b2b`
- **Enlaces internos:** `/proyectos/plataforma-b2b-de-catalogo-y-pedidos`, `/servicios/web-y-ecommerce`, `/planes`.

### 7. CRM y sitio web sobre la misma base de datos

- **Intención:** comercial (CRM a medida; cuándo tiene sentido).
- **Pregunta que responde:** ¿cuándo conviene un CRM propio y qué cambia cuando el sitio lee los mismos datos?
- **Experiencia real:** CRM inmobiliario. Propiedades, captaciones, leads, pipeline y agenda en un mismo lugar; lo publicado aparece en la web sin doble carga.
- **URL destino:** `/lab/crm-y-sitio-sobre-la-misma-base`
- **Enlaces internos:** `/proyectos/crm-inmobiliario`, `/servicios/sistemas-empresariales`, FAQ «¿Cuándo una empresa necesita un CRM propio?».

### 8. Digitalizar un proceso de producción sin volverlo rígido

- **Intención:** informacional con salida comercial (control de producción, seguimiento de pedidos en planta).
- **Pregunta que responde:** ¿cómo se pasa del papel a un sistema sin que los operadores vuelvan al papel?
- **Experiencia real:** control de operaciones y producción. Etapas con estado, responsable y fecha; rechazos con motivo; pedidos que retroceden o quedan en pausa sin perder historial.
- **URL destino:** `/lab/digitalizar-produccion-sin-volverla-rigida`
- **Enlaces internos:** `/proyectos/control-de-operaciones-y-produccion`, `/servicios/sistemas-empresariales`, `/diagnostico`.

### 9. Un asistente que no inventa precios ni stock

- **Intención:** informacional-comercial (asistente de ventas con IA sobre datos propios).
- **Pregunta que responde:** ¿cómo se evita que un asistente con IA responda algo que no es cierto?
- **Experiencia real:** asistente de ventas con IA. El modelo interpreta, las herramientas consultan, las reglas validan; la frontera está en código y no en el prompt; derivación a un operador con el historial; prompts versionados.
- **URL destino:** `/lab/asistente-que-no-inventa-precios`
- **Enlaces internos:** `/proyectos/asistente-de-ventas-con-ia`, `/servicios/inteligencia-artificial`, pieza 2.

### 10. Reportes que se arman solos: el patrón evento → API → flujo → sistema

- **Intención:** informacional (automatización de reportes, n8n con un sistema propio).
- **Pregunta que responde:** ¿cómo se automatiza un reporte sin sacar los datos del sistema ni abrirle la base a una herramienta externa?
- **Experiencia real:** Apple Boss. Reporte semanal con n8n: el flujo pide los datos a un endpoint con token propio, un modelo redacta el resumen sobre cifras que calculó el sistema y el resultado vuelve al panel; backup diario.
- **URL destino:** `/lab/reportes-automaticos-con-n8n`
- **Enlaces internos:** `/proyectos/apple-boss`, `/servicios/automatizacion`, `/lab/que-proceso-automatizar-primero`, `/calculadora`.

### 11. Permisos por rol que se cumplen en el servidor

- **Intención:** informacional (roles y permisos en un sistema interno; seguridad por diseño).
- **Pregunta que responde:** ¿por qué no alcanza con ocultar un botón?
- **Experiencia real:** Apple Boss (el mismo mapa de permisos arma el menú y corta el acceso en el servidor; el vendedor nunca recibe costo ni ganancia) y trazabilidad (ninguna consulta cruza de una organización a otra).
- **URL destino:** `/lab/permisos-por-rol-en-el-servidor`
- **Enlaces internos:** `/proyectos/apple-boss`, `/proyectos/plataforma-industrial-de-trazabilidad`, `/servicios/sistemas-empresariales`.

### 12. Qué define el costo de un sistema a medida

- **Intención:** informacional previa a la compra («cuánto cuesta»). En el buscador dominan artículos, no páginas de precios.
- **Pregunta que responde:** ¿de qué depende el precio y cómo se llega a un número antes de empezar?
- **Experiencia real:** los precios base publicados en `/planes` y la forma de trabajo por fases. Qué agranda un alcance: módulos, roles, integraciones, reglas de cálculo, migración de datos. Solo se citan los precios base que ya están publicados; ningún rango nuevo.
- **URL destino:** `/lab/que-define-el-costo-de-un-sistema-a-medida`
- **Enlaces internos:** `/planes`, `/diagnostico`, `/contacto`, FAQ «¿Cuánto cuesta desarrollar un sistema a medida?» y «¿Qué necesitan para cotizar?».

### Orden sugerido

1, 3, 5 y 12 primero: son las que tienen la experiencia más concreta y la intención más cercana a contratar. Después 2, 4, 9 (IA y trazabilidad), y por último 6, 7, 8, 10, 11.

## 3. Cómo se escribe cada pieza

- La respuesta a la pregunta va en el primer párrafo, en dos o tres oraciones que se entiendan solas.
- Subtítulos que digan qué hay debajo; tablas o listas cuando se compara o se enumera.
- Lo que se cuenta del caso tiene que estar en el caso publicado. Si hace falta un dato nuevo, primero se agrega al caso.
- Enlaces con texto descriptivo («sistema de cotizaciones técnicas»), nunca «clic acá».
- Título SEO sin el nombre del sitio y de hasta unos 46 caracteres (se le agrega « · Burrow Labs»); descripción de 140 a 160.
- Al publicar una pieza, se enlaza desde el caso del que sale y desde el servicio relacionado.

## 4. Qué NO crear

- **Páginas por ciudad** («software a medida en Santa Cruz», «en La Paz», «en Cochabamba»). Son páginas doorway: mismo contenido con otro topónimo. Bolivia es parte de la marca; ninguna ciudad hasta que haya una dirección confirmada, y aun entonces una sola página.
- **Landings por palabra clave sin contenido propio** («CRM a medida», «sistema de inventario», «ERP»). Si un tema merece página, primero tiene que tener un caso y una pieza que lo respalden.
- **Artículos genéricos** del tipo «qué es la automatización», «10 beneficios de un CRM», «tendencias de IA». Ya los escribieron los fabricantes y no llevan experiencia propia.
- **Comparativas o listados de herramientas de terceros** que no se usaron en un proyecto.
- **Casos, clientes, testimonios o métricas inventados**, ni «casos demo» presentados como reales.
- **Preguntas frecuentes de relleno** para sumar volumen, ni marcado `FAQPage` como táctica de resultados enriquecidos.
- **Contenido generado en serie** (una página por sector, por tecnología o por combinación de ambos).
- **Fechas de actualización cambiadas sin cambios reales** en el texto.

## 5. Antes de dar una pieza por publicada

- Responde la pregunta en el primer párrafo.
- Todo lo afirmado está respaldado por un caso publicado o por los planes.
- Tiene los tres enlaces internos (caso, servicio, herramienta o planes) y el caso enlaza de vuelta.
- Título y descripción dentro de los largos; el título no repite el de otra página.
- La leyó alguien que no la escribió.
