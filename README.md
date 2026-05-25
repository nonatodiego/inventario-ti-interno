# Inventario TI

Sistema web interno para controle de colaboradores, equipamentos, recursos, termos de uso, relatorios e dashboard.

## Estrutura

- `apps/web`: frontend React + TypeScript + Tailwind.
- `apps/api`: backend Node.js + Express + Drizzle.
- `packages/shared`: schemas e tipos compartilhados.
- `docs/arquitetura.md`: plano tecnico inicial.

## Primeiros comandos

```bash
npm install
npm run dev
```

Copie `.env.example` para `.env` antes de rodar a API.

## Deploy no Netlify

O frontend esta preparado para deploy no Netlify.

```bash
npm run build:web
```

Configuracao usada pelo Netlify:

- Build command: `npm run build:web`
- Publish directory: `apps/web/dist`

Se o backend estiver hospedado fora do Netlify, configure `VITE_API_URL` nas variaveis de ambiente do site. Veja `docs/deploy-netlify.md`.

## Deploy interno Ubuntu

O frontend tambem esta preparado para rodar em uma VM Ubuntu interna na porta `4000`.

```bash
npm ci
npm run build:web
PORT=4000 HOST=0.0.0.0 npm run start:web
```

URL esperada na rede interna:

```txt
http://192.168.0.21:4000
```

Para instalar como servico do Linux, use `scripts/ubuntu-install.sh`.
Veja o passo a passo completo em `docs/deploy-ubuntu.md`.
