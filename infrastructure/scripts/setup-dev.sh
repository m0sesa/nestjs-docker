#!/bin/bash

echo "🚀 Setting up development environment..."

# Check if mkcert is installed
if ! command -v mkcert &> /dev/null; then
    echo "❌ mkcert is not installed. Please install it first:"
    echo "   macOS: brew install mkcert"
    echo "   Ubuntu: apt install mkcert"
    exit 1
fi

# Create certificates directory if it doesn't exist
mkdir -p traefik/certs

# Generate certificates only if they don't exist
if [ ! -f "traefik/certs/interestingapp.local+1.pem" ]; then
    echo "📋 Creating mkcert certificates..."
    mkcert -install
    cd traefik/certs
    mkcert "*.interestingapp.local" interestingapp.local
    cd ../..
else
    echo "✅ SSL certificates already exist"
fi

# Check hosts file entries
echo "🌐 Checking /etc/hosts entries..."
HOSTS_ENTRIES="127.0.0.1 api.interestingapp.local
127.0.0.1 mail.interestingapp.local
127.0.0.1 pgadmin.interestingapp.local  
127.0.0.1 traefik.interestingapp.local"

if ! grep -q "api.interestingapp.local" /etc/hosts; then
    echo "⚠️  Please add these entries to your /etc/hosts file:"
    echo "$HOSTS_ENTRIES"
    echo ""
    read -p "Press Enter once you've added the hosts entries..."
fi

echo "🐳 Starting development environment..."
docker-compose -f docker/docker-compose.dev.yml up -d

echo "✅ Development environment is ready!"
echo "🔗 Available services:"
echo "   API: https://api.interestingapp.local"  
echo "   Mail: https://mail.interestingapp.local"
echo "   DB Admin: https://pgadmin.interestingapp.local"
echo "   Traefik: https://traefik.interestingapp.local (admin/admin)"