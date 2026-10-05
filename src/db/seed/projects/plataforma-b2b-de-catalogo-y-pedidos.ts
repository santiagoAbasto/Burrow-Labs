// Caso anonimizado: basado en proyectos industriales B2B reales, sin nombres ni cifras comerciales.
import type { SeedProject } from "./types";

export const project: SeedProject = {
  slug: "plataforma-b2b-de-catalogo-y-pedidos",
  title: "Plataforma B2B de catálogo y pedidos",
  category: "sistemas-empresariales",
  services: ["sistemas-empresariales", "web-y-ecommerce"],
  badge: "Proyecto B2B",
  sector: "Distribuidor industrial B2B",
  visual: "grid",
  summary:
    "Sitio público, portal privado y CMS para centralizar catálogo, precios por cliente, pedidos y contenido comercial de un proveedor industrial. Laravel, React e Inertia.",
  problem: `La información que un cliente necesitaba para comprar no vivía en un solo lugar. El catálogo mostraba los productos, pero el precio que le correspondía a cada empresa lo tenía el equipo comercial y se respondía por mensaje, uno por uno. Los pedidos entraban por ese mismo canal y después alguien los pasaba a mano a los procesos internos.

Cada paso funcionaba, pero entre uno y otro había una persona copiando, confirmando y corrigiendo. Contenido comercial, precios y operación se mantenían por separado, con versiones distintas de la misma información. Cuando cambiaba un precio, había que actualizarlo en más de un lugar y avisar a quien correspondiera.`,
  context: `El cliente es un proveedor industrial que vende a otras empresas. Sus compradores no son consumidores finales: son compañías con una condición comercial acordada, que necesitan ver el catálogo con el precio que les corresponde y pedir sin abrir una conversación cada vez.

Del lado del proveedor, el equipo administraba catálogo, contenido del sitio y pedidos con herramientas distintas. Hacía falta una plataforma que sirviera a los dos lados: una cara pública para presentar la empresa y sus productos, y un área privada donde cada cliente viera lo suyo y pudiera operar solo, sin depender de que alguien le responda.`,
  solution: `Construimos una sola plataforma con tres caras sobre el mismo catálogo. El sitio público presenta la empresa, las líneas de producto y el contenido comercial. El portal privado permite a cada cliente entrar con su usuario, ver sus precios, armar el carrito, enviar pedidos y consultar su documentación. Y el panel de administración, con un CMS integrado, es donde el equipo del proveedor mantiene todo eso sin tocar código.

Empezamos por el modelo de datos del catálogo, porque de ahí dependía todo lo demás. Recién después diseñamos las pantallas públicas y privadas, y por último el panel, de modo que cada parte consumiera la misma información en lugar de tener la suya.`,
  challenge: `El riesgo evidente era terminar con tres catálogos: uno para la web, otro para el portal y otro para la administración, cada uno con sus precios y su propio desfase. Es lo que pasa cuando el sitio público se arma con una herramienta, el portal con otra y la gestión con una tercera.

Decidimos que el catálogo fuera uno solo y que la diferencia entre lo público y lo privado estuviera en qué se muestra y a quién, no en los datos. Un producto se carga una vez; el contenido del sitio y el del portal salen de la misma base. Quien administra edita en un lugar y el cambio aparece en todas partes.`,
  architecture: `La plataforma está construida con **Laravel** sobre **MySQL**, que guarda catálogo, listas de precios, clientes, pedidos y contenido en un solo esquema. Las pantallas se arman con **Blade**, **React** e **Inertia** según lo que cada cara necesita, sin mantener una API separada: las rutas y la autorización viven en Laravel y la interfaz recibe los datos ya resueltos. **Vite** compila los assets de las tres caras.

Decisiones que ordenaron el proyecto:

- Un único modelo de producto para el sitio, el portal y la administración: nada se carga dos veces.
- Roles y permisos definidos en el backend, así cada pantalla muestra solo lo que ese usuario puede hacer.
- El CMS vive en el mismo panel: el contenido comercial es un dato más, no un sistema aparte.`,
  sections: "",
  features: [
    "Catálogo de productos con categorías y fichas de producto",
    "Precios según la condición comercial de cada cliente",
    "Portal privado de clientes con acceso por usuario",
    "Carrito y pedidos con historial y estados",
    "Gestión administrativa con roles y permisos por área",
    "CMS para el contenido comercial del sitio público",
    "Facturas o documentación comercial desde el portal",
    "Newsletter administrable desde el mismo panel",
    "Métricas de catálogo y pedidos para el equipo comercial",
    "Importación y exportación de catálogo y listas de precios",
  ],
  stack: ["Laravel", "PHP", "React", "Inertia", "Blade", "MySQL", "Vite"],
  result: `Catálogo, precios por cliente, pedidos y contenido comercial quedaron sobre una misma base, con tres caras (sitio, portal y administración) que leen la misma información.

**Antes.** El precio de cada empresa se respondía por mensaje, los pedidos entraban por ese canal y alguien los pasaba a mano al sistema interno. Un cambio de precio había que repetirlo en varios lugares.

**Después.** Cada cliente entra con su usuario, ve sus precios, arma el pedido y consulta su documentación sin abrir una conversación. Un precio se actualiza una vez.

- Menor duplicación de información: un solo catálogo para sitio, portal y administración; nada se carga dos veces.
- Reducción de tareas manuales: los pedidos nacen ya cargados en el sistema, sin que nadie los transcriba.
- Control de accesos: cada cliente ve solo su condición comercial; cada área del proveedor, lo que le corresponde.
- Información disponible desde un único sistema: productos, precios, contenido y pedidos en un solo panel.`,
  resultsMetrics: [],
  ctaTitle: "",
  ctaLead: "",
  seoTitle: "Plataforma B2B de catálogo, precios y pedidos",
  seoDescription:
    "Caso de estudio: sitio público, portal privado y CMS para un proveedor industrial que vende a empresas, con catálogo, precios por cliente y pedidos.",
  year: null,
  featured: false,
};
