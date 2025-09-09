# Multi-stage build for Nuxt 3 Admin Panel
FROM node:18-alpine AS base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nuxtjs -u 1001

# Stage 1: Dependencies
FROM base AS dependencies
WORKDIR /app
RUN chown -R nuxtjs:nodejs /app

# Copy package files
COPY --chown=nuxtjs:nodejs package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Build
FROM base AS build
WORKDIR /app
RUN chown -R nuxtjs:nodejs /app

# Copy package files and install all dependencies
COPY --chown=nuxtjs:nodejs package*.json ./
RUN npm ci

# Copy source code
COPY --chown=nuxtjs:nodejs . .

# Build the application
RUN npm run build

# Stage 3: Development
FROM base AS development
ENV NODE_ENV=development
WORKDIR /app
RUN chown -R nuxtjs:nodejs /app

# Copy package files and install all dependencies
COPY --chown=nuxtjs:nodejs package*.json ./
RUN npm ci

# Copy source code
COPY --chown=nuxtjs:nodejs . .

# Switch to non-root user
USER nuxtjs

# Expose port
EXPOSE 3000

# Start development server
CMD ["dumb-init", "npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Stage 4: Production
FROM base AS production
ENV NODE_ENV=production
WORKDIR /app
RUN chown -R nuxtjs:nodejs /app

# Copy production dependencies
COPY --from=dependencies --chown=nuxtjs:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=build --chown=nuxtjs:nodejs /app/.output ./.output
COPY --from=build --chown=nuxtjs:nodejs /app/package.json ./package.json

# Switch to non-root user
USER nuxtjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start production server
CMD ["dumb-init", "node", ".output/server/index.mjs"]