# Phase 12: Environment Management Best Practices

Master environment configuration management for development, staging, and production environments.

## 🎯 Goals

- Understand environment configuration ownership (infrastructure vs app)
- Implement consistent env file patterns across all services  
- Learn Docker Compose environment variable strategies
- Address security considerations for different environments
- Establish team workflows for environment management

## 🧠 Environment Configuration Philosophy

### **Key Question: Where Do Environment Files Belong?**

**❌ Common Anti-Pattern:**
```
app/
├── .env.development     # App owns environment?
├── .env.production      # Mixing concerns
└── src/
```

**✅ Correct Pattern:**
```
infrastructure/
├── .env.development     # Infrastructure owns deployment config  
├── .env.production      # Environment is infrastructure concern
└── docker/
```

**Reasoning:** Environment configuration is about **deployment and infrastructure**, not application code.

## 📁 Environment File Organization

### **Current Structure:**
```
infrastructure/
├── .env.development        # Development environment
├── .env.production.example # Production template
├── .env.example           # General template  
└── docker/
    ├── docker-compose.dev.yml
    └── docker-compose.prod.yml
```

### **Environment File Contents:**

**📁 [`infrastructure/.env.development`](../infrastructure/.env.development):**
```bash
# Development Environment Configuration
NODE_ENV=development
PORT=3000

# Database Configuration (App Connection)
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres  # OK for development
DB_DATABASE=nestjs_dev

# PostgreSQL Container Configuration  
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=nestjs_dev

# JWT Configuration (Development Only)
JWT_SECRET=dev-jwt-secret-key-change-in-production

# Mail Configuration (MailHog)
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

**📁 [`infrastructure/.env.production.example`](../infrastructure/.env.production.example):**
```bash
# Production Environment Configuration
NODE_ENV=production
PORT=3000

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=CHANGE_THIS_SECURE_PASSWORD
DB_DATABASE=nestjs_prod

# JWT Configuration
JWT_SECRET=CHANGE_THIS_SUPER_SECURE_JWT_SECRET_KEY

# Mail Configuration (Production SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-production-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM_NAME=Your App Name
MAIL_FROM_ADDRESS=noreply@yourdomain.com

# Frontend URL
FRONTEND_URL=https://app.yourdomain.com

# Traefik & SSL Configuration
DOMAIN=yourdomain.com
ACME_EMAIL=admin@yourdomain.com
TRAEFIK_AUTH=admin:$2y$10$generate-this-hash-with-htpasswd
```

## 🐳 Docker Compose Environment Strategies

### **Strategy 1: env_file (Current - Recommended)**

```yaml
# infrastructure/docker/docker-compose.dev.yml
services:
  app:
    env_file:
      - ../.env.development  # ALL variables loaded

  postgres:
    env_file:
      - ../.env.development  # Same file, all variables

  adminer:
    env_file:
      - ../.env.development  # Same pattern
```

**✅ Pros:**
- Simple to manage - one file per environment
- Industry standard approach (like Kubernetes ConfigMaps)
- Easy to debug - all config in one place
- Consistent across all services

**❌ Cons:**
- All services get all variables (but this is normal)
- Sensitive variables visible in all containers

### **Strategy 2: Service-Specific Variables (Alternative)**

```yaml
services:
  app:
    environment:
      - NODE_ENV=${NODE_ENV}
      - DB_HOST=${DB_HOST}
      - JWT_SECRET=${JWT_SECRET}
      # Only what app needs

  postgres:
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
      # Only what postgres needs
```

**✅ Pros:**
- More precise - only necessary variables per service
- Explicit about what each service uses

**❌ Cons:**  
- More maintenance - must update compose files for new variables
- More complex - multiple places to check
- Not industry standard

### **Strategy 3: Multiple Environment Files (Complex)**

```bash
infrastructure/
├── .env.shared              # Common variables
├── .env.development.app     # App-specific dev variables  
├── .env.development.db      # Database-specific dev variables
```

```yaml
services:
  app:
    env_file:
      - ../.env.shared
      - ../.env.development.app

  postgres:
    env_file:
      - ../.env.shared  
      - ../.env.development.db
```

**Use Case:** Very large applications with many services requiring different configurations.

## 🔒 Security Considerations by Environment

### **Development Environment:**
```bash
# OK for development
DB_PASSWORD=postgres
JWT_SECRET=dev-jwt-secret-key
MAIL_PASSWORD=test
```

**Acceptable because:**
- ✅ Local development only
- ✅ No real user data
- ✅ Not accessible from internet
- ✅ Focus on developer productivity

### **Production Environment:**
```bash
# Must be secure
DB_PASSWORD=xK9$mN2@vR8!qW5#
JWT_SECRET=prod-super-secure-256-bit-key-here
MAIL_PASSWORD=app-specific-password
```

**Requirements:**
- ✅ Strong, unique passwords
- ✅ Generated JWT secrets (256-bit+)
- ✅ App-specific passwords for services
- ✅ Never commit to version control

### **Environment File Security:**

```bash
# .gitignore (already configured)
# Protect actual production files
.env.production
.env.local
.env.*.local

# OK to commit
.env.example
.env.*.example
.env.development  # Local development only
```

## 👥 Team Workflow Patterns

### **For Development Teams:**

```bash
# New developer onboarding
cd infrastructure
cp .env.example .env.development  # If not committed
just dev-up

# All developers use same development environment
# No individual .env.local files needed
```

### **For DevOps/Platform Teams:**

```bash
# Production deployment
cd infrastructure  
cp .env.production.example .env.production
# Edit .env.production with real values
# Deploy with CI/CD or manual commands
```

### **For CI/CD Systems:**

```bash
# CI/CD pipeline pattern
# Environment variables injected from secrets management
docker-compose -f docker/docker-compose.prod.yml up -d
# Variables come from CI/CD environment, not files
```

## 🔍 Debugging Environment Issues

### **View Container Environment:**
```bash
# See all environment variables in running container
docker exec nestjs-app-dev printenv

# Check specific variable
docker exec nestjs-app-dev printenv JWT_SECRET

# Debug compose file environment loading  
docker-compose -f docker/docker-compose.dev.yml config
```

### **Common Issues:**

**Issue 1: Variables not loaded**
```bash
# Check if env file exists and is readable
ls -la .env.development
cat .env.development

# Check Docker Compose syntax
docker-compose -f docker/docker-compose.dev.yml config
```

**Issue 2: Wrong values**
```bash  
# Verify environment precedence:
# 1. docker-compose environment: section (highest)
# 2. env_file:
# 3. Shell environment  
# 4. .env file in compose directory (lowest)
```

## 📝 Best Practices Summary

### **✅ Do:**
- Keep environment files in `infrastructure/` directory
- Use `env_file:` in Docker Compose (industry standard)
- Commit development env files for team consistency
- Use `.example` files as templates
- Generate strong secrets for production
- Document environment variables in README

### **❌ Don't:**
- Put environment files in application code directory
- Commit production environment files with real secrets
- Use the same secrets across environments
- Hardcode environment variables in Docker Compose
- Share production secrets in team chat/email

### **🔒 Security:**
- Development: Optimize for developer productivity
- Production: Optimize for security and never commit real secrets
- Use secrets management systems (AWS Secrets Manager, etc.) in production
- Rotate secrets regularly
- Use different database users with minimal permissions per environment

## 🎯 What's Next

In the next tutorial, we'll:
1. Review comprehensive security best practices
2. Implement security headers and HTTPS redirects  
3. Configure production-ready logging and monitoring
4. Set up health checks and graceful shutdowns
5. Review container security and user permissions

→ **Continue to:** [13-security-best-practices.md](./13-security-best-practices.md)