# Phase 7: Traefik Reverse Proxy Setup

Configure Traefik as a reverse proxy with SSL/TLS termination, automatic certificate management, and clean routing using the file provider approach.

## 🎯 Goals

- Install and configure Traefik reverse proxy
- Set up SSL certificates with Let's Encrypt for production
- Configure file provider for clean route management  
- Implement HTTP to HTTPS redirects and security headers
- Create production-ready proxy configuration with external networks

## 📦 Traefik Configuration Files

```yaml
# Main Traefik configuration files
infrastructure/traefik/
├── traefik.yml          # Main Traefik configuration
├── config/
│   ├── dev-routes.yml   # Development routes  
│   └── prod-routes.yml  # Production routes
└── certs/               # Development SSL certificates
```

**File Purposes:**
- `traefik.yml` - Core Traefik configuration and providers
- `dev-routes.yml` - Development routing rules and services
- `prod-routes.yml` - Production routing with Let's Encrypt
- `certs/` - Local development SSL certificates

## 🛠️ Step-by-Step Implementation

### **1. Create Traefik Main Configuration**

```yaml
# infrastructure/traefik/traefik.yml
# Main Traefik configuration file
global:
  checkNewVersion: false
  sendAnonymousUsage: false

# API and Dashboard configuration
api:
  dashboard: true
  debug: true

# Entry points definition
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

# Certificate resolvers for Let's Encrypt
certificatesResolvers:
  letsencrypt:
    acme:
      tlsChallenge: {}
      email: ${ACME_EMAIL}
      storage: /letsencrypt/acme.json
      # caServer: https://acme-staging-v02.api.letsencrypt.org/directory # Staging for testing

# Providers configuration
providers:
  # File provider for clean route management
  file:
    directory: /config
    watch: true

  # Docker provider for production auto-discovery
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: traefik-network

# TLS configuration
tls:
  options:
    default:
      sslProtocols:
        - "TLSv1.2"
        - "TLSv1.3"
      cipherSuites:
        - "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384"
        - "TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305"
        - "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256"

# Logging configuration
log:
  level: INFO
  format: common

accessLog:
  format: common
```

**📁 File:** [`infrastructure/traefik/traefik.yml`](../infrastructure/traefik/traefik.yml)

### **2. Create Development Routes Configuration**

```yaml
# infrastructure/traefik/config/dev-routes.yml
# Development routing configuration with local certificates
http:
  routers:
    # NestJS API Router
    nestjs-api:
      rule: "Host(`api.interestingapp.local`)"
      entryPoints: [websecure]
      service: nestjs-api
      tls:
        domains:
          - main: "interestingapp.local"
            sans: ["*.interestingapp.local"]

    # Traefik Dashboard Router
    traefik-dashboard:
      rule: "Host(`traefik.interestingapp.local`)"
      entryPoints: [websecure]
      service: api@internal
      tls:
        domains:
          - main: "interestingapp.local"
            sans: ["*.interestingapp.local"]

    # MailHog Router
    mailhog-web:
      rule: "Host(`mail.interestingapp.local`)"
      entryPoints: [websecure]
      service: mailhog-web
      tls:
        domains:
          - main: "interestingapp.local"
            sans: ["*.interestingapp.local"]

    # Adminer Router
    adminer-web:
      rule: "Host(`db.interestingapp.local`)"
      entryPoints: [websecure]
      service: adminer-web
      tls:
        domains:
          - main: "interestingapp.local"
            sans: ["*.interestingapp.local"]

  services:
    # NestJS API Service
    nestjs-api:
      loadBalancer:
        servers:
          - url: "http://nestjs-app-dev:3000"

    # MailHog Service  
    mailhog-web:
      loadBalancer:
        servers:
          - url: "http://mailhog-dev:8025"

    # Adminer Service
    adminer-web:
      loadBalancer:
        servers:
          - url: "http://adminer-dev:8080"

  middlewares:
    # Security headers middleware
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

**📁 File:** [`infrastructure/traefik/config/dev-routes.yml`](../infrastructure/traefik/config/dev-routes.yml)

### **3. Create Production Routes Configuration**

```yaml
# infrastructure/traefik/config/prod-routes.yml
# Production routing configuration with Let's Encrypt
http:
  routers:
    # NestJS API Router with Let's Encrypt
    nestjs-api:
      rule: "Host(`api.${DOMAIN}`)"
      entryPoints: [websecure]
      service: nestjs-api
      tls:
        certResolver: letsencrypt
      middlewares:
        - security-headers
        - rate-limit

    # Traefik Dashboard Router (protected)
    traefik-dashboard:
      rule: "Host(`traefik.${DOMAIN}`)"
      entryPoints: [websecure]
      service: api@internal
      tls:
        certResolver: letsencrypt
      middlewares:
        - traefik-auth
        - security-headers

  services:
    # NestJS API Service (Docker auto-discovery)
    nestjs-api:
      loadBalancer:
        servers:
          - url: "http://nestjs-app-prod:3000"

  middlewares:
    # Security headers for production
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
        stsSeconds: 31536000
        stsIncludeSubdomains: true
        stsPreload: true
        forceSTSHeader: true
        frameDeny: true
        contentTypeNosniff: true
        browserXssFilter: true
        customHeaders:
          X-Forwarded-Proto: "https"

    # Rate limiting middleware  
    rate-limit:
      rateLimit:
        average: 100
        burst: 50

    # Basic auth for Traefik dashboard
    traefik-auth:
      basicAuth:
        users:
          - "${TRAEFIK_AUTH}"
```

**📁 File:** [`infrastructure/traefik/config/prod-routes.yml`](../infrastructure/traefik/config/prod-routes.yml)

### **4. Create Development Traefik Docker Compose**

```yaml
# infrastructure/docker/traefik.dev.yml
version: '3.8'

services:
  traefik:
    image: traefik:v3.0
    container_name: traefik-dev
    restart: unless-stopped
    ports:
      - "80:80"    # HTTP
      - "443:443"  # HTTPS
      - "8090:8080" # Dashboard (direct access)
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ../traefik/traefik.yml:/etc/traefik/traefik.yml:ro
      - ../traefik/config:/config:ro
      - ../traefik/certs:/certs:ro
    networks:
      - traefik-network
    environment:
      - ACME_EMAIL=dev@interestingapp.local
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=traefik-network"

networks:
  traefik-network:
    name: traefik-network
    driver: bridge
```

**📁 File:** [`infrastructure/docker/traefik.dev.yml`](../infrastructure/docker/traefik.dev.yml)

### **5. Create Production Traefik Docker Compose**

```yaml
# infrastructure/docker/traefik.prod.yml
version: '3.8'

services:
  traefik:
    image: traefik:v3.0
    container_name: traefik-prod
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ../traefik/traefik.yml:/etc/traefik/traefik.yml:ro
      - ../traefik/config:/config:ro
      - traefik_letsencrypt:/letsencrypt
    networks:
      - traefik-network
    environment:
      - ACME_EMAIL=${ACME_EMAIL}
      - DOMAIN=${DOMAIN}
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=traefik-network"

volumes:
  traefik_letsencrypt:
    driver: local

networks:
  traefik-network:
    external: true
```

**📁 File:** [`infrastructure/docker/traefik.prod.yml`](../infrastructure/docker/traefik.prod.yml)

### **6. Update Development Docker Compose with Traefik**

```yaml
# infrastructure/docker/docker-compose.dev.yml (updated)
version: '3.8'

services:
  app:
    build:
      context: ../../app
      target: development
    container_name: nestjs-app-dev
    restart: unless-stopped
    env_file:
      - ../.env.development
    volumes:
      - ../../app:/app
      - /app/node_modules
    depends_on:
      - postgres
      - mailhog
    networks:
      - traefik-network
      - internal-network
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=traefik-network"
      - "traefik.http.routers.nestjs-api.rule=Host(`api.interestingapp.local`)"
      - "traefik.http.routers.nestjs-api.entrypoints=websecure"
      - "traefik.http.routers.nestjs-api.tls=true"
      - "traefik.http.services.nestjs-api.loadbalancer.server.port=3000"

  postgres:
    image: postgres:15-alpine
    container_name: postgres-dev
    restart: unless-stopped
    env_file:
      - ../.env.development
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ../init-db.sql:/docker-entrypoint-initdb.d/init-db.sql:ro
    networks:
      - internal-network

  mailhog:
    image: mailhog/mailhog:v1.0.1
    container_name: mailhog-dev
    restart: unless-stopped
    networks:
      - traefik-network
      - internal-network
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=traefik-network"
      - "traefik.http.routers.mailhog.rule=Host(`mail.interestingapp.local`)"
      - "traefik.http.routers.mailhog.entrypoints=websecure"
      - "traefik.http.routers.mailhog.tls=true"
      - "traefik.http.services.mailhog.loadbalancer.server.port=8025"

  adminer:
    image: adminer:4.8.1
    container_name: adminer-dev
    restart: unless-stopped
    env_file:
      - ../.env.development
    depends_on:
      - postgres
    networks:
      - traefik-network
      - internal-network
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=traefik-network"
      - "traefik.http.routers.adminer.rule=Host(`db.interestingapp.local`)"
      - "traefik.http.routers.adminer.entrypoints=websecure"
      - "traefik.http.routers.adminer.tls=true"
      - "traefik.http.services.adminer.loadbalancer.server.port=8080"

volumes:
  postgres_data:
    driver: local

networks:
  traefik-network:
    external: true
  internal-network:
    driver: bridge
```

**📁 File:** [`infrastructure/docker/docker-compose.dev.yml`](../infrastructure/docker/docker-compose.dev.yml) (updated)

## 🔄 Git Commit

This step corresponds to commit: `f1a8e2b`

```bash
git add .
git commit -m "Add comprehensive Traefik reverse proxy setup

- Created main Traefik configuration with file and Docker providers
- Implemented development routes with local SSL certificates
- Added production routes with Let's Encrypt auto-certificates
- Configured security headers and rate limiting middlewares
- Set up external network architecture for production
- Added HTTP to HTTPS redirects and TLS security
- Created separate Traefik compose files for dev/prod environments"
```

## 🌐 Traefik Architecture Benefits

### **File Provider Approach (Clean Routing):**
- **Separation of concerns** - Routes separate from main config
- **Easy maintenance** - Update routes without restarting Traefik
- **Environment-specific** - Different routes for dev/prod  
- **Version control** - Route changes tracked in git

### **Network Architecture:**
- **External traefik-network** - Shared across all services
- **Internal networks** - Database and internal communication
- **Security isolation** - Database not exposed to proxy network
- **Scalability** - Easy to add more services

### **SSL/TLS Configuration:**
- **Development** - Local certificates (mkcert) 
- **Production** - Let's Encrypt automatic certificates
- **Security headers** - HSTS, CSP, XSS protection
- **HTTP redirects** - Automatic HTTPS enforcement

### **Dashboard and Monitoring:**
- **Development** - Open dashboard for debugging
- **Production** - Password-protected dashboard
- **Access logs** - Request monitoring and analysis
- **Health checks** - Service availability monitoring

## 🧪 Testing Traefik Setup

### **Start Development Environment:**
```bash
# From infrastructure directory
cd infrastructure

# Create external network
docker network create traefik-network

# Start Traefik
docker-compose -f docker/traefik.dev.yml up -d

# Start all services
docker-compose -f docker/docker-compose.dev.yml up -d

# Check Traefik dashboard
open http://localhost:8090
```

### **Test HTTPS Routes:**
```bash
# Test API endpoint
curl -k https://api.interestingapp.local/health

# Test Traefik dashboard
open https://traefik.interestingapp.local

# Test MailHog interface
open https://mail.interestingapp.local

# Test database interface
open https://db.interestingapp.local
```

### **Verify SSL Certificates:**
```bash
# Check certificate details
openssl s_client -connect api.interestingapp.local:443 -servername api.interestingapp.local

# Test HTTP to HTTPS redirect
curl -I http://api.interestingapp.local
# Should return 301 redirect to https://
```

## 📝 Traefik Management Commands

### **Development Operations:**
```bash
# View Traefik logs
docker-compose -f docker/traefik.dev.yml logs -f

# Restart Traefik (picks up config changes)
docker-compose -f docker/traefik.dev.yml restart

# Check network connections
docker network inspect traefik-network
```

### **Production Operations:**
```bash
# Start production Traefik
docker-compose -f docker/traefik.prod.yml up -d

# Check Let's Encrypt certificates
docker exec traefik-prod ls -la /letsencrypt

# Monitor certificate renewal
docker-compose -f docker/traefik.prod.yml logs | grep acme
```

### **Debugging Routes:**
```bash
# Check active routes
curl http://localhost:8090/api/http/routers

# Check services
curl http://localhost:8090/api/http/services

# Check middleware
curl http://localhost:8090/api/http/middlewares
```

## 🎯 What's Next

In the next tutorial, we'll:
1. Set up mkcert for local HTTPS development certificates
2. Configure local DNS resolution for development domains
3. Create a comprehensive development workflow with HTTPS
4. Test the complete development environment
5. Document the local HTTPS setup process

→ **Continue to:** [08-development-environment.md](./08-development-environment.md)