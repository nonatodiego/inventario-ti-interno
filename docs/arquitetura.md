# Inventario TI - Arquitetura inicial

## Visao geral

O Inventario TI sera um sistema interno para a equipe de TI controlar colaboradores, equipamentos, recursos disponiveis, termos de uso, relatorios e indicadores operacionais.

Arquitetura proposta:

- Frontend: React, TypeScript, Tailwind CSS, Radix UI/shadcn-ready, React Hook Form, Zod, TanStack Query, Recharts e Lucide React.
- Backend: Node.js, Express, TypeScript e REST API.
- Banco: SQLite no desenvolvimento, com Drizzle ORM e schema preparado para migrar para PostgreSQL.
- PDF: pdf-lib no backend para gerar inventario individual e relatorios.
- Autenticacao: sessao ou JWT curto com refresh token seguro em cookie HTTP-only.
- Autorizacao: RBAC simples por papeis.

Para a primeira versao, REST e mais simples que tRPC para manter baixo acoplamento entre web e API, facilitar integracoes futuras e documentar contratos por endpoint.

## Plano de desenvolvimento por etapas

1. Fundacao do projeto
   - Criar monorepo com `apps/web`, `apps/api` e `packages/shared`.
   - Configurar TypeScript, lint basico, variaveis de ambiente e scripts.
   - Criar layout administrativo inicial com sidebar.
   - Criar API Express com health check e tratamento padrao de erros.

2. Modelo de dados e seguranca
   - Criar schema Drizzle para usuarios, colaboradores, equipamentos, atribuicoes, termos, recursos e auditoria.
   - Adicionar autenticacao, hash de senha e controle de permissoes.
   - Criar validacoes compartilhadas com Zod.

3. Inventario e colaboradores
   - CRUD de colaboradores.
   - CRUD de equipamentos.
   - Atribuicao/devolucao de equipamentos para colaboradores.
   - Busca, filtros e paginacao.

4. Termos e documentos
   - Upload de termo de uso em PDF.
   - Vinculo do termo ao colaborador e/ou atribuicao.
   - Geracao de PDF individual do inventario.

5. Recursos, relatorios e dashboard
   - Controle de recursos disponiveis.
   - Dashboard com metricas e graficos.
   - Relatorios com exportacao CSV/PDF.

6. Hardening e LGPD
   - Auditoria de acoes sensiveis.
   - Politica de retencao.
   - Revisao de permissoes, logs, backup e validacao de uploads.

## Estrutura de pastas

```txt
inventario-ti/
  apps/
    api/
      src/
        config/
        db/
        http/
        modules/
          auth/
          collaborators/
          equipment/
          assignments/
          resources/
          reports/
          uploads/
        services/
        utils/
      drizzle/
      uploads/
    web/
      src/
        app/
        components/
          layout/
          ui/
        features/
          auth/
          dashboard/
          inventory/
          collaborators/
          equipment/
          resources/
          reports/
        lib/
        routes/
  packages/
    shared/
      src/
        schemas/
        types/
  docs/
```

## Schema do banco de dados

Entidades principais:

### users

- `id`: UUID/texto.
- `name`: nome do usuario.
- `email`: unico.
- `passwordHash`: hash da senha.
- `role`: `admin`, `manager`, `technician`, `viewer`.
- `status`: `active`, `inactive`.
- `lastLoginAt`.
- `createdAt`, `updatedAt`.

### collaborators

- `id`: UUID/texto.
- `fullName`.
- `email`.
- `department`.
- `jobTitle`.
- `document`: CPF ou identificador interno, preferencialmente opcional e mascarado na UI.
- `status`: `active`, `inactive`, `on_leave`.
- `createdAt`, `updatedAt`.

### equipment

- `id`: UUID/texto.
- `type`: notebook, desktop, monitor, phone, accessory, other.
- `brand`.
- `model`.
- `serialNumber`.
- `status`: available, assigned, maintenance, retired, lost.
- `purchaseDate`.
- `notes`.
- `createdAt`, `updatedAt`.

### equipment_assignments

- `id`: UUID/texto.
- `collaboratorId`.
- `equipmentId`.
- `assignedAt`.
- `returnedAt`.
- `conditionOnAssign`.
- `conditionOnReturn`.
- `notes`.
- `createdByUserId`.

### usage_terms

- `id`: UUID/texto.
- `collaboratorId`.
- `assignmentId`: opcional.
- `fileName`.
- `filePath`.
- `mimeType`.
- `fileSize`.
- `sha256`.
- `uploadedByUserId`.
- `uploadedAt`.

### resources

- `id`: UUID/texto.
- `name`.
- `category`: software, license, account, peripheral, other.
- `totalQuantity`.
- `availableQuantity`.
- `notes`.
- `createdAt`, `updatedAt`.

### resource_allocations

- `id`: UUID/texto.
- `resourceId`.
- `collaboratorId`.
- `quantity`.
- `assignedAt`.
- `returnedAt`.
- `createdByUserId`.

### audit_logs

- `id`: UUID/texto.
- `userId`.
- `action`.
- `entityType`.
- `entityId`.
- `metadata`: JSON.
- `ipAddress`.
- `createdAt`.

## Rotas e endpoints REST

Padrao:

- Todas as rotas privadas exigem autenticacao.
- Rotas de escrita exigem permissao por papel.
- Respostas usam JSON com `data` ou `error`.
- Listagens suportam `page`, `limit`, `search`, `sort` e filtros especificos.

### Sistema

- `GET /health`: estado da API.

### Auth

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/refresh`

### Usuarios

- `GET /api/users`
- `POST /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id`
- `PATCH /api/users/:id/password`

### Colaboradores

- `GET /api/collaborators`
- `POST /api/collaborators`
- `GET /api/collaborators/:id`
- `PATCH /api/collaborators/:id`
- `DELETE /api/collaborators/:id`
- `GET /api/collaborators/:id/inventory`

### Equipamentos

- `GET /api/equipment`
- `POST /api/equipment`
- `GET /api/equipment/:id`
- `PATCH /api/equipment/:id`
- `DELETE /api/equipment/:id`

### Atribuicoes

- `GET /api/assignments`
- `POST /api/assignments`
- `PATCH /api/assignments/:id/return`

### Termos

- `POST /api/terms/upload`
- `GET /api/terms/:id`
- `DELETE /api/terms/:id`

### Recursos

- `GET /api/resources`
- `POST /api/resources`
- `GET /api/resources/:id`
- `PATCH /api/resources/:id`
- `POST /api/resources/:id/allocate`
- `PATCH /api/resource-allocations/:id/return`

### Dashboard e relatorios

- `GET /api/dashboard/metrics`
- `GET /api/reports/inventory`
- `GET /api/reports/inventory.csv`
- `GET /api/reports/inventory.pdf`
- `GET /api/reports/collaborators/:id/inventory.pdf`

## Componentes principais do frontend

Layout:

- `AppShell`
- `Sidebar`
- `Topbar`
- `PageHeader`
- `DataTable`
- `SearchInput`
- `FilterBar`
- `StatusBadge`
- `ConfirmDialog`
- `FileUploadField`

Paginas:

- `LoginPage`
- `DashboardPage`
- `InventoryPage`
- `EquipmentFormPage`
- `CollaboratorsPage`
- `CollaboratorFormPage`
- `CollaboratorInventoryPage`
- `ResourcesPage`
- `ReportsPage`
- `UsersPage`
- `SettingsPage`

Graficos:

- `InventoryStatusChart`
- `EquipmentByTypeChart`
- `ResourceAvailabilityChart`

Formularios:

- Validados com React Hook Form + Zod.
- Schemas compartilhados com `packages/shared`.

## Regras de seguranca

- Hash de senha com algoritmo forte, como Argon2id ou bcrypt com custo adequado.
- Cookies HTTP-only, Secure e SameSite para refresh token/sessao.
- Token de acesso curto, se JWT for usado.
- RBAC por papel:
  - `admin`: tudo.
  - `manager`: relatorios, inventario e usuarios limitados.
  - `technician`: inventario, colaboradores, equipamentos, termos e recursos.
  - `viewer`: somente leitura.
- Validacao de entrada em todas as rotas com Zod.
- Sanitizacao de nomes de arquivo e bloqueio de path traversal.
- Upload de PDF limitado por tamanho e MIME type, com hash SHA-256.
- Rate limit em login e rotas sensiveis.
- CORS restrito ao dominio interno.
- Headers de seguranca com Helmet.
- Auditoria para login, criacao, edicao, exclusao, uploads, exportacoes e atribuicoes.
- Erros sem vazamento de stack trace em producao.
- Backups e migracoes versionadas.

## Adequacao basica a LGPD

- Coletar apenas dados necessarios para finalidade de inventario.
- Evitar armazenar CPF; se indispensavel, mascarar na UI e restringir acesso.
- Registrar finalidade e base de uso interno dos dados.
- Controlar acesso por perfil.
- Manter trilha de auditoria para dados pessoais.
- Definir politica de retencao para colaboradores desligados.
- Permitir exportacao dos dados de um colaborador quando solicitado.
- Remover ou anonimizar dados quando nao houver obrigacao de retencao.
- Proteger documentos enviados e impedir acesso publico aos PDFs.
- Exibir termos de uso e responsabilidade vinculados aos equipamentos.
