# ---- 1. Base Dependencies ----
FROM node:20-alpine AS base

# Install pnpm globally (faster & more reliable dependency management)
RUN npm install -g pnpm

WORKDIR /app

# Copy only dependency files to leverage Docker cache
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (using the lockfile for reproducibility)
RUN pnpm install --frozen-lockfile

# ---- 2. Build ----
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

# Copy node_modules from the base stage to avoid reinstalling
COPY --from=base /app/node_modules ./node_modules

# Copy the rest of the source code
COPY . .

# Generate Prisma client and build the NestJS application
RUN pnpm prisma generate
RUN pnpm run build

# ---- 3. Production Runtime ----
FROM node:20-alpine AS production

# Install minimal system dependencies required by Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Set environment variables for production
ENV NODE_ENV=production

# Copy only the necessary files for runtime
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts ./scripts

# Make entrypoint script executable
RUN chmod +x ./scripts/docker-entrypoint.sh

# Expose the application port
EXPOSE 4000

# Start the application with migrations
ENTRYPOINT ["./scripts/docker-entrypoint.sh"]
