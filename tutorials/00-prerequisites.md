# Prerequisites

Before starting this tutorial, ensure you have the required tools installed and understand basic concepts.

## 🛠️ Required Tools

### **Node.js & npm**
```bash
# Install Node.js 18+ (includes npm)
# macOS
brew install node

# Ubuntu  
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be 18+
npm --version
```

### **NestJS CLI**
```bash
# Install globally
npm install -g @nestjs/cli

# Verify
nest --version
```

### **Docker & Docker Compose**
```bash
# macOS - Install Docker Desktop
# Includes Docker Compose

# Ubuntu
sudo apt update
sudo apt install docker.io docker-compose
sudo usermod -aG docker $USER  # Add user to docker group
```

### **Just Command Runner**
```bash
# macOS
brew install just

# Ubuntu
curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to /usr/local/bin

# Verify
just --version
```

### **mkcert (SSL Certificates)**
```bash
# macOS
brew install mkcert

# Ubuntu
sudo apt install libnss3-tools
curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-v*-linux-amd64
sudo cp mkcert-v*-linux-amd64 /usr/local/bin/mkcert

# Verify
mkcert -version
```

## 🧠 Prerequisites Knowledge

### **Basic Understanding Required:**
- **JavaScript/TypeScript** - Decorators, async/await, modules
- **REST APIs** - HTTP methods, status codes, JSON
- **Docker basics** - Images, containers, volumes
- **Git** - Basic commands, commits, branching

### **Nice to Have:**
- **NestJS concepts** - Modules, services, controllers
- **Database concepts** - Relations, migrations
- **Reverse proxy basics** - Load balancing, SSL termination

## 📁 Project Structure Overview

We'll build this structure:

```
/
├── app/                    # NestJS Application  
│   ├── src/
│   ├── package.json
│   └── Dockerfile
└── infrastructure/         # DevOps & Infrastructure
    ├── .env.development
    ├── justfile
    ├── docker/
    ├── traefik/
    └── scripts/
```

## ✅ Verification

Run these commands to verify your setup:

```bash
# Tools check
node --version        # >= 18
npm --version         # >= 8
nest --version        # >= 10
docker --version      # >= 20
docker-compose --version  # >= 2
just --version        # >= 1
mkcert -version       # >= 1.4

# Docker check  
docker run hello-world

# SSL setup
mkcert -install
```

If all commands work, you're ready to proceed to [Phase 1: NestJS Setup](./01-nestjs-setup.md)!

## 🎯 What's Next

In the next tutorial, we'll:
1. Initialize a new NestJS project
2. Set up the basic project structure  
3. Configure TypeScript and development tools
4. Create our first commit

→ **Continue to:** [01-nestjs-setup.md](./01-nestjs-setup.md)