#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/inventario-ti"
APP_USER="inventario"
SERVICE_FILE="/etc/systemd/system/inventario-ti.service"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js nao encontrado. Instale Node.js 20 antes de continuar."
  echo "Sugestao: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
  exit 1
fi

if ! id "${APP_USER}" >/dev/null 2>&1; then
  sudo useradd --system --create-home --shell /usr/sbin/nologin "${APP_USER}"
fi

sudo mkdir -p "${APP_DIR}"
sudo rsync -a --delete \
  --exclude ".git" \
  --exclude "node_modules" \
  --exclude "apps/*/node_modules" \
  --exclude "packages/*/node_modules" \
  --exclude ".npm-cache" \
  --exclude "netlify-static" \
  ./ "${APP_DIR}/"

sudo chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"

cd "${APP_DIR}"
sudo -u "${APP_USER}" npm ci
sudo -u "${APP_USER}" npm run build:web

sudo cp deploy/inventario-ti.service "${SERVICE_FILE}"
sudo systemctl daemon-reload
sudo systemctl enable inventario-ti
sudo systemctl restart inventario-ti

echo "Inventario TI instalado."
echo "Acesse: http://192.168.0.21:4000"
echo "Status: sudo systemctl status inventario-ti"
