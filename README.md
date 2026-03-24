# JornadaPIM

Sistema web de controle de ponto e jornada de trabalho para colaboradores do Polo Industrial de Manaus (PIM).

---

## Sobre o projeto

O JornadaPIM substitui relógios de ponto físicos e planilhas manuais por um fluxo digital com cálculo automático de horas trabalhadas, horas extras, atrasos e banco de horas. Gestores acompanham a jornada da equipe em tempo real pelo dashboard, sem depender de relatórios manuais do RH.

Projeto desenvolvido como módulo final da Trilha Full Stack do programa de capacitação do **INDT — Instituto de Desenvolvimento Tecnológico**, ambientado no contexto industrial do PIM.

---

## Repositórios

| Repositório | Descrição |
|---|---|
| `backend` | API REST em Node.js |
| `frontend` | Interface web em Angular |

---

## Stack

**Backend**
- Node.js + Fastify
- TypeORM + PostgreSQL
- JWT + bcrypt
- Zod
- Swagger
- Docker Compose
- Biome (lint e format)

**Frontend**
- Angular 21
- Tailwind CSS
- TypeScript

---

## Funcionalidades

- Login com redirecionamento por perfil (colaborador, gestor, RH)
- Registro de ponto com 4 batidas diárias (entrada, saída almoço, retorno, saída)
- Cálculo automático de horas trabalhadas, extras e atrasos
- Histórico de ponto por período
- Espelho de ponto mensal com totais
- Dashboard com indicadores em tempo real
- Cadastro e gestão de colaboradores com jornada configurável

---

## Perfis de acesso

| Perfil | Permissões |
|---|---|
| Colaborador | Registra ponto, consulta próprio histórico e banco de horas |
| Gestor | Acompanha equipe, aprova ajustes, visualiza dashboard |
| RH | Gera espelho mensal, gerencia colaboradores, exporta dados |

---

## Como rodar o projeto

### Backend

```bash
git clone https://github.com/llucasgomes/jornada-pim
cd backend
cp .env.example .env
docker compose up --build
```

API disponível em: `http://localhost:3000`  
Documentação Swagger: `http://localhost:3000/api-docs`

### Frontend

```bash
git clone https://github.com/llucasgomes/jornada-pim
cd frontend
npm install
npx ng serve
```

Interface disponível em: `http://localhost:4200`

---

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do backend baseado no `.env.example`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=sua_senha
DB_NAME=pontopim
JWT_SECRET=sua_chave_secreta
TZ=America/Manaus
```

---

## Observação técnica

Todo cálculo de horas é feito no backend com `timestamptz` e timezone `America/Manaus`, garantindo consistência independente do fuso horário do navegador do colaborador.