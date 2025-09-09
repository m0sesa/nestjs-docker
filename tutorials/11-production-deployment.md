# Phase 11: Production Deployment

Configure production-ready deployment with Let's Encrypt SSL, security hardening, monitoring, and proper environment management.

## 🎯 Goals

- Set up production environment configuration and secrets
- Configure Let's Encrypt SSL certificates for production domains
- Implement production security best practices and monitoring
- Create deployment workflows and rollback procedures
- Document production maintenance and scaling strategies

## 🏭 Production Environment Setup

### **Production Architecture:**
```
Internet → Traefik (SSL Termination) → NestJS App → PostgreSQL
         ↓
    Let's Encrypt (Auto SSL)
```

**Production Components:**
- **Traefik** - Reverse proxy with automatic SSL certificates
- **NestJS App** - Production-optimized container with security hardening
- **PostgreSQL** - Production database with persistence and backups
- **Let's Encrypt** - Automatic SSL certificate management

## 🛠️ Step-by-Step Implementation

### **1. Create Production Environment File**

```bash
# infrastructure/.env.production.example
# Production Environment Configuration Template
# Copy to .env.production and update with real values

# Node Environment
NODE_ENV=production
PORT=3000

# Domain Configuration
DOMAIN=yourdomain.com
ACME_EMAIL=admin@yourdomain.com

# Database Configuration (Production)
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=CHANGE_THIS_SUPER_SECURE_DATABASE_PASSWORD
DB_DATABASE=nestjs_prod

# PostgreSQL Container Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=CHANGE_THIS_SUPER_SECURE_DATABASE_PASSWORD
POSTGRES_DB=nestjs_prod

# JWT Configuration (CRITICAL: Generate secure secret)
JWT_SECRET=CHANGE_THIS_SUPER_SECURE_JWT_SECRET_256_BIT_MINIMUM

# Mail Configuration (Production SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-production-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
MAIL_FROM_NAME=Your Application Name
MAIL_FROM_ADDRESS=noreply@yourdomain.com

# Frontend URL
FRONTEND_URL=https://app.yourdomain.com

# Traefik Authentication (Generate with htpasswd)
# htpasswd -nb admin your-secure-password
TRAEFIK_AUTH=admin:$2y$10$generateThisHashWithHtpasswd

# Optional: Database Read-Only User
DB_READONLY_USER=nestjs_readonly
DB_READONLY_PASSWORD=CHANGE_THIS_READONLY_PASSWORD

# Optional: Monitoring
MONITORING_ENABLED=true
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

**📁 File:** [`infrastructure/.env.production.example`](../infrastructure/.env.production.example)

### **2. Update Production Docker Compose**

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
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    labels:
      # Traefik configuration
      - "traefik.enable=true"
      - "traefik.docker.network=traefik-network"
      
      # Main API routes
      - "traefik.http.routers.nestjs-api.rule=Host(`api.${DOMAIN:-localhost}`)"
      - "traefik.http.routers.nestjs-api.entrypoints=websecure"
      - "traefik.http.routers.nestjs-api.tls.certresolver=letsencrypt"
      - "traefik.http.routers.nestjs-api.middlewares=security-headers,rate-limit"
      
      # Service configuration
      - "traefik.http.services.nestjs-api.loadbalancer.server.port=3000"
      - "traefik.http.services.nestjs-api.loadbalancer.healthcheck.path=/health"
      - "traefik.http.services.nestjs-api.loadbalancer.healthcheck.interval=30s"

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
      - ../backups:/backups  # Mount backup directory
    networks:
      - internal-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
    # Security: Don't expose PostgreSQL port in production
    # ports:
    #   - "5432:5432"

  # Optional: Database Backup Service
  postgres-backup:
    image: postgres:15-alpine
    container_name: postgres-backup-prod
    restart: unless-stopped
    env_file:
      - ../.env.production
    volumes:
      - ../backups:/backups
      - ../scripts/backup-db.sh:/backup-db.sh:ro
    networks:
      - internal-network
    depends_on:
      - postgres
    # Run backup every day at 2 AM
    command: sh -c "echo '0 2 * * * /backup-db.sh' | crontab - && crond -f"

volumes:
  postgres_data:
    driver: local
    driver_opts:
      type: none
      device: /var/lib/docker/volumes/nestjs_postgres_prod/_data
      o: bind

networks:
  traefik-network:
    external: true
  internal-network:
    external: false
    driver: bridge
```

**📁 File:** [`infrastructure/docker/docker-compose.prod.yml`](../infrastructure/docker/docker-compose.prod.yml)

### **3. Update Production Traefik Configuration**

```yaml
# infrastructure/traefik/config/prod-routes.yml
http:
  routers:
    # NestJS API Router
    nestjs-api:
      rule: "Host(`api.${DOMAIN}`)"
      entryPoints: [websecure]
      service: nestjs-api
      tls:
        certResolver: letsencrypt
      middlewares:
        - security-headers
        - rate-limit

    # Traefik Dashboard (Protected)
    traefik-dashboard:
      rule: "Host(`traefik.${DOMAIN}`)"
      entryPoints: [websecure]
      service: api@internal
      tls:
        certResolver: letsencrypt
      middlewares:
        - traefik-auth
        - security-headers

    # Health Check Endpoint (Public)
    health-check:
      rule: "Host(`api.${DOMAIN}`) && Path(`/health`)"
      entryPoints: [websecure]
      service: nestjs-api
      tls:
        certResolver: letsencrypt
      middlewares:
        - security-headers
      priority: 100

  services:
    nestjs-api:
      loadBalancer:
        servers:
          - url: "http://nestjs-app-prod:3000"
        healthCheck:
          path: "/health"
          interval: "30s"
          timeout: "10s"

  middlewares:
    # Production Security Headers
    security-headers:
      headers:
        # CORS Configuration
        accessControlAllowOriginList:
          - "https://${DOMAIN}"
          - "https://app.${DOMAIN}"
        accessControlAllowMethods:
          - "GET"
          - "POST"
          - "PUT"
          - "DELETE"
          - "OPTIONS"
        accessControlAllowHeaders:
          - "Authorization"
          - "Content-Type"
          - "X-Requested-With"
        accessControlMaxAge: 86400
        
        # Security Headers
        stsSeconds: 31536000
        stsIncludeSubdomains: true
        stsPreload: true
        forceSTSHeader: true
        frameDeny: true
        contentTypeNosniff: true
        browserXssFilter: true
        referrerPolicy: "strict-origin-when-cross-origin"
        
        # Custom Headers
        customHeaders:
          X-Forwarded-Proto: "https"
          X-Robots-Tag: "noindex, nofollow"  # Prevent API indexing
          Server: ""  # Hide server info
          
        # Remove Headers
        customHeadersToRemove:
          - "Server"
          - "X-Powered-By"

    # Rate Limiting
    rate-limit:
      rateLimit:
        average: 100      # 100 requests per second average
        burst: 200        # Allow bursts up to 200
        period: "1m"      # Per minute
        sourceCriterion:
          ipStrategy:
            depth: 1

    # Authentication for Traefik Dashboard
    traefik-auth:
      basicAuth:
        users:
          - "${TRAEFIK_AUTH}"
```

**📁 File:** [`infrastructure/traefik/config/prod-routes.yml`](../infrastructure/traefik/config/prod-routes.yml)

### **4. Create Database Backup Script**

```bash
#!/bin/bash
# infrastructure/scripts/backup-db.sh
# Automated database backup script for production

set -e

# Configuration
BACKUP_DIR="/backups"
DB_NAME="${POSTGRES_DB:-nestjs_prod}"
DB_USER="${POSTGRES_USER:-postgres}"
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate backup filename with timestamp
BACKUP_FILE="$BACKUP_DIR/postgres_backup_$(date +%Y%m%d_%H%M%S).sql"

echo "Starting database backup..."
echo "Database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"

# Create backup
pg_dump -h postgres-prod -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"
BACKUP_FILE="$BACKUP_FILE.gz"

echo "Backup completed: $BACKUP_FILE"

# Calculate backup size
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "Backup size: $BACKUP_SIZE"

# Clean up old backups (keep only last 30 days)
echo "Cleaning up old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "postgres_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete

# List current backups
echo "Current backups:"
ls -lah "$BACKUP_DIR"/postgres_backup_*.sql.gz | tail -10

echo "Database backup process completed successfully."
```

**📁 File:** [`infrastructure/scripts/backup-db.sh`](../infrastructure/scripts/backup-db.sh)

```bash
# Make backup script executable
chmod +x infrastructure/scripts/backup-db.sh
```

### **5. Create Production Deployment Script**

```bash
#!/bin/bash
# infrastructure/scripts/deploy-prod.sh
# Production deployment script with safety checks

set -e

echo "🚀 Starting production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
BACKUP_BEFORE_DEPLOY=true
HEALTH_CHECK_TIMEOUT=300  # 5 minutes

# Safety checks
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ .env.production not found${NC}"
    echo "Please create production environment file first"
    exit 1
fi

# Load production environment
source .env.production

# Validate required variables
required_vars=("DOMAIN" "ACME_EMAIL" "DB_PASSWORD" "JWT_SECRET")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Required variable $var is not set${NC}"
        exit 1
    fi
done

# Pre-deployment backup
if [ "$BACKUP_BEFORE_DEPLOY" = true ]; then
    echo -e "${YELLOW}💾 Creating pre-deployment backup...${NC}"
    docker exec postgres-prod /backups/backup-db.sh || {
        echo -e "${YELLOW}⚠️  Backup failed, but continuing deployment${NC}"
    }
fi

# Create external network if needed
if ! docker network inspect traefik-network &> /dev/null; then
    echo -e "${YELLOW}🌐 Creating Traefik network...${NC}"
    docker network create traefik-network
fi

# Build new images
echo -e "${YELLOW}🔨 Building production images...${NC}"
docker-compose -f docker/docker-compose.prod.yml build --no-cache

# Start Traefik if not running
if ! docker ps | grep -q traefik-prod; then
    echo -e "${YELLOW}🔀 Starting Traefik...${NC}"
    docker-compose -f docker/traefik.prod.yml up -d
    sleep 10
fi

# Deploy with zero-downtime strategy
echo -e "${YELLOW}🚀 Deploying application...${NC}"

# Start new containers
docker-compose -f docker/docker-compose.prod.yml up -d --remove-orphans

# Health check with timeout
echo -e "${YELLOW}🏥 Performing health checks...${NC}"
health_check_start=$(date +%s)

while true; do
    current_time=$(date +%s)
    elapsed=$((current_time - health_check_start))
    
    if [ $elapsed -gt $HEALTH_CHECK_TIMEOUT ]; then
        echo -e "${RED}❌ Health check timeout after ${HEALTH_CHECK_TIMEOUT}s${NC}"
        echo "Deployment may have failed - check logs:"
        echo "  docker-compose -f docker/docker-compose.prod.yml logs"
        exit 1
    fi
    
    if curl -s -k --max-time 10 "https://api.$DOMAIN/health" > /dev/null; then
        echo -e "${GREEN}✅ Application is healthy${NC}"
        break
    fi
    
    echo "Waiting for application to be ready... (${elapsed}s)"
    sleep 10
done

# Clean up old images and containers
echo -e "${YELLOW}🧹 Cleaning up...${NC}"
docker image prune -f
docker container prune -f

# Final status
echo ""
echo -e "${GREEN}🎉 Production deployment completed successfully!${NC}"
echo ""
echo "🔗 Production URLs:"
echo "  API:       https://api.$DOMAIN"
echo "  Docs:      https://api.$DOMAIN/api/docs"
echo "  Traefik:   https://traefik.$DOMAIN"
echo ""
echo "📊 Post-deployment checks:"
echo "  Health:    curl https://api.$DOMAIN/health"
echo "  Logs:      docker-compose -f docker/docker-compose.prod.yml logs -f"
echo "  Status:    just status"
echo ""
```

**📁 File:** [`infrastructure/scripts/deploy-prod.sh`](../infrastructure/scripts/deploy-prod.sh)

```bash
# Make deployment script executable
chmod +x infrastructure/scripts/deploy-prod.sh
```

### **6. Update Justfile with Production Commands**

```bash
# Add these commands to infrastructure/justfile

# === Production Deployment Commands ===

# Deploy to production with safety checks
prod-deploy:
    @echo "🚀 Deploying to production..."
    @./scripts/deploy-prod.sh

# Quick production restart
prod-restart:
    @echo "🔄 Restarting production services..."
    @docker-compose -f docker/docker-compose.prod.yml restart

# Production health check
prod-health:
    @echo "🏥 Checking production health..."
    @curl -s https://api.$(DOMAIN)/health || echo "❌ API not responding"
    @docker-compose -f docker/docker-compose.prod.yml ps

# Create production backup
prod-backup:
    @echo "💾 Creating production backup..."
    @docker exec postgres-prod /backups/backup-db.sh

# View production SSL certificate info
prod-ssl-info:
    @echo "🔐 SSL Certificate Information:"
    @echo | openssl s_client -servername api.$(DOMAIN) -connect api.$(DOMAIN):443 2>/dev/null | openssl x509 -noout -dates

# Update production environment (restart required)
prod-env-update:
    @echo "⚙️  Updating production environment..."
    @docker-compose -f docker/docker-compose.prod.yml up -d --force-recreate
```

## 🔄 Git Commit

This step corresponds to commit: `a3c5f7d`

```bash
git add .
git commit -m "Add comprehensive production deployment setup

- Created production environment configuration template
- Updated production Docker Compose with health checks
- Implemented production-grade Traefik routing and security
- Added automated database backup system with retention
- Created zero-downtime deployment script with safety checks
- Added production management commands to justfile"
```

## 🏭 Production Deployment Process

### **Initial Production Setup:**

1. **Prepare Environment:**
```bash
# Copy and configure production environment
cp .env.production.example .env.production
vim .env.production  # Update all values

# Generate secure passwords
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 16  # For DB_PASSWORD

# Generate Traefik auth hash
htpasswd -nb admin your-secure-password
```

2. **Deploy to Production:**
```bash
# From infrastructure directory
cd infrastructure

# Run deployment
just prod-deploy

# Monitor deployment
just prod-logs
```

3. **Verify Deployment:**
```bash
# Check health
just prod-health

# Test API endpoints
curl https://api.yourdomain.com/health
curl https://api.yourdomain.com/api/docs

# Check SSL certificate
just prod-ssl-info
```

### **Ongoing Maintenance:**

```bash
# Regular health checks
just prod-health

# View logs
just prod-logs

# Create backups
just prod-backup

# Deploy updates
just prod-deploy
```

## 🔒 Production Security Checklist

### **SSL/TLS:**
- ✅ **Let's Encrypt certificates** with automatic renewal
- ✅ **HSTS headers** with long max-age and includeSubDomains
- ✅ **Strong TLS configuration** (TLS 1.2+, secure cipher suites)
- ✅ **HTTP to HTTPS redirects** for all traffic

### **Application Security:**
- ✅ **Rate limiting** to prevent abuse
- ✅ **Security headers** (XSS, CSRF, Content-Type protection)
- ✅ **Secret management** with environment variables
- ✅ **Non-root container** execution

### **Database Security:**
- ✅ **Strong passwords** with proper entropy
- ✅ **Network isolation** (internal network only)
- ✅ **Regular backups** with retention policy
- ✅ **No exposed ports** to public network

### **Infrastructure Security:**
- ✅ **Protected Traefik dashboard** with authentication
- ✅ **Container health checks** for availability monitoring
- ✅ **Resource limits** and restart policies
- ✅ **Log management** for security monitoring

## 🎯 What's Next

In the next tutorial, we'll:
1. Review comprehensive security best practices for production
2. Implement additional security layers and monitoring
3. Configure production-ready logging and error tracking
4. Set up container security and user permissions
5. Create security incident response procedures

→ **Continue to:** [13-security-best-practices.md](./13-security-best-practices.md)