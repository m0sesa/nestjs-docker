#!/bin/bash

echo "🚀 Setting up production environment..."

# Create external Traefik network if it doesn't exist
if ! docker network ls | grep -q "traefik"; then
    echo "🌐 Creating external Traefik network..."
    docker network create traefik
else
    echo "✅ Traefik network already exists"
fi

# Check required environment variables
REQUIRED_VARS=("DOMAIN" "ACME_EMAIL" "TRAEFIK_AUTH" "DB_PASSWORD" "JWT_SECRET")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   $var"
    done
    echo ""
    echo "Please set these variables in your environment or .env file:"
    echo "   export DOMAIN=your-domain.com"
    echo "   export ACME_EMAIL=your-email@domain.com"  
    echo "   export TRAEFIK_AUTH=\$(htpasswd -nb admin your-password)"
    echo "   export DB_PASSWORD=your-secure-password"
    echo "   export JWT_SECRET=your-secure-jwt-secret"
    exit 1
fi

echo "✅ All required environment variables are set"

# Check if Traefik is already running
if docker ps | grep -q "traefik"; then
    echo "✅ Traefik is already running"
else
    echo "🐳 Starting Traefik..."
    docker compose -f docker/docker-compose.traefik.yml up -d
fi

echo "🐳 Starting application..."
docker compose -f docker/docker-compose.prod.yml up -d

echo "✅ Production environment is ready!"
echo "🔗 Available services:"
echo "   🎨 Admin Panel: https://admin.${DOMAIN}"
echo "   📱 API: https://api.${DOMAIN}"
echo "   🔀 Traefik Dashboard: https://traefik.${DOMAIN}"