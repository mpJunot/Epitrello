FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --no-frozen-lockfile

COPY . .

RUN pnpm run build

# Production stage
FROM node:20-alpine AS production

# pnpm only needed if we re-install; optional in final runtime but kept minimal
RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --prod --no-frozen-lockfile

COPY --from=builder /app/dist ./dist

# Use default non-root user from node base image for better security
USER node

EXPOSE 4000

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]