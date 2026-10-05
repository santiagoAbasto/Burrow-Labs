#!/bin/sh
set -e
pnpm db:migrate
pnpm db:seed          # idempotente: no pisa contenido existente
NODE_ENV=production pnpm build
exec pnpm start
