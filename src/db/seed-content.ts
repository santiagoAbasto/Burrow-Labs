import { eq } from "drizzle-orm";
import { HOME_SECTIONS, HOME_SECTION_KEYS } from "../components/home/sections";
import type { Db } from "./index";
import {
  faqs,
  homeSections,
  planFeatures,
  plans,
  postCategories,
  posts,
  projectCategories,
  projectServices,
  projects,
  seoMetadata,
  services,
  siteSettings,
} from "./schema";
import { LEGAL } from "./seed/legal";
import { POST_CATEGORIES, POSTS } from "./seed/posts";
import { PROJECTS } from "./seed/projects";

// Estado del contenido (real / placeholder / por confirmar): docs/CONTENT-STATUS.md

const published = { status: "published" as const, publishedAt: new Date("2026-10-01T12:00:00Z") };

const SETTINGS: Record<string, unknown> = {
  // DATO QUE REQUIERE CONFIRMACIÓN: el teléfono va vacío hasta tener el real.
  contact: {
    email: "info@burrowlabs.com.bo",
    whatsappPhone: "",
    whatsappEnabled: true,
    whatsappTooltip: "¿Cavamos una solución?",
    whatsappGreeting: "Hola 👋 ¿Qué problema querés dejar de hacer a mano?",
    whatsappDefaultMessage: "Hola Burrow Labs, quiero conversar sobre un proyecto.",
  },
  social: { instagram: "https://www.instagram.com/burrowlabsbo/", linkedin: "", github: "", facebook: "", tiktok: "", x: "", googleMaps: "" },
  seo: {
    siteName: "Burrow Labs",
    // Contrato con src/lib/seo.ts: la plantilla se aplica salvo que el título ya contenga «Burrow Labs».
    titleTemplate: "%s · Burrow Labs",
    // Descripción corta de la entidad: va al JSON-LD de Organization, a /llms.txt y a las páginas sin descripción propia.
    description:
      "Burrow Labs es un software studio de Bolivia que construye sistemas a medida, automatizaciones, integraciones e IA aplicada para empresas.",
    ogImage: "/brand/og-logo.png",
    locale: "es_BO",
    city: "Cochabamba",
    region: "Cochabamba",
    country: "BO",
  },
  sectors: ["Industria", "Comercio", "Inmobiliarias", "Servicios", "Retail", "Manufactura", "Tecnología"],
  brandPhrases: [
    "Codificando soluciones.",
    "No empezamos por el código. Empezamos por entender cómo trabaja tu negocio.",
    "Antes de automatizar algo, entendemos por qué existe.",
    "Primero entendemos el proceso. Después escribimos código.",
    "Software pensado para cómo trabaja realmente tu empresa.",
    "Desenterramos procesos lentos y los convertimos en sistemas.",
    "No automatizamos por moda. Automatizamos lo que realmente cuesta tiempo.",
    "Si todavía lo resolvés con Excel, mensajes y tareas repetitivas, probablemente podamos automatizarlo.",
  ],
  plansDisclaimer: "Precio base. El alcance final se confirma antes de comenzar.",
  about: {
    headline: "Pequeños por diseño. Obsesionados con resolver.",
    body: `Burrow Labs nace de una idea simple: antes de sumar otra herramienta a una empresa, hay que entender qué está frenando realmente el trabajo.

Conectamos sistemas, eliminamos tareas repetitivas y construimos herramientas para operar con menos trabajo manual: sistemas web, automatizaciones, integraciones e IA aplicada.

## De dónde viene el nombre

«Burrow» es la madriguera: mirar debajo de la superficie, encontrar el problema real y construir desde ahí.

## Cómo trabajamos

No empezamos por el código. Empezamos por entender cómo trabaja tu negocio.

1. **Entender.** Cómo se trabaja hoy, quién hace qué y dónde se pierde el tiempo.
2. **Modelar.** Convertimos el proceso en flujos, datos y reglas explícitas antes de programar.
3. **Construir.** Desarrollamos por bloques funcionales que podés usar y revisar desde el principio.
4. **Probar.** Pruebas automáticas sobre lo que no puede fallar: permisos, cálculos, integraciones.
5. **Medir.** Después de lanzar, miramos qué cambió en la operación con datos reales.
6. **Mejorar.** Ajustamos y ampliamos sobre lo que ya funciona, sin reescribir desde cero.`,
    vision:
      "Que cualquier empresa, del tamaño que sea, pueda tener software hecho para cómo trabaja realmente. Built in Bolivia · Working everywhere.",
    values: [
      { name: "Primero el proceso", description: "Antes del código entendemos cómo se trabaja hoy." },
      { name: "IA donde aporta", description: "No convertimos cada problema en un chatbot." },
      { name: "Lo crítico es determinístico", description: "Precios, permisos, stock y reglas sensibles no dependen de una ocurrencia del modelo." },
      { name: "Seguridad desde el diseño", description: "Autenticación, permisos, validación y tratamiento responsable de datos." },
      { name: "Medir antes de presumir", description: "Si no existe una métrica verificable, no la inventamos." },
    ],
  },
  legal: LEGAL,
};

// Cuatro servicios, en este orden. Los slugs son rutas públicas (hay tests y enlaces internos): no cambiarlos.
const SERVICES = [
  {
    slug: "sistemas-empresariales",
    name: "Sistemas empresariales",
    icon: "building",
    tagline: "Una sola fuente de datos para toda la operación.",
    problem: `Hay un momento en que las herramientas dejan de acompañar a la empresa. Las planillas dejan de alcanzar: nadie sabe cuál es la versión correcta, un dato cambia y no queda registro de quién lo tocó, y los reportes se arman a mano cada vez que alguien los pide.

El resultado es una operación que depende de la memoria de algunas personas, con información repartida entre archivos, mensajes y sistemas que no se hablan. No es un problema de esfuerzo: es que el proceso no tiene dónde vivir.`,
    solution: `Diseñamos plataformas internas para centralizar procesos, información y decisiones: inventario, CRM, pedidos, cotizaciones, producción, trazabilidad, usuarios, permisos y reportes.

Lo construimos por módulos y por etapas, empezando por el área que más lo necesita, para que el cambio sea gradual y el equipo lo adopte sin frenar la operación. Cada módulo se apoya en una sola fuente de datos, con reglas explícitas y testeables.

Ideal para: empresas que crecieron más rápido que sus herramientas.`,
    examples: ["CRM", "Inventario y trazabilidad", "Pedidos y cotizaciones", "Producción y operaciones", "Portales privados", "Dashboards y reportes"],
    technologies: ["Laravel", "React", "TypeScript", "PostgreSQL", "MySQL"],
    ctaLabel: "Quiero ordenar mi operación",
    seoTitle: "Sistemas empresariales y de gestión a medida",
    seoDescription:
      "Sistemas a medida para centralizar inventario, CRM, pedidos, cotizaciones, producción y reportes en una sola fuente de datos, por módulos y por etapas.",
  },
  {
    slug: "automatizacion",
    name: "Automatización e integraciones",
    icon: "workflow",
    tagline: "Que el equipo deje de hacer lo que puede hacer el sistema.",
    problem: `Cargar el mismo dato en tres lugares. Reenviar el mismo mensaje veinte veces. Armar el mismo documento cada lunes. Son tareas que nadie eligió hacer y que igual ocupan horas todas las semanas, con los errores que trae cualquier copia a mano.

El otro lado del problema son los sistemas que no se hablan: ventas no sabe lo que hay en stock, contabilidad recibe todo en una planilla a fin de mes y entre cada herramienta hay una persona copiando y pegando.`,
    solution: `Conectamos herramientas, eliminamos tareas repetitivas y automatizamos flujos entre formularios, sistemas, documentos, APIs y servicios externos.

Empezamos por un proceso concreto: lo mapeamos, lo automatizamos de punta a punta, dejamos registro de cada ejecución y medimos qué cambió antes de seguir con el siguiente. El equipo se queda con el trabajo que sí necesita criterio.`,
    examples: [
      "Sincronización de datos",
      "Generación automática de documentos",
      "Alertas y notificaciones",
      "Procesamiento de archivos",
      "Integraciones por API y webhooks",
      "Flujos operativos",
    ],
    technologies: ["REST APIs", "Webhooks", "n8n", "Node.js", "Redis"],
    ctaLabel: "Quiero automatizar un proceso",
    seoTitle: "Automatización de procesos e integraciones",
    seoDescription:
      "Automatizamos tareas repetitivas y conectamos sistemas que no se hablan mediante APIs y webhooks. Un proceso por vez, con registro de cada ejecución.",
  },
  {
    slug: "inteligencia-artificial",
    name: "IA aplicada",
    icon: "sparkles",
    tagline: "IA que hace algo útil.",
    problem: `Hay mucha presión por «usar IA» y poca claridad sobre para qué. Un chatbot que no conoce tu catálogo o un asistente que inventa respuestas no ahorra trabajo: genera uno nuevo, porque alguien tiene que revisar lo que dijo.

La IA sirve cuando está dentro de un proceso real, conectada a la información de la empresa y con límites claros sobre qué puede decidir y qué no.`,
    solution: `Integramos modelos de IA dentro de procesos reales: asistentes, interpretación de información, clasificación, análisis de documentos e imágenes y ejecución controlada de acciones mediante herramientas.

Definimos qué interpreta el modelo, qué queda en manos de reglas del sistema y cuándo interviene una persona. Y si el problema se resuelve mejor sin IA, te lo decimos.

> La IA interpreta. Las reglas críticas del negocio siguen siendo controladas y testeables.`,
    examples: [
      "Asistentes con contexto empresarial",
      "Interpretación de documentos",
      "Clasificación",
      "Visión y análisis de imágenes",
      "Structured outputs y tool calling",
      "Flujos que combinan reglas e IA",
    ],
    technologies: ["OpenAI", "Gemini", "Anthropic"],
    ctaLabel: "Tengo un caso para IA",
    seoTitle: "Inteligencia artificial aplicada para empresas",
    seoDescription:
      "Asistentes, lectura de documentos e imágenes y clasificación con IA dentro de procesos reales. El modelo interpreta; las reglas críticas quedan en código.",
  },
  {
    slug: "web-y-ecommerce",
    name: "Plataformas web",
    icon: "globe",
    tagline: "Una web conectada con cómo trabaja la empresa.",
    problem: `Un sitio que no se puede administrar sin llamar a alguien termina desactualizado. Una tienda online desconectada del stock vende lo que no hay y obliga a corregir pedidos a mano. Un catálogo que vive en un PDF se reenvía por mensaje y nadie sabe cuál es la versión vigente.

Cuando la web no está conectada con cómo trabaja la empresa, se convierte en una tarea más en vez de una herramienta.`,
    solution: `Construimos plataformas públicas y privadas, sitios administrables, e-commerce, catálogos B2B y portales conectados con la operación interna.

Administrás el contenido con tu propio panel, sin depender de nadie, y la estructura técnica queda bien armada para buscadores desde el primer día. Cuando hace falta, la plataforma se conecta con stock, pedidos, pagos o el sistema interno que ya usás.`,
    examples: ["E-commerce conectado al stock", "Catálogos B2B", "Portales de clientes", "Sitios corporativos administrables", "CMS a medida"],
    technologies: ["React", "TypeScript", "Laravel", "Inertia", "Vite"],
    ctaLabel: "Quiero construir una plataforma",
    seoTitle: "Desarrollo web, e-commerce y catálogos B2B",
    seoDescription:
      "Sitios administrables, e-commerce, catálogos B2B y portales de clientes conectados con stock, pedidos, pagos o el sistema interno que ya usa tu empresa.",
  },  {
    slug: "aplicaciones-moviles",
    name: "Aplicaciones móviles",
    icon: "smartphone",
    tagline: "Apps para Android y iPhone, conectadas con cómo trabaja tu empresa.",
    problem: `Hay trabajo que no pasa frente a una computadora: el vendedor que toma pedidos en la calle, el técnico que cierra una orden en la obra, el chofer que confirma una entrega, el cliente que quiere pedir desde el celular. Hoy eso vuelve a la oficina por WhatsApp, en fotos de papeles o en una planilla que alguien completa a la noche.

Y cuando la app ya existe, muchas veces vive aislada: tiene sus propios datos, no se entera de lo que pasa en el sistema de la empresa y obliga a cargar todo dos veces.`,
    solution: `Desarrollamos aplicaciones móviles para Android y iPhone desde Cochabamba, para empresas de Bolivia y del exterior. La app se conecta con el sistema que ya usás, o con el que construimos, para que lo que se carga en la calle aparezca en la oficina sin que nadie lo copie.

Antes de programar definimos quién la va a usar, qué tiene que hacer y con qué datos. Recién entonces elegimos la tecnología: una sola base de código para los dos sistemas, una app nativa para cada uno o una app web que se instala en el celular cuando no hace falta pasar por las tiendas.

Nos encargamos de publicarla en Google Play y App Store a nombre de tu empresa, o de distribuirla solo entre tu equipo si es de uso interno.`,
    examples: [
      "Pedidos y ventas en ruta",
      "Órdenes de trabajo para técnicos",
      "Apps de clientes: pedidos, reservas y seguimiento",
      "Apps internas para el equipo",
      "Conexión con tu sistema por API",
      "Publicación en Google Play y App Store",
    ],
    technologies: ["React Native", "Expo", "Flutter", "Kotlin", "Swift", "PWA"],
    ctaLabel: "Quiero una app para mi empresa",
    seoTitle: "Desarrollo de aplicaciones móviles en Cochabamba",
    seoDescription:
      "Desarrollamos apps para Android y iPhone desde Cochabamba, conectadas con el sistema de tu empresa. Publicación en Google Play y App Store. Bolivia y exterior.",
  },
];

const PROJECT_CATEGORIES = [
  ["sistemas-empresariales", "Sistemas empresariales"],
  ["ia", "IA"],
  ["automatizacion", "Automatización"],
  ["e-commerce", "E-commerce"],
  ["b2b", "B2B"],
  ["apis", "APIs"],
  ["web", "Web"],
  ["crm", "CRM"],
] as const;

// Casos de estudio: un archivo por caso en src/db/seed/projects (orden en su index.ts).

// Nombres y precios base: del dueño. Todos los precios son «desde»; el alcance se confirma antes de empezar.
const PLANS = [
  {
    slug: "madriguera", category: "web" as const, name: "Madriguera", price: "85",
    tagline: "Landing profesional: una página que presenta tu negocio y recibe contactos.", delivery: "3 a 5 días hábiles",
    features: ["Página única con tu marca y tus servicios", "Diseño responsive para celular y escritorio", "Botón de WhatsApp y formulario de contacto", "SEO básico y carga rápida", "Publicación en tu dominio"],
  },
  {
    slug: "impulso", category: "web" as const, name: "Impulso", price: "150",
    tagline: "Web comercial con las secciones que tu negocio necesita mostrar.", delivery: "1 a 2 semanas",
    features: ["Hasta 5 secciones o páginas", "Diseño a medida de tu marca", "Formulario de contacto y WhatsApp", "SEO en cada página", "Mapa, redes y datos de contacto", "Medición de visitas"],
  },
  {
    slug: "turbo", category: "web" as const, name: "Turbo", price: "250", featured: true,
    tagline: "Web administrable: editás textos, imágenes y novedades sin depender de nadie.", delivery: "2 a 3 semanas",
    features: ["Todo lo de Impulso", "Panel para editar textos e imágenes", "Blog o sección de novedades", "SEO técnico: sitemap, datos estructurados, Open Graph", "Optimización de velocidad", "Capacitación para usar el panel"],
  },
  {
    slug: "conecta", category: "web" as const, name: "Conecta", price: "320",
    tagline: "Web + integraciones: tu sitio conectado con el catálogo, el CRM o las herramientas que ya usás.", delivery: "3 a 4 semanas",
    features: ["Todo lo de Turbo", "Catálogo de productos o servicios", "Pedidos o consultas por WhatsApp", "Formularios conectados a tu planilla o CRM", "Una integración por API o webhook con una herramienta externa"],
  },
  {
    slug: "automatiza", category: "systems" as const, name: "Automatiza", price: "450",
    tagline: "Automatización puntual: un proceso repetitivo que deja de hacerse a mano.", delivery: "2 a 3 semanas, según el proceso",
    features: ["Relevamiento del proceso tal como se hace hoy", "Automatización de un flujo de punta a punta", "Avisos por email o WhatsApp", "Registro de cada ejecución", "Documentación de uso"],
  },
  {
    slug: "escala", category: "systems" as const, name: "Escala", price: "650",
    tagline: "Integraciones y panel de control: varios flujos conectados y visibles en un solo lugar.", delivery: "Desde 4 semanas, según alcance",
    features: ["Todo lo de Automatiza", "Varios flujos automatizados sobre el mismo proceso", "Integración entre dos sistemas por API o webhooks", "Panel con el estado de cada proceso", "Reportes automáticos"],
  },
  {
    slug: "sistema", category: "systems" as const, name: "Sistema", price: "900", featured: true,
    tagline: "Aplicación web a medida para un área de tu operación.", delivery: "Por fases; se define con el alcance",
    features: ["Módulo a medida: ventas, inventario, clientes u operaciones", "Usuarios y permisos por rol", "Dashboard y reportes", "Importación de tus datos actuales", "Backups programados", "Acompañamiento después del lanzamiento"],
  },
  {
    slug: "infinito", category: "systems" as const, name: "Infinito", price: "1500",
    tagline: "IA + sistemas + arquitectura escalable, construidos por fases.", delivery: "A definir según alcance",
    features: ["Precio desde USD 1.500: alcance y fases se definen por escrito antes de empezar", "Varios módulos conectados sobre una sola base de datos", "Integraciones con tus sistemas y servicios externos", "IA aplicada donde aporta, con reglas críticas fuera del modelo", "Arquitectura preparada para crecer", "Evolución continua del sistema"],
  },
];

// Preguntas: del dueño. Las seis primeras se muestran en el Home (copy aprobado: no tocar). El resto responde,
// en 2–4 oraciones autocontenidas, lo que la gente pregunta antes de contratar, con enlace a la página que lo
// desarrolla. Solo afirman lo que el sitio ya dice (planes, proceso, servicios, casos). El seed no pisa filas
// existentes: si la base ya tiene las preguntas viejas, hay que borrarlas o editarlas desde el admin.
const FAQS: { question: string; answer: string; category: string; home?: boolean }[] = [
  {
    question: "¿Trabajan solo con empresas grandes?", category: "General", home: true,
    answer: "No. Lo importante no es el tamaño sino que exista un proceso que valga la pena mejorar. Un equipo chico con una operación desordenada tiene tanto para ganar como una empresa grande.",
  },
  {
    question: "¿Pueden trabajar sobre un sistema existente?", category: "General", home: true,
    answer: "Sí. Primero evaluamos arquitectura, código, datos y riesgos antes de proponer cambios. Con eso te decimos qué conviene: mejorarlo, ampliarlo o reemplazar una parte.",
  },
  {
    question: "¿Usan inteligencia artificial en todos los proyectos?", category: "Servicios", home: true,
    answer: "No. Solo cuando resuelve algo concreto. Muchos problemas se resuelven mejor con buenas reglas, automatización y software tradicional. Si tu caso es uno de esos, te lo decimos antes de empezar.",
  },
  {
    question: "¿Pueden integrar sistemas que ya usamos?", category: "Servicios", home: true,
    answer: "Sí. Trabajamos con APIs, webhooks, bases de datos y servicios externos siempre que exista una forma segura de integración. Lo primero que revisamos es qué permite el sistema que ya usás.",
  },
  {
    question: "¿Cuánto tarda un proyecto?", category: "Proceso", home: true,
    answer: "Depende del alcance. Una automatización puntual puede requerir días; una plataforma empresarial se desarrolla por fases durante varias semanas. En la propuesta te decimos qué entra en cada fase y cuándo podés empezar a usarla.",
  },
  {
    question: "¿Trabajan por etapas?", category: "Proceso", home: true,
    answer: "Sí. Preferimos entregar bloques funcionales y validar el proceso antes de construir módulos innecesarios. Así vas viendo el sistema en uso desde el principio y decidís el siguiente paso con información real.",
  },
  {
    question: "¿El código queda para el cliente?", category: "General",
    answer: "Depende del modelo contratado, y queda explícito por escrito antes de empezar. No hay sorpresas después del lanzamiento.",
  },
  {
    question: "¿Qué diferencia hay entre una web y un sistema empresarial?", category: "General",
    answer: "Una web presenta tu negocio y recibe contactos: su trabajo es que te encuentren y te escriban. Un sistema empresarial es donde se hace el trabajo de todos los días: guarda los datos de la operación (clientes, inventario, pedidos, cotizaciones) con usuarios, permisos por rol y reportes. Muchas veces se combinan: una [plataforma web](/servicios/web-y-ecommerce) conectada con el stock o los pedidos de un [sistema interno](/servicios/sistemas-empresariales). Si no sabés cuál necesitás, el [diagnóstico express](/diagnostico) te orienta en cinco preguntas.",
  },
  {
    question: "¿Trabajan solamente con empresas de Bolivia?", category: "General",
    answer: "No. Somos de Bolivia y trabajamos con empresas de cualquier lugar. Todo el proceso se puede hacer de forma remota, y recibimos pagos desde cualquier país.",
  },
  {
    question: "¿Cuándo conviene automatizar un proceso?", category: "Servicios",
    answer: "Cuando la tarea se repite todas las semanas, tiene reglas claras, sus datos ya viven en un sistema o en una planilla ordenada y un error se nota y se corrige fácil. Si el proceso está por cambiar, o cada persona lo hace distinto, primero conviene ordenarlo. La [calculadora de procesos manuales](/calculadora) estima cuánto tiempo y dinero cuesta hoy esa tarea, y en [Automatización e integraciones](/servicios/automatizacion) contamos cómo lo encaramos: un proceso por vez, de punta a punta.",
  },
  {
    question: "¿Cómo conectan sistemas que hoy trabajan separados?", category: "Servicios",
    answer: "Primero revisamos qué permite cada sistema: una API, webhooks, acceso a la base de datos o intercambio de archivos. Con eso definimos qué dato viaja, en qué dirección y cuál de los sistemas es la fuente de verdad, y construimos la [integración](/servicios/automatizacion) con registro de cada ejecución para saber qué pasó si algo falla. El resultado es que el dato se carga una sola vez y aparece donde hace falta, sin que nadie lo copie a mano.",
  },
  {
    question: "¿Cuándo una empresa necesita un CRM propio?", category: "Servicios",
    answer: "Cuando un CRM genérico te obliga a adaptar tu forma de vender al software, o cuando clientes, oportunidades y seguimiento ya están repartidos entre planillas, mensajes y la agenda de cada persona. Un CRM a medida tiene sentido si tu proceso comercial tiene etapas, reglas o datos propios y necesita conectarse con el resto de la operación: stock, cotizaciones, agenda o el sitio web. Si una herramienta estándar cubre bien tu proceso, te lo decimos antes de empezar. El caso del [CRM inmobiliario](/proyectos/crm-inmobiliario) muestra cómo queda cuando el CRM y el sitio público comparten los mismos datos.",
  },
  {
    question: "¿Qué puede automatizar una empresa con IA?", category: "Servicios",
    answer: "Tareas con mucho texto o imágenes y reglas difíciles de escribir a mano: responder consultas repetidas con datos reales del negocio, clasificar lo que entra, extraer datos de documentos e interpretar pedidos escritos en texto libre. Lo que no conviene dejarle a un modelo son los cálculos y las reglas críticas: precios, stock y permisos se resuelven con código, siempre igual. Así funciona el [asistente de ventas con IA](/proyectos/asistente-de-ventas-con-ia): el modelo interpreta la consulta y las herramientas del sistema devuelven los datos. Más en [IA aplicada](/servicios/inteligencia-artificial).",
  },
  {
    question: "¿Cómo abordan un proyecto de software?", category: "Proceso",
    answer: "En seis pasos: entender, modelar, construir, probar, medir y mejorar. Primero entendemos cómo se trabaja hoy y convertimos el proceso en flujos, datos y reglas explícitas; recién después desarrollamos por bloques funcionales que podés usar y revisar desde el principio. Lo que no puede fallar (permisos, cálculos, integraciones) se cubre con pruebas automáticas y, después de lanzar, medimos qué cambió en la operación y mejoramos sobre lo que ya funciona. Los [casos de estudio](/proyectos) muestran ese recorrido en proyectos reales.",
  },
  {
    question: "¿Cuánto cuesta desarrollar un sistema a medida?", category: "Precios",
    answer: "Depende del alcance: cuántos módulos, usuarios, integraciones y reglas tiene el proceso. Como referencia publicamos precios base en [Planes](/planes): los planes web empiezan desde USD 85, los de automatización y sistemas desde USD 450, y una aplicación web a medida para un área de la operación (plan Sistema) desde USD 900. El valor final se confirma por escrito antes de comenzar, después de entender qué necesitás.",
  },
  {
    question: "¿Qué necesitan para cotizar?", category: "Precios",
    answer: "Que nos cuentes qué querés resolver, cómo lo hacen hoy, cuántas personas participan y qué herramientas usan. Con eso te damos una propuesta con alcance, plazo y precio. El [formulario de contacto](/contacto) y el [diagnóstico express](/diagnostico) ya preguntan todo eso.",
  },
  {
    question: "¿Trabajan con información sensible?", category: "Soporte",
    answer: "Podemos construir sistemas con controles de acceso, auditoría y seguridad. El tratamiento específico se define según el tipo de información y el contexto legal del proyecto.",
  },
  {
    question: "¿Qué pasa después del lanzamiento?", category: "Soporte",
    answer: "Acompañamos la puesta en marcha, corregimos lo que aparezca y dejamos documentación para que tu equipo pueda operar el sistema. A partir de ahí podés seguir con un plan de mantenimiento o pedirnos mejoras cuando las necesites.",
  },
];

// Metadata por ruta (tabla seo_metadata; pisa lo que define la página). Servicios, casos y artículos llevan la
// suya en seoTitle/seoDescription. Título: sin el nombre del sitio y de hasta ~46 caracteres, porque la plantilla
// agrega « · Burrow Labs»; si ya contiene «Burrow Labs» se usa tal cual (Home y Nosotros). Descripción: 140–160
// caracteres, qué resuelve la página y para quién. Ningún título repetido. Mapa de intención: docs/SEO-CONTENT-ROADMAP.md
const SEO: [path: string, title: string, description: string][] = [
  ["/", "Burrow Labs | Software a medida en Bolivia", "Software studio en Cochabamba, Bolivia: sistemas a medida, automatizaciones, integraciones e IA aplicada para empresas que quieren operar con menos trabajo manual."],
  ["/servicios", "Servicios de software a medida para empresas", "Cuatro servicios para empresas: sistemas empresariales, automatización e integraciones, IA aplicada y plataformas web. Primero entendemos el proceso."],
  ["/proyectos", "Casos de estudio de software a medida e IA", "Casos reales de sistemas empresariales, e-commerce, CRM, trazabilidad, cotizaciones e IA aplicada: qué problema había, qué construimos y qué cambió."],
  ["/planes", "Precios de páginas web y sistemas a medida en Bolivia", "Precios base publicados: planes web desde USD 85 y planes de automatización y sistemas desde USD 450. El alcance final se confirma por escrito antes de empezar."],
  ["/nosotros", "Burrow Labs | Software studio en Cochabamba, Bolivia", "Quiénes somos y cómo trabajamos: un software studio con base en Cochabamba que entiende el proceso antes de programar. Entender, modelar, construir, probar, medir y mejorar."],
  ["/clientes", "Clientes y sectores con los que trabajamos", "Sectores para los que construimos software, automatizaciones e integraciones: industria, comercio, inmobiliarias, servicios, retail, manufactura y tecnología."],
  ["/lab", "Lab: notas de automatización, software e IA", "Notas y experimentos de Burrow Labs sobre automatización de procesos, software empresarial e IA aplicada: qué conviene hacer, qué no y por dónde empezar."],
  ["/contacto", "Contacto: cotizá tu sistema o automatización", "Software studio en Cochabamba, Bolivia. Contanos cómo funciona hoy tu proceso: vemos qué vale la pena automatizar, integrar o convertir en sistema y te respondemos con una propuesta concreta."],
  ["/diagnostico", "Diagnóstico express: ¿qué necesita tu negocio?", "Respondé cinco preguntas en dos minutos y te decimos por dónde conviene empezar: una web, una automatización, un sistema a medida, una integración o IA."],
  ["/calculadora", "Calculadora de costo de procesos manuales", "Calculá cuántas horas y cuánto dinero por año le cuesta a tu empresa una tarea que se hace a mano todas las semanas, y qué parte de ese tiempo es repetitiva."],
  ["/faq", "Preguntas frecuentes sobre software a medida", "Respuestas directas sobre costos, plazos, automatización, integraciones, IA, CRM a medida, propiedad del código y cómo abordamos un proyecto de software."],
  ["/desarrollo-de-software-cochabamba", "Desarrollo de software a medida en Cochabamba", "Software studio en Cochabamba, Bolivia: sistemas a medida, apps móviles, automatización, integraciones e IA para empresas de Bolivia y del exterior."],
  ["/privacidad", "Política de privacidad", "Qué datos recopila el sitio de Burrow Labs en sus formularios y estadísticas, para qué se usan, cuánto tiempo se conservan y cómo pedir acceso o eliminación."],
  ["/terminos", "Términos y condiciones", "Condiciones de uso del sitio de Burrow Labs: información y precios base, herramientas de estimación, propiedad intelectual, contratos y ley aplicable."],
  ["/cookies", "Política de cookies", "Qué cookies y almacenamiento local usa el sitio de Burrow Labs, cómo cambiar tu elección y cómo medimos el uso del sitio sin cookies, con un identificador seudónimo diario."],
];

/** Contenido inicial del sitio. Idempotente: nunca pisa filas existentes. */
export async function seedContent(db: Db): Promise<void> {
  await db
    .insert(siteSettings)
    .values(Object.entries(SETTINGS).map(([key, value]) => ({ key, value })))
    .onConflictDoNothing();

  await db
    .insert(homeSections)
    .values(HOME_SECTION_KEYS.map((key, i) => ({ key, enabled: true, sort: (i + 1) * 10, content: HOME_SECTIONS[key].defaults })))
    .onConflictDoNothing();

  await db
    .insert(services)
    .values(SERVICES.map((s, i) => ({ ...s, sort: (i + 1) * 10, ...published })))
    .onConflictDoNothing();

  await db
    .insert(projectCategories)
    .values(PROJECT_CATEGORIES.map(([slug, name], i) => ({ slug, name, sort: (i + 1) * 10 })))
    .onConflictDoNothing();
  const categories = new Map((await db.select().from(projectCategories)).map((c) => [c.slug, c.id]));
  const createdProjects = await db
    .insert(projects)
    .values(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- `services` no es columna de projects: va a project_services, más abajo
      PROJECTS.map(({ category, services: _services, ...p }, i) => ({
        ...p,
        categoryId: categories.get(category),
        clientPublic: false,
        sort: (i + 1) * 10,
        ...published,
      })),
    )
    .onConflictDoNothing()
    .returning({ id: projects.id, slug: projects.slug });

  // Caso ↔ servicio. Como planFeatures: solo para los casos creados en esta corrida, así no se pisa lo que
  // alguien haya editado en el panel. onConflictDoNothing cubre la clave compuesta.
  const serviceIds = new Map((await db.select({ id: services.id, slug: services.slug }).from(services)).map((s) => [s.slug, s.id]));
  const links = createdProjects.flatMap(({ id: projectId, slug }) =>
    (PROJECTS.find((p) => p.slug === slug)?.services ?? []).flatMap((service) => {
      const serviceId = serviceIds.get(service);
      return serviceId ? [{ projectId, serviceId }] : [];
    }),
  );
  if (links.length) await db.insert(projectServices).values(links).onConflictDoNothing();

  for (const [i, { price, delivery, features, featured, ...plan }] of PLANS.entries()) {
    const [created] = await db
      .insert(plans)
      .values({
        ...plan,
        priceAmount: price,
        currency: "USD",
        priceMode: "from",
        deliveryTime: delivery,
        featured: featured ?? false,
        ctaLabel: `Quiero el plan ${plan.name}`,
        sort: (i + 1) * 10,
        ...published,
      })
      .onConflictDoNothing()
      .returning({ id: plans.id });
    if (created) {
      await db.insert(planFeatures).values(features.map((text, j) => ({ planId: created.id, text, sort: (j + 1) * 10 })));
    }
  }

  for (const [i, faq] of FAQS.entries()) {
    const [existing] = await db.select({ id: faqs.id }).from(faqs).where(eq(faqs.question, faq.question)).limit(1);
    if (existing) continue;
    await db.insert(faqs).values({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      showOnHome: faq.home ?? false,
      sort: (i + 1) * 10,
      ...published,
    });
  }

  await db
    .insert(postCategories)
    .values(POST_CATEGORIES.map((c, i) => ({ ...c, sort: (i + 1) * 10 })))
    .onConflictDoNothing();
  const postCats = new Map((await db.select().from(postCategories)).map((c) => [c.slug, c.id]));
  await db
    .insert(posts)
    .values(
      // Los tres primeros artículos no traen fecha: se escalonan hacia atrás desde el 30/09/2026.
      // Un artículo nuevo declara su propia `publishedAt` y no depende de su posición en la lista.
      POSTS.map(({ category, publishedAt, ...p }, i) => ({
        ...p,
        categoryId: postCats.get(category),
        status: "published" as const,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(Date.UTC(2026, 8, 30 - i * 7, 12)),
      })),
    )
    .onConflictDoNothing();

  await db
    .insert(seoMetadata)
    .values(SEO.map(([path, title, description]) => ({ path, title, description })))
    .onConflictDoNothing();
}
