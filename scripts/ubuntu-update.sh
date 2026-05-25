#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/inventario-ti"
APP_USER="inventario"

cd "${APP_DIR}"
sudo -u "${APP_USER}" git pull --ff-only
sudo -u "${APP_USER}" npm ci
sudo -u "${APP_USER}" npm run build:web
sudo systemctl restart inventario-ti

echo "Inventario TI atualizado."
echo "Acesse: http://192.168.0.21:4000"
