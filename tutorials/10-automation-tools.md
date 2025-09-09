# Phase 10: Automation Tools with Just

Set up comprehensive automation using Just command runner for streamlined development and production workflows.

## 🎯 Goals

- Install Just command runner system-wide
- Create comprehensive automation commands for all operations
- Set up idempotent setup scripts that handle existing resources
- Implement development and production workflow automation
- Add utility commands for common operations and troubleshooting

## 📦 Tool Installation

### **Install Just Command Runner**

```bash
# macOS
brew install just

# Linux (using curl)
curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to ~/bin

# Or download from GitHub releases
wget -qO- "https://github.com/casey/just/releases/download/1.14.0/just-1.14.0-x86_64-unknown-linux-musl.tar.gz" | tar -xzf- just
sudo mv just /usr/local/bin/

# Verify installation
just --version
```

**Tool Purpose:**
- `just` - Command runner similar to `make` but simpler and more modern
- Cross-platform support (Windows, macOS, Linux)
- Simple syntax with powerful features (variables, conditionals, functions)
- Better than shell scripts for complex automation workflows

## 🛠️ Step-by-Step Implementation

### **1. Create Main Justfile**

```bash
# infrastructure/justfile
# Main automation commands for the project

# Load environment variables
set dotenv-load := true

# Default recipe to list available commands
default:
    @just --list

# === Development Commands ===

# Start complete development environment
dev-up:
    @echo "🚀 Starting development environment..."
    @./scripts/setup-dev.sh

# Stop development environment  
dev-down:
    @echo "🛑 Stopping development environment..."
    @./scripts/teardown-dev.sh

# Restart development environment
dev-restart:
    @echo "🔄 Restarting development environment..."
    @just dev-down
    @sleep 2
    @just dev-up

# View development logs
dev-logs service="":
    #!/usr/bin/env bash
    if [ "{{service}}" = "" ]; then
        docker-compose -f docker/docker-compose.dev.yml logs -f
    else
        docker-compose -f docker/docker-compose.dev.yml logs -f {{service}}
    fi

# === Application Commands ===

# Install application dependencies
app-install:
    @echo "📦 Installing application dependencies..."
    @cd ../app && npm install

# Run application in development mode (outside Docker)
app-dev:
    @echo "🚀 Starting application in development mode..."
    @cd ../app && npm run start:dev

# Build application
app-build:
    @echo "🔨 Building application..."
    @cd ../app && npm run build

# Run application tests
app-test:
    @echo "🧪 Running application tests..."
    @cd ../app && npm test

# Run application linting
app-lint:
    @echo "🔍 Running application linting..."
    @cd ../app && npm run lint

# Fix linting issues
app-lint-fix:
    @echo "🔧 Fixing linting issues..."
    @cd ../app && npm run lint -- --fix

# === Database Commands ===

# Connect to development database
db-connect:
    @echo "🗄️ Connecting to development database..."
    @docker exec -it postgres-dev psql -U postgres -d nestjs_dev

# Run database migrations (when implemented)
db-migrate:
    @echo "📊 Running database migrations..."
    @cd ../app && npm run migration:run

# Create new migration (when implemented)
db-migration-create name:
    @echo "📝 Creating new migration: {{name}}"
    @cd ../app && npm run migration:create -- --name={{name}}

# Reset development database
db-reset:
    @echo "⚠️  Resetting development database..."
    @docker-compose -f docker/docker-compose.dev.yml stop postgres
    @docker volume rm infrastructure_postgres_data || true
    @docker-compose -f docker/docker-compose.dev.yml up -d postgres

# === SSL Certificate Commands ===

# Install mkcert and generate certificates
ssl-install:
    @echo "🔐 Setting up SSL certificates..."
    @./scripts/setup-ssl.sh

# Regenerate SSL certificates
ssl-renew:
    @echo "🔄 Regenerating SSL certificates..."
    @cd traefik/certs && rm -f interestingapp.local+1*
    @cd traefik/certs && mkcert "interestingapp.local" "*.interestingapp.local"
    @docker-compose -f docker/traefik.dev.yml restart

# === Production Commands ===

# Start production environment
prod-up:
    @echo "🚀 Starting production environment..."
    @./scripts/setup-prod.sh

# Stop production environment
prod-down:
    @echo "🛑 Stopping production environment..."
    @docker-compose -f docker/docker-compose.prod.yml down
    @docker-compose -f docker/traefik.prod.yml down

# View production logs
prod-logs service="":
    #!/usr/bin/env bash
    if [ "{{service}}" = "" ]; then
        docker-compose -f docker/docker-compose.prod.yml logs -f
    else
        docker-compose -f docker/docker-compose.prod.yml logs -f {{service}}
    fi

# Deploy production (build and start)
prod-deploy:
    @echo "🚀 Deploying to production..."
    @docker-compose -f docker/docker-compose.prod.yml build
    @docker-compose -f docker/docker-compose.prod.yml up -d

# === Utility Commands ===

# Show system status
status:
    @echo "📊 System Status:"
    @echo "=================="
    @echo "🐳 Docker Containers:"
    @docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    @echo ""
    @echo "🌐 Docker Networks:"
    @docker network ls
    @echo ""
    @echo "💾 Docker Volumes:"
    @docker volume ls

# Clean up Docker resources
clean:
    @echo "🧹 Cleaning up Docker resources..."
    @docker system prune -f
    @docker volume prune -f

# Health check all services
health-check:
    @echo "🏥 Checking service health..."
    @./scripts/health-check.sh

# View application logs from container
app-logs:
    @docker-compose -f docker/docker-compose.dev.yml logs -f app

# Open services in browser
open-services:
    @echo "🌐 Opening development services..."
    @open https://api.interestingapp.local/api/docs
    @open https://traefik.interestingapp.local  
    @open https://mail.interestingapp.local
    @open https://db.interestingapp.local

# === Backup and Restore Commands ===

# Backup development database
backup-db:
    @echo "💾 Backing up development database..."
    @mkdir -p backups
    @docker exec postgres-dev pg_dump -U postgres nestjs_dev > backups/nestjs_dev_$(date +%Y%m%d_%H%M%S).sql
    @echo "✅ Database backed up to backups/ directory"

# List available backups
backup-list:
    @echo "📋 Available database backups:"
    @ls -la backups/*.sql 2>/dev/null || echo "No backups found"

# Restore database from backup
backup-restore file:
    @echo "📥 Restoring database from {{file}}..."
    @docker exec -i postgres-dev psql -U postgres -d nestjs_dev < {{file}}
    @echo "✅ Database restored"

# === Help and Information ===

# Show project information
info:
    @echo "📋 Project Information"
    @echo "======================"
    @echo "Project: NestJS Docker Backend"
    @echo "Structure: Monorepo (app/ + infrastructure/)"
    @echo ""
    @echo "🔗 Development URLs:"
    @echo "  API:       https://api.interestingapp.local"
    @echo "  Docs:      https://api.interestingapp.local/api/docs"
    @echo "  Traefik:   https://traefik.interestingapp.local"
    @echo "  MailHog:   https://mail.interestingapp.local"
    @echo "  Database:  https://db.interestingapp.local"
    @echo ""
    @echo "📁 Key Directories:"
    @echo "  app/           - NestJS application"
    @echo "  infrastructure/ - DevOps and deployment"
    @echo ""
    @echo "⚡ Quick Start:"
    @echo "  just dev-up    - Start development environment"
    @echo "  just app-test  - Run application tests"
    @echo "  just status    - Show system status"
```

**📁 File:** [`infrastructure/justfile`](../infrastructure/justfile)

### **2. Create SSL Setup Script**

```bash
#!/bin/bash
# infrastructure/scripts/setup-ssl.sh

set -e

echo "🔐 Setting up SSL certificates for development..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if mkcert is installed
if ! command -v mkcert &> /dev/null; then
    echo -e "${RED}❌ mkcert is not installed${NC}"
    echo ""
    echo "Please install mkcert:"
    echo ""
    echo "macOS:"
    echo "  brew install mkcert"
    echo ""
    echo "Linux:"
    echo "  curl -JLO 'https://dl.filippo.io/mkcert/latest?for=linux/amd64'"
    echo "  chmod +x mkcert-v*-linux-amd64"
    echo "  sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert"
    echo ""
    exit 1
fi

# Install local CA
echo -e "${YELLOW}📋 Installing local Certificate Authority...${NC}"
mkcert -install

# Create certificates directory
mkdir -p traefik/certs
cd traefik/certs

# Generate certificates
if [ ! -f "interestingapp.local+1.pem" ]; then
    echo -e "${YELLOW}🔐 Generating SSL certificates...${NC}"
    mkcert "interestingapp.local" "*.interestingapp.local"
    echo -e "${GREEN}✅ SSL certificates generated${NC}"
else
    echo -e "${GREEN}✅ SSL certificates already exist${NC}"
fi

cd ../..

# Check hosts file
if ! grep -q "interestingapp.local" /etc/hosts; then
    echo -e "${YELLOW}⚠️  Adding entries to hosts file...${NC}"
    echo ""
    echo "Please add these lines to your /etc/hosts file:"
    echo ""
    echo "127.0.0.1 api.interestingapp.local"
    echo "127.0.0.1 traefik.interestingapp.local"
    echo "127.0.0.1 mail.interestingapp.local"
    echo "127.0.0.1 db.interestingapp.local"
    echo "127.0.0.1 app.interestingapp.local"
    echo ""
    echo "Run this command:"
    echo "sudo vim /etc/hosts"
    echo ""
else
    echo -e "${GREEN}✅ Hosts file entries exist${NC}"
fi

echo -e "${GREEN}🎉 SSL setup complete!${NC}"
```

**📁 File:** [`infrastructure/scripts/setup-ssl.sh`](../infrastructure/scripts/setup-ssl.sh)

### **3. Create Production Setup Script**

```bash
#!/bin/bash
# infrastructure/scripts/setup-prod.sh

set -e

echo "🚀 Setting up production environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if production env file exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ .env.production file not found${NC}"
    echo ""
    echo "Please create .env.production from the template:"
    echo "  cp .env.production.example .env.production"
    echo "  vim .env.production  # Update with real values"
    echo ""
    exit 1
fi

# Check required environment variables
source .env.production

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}❌ DOMAIN is not set in .env.production${NC}"
    exit 1
fi

if [ -z "$ACME_EMAIL" ]; then
    echo -e "${RED}❌ ACME_EMAIL is not set in .env.production${NC}"
    exit 1
fi

# Create external network if it doesn't exist
if ! docker network inspect traefik-network &> /dev/null; then
    echo -e "${YELLOW}🌐 Creating Traefik network...${NC}"
    docker network create traefik-network
    echo -e "${GREEN}✅ Traefik network created${NC}"
else
    echo -e "${GREEN}✅ Traefik network already exists${NC}"
fi

# Build production images
echo -e "${YELLOW}🔨 Building production images...${NC}"
docker-compose -f docker/docker-compose.prod.yml build

# Start Traefik first
echo -e "${YELLOW}🔀 Starting Traefik reverse proxy...${NC}"
docker-compose -f docker/traefik.prod.yml up -d

# Wait for Traefik to be ready
sleep 10

# Start application services
echo -e "${YELLOW}🐳 Starting application services...${NC}"
docker-compose -f docker/docker-compose.prod.yml up -d

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 15

# Health check
echo -e "${YELLOW}🏥 Checking service health...${NC}"
if curl -s --max-time 10 "https://api.$DOMAIN/health" > /dev/null; then
    echo -e "${GREEN}✅ API is ready at https://api.$DOMAIN${NC}"
else
    echo -e "${RED}❌ API is not responding${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Production environment is ready!${NC}"
echo ""
echo "Available services:"
echo "  📱 API:       https://api.$DOMAIN"
echo "  📚 Docs:      https://api.$DOMAIN/api/docs"
echo "  🔀 Traefik:   https://traefik.$DOMAIN"
echo ""
```

**📁 File:** [`infrastructure/scripts/setup-prod.sh`](../infrastructure/scripts/setup-prod.sh)

### **4. Create Health Check Script**

```bash
#!/bin/bash
# infrastructure/scripts/health-check.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🏥 Checking service health...${NC}"
echo ""

check_service() {
    local url=$1
    local name=$2
    local timeout=${3:-10}
    
    printf "%-20s" "$name:"
    if curl -k -s --max-time "$timeout" "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Healthy${NC}"
    else
        echo -e "${RED}❌ Unhealthy${NC}"
    fi
}

# Check development services
echo "Development Services:"
echo "===================="
check_service "https://api.interestingapp.local/health" "API"
check_service "https://traefik.interestingapp.local" "Traefik"
check_service "https://mail.interestingapp.local" "MailHog"
check_service "https://db.interestingapp.local" "Adminer"

echo ""

# Check Docker containers
echo "Docker Containers:"
echo "=================="
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "(nestjs|postgres|mailhog|adminer|traefik)" || echo "No containers running"

echo ""

# Check Docker networks
echo "Docker Networks:"
echo "==============="
docker network ls | grep -E "(traefik|internal)" || echo "No custom networks found"

echo ""

# Check volumes
echo "Docker Volumes:"
echo "=============="
docker volume ls | grep -E "(postgres|traefik)" || echo "No custom volumes found"

echo ""
echo -e "${GREEN}Health check complete!${NC}"
```

**📁 File:** [`infrastructure/scripts/health-check.sh`](../infrastructure/scripts/health-check.sh)

### **5. Make Scripts Executable**

```bash
# From infrastructure directory
chmod +x scripts/setup-dev.sh
chmod +x scripts/teardown-dev.sh
chmod +x scripts/setup-ssl.sh
chmod +x scripts/setup-prod.sh
chmod +x scripts/health-check.sh
```

## 🔄 Git Commit

This step corresponds to commit: `e9f3b8a`

```bash
git add .
git commit -m "Add comprehensive automation with Just command runner

- Created complete justfile with dev/prod workflows
- Added idempotent setup scripts for SSL and production
- Implemented health check automation for all services
- Added database backup and restore commands
- Created utility commands for common operations
- Added comprehensive help and status commands"
```

## ⚡ Just Command Usage

### **Development Workflow:**
```bash
# From infrastructure directory
cd infrastructure

# Start development environment
just dev-up

# View all available commands
just

# Check system status
just status

# View application logs
just dev-logs app

# Run tests
just app-test

# Open all services in browser
just open-services
```

### **Production Operations:**
```bash
# Deploy to production
just prod-deploy

# View production logs  
just prod-logs

# Check health of all services
just health-check

# Backup database
just backup-db
```

### **Utility Commands:**
```bash
# Clean up Docker resources
just clean

# Show project information
just info

# Install SSL certificates
just ssl-install

# Connect to database
just db-connect
```

## 📝 Automation Benefits

### **Consistency:**
- **Standardized commands** across development and production
- **Idempotent scripts** that can be run multiple times safely
- **Error handling** with proper exit codes and messages
- **Color-coded output** for better user experience

### **Developer Experience:**
- **Simple commands** - `just dev-up` instead of complex Docker commands
- **Self-documenting** - `just` lists all available commands
- **Cross-platform** - works on macOS, Linux, and Windows
- **Fast feedback** - immediate status and health checks

### **Production Safety:**
- **Environment validation** before deployment
- **Health checks** after deployments
- **Rollback capabilities** with docker-compose down/up
- **Backup automation** before major changes

### **Team Collaboration:**
- **Documented workflows** in version control
- **Consistent environments** across team members
- **Easy onboarding** with single setup command
- **Troubleshooting utilities** built-in

## 🎯 What's Next

In the next tutorial, we'll:
1. Set up production deployment with proper environment configuration
2. Configure Let's Encrypt SSL certificates for production domains
3. Implement production security best practices and monitoring
4. Create deployment workflows and rollback procedures
5. Document production maintenance and scaling strategies

→ **Continue to:** [11-production-deployment.md](./11-production-deployment.md)