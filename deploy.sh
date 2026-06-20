#!/usr/bin/env bash
# Despliegue de Imagination (holding Olcas) — invocado por CI vía SSH al VPS.
# Solo toca el código de la app; el .env real vive en /var/www/imagination/.env
set -euo pipefail

cd /var/www/imagination

echo "→ fetch + reset a origin/main"
git fetch --all --prune
git reset --hard origin/main

echo "→ pnpm install (frozen)"
pnpm install --frozen-lockfile

echo "→ build"
pnpm build

echo "→ pm2 startOrReload"
pm2 startOrReload ecosystem.config.js --update-env

sleep 2
curl -fsS http://127.0.0.1:4003/api/health && echo " ✓ health OK"
