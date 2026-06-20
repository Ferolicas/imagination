#!/usr/bin/env bash
# Despliegue de Imagination (holding Olcas) — lo invoca GitHub Actions por SSH en cada push a main.
# Solo toca el código de la app; el .env real vive en /var/www/imagination/.env y nunca se commitea.
set -euo pipefail
APP="imagination"
PORT="4003"

export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" || true
corepack enable >/dev/null 2>&1 || true

cd "/var/www/${APP}"
git fetch origin main
git reset --hard origin/main

pnpm install --frozen-lockfile || pnpm install
pnpm db:push
pnpm build

pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save

sleep 2
if curl -fsS "http://127.0.0.1:${PORT}/api/health" >/dev/null; then
  echo "Deploy OK -> https://${APP}.olcas.app"
else
  echo "Healthcheck FALLO tras el deploy"
  pm2 logs "${APP}" --lines 30 --nostream || true
  exit 1
fi
