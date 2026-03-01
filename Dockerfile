# Dockerfile optimisé pour Coolify - Domelia.fr
FROM node:20-alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

# Stage 2: Build
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build et préparer standalone
RUN npm run build

# Stage 3: Production
FROM base AS runner
WORKDIR /app

# OpenSSL nécessaire pour Prisma avec SQLite
RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier l'application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Créer le dossier db avec les bonnes permissions
RUN mkdir -p /app/db && chown -R nextjs:nodejs /app/db

# Script de démarrage
COPY docker-start.sh ./docker-start.sh
RUN chmod +x ./docker-start.sh && chown nextjs:nodejs ./docker-start.sh

USER nextjs

EXPOSE 3000

CMD ["./docker-start.sh"]
