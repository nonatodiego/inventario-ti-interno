# Deploy no Netlify

Este projeto esta preparado para publicar o frontend React/Vite no Netlify.

## Configuracao no Netlify

- Build command: `npm run build:web`
- Publish directory: `apps/web/dist`
- Node version: `20`

Essas opcoes ja estao definidas em `netlify.toml`.

## Variaveis de ambiente

Configure no painel do Netlify:

```txt
VITE_API_URL=https://api.sua-empresa.com.br
```

Use essa variavel quando o backend estiver hospedado em um dominio publico. Se ela nao for definida, o frontend tenta usar `http://localhost:3333`, que serve apenas para desenvolvimento local.

## Observacao sobre o backend

O backend atual usa Express e SQLite local. Ele nao deve ser publicado como parte do site estatico no Netlify.

Para producao, use uma destas opcoes:

- Hospedar a API separadamente em um servico Node.js.
- Migrar a API para Netlify Functions e trocar SQLite local por um banco remoto, como PostgreSQL ou um servico compativel.

## Comandos locais

```bash
npm install
npm run build:web
npm run preview:web
```

## Rotas internas

O `netlify.toml` inclui fallback para SPA, entao rotas internas do React continuam funcionando quando o usuario recarrega a pagina.
