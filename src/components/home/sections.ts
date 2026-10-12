// Contenido editable de cada sección del Home. `defaults` es el copy inicial (literal del brief)
// y también define la forma: el admin genera el formulario a partir de esta estructura y el seed
// siembra estas mismas filas en `home_sections`.

export const HOME_SECTIONS = {
  hero: {
    label: "Hero",
    defaults: {
      eyebrow: "SOFTWARE A MEDIDA · AUTOMATIZACIÓN · IA APLICADA",
      title: "CODIFICANDO SOLUCIONES.",
      body: "De procesos manuales a sistemas que dan control y escala. Diseñamos software, automatizaciones e integraciones para empresas que necesitan ordenar operaciones, conectar información y dejar atrás procesos que consumen tiempo.",
      ctaPrimary: "Contanos qué querés resolver",
      ctaSecondary: "Ver proyectos",
      badge: "Cochabamba, Bolivia · Working everywhere",
      bridge: "Vos ves tareas repetitivas. Nosotros vemos un sistema esperando ser construido.",
      surfaceItems: ["Excel", "Mensajes", "Papeles", "Tareas repetitivas", "Datos aislados", "Sistemas desconectados"],
      depthItems: ["Datos", "APIs", "Automatizaciones", "Dashboards", "Software", "IA"],
      closingTitle: "BURROW LABS",
      closingTagline: "CODIFICANDO SOLUCIONES.",
    },
  },
  phrases: {
    label: "Frases de marca",
    defaults: {
      kicker: "Lo que repetimos en el taller",
    },
  },
  social_proof: {
    label: "Social proof",
    defaults: {
      title: "Tecnología construida para negocios reales.",
      sectorsLabel: "Sectores para los que construimos",
      clientsLabel: "Confían en Burrow Labs",
    },
  },
  problem: {
    label: "Problema",
    defaults: {
      eyebrow: "El problema",
      title: "Tu negocio no necesita otra herramienta. Necesita que las herramientas trabajen juntas.",
      body: "Si tu equipo carga la misma información en tres lugares, el problema no es la gente: es el proceso.",
      beforeLabel: "Antes",
      before: ["Excel", "WhatsApp", "Formularios", "Emails", "Papeles", "Sistemas aislados"],
      hubLabel: "Burrow Labs",
      afterLabel: "Después",
      after: ["Un solo flujo", "Automatización", "Datos centralizados", "Dashboard", "API", "IA"],
      phrase: "Desenterramos procesos lentos y los convertimos en sistemas.",
    },
  },
  pains: {
    label: "¿Te suena alguno?",
    defaults: {
      eyebrow: "Problemas frecuentes",
      title: "¿Te suena alguno?",
      items: [
        "La operación depende de hojas de cálculo.",
        "La misma información se carga en varios lugares.",
        "Los pedidos se siguen manualmente.",
        "El equipo pierde tiempo buscando datos.",
        "Los clientes esperan respuestas demasiado tiempo.",
        "Los sistemas actuales no se comunican.",
        "Los reportes requieren horas de trabajo.",
        "El crecimiento está generando desorden operativo.",
      ],
      closing: "Si el problema está en el proceso, probablemente no necesitás otra herramienta aislada. Necesitás que el sistema acompañe cómo trabaja tu empresa.",
      cta: "Contanos qué querés resolver",
    },
  },
  services: {
    label: "Servicios",
    defaults: {
      eyebrow: "Servicios",
      title: "Primero entendemos el proceso. Después escribimos código.",
      body: "Sistemas empresariales, automatización e integraciones, IA aplicada y plataformas web. Elegimos la herramienta después de entender el problema.",
      cta: "Ver todos los servicios",
      phrase: "Antes de automatizar algo, entendemos por qué existe.",
    },
  },
  process: {
    label: "Cómo trabajamos",
    defaults: {
      eyebrow: "Cómo trabajamos",
      title: "Cavamos profundo. Construimos mejor.",
      body: "No empezamos por el código. Empezamos por entender cómo trabaja tu negocio. Seis estaciones, siempre en el mismo orden: sabés en cuál estamos y qué viene después.",
      steps: [
        { number: "01", name: "Entender", text: "Cómo se trabaja hoy, quién hace qué y dónde se pierde el tiempo." },
        { number: "02", name: "Modelar", text: "El proceso en flujos, datos y reglas explícitas antes de programar." },
        { number: "03", name: "Construir", text: "Desarrollamos por entregas verificables." },
        { number: "04", name: "Probar", text: "QA, seguridad, responsive y rendimiento." },
        { number: "05", name: "Medir", text: "Qué cambió en la operación, con datos reales." },
        { number: "06", name: "Mejorar", text: "Ajustamos y ampliamos sobre lo que ya funciona." },
      ],
      phrase: "El burro hace el trabajo pesado.",
    },
  },
  projects: {
    label: "Proyectos",
    defaults: {
      eyebrow: "Proyectos",
      title: "Proyectos reales detrás de cada frase.",
      body: "Apple Boss y Commerce Intelligence, proyectos propios, y casos para empresas que no nombramos. De cada uno contamos qué problema había, qué construimos, con qué tecnología y qué cambió.",
      cta: "Ver todos los proyectos",
    },
  },
  trust: {
    label: "Confianza",
    defaults: {
      eyebrow: "Cómo cuidamos lo que construimos",
      title: "Código bonito está bien. Código que sigue funcionando es mejor.",
      body: "Lo que no se ve en una demo es lo que mantiene un sistema en pie.",
      pillars: [
        { name: "Proyectos reales", text: "Casos documentados: qué problema había, qué se construyó y qué cambió en la operación." },
        { name: "Arquitectura mantenible", text: "Código ordenado para que el sistema pueda crecer sin reescribirse." },
        { name: "QA automatizado", text: "Suite de pruebas que protege los flujos críticos: permisos, cálculos, integraciones." },
        { name: "Seguridad", text: "Validación de entradas, sesiones cuidadas y secretos fuera del código." },
        { name: "Roles y permisos", text: "Cada persona ve y toca solo lo que le corresponde." },
        { name: "Documentación", text: "Lo necesario para que otra persona pueda operar y continuar el sistema." },
        { name: "Backups", text: "Copias programadas y probadas, cuando el proyecto lo requiere." },
        { name: "Integraciones reales", text: "APIs, webhooks, pagos o n8n, por ejemplo: las herramientas que ya usás, conectadas." },
        { name: "Responsive", text: "Funciona igual de bien en el celular que en el escritorio." },
        { name: "CMS administrable", text: "Editás textos, imágenes y catálogo desde tu propio panel, sin depender de nadie." },
        { name: "Soporte de evolución", text: "El lanzamiento no es el final: el sistema se ajusta y crece con la operación." },
      ],
      phrase: "Ideas tercas. Sistemas inteligentes.",
    },
  },
  calculator: {
    label: "Calculadora",
    defaults: {
      eyebrow: "Calculadora de procesos manuales",
      title: "¿Cuánto tiempo pierde tu empresa haciendo esto a mano?",
      body: "Poné números aproximados de una tarea que se repite todas las semanas.",
      peopleLabel: "Personas involucradas",
      hoursLabel: "Horas semanales por persona",
      costLabel: "Costo aproximado por hora (USD)",
      weeksLabel: "Semanas por año",
      repetitiveLabel: "Parte de la tarea que es repetitiva y con reglas claras",
      hoursResultLabel: "Horas al año",
      costResultLabel: "Costo aproximado al año",
      recoverableLabel: "Tiempo potencial recuperable",
      disclaimer:
        "Es una estimación orientativa con tus propios números. No es una promesa de ahorro: cuánto se puede automatizar depende de cada proceso y se define en el diagnóstico.",
      cta: "Veamos qué podemos automatizar.",
      shareLabel: "Copiar enlace con estos números",
      diagnosticCta: "¿No sabés por dónde empezar? Hacé el diagnóstico express",
    },
  },
  plans: {
    label: "Planes",
    defaults: {
      eyebrow: "Planes",
      title: "De procesos manuales a sistemas que escalan.",
      body: "Puntos de partida con precio base publicado. El alcance final se confirma antes de comenzar.",
      webTab: "Planes web",
      systemsTab: "Automatización y sistemas",
      cta: "Ver planes en detalle",
    },
  },
  game: {
    label: "Burrow Runner",
    defaults: {
      eyebrow: "Un descanso",
      title: "BURROW RUNNER",
      body: "Esquivá bugs, hojas de Excel gigantes y servidores en llamas. Juntá código por el camino.",
      play: "Jugar",
      controls: "Espacio o flecha arriba para saltar. En el celular, tocá la pantalla.",
      lose: "Los bugs ganaron esta ronda.",
      loseQuestion: "¿Tu negocio también está esquivando obstáculos?",
      loseCta: "Construyamos algo mejor.",
    },
  },
  faq: {
    label: "FAQ",
    defaults: {
      eyebrow: "Preguntas frecuentes",
      title: "Lo que nos preguntan antes de empezar.",
      cta: "Ver todas las preguntas",
    },
  },
  final_cta: {
    label: "CTA final",
    defaults: {
      title: "¿Tenés un proceso que te está haciendo perder tiempo?",
      body: "Contanos cómo funciona hoy. Nosotros vemos qué vale la pena automatizar, integrar o convertir en sistema.",
      cta: "Contanos qué querés resolver",
      secondary: "Hacer el diagnóstico express",
    },
  },
} as const;

export type HomeSectionKey = keyof typeof HOME_SECTIONS;
export const HOME_SECTION_KEYS = Object.keys(HOME_SECTIONS) as HomeSectionKey[];

type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Widen<U>[]
    : T extends object
      ? { -readonly [K in keyof T]: Widen<T[K]> }
      : T;
export type HomeContent<K extends HomeSectionKey> = Widen<(typeof HOME_SECTIONS)[K]["defaults"]>;

/** Mezcla lo guardado sobre los defaults respetando su forma; lo que no encaja se descarta. */
export function mergeContent<T>(defaults: T, raw: unknown): T {
  if (Array.isArray(defaults)) {
    if (!Array.isArray(raw) || raw.length === 0) return defaults;
    const sample: unknown = defaults[0];
    return raw
      .filter((item) => typeof item === typeof sample)
      .map((item) => (typeof sample === "object" && sample !== null ? mergeContent(sample, item) : item)) as T;
  }
  if (typeof defaults === "object" && defaults !== null) {
    const source = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
    return Object.fromEntries(Object.entries(defaults).map(([k, v]) => [k, mergeContent(v, source[k])])) as T;
  }
  return typeof raw === typeof defaults ? (raw as T) : defaults;
}

export function isHomeSectionKey(key: string): key is HomeSectionKey {
  return key in HOME_SECTIONS;
}

export function parseSectionContent<K extends HomeSectionKey>(key: K, raw: unknown): HomeContent<K> {
  return mergeContent(HOME_SECTIONS[key].defaults as HomeContent<K>, raw);
}
