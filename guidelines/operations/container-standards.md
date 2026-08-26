# Operations: Container Standards & Docker Compose

This document defines standards for containerized local development and production container builds.

---

## 1. Core Principles

1. **Environment Parity**: Local container environments must mirror production behavior as closely as possible.
2. **Explicitness**: Define all ports, environment variables, volumes, and health checks explicitly.
3. **Security by Least Privilege**: Never run production containers as the root user.

---

## 2. Docker Compose Standards (`compose.yaml`)

Use the canonical `compose.yaml` filename:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: dev
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      PORT: 3000
      DATABASE_URL: postgresql://app_user:${DB_PASSWORD}@postgres:5432/app_db
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - app_network

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: app_db
    volumes:
      - ./volumes/postgres:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app_user -d app_db"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - app_network

networks:
  app_network:
    driver: bridge
```

---

## 3. Production Multi-Stage Dockerfiles

Always use multi-stage builds to create lean, secure production images without build dependencies:

```dockerfile
# Stage 1: Base & Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && npm prune --production

# Stage 3: Minimal Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Run as non-root user
USER node

COPY --chown=node:node package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

---

## 4. Container Security Rules

1. **Non-Root Execution**: Always declare `USER node` or `USER nonroot` before the entrypoint in production stages.
2. **No Secrets in Images**: Never use `ARG` or `ENV` to bake secrets into image layers. Pass secrets at container runtime via environment variables or secret mounts.
3. **Pin Base Image Versions**: Use explicit version tags (`node:20.12-alpine`), never `:latest`.
