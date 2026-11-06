// Caso de estudio: Burrow Prospect (producto propio, uso interno). Contenido verificado contra el README, el código y los
// diagramas del proyecto (06/11/2026). Sin números de teléfono, precios, claves ni negocios reales: las capturas usan
// datos de ejemplo (output/capturas-casos/burrow-prospect/LEEME.md).
import type { SeedProject } from "./types";

export const project: SeedProject = {
  slug: "burrow-prospect",
  title: "Burrow Prospect by Burrow Labs: de la ficha de Google a la reunión",
  category: "ia",
  services: ["inteligencia-artificial", "automatizacion", "sistemas-empresariales"],
  badge: "Producto propio",
  sector: "Prospección comercial",
  visual: "flow",
  summary:
    "Nuestro sistema para conseguir clientes: busca negocios en Google, los puntúa con hechos, pide permiso, escribe por WhatsApp y un agente de IA responde sin inventar. Laravel, React y PostgreSQL.",
  problem: `Conseguir clientes para un estudio de software tiene un trabajo repetitivo detrás: encontrar negocios, ver qué les falta de verdad, conseguir un contacto, escribir, hacer seguimiento y mostrar qué se podría construir para cada uno. Hecho a mano, ese trabajo se corta en cada paso.

Y el atajo habitual es el peor: copiar números de Google Maps y mandar el mismo mensaje a todos. Eso es spam, no tiene permiso de nadie y quema el canal, porque WhatsApp limita o bloquea a quien escribe sin que lo esperen. Necesitábamos lo contrario: pocos mensajes, a quien aceptó recibirlos, con algo concreto para su negocio.`,
  context: `Burrow Prospect es una herramienta interna de Burrow Labs: la usamos nosotros para conseguir nuestros propios clientes, en español de Bolivia y con la hora de La Paz. Analiza negocios de Bolivia, Argentina y Colombia, y solo contacta en Bolivia.

En Bolivia, el canal donde un negocio responde es WhatsApp. Por eso todo pasa por la API oficial de Meta: plantillas aprobadas para el primer mensaje, una ventana de 24 horas para conversar después de que el negocio escribe, y webhooks firmados para cada mensaje que entra. Hacia afuera, siempre firma Burrow Labs: ningún mensaje, correo ni propuesta lleva el nombre de una persona.`,
  solution: `Construimos el recorrido completo, de la búsqueda a la reunión, con un rastro en cada paso:

1. **Buscar.** Barridos en Google Places por rubro y ciudad, con un tope mensual.
2. **Puntuar.** Un score de 0 a 100 que solo usa hechos observados: si la ficha de Google enlaza un sitio propio, si tiene teléfono público, cuántas reseñas y qué rating. El score ordena; no excluye a nadie.
3. **La ficha.** Auditoría del sitio web, datos de Maps y una lectura de IA que propone qué ofrecer, qué mini apps le servirían y qué preguntarle.
4. **Llamadas.** Los mejores prospectos sin permiso todavía, con un guion armado con sus hechos. Si acepta, queda registrado quién atendió, cuándo y a qué número.
5. **Autopiloto.** La IA redacta un borrador por negocio; nosotros aprobamos el lote viendo cada mensaje completo, y el envío sale con ritmo, tope diario y horario.
6. **El agente de WhatsApp.** Cuando el negocio responde, contesta corto y solo con lo que está escrito. Si le falta un dato, pasa la conversación a una persona.
7. **La demo.** Cada rubro tiene una mini app que funciona de verdad, con un enlace corto propio para cada negocio.
8. **La reunión.** Día y hora en la agenda, con invitación pública, archivo de calendario y enlace a Google Calendar.

Cada cambio de estado queda en el historial de la ficha. Cada envío tiene su mensaje y cada permiso tiene quién lo dio, cuándo y a qué número.`,
  challenge: `El primer desafío fue no hacer spam con una herramienta pensada para escribir a muchos negocios. La respuesta está en el código, no en la buena voluntad: sin permiso registrado no se escribe, y encontrar un número publicado no es permiso. Una baja vale para todos los canales y para todas las fichas con ese número, y un «no me interesa» corto también es baja. El primer contacto de cada lote y cada plantilla pasan por una aprobación humana.

El segundo fue un agente de IA que conversa con clientes reales sin inventar. Un modelo de lenguaje puede prometer un precio, un plazo o un alcance con la misma seguridad con la que acierta. Por eso responde solo con una base de conocimiento escrita, la ficha del negocio y la conversación, y un filtro de salida solo deja pasar los montos y plazos que fijó el dueño. Además tuvo que aprender a reconocer lo que no es una persona: los contestadores automáticos de los negocios y otros asistentes de IA. Dos IAs no venden: si del otro lado responde un bot, el agente se calla y avisa.`,
  architecture: `Una sola aplicación, con trabajo pesado en segundo plano:

- **App:** Laravel 13 con Inertia y React 19 en TypeScript, Tailwind 4 y PostgreSQL 18.
- **Worker:** una cola que redacta borradores, envía con ritmo, responde con el agente, baja archivos y transcribe audios de WhatsApp.
- **Scheduler:** sincroniza con burrowlabs.com.bo cada 10 minutos, actualiza el estado de las plantillas en Meta cada hora y reprograma lo aprobado que esperaba el tope o el horario.
- **Integraciones:** WhatsApp Cloud API con webhooks firmados, Google Places para la búsqueda y la ficha, y un modelo de lenguaje para borradores, propuestas, la lectura de la ficha y el agente.

Corre en contenedores (app, worker, scheduler y base) en el mismo servidor que otros sitios, detrás de un proxy compartido. Cada despliegue respalda la base, migra, comprueba la salud de la app y verifica que los demás sitios sigan respondiendo igual; un script vuelve al release anterior si hace falta. La base se respalda cada día y se guardan 14 días.`,
  sections: `## Demos que funcionan

Cada rubro tiene una mini app real, no una maqueta: dos pantallas con el mismo estado. En el celular, el cliente reserva, pide, compra, agenda o cotiza; en el panel, el dueño ve el día con cifras, su agenda o su cocina, clientes, reportes y automatizaciones. Lo que pasa de un lado aparece del otro.

- Hay cinco tipos de mini app (agenda, pedidos, catálogo, listado y cotización) con un mundo visual por familia de rubros: paleta, tipografía y colores de gráficos propios.
- El nombre, la dirección y las reseñas salen de la ficha de Google del negocio. Los precios, personas y productos son de ejemplo, y la página lo dice.
- La demo no guarda nada en el servidor ni le escribe a nadie. Cuando el negocio abre su enlace, pide una reunión o llena la ficha de requerimientos, nos llega un aviso.

## El agente de WhatsApp

Responde solo a quien escribe, dentro de la ventana de 24 horas, en tres frases como máximo. Antes de contestar, un filtro separa lo que no escribió una persona: el contestador automático del negocio, una ráfaga de mensajes o un pedido de baja. Si el contestador tapa nuestro mensaje, se reenvía a los 90 segundos aclarando que es para el dueño o encargado, una sola vez.

Cuando le falta un dato, hay un reclamo o un tema legal, o el negocio pide una persona, el agente responde con un mensaje cordial fijo y nos avisa con el motivo («falta un dato: …»). Lo que falta se agrega a la base de conocimiento y desde entonces el agente lo usa. Aparte de las pruebas automatizadas, el agente tiene una evaluación con IA real de 68 casos de conversación.

## Conectado con este sitio

Las consultas y las fichas de proyecto que llegan a burrowlabs.com.bo pasan a Prospect cada 10 minutos y se unen al prospecto por teléfono o correo. La sincronización trae solo los campos útiles para atender: nunca presupuestos acordados, descuentos, pagos ni notas internas. Sin el token compartido, la ruta del sitio no existe; con uno equivocado, responde 401 sin tocar la base. Repetir la sincronización no duplica nada.`,
  features: [
    "Búsqueda en Google Places por rubro y ciudad, con barridos y tope mensual",
    "Score de 0 a 100 solo con hechos observados en la ficha de Google",
    "Ficha con auditoría web, datos de Maps y lectura de IA",
    "Modo llamadas: guion con los hechos del negocio y permiso registrado",
    "Autopiloto: lotes de borradores con aprobación, ritmo, tope diario y horario",
    "WhatsApp por la API oficial de Meta, con plantillas aprobadas y bandeja en vivo",
    "Agente de IA con base de conocimiento escrita, que deriva a una persona cuando duda",
    "Demos por rubro que funcionan, con enlace corto propio para cada negocio",
    "Agenda con invitación pública, archivo .ics y Google Calendar",
    "Métricas: embudo, respuestas, permisos y envíos",
  ],
  stack: ["Laravel", "PHP", "React", "TypeScript", "Inertia", "Tailwind CSS", "PostgreSQL", "WhatsApp Cloud API", "Google Places", "Anthropic", "OpenAI", "Docker"],
  result: `Burrow Prospect está en producción y es la herramienta con la que Burrow Labs busca y atiende a sus propios clientes. La versión 2.0.0 salió el 6 de noviembre de 2026.

**Sin un sistema.** Prospectar es buscar en Maps, copiar números y escribir uno por uno, con el riesgo de mandar lo mismo a todos y sin un registro de quién aceptó qué.

**Con Burrow Prospect.** Cada negocio llega con su score explicado, su ficha y una demo de su rubro. Solo se escribe a quien dio permiso, cada mensaje pasa por una aprobación y el agente responde sin inventar.

- Trazabilidad: cada permiso, envío, respuesta y cambio de estado queda en la ficha.
- Cumplimiento: plantillas aprobadas por Meta, bajas en todos los canales y topes de envío.
- Pruebas: ninguna prueba automatizada llama a Google, a Meta ni al modelo de lenguaje.
- Capacidad de crecer: los 60 rubros, los países y la base de conocimiento se amplían sin rehacer el sistema.`,
  resultsMetrics: [
    { label: "Pruebas automatizadas", value: "385" },
    { label: "Rubros con su ficha", value: "60" },
    { label: "Casos de evaluación del agente", value: "68" },
  ],
  ctaTitle: "¿Tu equipo comercial también vive entre Maps, WhatsApp y planillas?",
  ctaLead:
    "Construimos sistemas de prospección y atención a la medida de cada proceso, con permiso, trazabilidad e IA que no inventa. Contanos cómo consiguen clientes hoy.",
  seoTitle: "Burrow Prospect: prospección con IA y WhatsApp",
  seoDescription:
    "Caso de estudio: Burrow Prospect, nuestro sistema de prospección. Busca negocios en Google, pide permiso, escribe por WhatsApp y su agente de IA no inventa nada.",
  year: 2026,
  featured: true,
  website: "https://prospect.burrowlabs.com.bo/demos",
  gallery: [
    { key: "/capturas/burrow-prospect/inicio.webp", alt: "Inicio de Burrow Prospect con datos de ejemplo: prospectos, contactados, respuestas, reuniones, los negocios para contactar primero y las próximas reuniones", caption: "Inicio: el día de un vistazo, con qué negocios contactar primero, los seguimientos y las próximas reuniones (datos de ejemplo).", size: 210056, width: 3840, height: 2400 },
    { key: "/capturas/burrow-prospect/bandeja.webp", alt: "Bandeja de WhatsApp de Burrow Prospect con una conversación de ejemplo atendida por el agente de IA", caption: "Bandeja: el agente de IA responde dentro de la ventana de 24 horas y deja la cita en la agenda (datos de ejemplo).", size: 299518, width: 3840, height: 2400 },
    { key: "/capturas/burrow-prospect/ficha.webp", alt: "Ficha de un prospecto de ejemplo en Burrow Prospect, con el score, las etapas del embudo y la lectura de IA", caption: "Ficha: el score explicado con hechos, la etapa del embudo y la lectura de IA con qué ofrecerle (datos de ejemplo).", size: 261328, width: 3840, height: 2400 },
    { key: "/capturas/burrow-prospect/llamadas.webp", alt: "Modo llamadas de Burrow Prospect con el guion de una llamada de ejemplo y los botones para registrar el resultado", caption: "Llamadas: un guion con los hechos del negocio y el permiso registrado con quién atendió (datos de ejemplo).", size: 261644, width: 3840, height: 2400 },
    { key: "/capturas/burrow-prospect/demo.webp", alt: "Demo pública de Burrow Prospect para barberías: el panel del dueño y el celular del cliente, con datos de ejemplo", caption: "Demo de barbería: el panel del dueño y el celular del cliente comparten el mismo estado (datos de ejemplo).", size: 202848, width: 3840, height: 2400 },
  ],
};
