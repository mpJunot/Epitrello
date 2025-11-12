# ---- 1. Base Dependencies ----
FROM node:20-alpine AS base

# Install pnpm globally (faster & more reliable dependency management)
RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# ---- Builder ----
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY --from=base /app/node_modules ./node_modules

COPY . .

RUN pnpm prisma generate

RUN pnpm run build

# ---- Production Runtime ----
FROM node:20-alpine AS production

# Install minimal system dependencies required by Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts ./scripts

RUN chmod +x ./scripts/docker-entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["./scripts/docker-entrypoint.sh"]
