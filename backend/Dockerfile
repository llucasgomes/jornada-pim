# ---- Base image ----
FROM node:24-alpine AS base


# Instala pnpm
RUN corepack enable pnpm && corepack install -g pnpm@10.32.1

WORKDIR /app

# ---- Dependencies ----
FROM base AS deps

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile


# ---- Build ----
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build

# ---- Production ----
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Instala pnpm no runtime também (opcional, mas útil)
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

# Copia apenas o necessário
COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.js"]