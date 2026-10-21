-- Contenido editable, no esquema: el seed no pisa filas existentes, así que el cambio llega por acá.
-- Cada UPDATE solo corre si el texto sigue siendo el sembrado: si alguien lo editó en el panel, no se toca.
UPDATE "seo_metadata"
SET "description" = 'Software studio en Cochabamba, Bolivia: sistemas a medida, apps móviles, automatización, integraciones e IA para empresas de Bolivia y del exterior.', "updated_at" = now()
WHERE "path" = '/desarrollo-de-software-cochabamba'
  AND "description" = 'Software studio en Cochabamba, Bolivia: sistemas a medida, automatización de procesos, integraciones e IA aplicada para empresas de Cochabamba y de todo el país.';
--> statement-breakpoint
UPDATE "faqs"
SET "answer" = 'No. Somos de Bolivia y trabajamos con empresas de cualquier lugar. Todo el proceso se puede hacer de forma remota, y recibimos pagos desde cualquier país.', "updated_at" = now()
WHERE "question" = '¿Trabajan solamente con empresas de Bolivia?'
  AND "answer" = 'No. Somos de Bolivia y trabajamos con empresas de cualquier lugar. Todo el proceso se puede hacer de forma remota.';
