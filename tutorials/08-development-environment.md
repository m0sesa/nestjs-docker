# Phase 8: Development Environment with HTTPS

Set up a complete local HTTPS development environment using mkcert for SSL certificates and local DNS configuration.

## 🎯 Goals

- Install and configure mkcert for local SSL certificates
- Set up local DNS resolution for development domains
- Create a comprehensive development workflow with HTTPS
- Configure certificate installation and management
- Test the complete development environment with all services

## 📦 Tools Required

```bash
# Install mkcert (certificate authority for localhost)
# macOS
brew install mkcert

# Linux
curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-v*-linux-amd64
sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert

# Windows (using Chocolatey)
choco install mkcert
```

**Tool Purposes:**
- `mkcert` - Creates locally trusted SSL certificates for development
- No browser security warnings for local HTTPS
- Automatic certificate authority (CA) installation
- Wildcard certificate support for subdomains

## 🛠️ Step-by-Step Implementation

### **1. Install mkcert and Create Certificates**

```bash
# From infrastructure directory
cd infrastructure

# Install local CA in system trust store
mkcert -install

# Create wildcard certificate for development domain
mkdir -p traefik/certs
cd traefik/certs

# Generate wildcard certificate for all subdomains
mkcert "interestingapp.local" "*.interestingapp.local"

# This creates:
# interestingapp.local+1.pem (certificate)
# interestingapp.local+1-key.pem (private key)
```

### **2. Configure Local DNS Resolution**

**Option A: Hosts File (Simple)**
```bash
# Edit hosts file
sudo vim /etc/hosts

# Add these lines:
127.0.0.1 api.interestingapp.local
127.0.0.1 traefik.interestingapp.local  
127.0.0.1 mail.interestingapp.local
127.0.0.1 db.interestingapp.local
127.0.0.1 app.interestingapp.local
```

**Option B: dnsmasq (Advanced - Wildcard Support)**
```bash
# macOS - Install dnsmasq
brew install dnsmasq

# Create dnsmasq config
echo 'address=/interestingapp.local/127.0.0.1' | sudo tee /usr/local/etc/dnsmasq.conf

# Start dnsmasq
sudo brew services start dnsmasq

# Configure system to use dnsmasq
sudo mkdir -p /etc/resolver
echo 'nameserver 127.0.0.1' | sudo tee /etc/resolver/interestingapp.local
```

### **3. Update Traefik Configuration for Local Certificates**

```yaml
# infrastructure/traefik/traefik.yml (updated for development)
global:
  checkNewVersion: false
  sendAnonymousUsage: false

api:
  dashboard: true
  debug: true

entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entrypoint:
          to: websecure
          scheme: https
          permanent: true

  websecure:
    address: ":443"
    http:
      tls:
        options: default

certificatesResolvers:
  letsencrypt:
    acme:
      tlsChallenge: {}
      email: ${ACME_EMAIL:-admin@example.com}
      storage: /letsencrypt/acme.json

providers:
  file:
    directory: /config
    watch: true

  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: traefik-network

# TLS configuration with local certificates
tls:
  certificates:
    - certFile: /certs/interestingapp.local+1.pem
      keyFile: /certs/interestingapp.local+1-key.pem
  options:
    default:
      sslProtocols:
        - "TLSv1.2"
        - "TLSv1.3"

log:
  level: INFO
  format: common

accessLog:
  format: common
```

**📁 File:** [`infrastructure/traefik/traefik.yml`](../infrastructure/traefik/traefik.yml) (updated)

### **4. Update Development Routes for Local Certificates**

```yaml
# infrastructure/traefik/config/dev-routes.yml (updated)
http:
  routers:
    nestjs-api:
      rule: "Host(`api.interestingapp.local`)"
      entryPoints: [websecure]
      service: nestjs-api
      tls: {}  # Use default TLS configuration from traefik.yml

    traefik-dashboard:
      rule: "Host(`traefik.interestingapp.local`)"
      entryPoints: [websecure]
      service: api@internal
      tls: {}

    mailhog-web:
      rule: "Host(`mail.interestingapp.local`)"
      entryPoints: [websecure]
      service: mailhog-web
      tls: {}

    adminer-web:
      rule: "Host(`db.interestingapp.local`)"
      entryPoints: [websecure]
      service: adminer-web
      tls: {}

    # Optional: Frontend application
    frontend-app:
      rule: "Host(`app.interestingapp.local`)"
      entryPoints: [websecure]
      service: frontend-app
      tls: {}

  services:
    nestjs-api:
      loadBalancer:
        servers:
          - url: "http://nestjs-app-dev:3000"

    mailhog-web:
      loadBalancer:
        servers:
          - url: "http://mailhog-dev:8025"

    adminer-web:
      loadBalancer:
        servers:
          - url: "http://adminer-dev:8080"

    # Optional: Frontend service (for future use)
    frontend-app:
      loadBalancer:
        servers:
          - url: "http://frontend-dev:3000"

  middlewares:
    security-headers:
      headers:
        accessControlAllowMethods:
          - GET
          - OPTIONS  
          - PUT
          - POST
          - DELETE
        accessControlMaxAge: 100
        hostsProxyHeaders:
          - "X-Forwarded-Host"
        referrerPolicy: "same-origin"
        customHeaders:
          X-Forwarded-Proto: "https"
```

**📁 File:** [`infrastructure/traefik/config/dev-routes.yml`](../infrastructure/traefik/config/dev-routes.yml) (updated)

### **5. Create Development Setup Script**

```bash
#!/bin/bash
# infrastructure/scripts/setup-dev.sh

set -e

echo "🚀 Setting up development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if mkcert is installed
if ! command -v mkcert &> /dev/null; then
    echo -e "${RED}❌ mkcert is not installed${NC}"
    echo "Please install mkcert first:"
    echo "  macOS: brew install mkcert"
    echo "  Linux: Check tutorial for installation steps"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running${NC}"
    echo "Please start Docker first"
    exit 1
fi

# Install local CA if not already installed
echo -e "${YELLOW}📋 Installing local Certificate Authority...${NC}"
mkcert -install

# Create certificates directory
mkdir -p traefik/certs
cd traefik/certs

# Generate certificates if they don't exist
if [ ! -f "interestingapp.local+1.pem" ]; then
    echo -e "${YELLOW}🔐 Generating SSL certificates...${NC}"
    mkcert "interestingapp.local" "*.interestingapp.local"
    echo -e "${GREEN}✅ SSL certificates generated${NC}"
else
    echo -e "${GREEN}✅ SSL certificates already exist${NC}"
fi

cd ../..

# Create external network if it doesn't exist
if ! docker network inspect traefik-network &> /dev/null; then
    echo -e "${YELLOW}🌐 Creating Traefik network...${NC}"
    docker network create traefik-network
    echo -e "${GREEN}✅ Traefik network created${NC}"
else
    echo -e "${GREEN}✅ Traefik network already exists${NC}"
fi

# Start Traefik
echo -e "${YELLOW}🔀 Starting Traefik reverse proxy...${NC}"
docker-compose -f docker/traefik.dev.yml up -d

# Wait for Traefik to be ready
sleep 5

# Start all services
echo -e "${YELLOW}🐳 Starting all development services...${NC}"
docker-compose -f docker/docker-compose.dev.yml up -d

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 10

# Health checks
echo -e "${YELLOW}🏥 Checking service health...${NC}"

check_service() {
    local url=$1
    local name=$2
    if curl -k -s --max-time 10 "$url" > /dev/null; then
        echo -e "${GREEN}✅ $name is ready${NC}"
    else
        echo -e "${RED}❌ $name is not responding${NC}"
    fi
}

check_service "https://api.interestingapp.local/health" "NestJS API"
check_service "https://traefik.interestingapp.local" "Traefik Dashboard"
check_service "https://mail.interestingapp.local" "MailHog"
check_service "https://db.interestingapp.local" "Adminer"

echo ""
echo -e "${GREEN}🎉 Development environment is ready!${NC}"
echo ""
echo "Available services:"
echo "  📱 API:       https://api.interestingapp.local"
echo "  📚 Docs:      https://api.interestingapp.local/api/docs"
echo "  🔀 Traefik:   https://traefik.interestingapp.local"
echo "  📧 MailHog:   https://mail.interestingapp.local"
echo "  🗄️ Database:  https://db.interestingapp.local"
echo ""
echo "Next steps:"
echo "  1. Test the API: curl -k https://api.interestingapp.local/health"
echo "  2. Check Swagger docs in your browser"
echo "  3. Register a user and check MailHog for emails"
echo ""
```

**📁 File:** [`infrastructure/scripts/setup-dev.sh`](../infrastructure/scripts/setup-dev.sh)

```bash
# Make script executable
chmod +x infrastructure/scripts/setup-dev.sh
```

### **6. Create Development Teardown Script**

```bash
#!/bin/bash
# infrastructure/scripts/teardown-dev.sh

set -e

echo "🛑 Tearing down development environment..."

# Colors for output  
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Stop all services
echo -e "${YELLOW}🐳 Stopping all services...${NC}"
docker-compose -f docker/docker-compose.dev.yml down -v --remove-orphans

# Stop Traefik
echo -e "${YELLOW}🔀 Stopping Traefik...${NC}"
docker-compose -f docker/traefik.dev.yml down

# Optionally remove network
read -p "Remove Traefik network? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if docker network inspect traefik-network &> /dev/null; then
        docker network rm traefik-network
        echo -e "${GREEN}✅ Traefik network removed${NC}"
    fi
fi

# Clean up Docker resources
echo -e "${YELLOW}🧹 Cleaning up Docker resources...${NC}"
docker system prune -f

echo -e "${GREEN}✅ Development environment stopped${NC}"
```

**📁 File:** [`infrastructure/scripts/teardown-dev.sh`](../infrastructure/scripts/teardown-dev.sh)

```bash
# Make script executable  
chmod +x infrastructure/scripts/teardown-dev.sh
```

## 🔄 Git Commit

This step corresponds to commit: `c5d7a9f`

```bash
git add .
git commit -m "Add complete local HTTPS development environment

- Created mkcert SSL certificate generation workflow
- Added local DNS configuration options (hosts/dnsmasq)
- Updated Traefik config to use local certificates
- Created comprehensive setup and teardown scripts
- Added health checks for all development services
- Documented complete development environment workflow"
```

## 🌐 Complete Development Workflow

### **Initial Setup (One Time):**
```bash
# Install mkcert
brew install mkcert  # macOS

# Setup development environment
cd infrastructure
./scripts/setup-dev.sh

# Add hosts entries (if not using dnsmasq)
sudo vim /etc/hosts
# Add the domain entries as shown above
```

### **Daily Development Workflow:**
```bash
# Start development environment
cd infrastructure
just dev-up  # or ./scripts/setup-dev.sh

# Work on your application...

# Stop environment when done
just dev-down  # or ./scripts/teardown-dev.sh
```

### **Testing the Environment:**
```bash
# Test API health
curl -k https://api.interestingapp.local/health

# Test authentication
curl -k -X POST https://api.interestingapp.local/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "password123"}'

# Check email in MailHog
open https://mail.interestingapp.local

# View API documentation  
open https://api.interestingapp.local/api/docs

# Monitor with Traefik dashboard
open https://traefik.interestingapp.local
```

## 📝 Certificate Management

### **Certificate Information:**
```bash
# Check certificate validity
openssl x509 -in traefik/certs/interestingapp.local+1.pem -text -noout

# Verify certificate chain
openssl s_client -connect api.interestingapp.local:443 -servername api.interestingapp.local
```

### **Certificate Renewal:**
```bash
# Certificates created by mkcert are valid for 10 years
# But if you need to regenerate:
cd infrastructure/traefik/certs
rm interestingapp.local+1*
mkcert "interestingapp.local" "*.interestingapp.local"

# Restart Traefik to pick up new certificates
docker-compose -f docker/traefik.dev.yml restart
```

### **Team Sharing Certificates:**
For team environments, you can share the CA root certificate:

```bash
# Export CA for team sharing
mkcert -CAROOT

# Team members install the shared CA
mkcert -install
```

## 🔒 Security Benefits

### **Local HTTPS Development:**
- **Real HTTPS** in development matches production
- **No browser warnings** with trusted certificates  
- **Service Worker compatibility** (requires HTTPS)
- **Security feature testing** (HTTPS-only features)

### **Network Security:**
- **Encrypted traffic** between browser and services
- **TLS certificate validation** workflow testing
- **Security header testing** in realistic environment
- **CORS policy validation** with proper origins

## 🎯 What's Next

In the next tutorial, we'll:
1. Complete the monorepo refactoring separating app and infrastructure
2. Update all file paths and build contexts after reorganization  
3. Establish clear domain boundaries between application and DevOps
4. Create professional project structure for team collaboration
5. Update all automation scripts for the new structure

→ **Continue to:** [09-monorepo-structure.md](./09-monorepo-structure.md)