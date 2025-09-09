# Phase 9: Monorepo Structure & Separation of Concerns

Refactor the project into a professional monorepo with complete separation between application and infrastructure concerns.

## 🎯 Goals

- Create clean separation between app code and infrastructure
- Organize files by domain responsibility
- Eliminate confusion between application and DevOps concerns
- Establish professional monorepo patterns
- Enable independent evolution of app and infrastructure

## 🧠 The Problem

Initially, our project mixed concerns:
```
/ (MIXED CONCERNS - CONFUSING)
├── src/              # App code
├── package.json      # App dependencies  
├── docker-compose.yml # Infrastructure
├── traefik/          # Infrastructure
├── scripts/          # Infrastructure
├── node_modules/     # Could be confused with tooling
└── .env.development  # Where does this belong?
```

**Issues:**
- Developers see infrastructure when working on app code
- DevOps engineers see app files when managing infrastructure
- Unclear ownership and responsibility
- Mental overhead switching contexts

## 🏗️ The Solution: True Domain Separation

```
/ (CLEAN SEPARATION)
├── app/                    # 🎯 Pure Application Domain
│   ├── src/               # Only application code
│   ├── package.json       # Only app dependencies
│   ├── Dockerfile         # How to build the app
│   └── tsconfig.json      # App build configuration
│
└── infrastructure/         # 🛠️ Pure Infrastructure Domain  
    ├── .env.development   # Environment configuration
    ├── .env.production    # Production configuration
    ├── README.md          # Infrastructure documentation
    ├── justfile           # All operational commands
    ├── docker/            # Container orchestration
    │   ├── docker-compose.dev.yml
    │   └── docker-compose.prod.yml
    ├── traefik/           # Reverse proxy configuration
    └── scripts/           # Deployment automation
```

## 🛠️ Step-by-Step Refactoring

### **1. Create Directory Structure**

```bash
# Create new directories
mkdir -p app infrastructure/docker infrastructure/scripts

# Move application files to app/
mv src app/
mv package*.json app/
mv tsconfig*.json app/
mv nest-cli.json app/
mv eslint.config.mjs app/
mv .prettierrc app/
mv test app/
mv Dockerfile app/
mv .dockerignore app/
```

### **2. Move Infrastructure Files**

```bash
# Move infrastructure files
mv docker-compose*.yml infrastructure/docker/
mv traefik infrastructure/
mv init-db.sql infrastructure/
mv scripts/* infrastructure/scripts/
mv justfile infrastructure/
mv .env* infrastructure/
mv README.md infrastructure/
```

### **3. Update Docker Build Contexts**

The challenge: Docker needs to build the app, but docker-compose is now in `infrastructure/docker/`.

**Solution: Update build contexts in compose files:**

```yaml
# infrastructure/docker/docker-compose.dev.yml
services:
  app:
    build:
      context: ../../app    # Point to app directory
      target: development
    volumes:
      - ../../app:/app      # Mount app directory
      - /app/node_modules
    env_file:
      - ../.env.development # Point to infrastructure env file
```

**📁 Files Updated:**
- [`infrastructure/docker/docker-compose.dev.yml`](../infrastructure/docker/docker-compose.dev.yml)
- [`infrastructure/docker/docker-compose.prod.yml`](../infrastructure/docker/docker-compose.prod.yml)

### **4. Update Volume Mounts and Paths**

```yaml
# infrastructure/docker/docker-compose.dev.yml  
services:
  postgres:
    volumes:
      - ../init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
      
  traefik:
    volumes:
      - ../traefik/traefik.yml:/etc/traefik/traefik.yml:ro
      - ../traefik/config:/config:ro
      - ../traefik/certs:/certs:ro
```

### **5. Update Just Commands**

```bash
# infrastructure/justfile
dev-up:
    @echo "🚀 Starting development environment..."
    @./scripts/setup-dev.sh

dev-down:
    @echo "🛑 Stopping development environment..."
    @docker-compose -f docker/docker-compose.dev.yml down -v --remove-orphans

# Application commands (running in app directory)
app-install:
    @echo "📦 Installing application dependencies..."
    @cd ../app && npm install

app-dev:
    @echo "🚀 Starting application in development mode..."
    @cd ../app && npm run start:dev
```

**📁 File:** [`infrastructure/justfile`](../infrastructure/justfile)

### **6. Create Root Coordination**

Create a minimal root README that explains the structure:

```markdown
# NestJS Docker Backend - Monorepo

## Quick Start
```bash
cd infrastructure  
just dev-up
```

## Structure
- `app/` - NestJS Application (Pure Code)
- `infrastructure/` - DevOps & Infrastructure (Complete)

## Documentation
See `infrastructure/README.md` for complete setup instructions.
```

**📁 File:** [`README.md`](../README.md)

### **7. Environment File Organization**

Move all environment configuration to infrastructure:

```bash
# infrastructure/
├── .env.development        # Development configuration
├── .env.production.example # Production template  
└── .env.example           # General template
```

**Reasoning:** Environment configuration is an **infrastructure concern** - it's about deployment, not application code.

## 🔄 Git Commit

This step corresponds to commit: `867b32d` and `fcaf4b6`

```bash
git add .
git commit -m "Refactor: Separate app and infrastructure concerns

Major reorganization for improved project clarity:

📁 New Structure:
- app/ - NestJS application code, dependencies, and Docker build  
- infrastructure/ - DevOps, Docker Compose, Traefik, deployment scripts

🎯 Benefits:
- Clear separation of concerns between application and infrastructure
- Easier navigation and mental model for developers
- Better focus when working on specific aspects  
- Scalable structure for future microservices
- Industry-standard project organization"
```

## ✨ Benefits Achieved

### **For Application Developers:**
- **Focus** - Only see application code when working in `app/`
- **Clarity** - No confusion with infrastructure files
- **Autonomy** - Can work independently of infrastructure changes
- **Familiar structure** - Standard NestJS project layout

### **For DevOps/Infrastructure Engineers:**  
- **Complete ownership** - All deployment concerns in `infrastructure/`
- **Self-contained** - Everything needed for deployment
- **Professional structure** - Industry-standard organization
- **Independent evolution** - Can change infrastructure without touching app

### **For Teams:**
- **Clear boundaries** - No overlap between domains  
- **Easy onboarding** - Structure is self-explanatory
- **Scalable** - Easy to add more services or extract to separate repos
- **Maintainable** - Changes stay within appropriate domains

## 🎭 Usage Patterns

### **Application Development:**
```bash
# Work purely on application code
cd app/
npm install
npm run start:dev
npm test

# No infrastructure files visible!
```

### **Infrastructure Operations:**
```bash
# Work purely on deployment and infrastructure  
cd infrastructure/
just dev-up
just prod-deploy
just ssl-certs

# No application code to distract!
```

### **Full Development Workflow:**
```bash
# From project root
cd infrastructure
just dev-up      # Start full environment
just app-dev     # Or run app without Docker
```

## 🎯 What's Next

In the next tutorial, we'll:
1. Install Just command runner system-wide
2. Create comprehensive automation commands
3. Set up idempotent setup scripts
4. Implement development and production workflows
5. Add utility commands for common operations

→ **Continue to:** [10-automation-tools.md](./10-automation-tools.md)