<div align="center">

<h1>JornadaPIM — Backend</h1>

<p>API REST para controle de ponto e jornada de trabalho no Polo Industrial de Manaus</p>

<p>
  <img src="https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Fastify-5-000000?style=flat-square&logo=fastify&logoColor=white" />
  <img src="https://img.shields.io/badge/DrizzleORM-0.45-C5F74F?style=flat-square&logo=drizzle&logoColor=black" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white" />
</p>

<p>
  <a href="#-sobre">Sobre</a> •
  <a href="#-stack">Stack</a> •
  <a href="#-como-rodar">Como rodar</a> •
  <a href="#-variáveis-de-ambiente">Variáveis de ambiente</a> •
  <a href="#-rotas-da-api">Rotas</a> •
  <a href="#-credenciais-de-teste">Credenciais de teste</a>
</p>

<!-- Adicione o print do Scalar aqui após tirar o screenshot -->
<!-- ![Documentação Scalar](./docs/scalar-preview.png) -->

</div>

---

## Sobre

O **JornadaPIM** substitui relógios de ponto físicos e planilhas manuais por um fluxo digital com cálculo automático de horas trabalhadas, extras, atrasos e banco de horas.

Projeto desenvolvido como módulo final da **Trilha Full Stack do INDT — Instituto de Desenvolvimento Tecnológico**, ambientado no contexto industrial do PIM.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 22 |
| Framework | Fastify 5 |
| ORM | DrizzleORM |
| Banco de dados | PostgreSQL 16 |
| Linguagem | TypeScript 5.9 |
| Validação | Zod v4 |
| Autenticação | JWT + bcryptjs |
| Documentação | Scalar + Swagger |
| Lint / Format | Biome |
| Testes | Vitest |
| Containers | Docker + Docker Compose |

---

## Como rodar

### Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose
- [Node.js 22+](https://nodejs.org/)
- [pnpm](https://pnpm.io/)

### Com Docker (recomendado)

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/jordanapim-backend
cd jordanapim-backend

# Copie o arquivo de variáveis de ambiente
cp .env.example .env

# Suba os container com a imagem do banco que se encontra na raiz do repositorio
docker compose up --build
```

### Sem Docker

```bash
# Instale as dependências
pnpm install

# Configure o .env com as credenciais do banco

# Gere e rode as migrations
pnpm db:migrate

# Popule o banco com dados de teste
pnpm db:seed

# Inicie o servidor em modo desenvolvimento
pnpm start:dev
```

---

## Variáveis de ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```env
# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=sua_senha
DB_NAME=jordanapim

# Autenticação
JWT_SECRET=sua_chave_secreta_aqui

# Servidor
PORT=3000
TZ=America/Manaus
```

---

## Scripts disponíveis

```bash
pnpm start:dev       # inicia em modo desenvolvimento com hot reload
pnpm build           # compila para produção
pnpm start           # inicia build de produção

pnpm db:generate     # gera migrations a partir do schema
pnpm db:migrate      # aplica migrations no banco
pnpm db:seed         # popula o banco com dados fictícios
pnpm db:studio       # abre o Drizzle Studio no navegador
pnpm db:reset        # reseta o banco (DROP + CREATE schema)

pnpm lint            # verifica e corrige lint com Biome
pnpm format          # formata o código com Biome
pnpm test            # roda os testes com Vitest
pnpm test:coverage   # roda testes com relatório de cobertura
```

---

## Rotas da API

A documentação completa e interativa está disponível em:

```
http://localhost:3000/docs
```

### Visão geral

| Método | Rota | Perfil | Descrição |
|---|---|---|---|
| `POST` | `/auth/login` | público | Autenticação e geração de token JWT |
| `GET` | `/usuarios` | rh | Lista todos os usuários |
| `POST` | `/usuarios` | rh | Cadastra novo usuário |
| `GET` | `/usuarios/:matricula` | rh / gestor | Busca usuário por matrícula |
| `PUT` | `/usuarios/:matricula` | rh | Atualiza dados do usuário |
| `DELETE` | `/usuarios/:matricula` | rh | Desativa usuário (soft delete) |
| `POST` | `/ponto` | colaborador | Registra próxima batida do dia |
| `GET` | `/ponto/hoje` | colaborador | Batidas e resumo do dia atual |
| `GET` | `/ponto/:usuario_id/historico` | gestor / rh | Histórico de ponto por período |
| `DELETE` | `/ponto/:id` | gestor / rh | Remove uma batida |

### Perfis de acesso

| Perfil | Permissões |
|---|---|
| `colaborador` | Registra ponto, consulta próprio histórico e banco de horas |
| `gestor` | Acompanha equipe, visualiza dashboard, aprova ajustes |
| `rh` | Acesso total — cadastra usuários e gera espelho mensal |

---

## Credenciais de teste

Após rodar `pnpm db:seed` as seguintes contas estarão disponíveis:

| Matrícula | Senha | Perfil |
|---|---|---|
| `PIM-0901` | `123456789` | gestor |
| `PIM-0902` | `123456789` | gestor |
| `PIM-0903` | `123456789` | rh |
| `PIM-0001` até `PIM-0020` | `123456789` | colaborador |

> O seed gera 20 colaboradores com histórico de ponto dos **últimos 2 meses**, incluindo faltas (~10%), atrasos (~30%), horas extras (~20%) e dias incompletos (~5%).

---

## Regras de negócio

- Sequência obrigatória de batidas: `entrada → saida_almoco → retorno_almoco → saida`
- O timestamp é gerado sempre pelo **servidor** — nunca pelo cliente
- Todo cálculo de horas usa timezone **America/Manaus**
- Colaborador inativo não pode registrar ponto
- Gestores e RH não registram ponto — são perfis administrativos

---

## Estrutura do projeto

```
src/
├── config/
│   └── database.ts
│   └── env.ts
├── database/
│   ├── migrations
│   ├── schemas.ts
│   └── scripts/
│       ├── seed.ts
│       └── reset-db.ts
├── modules/
│   ├── auth/
│   │   └── dtos/
│   ├── usuario/
│   │   └── dtos/
│   └── registro-ponto/
│   │   └── dtos/
├── shared/
│   ├── errors/
│   ├── middlewares/
│   ├── schemas/
│   ├── types/
│   └── utils/
└── server.ts
```

---

## Licença

MIT — feito com propósito educacional no programa de capacitação do [INDT](https://www.indt.org.br).