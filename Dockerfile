# Burrow Labs — imagen para servidor propio (VPS). Ver README («Despliegue») y docs/SECURITY.md.
FROM node:26-slim
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH NEXT_TELEMETRY_DISABLED=1
# pnpm fijado a la versión de `packageManager` (package.json). Con npm y no con corepack: Node dejó de
# incluir corepack a partir de la versión 25.
RUN npm install -g pnpm@11.8.0
# El proceso corre como `node` (sin privilegios), no como root: /app, el store de pnpm y la carpeta de
# media le pertenecen. La carpeta storage se crea acá para que el volumen nuevo herede ese dueño.
RUN mkdir -p /app/storage/uploads /pnpm && chown -R node:node /app /pnpm
WORKDIR /app
USER node
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY --chown=node:node . .
RUN chmod +x docker-entrypoint.sh
EXPOSE 3000
# ponytail: el build corre al arrancar el contenedor porque las páginas se prerenderizan con el
# contenido de la base — pasar a una imagen ya construida (y sin dependencias de desarrollo) cuando
# haya CI con acceso a la base.
CMD ["./docker-entrypoint.sh"]
