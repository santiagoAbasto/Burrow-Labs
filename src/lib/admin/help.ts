// Guía de cada pantalla del panel, escrita para quien lo administra (no para quien lo programó).
// Se muestra plegada bajo el título de los listados y como panel «Guía» en los formularios.

export type Help = { intro: string; steps?: string[]; tips?: string[] };

export const HELP: Record<string, Help> = {
  servicios: {
    intro: "Lo que ofrece Burrow Labs. Cada servicio tiene su página propia y aparece en el Home y en el menú.",
    steps: ["Nombre claro y una frase que diga qué resuelve.", "Contá el problema y cómo lo resolvemos: es lo que más leen.", "Ejemplos y tecnologías: solo lo real. Nada de rellenar.", "Publicalo cuando esté listo; hasta entonces queda en borrador."],
    tips: ["El orden define cómo se listan (menor = primero).", "El SEO va plegado abajo: título y descripción para Google. Si lo dejás vacío, usa el nombre y la frase."],
  },
  proyectos: {
    intro: "Casos de estudio: qué problema había, qué construimos y qué cambió. Son la prueba de que lo que decimos es real.",
    steps: ["Cargá título, resumen y categoría.", "Si el cliente no autorizó aparecer, dejá el caso anónimo (sin marcar «Mostrar el nombre del cliente»).", "Elegí una portada desde Media y, si querés, una galería.", "Métricas: solo las demostradas. Si no hay, vacío.", "Publicá. Los marcados como demo nunca salen al público."],
    tips: ["Hasta que no haya un proyecto publicado, el Home oculta la sección y /proyectos muestra un estado vacío.", "«Destacado en el Home» lo muestra en la portada."],
  },
  "categorias-de-proyectos": { intro: "Agrupan los proyectos en el listado público (web, sistemas, automatización…).", tips: ["Pocas y claras. Una categoría sin proyectos no se muestra."] },
  clientes: {
    intro: "Empresas con las que trabajamos. Salen al público solo si están publicadas y marcadas como autorizadas.",
    steps: ["Nombre, sector y sitio web.", "Logo desde Media (idealmente horizontal, fondo transparente).", "Marcá «autorizó aparecer» únicamente con el OK del cliente."],
    tips: ["Mientras no haya clientes autorizados con logo, el Home muestra sectores en lugar de logos. Eso es a propósito: no se inventan clientes."],
  },
  testimonios: {
    intro: "Palabras reales de clientes. Un testimonio sale al público solo con autorización del autor.",
    steps: ["Pegá la cita tal cual la dijo o escribió.", "Nombre, cargo y, si corresponde, el cliente y el proyecto.", "Marcá «autorizó publicarlo» solo con su OK."],
    tips: ["Si no hay testimonios autorizados, la sección simplemente no aparece. Mejor vacío que inventado."],
  },
  planes: {
    intro: "Los puntos de partida con precio. Lo que ves acá es lo que se muestra en /planes y en el Home.",
    steps: ["Nombre, frase corta y categoría (web o sistemas).", "Precio y cómo se muestra: «desde», fijo, a cotizar u oculto.", "Beneficios: uno por línea, concretos.", "Plazo estimado y, si corresponde, marcarlo como destacado (uno por categoría)."],
    tips: ["Cada plan tiene su propia versión animada del burro en el sitio; un plan nuevo recibe una automáticamente.", "El aviso «precios base» se edita en Configuración."],
  },
  faq: {
    intro: "Preguntas frecuentes. Las publicadas aparecen en /faq y, si están marcadas, también en el Home.",
    steps: ["Pregunta tal como la haría un cliente.", "Respuesta corta y directa (acepta Markdown).", "Categoría para agruparlas."],
    tips: ["Las respuestas que dependen de política comercial (garantía, soporte, propiedad del código) conviene revisarlas antes de publicar."],
  },
  blog: {
    intro: "Artículos del Lab: ideas, procesos y aprendizajes. Cada uno tiene su página y aparece en /lab.",
    steps: ["Título, resumen y categoría.", "Contenido en Markdown: usá la barra de formato y la vista previa.", "Portada desde Media.", "Publicá ahora o programá una fecha futura."],
    tips: ["El tiempo de lectura se calcula solo si lo dejás vacío.", "El resumen es lo que se ve en el listado y en Google."],
  },
  "categorias-del-blog": { intro: "Temas del Lab para filtrar artículos.", tips: ["Una categoría sin artículos publicados no se muestra."] },
  seo: {
    intro: "Título, descripción e imagen para compartir de cada ruta del sitio (/, /servicios, /planes…). Lo que ve Google y lo que se ve al compartir un enlace.",
    steps: ["Ruta exacta, empezando con «/».", "Título de hasta 60 caracteres y descripción de 120 a 160.", "Imagen para compartir: ruta de Media o URL completa."],
    tips: ["La vista previa muestra cómo quedaría en Google mientras escribís.", "«No indexar» saca la ruta de los buscadores (útil para páginas internas)."],
  },
  leads: {
    intro: "Cada consulta del formulario de contacto o del diagnóstico express (los «leads»). Llegan con todo lo que la persona escribió y solo si aceptó la política de privacidad.",
    steps: ["Entrá a la consulta: ves sus datos, lo que pidió y, si hizo el diagnóstico, sus respuestas.", "Respondé desde el panel (sale por correo con el burro) o con los botones de correo y WhatsApp, que ya llevan el texto armado con su consulta.", "Cambiá el estado (contactado, ganado, perdido) y anotá qué se habló en las notas internas."],
    tips: ["Los «nuevos» se cuentan en el menú para que no se te pase ninguno.", "Spam: marcalo como spam o eliminalo; eliminar es definitivo (derecho de supresión)."],
  },
  newsletter: {
    intro: "Quienes dejaron su email en el sitio para recibir novedades. Entran solo con su OK (la casilla del formulario) y se dan de baja desde el enlace que va al pie de cada correo, o desde acá.",
    steps: ["Buscá por email o filtrá por estado (activo / baja).", "Cambiá el estado desde la pastilla si alguien te lo pide por otro canal.", "Exportá el CSV para llevarte la lista a otra herramienta.", "Para escribirles, creá una campaña en Campañas."],
    tips: ["Eliminar borra el email para siempre (derecho de supresión). Si solo no quiere recibir más, con «Baja» alcanza.", "No hay doble opt-in: la suscripción vale desde que la persona marca la casilla."],
  },
  campanas: {
    intro: "Un correo para todos los suscriptores activos. Se escribe en Markdown, se prueba en tu propio email y se envía con un clic. Una vez enviada queda en solo lectura con sus cifras.",
    steps: ["«Nueva campaña»: asunto y cuerpo. La vista previa muestra cómo queda.", "Guardá y usá «Enviarme una prueba» para verlo en tu bandeja.", "«Enviar a N suscriptores» lo manda a todos los activos, cada uno con su enlace de baja. No se puede deshacer."],
    tips: ["Sin proveedor de correo configurado (EMAIL_DRIVER=log) nada sale de verdad: queda en la consola del servidor. Se configura en el .env (ver docs/DEPLOY.md).", "Los fallidos son correos que el proveedor rechazó; el detalle queda en los registros del servidor."],
  },
  media: {
    intro: "Biblioteca de imágenes del sitio. Desde acá se suben; en cada formulario se eligen (portada, logo, galería).",
    steps: ["Arrastrá una o varias imágenes o hacé clic para elegirlas.", "Poné un texto alternativo: describe la imagen para quien no la ve y para Google.", "Después, en el formulario que corresponda, elegila con «Elegir imagen»."],
    tips: ["Todo se convierte a WebP y se le quitan los metadatos. Hasta 8 MB cada una.", "Si borrás una imagen que está en uso, el sitio deja de mostrarla."],
  },
  home: {
    intro: "La portada, sección por sección. Podés editar todos los textos, ocultar lo que no corresponda todavía y cambiar el orden.",
    steps: ["Usá el interruptor para mostrar u ocultar.", "Las flechas cambian el orden.", "«Editar» abre todos los textos de esa sección."],
    tips: ["Algunas secciones se ocultan solas si no hay datos (proyectos sin publicar, clientes sin autorizar)."],
  },
  configuracion: {
    intro: "Los datos generales del sitio, en bloques: contacto, redes, SEO, sectores, aviso de planes, Nosotros y textos legales. Cada bloque tiene su pantalla en el menú de la izquierda, con la explicación de dónde se ve en el sitio y cómo completarlo.",
    steps: ["Mirá el estado de cada bloque en este resumen: «Listo» o qué falta.", "Entrá al bloque, completá los campos (cada uno dice para qué sirve) y guardá.", "«Ver en el sitio» abre la página pública donde se muestra."],
    tips: ["Lo que vive en el servidor (dominio, Google Analytics, imágenes) se ve en «Servidor» y se cambia en el archivo .env, no acá.", "Los textos legales requieren revisión legal antes de publicar."],
  },
  whatsapp: {
    intro: "El botón flotante del sitio. Mientras no haya un número válido, lleva al formulario de contacto.",
    steps: ["Número en formato internacional, con código de país (+591…).", "Tooltip, saludo y mensaje por defecto: lo que ve la persona antes de escribir.", "El mensaje precargado cambia solo según la página (proyecto, servicio, plan)."],
  },
  usuarios: { intro: "Quiénes pueden entrar al panel. Todos pueden todo; cada acción queda en la bitácora con su nombre.", tips: ["No podés borrarte a vos mismo ni al último administrador.", "Si alguien olvida la contraseña, restablecela desde acá."] },
  cuenta: { intro: "Tu nombre (así figurás en la bitácora) y tu contraseña. Para cambiarla necesitás la actual; las otras sesiones se cierran." },
  actividad: { intro: "Quién hizo qué y cuándo. Sirve para entender un cambio o para revisar qué pasó mientras no estabas." },
};

export const GUIDE: { title: string; items: string[] }[] = [
  { title: "Primeros pasos", items: ["Cargá el número de WhatsApp (menú Captación › WhatsApp): hasta entonces el botón lleva al formulario.", "Completá el email de contacto y las redes en Configuración.", "Revisá el Home sección por sección y ajustá los textos a tu voz.", "La checklist del dashboard te muestra qué falta para salir con datos reales."] },
  { title: "Publicar un caso (proyecto)", items: ["Contenido › Proyectos › «Nuevo proyecto».", "Problema, solución y resultado: contá la historia, no las funciones.", "Portada desde Media; métricas solo si están demostradas.", "Si el cliente no autorizó, dejá el caso anónimo.", "Estado «Publicado» y guardar: ya está en el sitio."] },
  { title: "Cambiar un precio o un plan", items: ["Contenido › Planes › el plan.", "Precio, moneda y cómo se muestra («desde», fijo, a cotizar).", "Beneficios uno por línea. Guardar: el sitio se actualiza al instante."] },
  { title: "Atender una consulta (lead)", items: ["Captación › Leads: los nuevos aparecen primero y se cuentan en el menú.", "Abrí el lead, respondé por email o WhatsApp con los botones.", "Marcá el estado y anotá en las notas qué se habló."] },
  { title: "Imágenes", items: ["Sitio › Media: arrastrá las imágenes. Se convierten a WebP solas.", "Después elegilas desde cada formulario (portada, logo, galería)."] },
  { title: "SEO", items: ["Cada servicio, proyecto y artículo tiene su SEO plegado al final del formulario, con vista previa de Google.", "Las rutas fijas (/, /planes…) se editan en Sitio › SEO."] },
  { title: "Usuarios y seguridad", items: ["Sitio › Usuarios para dar acceso a alguien más.", "Cambiá tu contraseña en Mi cuenta. Las sesiones duran 7 días sin uso y 30 como máximo.", "Todo queda en Actividad."] },
];
