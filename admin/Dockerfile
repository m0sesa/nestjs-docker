# Dockerfile for Nuxt 4 Admin Panel
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM base AS development
WORKDIR /app

# Install all dependencies (including dev)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Create .nuxt directory with proper permissions for volume mounts
RUN mkdir -p .nuxt && chmod 777 .nuxt

EXPOSE 3000

ENV NODE_ENV development
ENV NUXT_HOST 0.0.0.0
ENV NUXT_PORT 3000

# Run as root in development for volume mount compatibility
CMD ["sh", "-c", "chmod -R 777 /app/.nuxt 2>/dev/null || true && npm run dev"]

# Builder stage
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Build the application
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nuxt
RUN adduser --system --uid 1001 nuxt

# Copy built application
COPY --from=builder --chown=nuxt:nuxt /app/.nuxt ./.nuxt
COPY --from=builder --chown=nuxt:nuxt /app/.output ./.output
COPY --from=builder --chown=nuxt:nuxt /app/package*.json ./

# Install only production dependencies
COPY --from=deps --chown=nuxt:nuxt /app/node_modules ./node_modules

USER nuxt

EXPOSE 3000

ENV PORT 3000
ENV NODE_ENV production
ENV NUXT_HOST 0.0.0.0
ENV NUXT_PORT 3000

CMD ["npm", "run", "preview"]