# NestJS Docker Backend

A production-ready NestJS application with JWT authentication, PostgreSQL, MailHog, Swagger, and Traefik reverse proxy.

## Features

- ✅ **NestJS** with TypeScript
- ✅ **JWT Authentication** with bcrypt password hashing
- ✅ **PostgreSQL** database with TypeORM and UUID primary keys
- ✅ **Email Service** with MailHog for development
- ✅ **Swagger API Documentation** with JWT Bearer auth
- ✅ **Traefik Reverse Proxy** with SSL/TLS
- ✅ **Docker** multi-stage builds for development and production
- ✅ **Professional development setup** with local HTTPS domains

## Quick Start

### Prerequisites

- Docker & Docker Compose
- [Just](https://github.com/casey/just) command runner
- [mkcert](https://github.com/FiloSottile/mkcert) for development SSL certificates

```bash
# Install Just (macOS)
brew install just

# Install Just (Ubuntu)
curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to /usr/local/bin

# Install mkcert (macOS) 
brew install mkcert

# Install mkcert (Ubuntu)
apt install mkcert
```

### Development Setup

1. **Start development environment:**
   ```bash
   just dev-up
   ```

2. **Add hosts entries** (when prompted):
   ```bash
   # Add to /etc/hosts
   127.0.0.1 api.interestingapp.local
   127.0.0.1 mail.interestingapp.local
   127.0.0.1 pgadmin.interestingapp.local
   127.0.0.1 traefik.interestingapp.local
   ```

3. **Access services:**
   - 🚀 **API**: https://api.interestingapp.local
   - 📧 **MailHog**: https://mail.interestingapp.local
   - 🗄️ **Database Admin**: https://pgadmin.interestingapp.local
   - 📊 **Traefik Dashboard**: https://traefik.interestingapp.local (admin/admin)
   - 📖 **Swagger**: https://api.interestingapp.local/api

### Production Setup

1. **Create environment file:**
   ```bash
   cp .env.production.example .env.production
   # Edit .env.production with your values
   ```

2. **Generate Traefik auth:**
   ```bash
   htpasswd -nb admin your-password
   # Add result to TRAEFIK_AUTH in .env.production
   ```

3. **Start production environment:**
   ```bash
   source .env.production
   just prod-up
   ```

## Available Commands

```bash
# Development
just dev-up        # Start development environment
just dev-down      # Stop development environment  
just dev-logs      # Follow development logs
just dev-restart   # Restart development environment

# Production
just prod-up              # Start production (Traefik + App)
just prod-down            # Stop production environment
just prod-app-only        # Start only app (Traefik running separately)
just prod-traefik-only    # Start only Traefik
just prod-logs            # Follow production logs

# Utilities
just build         # Build production images
just clean         # Clean up Docker resources
just ssl-certs     # Generate development SSL certificates
just help          # Show all commands
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile (requires JWT)

### Documentation
- `GET /api` - Swagger UI
- `GET /api-json` - OpenAPI JSON spec

## Environment Variables

### Development (.env.development)
```bash
NODE_ENV=development
DB_HOST=postgres
DB_PASSWORD=postgres
JWT_SECRET=dev-jwt-secret-key
MAIL_HOST=mailhog
FRONTEND_URL=https://app.interestingapp.local
```

### Production (.env.production)
```bash
NODE_ENV=production
DB_PASSWORD=your-secure-password
JWT_SECRET=your-super-secure-jwt-key
MAIL_HOST=smtp.gmail.com
MAIL_USER=your-email@gmail.com
DOMAIN=yourdomain.com
ACME_EMAIL=admin@yourdomain.com
TRAEFIK_AUTH=admin:$2y$10$...
```

## Architecture

### Development Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Development Setup                        │
├─────────────────────────────────────────────────────────────┤
│  Traefik (Internal Network)                                │
│  ├── api.interestingapp.local → NestJS App                 │
│  ├── mail.interestingapp.local → MailHog UI                │
│  ├── pgadmin.interestingapp.local → Adminer                │
│  └── traefik.interestingapp.local → Traefik Dashboard      │
│                                                             │
│  Services:                                                  │
│  ├── NestJS App (TypeScript hot reload)                    │
│  ├── PostgreSQL with UUID extension                        │
│  ├── MailHog (Email testing)                               │
│  └── Adminer (Database management)                         │
└─────────────────────────────────────────────────────────────┘
```

### Production Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Production Setup                         │
├─────────────────────────────────────────────────────────────┤
│  Traefik (External Network)                                │
│  ├── api.yourdomain.com → NestJS App                       │
│  └── traefik.yourdomain.com → Dashboard (Basic Auth)       │
│                                                             │
│  Services:                                                  │
│  ├── NestJS App (Optimized production build)               │
│  ├── PostgreSQL (Persistent volumes)                       │
│  └── Let's Encrypt SSL (Automatic certificates)            │
└─────────────────────────────────────────────────────────────┘
```

## Security Features

- JWT tokens with configurable expiration
- Bcrypt password hashing (10 rounds)
- Input validation with class-validator
- Environment-based configuration
- Production security headers
- SSL/TLS encryption in both dev and prod
- Basic auth protection for Traefik dashboard

## Generated by Claude Code

This project structure and configuration were generated using [Claude Code](https://claude.ai/code), Anthropic's official CLI for Claude.
