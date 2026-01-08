# ---- Base Dependencies ----
FROM node:20-alpine AS base

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# ---- Builder ----
FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules

COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm run build

# ---- Production Runtime ----
FROM node:20-alpine AS production

RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy standalone build (includes server.js and all dependencies)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]
