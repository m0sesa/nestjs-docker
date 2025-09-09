# NestJS Docker Backend - Main Commands
# All infrastructure commands are delegated to infrastructure/justfile

# Development commands
dev-up:
    @cd infrastructure && just dev-up

dev-down:
    @cd infrastructure && just dev-down

dev-logs:
    @cd infrastructure && just dev-logs

dev-restart:
    @cd infrastructure && just dev-restart

# Production commands
prod-up:
    @cd infrastructure && just prod-up

prod-down:
    @cd infrastructure && just prod-down

prod-logs:
    @cd infrastructure && just prod-logs

prod-app-only:
    @cd infrastructure && just prod-app-only

prod-traefik-only:
    @cd infrastructure && just prod-traefik-only

# Utility commands
clean:
    @cd infrastructure && just clean

build:
    @cd infrastructure && just build

ssl-certs:
    @cd infrastructure && just ssl-certs

# Application commands
app-install:
    @echo "📦 Installing application dependencies..."
    @cd app && npm install

app-dev:
    @echo "🚀 Starting application in development mode..."
    @cd app && npm run start:dev

app-build:
    @echo "🔨 Building application..."
    @cd app && npm run build

app-test:
    @echo "🧪 Running application tests..."
    @cd app && npm test

app-test-e2e:
    @echo "🧪 Running end-to-end tests..."
    @cd app && npm run test:e2e

# Help command
help:
    @echo "🚀 NestJS Docker Backend Commands"
    @echo ""
    @echo "📋 Development:"
    @echo "  dev-up        - Start development environment with HTTPS"
    @echo "  dev-down      - Stop development environment"
    @echo "  dev-logs      - Follow development logs"
    @echo "  dev-restart   - Restart development environment"
    @echo ""
    @echo "🚀 Production:"
    @echo "  prod-up               - Start production environment (Traefik + App)"
    @echo "  prod-down             - Stop production environment"
    @echo "  prod-logs             - Follow production logs"
    @echo "  prod-app-only         - Start only the app (Traefik running separately)"
    @echo "  prod-traefik-only     - Start only Traefik"
    @echo ""
    @echo "🛠️  Application:"
    @echo "  app-install   - Install application dependencies"
    @echo "  app-dev       - Start app in development mode (without Docker)"
    @echo "  app-build     - Build application"
    @echo "  app-test      - Run application tests"
    @echo "  app-test-e2e  - Run end-to-end tests"
    @echo ""
    @echo "🧹 Utilities:"
    @echo "  build         - Build production Docker images"
    @echo "  clean         - Clean up Docker resources"
    @echo "  ssl-certs     - Generate development SSL certificates"