# Phase 6: Docker Containerization

Containerize the NestJS application with multi-stage builds and comprehensive Docker Compose setup for development and production environments.

## 🎯 Goals

- Create multi-stage Docker builds for optimized images
- Set up development and production Docker configurations  
- Configure Docker Compose with PostgreSQL and MailHog
- Optimize Docker images for size and security
- Establish Docker networking and volume management

## 📦 Docker Images Used

```dockerfile
# Base images in our multi-stage build
FROM node:18-alpine AS base
FROM node:18-alpine AS development  
FROM node:18-alpine AS production
```

**Image Purposes:**
- `node:18-alpine` - Lightweight Node.js runtime (Alpine Linux)
- Multi-stage builds reduce final image size significantly
- Alpine variant provides security and minimal attack surface

## 🛠️ Step-by-Step Implementation

### **1. Create Multi-Stage Dockerfile**

```dockerfile
# app/Dockerfile
# Stage 1: Base stage with common dependencies
FROM node:18-alpine AS base
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Development stage
FROM base AS development
ENV NODE_ENV=development

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy source code
COPY . .

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 3000

# Use dumb-init for proper signal handling
CMD ["dumb-init", "npm", "run", "start:dev"]

# Stage 3: Build stage
FROM base AS build
ENV NODE_ENV=production

# Install all dependencies for build
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 4: Production stage
FROM base AS production
ENV NODE_ENV=production

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Use dumb-init for proper signal handling
CMD ["dumb-init", "node", "dist/main"]
```

**📁 File:** [`app/Dockerfile`](../app/Dockerfile)

### **2. Create Docker Ignore File**

```dockerfile
# app/.dockerignore
node_modules
npm-debug.log
dist
.git
.gitignore
README.md
.env
.nyc_output
coverage
.coverage
.cache
.parcel-cache
.DS_Store
*.md
.vscode
.idea

# Test files
**/*.test.ts
**/*.spec.ts
test/
coverage/

# Documentation
docs/
```

**📁 File:** [`app/.dockerignore`](../app/.dockerignore)

### **3. Create Development Docker Compose**

```yaml
# infrastructure/docker/docker-compose.dev.yml
version: '3.8'

services:
  # NestJS Application
  app:
    build:
      context: ../../app
      dockerfile: Dockerfile
      target: development
    container_name: nestjs-app-dev
    restart: unless-stopped
    env_file:
      - ../.env.development
    volumes:
      - ../../app:/app
      - /app/node_modules  # Anonymous volume for node_modules
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - mailhog
    networks:
      - app-network

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: postgres-dev
    restart: unless-stopped
    env_file:
      - ../.env.development
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ../init-db.sql:/docker-entrypoint-initdb.d/init-db.sql:ro
    ports:
      - "5432:5432"
    networks:
      - app-network

  # MailHog for Email Testing  
  mailhog:
    image: mailhog/mailhog:v1.0.1
    container_name: mailhog-dev
    restart: unless-stopped
    ports:
      - "1025:1025"  # SMTP port
      - "8025:8025"  # Web UI port
    networks:
      - app-network

  # Adminer for Database Management
  adminer:
    image: adminer:4.8.1
    container_name: adminer-dev
    restart: unless-stopped
    env_file:
      - ../.env.development
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    networks:
      - app-network

volumes:
  postgres_data:
    driver: local

networks:
  app-network:
    driver: bridge
```

**📁 File:** [`infrastructure/docker/docker-compose.dev.yml`](../infrastructure/docker/docker-compose.dev.yml)

### **4. Create Production Docker Compose**

```yaml
# infrastructure/docker/docker-compose.prod.yml
version: '3.8'

services:
  # NestJS Application
  app:
    build:
      context: ../../app
      dockerfile: Dockerfile
      target: production
    container_name: nestjs-app-prod
    restart: unless-stopped
    env_file:
      - ../.env.production
    depends_on:
      - postgres
    networks:
      - traefik-network
      - internal-network
    labels:
      # Traefik configuration (will be covered in next phase)
      - "traefik.enable=true"
      - "traefik.docker.network=traefik-network"
      - "traefik.http.routers.nestjs-api.rule=Host(`api.${DOMAIN:-localhost}`)"
      - "traefik.http.routers.nestjs-api.entrypoints=websecure"
      - "traefik.http.routers.nestjs-api.tls.certresolver=letsencrypt"
      - "traefik.http.services.nestjs-api.loadbalancer.server.port=3000"

  # PostgreSQL Database  
  postgres:
    image: postgres:15-alpine
    container_name: postgres-prod
    restart: unless-stopped
    env_file:
      - ../.env.production
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ../init-db.sql:/docker-entrypoint-initdb.d/init-db.sql:ro
    networks:
      - internal-network

volumes:
  postgres_data:
    driver: local

networks:
  traefik-network:
    external: true
  internal-network:
    external: false
```

**📁 File:** [`infrastructure/docker/docker-compose.prod.yml`](../infrastructure/docker/docker-compose.prod.yml)

### **5. Create Database Initialization Script**

```sql
-- infrastructure/init-db.sql
-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create development database (if not exists)
-- This script runs during container initialization
-- Additional databases can be created here if needed

-- Optional: Create additional users with limited permissions
-- DO $$ 
-- BEGIN
--   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'nestjs_readonly') THEN
--     CREATE ROLE nestjs_readonly LOGIN PASSWORD 'readonly_password';
--     GRANT CONNECT ON DATABASE nestjs_dev TO nestjs_readonly;
--     GRANT USAGE ON SCHEMA public TO nestjs_readonly;
--     GRANT SELECT ON ALL TABLES IN SCHEMA public TO nestjs_readonly;
--   END IF;
-- END $$;
```

**📁 File:** [`infrastructure/init-db.sql`](../infrastructure/init-db.sql)

### **6. Update Environment Configuration**

```bash
# infrastructure/.env.development
# Node Environment
NODE_ENV=development
PORT=3000

# Database Configuration (Docker container names)
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=nestjs_dev

# PostgreSQL Container Configuration  
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=nestjs_dev

# JWT Configuration
JWT_SECRET=dev-jwt-secret-key-change-in-production

# Mail Configuration (MailHog container)
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_USER=test
MAIL_PASSWORD=test
MAIL_FROM_NAME=NestJS Dev App
MAIL_FROM_ADDRESS=noreply@interestingapp.local

# Frontend URL
FRONTEND_URL=https://app.interestingapp.local

# Adminer Configuration
ADMINER_DEFAULT_SERVER=postgres
```

**📁 File:** [`infrastructure/.env.development`](../infrastructure/.env.development)

## 🔄 Git Commit

This step corresponds to commit: `a4b7c9d`

```bash
git add .
git commit -m "Add comprehensive Docker containerization

- Created multi-stage Dockerfile with development/production targets
- Set up development Docker Compose with all services
- Added production Docker Compose with Traefik labels
- Created PostgreSQL initialization script with UUID extension  
- Configured container networking and volume management
- Added security best practices (non-root user, dumb-init)
- Optimized Docker images with Alpine Linux base"
```

## 🐳 Docker Best Practices Implemented

### **Multi-Stage Builds:**
- **Base stage** - Common dependencies and security setup
- **Development stage** - Hot reload with volume mounts
- **Build stage** - Application compilation
- **Production stage** - Minimal runtime image

### **Security Features:**
- **Non-root user** (`nestjs:nodejs`) for container execution
- **dumb-init** for proper signal handling and zombie reaping
- **Alpine Linux** base for minimal attack surface
- **Health checks** for container monitoring

### **Performance Optimizations:**
- **Layer caching** with optimized COPY order
- **Anonymous volumes** for node_modules in development
- **Production builds** without dev dependencies
- **Clean npm cache** to reduce image size

### **Development Experience:**
- **Hot reload** with volume mounting
- **Database persistence** with named volumes  
- **Service dependencies** with `depends_on`
- **Port mapping** for direct access during development

## 🧪 Testing Docker Setup

### **Build and Run Development Environment:**
```bash
# From infrastructure directory
cd infrastructure

# Build and start all services
docker-compose -f docker/docker-compose.dev.yml up --build

# Check running containers
docker ps

# View logs
docker-compose -f docker/docker-compose.dev.yml logs -f app
```

### **Test Services:**
```bash
# Test API
curl http://localhost:3000/health

# Test Swagger documentation
open http://localhost:3000/api/docs

# Test MailHog interface
open http://localhost:8025

# Test Adminer database interface
open http://localhost:8080
# Server: postgres, User: postgres, Password: postgres, Database: nestjs_dev
```

### **Verify Database Connection:**
```bash
# Connect to PostgreSQL container
docker exec -it postgres-dev psql -U postgres -d nestjs_dev

# Check for UUID extension
\dx

# Exit PostgreSQL
\q
```

## 📝 Container Management Commands

### **Development Workflow:**
```bash
# Start services
docker-compose -f docker/docker-compose.dev.yml up -d

# View logs
docker-compose -f docker/docker-compose.dev.yml logs -f

# Stop services  
docker-compose -f docker/docker-compose.dev.yml down

# Stop and remove volumes
docker-compose -f docker/docker-compose.dev.yml down -v

# Rebuild specific service
docker-compose -f docker/docker-compose.dev.yml up --build app
```

### **Production Workflow:**
```bash
# Build for production
docker-compose -f docker/docker-compose.prod.yml build

# Start production services
docker-compose -f docker/docker-compose.prod.yml up -d

# Check production logs
docker-compose -f docker/docker-compose.prod.yml logs -f app
```

## 🎯 What's Next

In the next tutorial, we'll:
1. Install and configure Traefik reverse proxy
2. Set up SSL certificates with Let's Encrypt for production
3. Configure file provider for clean route management
4. Implement HTTP to HTTPS redirects and security headers
5. Create production-ready proxy configuration

→ **Continue to:** [07-traefik-setup.md](./07-traefik-setup.md)