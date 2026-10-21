-- El enlace de GitHub de la marca pasa de la cuenta personal a la organización burrow-labs-bo.
-- Solo si sigue siendo el enlace anterior: si alguien lo cambió en el panel, no se toca.
UPDATE "site_settings"
SET "value" = jsonb_set("value", '{github}', '"https://github.com/burrow-labs-bo"'), "updated_at" = now()
WHERE "key" = 'social'
  AND "value"->>'github' = 'https://github.com/santiagoAbasto/Burrow-Labs';
