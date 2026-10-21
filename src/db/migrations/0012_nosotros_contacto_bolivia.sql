-- /nosotros y /contacto decían «software studio de/en Cochabamba»: Burrow Labs es de Bolivia, con base en Cochabamba,
-- y trabaja para todo el país y el exterior. Solo si siguen siendo el texto de producción o el sembrado.
UPDATE "seo_metadata"
SET "description" = 'Quiénes somos y cómo trabajamos: un software studio de Bolivia, con base en Cochabamba, que entiende el proceso antes de programar. Para Bolivia y el exterior.', "updated_at" = now()
WHERE "path" = '/nosotros' AND "description" IN ('Quiénes somos y cómo trabajamos: un software studio de Cochabamba que entiende el proceso antes de programar: entender, modelar, construir, probar y mejorar.', 'Quiénes somos y cómo trabajamos: un software studio con base en Cochabamba que entiende el proceso antes de programar. Entender, modelar, construir, probar, medir y mejorar.');
--> statement-breakpoint
UPDATE "seo_metadata"
SET "description" = 'Software studio de Bolivia con base en Cochabamba. Contanos cómo funciona hoy tu proceso y te proponemos qué automatizar, integrar o convertir en sistema.', "updated_at" = now()
WHERE "path" = '/contacto' AND "description" IN ('Software studio en Cochabamba. Contanos cómo funciona hoy tu proceso: vemos qué conviene automatizar, integrar o convertir en sistema y te damos una propuesta.', 'Software studio en Cochabamba, Bolivia. Contanos cómo funciona hoy tu proceso: vemos qué vale la pena automatizar, integrar o convertir en sistema y te respondemos con una propuesta concreta.');
