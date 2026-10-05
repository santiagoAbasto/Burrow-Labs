// Textos legales iniciales (Markdown). Siembran `site_settings.legal` y después se editan en /admin/configuracion/legales.
// Describen lo que el sistema hace hoy (ver docs/LEGAL-STATUS.md) y fueron aprobados por el propietario el 2026-10-04.
// Un texto vacío, con marcadores «[PENDIENTE DEL PROPIETARIO: …]» o con el aviso «Borrador pendiente de revisión legal»
// es un borrador: su página sale con noindex y fuera del sitemap. Sin tablas: `.prose` no las estiliza.

export { hasPendingMarkers } from "../../lib/legal-draft";

const UPDATED = "4 de octubre de 2026";
// La fecha de vigencia es la de la última actualización: al publicar o cambiar un texto se actualiza UPDATED.
const dates = `**Última actualización y entrada en vigor:** ${UPDATED}`;

export const LEGAL = {
  privacy: `${dates}

Esta política explica qué datos personales trata el sitio burrowlabs.com.bo, para qué, dónde quedan, quién los ve y cómo pedir que los corrijamos o eliminemos. Describe lo que el sitio hace hoy; si eso cambia, actualizamos el texto.

## Quién es responsable

- **Responsable:** Burrow Labs — Carlos Eduardo Rodriguez Vargas (empresa unipersonal)
- **NIT:** 3417705018
- **Domicilio legal:** Av. Melchor Urquidi, entre C. Fidel Anze y Av. Julio Rodríguez, Edificio Fidel Anze, Cochabamba, Bolivia
- **Contacto para temas de privacidad:** [privacidad@burrowlabs.com.bo](mailto:privacidad@burrowlabs.com.bo)

## Si solo navegás

No hace falta que nos des ningún dato para recorrer el sitio. Si no aceptás las cookies de analítica, no te guardamos cookies ni usamos el almacenamiento de tu navegador (salvo para recordar que las rechazaste), y lo único que registramos son las estadísticas de uso descritas más abajo, en «Estadísticas propias». Si las aceptás, además intervienen Google Analytics y Microsoft Clarity, como se explica en «Con quién compartimos datos».

## Datos que nos das en los formularios

Los formularios solo se guardan si marcás la casilla de consentimiento. Junto con tus respuestas guardamos la fecha y la hora en que la marcaste y la página desde la que enviaste el formulario. No guardamos tu dirección IP ni los datos de tu navegador junto al formulario.

### Formulario de contacto

- **Qué pedimos:** nombre, email, qué querés construir, tipo de proyecto y una descripción (obligatorios); empresa, WhatsApp, presupuesto aproximado y plazo (opcionales). Si llegaste desde un plan, un servicio, un proyecto o la calculadora, también guardamos esa referencia.
- **Para qué:** responder tu consulta y, si corresponde, preparar una propuesta.
- **Qué agregamos nosotros:** el estado de la consulta y notas internas de seguimiento, que incluyen el registro de las respuestas que te enviamos.

### Diagnóstico express

Responder las preguntas no guarda tus respuestas: en las estadísticas solo queda que se completó el diagnóstico y qué tipo de recomendación salió. Al final podés, si querés, dejar tu contacto: en ese caso guardamos tu nombre, tu email, tu WhatsApp (opcional), tus respuestas del diagnóstico y la recomendación que te mostramos. Lo usamos para contactarte con el diagnóstico ya leído.

### Newsletter

- **Qué pedimos:** solo tu email. Guardamos además la página desde la que te suscribiste, la fecha del consentimiento y un código aleatorio que identifica tu enlace de baja.
- **Para qué:** enviarte un correo de bienvenida y, cada tanto, novedades de Burrow Labs.
- **Baja:** cada correo trae un enlace para darte de baja, sin preguntas. Al darte de baja dejamos de escribirte en el momento y conservamos tu registro marcado como «dado de baja» durante 12 meses, para no volver a escribirte; después se borra solo. Si preferís que lo borremos antes, pedilo y lo eliminamos.
- **Sin confirmación por correo:** hoy no pedimos confirmar la suscripción desde tu casilla (doble opt-in). Si recibiste un correo nuestro sin haberte suscripto, usá el enlace de baja o escribinos y eliminamos tu email.

Escribirnos por el formulario de contacto no te suscribe a la newsletter: son listas separadas.

### Calculadora

La calculadora de procesos manuales hace las cuentas en tu navegador: los números que cargás no se guardan en nuestro servidor. Si compartís el resultado o pasás al formulario de contacto, esos números viajan en la dirección de la página.

## Estadísticas propias

Para saber qué partes del sitio sirven usamos una medición propia, sin cookies y sin guardar nada en tu dispositivo. No es un servicio de terceros: los registros quedan en nuestra base de datos.

- **Qué se registra:** la página visitada y algunas acciones (por ejemplo, abrir un proyecto o un plan, tocar el botón de WhatsApp, enviar el formulario de contacto, completar el diagnóstico o la calculadora, jugar a Burrow Runner y el puntaje de la partida). Nunca el contenido de un formulario.
- **Con qué contexto:** país (solo si la infraestructura de alojamiento lo informa), tipo de dispositivo, navegador, idioma y el sitio desde el que llegaste (solo su dominio).
- **Identificador seudónimo:** para contar visitas sin repetirlas, el servidor procesa tu dirección IP y los datos de tu navegador y calcula con ellos un identificador que cambia todos los días. No guardamos la IP ni el navegador en claro. Ese identificador no es un dato anónimo en sentido estricto: es un seudónimo que no nos permite saber quién sos y que no relacionamos con los datos de los formularios.
- **Límite de abusos:** para frenar envíos automáticos guardamos un código derivado de tu IP (no la IP) junto con un contador. Esos registros se depuran solos cuando tienen más de un día; con poco tráfico pueden tardar algo más en borrarse.

## Correos que enviamos

- El correo de bienvenida a la newsletter.
- Las novedades de la newsletter, siempre con enlace de baja.
- La respuesta a tu consulta, si nos escribiste por un formulario.

Nuestro sistema no agrega píxeles de seguimiento ni mide aperturas o clics. Las imágenes de los correos se cargan solo desde nuestro propio dominio. De cada envío de novedades guardamos solo cifras totales (cuántos correos salieron y cuántos fallaron), no un registro por persona.

## WhatsApp y enlaces externos

El botón de WhatsApp es un enlace: abre WhatsApp con un mensaje sugerido que menciona la página o el servicio que estabas viendo. El sitio no le envía ningún dato tuyo a WhatsApp; lo que escribas ahí queda sujeto a las condiciones de ese servicio. Lo mismo vale para nuestras redes sociales: son enlaces a sitios de terceros con sus propias políticas.

## Dónde quedan los datos y quién accede

- Todo lo que cargás en los formularios se guarda en la base de datos del sitio, alojada en un servidor privado de Hostinger ubicado en Estados Unidos. Es decir: tus datos se almacenan fuera de Bolivia.
- Si nos escribís por correo, tu mensaje queda en nuestras casillas de Google Workspace.
- Acceden únicamente las personas con cuenta de administrador en el panel de Burrow Labs. Pueden ver las consultas y la lista de suscriptores, y exportarlas para trabajar con ellas.
- El panel lleva un registro interno de lo que hace cada administrador: qué hizo, sobre qué registro y cuándo. De las consultas y los suscriptores anota solo un identificador interno, no tu nombre ni tu email.

## Con quién compartimos datos

No vendemos tus datos ni los cedemos a terceros con fines comerciales. Solo intervienen los proveedores necesarios para que el sitio funcione, y cada uno recibe lo mínimo:

- **Alojamiento:** Hostinger aloja el sitio y la base de datos en un servidor ubicado en Estados Unidos y, como cualquier servidor web, puede registrar las direcciones IP de las visitas.
- **Correo:** Google Workspace. Nuestras casillas son de Google y el sitio envía sus correos por el servidor de salida (SMTP) de Google Workspace. Google recibe el email del destinatario, el asunto y el contenido de cada correo que enviamos, además de los mensajes que nos escribís, y puede tratarlos fuera de Bolivia.
- **Google Analytics 4 (Google):** solo si aceptás las cookies de analítica en el aviso; si no, no se carga. Google recibe la página visitada, el sitio desde el que llegaste, datos de tu navegador y tu dispositivo, una ubicación aproximada, un identificador guardado en una cookie y las acciones descritas en «Estadísticas propias». Según Google, Google Analytics 4 no registra ni almacena tu dirección IP: la usa en el momento para calcular esa ubicación aproximada. Lo configuramos sin Google Signals ni funciones publicitarias, y con una conservación de 2 meses para los datos asociados a cada visitante. Google puede tratar los datos fuera de Bolivia. El detalle de sus cookies está en la [política de cookies](/cookies).
- **Microsoft Clarity (Microsoft):** solo si aceptás las cookies de analítica en el aviso; si no, no se carga. Registra cómo se usa el sitio para generar grabaciones de las visitas y mapas de calor: clics, desplazamiento, movimientos del puntero, las páginas y su contenido, tu dispositivo y tu navegador, y una ubicación aproximada que Microsoft obtiene de tu dirección IP. Lo que escribís en los formularios se enmascara y no se envía. Le indicamos a Clarity que no autorizás el almacenamiento con fines publicitarios. Según Microsoft, las grabaciones se conservan 30 días (algunas, como las marcadas o una muestra al azar, hasta 9 meses) y los datos agregados, como los mapas de calor, hasta 9 meses. Microsoft trata estos datos como responsable, según su [declaración de privacidad](https://privacy.microsoft.com/es-es/privacystatement), y puede hacerlo fuera de Bolivia, por ejemplo en Estados Unidos.

Si incorporamos otro proveedor que reciba datos personales, lo vamos a agregar a esta lista.

## Cuánto tiempo los conservamos

Borramos los datos de la base del sitio de forma automática, una vez por día, cuando cumplen estos plazos:

- **Consultas (contacto y diagnóstico):** 24 meses desde la última actividad de la consulta: tu mensaje, nuestra respuesta o una actualización interna de su estado o de nuestras notas.
- **Consultas que marcamos como spam:** un mes desde que las marcamos.
- **Newsletter:** mientras sigas suscripto. Si te das de baja, conservamos tu registro marcado como «dado de baja» (tu email, la página y la fecha en que te suscribiste y la fecha de la baja) durante 12 meses.
- **Estadísticas propias:** 14 meses.
- **Registro interno del panel:** 12 meses. No incluye tu nombre ni tu email.
- **Límite de abusos:** alrededor de un día, como se explica en «Estadísticas propias».
- **Copias de seguridad:** se conservan alrededor de dos semanas. Lo que borramos de la base puede seguir en una copia hasta que esa copia se elimina, y no lo usamos para nada más.
- **Correos:** los mensajes que nos escribís por correo, y las respuestas que nos mandes, quedan en nuestras casillas y no entran en el borrado automático. Los conservamos cinco años desde el último mensaje, como correspondencia comercial.

Si nos pedís que eliminemos tus datos antes de estos plazos, lo hacemos, salvo lo que la ley nos obligue a conservar.

## Tus derechos

Podés pedirnos en cualquier momento:

- **Acceso:** saber qué datos tuyos tenemos y recibir una copia.
- **Corrección:** que corrijamos un dato equivocado.
- **Eliminación:** que borremos tu consulta o tu email de la newsletter.
- **Retirar tu consentimiento:** que dejemos de usar tus datos o de escribirte. Para la newsletter alcanza con el enlace de baja de cualquier correo.

Para ejercerlos escribí a [privacidad@burrowlabs.com.bo](mailto:privacidad@burrowlabs.com.bo) o usá el [formulario de contacto](/contacto), desde el mismo email con el que nos escribiste para que podamos ubicar tus datos. Te respondemos en un máximo de 15 días hábiles, contados desde el día hábil siguiente a aquel en que recibimos tu solicitud. Si necesitamos confirmar tu identidad o aclarar el pedido, el plazo se cuenta desde que recibimos tu respuesta. Si el caso requiere más tiempo, te avisamos antes de que venza, te explicamos el motivo y te damos una fecha, que no va a superar los 10 días hábiles adicionales. Contamos como hábiles los días de lunes a viernes, sin los feriados nacionales de Bolivia ni los del departamento de Cochabamba.

La baja de la newsletter no espera ese plazo: se aplica en el momento, desde el enlace de cada correo.

Estas gestiones las hacemos a mano. Cuando eliminamos un dato lo borramos de la base de datos activa; puede seguir existiendo en archivos ya exportados y en las copias de seguridad, hasta que esas copias se eliminan.

## Seguridad

- El sitio publicado se sirve por conexión cifrada (HTTPS).
- Al panel solo se entra con usuario y contraseña; las contraseñas no se guardan en claro, sino como un hash, y la sesión usa una cookie que el código de la página no puede leer.
- Los formularios tienen filtros contra envíos automáticos y límites de frecuencia.

Aun así, ningún sistema es infalible y no podemos garantizar una seguridad absoluta.

## Cambios en esta política

Si cambia lo que hace el sitio o cambia esta política, publicamos la nueva versión en esta página y actualizamos la fecha del inicio.`,

  terms: `${dates}

Estos términos regulan el uso del sitio burrowlabs.com.bo. Si lo usás, los aceptás; si no estás de acuerdo, te pedimos que no lo uses.

## Quién opera el sitio

- **Titular:** Burrow Labs — Carlos Eduardo Rodriguez Vargas (empresa unipersonal)
- **NIT:** 3417705018
- **Domicilio legal:** Av. Melchor Urquidi, entre C. Fidel Anze y Av. Julio Rodríguez, Edificio Fidel Anze, Cochabamba, Bolivia
- **Contacto:** [info@burrowlabs.com.bo](mailto:info@burrowlabs.com.bo)

## Uso del sitio

El sitio presenta los servicios, proyectos y planes de Burrow Labs y ofrece herramientas para empezar una conversación. Podés usarlo para informarte y contactarnos. No está permitido:

- intentar acceder al panel de administración o a datos que no son tuyos;
- enviar formularios de forma automatizada, con datos falsos o con datos de otra persona sin su permiso;
- interferir con el funcionamiento del sitio o usarlo para distribuir contenido ilícito o dañino.

## Información y precios

El contenido es informativo y puede cambiar sin aviso. Los precios publicados son **precios base**: el alcance, el plazo y el valor final de cada proyecto se confirman por escrito antes de comenzar. Nada de lo publicado en el sitio es, por sí solo, una oferta vinculante.

## Herramientas orientativas

La calculadora de procesos manuales y el diagnóstico express entregan estimaciones a partir de los datos que cargás. Sirven para orientar una conversación: no son una cotización, una auditoría ni una promesa de ahorro o de resultado.

## Proyectos y contratos

Cada trabajo se rige por la propuesta o el contrato que se firme para ese proyecto. Si hay diferencias entre ese documento y lo publicado en el sitio, prevalece el documento firmado.

## Propiedad intelectual

La marca Burrow Labs, su logotipo y su mascota, y los textos, ilustraciones, animaciones, el diseño y el código de este sitio pertenecen a Burrow Labs o se usan con permiso de sus titulares. Podés compartir enlaces al sitio y citar fragmentos breves mencionando la fuente. Cualquier otro uso —copiar, modificar o reutilizar la marca, la mascota o los contenidos— necesita nuestra autorización previa por escrito.

Los nombres y marcas de terceros que aparecen en el sitio pertenecen a sus respectivos titulares.

## Enlaces externos

El sitio enlaza a servicios de terceros, como WhatsApp o redes sociales. No controlamos su contenido, su disponibilidad ni sus políticas, y no respondemos por ellos.

## Responsabilidad

Trabajamos para que el sitio esté disponible y su contenido sea correcto, pero se ofrece tal como está: no garantizamos que esté libre de errores o de interrupciones. En la medida en que la ley lo permita, no respondemos por los daños que resulten de usar el sitio o sus herramientas, ni de decisiones tomadas solo sobre la base de la información o las estimaciones publicadas. Esto no limita las responsabilidades que la ley no permite excluir ni las que asumimos en un contrato firmado.

## Datos personales

El tratamiento de tus datos se explica en la [política de privacidad](/privacidad) y en la [política de cookies](/cookies).

## Cambios

Podemos actualizar estos términos. La versión vigente es la publicada en esta página, con su fecha de actualización.

## Ley aplicable y jurisdicción

Estos términos y el uso del sitio se rigen por las leyes del Estado Plurinacional de Bolivia. Si surge una diferencia, primero vamos a intentar resolverla de forma directa y de buena fe: escribinos a [info@burrowlabs.com.bo](mailto:info@burrowlabs.com.bo). Si no llegamos a un acuerdo, la controversia se somete a los jueces y tribunales ordinarios de la ciudad de Cochabamba, Bolivia.

Esto no limita los derechos que la ley boliviana reconoce a usuarias, usuarios, consumidoras y consumidores, ni su derecho a reclamar ante la autoridad administrativa competente o a ejercer las acciones constitucionales que correspondan.`,

  cookies: `${dates}

Esta página detalla qué cookies y qué almacenamiento del navegador usa burrowlabs.com.bo, con su nombre, para qué sirve, cuánto dura y cuándo se crea.

## En resumen

Si no aceptás las cookies de analítica, **no guardamos ninguna cookie en tu navegador** y solo recordamos que las rechazaste. Si las aceptás, Google Analytics y Microsoft Clarity crean las cookies que se detallan abajo. No usamos cookies de publicidad y las tipografías se sirven desde nuestro propio dominio.

## Cookies

- **\`__Host-bl_session\`** — Cookie propia, necesaria. Mantiene abierta la sesión del panel de administración. Dura 7 días y se renueva con el uso, con un tope de 30 días. Se crea únicamente al iniciar sesión en el panel: los visitantes nunca la reciben.
- **\`_ga\` y \`_ga_<ID>\`** — Cookies propias de Google Analytics 4, opcionales. Sirven para distinguir visitantes y mantener la sesión en las estadísticas de Google. Duran hasta 2 años desde tu última visita. Solo se crean después de que pulses «Aceptar» en el aviso.
- **\`_clck\` y \`_clsk\`** — Cookies propias de Microsoft Clarity, opcionales. \`_clck\` guarda el identificador que Clarity te asigna en este sitio y dura 1 año; \`_clsk\` une las páginas de una misma visita y dura 1 día. Solo se crean después de que pulses «Aceptar».
- **Cookies de Microsoft en sus propios dominios** (por ejemplo \`MUID\`, \`MR\`, \`SM\`, \`CLID\` o \`ANONCHK\`, en clarity.ms y bing.com) — Las crea Microsoft cuando Clarity se carga, después de «Aceptar». Microsoft las usa para reconocer navegadores entre sus servicios; nosotros no las leemos ni las controlamos, y su duración la fija Microsoft (algunas, alrededor de un año). Se borran desde la configuración de tu navegador. Más información en la [declaración de privacidad de Microsoft](https://privacy.microsoft.com/es-es/privacystatement).

## Almacenamiento local del navegador

- **\`burrow-runner:best\`** — Guarda tu récord en el juego Burrow Runner. No vence: queda hasta que borres los datos del sitio. Se crea solo si jugás y superás tu récord.
- **\`burrow:consent\`** — Recuerda si aceptaste o rechazaste las cookies de analítica, para no preguntártelo en cada visita. No vence. Se crea al pulsar «Aceptar» o «Rechazar» en el aviso.
- **\`_cltk\`** (almacenamiento de sesión) — Lo crea Microsoft Clarity, solo si aceptaste, para distinguir la pestaña del navegador. Se borra al cerrarla.

Los dos primeros valores no salen de tu navegador.

## El aviso de cookies

Cuando el sitio usa analítica de terceros (Google Analytics y Microsoft Clarity), en tu primera visita aparece un aviso con dos botones, «Aceptar» y «Rechazar». Ninguna de las dos herramientas se carga hasta que aceptes, y podés seguir navegando sin elegir.

## Cómo cambiar tu elección

- Al final de esta página está el botón **«Cambiar mi elección»**: le avisa a Clarity que retiraste el consentimiento, borra la decisión guardada y las cookies propias de Google Analytics y de Clarity, y el aviso vuelve a preguntarte. Las cookies de Microsoft en sus propios dominios no las podemos borrar desde acá: se borran desde tu navegador.
- En cualquier caso, podés borrar las cookies y los datos del sitio desde la configuración de tu navegador.

## Estadísticas sin cookies

Aparte de lo anterior, el sitio lleva estadísticas propias que no usan cookies ni guardan nada en tu dispositivo: registran páginas y acciones (incluido el puntaje de una partida de Burrow Runner) con un identificador seudónimo que cambia cada día. Cómo funcionan y qué datos se procesan está explicado en la [política de privacidad](/privacidad).

## Cambios

Si agregamos o quitamos cookies, actualizamos esta página y su fecha.`,
};
