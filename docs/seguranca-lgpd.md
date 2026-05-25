# Seguranca e LGPD - Inventario TI

## Seguranca aplicada

- Rotas privadas exigem sessao autenticada por cookie `HttpOnly`.
- Cookies usam `SameSite=Strict` e `Secure` em producao.
- Mutacoes privadas exigem token CSRF no header `x-csrf-token`.
- Permissoes sao validadas no backend:
  - `admin`: cria, edita, exclui, exporta e gerencia usuarios.
  - `ti`: cria, edita, visualiza e exporta.
  - `consulta`: somente visualiza.
- Entradas passam por sanitizacao simples e validacao Zod.
- Queries usam Drizzle ORM, evitando interpolacao manual de SQL.
- Upload de termo aceita apenas `application/pdf`, valida assinatura `%PDF` e respeita `MAX_UPLOAD_MB`.
- Login, upload e exportacao possuem rate limit.
- Erros em producao nao expõem stack trace.
- Secrets ficam em variaveis de ambiente; em producao, `AUTH_SECRET` e `ADMIN_PASSWORD_HASH` sao obrigatorios.
- Auditoria cobre login, logout, criacao, edicao, exclusao, visualizacao sensivel, anonimizacao, upload de termo e exportacao.

## LGPD aplicada

- A finalidade do tratamento esta disponivel em `GET /api/privacy/purpose`.
- O sistema deve coletar apenas dados necessarios para controle de ativos.
- IMEI, chip e seriais sao mascarados para o perfil `consulta`.
- Exportacoes exigem confirmacao por `?confirm=true`.
- Relatorios CSV evitam detalhes tecnicos sensiveis por padrao.
- Existe endpoint de anonimizacao de inventario: `POST /api/inventory/:id/anonymize`.
- A politica simples de retencao recomenda manter dados enquanto houver ativo associado e anonimizar/remover ao encerrar a finalidade.
