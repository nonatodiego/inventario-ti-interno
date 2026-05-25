# Deploy interno em Ubuntu

Aplicacao: Inventario TI  
Servidor: `192.168.0.21`  
Porta: `4000`  
URL interna: `http://192.168.0.21:4000`

## O que foi preparado

- Servidor Node estatico em `apps/web/server.mjs`.
- Script `npm run start:web` para rodar a aplicacao em producao.
- Servico Linux em `deploy/inventario-ti.service`.
- Script de instalacao em `scripts/ubuntu-install.sh`.
- Script de atualizacao em `scripts/ubuntu-update.sh`.

## Requisitos no Ubuntu

- Ubuntu Server.
- Acesso via PuTTY.
- Envio de arquivos via WinSCP.
- Node.js 20.
- Git.

Instalacao base:

```bash
sudo apt update
sudo apt install -y git curl rsync
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

## Primeiro deploy via WinSCP

1. Gere ou baixe o projeto no seu computador.
2. Envie a pasta do projeto para o servidor, por exemplo:

```txt
/home/seu-usuario/inventario-ti
```

3. Entre no servidor via PuTTY:

```bash
cd /home/seu-usuario/inventario-ti
chmod +x scripts/ubuntu-install.sh
sudo ./scripts/ubuntu-install.sh
```

4. Verifique o servico:

```bash
sudo systemctl status inventario-ti
```

5. Acesse no navegador:

```txt
http://192.168.0.21:4000
```

## Deploy via GitHub

Depois que o projeto estiver no GitHub:

```bash
cd /opt
sudo git clone https://github.com/SEU_USUARIO/inventario-ti.git
cd inventario-ti
sudo chmod +x scripts/ubuntu-install.sh
sudo ./scripts/ubuntu-install.sh
```

Para atualizar depois:

```bash
cd /opt/inventario-ti
sudo git pull
sudo npm ci
sudo npm run build:web
sudo systemctl restart inventario-ti
```

Ou use:

```bash
sudo chmod +x scripts/ubuntu-update.sh
sudo ./scripts/ubuntu-update.sh
```

## Firewall

Se o firewall estiver ativo:

```bash
sudo ufw allow 4000/tcp
sudo ufw reload
```

## Logs

```bash
sudo journalctl -u inventario-ti -f
```

## Reiniciar

```bash
sudo systemctl restart inventario-ti
```

## Parar

```bash
sudo systemctl stop inventario-ti
```
